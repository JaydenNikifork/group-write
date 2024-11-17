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

  update(/** @type {Partial<State>} */stateUpdate) {
    for (const stateKey of Object.keys(stateUpdate)) {
      this.state[stateKey] = stateUpdate[stateKey];
    }
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