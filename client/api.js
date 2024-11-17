const getCurrentStoryUrl = `${env.baseUrl}/get-current-story`;
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
  async getCurrentStory() {
    const res = await fetch(getCurrentStoryUrl);
    const json = await res.json();
    const currentStory = json.data;

    return currentStory;
  }

  /**
   * 
   * @returns {Promise<number>}
   */
  async getNumUsers() {
    const res = await fetch(getNumUsersUrl);
    const json = await res.json();
    const numUsers = json.data.numUsers;

    return numUsers;
  }
}

const api = new API();