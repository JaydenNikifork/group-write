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

init();