/**
 * 
 * @param {Story} story 
 */
function insertStoryElem(story) {
  const chipElem = document.createElement('div');
  chipElem.className = "story-chip";
  const redirectUrl = new URL(window.location.href);
  redirectUrl.pathname = redirectUrl.pathname.slice(0, redirectUrl.pathname.lastIndexOf('/'));
  if (story.id !== -1) {
    const urlParams = new URLSearchParams();
    urlParams.append('id', story.id.toString());
    redirectUrl.pathname += '/story.html';
    redirectUrl.search = urlParams.toString();
  } else {
    redirectUrl.pathname += '/index.html';
  }
  chipElem.onclick = () => {
    window.location.href = redirectUrl.href;
  }

  const titleElem = document.createElement('h2');
  titleElem.className = "story-chip-title";
  let displayTitle = story.title;
  if (displayTitle === "") displayTitle = "Untitled Story";
  titleElem.textContent = displayTitle;
  chipElem.appendChild(titleElem);

  const textElem = document.createElement('p');
  textElem.className = "story-chip-text";
  let displayText = story.text.slice(0, 100); // 100 is just a random value really
  if (displayText.length < story.text.length) displayText += '...';
  textElem.textContent = displayText;
  chipElem.appendChild(textElem);

  const timeElem = document.createElement('p');
  timeElem.className = "story-chip-time";
  timeElem.textContent = `Created on ${new Date(story.timestamp).toDateString()}`;
  if (story.timestamp === 0) timeElem.textContent = "Work in progress"
  chipElem.appendChild(timeElem);
  
  const storyGrid = document.getElementById('stories-grid');
  storyGrid.appendChild(chipElem);
}

async function init() {
  const currentStory = {
    id: -1,
    title: "Current Story",
    text: "",
    timestamp: 0
  }
  insertStoryElem(currentStory);
  const stories = await api.getStories();
  stories.forEach(story => {
    insertStoryElem(story);
  });
}

init();