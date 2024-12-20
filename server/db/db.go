package db

import (
	"database/sql"
	"errors"
	"group-write/types"
	"log"
	"strconv"
	"time"

	_ "github.com/mattn/go-sqlite3"
)

var db *sql.DB = nil

func Init() {
	var err error
	db, err = sql.Open("sqlite3", "./group-write.db")
	if err != nil {
		log.Fatalf("Error opening db: %v", err)
	}

	query := `
	CREATE TABLE IF NOT EXISTS stories (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		title TEXT,
		text TEXT,
		timestamp INTEGER
	);`

	_, err = db.Exec(query)
	if err != nil {
		log.Fatalf("Error initializing db: %v", err)
	}
}

func Close() {
	db.Close()
}

func InsertStory(title, text string) {
	query := `
	INSERT INTO stories (title, text, timestamp)
	VALUES (?, ?, ?)`

	timestamp := time.Now().UnixMilli()
	_, err := db.Exec(query, title, text, timestamp)
	if err != nil {
		log.Fatalf("Error inserting story into stories table: %v", err)
	}
}

func SelectStoryById(id int) (types.Story, error) {
	query := `
	SELECT id, title, text, timestamp
	FROM stories S
	WHERE id = ?;`

	rows, err := db.Query(query, id)
	if err != nil {
		log.Fatalf("Error getting stories: %v", err)
	}
	defer rows.Close()

	if !rows.Next() {
		return types.Story{}, errors.New("Could not find a story with id=" + strconv.Itoa(id))
	}

	var readId int
	var title string
	var text string
	var timestamp int64

	if err := rows.Scan(&id, &title, &text, &timestamp); err != nil {
		log.Fatal(err)
		return types.Story{}, err
	}

	story := types.Story{
		Id:        readId,
		Title:     title,
		Text:      text,
		Timestamp: timestamp,
	}
	return story, nil
}

func SelectAllStories() []types.Story {
	query := `
	SELECT id, title, text, timestamp
	FROM stories S;`

	rows, err := db.Query(query)
	if err != nil {
		log.Fatalf("Error getting stories: %v", err)
	}
	defer rows.Close()

	stories := make([]types.Story, 0)
	for rows.Next() {
		var id int
		var title string
		var text string
		var timestamp int64

		if err := rows.Scan(&id, &title, &text, &timestamp); err != nil {
			log.Fatal(err)
		}

		stories = append(stories, types.Story{
			Id:        id,
			Title:     title,
			Text:      text,
			Timestamp: timestamp,
		})
	}

	return stories
}
