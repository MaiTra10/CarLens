package server

import (
	"fmt"
	"net/http"

	ai "github.com/MaiTra10/CarLens/api/routes/AI"
	"github.com/MaiTra10/CarLens/api/routes/user"
	// "github.com/MaiTra10/CarLens/api/routes/AI"
)

func StartServer() {

	// Define our routes
	http.HandleFunc("/login", user.LoginHandler)
	// http.HandleFunc("/logout", user.LogoutHandler)
	http.HandleFunc("/register", user.RegisterHandler)

	http.HandleFunc("/ai", ai.AIHandler)

	fmt.Println("Server is running on Port 8080")
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		fmt.Println("Error starting server:", err)
	}

}
