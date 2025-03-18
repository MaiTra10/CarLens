package generic

import (
	"encoding/json"
	"fmt"
	"os"
	tm "time"

	"github.com/golang-jwt/jwt/v5"
)

var secretKey = os.Getenv("JWT_TOKEN_SECRET")

func CreateJWT(user_email string) (string, tm.Time, error) {

	timeNow := tm.Now().UTC()
	jwtExpiration := timeNow.Add(tm.Hour * 24 * 7)

	jwtMapping := jwt.MapClaims{
		"sub": user_email,
		"exp": jwtExpiration.Unix(),
		"iat": timeNow.Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwtMapping)

	signedToken, err := token.SignedString([]byte(secretKey))
	if err != nil {
		return "", tm.Time{}, err
	}

	return signedToken, jwtExpiration, nil

}

func DecodeJWT(tokenString string) (string, error) {

	claims := jwt.MapClaims{}

	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("ERROR: Unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(secretKey), nil
	})
	if err != nil {
		return "", err
	}

	if token.Valid {
		jsonData, err := json.MarshalIndent(claims, "", "  ")
		if err != nil {
			return "", err
		}
		return string(jsonData), nil
	}

	return "", fmt.Errorf("ERROR: Token is invalid")

}
