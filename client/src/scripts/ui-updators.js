import { stateMachine } from "./state";
import { ws } from "./ws";
/** @import { State } from "./state" */

class UIUpdator {
  // List of HTML element ids
  titleId = 'title';
  storyId = 'story';
  storyInputId = 'vote-input';
  endStoryBtnId = 'end-story';
  storyContainerId = 'story-container';
  votesTabId = 'votes';
  votesTimerId = 'votes-timer';
  votesContainerId = 'votes-container';
  numUsersId = 'num-users'

  // List of HTML element classes
  storyWordClass = 'story-word';
  voteRowClass = 'vote-row';

  // List of HTML elements
  storyInputElem = /** @type {HTMLInputElement} */(document.getElementById(this.storyInputId));
  endStoryBtn = /** @type {HTMLButtonElement} */(document.getElementById(this.endStoryBtnId));
  titleElem = document.getElementById(this.titleId);
  storyElem = document.getElementById(this.storyId);
  storyContainerElem = document.getElementById(this.storyContainerId);
  votesElem = document.getElementById(this.votesTabId);
  votesContainerElem = document.getElementById(this.votesContainerId);
  numUsersElem = document.getElementById(this.numUsersId);

  init() {
    this.storyInputElem.addEventListener('keydown', (ev) => {
      if (ev.key != 'Enter' && ev.key != ' ') return;
    
      const word = this.storyInputElem.value.trim().split(' ')[0];
      ws.sendVote(word);
      stateMachine.update({userHasVoted: true});
    });

    this.endStoryBtn.onclick = () => {
      if (stateMachine.state.voteType === 1) {
        ws.sendVote("END TITLE");
      } else if (stateMachine.state.voteType === 2) {
        ws.sendVote("END STORY");
      }
      stateMachine.update({userHasVoted: true});
    }

    this.storyElem.onclick = () => {
      this.storyInputElem.focus();
    }
  }

  showTitleInputs() {
    this.storyInputElem.remove();
    this.endStoryBtn.remove();

    this.titleElem.insertBefore(this.storyInputElem, null);
    this.votesContainerElem.insertBefore(this.endStoryBtn, this.votesElem);
    this.endStoryBtn.value = "END TITLE";
  }

  showTextInputs() {
    this.storyInputElem.remove();
    this.endStoryBtn.remove();

    this.storyElem.insertBefore(this.storyInputElem, null);
    this.votesContainerElem.insertBefore(this.endStoryBtn, this.votesElem);
    this.endStoryBtn.value = "END STORY";
  }

  hideInputs() {
    this.storyInputElem.remove();
    this.endStoryBtn.remove();
  }

  showVotesTab() {
    const votesElem = document.getElementById(this.votesTabId);
    votesElem.style.display = 'flex';
  }

  hideVotesTab() {
    const votesElem = document.getElementById(this.votesTabId);
    votesElem.style.display = 'none';
  }

  updateStoryAndTitle() {
    const title = stateMachine.state.title;
    const text = stateMachine.state.text;
    
    const storyWordElems = document.getElementsByClassName(this.storyWordClass);
    Array.from(storyWordElems).forEach(elem => elem.remove());

    const titleElem = document.getElementById(this.titleId);
    const titleArr = title.split(/\s/);
    titleArr.reverse();
    for (const titleWord of titleArr) {
      const titleWordElem = document.createElement('p');
      titleWordElem.className = this.storyWordClass;
      titleWordElem.innerText = titleWord;
      titleElem.insertAdjacentElement('afterbegin', titleWordElem);
    }

    const storyElem = document.getElementById(this.storyId);
    const storyArr = text.split(/\s/);
    storyArr.reverse();
    for (const storyWord of storyArr) {
      const storyWordElem = document.createElement('p');
      storyWordElem.className = this.storyWordClass;
      storyWordElem.innerText = storyWord;
      storyElem.insertBefore(storyWordElem, titleElem.nextElementSibling);
    }
  }

  disableAllInputs() {
    this.storyInputElem.disabled = true;
    this.endStoryBtn.disabled = true;
  }

  enableAllInputs() {
    this.storyInputElem.disabled = false;
    this.endStoryBtn.disabled = false;
    this.focusInput();
  }

  clearInput() {
    this.storyInputElem.value = '';
  }

  focusInput() {
    this.storyInputElem.focus();
  }

  updateVotesElem() {
    const state = stateMachine.state;
    /** @type {[string, number][]} */
    const votesArr = [];
    for (const [word, numVotes] of Object.entries(state.votes)) {
      votesArr.push([word, numVotes]);
    }
    votesArr.sort((a, b) => b[1] - a[1]);

    const votesElems = document.getElementsByClassName(this.voteRowClass);
    Array.from(votesElems).forEach(elem => elem.remove());

    if (state.updateVoteTimerInterval === null) {
      const votesTimerElem = document.getElementById(this.votesTimerId);
      const maxWidth = votesTimerElem.parentElement.clientWidth;
      const updateVoteTimerInterval = setInterval(() => {
        const newWidth = maxWidth - maxWidth * (Date.now() - state.voteStartTimestamp) / 5000;
        const newTime = newWidth / maxWidth * 5;
        votesTimerElem.innerText = (Math.round(newTime * 100) / 100).toFixed(2);
        votesTimerElem.style.width = `${newWidth}px`;
      });
      stateMachine.update({ updateVoteTimerInterval });
    }

    const votesElem = document.getElementById(this.votesTabId);
    for (const [word, numVotes] of votesArr) {
      const voteElem = document.createElement('p');
      voteElem.className = this.voteRowClass;
      
      voteElem.innerText = `"${word}" - ${numVotes}`;
      votesElem.appendChild(voteElem);
    }
  }

  stopVotesTimer() {
    clearInterval(stateMachine.state.updateVoteTimerInterval);

    stateMachine.update({ updateVoteTimerInterval: null }); 
  }

  /**
   * @param {number} numUsers 
   */
  updateNumUsers(numUsers) {
    this.numUsersElem.innerText = `Users writing: ${numUsers}`;
  }
}

export const uiUpdator = new UIUpdator();

export function stateTransitionHandler(/** @type {Partial<State>} */ stateUpdate) {
  if (stateUpdate.title !== undefined || stateUpdate.text !== undefined) {
    uiUpdator.updateStoryAndTitle();
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

  if (stateUpdate.numUsers !== undefined) {
    uiUpdator.updateNumUsers(stateUpdate.numUsers);
  }
}
