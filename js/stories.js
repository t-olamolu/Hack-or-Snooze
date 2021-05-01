"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

/**Checks through all stories to see if it's been favorited */
function isFavorite(story) {
  return currentUser.favorites.some(function (favorite) {
    return favorite.storyId === story.storyId;
  });
}
/**Returns the correct star (filled in vs empty) based on if it's a favorite */
function showStarHTML(story) {
  const starType = isFavorite(story) ? "fas" : "far";
  return `
      <span>
        <i class="${starType} fa-star"></i>
      </span>`;
}

function generateStoryMarkup(story, showDelete = false) {
  console.debug("generateStoryMarkup", story);
  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
      ${showDelete ? showDeleteButtonHTML() : ""}
      ${showStar ? showStarHTML(story) : ""}
        <a href="${story.url}" target="a_blank" class="story-link not">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

/* Adds a new story to list when user submits the form */

async function addNewStory(evt) {
  console.debug("addNewStory");
  evt.preventDefault();

  const author = $("#story-author").val();
  const title = $("#story-title").val();
  const url = $("#story-url").val();
  const username = currentUser.username;

  const newStory = await storyList.addStory(currentUser, {
    title,
    url,
    author,
    username,
  });
  const $story = generateStoryMarkup(newStory);
  $allStoriesList.prepend($story);
  $storyForm.hide();
  $storyForm.trigger("reset");
}

$storyForm.on("submit", addNewStory);

/* Allows user to favorite a story when star is clicked */

async function toggleFavStory(evt) {
  const $target = $(evt.target);
  const $closestLi = $target.closest("li");
  const storyId = $closestLi.attr("id");
  const story = storyList.stories.find(
    (favorite) => favorite.storyId === storyId
  );

  if ($target.hasClass("far")) {
    currentUser.favorites.push(story);
    $target.closest("i").addClass("fas");
    $target.closest("i").removeClass("far");
    addFavToAPI(storyId);
  } else {
    currentUser.favorites = _.remove(
      currentUser.favorites,
      (favorite) => favorite.storyId !== story.storyId
    );
    $target.closest("i").removeClass("fas");
    $target.closest("i").addClass("far");
    removeFavFromAPI(storyId);
  }
}

$("body").on("click", ".fa-star", toggleFavStory);

/*Adds Favorites to Page when favorites link is clicked*/

function addFavoritestoPage() {
  $favoritedStories.empty();

  if (currentUser.favorites.length === 0) {
    $favoritedStories.append("<h5>No favorites added yet!</h5>");
  } else {
    for (let story of currentUser.favorites) {
      const $story = generateStoryMarkup(story);
      $favoritedStories.append($story);
    }
  }

  $favoritedStories.show();
}

/*Updates in API a new favorite */

async function addFavToAPI(storyId) {
  const token = currentUser.loginToken;
  await axios({
    url: `${BASE_URL}/users/${currentUser.username}/favorites/${storyId}`,
    method: "POST",
    data: { token },
  });
}

/*Removes favorite in API  */
async function removeFavFromAPI(storyId) {
  const token = currentUser.loginToken;
  await axios({
    url: `${BASE_URL}/users/${currentUser.username}/favorites/${storyId}`,
    method: "DELETE",
    data: { token },
  });
}

/*Adds user's own stories to page */
function putOwnStoriesOnPage() {
  $ownStories.empty();

  if (currentUser.ownStories.length === 0) {
    $ownStories.append("<h5>No stories added by user yet!</h5>");
  } else {
    for (let story of currentUser.ownStories) {
      let $story = generateStoryMarkup(story, true);
      $ownStories.append($story);
    }
  }

  $ownStories.show();
}

/** Delete button HTML */
function showDeleteButtonHTML() {
  return `
  <span>
  <i class="far fa-trash-alt"></i>
  </span>
  `;
}

/**Delete A Story on click of trash icon */
async function removeStory(evt) {
  const $closestLi = $(evt.target).closest("li");
  const storyId = $closestLi.attr("id");

  await storyList.removeStoryFromAPI(storyId);

  putOwnStoriesOnPage();
}

$ownStories.on("click", ".fa-trash-alt", removeStory);
