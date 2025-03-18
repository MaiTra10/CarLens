package generic

import (
	"bytes"
	"crypto/rand"
	"encoding/base64"

	"golang.org/x/crypto/argon2"
)

type PasswordHashData struct {
	UserUUID     string `json:"user_uuid"`
	Salt         string `json:"salt"`
	PasswordHash string `json:"hash"`
}

const (
	time      = uint32(1)
	memory    = uint32(64 * 1024)
	threads   = uint8(4)
	keyLength = uint32(32)
)

func generateSalt(length int) ([]byte, error) {

	salt := make([]byte, length)

	_, err := rand.Read(salt)
	if err != nil {
		return nil, err
	}

	return salt, nil

}

func HashPassword(password string, salt []byte) (saltEncodedString string, passwordHashEncodedString string) {

	passwordHash := argon2.IDKey([]byte(password), salt, time, memory, threads, keyLength)

	saltEncoded := base64.RawStdEncoding.EncodeToString(salt)
	passwordHashEncoded := base64.RawStdEncoding.EncodeToString(passwordHash)

	return saltEncoded, passwordHashEncoded

}

func ProcessPassword(password string, userUUID string) (PasswordHashData, error) {

	salt, err := generateSalt(16)
	if err != nil {
		return PasswordHashData{}, err
	}

	saltEncodedString, passwordHashEncodedString := HashPassword(password, salt)

	return PasswordHashData{
		UserUUID:     userUUID,
		Salt:         saltEncodedString,
		PasswordHash: passwordHashEncodedString,
	}, nil

}

func ComparePassword(password string, storedHash string, storedSalt string) bool {

	// Decode the stored salt and hash
	salt, err := base64.StdEncoding.DecodeString(storedSalt)
	if err != nil {
		// something went wrong with decoding salt
		return false
	}

	hash, err := base64.StdEncoding.DecodeString(storedHash)
	if err != nil {
		// something went wrong with decoding hash
		return false
	}

	// compute the hash for the user provided password
	computedHash := argon2.IDKey([]byte(password), salt, time, memory, threads, keyLength)

	return bytes.Equal(hash, computedHash)

}
