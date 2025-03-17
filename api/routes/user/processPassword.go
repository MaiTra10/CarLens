package user

import (
	"crypto/rand"
	"encoding/base64"

	"golang.org/x/crypto/argon2"
)

type PasswordHashData struct {
	UserUUID     string `json:"user_uuid"`
	Salt         string `json:"salt"`
	PasswordHash string `json:"hash"`
}

func generateSalt(length int) ([]byte, error) {

	salt := make([]byte, length)

	_, err := rand.Read(salt)
	if err != nil {
		return nil, err
	}

	return salt, nil

}

func hashPassword(password string, salt []byte) (saltEncodedString string, passwordHashEncodedString string) {

	time := uint32(1)
	memory := uint32(64 * 1024)
	threads := uint8(4)
	keyLength := uint32(32)

	passwordHash := argon2.IDKey([]byte(password), salt, time, memory, threads, keyLength)

	saltEncoded := base64.RawStdEncoding.EncodeToString(salt)
	passwordHashEncoded := base64.RawStdEncoding.EncodeToString(passwordHash)

	return saltEncoded, passwordHashEncoded

}

func processPassword(password string, userUUID string) (PasswordHashData, error) {

	salt, err := generateSalt(16)
	if err != nil {
		return PasswordHashData{}, err
	}

	saltEncodedString, passwordHashEncodedString := hashPassword(password, salt)

	return PasswordHashData{
		UserUUID:     userUUID,
		Salt:         saltEncodedString,
		PasswordHash: passwordHashEncodedString,
	}, nil

}
