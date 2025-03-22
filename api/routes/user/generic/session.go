package generic

import (
	"github.com/MaiTra10/CarLens/api/internal"
)

func GetUserFromEmail(email string) (string, error) {

	supabase := internal.GetSupabaseClient()
	var userResult map[string]interface{}
	err := supabase.DB.From("users").Select("user_uuid").Single().Filter("email", "eq", email).Execute(&userResult)
	if err != nil {
		return "unknown", err
	}
	uuid, _ := userResult["user_uuid"].(string)
	return uuid, nil
}
