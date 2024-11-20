package api

import (
	"encoding/json"
	"group-write/db"
	"group-write/state"
	"log"
	"net/http"
	"sort"
	"strconv"
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
	mux.HandleFunc("/get-story-by-id", GetStoryById)

	wrappedMux := CorsMiddleware(mux)

	port := ":8080"
	println("Running server on port", port)
	err := http.ListenAndServe(port, wrappedMux)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
