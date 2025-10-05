import { allBooks, getBooksByCategory } from "./products_api.js";

const booksContainer = document.getElementById("books-container");
let currentCategory = "all";
let batchIndex = 0;
const batchSize = 12;
const bookCache = {};
const detailsModal = new bootstrap.Modal(
    document.getElementById("detailsModal")
);

// Strip HTML from description
function stripHTML(html) {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
}

// Render books
function renderBooks(books, append = false) {
    if (!append) booksContainer.innerHTML = "";

    books.forEach((book) => {
        const col = document.createElement("div");
        col.className = "col-12 col-sm-6 col-md-4 col-lg-3 mb-4";

        col.innerHTML = `
            <div class="card book-card h-100" data-id="${book.id}">
                <img src="${book.thumbnail}" class="card-img-top book-cover" alt="${book.title}">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title" data-id="${book.id}">${book.title}</h5>
                    <p class="card-text text-truncate">${book.authors}</p>
                </div>
                <div class="card-footer gap-1 row mx-1">
                    <button class="btn btn-dark text-light btn-sm view-details col-2" data-id="${book.id}">
                        <i class="bi bi-eye"></i>
                    </button>
                    <div class="col-9 row justify-content-end gap-1"> 
                        <button class="btn btn-danger btn-sm wishlist-btn col-4" data-id="${book.id}">
                            <i class="bi bi-heart"></i>
                        </button>
                        <button class="btn btn-primary btn-sm add-to-cart col-4" data-id="${book.id}">
                            <i class="bi bi-cart-plus"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        booksContainer.appendChild(col);
    });
}

// Prefetch category
async function prefetchCategory(category) {
    if (!bookCache[category]) bookCache[category] = [];
    await getBooksByCategory(category);
    const books =
        category === "all" ? Object.values(allBooks).flat() : allBooks[category];
    bookCache[category] = books;
}

// Prefetch next batch
async function prefetchNextBatch() {
    const books = bookCache[currentCategory] || [];
    const nextStart = (batchIndex + 1) * batchSize;
    if (books.length <= nextStart) {
        await prefetchCategory(currentCategory);
    }
}

// Render next batch
async function renderNextBatch() {
    const books = bookCache[currentCategory] || [];
    const start = batchIndex * batchSize;
    const end = start + batchSize;

    if (books.length < end) {
        await prefetchCategory(currentCategory);
    }

    const nextBatch = bookCache[currentCategory].slice(start, end);

    if (nextBatch.length === 0) {
        console.log("No books available yet, trying again...");
        await prefetchCategory(currentCategory);
        return renderNextBatch();
    }

    renderBooks(nextBatch, batchIndex > 0);
    batchIndex++;
    prefetchNextBatch();

    document.getElementById("load-more-btn").style.display = "inline-block";
}

// Category filters
function createCategoryFilters() {
    const container = document.createElement("div");
    container.id = "category-filters";
    container.className = "d-flex flex-wrap gap-2 mb-4";
    document.getElementById("main-container").prepend(container);

    const categories = ["all", ...Object.keys(allBooks)];

    categories.forEach((cat) => {
        const btn = document.createElement("button");
        btn.className = "btn btn-outline-secondary category-pill";
        btn.dataset.category = cat;
        btn.innerText = cat.charAt(0).toUpperCase() + cat.slice(1);
        if (cat === "all") btn.classList.add("active");

        btn.addEventListener("click", () => {
            document
                .querySelectorAll(".category-pill")
                .forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
            currentCategory = cat;
            batchIndex = 0;
            renderNextBatch();
        });
        container.appendChild(btn);
    });
}

// Load More
document
    .getElementById("load-more-btn")
    .addEventListener("click", () => renderNextBatch());

// Add to Cart
async function handleAddToCart(btn, bookId) {
    try {
        const addedToCart = await fetch("http://localhost:5000/cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId: bookId }),
            credentials: "include",
        });
        const response = await addedToCart.json()
        if (addedToCart.ok) {
            btn.classList.add("added");
            btn.innerHTML = `<i class="bi bi-check2"></i>`;
        } else
            btn.innerHTML = `<i class="bi bi-x-circle-fill text-danger"></i>`
    } catch {
        btn.innerHTML = `<i class="bi bi-x-circle-fill text-danger"></i>`
    } finally {
        setTimeout(() => {
            btn.classList.remove("added");
            btn.innerHTML = `<i class="bi bi-cart-plus"></i>`;
        }, 1200);
    }
}

// Wishlist
async function handleWishlist(btn, bookId) {
    btn.classList.toggle("added");
    btn.innerHTML = btn.classList.contains("added")
        ? `<i class="bi bi-heart-fill"></i>`
        : `<i class="bi bi-heart"></i>`;
    try {
        let response;
        if (!btn.classList.contains('added')) {
            const removedFromWishlist = await fetch("http://localhost:5000/wishlist", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bookId }),
                credentials: "include",
            });
            response = await removedFromWishlist.json()
        } else {
            const addedToWishlist = await fetch("http://localhost:5000/wishlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId: bookId }),
                credentials: "include",
            });
            if (addedToWishlist.status === 401) {
                btn.classList.remove("added");
                btn.innerHTML = `<i class="bi bi-x-circle-fill text-light"></i>`
                setTimeout(() => {
                    btn.innerHTML = `<i class="bi bi-heart"></i>`;
                }, 1200);
            }
            response = await addedToWishlist.json()
        }
        if (response.status === 500) {
            btn.classList.toggle("added");
            btn.innerHTML = btn.classList.contains("added")
                ? `< i class="bi bi-heart-fill" ></ > `
                : `< i class="bi bi-heart" ></ > `;
        }
    } catch (e) {
        btn.classList.toggle("added");
        btn.innerHTML = btn.classList.contains("added")
            ? `< i class="bi bi-heart-fill" ></ > `
            : `< i class="bi bi-heart" ></ > `;
        console.error(e.message)
    }
}

// Card click handling
booksContainer.addEventListener("click", (e) => {
    const card = e.target.closest(".book-card");
    if (!card) return;
    const bookId = card.dataset.id;
    const books = bookCache[currentCategory] || [];
    const book = books.find((b) => b.id === bookId);
    if (!book) return;

    // Add to Cart
    if (e.target.closest(".btn-primary")) {
        handleAddToCart(e.target.closest(".btn-primary"), bookId);
    }

    // Wishlist
    if (e.target.closest(".btn-danger")) {
        handleWishlist(e.target.closest(".btn-danger"), bookId);
    }

    // View details
    if (e.target.closest(".view-details")) {
        fetch(`https://www.googleapis.com/books/v1/volumes/${bookId}`)
            .then((res) => res.json())
            .then((data) => {
                const info = data.volumeInfo;
                document.getElementById("details-img").src =
                    info.imageLinks?.thumbnail || "https://via.placeholder.com/150x200";
                const titleEl = document.getElementById("details-title");
                titleEl.innerText = info.title || "No title";
                titleEl.dataset.id = bookId;
                document.getElementById("details-authors").innerText = info.authors
                    ? info.authors.join(", ")
                    : "Unknown Author";
                document.getElementById("details-desc").innerText = stripHTML(
                    info.description || "No description available"
                );

                fetch(`http://localhost:5000/rate/${bookId}`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                })
                    .then(res => res.json())
                    .then(rating => {
                        if (!rating.avg) {
                            document.getElementById("details-rating").innerText = "No rating available"
                        }
                        document.getElementById("details-rating").innerText = `${rating.average}/5.0, (by ${rating.count} users)`
                    })
                    .catch(_ => document.getElementById("details-rating").innerText = "No rating available")


                // Sync modal wishlist
                const modalWishlistBtn = document.getElementById("modal-wishlist-btn");
                const cardWishlistBtn = card.querySelector(".wishlist-btn");
                if (cardWishlistBtn?.classList.contains("added")) {
                    modalWishlistBtn.classList.add("added");
                    modalWishlistBtn.innerHTML = `<i class="bi bi-heart-fill"></i>`;
                } else {
                    modalWishlistBtn.classList.remove("added");
                    modalWishlistBtn.innerHTML = `<i class="bi bi-heart"></i>`;
                }


                // Reset rating
                document
                    .querySelectorAll('#rating-form input[type="radio"]')
                    .forEach((r) => (r.checked = false));
                fetch(`http://localhost:5000/rate/user/${bookId}`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    credentials: 'include'
                })
                    .then(res => res.json())
                    .then(data => {
                        if (data && data.rating) {
                            const radio = document.querySelector(
                                `#rating-form input[type="radio"][value="${data.rating}"]`
                            );
                            if (radio) radio.checked = true; // ✅ select the one that matches
                        }
                    })
                    .catch(_ => document.getElementById("details-rating").innerText = "No rating available")

                detailsModal.show();
            });
    }
});

// Modal Add to Cart
document.getElementById("modal-add-to-cart").addEventListener("click", () => {
    const bookId = document.getElementById("details-title").dataset.id;
    handleAddToCart(document.getElementById("modal-add-to-cart"), bookId);
});

// Modal Wishlist
document.getElementById("modal-wishlist-btn").addEventListener("click", () => {
    const modalBtn = document.getElementById("modal-wishlist-btn");
    const bookId = document.getElementById("details-title").dataset.id;
    const cardWishlistBtn = document.querySelector(
        `.book-card[data-id="${bookId}"] .wishlist-btn`
    );

    handleWishlist(modalBtn, bookId);

    if (cardWishlistBtn) {
        if (modalBtn.classList.contains("added")) {
            cardWishlistBtn.classList.add("added");
            cardWishlistBtn.innerHTML = `<i class="bi bi-heart-fill"></i>`;
        } else {
            cardWishlistBtn.classList.remove("added");
            cardWishlistBtn.innerHTML = `<i class="bi bi-heart"></i>`;
        }
    }
});

// Star rating
document
    .querySelectorAll('#rating-form input[type="radio"]')
    .forEach((radio) => {
        radio.addEventListener("click", () => {
            const rating = radio.value;
            const bookId = document.getElementById("details-title").dataset.id;

            fetch("http://localhost:5000/rate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId: bookId, rating }),
                credentials: "include",
            })
                .catch(() => document.querySelectorAll('#rating-form input[type="radio"]').forEach(r => r.checked = false))
        });
    });

// Initialize
async function init() {
    createCategoryFilters();
    await prefetchCategory(currentCategory);
    renderNextBatch();
}

init();
