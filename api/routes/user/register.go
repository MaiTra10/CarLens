package user

import (
	"encoding/json"
	"net/http"
	"regexp"

	"github.com/MaiTra10/CarLens/api/internal"
	"github.com/google/uuid"
)

type RegisterParameters struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type ResponseParamaters struct {
	StatusCode int    `json:"statusCode"`
	Body       string `json:"body"`
	Headers    string `json:"headers"`
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

	uuidv7, err := uuid.NewV7()
	if err != nil {
		http.Error(w, "ERROR: Something went wrong while creating UUID", http.StatusInternalServerError)
	}

	userEntry := User{
		UserUUID: uuidv7.String(),
		Email:    registrationParams.Email,
	}

	if !isValidEmail(userEntry.Email) {
		http.Error(w, "ERROR: Invalid Email used with registration", http.StatusBadRequest)
	}

	supabase := internal.GetSupabaseClient()

	var userResult []User
	err = supabase.DB.From("users").Insert(userEntry).Execute(&userResult)
	if err != nil {
		http.Error(w, "ERROR: Insert into users table failed", http.StatusInternalServerError)
	}

}

func isValidEmail(email string) bool {
	regex := `^[A-Za-z0-9\._%+\-]+@[A-Za-z0-9\.\-]+\.[A-Za-z]{2,}$`
	re := regexp.MustCompile(regex)
	return re.MatchString(email)
}
