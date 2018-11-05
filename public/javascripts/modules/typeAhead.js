import axios from "axios";
import dompurify from "dompurify";

function searchResultsHTML(stores) {
  return stores
    .map(store => {
      return `
      <a href="/stores/${store.slug}" class="search__result">
        <strong>${store.name}</strong>
      </a>
    `;
    })
    .join("");
}

function typeAhead(search) {
  if (!search) return;
  const searchInput = search.querySelector('input[name="search"]');
  const searchResults = search.querySelector(".search__results");

  searchInput.on("input", function() {
    //If there's no value, don't show anything!
    if (!this.value) {
      searchResults.style.display = "none";
      return;
    }
    //Otherwise, show the results
    searchResults.style.display = "block";
    searchResults.innerHTML = "";

    axios
      .get(`/api/search?q=${this.value}`)
      .then(res => {
        // Either show the data or display a default message
        searchResults.innerHTML = res.data.length
          ? dompurify.sanitize(searchResultsHTML(res.data))
          : dompurify.sanitize(
              `<div class="search__result">Sorry, <i>${
                this.value
              }</i> returned no search results.</div>`
            );
      })
      .catch(err => {
        console.error(err);
      });
  });

  //Handle keyboard inputs
  searchInput.on("keyup", function(e) {
    //If they aren't pressing up, down, or enter, ignore it.
    if (![38, 40, 13].includes(e.keyCode)) return;

    const activeClass = "search__result--active";
    const current = search.querySelector(`.${activeClass}`);
    const items = search.querySelectorAll(".search__result");
    let next;

    if (!items.length) return;
    if (e.keyCode === 40 && current) {
      //Handle the cycling and redirecting
      next = current.nextElementSibling || items[0];
    } else if (e.keyCode === 40) {
      next = items[0];
    } else if (e.keyCode === 38 && current) {
      next = current.previousElementSibling || items[items.length - 1];
    } else if (e.keyCode === 38) {
      next = items[items.length - 1];
    } else if (e.keyCode === 13 && current.href) {
      window.location = current.href;
      return;
    }

    //Highlight the selection
    if (current) current.classList.remove(activeClass);
    next.classList.add(activeClass);
  });
}

export default typeAhead;
