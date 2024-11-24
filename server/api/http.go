package api

import (
	"encoding/json"
	"group-write/db"
	"group-write/state"
	"group-write/types"
	"log"
	"net/http"
	"sort"
	"strconv"
	"time"
)

func GetCurrentState(w http.ResponseWriter, r *http.Request) {
	currentState := state.GetCurrentState()
	json.NewEncoder(w).Encode(currentState)

	if currentState["voteType"] == state.NO_STORY {
		state.StartStory()
	}
}

func GetStoryById(w http.ResponseWriter, r *http.Request) {
	queryParams := r.URL.Query()
	idStr := queryParams.Get("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "'id' parameter is not a valid int", http.StatusBadRequest)
		return
	}
	story, err := db.SelectStoryById(id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	json.NewEncoder(w).Encode(Response{GET_STORY_BY_ID, story})
}

func GetAllStories(w http.ResponseWriter, r *http.Request) {
	stories := db.SelectAllStories()
	sort.Slice(stories, func(i int, j int) bool {
		return stories[i].Timestamp > stories[j].Timestamp
	})
	json.NewEncoder(w).Encode(Response{GET_ALL_STORIES, stories})
}

func StartSession(w http.ResponseWriter, r *http.Request) {
	sessionId, err := GetSessionCookie(r)
	if err == nil || ValidateSessionId(sessionId) {
		http.Error(w, "Bad request: Session cookie already exists", http.StatusBadRequest)
		return
	}

	sessionId, err = GenerateSessionId()
	if err != nil {
		http.Error(w, "Internal server error: Unable to generate session token", http.StatusInternalServerError)
		return
	}

	expiryTime := time.Now().Add(24 * time.Hour)
	newUser := types.User{
		SessionId: sessionId,
		Timeout:   expiryTime,
		Conn:      nil,
		HasVoted:  false,
	}
	users := state.Users.Val
	users[sessionId] = &newUser

	// PROD CHECK
	http.SetCookie(w, &http.Cookie{
		Name:     "session_id",
		Value:    sessionId,
		Path:     "/",
		Expires:  expiryTime,
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteNoneMode,
	})
}

func CorsMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Set CORS headers
		// PROD CHECK
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:8081")
		w.Header().Set("Access-Control-Allow-Credentials", "true")
		w.Header().Set("Access-Control-Allow-Methods", "GET")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		// Handle preflight OPTIONS request
		if r.Method == http.MethodOptions {
			return
		}

		next(w, r)
	}
}

func SessionValidationMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		sessionId, err := GetSessionCookie(r)
		if err != nil || !ValidateSessionId(sessionId) {
			http.Error(w, "Unauthorized: invalid session", http.StatusUnauthorized)
			return
		}

		next(w, r)
	}
}

func Init() {
	mux := http.NewServeMux()

	mw := MiddlewareBuilder(SessionValidationMiddleware, CorsMiddleware)

	mux.HandleFunc("/start-session", CorsMiddleware(StartSession))
	mux.HandleFunc("/ws", mw(WsSetup))
	mux.HandleFunc("/get-current-state", mw(GetCurrentState))
	mux.HandleFunc("/get-stories", mw(GetAllStories))
	mux.HandleFunc("/get-story-by-id", mw(GetStoryById))

	port := ":8080"
	println("Running server on port", port)
	err := http.ListenAndServe(port, mux)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
