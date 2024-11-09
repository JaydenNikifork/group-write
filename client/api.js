import { stateMachine } from ".";
import * as UIUpdator from "./ui-updators";
import * as Config from './config';

const getCurrentStoryUrl = `${Config.baseUrl}/get-current-story`;
const getNumUsersUrl = `${Config.baseUrl}/get-num-users`;
const getStoriesUrl = `${Config.baseUrl}/get-stories`;

const ResponseCodes = {
  VOTE_UPDATE: 0,
  VOTE_RESULT: 1
}

/**
 * @typedef {Object} Story
 * @property {string} title
 * @property {string} text
 * @property {number} timestamp
 */

/**
 * 
 * @returns {Promise<Story[]>}
 */
export async function getStories() {
  const res = await fetch(getStoriesUrl);
  const json = await res.json();
  const stories = json.data;

  return stories;
}

/**
 * 
 * @returns {Promise<Story>}
 */
export async function getCurrentStory() {
  const res = await fetch(getCurrentStoryUrl);
  const json = await res.json();
  const currentStory = json.data;

  return currentStory;
}

/**
 * 
 * @returns {Promise<number>}
 */
export async function getNumUsers() {
  const res = await fetch(getNumUsersUrl);
  const json = await res.json();
  const numUsers = json.data.numUsers;

  return numUsers;
}

export function setupWebsocket() {
  const ws = new WebSocket(Config.websocketUrl);
  
  ws.onmessage = (ev) => {
    console.log("Message from server:", ev.data);

    const parsedData = JSON.parse(ev.data);
    const code = parsedData.code;
    const data = parsedData.data;

    switch (code) {
      case ResponseCodes.VOTE_UPDATE:
        stateMachine.update({
          voteMsRemaining: data.msRemaining,
          currentVoteUpdateTimestamp: Date.now()
        });
        UIUpdator.updateVotesElem(stateMachine);
        break;
      case ResponseCodes.VOTE_RESULT:
        stateMachine.transition('voteEnding');
        break;
      default:
        throw new Error(`Invalid response code: ${code}`);
    }
  };

}