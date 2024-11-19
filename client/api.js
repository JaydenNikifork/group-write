const getCurrentStateUrl = `${env.baseUrl}/get-current-state`;
const getNumUsersUrl = `${env.baseUrl}/get-num-users`;
const getStoriesUrl = `${env.baseUrl}/get-stories`;


/**
 * @typedef {Object} Story
 * @property {string} title
 * @property {string} text
 * @property {number} timestamp
 */

/**
 * @typedef {Record<string, number>} Votes
 */

class API {
  ResponseCodes = {
    VOTE_UPDATE: 0,
    VOTE_RESULT: 1
  }
  
  /**
   * 
   * @returns {Promise<Story[]>}
   */
  async getStories() {
    const res = await fetch(getStoriesUrl);
    const json = await res.json();
    const stories = json.data;

    return stories;
  }

  /**
   * 
   * @returns {Promise<Story>}
   */
  async getCurrentState() {
    const res = await fetch(getCurrentStateUrl);
    const currentState = await res.json();

    return currentState;
  }
}

const api = new API();

const setupWebsocketUrl = toWebsocketUrl(`${env.baseUrl}/ws`);
const ws = new WebSocket(setupWebsocketUrl);

ws.onmessage = (ev) => {
  console.log("Message from server:", ev.data);

  const serverStateDiff = JSON.parse(ev.data);
  const stateUpdate = {};
  Object.assign(stateUpdate, serverStateDiff);
  if (serverStateDiff.title !== undefined) {
    if (serverStateDiff.title === '') stateUpdate.title = '';
    else stateUpdate.title = stateMachine.state.title + serverStateDiff.title;
  }
  if (serverStateDiff.text !== undefined) {
    if (serverStateDiff.text === '') stateUpdate.text = '';
    else stateUpdate.text = stateMachine.state.text + serverStateDiff.text;
  }
  if (serverStateDiff.votes !== undefined) {
    if (Object.keys(serverStateDiff.votes).length === 0) stateUpdate.votes = {};
    else {
      Object.assign(stateUpdate.votes, stateMachine.state.votes);
      Object.assign(stateUpdate.votes, serverStateDiff.votes);
    }
  }
  stateMachine.update(stateUpdate);
};