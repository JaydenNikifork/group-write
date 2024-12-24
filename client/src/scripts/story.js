import { state, stateMachine } from "./state";
import { stateTransitionHandler, uiUpdator } from "./ui-updators";
import { api } from "./api";
import '../static/index.css';

async function init() {
  const urlParmas = new URLSearchParams(window.location.search);
  const id = Number(urlParmas.get('id'));
  const story = await api.getStoryById(id);
  stateMachine.update({
    voteType: 0,
    title: story.title,
    text: story.text
  });
}

stateMachine.init(
  state,
  [],
  stateTransitionHandler
);
uiUpdator.init();

init();