package ai

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
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

	//structure text for AI API
	openaiReq := OpenAIRequest{
		Model: "bot-20250312075157-h5q4q", //Special Model name for project
		Messages: []Message{
			{
				Role:    "user",
				Content: clientReq.Message,
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
	req, _ := http.NewRequest("POST", "https://ark.cn-beijing.volces.com/api/v3/bots/chat/completions", bytes.NewBuffer(reqBody))

	//set api key and header for Request
	apiKey := "6edb7c5b-e6be-42c2-bb8d-324b2e7c47f4" //This should be hidden or store as envirment varable, but it's just a small project.
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
	json.NewEncoder(w).Encode(response)
}
