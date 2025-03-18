package ai

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"regexp"
	"strings"

	"github.com/MaiTra10/CarLens/api/internal"
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
							- Make sure to return the exact keys as shown above in the response.
							- Keep responses concise and to the point.
							- If you cannot find the information for some of these values, leave them null or empty.
							- Keep the listing_summary short and to the point with a rating of the listing, NOT the car, out of 5 stars to one decimal point.`

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

	// Send request
	resp, err := client.Do(req)
	if err != nil {
		http.Error(w, `{"error": "Failed to contact AI service"}`, http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()
	fmt.Println("Debug: Sent Request to AI Successfully.")

	// Read response
	body, _ := io.ReadAll(resp.Body)
	fmt.Println("Debug: Received Reply From AI Successfully.")

	// Handling non-200 responses
	if resp.StatusCode != http.StatusOK {
		var errorResp struct {
			Error struct {
				Message string `json:"message"`
			} `json:"error"`
		}
		if err := json.Unmarshal(body, &errorResp); err != nil {
			http.Error(w, `{"error": "Unknown API error, possibly due to an expired free access token."}`, resp.StatusCode)
			return
		}
		http.Error(w, fmt.Sprintf(`{"error": "%s"}`, errorResp.Error.Message), resp.StatusCode)
		return
	}

	// Handle successful response
	var openaiResp OpenAIResponse
	if err := json.Unmarshal(body, &openaiResp); err != nil {
		http.Error(w, `{"error": "Failed to parse AI response"}`, http.StatusInternalServerError)
		return
	}

	// Check if AI returned a valid response
	if len(openaiResp.Choices) == 0 {
		http.Error(w, `{"error": "No response from AI"}`, http.StatusInternalServerError)
		return
	}

	// Extract the AI response
	jsonString := openaiResp.Choices[0].Message.Content

	// Parse the AI response into a Listing
	var parsedResponse Listing
	parsedResponse, err = parseAIResponseToListing(jsonString)
	if err != nil {
		http.Error(w, `{"error": "Failed to parse AI response"}`, http.StatusInternalServerError)
		return
	}
	fmt.Println("__________________________________")
	fmt.Println(parsedResponse)

	// Send parsed response to the database
	sendResponseToDatabase(parsedResponse)

	// Return response to the user
	json.NewEncoder(w).Encode(map[string]string{
		"message":  "AI response processed successfully",
		"response": jsonString,
	})

}

// Listing Struct
type Listing struct {
	ListingID         string `json:"listing_id"`
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

// Parse the AI response into a Listing struct
func parseAIResponseToListing(aiResponse string) (Listing, error) {
	var listingDetails map[string]interface{}

	err := json.Unmarshal([]byte(aiResponse), &listingDetails)
	if err != nil {
		return Listing{}, fmt.Errorf("failed to parse AI response: %v", err)
	}

	listing := Listing{
		UploadUserUUID:    extractString(listingDetails["upload_user_uuid"]),
		Source:            extractString(listingDetails["source"]),
		Title:             extractString(listingDetails["title"]),
		Price:             extractString(listingDetails["price"]),
		Dealer:            extractString(listingDetails["dealer"]),
		DealerRating:      extractString(listingDetails["dealer_rating"]),
		Odometer:          extractString(listingDetails["odometer"]),
		Transmission:      extractString(listingDetails["transmission"]),
		Drivetrain:        extractString(listingDetails["drivetrain"]),
		Descr:             extractString(listingDetails["descr"]),
		Specifications:    extractString(listingDetails["specifications"]),
		FreeCarfax:        extractString(listingDetails["free_carfax"]),
		VIN:               extractString(listingDetails["vin"]),
		Condition:         extractString(listingDetails["condition"]),
		InsuranceStatus:   extractString(listingDetails["insurance_status"]),
		RecallInformation: extractString(listingDetails["recall_information"]),
		ListingSummary:    extractString(listingDetails["listing_summary"]),
	}

	return listing, nil
}

func extractString(value interface{}) string {
	if str, ok := value.(string); ok {
		return str
	}
	return ""
}

func sendResponseToDatabase(response Listing) bool {

	supabase := internal.GetSupabaseClient()
	var listingResult []Listing
	err := supabase.DB.From("users").Insert(response).Execute(&listingResult)
	return err != nil
}
