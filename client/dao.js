import * as API from './api';

/** @import { Story } from './api.js' */

/**
 * @abstract
 */
class IDao {
  /**
   * @private
   */
  notOverriddenError = new Error(`This method has not been overriden by the child class!`);


  /**
   * @abstract
   * @returns {Promise<Story[]>}
   */
  getStories() { throw this.notOverriddenError; }

  /**
   * @abstract
   * @returns {Promise<Story>}
   */
  getCurrentStory() { throw this.notOverriddenError; }
  
  /**
   * @abstract
   * @returns {Promise<number>}
   */
  getNumUsers() { throw this.notOverriddenError; }

  /**
   * @abstract
   * @param {string} word
   * @returns {void}
   */
  sendVote(word) { throw this.notOverriddenError; }
}


class APIDao extends IDao {
  /**
   * @private
   * @type {WebSocket}
   */
  ws;
  
  constructor() {
    super();
    this.ws = new WebSocket(API.websocketUrl);
  }

  getStories() {
    return API.getStories();
  }

  getCurrentStory() {
    return API.getCurrentStory();
  }

  getNumUsers() {
    return API.getNumUsers();
  }
  
  sendVote(word) {
    this.ws.send(word);
  }
}
