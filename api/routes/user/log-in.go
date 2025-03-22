package user

import (
	"encoding/json"
	"net/http"

	"github.com/MaiTra10/CarLens/api/internal"
	"github.com/MaiTra10/CarLens/api/routes/user/generic"
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

	supabase := internal.GetSupabaseClient()

	userEmail := LoginParams.Email

	var userResult map[string]interface{}
	err = supabase.DB.From("users").Select("user_uuid").Single().Filter("email", "eq", userEmail).Execute(&userResult)
	if err != nil {
		http.Error(w, "Error: Invalid email or password", http.StatusUnauthorized)
		return
	}

	userUUID, _ := userResult["user_uuid"].(string)

	var hashResult map[string]interface{}
	err = supabase.DB.From("passwords").Select("hash").Single().Filter("user_uuid", "eq", userUUID).Execute(&hashResult)
	if err != nil {
		http.Error(w, "ERROR: Unable to retrieve hash from 'passwords'", http.StatusUnauthorized)
		return
	}

	var saltResult map[string]interface{}
	err = supabase.DB.From("passwords").Select("salt").Single().Filter("user_uuid", "eq", userUUID).Execute(&saltResult)
	if err != nil {
		http.Error(w, "ERROR: Unable to retrieve salt from 'passwords'", http.StatusUnauthorized)
		return
	}

	hash := hashResult["hash"].(string)
	salt := saltResult["salt"].(string)

	passwordMatches := generic.ComparePassword(LoginParams.Password, hash, salt)

	if !passwordMatches {
		http.Error(w, "Error: Invalid email or password", http.StatusUnauthorized)
		return
	}

	token, jwtExpiration, err := generic.CreateJWT(userEmail, userUUID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
	w.Header().Set("Access-Control-Allow-Credentials", "true")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	http.SetCookie(w, &http.Cookie{
		Name:     "access_token",
		Value:    token,
		HttpOnly: true,
		Secure:   true,
		Expires:  jwtExpiration,
		SameSite: http.SameSiteStrictMode,
	})

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("SUCCESS: User is authenticated\n"))

}
