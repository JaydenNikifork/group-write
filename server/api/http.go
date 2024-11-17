package api

import (
	"encoding/json"
	"group-write/db"
	"group-write/state"
	"log"
	"net/http"
)

func GetCurrentState(w http.ResponseWriter, r *http.Request) {
	json.NewEncoder(w).Encode(state.GetCurrentState())
}

func GetAllStories(w http.ResponseWriter, r *http.Request) {
	stories := db.SelectAllStories()
	json.NewEncoder(w).Encode(Response{GET_ALL_STORIES, stories})
}

func CorsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Set CORS headers
		w.Header().Set("Access-Control-Allow-Origin", "*") // Change '*' to specific origins if needed
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		// Handle preflight OPTIONS request
		if r.Method == http.MethodOptions {
			return
		}

		// Call the next handler in the chain
		next.ServeHTTP(w, r)
	})
}

func Init() {
	mux := http.NewServeMux()

	mux.HandleFunc("/ws", WsSetup)
	mux.HandleFunc("/get-current-state", GetCurrentState)
	mux.HandleFunc("/get-stories", GetAllStories)

	wrappedMux := CorsMiddleware(mux)

	port := ":8080"
	println("Running server on port", port)
	err := http.ListenAndServe(port, wrappedMux)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
