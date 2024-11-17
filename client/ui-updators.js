class UIUpdator {
  // List of HTML element ids
  titleId = 'title';
  titleInputId = 'title-input';
  storyId = 'story';
  storyInputId = 'vote-input';
  endStoryBtnId = 'end-story';
  storyContainerId = 'story-container';
  votesTabId = 'votes';
  votesTimerId = 'votes-timer';

  // List of HTML element classes
  storyWordClass = 'story-word';
  voteRowClass = 'vote-row';

  createTitleInput() {
    const titleElem = document.getElementById(this.titleId);

    if (Array.from(titleElem.children).find((child) => child.id === this.titleInputId) !== undefined) {
      throw new Error('Attempting to create title input element when it already exists!');
    }

    const titleInputElem = document.createElement('input');
    titleInputElem.id = this.titleInputId;
    titleInputElem.placeholder = 'enter vote here';
    titleInputElem.addEventListener('keydown', (ev) => {
      if (ev.key != 'Enter' && ev.key != ' ') return;
    
      const word = titleInputElem.value.trim().split(' ')[0];
      env.dao.sendVote(word);
      stateMachine.transition('userVoted');
    });
    titleElem.appendChild(titleInputElem);

    const endTitleElem = document.createElement('button');
    endTitleElem.id = this.endStoryBtnId;
    endTitleElem.innerText = 'END TITLE';
    endTitleElem.onclick = () => {
      env.dao.sendVote('END TITLE');
    }

    const storyContainerElem = document.getElementById(this.storyContainerId);
    storyContainerElem.appendChild(endTitleElem);

  }

  removeTitleInput() {
    const titleInputElem = document.getElementById(this.titleInputId);
    titleInputElem.remove();

    const endTitleElem = document.getElementById(this.endStoryBtnId);
    endTitleElem.remove();
  }

  createStoryInputs() {
    if (document.getElementById(this.storyInputId) !== null) {
      throw new Error(`Story input already exists!`);
    }
    
    if (document.getElementById(this.endStoryBtnId) !== null) {
      throw new Error(`End story button already exists!`);
    }

    const storyInputElem = document.createElement('input');
    storyInputElem.id = this.storyInputId;
    storyInputElem.placeholder = 'enter vote here';
    storyInputElem.addEventListener('keydown', (ev) => {
      if (ev.key != 'Enter' && ev.key != ' ') return;
    
      const word = storyInputElem.value.trim().split(' ')[0];
      env.dao.sendVote(word);
    });

    const endStoryElem = document.createElement('button');
    endStoryElem.id = this.endStoryBtnId;
    endStoryElem.innerText = 'END STORY';
    endStoryElem.onclick = () => {
      env.dao.sendVote('END STORY');
    }

    const storyContainerElem = document.getElementById(this.storyContainerId);
    storyContainerElem.appendChild(endStoryElem);

    const storyElem = document.getElementById(this.storyId);
    storyElem.appendChild(storyInputElem);
  }

  /**
   * Clears the title and text
   */
  clearStory() {
    const titleElem = document.getElementById(this.titleId);
    const storyElem = document.getElementById(this.storyId);

    titleElem.innerText = "";

    const storyWordElems = document.getElementsByClassName(this.storyWordClass);
    for (const storyWordElem of Array.from(storyWordElems)) {
      const childCountBefore = storyElem.childElementCount;
      storyElem.removeChild(storyWordElem);
      const childCountAfter = storyElem.childElementCount;
      if (childCountBefore !== childCountAfter) {
        throw new Error(`Found '.story-word' element outside of 'story' element!`);
      }
    }
  }

  showVotesTab() {
    const votesElem = document.getElementById(this.votesTabId);
    votesElem.style.display = 'block';
  }

  hideVotesTab() {
    const votesElem = document.getElementById(this.votesTabId);
    votesElem.style.display = 'none';
  }

  async updateStoryAndTitle() {
    const storyWordElems = document.getElementsByClassName(this.storyWordClass);
    Array.from(storyWordElems).forEach(elem => elem.remove());

    const storyElem = document.getElementById(this.storyId);
    const storyInputElem = document.getElementById(this.storyInputId);

    const currentStory = await api.getCurrentStory();
    const storyArr = currentStory.text.split(/\s/);
    for (const storyWord of storyArr) {
      const storyWordElem = document.createElement('p');
      storyWordElem.className = this.storyWordClass;
      storyWordElem.innerText = storyWord;
      storyElem.insertBefore(storyWordElem, storyInputElem);
    }

    const titleElem = document.getElementById(this.titleId);
    const titleInputElem = document.getElementById(this.titleInputId);
    const titleArr = currentStory.title.split(/\s/);
    for (const titleWord of titleArr) {
      const titleWordElem = document.createElement('p');
      titleWordElem.className = this.storyWordClass;
      titleWordElem.innerText = titleWord;
      titleElem.insertBefore(titleWordElem, titleInputElem);
    }
  }

  disableAllInputs() {
    const titleInput = /** @type {HTMLInputElement} */(document.getElementById(this.titleInputId));
    const storyInput = /** @type {HTMLInputElement} */(document.getElementById(this.storyInputId));
    const endStoryBtn = /** @type {HTMLButtonElement} */(document.getElementById(this.endStoryBtnId));

    if (titleInput !== null) titleInput.disabled = true;
    if (storyInput !== null) storyInput.disabled = true;
    if (endStoryBtn !== null) endStoryBtn.disabled = true;
  }

  enableAllInputs() {
    const titleInput = /** @type {HTMLInputElement} */(document.getElementById(this.titleInputId));
    const storyInput = /** @type {HTMLInputElement} */(document.getElementById(this.storyInputId));
    const endStoryBtn = /** @type {HTMLButtonElement} */(document.getElementById(this.endStoryBtnId));

    if (titleInput !== null) titleInput.disabled = false;
    if (storyInput !== null) storyInput.disabled = false;
    if (endStoryBtn !== null) endStoryBtn.disabled = false;
  }

  clearInput() {
    const state = stateMachine.state;
    if (state.storyHasTitle === true) {
      const storyInputElem = /** @type {HTMLInputElement} */(document.getElementById(this.storyInputId));
      storyInputElem.value = '';
    } else if (state.storyHasTitle === false) {
      const titleInputElem = /** @type {HTMLInputElement} */(document.getElementById(this.titleInputId));
      titleInputElem.value = '';
    }
  }

  focusInput() {
    const state = stateMachine.state;
    if (state.storyHasTitle === true) {
      const storyInputElem = /** @type {HTMLInputElement} */(document.getElementById(this.storyInputId));
      storyInputElem.focus();
    } else if (state.storyHasTitle === false) {
      const titleInputElem = /** @type {HTMLInputElement} */(document.getElementById(this.titleInputId));
      titleInputElem.focus();
    }
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

    const votesTimerElem = document.getElementById(this.votesTimerId);

    const maxWidth = votesTimerElem.parentElement.clientWidth;
    const updateVoteTimerInterval = setInterval(() => {
      const newWidth = (state.voteMsRemaining - (Date.now() - state.currentVoteUpdateTimestamp)) / 5000 * maxWidth;
      const newTime = newWidth / maxWidth * 5;
      votesTimerElem.innerText = (Math.round(newTime * 100) / 100).toFixed(2);
      votesTimerElem.style.width = `${newWidth}px`;
    });
    stateMachine.update({ updateVoteTimerInterval });

    const votesElem = document.getElementById(this.votesTabId);
    for (const [word, numVotes] of votesArr) {
      const voteElem = document.createElement('p');
      voteElem.className = this.voteRowClass;
      
      voteElem.innerText = `"${word}" - ${numVotes}`;
      votesElem.appendChild(voteElem);
    }
  }

  stopVotesTimer() {
    if (stateMachine.state.updateVoteTimerInterval === null) {
      throw new Error(`Attempted to stop timer when it wasn't even cookin'!`);
    }
    clearInterval(stateMachine.state.updateVoteTimerInterval);

    stateMachine.update({ updateVoteTimerInterval: null }); 
  }
}

const uiUpdator = new UIUpdator();