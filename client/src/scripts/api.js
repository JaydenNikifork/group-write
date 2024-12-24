import { env } from "../../config/config";
import { getSessionId } from "./utils";

/**
 * @typedef {Object} Story
 * @property {number} id
 * @property {string} title
 * @property {string} text
 * @property {number} timestamp
 */

/**
 * @typedef {Record<string, number>} Votes
 */

class API {
  startSessionUrl = `${env.baseUrl}/start-session`;
  getCurrentStateUrl = `${env.baseUrl}/get-current-state`;
  getNumUsersUrl = `${env.baseUrl}/get-num-users`;
  getStoriesUrl = `${env.baseUrl}/get-stories`;
  getStoryByIdUrl = (id) => `${env.baseUrl}/get-story-by-id?id=${id.toString()}`;

  ResponseCodes = {
    VOTE_UPDATE: 0,
    VOTE_RESULT: 1
  }

  isSessionValid = false;
  startingSession = false;

  async startSession() {
    if (this.startingSession) return;
    this.startingSession = true;

    if (!this.isSessionValid) {
      const sessionId = getSessionId();
      if (sessionId === undefined) {
        await fetch(this.startSessionUrl, {
          credentials: 'include'
        });
        this.isSessionValid = true;
      }
    }

    this.startingSession = false;
  }

  /**
   * @private
   * @param  {Parameters<fetch>} params 
   */
  async myFetch(...params) {
    const res = await fetch(params[0], {
      credentials: 'include',
      ...params[1]
    });
    if (res.status === 401) {
      this.isSessionValid = false;
      await this.startSession();
      return await fetch(params[0], {
        credentials: 'include',
        ...params[1]
      });
    } else {
      return res;
    }
  }
  
  /**
   * 
   * @returns {Promise<Story[]>}
   */
  async getStories() {
    await this.startSession();
    const res = await this.myFetch(this.getStoriesUrl);
    const json = await res.json();
    const stories = json.data;

    return stories;
  }

  /**
   * @param {number} id
   * @returns {Promise<Story>}
   */
  async getStoryById(id) {
    await this.startSession();
    const res = await this.myFetch(this.getStoryByIdUrl(id));
    const json = await res.json();
    const story = json.data;

    return story;
  }

  /**
   * 
   * @returns {Promise<Story>}
   */
  async getCurrentState() {
    await this.startSession();
    const res = await this.myFetch(this.getCurrentStateUrl);
    const currentState = await res.json();
    return currentState;
  }
}

export const api = new API();
