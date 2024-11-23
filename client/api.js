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
  
  async validateSession() {
    const sessionId = getSessionId();
    if (sessionId === undefined) return false;

    await 
  }
  
  /**
   * 
   * @returns {Promise<Story[]>}
   */
  async getStories() {
    const res = await fetch(this.getStoriesUrl);
    const json = await res.json();
    const stories = json.data;

    return stories;
  }

  /**
   * @param {number} id
   * @returns {Promise<Story>}
   */
  async getStoryById(id) {
    const res = await fetch(this.getStoryByIdUrl(id));
    const json = await res.json();
    const story = json.data;

    return story;
  }

  /**
   * 
   * @returns {Promise<Story>}
   */
  async getCurrentState() {
    const res = await fetch(this.getCurrentStateUrl);
    const currentState = await res.json();

    return currentState;
  }

  async startSession() {
    await fetch(this.startSessionUrl);
  }
}

const api = new API();
