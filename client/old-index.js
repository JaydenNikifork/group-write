
/** @type {State} */
const state = {
  storyRunning: false,
  voteRunning: false,
  storyHasTitle: false,
  userHasVoted: false,
  currentVoteUpdateTimestamp: Date.now(),
  voteMsRemaining: 5000,
  votes: {},
  updateVoteTimerInterval: null
};

/** @type {Transition} */
const storyStarting = {
  inputState: {
    storyRunning: false
  },
  condition: "storyStarting",
  outputState: {
    storyRunning: true
  }
}

/** @type {Transition} */
const storyEnding = {
  inputState: {
    storyRunning: true
  },
  condition: "storyEnding",
  outputState: {
    storyRunning: false
  }
}

/** @type {Transition} */
const voteStarting = {
  inputState: {
    storyRunning: true,
    voteRunning: false
  },
  condition: "voteStarting",
  outputState: {
    voteRunning: true
  }
}

/** @type {Transition} */
const voteEnding = {
  inputState: {
    storyRunning: true,
    voteRunning: true
  },
  condition: "voteEnding",
  outputState: {
    voteRunning: false,
    userHasVoted: false
  }
}

/** @type {Transition} */
const titleEnding = {
  inputState: {
    storyRunning: true,
    storyHasTitle: false
  },
  condition: "titleEnding",
  outputState: {
    storyHasTitle: true
  }
}

/** @type {Transition} */
const userVoted = {
  inputState: {
    storyRunning: true,
    userHasVoted: false
  },
  condition: "userVoted",
  outputState: {
    userHasVoted: true
  }
}

function stateTransitionHandler(/** @type {Partial<State>} */ stateUpdate) {
  console.log("STATE UPDATE: ", stateUpdate)
  if (stateUpdate.storyRunning === true) {
    // there will be no title, so create title input
    uiUpdator.createTitleInput();
    uiUpdator.updateStoryAndTitle();
  } else if (stateUpdate.storyRunning === true) {
    // clear title and text
    uiUpdator.clearStory();
    // begin countdown for the next story
  }

  if (stateUpdate.storyHasTitle === true) {
    // remove title input
    uiUpdator.removeTitleInput();
    // create story text input and END STORY button
    uiUpdator.createStoryInputs();
  }

  if (stateUpdate.userHasVoted === true) {
    // disable all forms of input
    uiUpdator.disableAllInputs();
  } else if (stateUpdate.userHasVoted === false) {
    // enable all forms of input
    uiUpdator.enableAllInputs();
  }

  if (stateUpdate.voteRunning === true) {
    // show votes and timer
    uiUpdator.showVotesTab();
    uiUpdator.updateVotesElem();
  } else if (stateUpdate.voteRunning === false) {
    // clear votes
    // hide vote timer
    stateMachine.update({votes: {}});
    uiUpdator.hideVotesTab();
    uiUpdator.stopVotesTimer();
    uiUpdator.clearInput();
    
    // update story and title
    uiUpdator.updateStoryAndTitle();

    uiUpdator.focusInput();
  }
}

stateMachine.init(
  state,
  [
    storyStarting,
    storyEnding,
    voteStarting,
    voteEnding,
    titleEnding,
    userVoted
  ],
  stateTransitionHandler
);

stateMachine.transition('storyStarting');