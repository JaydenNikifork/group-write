package types

import "github.com/gorilla/websocket"

type Story struct {
	Id        int    `json:"id"`
	Title     string `json:"title"`
	Text      string `json:"text"`
	Timestamp int64  `json:"timestamp"`
}

type User struct {
	Id       int
	Conn     *websocket.Conn
	HasVoted bool
}
