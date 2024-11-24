
/** @type {State} */
const state = {
  stateId: null,
  voteType: 0,
  title: "",
  text: "",
  isVoteRunning: false,
  voteStartTimestamp: 0,
  votes: {},
  userHasVoted: false,
  updateVoteTimerInterval: null
};

function stateTransitionHandler(/** @type {Partial<State>} */ stateUpdate) {
  if (stateUpdate.title !== undefined || stateUpdate.text !== undefined) {
    uiUpdator.updateStoryAndTitle(stateMachine.state.title, stateMachine.state.text);
  }

  if (stateUpdate.votes !== undefined) {
    uiUpdator.updateVotesElem();
  }

  if (stateUpdate.voteType === 1) {
    uiUpdator.showTitleInputs();
  } else if (stateUpdate.voteType === 0) {
    uiUpdator.hideInputs();
  } else if (stateUpdate.voteType === 2) {
    uiUpdator.showTextInputs();
  }

  if (stateUpdate.userHasVoted === true) {
    uiUpdator.disableAllInputs();
  } else if (stateUpdate.userHasVoted === false) {
    uiUpdator.enableAllInputs();
  }

  if (stateUpdate.isVoteRunning === true) {
    uiUpdator.showVotesTab();
  } else if (stateUpdate.isVoteRunning === false) {
    uiUpdator.hideVotesTab();
    uiUpdator.stopVotesTimer();
    uiUpdator.clearInput();
    stateMachine.update({userHasVoted: false});

    uiUpdator.focusInput();
  }
}

stateMachine.init(
  state,
  [],
  stateTransitionHandler
);
