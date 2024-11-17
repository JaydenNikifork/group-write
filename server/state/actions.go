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

	Title.Update("")
	Text.Update("")
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

	votes := Votes.Val
	votes[word]++
	Votes.Update(votes)

	println("Voted for:", word, "and count is now:", votes[word])
}
