package user

import (
	"encoding/json"
	"net/http"

	"github.com/MaiTra10/CarLens/api/internal"
	"github.com/MaiTra10/CarLens/api/routes/user/generic"
	"github.com/google/uuid"
)

type RegisterParameters struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type User struct {
	UserUUID string `json:"user_uuid"`
	Email    string `json:"email"`
}

func RegisterHandler(w http.ResponseWriter, r *http.Request) {

	if r.Method != http.MethodPost {
		http.Error(w, "HTTP Method Must Be POST", http.StatusMethodNotAllowed)
		return
	}

	var registrationParams RegisterParameters

	err := json.NewDecoder(r.Body).Decode(&registrationParams)
	if err != nil {
		http.Error(w, "ERROR: Body is invalid", http.StatusBadRequest)
		return
	}

	if !generic.IsValidEmail(registrationParams.Email) {
		http.Error(w, "ERROR: Invalid Email used with registration", http.StatusBadRequest)
		return
	}

	if !generic.IsValidPassword(registrationParams.Password) {
		http.Error(w, "ERROR: Invalid Password used with registration", http.StatusBadRequest)
		return
	}

	uuidv7, err := uuid.NewV7()
	if err != nil {
		http.Error(w, "ERROR: Something went wrong while creating UUID", http.StatusInternalServerError)
		return
	}

	userEntry := User{
		UserUUID: uuidv7.String(),
		Email:    registrationParams.Email,
	}

	supabase := internal.GetSupabaseClient()

	var userResult []User
	err = supabase.DB.From("users").Insert(userEntry).Execute(&userResult)
	if err != nil {
		http.Error(w, "ERROR: Insert into 'users' table failed", http.StatusInternalServerError)
		return
	}

	passwordEntry, err := generic.ProcessPassword(registrationParams.Password, userEntry.UserUUID)
	if err != nil {
		http.Error(w, "ERROR: Something went wrong while processing password salt or hash", http.StatusInternalServerError)
		return
	}

	var passwordResult []generic.PasswordHashData
	err = supabase.DB.From("passwords").Insert(passwordEntry).Execute(&passwordResult)
	if err != nil {

		var results map[string]interface{}
		err := supabase.DB.From("users").Delete().Eq("user_uuid", userEntry.UserUUID).Execute(&results)
		if err != nil {
			http.Error(w, "ERROR: Something went wrong while deleting invalid user entry", http.StatusInternalServerError)
			return
		}

		http.Error(w, "ERROR: Insert into 'passwords' table failed", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("SUCCESS: User has been registered\n"))

}
