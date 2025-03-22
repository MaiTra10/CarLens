package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"regexp"
	"strings"
)

// used for detect URL syntax
var urlRegex = regexp.MustCompile(`https?://[^\s]+`)

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

	// Handle URL and create new prompt
	processedPrompt, err := processURLs(request.Prompt)
	if err != nil {
		sendError(w, fmt.Sprintf("URL convert failed: %v", err), http.StatusInternalServerError)
		return
	}

	// use API key with OpenAI tool
	apiKey := "sk-c0864ddde7454abea3264922ab943db5"
	if apiKey == "" {
		sendError(w, "API key not set", http.StatusInternalServerError)
		return
	}

	// response, err := callOpenAI(apiKey, request.Prompt)
	response, err := callOpenAI(apiKey, processedPrompt)
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
		Model: "deepseek-chat", //Special Model name for project
		Messages: []Message{
			{Role: "user", Content: prompt},
		},
	}

	jsonData, _ := json.Marshal(requestBody)
	// req, _ := http.NewRequest("POST", "https://ark.cn-beijing.volces.com/api/v3/bots/chat/completions", bytes.NewBuffer(jsonData))
	req, _ := http.NewRequest("POST", "https://api.deepseek.com/chat/completions", bytes.NewBuffer(jsonData))
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
