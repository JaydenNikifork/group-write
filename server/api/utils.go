package api

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"net/http"
)

func GenerateSessionId() (string, error) {
	bytes := make([]byte, 16)
	_, err := rand.Read(bytes)
	if err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

func GetSessionCookie(r *http.Request) (string, error) {
	cookie, err := r.Cookie("session_id")
	if err != nil || cookie == nil {
		return "", errors.New("no session id cookie sent")
	}
	sessionId := cookie.Value
	return sessionId, nil
}
