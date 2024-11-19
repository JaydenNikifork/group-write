package main

import (
	"group-write/api"
	"group-write/db"
)

func main() {
	db.Init()
	defer db.Close()

	//ticker := time.NewTicker(500 * time.Millisecond)
	//defer ticker.Stop()

	//go func() {
	//for range ticker.C {
	//api.SendStateDiff()
	//}
	//}()

	api.Init()
}
