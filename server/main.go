package main

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/websocket"
	_ "github.com/mattn/go-sqlite3"
)

const (
	VOTE_UPDATE       int = 0
	VOTE_RESULT       int = 1
	GET_NUM_USERS     int = 2
	GET_STORIES       int = 3
	GET_CURRENT_STORY int = 4
)

type Response struct {
	Code int         `json:"code"`
	Data interface{} `json:"data"`
}

type VoteUpdateData struct {
	MsRemaining int64           `json:"msRemaining"`
	Votes       map[string]uint `json:"votes"`
}

type NumUsersData struct {
	NumUsers int32 `json:"numUsers"`
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

var idCounter byte = 0
var cons map[byte]*websocket.Conn = make(map[byte]*websocket.Conn)

var voteStart int64 = -1
var voteRunning bool = false
var votes map[string]uint = make(map[string]uint)
var userVotes map[*websocket.Conn]bool = make(map[*websocket.Conn]bool)

var storyRunning = true
var storyTitle string
var story string

var db *sql.DB

func StartStory() {
	storyRunning = true
}

func InsertStoryIntoDB(db *sql.DB) {
	query := `
	INSERT INTO stories (title, text, timestamp)
	VALUES (?, ?, ?)`

	timestamp := time.Now().UnixMilli()
	_, err := db.Exec(query, storyTitle, story, timestamp)
	if err != nil {
		log.Fatalf("Error inserting story into stories table: %v", err)
	}
}

func EndStory() {
	storyRunning = false

	InsertStoryIntoDB(db)

	story = ""
	storyTitle = ""
}

func EndVote() {
	println("Ending vote!")

	maxWord, maxVoteNum := "", uint(0)
	for word, numVotes := range votes {
		if numVotes > maxVoteNum {
			maxVoteNum = numVotes
			maxWord = word
		}
	}

	votes = make(map[string]uint)
	userVotes = make(map[*websocket.Conn]bool)

	for conId, con := range cons {
		println("Writing max word", maxWord, "to", conId)
		con.WriteJSON(Response{VOTE_RESULT, maxWord})
	}

	if maxWord != "END STORY" {
		story += " " + maxWord
	} else {
		EndStory()
	}

	voteRunning = false
}

func StartVote() {
	if voteRunning {
		return
	}

	println("Starting vote!")

	voteStart = time.Now().UnixMilli()
	voteRunning = true
	// not sure when we should clear, trying on end rn
	// votes = make(map[string]uint)

	time.AfterFunc(5*time.Second, EndVote)
}

func SendVoteUpdate() {
	timeRemaining := 5000 - (time.Now().UnixMilli() - int64(voteStart))
	for conId, con := range cons {
		println("Sending updated votes to", conId)
		con.WriteJSON(Response{VOTE_UPDATE, VoteUpdateData{timeRemaining, votes}})
	}
}

func VoteWord(word string) {
	StartVote()

	votes[word]++
	println("Voted for:", word, "and count is now:", votes[word])

	SendVoteUpdate()
}

func WsSetup(w http.ResponseWriter, r *http.Request) {
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Fatal(err)
	}
	defer ws.Close()

	connected := true
	conId := idCounter
	idCounter++
	cons[conId] = ws
	println("Connected client", conId, "to server")

	ws.SetCloseHandler(func(code int, text string) error {
		println("Client", conId, "has disconnected")
		delete(cons, conId)
		return nil
	})
	message := make([]byte, 1)
	message[0] = conId
	// this could be useful but not yet
	// ws.WriteMessage(1, message)

	for connected {
		_, msg, _ := ws.ReadMessage()
		if len(msg) == 0 {
			break
		}

		println("Reading message:", msg)

		_, alreadyVoted := userVotes[ws]
		if storyRunning && !alreadyVoted {
			userVotes[ws] = true
			VoteWord(string(msg))
		}
	}
}

type Story struct {
	Title     string `json:"title"`
	Text      string `json:"text"`
	Timestamp int64  `json:"timestamp"`
}

func GetCurrentStory(w http.ResponseWriter, r *http.Request) {
	json.NewEncoder(w).Encode(Response{GET_CURRENT_STORY, Story{storyTitle, story, 0}})
}

func GetNumUsers(w http.ResponseWriter, r *http.Request) {
	numUsers := len(cons)
	json.NewEncoder(w).Encode(Response{GET_NUM_USERS, NumUsersData{int32(numUsers)}})
}

func GetStoriesFromDB(db *sql.DB) []Story {
	query := `
	SELECT title, text, timestamp
	FROM stories S;`

	rows, err := db.Query(query)
	if err != nil {
		log.Fatalf("Error getting stories: %v", err)
	}
	defer rows.Close()

	stories := make([]Story, 0)
	for rows.Next() {
		var title string
		var text string
		var timestamp int64

		if err := rows.Scan(&title, &text, &timestamp); err != nil {
			log.Fatal(err)
		}

		stories = append(stories, Story{title, text, timestamp})
	}

	return stories
}

func GetStories(w http.ResponseWriter, r *http.Request) {
	stories := GetStoriesFromDB(db)

	json.NewEncoder(w).Encode(Response{GET_STORIES, stories})
}

func InitDB(db *sql.DB) {
	query := `
	CREATE TABLE IF NOT EXISTS stories (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		title TEXT,
		text TEXT,
		timestamp INTEGER
	);`

	_, err := db.Exec(query)
	if err != nil {
		log.Fatalf("Error initializing db: %v", err)
	}
}

func corsMiddleware(next http.Handler) http.Handler {
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

func main() {
	var err error
	db, err = sql.Open("sqlite3", "./group-write.db")
	if err != nil {
		log.Fatalf("Error opening db: %v", err)
	}
	defer db.Close()

	InitDB(db)

	mux := http.NewServeMux()

	mux.HandleFunc("/ws", WsSetup)
	mux.HandleFunc("/get-current-story", GetCurrentStory)
	mux.HandleFunc("/get-num-users", GetNumUsers)
	mux.HandleFunc("/get-stories", GetStories)

	wrappedMux := corsMiddleware(mux)

	port := ":8080"
	println("Running server on port", port)
	err = http.ListenAndServe(port, wrappedMux)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
