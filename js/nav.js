"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  console.debug("navAllStories", evt);
  hidePageComponents();
  putStoriesOnPage();
}

$body.on("click", "#nav-all", navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show();
  $navLogin.hide();
  $navSubmit.show();
  $navFavorites.show();
  $navStories.show();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}

/*Show story form when 'submit' button is clicked*/
function showNavSubmitForm() {
  $storyForm.toggle();
}

$navSubmit.on("click", showNavSubmitForm);

/*Show favorites page when 'favorites' button is clicked */
function showFavorites() {
  hidePageComponents();
  addFavoritestoPage();
}

$navFavorites.on("click", showFavorites);

/**Shows current users own posts when 'my stories' button is clicked */
function showMyStories() {
  hidePageComponents();
  putOwnStoriesOnPage();
}

$navStories.on("click", showMyStories);
