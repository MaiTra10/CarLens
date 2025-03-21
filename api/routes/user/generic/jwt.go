package generic

import (
	"fmt"
	"os"
	tm "time"

	"github.com/golang-jwt/jwt/v5"
)

var secretKey = os.Getenv("JWT_TOKEN_SECRET")

func CreateJWT(userEmail string, userUUID string) (string, tm.Time, error) {

	timeNow := tm.Now().UTC()
	jwtExpiration := timeNow.Add(tm.Hour * 24 * 7)

	jwtMapping := jwt.MapClaims{
		"sub":       userEmail,
		"user_uuid": userUUID,
		"exp":       jwtExpiration.Unix(),
		"iat":       timeNow.Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwtMapping)

	signedToken, err := token.SignedString([]byte(secretKey))
	if err != nil {
		return "", tm.Time{}, err
	}

	return signedToken, jwtExpiration, nil

}

type JWTParameters struct {
	Sub      string `json:"sub"`
	UserUUID string `json:"user_uuid"`
	Iat      string `json:"iat"`
	Exp      string `json:"exp"`
}

func DecodeJWT(tokenString string) (JWTParameters, error) {

	claims := jwt.MapClaims{}

	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("ERROR: Unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(secretKey), nil
	})
	if err != nil {
		return JWTParameters{}, err
	}

	if token.Valid {
		jwtParams := JWTParameters{
			Sub: fmt.Sprintf("%v", claims["sub"]),
			Iat: fmt.Sprintf("%v", claims["iat"]),
			Exp: fmt.Sprintf("%v", claims["exp"]),
		}
		return jwtParams, nil
	}

	return JWTParameters{}, fmt.Errorf("ERROR: Token is invalid")

}
