package user

import (
	"encoding/json"
	"fmt"
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

	var userResult map[string]interface{}
	err = supabase.DB.From("users").Select("user_uuid").Single().Filter("email", "eq", LoginParams.Email).Execute(&userResult)
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	uuid, _ := userResult["user_uuid"].(string)

	fmt.Println(LoginParams.Email)
	fmt.Println(uuid)

	var hashResult map[string]interface{}
	err = supabase.DB.From("passwords").Select("hash").Single().Filter("user_uuid", "eq", uuid).Execute(&hashResult)
	if err != nil {
		http.Error(w, "ERROR: Unable to retrieve hash from 'passwords'", http.StatusUnauthorized)
		return
	}

	var saltResult map[string]interface{}
	err = supabase.DB.From("passwords").Select("salt").Single().Filter("user_uuid", "eq", uuid).Execute(&saltResult)
	if err != nil {
		http.Error(w, "ERROR: Unable to retrieve salt from 'passwords'", http.StatusUnauthorized)
		return
	}

	hash := hashResult["hash"].(string)
	salt := saltResult["salt"].(string)

	passwordMatches := generic.ComparePassword(LoginParams.Password, hash, salt)

	fmt.Println(passwordMatches)

}
