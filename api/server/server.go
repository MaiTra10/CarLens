package server

import (
	"fmt"
	"net/http"

	ai "github.com/MaiTra10/CarLens/api/routes/AI"
	"github.com/MaiTra10/CarLens/api/routes/database"
	"github.com/MaiTra10/CarLens/api/routes/user"
	"github.com/rs/cors"
)

func StartServer() {

	http.HandleFunc("/login", user.LoginHandler)
	http.HandleFunc("/register", user.RegisterHandler)

	http.HandleFunc("/ai", ai.AIHandler)
	http.HandleFunc("/listings", database.DBHandler)

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://carlens.netlify.app"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
	})

	handler := c.Handler(http.DefaultServeMux)

	fmt.Println("Server is running on Port 8080")
	err := http.ListenAndServe(":8080", handler)
	if err != nil {
		fmt.Println("Error starting server:", err)
	}

}
