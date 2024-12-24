package state

import (
	"group-write/types"
)

const (
	NO_STORY = iota
	TITLE_VOTE
	TEXT_VOTE
)

type StateDiff map[string]any

var stateDiff StateDiff = make(StateDiff)
var stateId int64 = 0

type StateVar[T any] struct {
	Val     T
	Handler func(oldVal, newVal T)
}

func (v *StateVar[T]) Update(newVal T) {
	v.Handler(v.Val, newVal)
	v.Val = newVal
	if len(stateDiff) > 0 {
		stateId++
		stateDiff["stateId"] = stateId
		SendStateDiff()
	}
}

// define state vars
var VoteType StateVar[int] = StateVar[int]{
	NO_STORY,
	func(_, val int) {
		stateDiff["voteType"] = val
	},
}

var Title StateVar[string] = StateVar[string]{
	"",
	func(oldVal, newVal string) {
		diff := ""
		if len(newVal) != 0 {
			diff = newVal[len(oldVal):]
		}
		stateDiff["title"] = diff
	},
}

var Text StateVar[string] = StateVar[string]{
	"",
	func(oldVal, newVal string) {
		diff := ""
		if len(newVal) != 0 {
			diff = newVal[len(oldVal):]
		}
		stateDiff["text"] = diff
	},
}

var IsVoteRunning StateVar[bool] = StateVar[bool]{
	false,
	func(_, newVal bool) {
		stateDiff["isVoteRunning"] = newVal
	},
}

var VoteStartTimestamp StateVar[int64] = StateVar[int64]{
	0,
	func(_, newVal int64) {
		stateDiff["voteStartTimestamp"] = newVal
	},
}

var Votes StateVar[map[string]int] = StateVar[map[string]int]{
	make(map[string]int),
	func(oldVal, newVal map[string]int) {
		_, exists := stateDiff["votes"]
		if !exists || len(newVal) == 0 {
			stateDiff["votes"] = make(map[string]int)
		}

		for word, numVotes := range newVal {
			oldNumVotes, exists := oldVal[word]
			if !exists || numVotes != oldNumVotes {
				stateDiff["votes"].(map[string]int)[word] = numVotes
			}
		}
	},
}

var Users StateVar[map[string]*types.User] = StateVar[map[string]*types.User]{
	make(map[string]*types.User),
	func(oldVal, newVal map[string]*types.User) {
	},
}

func GetStateDiff() StateDiff {
	return stateDiff
}

func ResetStateDiff() {
	clear(stateDiff)
}

func GetCurrentState() map[string]any {
	state := make(map[string]any)
	state["stateId"] = stateId
	state["voteType"] = VoteType.Val
	state["title"] = Title.Val
	state["text"] = Text.Val
	state["isVoteRunning"] = IsVoteRunning.Val
	state["voteStartTimestamp"] = VoteStartTimestamp.Val
	state["votes"] = Votes.Val
	state["numUsers"] = len(Users.Val)

	return state
}
