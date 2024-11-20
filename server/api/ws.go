package api

import (
	"group-write/state"
	"group-write/types"
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
	users := state.Users.Val

	connected := true
	newUser := new(types.User)
	sessionId, err := GetSessionCookie(r)
	if err != nil {
		http.Error(w, "Unauthorized: Invalid session", http.StatusUnauthorized)
		return
	}
	_, exists := users[sessionId]
	if exists {
		http.Error(w, "Bad request: Client already connected", http.StatusBadRequest)
		return
	}

	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Fatal(err)
	}
	defer ws.Close()

	newUser.SessionId = sessionId
	newUser.Conn = ws
	newUser.HasVoted = false

	users[sessionId] = newUser
	state.Users.Update(users)

	println("Connected client", sessionId, "to server")

	ws.SetCloseHandler(func(code int, text string) error {
		println("Client", sessionId, "has disconnected")
		users := state.Users.Val
		delete(users, sessionId)
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
		if state.VoteType.Val != state.NO_STORY && !user.HasVoted {
			users := state.Users.Val
			users[sessionId].HasVoted = true
			state.Users.Update(users)
			state.VoteWord(string(msg))
		}
	}
}
