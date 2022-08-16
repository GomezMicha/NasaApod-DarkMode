"use strict";

// Global Variables
const loader = document.querySelector(".loader");
const themeSwitch = document.getElementById("theme-switch");
const defaultNav = document.getElementById("default-nav");
const favoritesNav = document.getElementById("favorites-nav");
const imagesCont = document.getElementById("nasa-images-cont");
const imageCount = 3;
const apiKey = "DEMO_KEY";
const apiUrl = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&count=${imageCount}`;
const addedToFavorites = document.querySelector(".added-to-favorites");

// Check if stored data in local storage if not set empty object.
let favorites = localStorage.getItem("favorites")
  ? JSON.parse(localStorage.getItem("favorites"))
  : {};

// Get Nasa Images
async function getNasaImages() {
  // Show loader
  loader.classList.remove("hidden");
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    // Save data in local storage and update DOM.
    localStorage.setItem("nasaImages", JSON.stringify(data));
    updateDom(data, defaultNav, favoritesNav, false);
  } catch (error) {
    console.log(error);
  }
}

// Helper function to show cards.
function showContent() {
  // Scroll behavior to stay top when loading images.
  window.scrollTo({ top: 0, behavior: "instant" });
  loader.classList.remove("hidden");
}

// Create card for each Astronomy Picture of the Day.
function createCard(apodArray, bool) {
  imagesCont.textContent = "";
  apodArray.forEach((item) => {
    // ---- Card Element ----------------------->
    const card = document.createElement("div");
    card.classList.add("card");
    // Hyperlink <a> tag.
    const link = document.createElement("a");
    // Render Url depending on Apod media type
    link.href = item.media_type === "video" ? item.url : item.hdurl;
    link.title = "View Full Image";
    link.target = "_blank";
    // Image <img> tag.
    const img = document.createElement("img");
    img.classList.add("card-image");
    img.src = item.url;
    img.alt = "Astronomy Picture of the day";
    imagesCont.loading = "lazy";
    // Video Icon
    const videoIcon = document.createElement("i");
    videoIcon.classList.add("bi", "bi-play-circle-fill");

    // ---- Card Body ----------------------->
    // Div
    const cardBody = document.createElement("div");
    cardBody.classList.add("card-body");
    // Card Title
    const cardTitle = document.createElement("h3");
    cardTitle.classList.add("card-title");
    cardTitle.textContent = item.title;
    // Card Text
    const cardText = document.createElement("p");
    cardText.classList.add("card-text");
    cardText.textContent = item.explanation;
    // Card Footer
    const cardFooter = document.createElement("footer");
    cardFooter.classList.add("card-footer");
    // Text muted
    const textMuted = document.createElement("small");
    textMuted.classList.add("text-muted");
    textMuted.innerHTML = ` 
        <strong>${item.date}</strong>
        <span>${item.copyright === undefined ? "" : item.copyright}</span>`;
    // Add Favorites
    const addFavorites = document.createElement("div");
    addFavorites.classList.add("add-favorites");
    addFavorites.setAttribute(
      "title",
      `${bool ? "Remove Favorite" : "Add to Favorites"}`
    );

    // ---- Clickable ----------------------->
    // Add / Remove Favorite Apod
    const clickable = bool
      ? removeFavorite(item.url)
      : addFavorite(item.url, item);

    // ---- Append Elements ----------------------->
    addFavorites.appendChild(clickable);
    cardFooter.append(textMuted, addFavorites);
    cardBody.append(cardTitle, cardText, cardFooter);
    // Append element to link depending on Apod media type
    item.media_type === "video"
      ? link.appendChild(videoIcon)
      : link.appendChild(img);
    card.append(link, cardBody);
    imagesCont.append(card);
  });
}

// Add favorite Apod
function addFavorite(url, item) {
  const clickable = document.createElement("i");
  clickable.classList.add("bi", "bi-plus-circle-fill", "clickable");
  clickable.addEventListener("click", () => {
    if (!favorites[url]) {
      favorites[url] = item;
      localStorage.setItem("favorites", JSON.stringify(favorites));
      showAddedToFavorites();
    }
  });
  return clickable;
}

// Remove favorite Apod
function removeFavorite(url) {
  const clickable = document.createElement("i");
  clickable.classList.add("bi", "bi-dash-circle-fill", "clickable");
  clickable.addEventListener("click", () => {
    delete favorites[url];
    localStorage.setItem("favorites", JSON.stringify(favorites));
    updateDom(Object.values(favorites), favoritesNav, defaultNav, true);
  });
  return clickable;
}

// Show confirmation when adding to favorites.
function showAddedToFavorites() {
  addedToFavorites.classList.remove("hidden");
  setTimeout(() => {
    addedToFavorites.classList.add("hidden");
  }, 2500);
}

// Helper function to Update DOM either with fetched data or favorites data.
function updateDom(apodArray, hideNav, showNav, bool) {
  showContent();
  createCard(apodArray, bool);
  // Hide and show appropriate navigation option.
  hideNav.classList.remove("hidden");
  showNav.classList.add("hidden");
  // Hide loader once images have loaded
  setTimeout(() => {
    loader.classList.add("hidden");
  }, 500);
}

// Dark Theme
function darkTheme() {
  document.documentElement.setAttribute("data-theme", "dark");
  localStorage.setItem("theme", "dark");
}

// Light Theme
function lightTheme() {
  document.documentElement.removeAttribute("data-theme", "dark");
  localStorage.setItem("theme", "light");
}

function setOnload() {
  localStorage.getItem("theme") === "dark"
    ? ((themeSwitch.checked = true), darkTheme())
    : ((themeSwitch.checked = false), lightTheme());
}

// Event Listeners
// Theme Switch
themeSwitch.addEventListener("change", (event) => {
  event.target.checked ? darkTheme() : lightTheme();
});

// Update DOM based on favorites or home selection.
document.getElementById("favorite-images").addEventListener("click", () => {
  updateDom(Object.values(favorites), favoritesNav, defaultNav, true);
});

document.getElementById("home").addEventListener("click", () => {
  const apodArray = JSON.parse(localStorage.getItem("nasaImages"));
  updateDom(apodArray, defaultNav, favoritesNav, false);
});

// On load
// Check for current theme and set it
setOnload();
getNasaImages();
