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


class apiDao extends IDao {
  /**
   * @private
   * @type {WebSocket}
   */
  ws;

  constructor() {
    super();

    const setupWebsocketUrl = toWebsocketUrl(`${env.baseUrl}/ws`);
    this.ws = new WebSocket(setupWebsocketUrl);

    
    this.ws.onmessage = (ev) => {
      console.log("Message from server:", ev.data);

      const parsedData = JSON.parse(ev.data);
      const code = parsedData.code;
      const data = parsedData.data;

      switch (code) {
        case api.ResponseCodes.VOTE_UPDATE:
          stateMachine.update({
            voteMsRemaining: data.msRemaining,
            currentVoteUpdateTimestamp: Date.now(),
            votes: data.votes
          });
          stateMachine.transition('voteStarting');
          break;
        case api.ResponseCodes.VOTE_RESULT:
          stateMachine.transition('voteEnding');
          if (data === "END STORY") {
            stateMachine.transition('storyEnding');
          } else if (data === "END TITLE") {
            stateMachine.transition('titleEnding');
          }
          break;
        default:
          throw new Error(`Invalid response code: ${code}`);
      }
    };
  }

  getStories() {
    return api.getStories();
  }

  getCurrentStory() {
    return api.getCurrentStory();
  }

  getNumUsers() {
    return api.getNumUsers();
  }
  
  sendVote(word) {
    this.ws.send(word);
  }
}

class TestDao extends IDao {

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

// switch (env.daoType) {
  // case 'api':
    // env.dao = new apiDao();
    // break;
  // case 'test':
    // env.dao = new TestDao();
    // break;
  // default:
    // throw new Error(`Config attempted to load invalid dao type: ${env.daoType}!`);
// }