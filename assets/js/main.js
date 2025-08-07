import Fuse from "./fuse.js";

async function searchHandler() {
  const searchInput = document.querySelector("#searchInput");
  const resultsPanel = document.querySelector("#results");

  if (!searchInput || !resultsPanel) return;

  const clearSearch = () => {
    searchInput.value = "";
    resultsPanel.innerHTML = "";
    resultsPanel.hidden = true;
  };
  try {
    const searchUrl = searchInput.dataset.searchUrl;
    const response = await fetch(searchUrl);

    if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);

    const store = await response.json();

    const fuse = new Fuse(store, {
      keys: [
        { name: "title", weight: 0.4 },
        { name: "tags", weight: 0.3 },
        { name: "description", weight: 0.1 },
        { name: "excerpt", weight: 0.1 },
        { name: "category", weight: 0.1 },
        { name: "content", weight: 0.1 },
      ],
      threshold: 0.3,
      includeMatches: true,
      useExtendedSearch: true,
      minMatchCharLength: 2,
    });

    const displayResults = (results, query) => {
      if (query.length < 1) return clearSearch();

      resultsPanel.innerHTML = results.length
        ? results
            .map((res) => {
              const item = res.item;
              return `<li><a href="${item.url}">${item.title}</a><p>${item.content || item.description}</p></li>`;
            })
            .join("")
        : `<li>No results found for: "${query}"</li>`;

      resultsPanel.hidden = false;
    };

    const handleSearch = (event) => {
      event?.preventDefault();
      const query = searchInput.value.trim();
      const results = query.length >= 2 ? fuse.search(query) : [];
      displayResults(results, query);
    };

    const debounce = (fn, wait = 300) => {
      let t;
      return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), wait);
      };
    };

    // Bind listeners
    searchInput.addEventListener("input", debounce(handleSearch, 300));

    // Prefill from URL
    const params = new URLSearchParams(location.search);
    const initialQuery = params.get("query");
    if (initialQuery) {
      searchInput.value = initialQuery;
      setTimeout(() => handleSearch(new Event("submit")), 100);
    }
  } catch (err) {
    console.error("Search error:", err);
    resultsPanel.hidden = false;
    resultsPanel.innerHTML = `<li>Search is currently unavailable</li>`;
  }

  document.getElementById('formSearch').addEventListener("submit", (e)=> e.preventDefault())
}

searchHandler()