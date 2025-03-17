package user

import (
	"encoding/json"
	"net/http"
)

type LoginParameters struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func LoginHandler(w http.ResponseWriter, r *http.Request) {

	if r.Method != http.MethodPost {
		http.Error(w, "HTTP Method Must Be POST", http.StatusMethodNotAllowed)
		return
	}

	var LoginParams LoginParameters

	err := json.NewDecoder(r.Body).Decode(&LoginParams)
	if err != nil {
		http.Error(w, "ERROR: Body is invalid", http.StatusBadRequest)
		return
	}

}
