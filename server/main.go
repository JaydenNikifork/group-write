package main

import (
	"group-write/api"
	"group-write/db"
	"time"
)

func main() {
	db.Init()
	defer db.Close()

	api.Init()

	ticker := time.NewTicker(250 * time.Millisecond)
	defer ticker.Stop()

	go func() {
		for range ticker.C {
			api.SendStateDiff()
		}
	}()
}
