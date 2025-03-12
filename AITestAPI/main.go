package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
)

// Sample HTML
const indexHTML = `
<!DOCTYPE html>
<html>
<head>
	<title>AI Generator Sample For ENSF 401 Project</title>
	<style>
		.container { max-width: 800px; margin: 20px auto; padding: 20px; }
		textarea { width: 100%; height: 100px; padding: 10px; margin: 10px 0; }
		button { padding: 10px 20px; background: #2196F3; color: white; border: none; cursor: pointer; }
		#result { white-space: pre-wrap; margin-top: 20px; padding: 15px; border: 1px solid #ddd; }
	</style>
</head>
<body>
	<div class="container">
		<h1>AI Generator Sample For ENSF 401 Project</h1>
		<textarea id="input" placeholder="Input your text"></textarea>
		<button onclick="generateContent()">Start generate</button>
		<div id="result"></div>
	</div>
	<script>
		async function generateContent() {
			const input = document.getElementById('input').value;
			const resultDiv = document.getElementById('result');
			resultDiv.textContent = "Loading..";

			try {
				const response = await fetch('/api/generate', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ prompt: input })
				});

				const data = await response.json();
				while (!data){
					resultDiv.textContent = "Loading....."
				}
				if (data.error) {
					resultDiv.textContent = "error: " + data.error;
				} else {
					resultDiv.textContent = data.content;
				}
			} catch (error) {
				resultDiv.textContent = "Request Failure " + error.message;
			}
		}
	</script>
</body>
</html>
`

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

// Main
func main() {
	http.HandleFunc("/", homeHandler)
	http.HandleFunc("/api/generate", generateHandler)
	fmt.Println("Hosting on http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

func homeHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprint(w, indexHTML)
}

func generateHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	// deal with Request struct
	var request struct {
		Prompt string `json:"prompt"`
	}
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		sendError(w, "invalid Request struct issue", http.StatusBadRequest)
		return
	}

	// use API key with OpenAI tool
	apiKey := "6edb7c5b-e6be-42c2-bb8d-324b2e7c47f4"
	if apiKey == "" {
		sendError(w, "API key not set", http.StatusInternalServerError)
		return
	}

	response, err := callOpenAI(apiKey, request.Prompt)
	if err != nil {
		sendError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Result
	json.NewEncoder(w).Encode(map[string]interface{}{
		"content": response,
	})
}

func callOpenAI(apiKey, prompt string) (string, error) {
	client := &http.Client{}
	requestBody := OpenAIRequest{
		Model: "bot-20250312075157-h5q4q", //Special Model name for project
		Messages: []Message{
			{Role: "user", Content: prompt},
		},
	}

	jsonData, _ := json.Marshal(requestBody)
	req, _ := http.NewRequest("POST", "https://ark.cn-beijing.volces.com/api/v3/bots/chat/completions", bytes.NewBuffer(jsonData))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+apiKey)

	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("API Request Fail: %v", err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	var openAIResp OpenAIResponse
	if err := json.Unmarshal(body, &openAIResp); err != nil {
		return "", fmt.Errorf("OpenAI Response Fail: %v", err)
	}

	if len(openAIResp.Choices) > 0 {
		return openAIResp.Choices[0].Message.Content, nil
	}

	if openAIResp.Error.Message != "" {
		return "", fmt.Errorf("OpenAI Error: %s", openAIResp.Error.Message)
	}

	return "", fmt.Errorf("Unknown Error")
}

func sendError(w http.ResponseWriter, message string, statusCode int) {
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"error": message,
	})
}
