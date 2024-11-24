package state

import (
	"group-write/db"
	"log"
	"time"
)

func StartStory() {
	VoteType.Update(TITLE_VOTE)
}

func EndTitle() {
	VoteType.Update(TEXT_VOTE)
}

func EndStory() {
	VoteType.Update(NO_STORY)

	db.InsertStory(Title.Val, Text.Val)

	time.AfterFunc(5*time.Second, func() {
		Title.Update("")
		Text.Update("")
		VoteType.Update(TITLE_VOTE)
	})
}

func EndVote() {
	println("Ending vote!")

	maxWord, maxVoteNum := "", 0
	for word, numVotes := range Votes.Val {
		if numVotes > maxVoteNum {
			maxVoteNum = numVotes
			maxWord = word
		}
	}

	Votes.Update(make(map[string]int))
	users := Users.Val
	for id := range users {
		users[id].HasVoted = false

	}
	Users.Update(users)

	if VoteType.Val == TITLE_VOTE && maxWord != "END TITLE" {
		Title.Update(Title.Val + " " + maxWord)
	} else if VoteType.Val == TITLE_VOTE && maxWord == "END TITLE" {
		EndTitle()
	} else if VoteType.Val == TEXT_VOTE && maxWord != "END STORY" {
		Text.Update(Text.Val + " " + maxWord)
	} else if VoteType.Val == TEXT_VOTE && maxWord == "END STORY" {
		EndStory()
	} else {
		log.Fatal("Invalid vote end!")
	}

	IsVoteRunning.Update(false)
}

func StartVote() {
	if IsVoteRunning.Val {
		return
	}

	println("Starting vote!")

	VoteStartTimestamp.Update(time.Now().UnixMilli())
	IsVoteRunning.Update(true)

	time.AfterFunc(5*time.Second, EndVote)
}

func VoteWord(word string) {
	StartVote()

	votes := make(map[string]int)
	for key, value := range Votes.Val {
		votes[key] = value
	}
	votes[word]++
	Votes.Update(votes)
}

func SendStateDiff() {
	stateDiff := GetStateDiff()
	for _, user := range Users.Val {
		if user.Conn != nil {
			user.Conn.WriteJSON(stateDiff)
		}
	}
	ResetStateDiff()
}
