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
  waitingForServerState = false;
  resolveServerStateUpdate = null;

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

  /**
   * @private
   */
  applyUpdate(/** @type {Partial<State>} */stateUpdate) {
    if (stateUpdate.stateId !== undefined) {
      if (this.state.stateId === null || this.state.stateId + 1 < stateUpdate.stateId) {
        // somehow request most recent state
        api.getCurrentState().then((currentServerState) => {
          this.forceUpdate(currentServerState)
        });

        this.waitingForServerState = true;
        this.update(stateUpdate);   // just call it again so it throws it in the queue
      } else if (this.state.stateId + 1 === stateUpdate.stateId) {
        for (const stateKey of Object.keys(stateUpdate)) {
          this.state[stateKey] = stateUpdate[stateKey];
        }
        this.handler(stateUpdate);
      } // do nothing otherwise, it means we have a redundant update 
    } else {
      for (const stateKey of Object.keys(stateUpdate)) {
        this.state[stateKey] = stateUpdate[stateKey];
      }
      this.handler(stateUpdate);
    }
  }

  // if stateUpdate contains no stateId, then we can assume it doesn't conflict with server state updates
  update(/** @type {Partial<State>} */stateUpdate) {
    console.log("State update:", stateUpdate)
    if (stateUpdate.stateId !== undefined && this.waitingForServerState) {
      this.stateUpdateQueue.push(stateUpdate);
      // we are the first to wait, so we take on the responsibility of doing the update queue
      if (this.resolveServerStateUpdate === null) {
        const serverStateUpdatePromise = new Promise((resolve) => {
          this.resolveServerStateUpdate = resolve;
        });
        serverStateUpdatePromise.then(() => {
          for (const stateUpdate of this.stateUpdateQueue) {
            this.applyUpdate(stateUpdate);
          }
          this.stateUpdateQueue = [];
          this.resolveServerStateUpdate = null;
          this.waitingForServerState = false;
        });
      }
    } else {
      this.applyUpdate(stateUpdate);
    }
  }

  forceUpdate(/** @type {Partial<State>} */stateUpdate) {
    for (const stateKey of Object.keys(stateUpdate)) {
      this.state[stateKey] = stateUpdate[stateKey];
    }
    this.handler(stateUpdate);
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

const stateMachine = new StateMachine();