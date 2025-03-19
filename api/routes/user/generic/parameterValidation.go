package generic

import "regexp"

func IsValidEmail(email string) bool {
	regex := `^[A-Za-z0-9\._%+\-]+@[A-Za-z0-9\.\-]+\.[A-Za-z]{2,}$`
	re := regexp.MustCompile(regex)
	return re.MatchString(email)
}

func IsValidPassword(password string) bool {

	isValid := true

	uppercase := regexp.MustCompile(`[A-Z]`)
	number := regexp.MustCompile(`[0-9]`)
	specialChar := regexp.MustCompile(`[!@#$%^&*(),.?":{}|<>]`)

	// Check password conditions
	if len(password) < 8 || !uppercase.MatchString(password) || !number.MatchString(password) || !specialChar.MatchString(password) {
		isValid = false
	}

	return isValid
}
