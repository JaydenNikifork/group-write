class UIUpdator {
  // List of HTML element ids
  titleId = 'title';
  storyId = 'story';
  storyInputId = 'vote-input';
  endStoryBtnId = 'end-story';
  storyContainerId = 'story-container';
  votesTabId = 'votes';
  votesTimerId = 'votes-timer';

  // List of HTML element classes
  storyWordClass = 'story-word';
  voteRowClass = 'vote-row';

  // List of HTML elements
  storyInputElem = /** @type {HTMLInputElement} */(document.getElementById(this.storyInputId));
  endStoryBtn = /** @type {HTMLButtonElement} */(document.getElementById(this.endStoryBtnId));
  titleElem = document.getElementById(this.titleId);
  storyElem = document.getElementById(this.storyId);
  storyContainerElem = document.getElementById(this.storyContainerId);

  init() {
    this.storyInputElem.addEventListener('keydown', (ev) => {
      if (ev.key != 'Enter' && ev.key != ' ') return;
    
      const word = this.storyInputElem.value.trim().split(' ')[0];
      ws.send(word);
      stateMachine.update({userHasVoted: true});
    });

    this.endStoryBtn.onclick = () => {
      if (stateMachine.state.voteType === 1) {
        ws.send("END TITLE");
      } else if (stateMachine.state.voteType === 2) {
        ws.send("END STORY");
      }
      stateMachine.update({userHasVoted: true});
    }
  }

  showTitleInputs() {
    this.storyInputElem.remove();
    this.endStoryBtn.remove();

    this.titleElem.insertBefore(this.storyInputElem, null);
    this.storyContainerElem.insertBefore(this.endStoryBtn, null);
    this.endStoryBtn.value = "END TITLE";
  }

  showTextInputs() {
    this.storyInputElem.remove();
    this.endStoryBtn.remove();

    this.storyElem.insertBefore(this.storyInputElem, null);
    this.storyContainerElem.insertBefore(this.endStoryBtn, null);
    this.endStoryBtn.value = "END STORY";
  }

  hideInputs() {
    this.storyInputElem.remove();
    this.endStoryBtn.remove();
  }

  showVotesTab() {
    const votesElem = document.getElementById(this.votesTabId);
    votesElem.style.display = 'block';
  }

  hideVotesTab() {
    const votesElem = document.getElementById(this.votesTabId);
    votesElem.style.display = 'none';
  }

  updateStoryAndTitle(/** @type {string} */title, /** @type {string} */text) {
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

    const votesTimerElem = document.getElementById(this.votesTimerId);

    const maxWidth = votesTimerElem.parentElement.clientWidth;
    const updateVoteTimerInterval = setInterval(() => {
      const newWidth = maxWidth - maxWidth * (Date.now() - state.voteStartTimestamp) / 5000;
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
    clearInterval(stateMachine.state.updateVoteTimerInterval);

    stateMachine.update({ updateVoteTimerInterval: null }); 
  }
}

const uiUpdator = new UIUpdator();
uiUpdator.init();