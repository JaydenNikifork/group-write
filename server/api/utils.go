package api

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"group-write/state"
	"net/http"
	"time"
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

func ValidateSessionId(sessionId string) bool {
	user, exists := state.Users.Val[sessionId]
	if !exists || user.Timeout <= time.Now().UnixMilli() {
		return false
	} else {
		return true
	}
}
