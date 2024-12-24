package api

import (
	"group-write/state"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func WsSetup(w http.ResponseWriter, r *http.Request) {
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Fatal(err)
	}
	defer ws.Close()

	connected := true
	sessionId, err := GetSessionCookie(r)
	if err != nil {
		http.Error(w, "Unauthorized: Invalid session", http.StatusUnauthorized)
		panic("Something is wrong with session validation, this error should never happen!")
	}

	users := state.Users.Val
	user, exists := users[sessionId]
	if !exists {
		panic("User does not exist for some reason, this should never be the case!")
	}

	user.Conn = ws
	println("Connected client", sessionId, "to server")

	ws.SetCloseHandler(func(code int, text string) error {
		println("Client", sessionId, "has disconnected")
		users := state.Users.Val
		user := users[sessionId]
		user.Conn = nil
		state.UnvoteWord(user.Vote)
		state.Users.Update(users)
		connected = false
		return nil
	})

	for connected {
		_, msg, _ := ws.ReadMessage()
		if len(msg) == 0 {
			break
		}

		user := state.Users.Val[sessionId]
		if state.VoteType.Val != state.NO_STORY && user.Vote == "" {
			users := state.Users.Val
			word := string(msg)
			users[sessionId].Vote = word
			state.Users.Update(users)
			state.VoteWord(word)
		}
	}
}
