import { getCurrentStory, getNumUsers } from './api.js';
import StateMachine from './state.js';
import * as UIUpdator from './ui-updators.js';

/** @import { State, Transition } from './state.js' */

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
const titleVoteEnding = {
  inputState: {
    storyRunning: true,
    voteRunning: true,
    storyHasTitle: false
  },
  condition: "voteEnding",
  outputState: {
    voteRunning: false,
    userHasVoted: false,
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

function stateTransitionHandler(/** @type {State} */ stateUpdate) {
  if (stateUpdate.storyRunning) {
    // there will be no title, so create title input
    UIUpdator.createTitleInput();
  } else {
    // clear title and text
    UIUpdator.clearStory();
    // begin countdown for the next story
  }

  if (stateUpdate.storyHasTitle) {
    // remove title input
    UIUpdator.removeTitleInput();
    // create story text input and END STORY button
    UIUpdator.createStoryInputs();
  }

  if (stateUpdate.voteRunning) {
    // show votes and timer
    UIUpdator.showVotesTab();
  } else {
    // clear votes
    // hide vote timer
    UIUpdator.hideVotesTab();
    UIUpdator.stopVotesTimer();
    
    if (stateUpdate.storyHasTitle) {
      // update story title
      UIUpdator.updateStoryTitle();
    } else {
      // update story text
      UIUpdator.updateStoryText();
    }
  }

  if (stateUpdate.userHasVoted) {
    // disable all forms of input
    UIUpdator.disableAllInputs();
  } else {
    // enable all forms of input
    UIUpdator.enableAllInputs();
  }
}

export const stateMachine = new StateMachine(
  state,
  [
    storyStarting,
    storyEnding,
    voteStarting,
    voteEnding,
    titleVoteEnding,
    userVoted
  ],
  stateTransitionHandler
);

const numUsersElem = document.getElementById('num-users');
function updateNumUsers() {
  getNumUsers().then((numUsers) => {
    numUsersElem.innerText = `Current Users: ${numUsers}`;
  });
}
updateNumUsers();
setInterval(() => {
  updateNumUsers();
}, 10000);

const endStoryBtnElem = /** @type {HTMLButtonElement} */(document.getElementById('end-story'));

voteInputElem.addEventListener('keydown', (ev) => {
  if (ev.key != 'Enter' && ev.key != ' ') return;

  const word = voteInputElem.value.trim().split(' ')[0];
  sendVote(word);
});

endStoryBtnElem.onclick = () => {
  sendVote('END STORY');
}
