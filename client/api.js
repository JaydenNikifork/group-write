const startSessionUrl = `${env.baseUrl}/start-session`;
const getCurrentStateUrl = `${env.baseUrl}/get-current-state`;
const getNumUsersUrl = `${env.baseUrl}/get-num-users`;
const getStoriesUrl = `${env.baseUrl}/get-stories`;
const getStoryByIdUrl = (id) => `${env.baseUrl}/get-story-by-id?id=${id.toString()}`;


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
   * @param {number} id
   * @returns {Promise<Story>}
   */
  async getStoryById(id) {
    const res = await fetch(getStoryByIdUrl(id));
    const json = await res.json();
    const story = json.data;

    return story;
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

  async startSession() {
    await fetch(startSessionUrl);
  }
}

const api = new API();

