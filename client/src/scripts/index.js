import { state, stateMachine } from "./state";
import { stateTransitionHandler, uiUpdator } from "./ui-updators";
import '../static/index.css';

stateMachine.init(
  state,
  [],
  stateTransitionHandler
);
uiUpdator.init();
stateMachine.resyncState();