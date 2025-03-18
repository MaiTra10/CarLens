package generic

import (
	"os"
	tm "time"

	"github.com/golang-jwt/jwt/v5"
)

func CreateJWT(user_email string) (string, tm.Time, error) {

	timeNow := tm.Now().UTC()
	jwtExpiration := timeNow.Add(tm.Hour * 24 * 7)

	jwtMapping := jwt.MapClaims{
		"sub": user_email,
		"exp": jwtExpiration.Unix(),
		"iat": timeNow.Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwtMapping)

	secretKey := os.Getenv("JWT_TOKEN_SECRET")
	signedToken, err := token.SignedString([]byte(secretKey))
	if err != nil {
		return "", tm.Time{}, err
	}

	return signedToken, jwtExpiration, nil

}
