import { getCurrentStory } from "./api";
import StateMachine from "./state.js";

/** @import { State } from './state.js' */

// List of HTML element ids
const titleId = 'title';
const titleInputId = 'title-input';
const storyId = 'story';
const storyInputId = 'vote-input';
const endStoryBtnId = 'end-story';
const storyContainerId = 'story-container';
const votesTabId = 'votes';
const votesTimerId = 'votes-timer';

// List of HTML element classes
const storyWordClass = 'story-word';
const voteRowClass = 'vote-row';

export function createTitleInput() {
  const titleElem = document.getElementById(titleId);

  if (Array.from(titleElem.children).find((child) => child.id === titleInputId) !== undefined) {
    throw new Error('Attempting to create title input element when it already exists!');
  }

  const titleInputElem = document.createElement('input');
  titleInputElem.id = titleInputId;
  titleInputElem.addEventListener('keydown', (ev) => {
    if (ev.key != 'Enter' && ev.key != ' ') return;
  
    const word = titleInputElem.value.trim().split(' ')[0];
    sendVote(word);
  });
  titleElem.appendChild(titleInputElem);
}

export function removeTitleInput() {
  const titleInputElem = document.getElementById(titleInputId);
  titleInputElem.remove();
}

export function createStoryInputs() {
  if (document.getElementById(storyInputId) !== null) {
    throw new Error(`Story input already exists!`);
  }
  
  if (document.getElementById(endStoryBtnId) !== null) {
    throw new Error(`End story button already exists!`);
  }

  const storyInputElem = document.createElement('input');
  storyInputElem.id = storyInputId;
  storyInputElem.placeholder = 'enter vote here';

  const endStoryElem = document.createElement('button');
  endStoryElem.id = endStoryBtnId;

  const storyContainerElem = document.getElementById(storyContainerId);
  storyContainerElem.appendChild(endStoryElem);

  const storyElem = document.getElementById(storyId);
  storyElem.appendChild(storyInputElem);
}

/**
 * Clears the title and text
 */
export function clearStory() {
  const titleElem = document.getElementById(titleId);
  const storyElem = document.getElementById(storyId);

  titleElem.innerText = "";

  const storyWordElems = document.getElementsByClassName(storyWordClass);
  for (const storyWordElem of Array.from(storyWordElems)) {
    const childCountBefore = storyElem.childElementCount;
    storyElem.removeChild(storyWordElem);
    const childCountAfter = storyElem.childElementCount;
    if (childCountBefore !== childCountAfter) {
      throw new Error(`Found '.story-word' element outside of 'story' element!`);
    }
  }
}

export function showVotesTab() {
  const votesElem = document.getElementById(votesTabId);
  votesElem.style.display = 'block';
}

export function hideVotesTab() {
  const votesElem = document.getElementById(votesTabId);
  votesElem.style.display = 'none';
}

export async function updateStoryText() {
  const storyWordElems = document.getElementsByClassName(storyWordClass);
  Array.from(storyWordElems).forEach(elem => elem.remove());

  const storyElem = document.getElementById(storyId);
  const storyInputElem = document.getElementById(storyInputId);

  const currentStory = await getCurrentStory();
  const storyArr = currentStory.text.split(/\s/);
  for (const storyWord of storyArr) {
    const storyWordElem = document.createElement('p');
    storyWordElem.className = storyWordClass;
    storyWordElem.innerText = storyWord;
    storyElem.insertBefore(storyWordElem, storyInputElem);
  }
}

export async function updateStoryTitle() {
  const titleElem = document.getElementById(titleId);
  const currentStory = await getCurrentStory();
  titleElem.innerText = currentStory.title;
}

export function disableAllInputs() {
  const titleInput = /** @type {HTMLInputElement} */(document.getElementById(titleInputId));
  const storyInput = /** @type {HTMLInputElement} */(document.getElementById(storyInputId));
  const endStoryBtn = /** @type {HTMLButtonElement} */(document.getElementById(endStoryBtnId));

  if (titleInput !== null) titleInput.disabled = true;
  if (storyInput !== null) storyInput.disabled = true;
  if (endStoryBtn !== null) endStoryBtn.disabled = true;
}

export function enableAllInputs() {
  const titleInput = /** @type {HTMLInputElement} */(document.getElementById(titleInputId));
  const storyInput = /** @type {HTMLInputElement} */(document.getElementById(storyInputId));
  const endStoryBtn = /** @type {HTMLButtonElement} */(document.getElementById(endStoryBtnId));

  if (titleInput !== null) titleInput.disabled = false;
  if (storyInput !== null) storyInput.disabled = false;
  if (endStoryBtn !== null) endStoryBtn.disabled = false;
}

export function updateVotesElem(/** @type {StateMachine} */ stateMachine) {
  const state = stateMachine.state;

  /** @type {[string, number][]} */
  const votesArr = [];
  for (const [word, numVotes] of Object.entries(state.votes)) {
    votesArr.push([word, numVotes]);
  }
  votesArr.sort((a, b) => b[1] - a[1]);

  const votesElems = document.getElementsByClassName(voteRowClass);
  Array.from(votesElems).forEach(elem => elem.remove());

  const votesTimerElem = document.getElementById(votesTimerId);

  const maxWidth = votesTimerElem.parentElement.clientWidth;
  const updateVoteTimerInterval = setInterval(() => {
    const newWidth = (state.voteMsRemaining - (Date.now() - state.currentVoteUpdateTimestamp)) / 5000 * maxWidth;
    const newTime = newWidth / maxWidth * 5;
    votesTimerElem.innerText = (Math.round(newTime * 100) / 100).toFixed(2);
    votesTimerElem.style.width = `${newWidth}px`;
  });
  stateMachine.update({ updateVoteTimerInterval });

  const votesElem = document.getElementById(votesTabId);
  for (const [word, numVotes] of votesArr) {
    const voteElem = document.createElement('p');
    
    voteElem.innerText = `"${word}" - ${numVotes}`;
    votesElem.appendChild(voteElem);
  }
}

export function stopVotesTimer(/** @type {StateMachine} */ stateMachine) {
  if (stateMachine.state.updateVoteTimerInterval === null) {
    throw new Error(`Attempted to stop timer when it wasn't even cookin'!`);
  }
  clearInterval(stateMachine.state.updateVoteTimerInterval);

  stateMachine.update({ updateVoteTimerInterval: null }); 
}