package types

import (
	"time"

	"github.com/gorilla/websocket"
)

type Story struct {
	Id        int    `json:"id"`
	Title     string `json:"title"`
	Text      string `json:"text"`
	Timestamp int64  `json:"timestamp"`
}

type User struct {
	SessionId string
	Timeout   time.Time
	Conn      *websocket.Conn
	Vote      string
}
