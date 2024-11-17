package state

import "group-write/types"

const (
	NO_STORY = iota
	TITLE_VOTE
	TEXT_VOTE
)

type StateDiff map[string]any

var stateDiff StateDiff = make(StateDiff)

type StateVar[T any] struct {
	Val     T
	Handler func(oldVal, newVal T)
}

func (v *StateVar[T]) Update(newVal T) {
	v.Handler(v.Val, newVal)
	v.Val = newVal
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
		diff := newVal[len(oldVal):]
		stateDiff["title"] = diff
	},
}

var Text StateVar[string] = StateVar[string]{
	"",
	func(oldVal, newVal string) {
		diff := newVal[len(oldVal):]
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
	},
}

var Votes StateVar[map[string]int] = StateVar[map[string]int]{
	make(map[string]int),
	func(oldVal, newVal map[string]int) {
		_, exists := stateDiff["votes"]
		if !exists {
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

var Users StateVar[map[int]*types.User] = StateVar[map[int]*types.User]{
	make(map[int]*types.User),
	func(oldVal, newVal map[int]*types.User) {
	},
}

func GetStateDiff() StateDiff {
	return stateDiff
}

func GetCurrentState() map[string]any {
	state := make(map[string]any)
	state["voteType"] = VoteType.Val
	state["title"] = Title.Val
	state["text"] = Text.Val
	state["isVoteRunning"] = IsVoteRunning.Val
	state["voteStartTimestamp"] = VoteStartTimestamp.Val
	state["votes"] = Votes.Val

	return state
}
