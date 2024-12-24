import { api } from "./api";

/**
 * @typedef {Record<string, any>} State
 */

/**
 * @typedef {Object} Transition
 * @property {Partial<State>} inputState
 * @property {string} condition
 * @property {Partial<State>} outputState
 */

class StateMachine {
  /** 
   * @public
   * @type {State}
   */
  state;
  /**
   * @private
   * @type {Transition[]}
   */
  transitions;
  /**
   * @private
   * @type {Function}
   */
  handler;
  /**
   * @private
   * @type {Partial<State>[]} 
   */
  stateUpdateQueue = [];
  applyingQueue = false;

  // currently unused but keeping it for now who knows
  transition(/** @type {string} */input) {
    let hasTransitioned = false;
    let stateDiff;
    for (const {inputState, condition, outputState} of this.transitions) {
      if (input !== condition) continue;

      let isCorrectState = true;
      for (const stateKey of Object.keys(inputState)) {
        if (this.state[stateKey] !== inputState[stateKey]) {
          isCorrectState = false;
          break;
        }
      }

      if (isCorrectState) {
        for (const stateKey of Object.keys(outputState)) {
          this.state[stateKey] = outputState[stateKey];
        }
        hasTransitioned = true;
        stateDiff = outputState;
        break;
      }
    }

    if (hasTransitioned) {
      this.handler(stateDiff);
    } else {
      throw new Error(`No applicable transition found!\nInput: ${input}\nState: ${JSON.stringify(this.state)}`);
    }
  }

  async resyncState() {
    const currentState = await api.getCurrentState();
    Object.assign(this.state, currentState);
    this.handler(currentState);
  }

  /**
   * @private
   * @param {Partial<State>} stateUpdate 
   */
  pushToQueue(stateUpdate) {
    this.stateUpdateQueue.push(stateUpdate);
  }

  /**
   * @private
   */
  applyQueue() {
    if (this.applyingQueue) return;
    this.applyingQueue = true;
    while (this.stateUpdateQueue.length > 0) {
      const stateUpdate = this.stateUpdateQueue[0];
      if (stateUpdate.stateId !== undefined && stateUpdate.stateId > this.state.stateId + 1) break;
      this.stateUpdateQueue.shift();
      if (stateUpdate.stateId !== undefined && stateUpdate.stateId < this.state.stateId + 1) continue;
      Object.assign(this.state, stateUpdate);
      this.handler(stateUpdate);
    }

    if (this.stateUpdateQueue.length > 0) { // this case means we missed a state update so we must resync
      this.resyncState().then(() => this.applyQueue());   // re-try applying the state update queue afterwards
    }
    this.applyingQueue = false;
  }

  /**
   * Applies a state update
   * @param {Partial<State>} stateUpdate 
   */
  update(stateUpdate) {
    this.pushToQueue(stateUpdate);
    this.applyQueue();
  }

  init(
    /** @type {State} */ state,
    /** @type {Transition[]} */ transitions,
    /** @type {Function} */ handler
  ) {
    this.state = state;
    this.transitions = transitions;
    this.handler = handler;
  }
}

/** @type {State} */
export const state = {
  stateId: null,
  voteType: 0,
  title: "",
  text: "",
  isVoteRunning: false,
  voteStartTimestamp: 0,
  votes: {},
  userHasVoted: false,
  updateVoteTimerInterval: null,
  numUsers: 0,
  isConnected: false
};

export const stateMachine = new StateMachine();