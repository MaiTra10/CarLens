package user

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/MaiTra10/CarLens/api/internal"
)

type LoginParameters struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type userResult struct {
	UUID string `json:"uuid"`
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

	supabase := internal.GetSupabaseClient()

	var userResults map[string]interface{}
	// var userResults string
	err = supabase.DB.From("users").Select("user_uuid").Single().Filter("email", "eq", LoginParams.Email).Execute(&userResults)
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}
	fmt.Println(LoginParams.Email)
	fmt.Println(userResults)

	// var hash map[string]interface{}
	// err = supabase.DB.From("passwords").Select("hash").Single().Eq("user_uuid", userResult).Execute(&hash)
	// if err != nil {
	// 	http.Error(w, "toilet", http.StatusUnauthorized)
	// 	return
	// }

	// var salt map[string]interface{}
	// err = supabase.DB.From("passwords").Select("salt").Single().Eq("user_uuid", userResult).Execute(&salt)
	// if err != nil {
	// 	http.Error(w, "skibidi", http.StatusUnauthorized)
	// 	return
	// }

	// if !generic.ComparePassword(LoginParams.Password, hash, salt) {
	// 	http.Error(w, "Invalid password or something", http.StatusUnauthorized)
	// 	return
	// }

}
