api.getCurrentState().then((currentServerState) => {
  stateMachine.forceUpdate(currentServerState)
});
