package ai

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/MaiTra10/CarLens/api/internal"
	"github.com/MaiTra10/CarLens/api/routes/user/generic"
)

// Structs
type OpenAIRequest struct {
	Model    string    `json:"model"`
	Messages []Message `json:"messages"`
}

type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type OpenAIResponse struct {
	Choices []struct {
		Message struct {
			Content string `json:"content"`
		} `json:"message"`
	} `json:"choices"`
	Error struct {
		Message string `json:"message"`
	} `json:"error"`
}

type ClientRequest struct {
	Message string `json:"message"`
}

// used for detect URL syntax
var urlRegex = regexp.MustCompile(`https?://[^\s]+`)

// Handle URL
func processURLs(prompt string) (string, error) {
	// Take URL and non-URL content
	urls := urlRegex.FindAllString(prompt, -1)
	nonURLContent := strings.TrimSpace(urlRegex.ReplaceAllString(prompt, ""))

	// handle All URL (if multi-URL)
	var urlContents []string
	for _, rawURL := range urls {
		content, err := fetchURLContent(rawURL)
		if err != nil {
			return "", fmt.Errorf("handle URL Failed %s: %v", rawURL, err)
		}
		urlContents = append(urlContents, content)
	}

	// Build fianl Prompt
	var builder strings.Builder
	if nonURLContent != "" {
		builder.WriteString(nonURLContent)
	}
	for _, content := range urlContents {
		if builder.Len() > 0 {
			builder.WriteString("\n\n")
		}
		builder.WriteString(content)
	}

	return builder.String(), nil
}

// using Jina AI API
func fetchURLContent(rawURL string) (string, error) {
	// encod URL
	encodedURL := url.QueryEscape(rawURL)
	targetURL := "https://r.jina.ai/" + encodedURL

	req, err := http.NewRequest("GET", targetURL, nil)
	if err != nil {
		return "", fmt.Errorf("request creation faild for jinaAI: %v", err)
	}

	req.Header.Set("Authorization", "Bearer jina_1b29c5ff413144aa8056aa02dc0f7f74W1tAnacsgJXZGcYsOa19xD7UI8C4") //This is api key

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("API Request Failed For jinaAI: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("API Return Error Code For jinaAI: %s", resp.Status)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("read reply failed for jinaAI: %v", err)
	}

	return string(body), nil
}

// Main, AIHandler function
func AIHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Debug: AI Request Start.")

	// Check if the request contains a JWT Cookie
	var UserID string
	var LoggedIn bool
	access_token, err := r.Cookie("access_token")
	if err != nil {
		if err == http.ErrNoCookie {
			fmt.Println(w, "Cookie not found")
		}
		fmt.Println(w, "Error retrieving access_token:", err)
	} else {
		// try to decode JWT Cookie
		JWTParameters, err := generic.DecodeJWT(access_token.Value)
		if err != nil {
			fmt.Println("User is not logged in")
		}

		// Check expiration of JWT
		exp, err := strconv.ParseFloat(JWTParameters.Exp, 64) // JWT uses Unix time (float64)
		if err != nil {
			fmt.Println("Error converting to float64:", err)
			return
		}

		expirationTime := time.Unix(int64(exp), 0)
		if time.Now().After(expirationTime) {
			fmt.Println("Token has expired")
			http.Error(w, `{"error": "User Session has expired"}`, http.StatusNotAcceptable)
			return
		} else {
			fmt.Printf("Token is valid until %s\n", expirationTime)
		}

		UserID, err = generic.GetUserFromEmail(JWTParameters.Sub)
		LoggedIn = true
	}

	//set replay header
	w.Header().Set("Content-Type", "application/json")

	// only accpect "Post" Request.
	if r.Method != http.MethodPost {
		http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	//convert Request sytanx
	var clientReq ClientRequest
	if err := json.NewDecoder(r.Body).Decode(&clientReq); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	// Handle URL and create new prompt
	processedPrompt, err := processURLs(clientReq.Message)
	if err != nil {
		http.Error(w, fmt.Sprintf("URL convert failed: %v", err), http.StatusInternalServerError)
		return
	}

	//System Prompt That Can Change.
	const SystemPrompt = `You are a car information assistant named CarLens. 
							Your capabilities:
							1. Analyze used car listings using provided URLs or manually entered data.
							2. Extract relevant car details and respond in JSON format:
							{
							"source": "<value>",
							"title": "<value>",
							"price": "<value>",
							"dealer": "<value>",
							"dealer_rating": "<value>",
							"odometer": "<value>",
							"transmission": "<value>",
							"drivetrain": "<value>",
							"descr": "<value>",
							"specifications": "<value>",
							"creation_date": "<value>",
							"free_carfax": "<value>",
							"vin": "<value>",
							"condition": "<value>",
							"insurance_status": "<value>"
							"recall_information": "<value>",
							"listing_summary": "<value>"
							}
							- Make sure to return the exact keys as shown above in the response. Suppose all entries are string type.
							- Always paraphraze information.
							- the price field should always be your own estimate based on the car model. DO NOT USE THE LISTING PRICE mentioned anywhere on the page
							- If you cannot find the information for some of these values, attempt to find data from the description. 
							- If data is not found on the page, reason possible data using info known about the car model and parts/modifcations mentioned in listing. 
							- Only leave fields as "unknown" if they absolutely cannot be obtained.
							- Keep the listing_summary short and to the point with a rating of the listing, NOT the car, out of 5 stars to one decimal point.
							- drivetrain is whether the car is FWD, RWD, AWD, 4WD.
							- Always use the highest odometer number listed in posting, assume units are km unless specified. Always Priortize milage data in description
							- If the odometer is one of the following placeholders: (123 km ,123123 km, 1 km, 0 km), try to find the real milage. Otherwise leave as null
							- dealer should be either "dealer" if the seller is a company, else mark it as "private sale" if the seller is a person.
							`

	//structure text for AI API
	openaiReq := OpenAIRequest{
		Model: "deepseek-chat", //Special Model name for project
		Messages: []Message{
			{
				Role:    "system",
				Content: SystemPrompt, // System Prompt
			},
			{
				Role:    "user",
				Content: processedPrompt,
			},
		},
	}

	//Marshal text, (convert/serialize json to struct that AI website accpects.)
	reqBody, err := json.Marshal(openaiReq)
	if err != nil {
		http.Error(w, `{"error": "Error creating request"}`, http.StatusInternalServerError)
		return
	}

	//Create Client and https Request
	client := &http.Client{}
	req, _ := http.NewRequest("POST", "https://api.deepseek.com/chat/completions", bytes.NewBuffer(reqBody))

	//set api key and header for Request
	apiKey := "sk-c0864ddde7454abea3264922ab943db5" //This should be hidden or store as envirment varable, but it's just a small project.
	//I guess no one will use this for bad things... Right?
	if apiKey == "" {
		http.Error(w, `{"error": "API key not configured"}`, http.StatusInternalServerError)
		return
	}
	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Content-Type", "application/json")

	//Send request
	resp, err := client.Do(req)
	if err != nil {
		http.Error(w, `{"error": "Failed to contact AI service"}`, http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()
	fmt.Println("Debug: Send Request to AI Successfully.")

	//Read response
	body, _ := io.ReadAll(resp.Body)

	ParseAIResponseToListing(string(body))

	fmt.Println("Debug: Get Reply From AI Successfully.")

	//Handling not 200 responses
	if resp.StatusCode != http.StatusOK {
		var errorResp struct {
			Error struct {
				Message string `json:"message"`
			} `json:"error"`
		}
		if err := json.Unmarshal(body, &errorResp); err != nil {
			http.Error(w, `{"error": "Unknown API error, probably because the free access token has run out :("}`, resp.StatusCode)
			return
		}
		http.Error(w, fmt.Sprintf(`{"error": "%s"}`, errorResp.Error.Message), resp.StatusCode)
		return
	}

	//handle response that succeed.
	var openaiResp OpenAIResponse
	if err := json.Unmarshal(body, &openaiResp); err != nil {
		http.Error(w, `{"error": "Failed to parse AI response"}`, http.StatusInternalServerError)
		return
	}

	//If Response from AI is failed.
	if len(openaiResp.Choices) == 0 {
		http.Error(w, `{"error": "No response from AI"}`, http.StatusInternalServerError)
		return
	}

	//Handle and return.
	response := map[string]string{
		"response": openaiResp.Choices[0].Message.Content,
	}

	// fmt.Println(response)
	// fmt.Printf("Type of myMap: %T\n", response)
	// fmt.Println(response["response"])
	// fmt.Printf("Type of myMap: %T\n", response["response"])
	// Parse AI response into a Listing struct
	// Remove the triple single quotes
	cleanedJSONString := strings.Trim(response["response"], "'")
	cleanedJSONString = strings.Trim(cleanedJSONString, "`")
	cleanedJSONString = strings.Trim(cleanedJSONString, "json")
	cleanedJSONString = strings.Trim(cleanedJSONString, "\n")
	fmt.Println(cleanedJSONString)
	listing, err := ParseAIResponseToListing(cleanedJSONString)
	if err != nil {
		fmt.Println("Error:", err)
		return
	}
	// fmt.Println("\n__________________________________________\n")
	// fmt.Printf("Type of listing: %T\n", listing)
	// fmt.Printf("%+v\n", listing)
	if LoggedIn {
		sendResponseToDatabase(listing, UserID)
	}

	json.NewEncoder(w).Encode(listing)
}

// Listing Struct
type Listing struct {
	UploadUserUUID    string `json:"upload_user_uuid"`
	Source            string `json:"source"`
	Title             string `json:"title"`
	Price             string `json:"price"`
	Dealer            string `json:"dealer"`
	DealerRating      string `json:"dealer_rating"`
	Odometer          string `json:"odometer"`
	Transmission      string `json:"transmission"`
	Drivetrain        string `json:"drivetrain"`
	Descr             string `json:"descr"`
	Specifications    string `json:"specifications"`
	CreationDate      string `json:"creation_date"`
	FreeCarfax        string `json:"free_carfax"`
	VIN               string `json:"vin"`
	Condition         string `json:"condition"`
	InsuranceStatus   string `json:"insurance_status"`
	RecallInformation string `json:"recall_information"`
	ListingSummary    string `json:"listing_summary"`
}

// ParseAIResponseToListing parses AI response into a Listing struct
func ParseAIResponseToListing(aiResponse string) (*Listing, error) {
	listing := &Listing{}

	// First, try to unmarshal the JSON response into the Listing struct
	err := json.Unmarshal([]byte(aiResponse), listing)
	if err != nil {
		return nil, fmt.Errorf("error unmarshalling JSON: %w", err)
	}

	// Handle any string cleanup for fields like price
	listing.Price = cleanPrice(listing.Price)

	// If the response includes non-JSON structured data, handle that as well
	lines := strings.Split(aiResponse, "\n")
	for _, line := range lines {
		parts := strings.SplitN(line, ":", 2)
		if len(parts) != 2 {
			continue
		}

		key := strings.TrimSpace(parts[0])
		value := strings.TrimSpace(parts[1])

		// Populate the Listing struct based on the keys
		switch strings.ToLower(key) {
		case "source":
			listing.Source = value
		case "title":
			listing.Title = value
		case "price":
			listing.Price = cleanPrice(value) // Handle price clean-up
		case "dealer":
			listing.Dealer = value
		case "dealer_rating":
			listing.DealerRating = value
		case "odometer":
			listing.Odometer = value
		case "transmission":
			listing.Transmission = value
		case "drivetrain":
			listing.Drivetrain = value
		case "descr":
			listing.Descr = value
		case "specifications":
			listing.Specifications = value
		case "creation_date":
			listing.CreationDate = value
		case "free_carfax":
			listing.FreeCarfax = value
		case "vin":
			listing.VIN = value
		case "condition":
			listing.Condition = value
		case "insurance_status":
			listing.InsuranceStatus = value
		case "recall_information":
			listing.RecallInformation = value
		case "listing_summary":
			listing.ListingSummary = value
		default:
			// fmt.Printf("Unknown key: %s\n", key)
		}
	}

	return listing, nil
}

// cleanPrice removes unwanted characters like $ and commas from the price string
func cleanPrice(price string) string {
	// Remove the dollar sign and commas
	price = strings.ReplaceAll(price, "$", "")
	price = strings.ReplaceAll(price, ",", "")
	return price
}

func sendResponseToDatabase(response *Listing, userID string) bool {
	fmt.Println("Sending Listing to database...")

	// Attribute the user to this listing
	response.UploadUserUUID = userID
	// Initialize the Supabase client
	supabase := internal.GetSupabaseClient()
	// Insert the response (which is a single Listing) into the database
	var listingResult []Listing
	err := supabase.DB.From("listings").Insert([]Listing{*response}).Execute(&listingResult)
	// Check if there was an error during insertion
	if err != nil {
		fmt.Println("Error inserting listing:", err)
		return false
	}
	// Return true if the insertion was successful
	return true
}
