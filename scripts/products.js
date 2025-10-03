let apiUrl = "https://gutendex.com/books/?topic=children";

const categoryContainer = document.getElementById("category-filters");
const booksGrid = document.getElementById("books-grid");
const loadMoreBtn = document.getElementById("load-more-btn");
const loadMoreContainer = document.getElementById("load-more-container");
const pageLoader = document.getElementById("page-loader");

let allBooks = []; // accumulated books fetched so far
let categories = [];
let nextUrl = null; // pagination next
// client-side display pagination
let displayedCount = 0;
const DISPLAY_STEP = 10; // show 10 items per click
let isLoadMoreAction = false;

// hide load more container by default until we know there's a next page
// if (loadMoreContainer) {
//   loadMoreContainer.classList.add("d-none");
// }
// // hide page loader by default
// if (pageLoader) {
//   pageLoader.classList.add("d-none");
// }

function createPill(name, active = false) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = `btn btn-outline-secondary category-pill ${
    active ? "active" : ""
  }`;
  // build accessible label + count badge (count filled by renderCategories)
  btn.dataset.category = name;
  const label = document.createElement("span");
  label.className = "category-label me-1";
  label.textContent = name;
  const badge = document.createElement("span");
  badge.className = "badge bg-white text-dark category-count ms-1";
  badge.textContent = ""; // populated in renderCategories
  btn.append(label, badge);
  btn.setAttribute("aria-pressed", active ? "true" : "false");
  btn.title = name;
  return btn;
}

function renderCategories(list, activeCategory = "All Categories") {
  // build pills once using a fragment for better performance
  categoryContainer.innerHTML = "";
  const frag = document.createDocumentFragment();

  // helper to compute count for a category
  const countFor = (cat) => {
    if (cat === "All Categories") return allBooks.length || 0;
    return allBooks.reduce((acc, b) => {
      if (b.bookshelves && b.bookshelves.includes(cat)) return acc + 1;
      return acc;
    }, 0);
  };

  // Add "All Categories" pill with count
  const allPill = createPill(
    "All Categories",
    activeCategory === "All Categories"
  );
  allPill.querySelector(".category-count").textContent =
    countFor("All Categories");
  allPill.title = `All categories — ${
    allPill.querySelector(".category-count").textContent
  } books`;
  frag.appendChild(allPill);

  list.forEach((cat) => {
    const pill = createPill(cat, activeCategory === cat);
    pill.querySelector(".category-count").textContent = countFor(cat);
    pill.title = `${cat} — ${
      pill.querySelector(".category-count").textContent
    } books`;
    frag.appendChild(pill);
  });

  categoryContainer.appendChild(frag);
}

// Attach category click handler once (event delegation)
function initCategoryListener() {
  if (!categoryContainer) return;
  const existing = categoryContainer._hasListener;
  if (existing) return;

  categoryContainer.addEventListener("click", (e) => {
    const btn = e.target.closest("button.category-pill");
    if (!btn) return;

    // toggle active state
    Array.from(
      categoryContainer.querySelectorAll("button.category-pill")
    ).forEach((p) => p.classList.remove("active"));
    btn.classList.add("active");

    const category = btn.dataset.category;
    if (category === "All Categories") {
      // show all accumulated books
      renderBooks(allBooks);
    } else {
      const filtered = allBooks.filter(
        (b) => b.bookshelves && b.bookshelves.includes(category)
      );
      renderBooks(filtered);
    }
    // ensure Load more is only visible for the All Categories view
    if (loadMoreContainer) {
      if (category === "All Categories" && nextUrl) {
        loadMoreContainer.classList.remove("d-none");
        loadMoreBtn.disabled = false;
        loadMoreBtn.textContent = "Load more";
      } else {
        loadMoreContainer.classList.add("d-none");
      }
    } else {
      if (category !== "All Categories") {
        loadMoreBtn.disabled = true;
      }
    }
  });

  // mark as initialized so we don't attach again
  categoryContainer._hasListener = true;
}

function renderBooks(list, options = { append: false }) {
  if (!list || list.length === 0) {
    if (!options.append) {
      booksGrid.innerHTML =
        '<div class="col-12"><p class="small text-muted">No books found for this category.</p></div>';
    }
    return;
  }

  // create fragment to minimize reflow
  const frag = document.createDocumentFragment();

  list.forEach((book) => {
    const col = document.createElement("div");
    col.className = "col-12 col-sm-6 col-md-3 col-lg-3 mb-3";

    // Bootstrap card
    const card = document.createElement("div");
    card.className = "card h-100 book-card shadow-sm";

    const img = document.createElement("img");
    const coverUrl =
      (book.formats &&
        (book.formats["image/jpeg"] || book.formats["image/png"])) ||
      "";
    const placeholder =
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200"><rect width="100%" height="100%" fill="%23f6f6f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23c0c0c0" font-size="16">No cover</text></svg>';
    img.src = coverUrl || placeholder;
    img.onerror = () => (img.src = placeholder);
    img.loading = "lazy";
    img.className = "card-img-top book-cover";
    // improve clarity: don't block render, hint browser to decode async and prioritize
    try {
      img.decoding = "async";
      img.fetchPriority = "high";
    } catch (e) {}

    const cardBody = document.createElement("div");
    cardBody.className = "card-body d-flex flex-column";

    const titleEl = document.createElement("h5");
    titleEl.className = "card-title text-truncate";
    titleEl.textContent = book.title || "Untitled";

    const authorEl = document.createElement("p");
    authorEl.className = "card-text small text-muted text-truncate mb-2";
    const firstAuthor =
      (book.authors && book.authors[0] && book.authors[0].name) ||
      "Unknown author";
    authorEl.textContent = firstAuthor;

    cardBody.append(titleEl, authorEl);

    const cardFooter = document.createElement("div");
    cardFooter.className =
      "card-footer bg-transparent border-0 d-flex justify-content-end align-items-center";

    const detailsBtn = document.createElement("button");
    detailsBtn.className = "btn btn-sm btn-outline-primary me-2";
    detailsBtn.innerHTML = '<i class="bi bi-eye"></i>';
    detailsBtn.addEventListener("click", () => showBookDetails(book));

    const addBtn = document.createElement("button");
    addBtn.className = "btn btn-sm btn-danger";
    addBtn.innerHTML = '<i class="bi bi-cart3"></i> Add';
    addBtn.addEventListener("click", () => {
      // visual feedback and animation for add-to-cart
      addBtn.classList.add("disabled", "added");
      addBtn.textContent = "Added";
      // remove added state after animation
      setTimeout(() => {
        addBtn.classList.remove("disabled", "added");
        addBtn.innerHTML = '<i class="bi bi-cart3"></i> Add';
      }, 900);
    });

    cardFooter.append(detailsBtn, addBtn);

    // wrap image in a container to preserve aspect ratio and avoid upscaling
    const imgWrap = document.createElement("div");
    imgWrap.className = "img-wrap";
    imgWrap.appendChild(img);

    card.append(imgWrap, cardBody, cardFooter);
    col.appendChild(card);
    frag.appendChild(col);
  });

  if (!options.append) {
    booksGrid.innerHTML = "";
    booksGrid.appendChild(frag);
  } else {
    booksGrid.appendChild(frag);
  }
}

// details view adapted from test.js
function showBookDetails(book) {
  // create an overlay modal instead of replacing the whole page
  const existing = document.getElementById("details-overlay");
  if (existing) existing.remove();

  const overlay = document.createElement("div");
  overlay.id = "details-overlay";
  overlay.className =
    "details-overlay d-flex align-items-center justify-content-center";

  const card = document.createElement("div");
  card.className = "details-card card p-3 shadow-lg";

  const imgWrap = document.createElement("div");
  imgWrap.className =
    "details-img-wrap d-flex align-items-center justify-content-center mb-3";
  const img = document.createElement("img");
  img.className = "details-img img-fluid rounded";
  img.src =
    (book.formats &&
      (book.formats["image/jpeg"] || book.formats["image/png"])) ||
    "";
  img.onerror = () => {
    img.src =
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500"><rect width="100%" height="100%" fill="%23f6f6f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23c0c0c0" font-size="18">No cover</text></svg>';
  };
  img.decoding = "async";
  img.loading = "lazy";
  imgWrap.appendChild(img);

  const bodyDiv = document.createElement("div");
  bodyDiv.className = "details-body card-body d-flex flex-column";

  const title = document.createElement("h2");
  title.className = "card-title mb-2";
  title.textContent = book.title || "Untitled";

  const author = document.createElement("p");
  author.className = "small text-muted mb-2";
  author.textContent =
    (book.authors && book.authors[0] && book.authors[0].name) ||
    "Unknown author";

  const description = document.createElement("div");
  description.className = "details-desc text-muted";
  description.textContent =
    (book.summaries && book.summaries[0]) || "No description available.";

  const controls = document.createElement("div");
  controls.className = "mt-3 d-flex gap-2";

  const addBtn = document.createElement("button");
  addBtn.className = "btn btn-danger";
  addBtn.innerHTML = '<i class="bi bi-cart3"></i> Add to Cart';
  addBtn.addEventListener("click", () => {
    addBtn.classList.add("added");
    addBtn.textContent = "Added";
    setTimeout(() => {
      addBtn.classList.remove("added");
      addBtn.innerHTML = '<i class="bi bi-cart3"></i> Add to Cart';
    }, 900);
  });

  const closeBtn = document.createElement("button");
  closeBtn.className = "btn btn-light ms-auto";
  closeBtn.innerHTML = '<i class="bi bi-x-lg"></i> Close';
  closeBtn.addEventListener("click", () => {
    overlay.classList.add("leave");
    setTimeout(() => {
      overlay.remove();
      document.body.style.overflow = "";
    }, 260);
  });

  controls.append(addBtn, closeBtn);

  bodyDiv.append(title, author, description, controls);

  card.append(imgWrap, bodyDiv);
  overlay.appendChild(card);

  // prevent background scroll
  document.body.appendChild(overlay);
  document.body.style.overflow = "hidden";

  // entrance animation
  requestAnimationFrame(() => {
    overlay.classList.add("enter");
    card.classList.add("pop");
  });
}

// resilient fetch helper with retries for transient server errors
function fetchWithRetries(url, retries = 1, delay = 500) {
  return new Promise((resolve, reject) => {
    function attempt(remaining) {
      fetch(url)
        .then((res) => {
          if (res.ok) return res.json();
          // for server errors, optionally retry
          const status = res.status;
          if (status >= 500 && remaining > 0) {
            setTimeout(() => attempt(remaining - 1), delay);
            return;
          }
          // try to parse error body if possible
          return res.text().then((text) => {
            const err = new Error(`HTTP ${status}: ${text || res.statusText}`);
            err.status = status;
            throw err;
          });
        })
        .then((data) => resolve(data))
        .catch((err) => reject(err));
    }

    attempt(retries);
  });
}

// fetch with timeout using AbortController
function fetchWithTimeout(url, timeout = 4000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  return fetch(url, { signal: controller.signal }).finally(() =>
    clearTimeout(id)
  );
}

// process fetched data (extracted from fetchPage success handler)
function processFetchData(data, urlToFetch, prevTotal) {
  const pageBooks = data.results || [];
  // append newly fetched books to accumulated list
  const prev = prevTotal !== undefined ? prevTotal : allBooks.length;
  allBooks = allBooks.concat(pageBooks);
  nextUrl = data.next || null;

  // update categories from accumulated books
  const catSet = new Set();
  allBooks.forEach((b) => {
    if (b.bookshelves && b.bookshelves.length) {
      b.bookshelves.forEach((c) => catSet.add(c));
    }
  });
  categories = Array.from(catSet).sort();

  // find currently selected category (if any)
  const activeBtn = categoryContainer.querySelector(
    "button.category-pill.active"
  );
  const activeCategory = activeBtn
    ? activeBtn.dataset.category
    : "All Categories";

  // render categories and preserve active state
  renderCategories(categories, activeCategory);
  initCategoryListener();

  // decide what to render depending on whether this was a Load more action
  if (activeCategory === "All Categories") {
    if (isLoadMoreAction) {
      // append the next chunk from accumulated books
      const chunk = allBooks.slice(
        displayedCount,
        displayedCount + DISPLAY_STEP
      );
      if (chunk.length) {
        renderBooks(chunk, { append: true });
        displayedCount += chunk.length;
      }
      isLoadMoreAction = false;
    } else {
      // initial or normal refresh: render up to DISPLAY_STEP (or current displayedCount if already set)
      if (!displayedCount)
        displayedCount = Math.min(DISPLAY_STEP, allBooks.length);
      renderBooks(allBooks.slice(0, displayedCount));
    }
  } else {
    // other categories: show all matching and hide load-more
    const filtered = allBooks.filter(
      (b) => b.bookshelves && b.bookshelves.includes(activeCategory)
    );
    renderBooks(filtered);
  }

  // update load more UI: show the container only when there's a next page OR there are more accumulated books
  if (loadMoreContainer) {
    const moreAccumulated = allBooks.length > displayedCount;
    if (activeCategory === "All Categories" && (nextUrl || moreAccumulated)) {
      loadMoreContainer.classList.remove("d-none");
      loadMoreBtn.disabled = false;
      loadMoreBtn.textContent = "Load more";
    } else {
      loadMoreContainer.classList.add("d-none");
    }
  } else {
    const moreAccumulated = allBooks.length > displayedCount;
    if (activeCategory === "All Categories" && (nextUrl || moreAccumulated)) {
      loadMoreBtn.disabled = false;
      loadMoreBtn.textContent = "Load more";
    } else {
      loadMoreBtn.disabled = true;
      loadMoreBtn.textContent = "No more books";
    }
  }
}

// helper to fetch a page and append results (uses fetchWithRetries)
function fetchPage(urlToFetch) {
  loadMoreBtn.disabled = true;
  loadMoreBtn.textContent = "Loading...";
  if (pageLoader) pageLoader.classList.remove("d-none");

  return fetchWithRetries(urlToFetch, 2, 1000)
    .then((data) => {
      const pageBooks = data.results || [];
      // append newly fetched books to accumulated list
      const prevTotal = allBooks.length;
      allBooks = allBooks.concat(pageBooks);
      nextUrl = data.next || null;

      // update categories from accumulated books
      const catSet = new Set();
      allBooks.forEach((b) => {
        if (b.bookshelves && b.bookshelves.length) {
          b.bookshelves.forEach((c) => catSet.add(c));
        }
      });
      categories = Array.from(catSet).sort();

      // find currently selected category (if any)
      const activeBtn = categoryContainer.querySelector(
        "button.category-pill.active"
      );
      const activeCategory = activeBtn
        ? activeBtn.dataset.category
        : "All Categories";

      // render categories and preserve active state
      renderCategories(categories, activeCategory);
      initCategoryListener();
      // decide what to render depending on whether this was a Load more action
      if (activeCategory === "All Categories") {
        if (isLoadMoreAction) {
          // append the next chunk from accumulated books
          const chunk = allBooks.slice(
            displayedCount,
            displayedCount + DISPLAY_STEP
          );
          if (chunk.length) {
            renderBooks(chunk, { append: true });
            displayedCount += chunk.length;
          }
          isLoadMoreAction = false;
        } else {
          // initial or normal refresh: render up to DISPLAY_STEP (or current displayedCount if already set)
          if (!displayedCount)
            displayedCount = Math.min(DISPLAY_STEP, allBooks.length);
          renderBooks(allBooks.slice(0, displayedCount));
        }
      } else {
        // other categories: show all matching and hide load-more
        const filtered = allBooks.filter(
          (b) => b.bookshelves && b.bookshelves.includes(activeCategory)
        );
        renderBooks(filtered);
      }

      
      // update load more UI: show the container only when there's a next page OR there are more accumulated books
      if (loadMoreContainer) {
        const moreAccumulated = allBooks.length > displayedCount;
        if (
          activeCategory === "All Categories" &&
          (nextUrl || moreAccumulated)
        ) {
          loadMoreContainer.classList.remove("d-none");
          loadMoreBtn.disabled = false;
          loadMoreBtn.textContent = "Load more";
        } else {
          loadMoreContainer.classList.add("d-none");
        }
      } else {
        // fallback if container not found: update button state
        const moreAccumulated = allBooks.length > displayedCount;
        if (
          activeCategory === "All Categories" &&
          (nextUrl || moreAccumulated)
        ) {
          loadMoreBtn.disabled = false;
          loadMoreBtn.textContent = "Load more";
        } else {
          loadMoreBtn.disabled = true;
          loadMoreBtn.textContent = "No more books";
        }
      }
      if (pageLoader) pageLoader.classList.add("d-none");
    })
    .catch((err) => {
      console.error("Failed to fetch page:", err);
      loadMoreBtn.disabled = false;
      loadMoreBtn.textContent = "Load more";

      // show a clear error card with retry option
      booksGrid.innerHTML = "";
      const wrapper = document.createElement("div");
      wrapper.className = "col-12 text-center p-4";
      const msg = document.createElement("p");
      msg.className = "text-muted small";
      msg.textContent =
        err.status && err.status >= 500
          ? "Server error (5xx). Try again."
          : "Failed to load books. See console for details.";
      const retry = document.createElement("button");
      retry.className = "btn btn-outline-primary mt-2";
      retry.textContent = "Retry";
      retry.addEventListener("click", () => {
        // attempt the same URL again
        fetchPage(urlToFetch);
      });
      wrapper.appendChild(msg);
      wrapper.appendChild(retry);
      booksGrid.appendChild(wrapper);
      // hide the load more control when there's an error (avoid showing it when we don't know there's more)
      if (loadMoreContainer) loadMoreContainer.classList.add("d-none");
      if (pageLoader) pageLoader.classList.add("d-none");
    });
}

// initial load: try a fast direct fetch first to avoid waiting on retries
// function initialLoad() {
//   if (pageLoader) pageLoader.classList.remove("d-none");
//   // try one quick fetch with timeout
//   // return a promise so callers can wait for it
//   return fetchWithTimeout(apiUrl, 3500)
//     .then((res) => {
//       if (!res.ok) throw new Error(`HTTP ${res.status}`);
//       return res.json();
//     })
//     .then((data) => {
//       processFetchData(data, apiUrl, 0);
//       if (pageLoader) pageLoader.classList.add("d-none");
//       return data;
//     })
//     .catch((err) => {
//       // fallback to fetchWithRetries (slower but more resilient)
//       return fetchPage(apiUrl);
//     });
// }

// load more click
loadMoreBtn.addEventListener("click", () => {
  // only act if All Categories is active
  const activeBtn = categoryContainer.querySelector(
    "button.category-pill.active"
  );
  const activeCategory = activeBtn
    ? activeBtn.dataset.category
    : "All Categories";
  if (activeCategory !== "All Categories") return;

  // if we already have more accumulated books, append next chunk locally
  if (allBooks.length > displayedCount) {
    isLoadMoreAction = true;
    const chunk = allBooks.slice(displayedCount, displayedCount + DISPLAY_STEP);
    if (chunk.length) {
      // show a brief loader to indicate progress for local append
      if (pageLoader) pageLoader.classList.remove("d-none");
      setTimeout(() => {
        renderBooks(chunk, { append: true });
        displayedCount += chunk.length;
        if (pageLoader) pageLoader.classList.add("d-none");
      }, 250);
    }
    // ensure the load-more container updates (might hide if we've exhausted accumulated items and no nextUrl)
    const moreAccumulated = allBooks.length > displayedCount;
    if (loadMoreContainer) {
      if (nextUrl || moreAccumulated) {
        loadMoreContainer.classList.remove("d-none");
      } else {
        loadMoreContainer.classList.add("d-none");
      }
    }
  } else {
    // otherwise fetch the next page from the API
    if (!nextUrl) return;
    fetchPage(nextUrl);
  }
});

// fetch only (no rendering) so we can render exactly after the intro
function fetchDataOnly() {
  return fetchWithTimeout(apiUrl, 3500)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .catch((err) => {
      // fallback to retries
      return fetchWithRetries(apiUrl, 2, 800);
    });
}

function playIntroThenLoad() {
  const intro = document.getElementById("intro-overlay");
  console.debug("playIntroThenLoad: started, intro found=", !!intro);
  // show animation immediately
  if (intro) {
    intro.style.display = "flex";
    requestAnimationFrame(() => intro.classList.add("playing"));
  }

  // show the global page loader while fetching initial data
  if (pageLoader) pageLoader.classList.remove("d-none");

  // fetch in parallel; when data arrives render immediately and hide intro
  fetchDataOnly()
    .then((data) => {
      processFetchData(data, apiUrl, 0);
      // hide loader and intro overlay now that content is rendered
      if (pageLoader) pageLoader.classList.add("d-none");
      if (intro) intro.style.display = "none";
    })
    .catch((err) => {
      console.error("Failed to fetch initial data:", err);
      // fallback to initialLoad which will show errors UI as needed
      initialLoad();
      if (pageLoader) pageLoader.classList.add("d-none");
      if (intro) intro.style.display = "none";
    });
}

if (
  document.readyState === "complete" ||
  document.readyState === "interactive"
) {
  setTimeout(playIntroThenLoad, 80);
} else {
  document.addEventListener("DOMContentLoaded", playIntroThenLoad);
}
