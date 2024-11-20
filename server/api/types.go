package api

const (
	VOTE_UPDATE       int = 0
	VOTE_RESULT       int = 1
	GET_NUM_USERS     int = 2
	GET_ALL_STORIES   int = 3
	GET_STORY_BY_ID   int = 3
	GET_CURRENT_STORY int = 4
)

type Response struct {
	Code int         `json:"code"`
	Data interface{} `json:"data"`
}
