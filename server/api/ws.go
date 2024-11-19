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

var idCounter int = 0

func WsSetup(w http.ResponseWriter, r *http.Request) {
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Fatal(err)
	}
	defer ws.Close()

	connected := true
	userId := idCounter
	idCounter++
	newUser := new(types.User)
	newUser.Id = userId
	newUser.Conn = ws
	newUser.HasVoted = false

	users := state.Users.Val
	users[userId] = newUser
	state.Users.Update(users)

	println("Connected client", userId, "to server")

	ws.SetCloseHandler(func(code int, text string) error {
		println("Client", userId, "has disconnected")
		users := state.Users.Val
		delete(users, userId)
		state.Users.Update(users)
		connected = false
		return nil
	})

	for connected {
		_, msg, _ := ws.ReadMessage()
		if len(msg) == 0 {
			break
		}

		user := state.Users.Val[userId]
		if state.VoteType.Val != state.NO_STORY && !user.HasVoted {
			users := state.Users.Val
			users[userId].HasVoted = true
			state.Users.Update(users)
			state.VoteWord(string(msg))
		}
	}
}
