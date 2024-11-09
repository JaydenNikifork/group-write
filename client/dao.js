import * as API from './api';
import { env } from './config/config';
import { toWebsocketUrl } from './utils';

/** @import { Story, Votes } from './api.js' */

/**
 * @abstract
 */
export class IDao {
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


export class APIDao extends IDao {
  /**
   * @private
   * @type {WebSocket}
   */
  ws;

  constructor() {
    super();

    const setupWebsocketUrl = toWebsocketUrl(`${env.baseUrl}/ws`);
    this.ws = new WebSocket(setupWebsocketUrl);
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

export class TestDao extends IDao {

  /**
   * @private
   * @type {Story[]}
   */
  stories = [{
    title: 'story 1',
    text: 'Hello world! This is story 1!',
    timestamp: 12345
  }, {
    title: 'story 2',
    text: 'Hello world! This is story 2!',
    timestamp: 34567
  }, {
    title: 'story 3',
    text: 'Hello world! This is story 3!',
    timestamp: 67890
  }];

  /**
   * @private
   * @type {Story}
   */
  currentStory = {
    title: '',
    text: '',
    timestamp: 0
  };

  /**
   * @private
   * @type {number}
   */
  numUsers = 69;

  /**
   * @private
   * @type {Votes}
   */
  votes = {};

  getStories() {
    return Promise.resolve(this.stories);
  }

  getCurrentStory() {
    return Promise.resolve(this.currentStory);
  }

  getNumUsers() {
    return Promise.resolve(this.numUsers);
  }
  
  sendVote(word) {
    this.votes[word]++;
  }
}