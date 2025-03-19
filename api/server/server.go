package server

import (
	"fmt"
	"net/http"

	ai "github.com/MaiTra10/CarLens/api/routes/AI"
	"github.com/MaiTra10/CarLens/api/routes/user"
	"github.com/rs/cors" // Import CORS package
)

func StartServer() {

	// Define our routes
	http.HandleFunc("/login", user.LoginHandler)
	http.HandleFunc("/logout", user.LogoutHandler)
	http.HandleFunc("/register", user.RegisterHandler)

	http.HandleFunc("/ai", ai.AIHandler)

	// Enable CORS
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"}, // Allow frontend (your React app)
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
	})

	// Wrap your router with the CORS handler
	handler := c.Handler(http.DefaultServeMux)

	// Start the server with CORS-enabled handler
	fmt.Println("Server is running on Port 8080")
	err := http.ListenAndServe(":8080", handler)
	if err != nil {
		fmt.Println("Error starting server:", err)
	}

}
