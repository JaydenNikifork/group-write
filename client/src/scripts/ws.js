import { env } from "../../config/config";
import { stateMachine } from "./state";
import { toWebsocketUrl } from "./utils";
import { api } from "./api";

class WS {
  setupWebsocketUrl = toWebsocketUrl(`${env.baseUrl}/ws`);

  /**
   * @type {WebSocket}
   */
  ws;

  constructor() {
    // this is trash, please change this at some point
    api.startSession().finally(() => {
      this.ws = new WebSocket(this.setupWebsocketUrl);
      this.ws.onmessage = this.onmessage;
      this.ws.onopen = this.onopen;
      this.ws.onclose = this.onclose;
    });
  }

  onopen = (ev) => {
    stateMachine.update({ isConnected: true });
  }

  onclose = (ev) => {
    stateMachine.update({ isConnected: false });
  }
  
  onmessage = (ev) => {
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

  sendVote(/** @type {string} */ word) {
    this.ws.send(word);
  }
}

export const ws = new WS();