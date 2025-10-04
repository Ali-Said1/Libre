import { allBooks, getBooksByCategory } from "./products_api.js";

const booksContainer = document.getElementById("books-container");
let currentCategory = "all";
let batchIndex = 0;
const batchSize = 12;
const cart = [];
const bookCache = {};
const detailsModal = new bootstrap.Modal(document.getElementById('detailsModal'));

// Strip HTML from description
function stripHTML(html){
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
}

// Render books
function renderBooks(books, append=false){
    if(!append) booksContainer.innerHTML="";

    books.forEach(book=>{
        const col=document.createElement("div");
        col.className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4"; 

        col.innerHTML=`
            <div class="card book-card h-100" data-id="${book.id}">
                <img src="${book.thumbnail}" class="card-img-top book-cover" alt="${book.title}">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title" data-id="${book.id}">${book.title}</h5>
                    <p class="card-text text-truncate">${book.authors}</p>
                </div>
                <div class="card-footer d-flex justify-content-between">
                    <button class="btn btn-danger btn-sm view-details" data-id="${book.id}"><i class="bi bi-eye"></i> View</button>
                    <button class="btn btn-primary btn-sm add-to-cart" data-id="${book.id}"><i class="bi bi-cart-plus"></i> Add to Cart</button>
                </div>
            </div>
        `;
        booksContainer.appendChild(col);
    });
}

// Prefetch books
async function prefetchCategory(category){
    if(!bookCache[category]) bookCache[category]=[];

    if(bookCache[category].length<20){
        await getBooksByCategory(category==='all'?'all':category);
        const books = category==='all' ? Object.values(allBooks).flat() : allBooks[category];
        bookCache[category]=books;
    }
}

function prefetchAllCategories(){
    Object.keys(allBooks).forEach(cat=>prefetchCategory(cat));
}

// Render next batch
function renderNextBatch(){
    const books = bookCache[currentCategory] || [];
    const start = batchIndex * batchSize;
    const end = start + batchSize;
    const nextBatch = books.slice(start,end);

    renderBooks(nextBatch,batchIndex>0);
    batchIndex++;

    const loadMoreBtn = document.getElementById("load-more-btn");
    loadMoreBtn.style.display = end>=books.length?'none':'inline-block';

    if(books.length<end+batchSize) prefetchCategory(currentCategory);
}

// Category filters
function createCategoryFilters(){
    const container=document.createElement("div");
    container.id="category-filters";
    container.className="d-flex flex-wrap gap-2 mb-4";
    document.getElementById("main-container").prepend(container);

    const categories=["all",...Object.keys(allBooks)];

    categories.forEach(cat=>{
        const btn=document.createElement("button");
        btn.className="btn btn-outline-secondary category-pill";
        btn.dataset.category=cat;
        btn.innerText=cat.charAt(0).toUpperCase()+cat.slice(1);
        if(cat==='all') btn.classList.add("active");

        btn.addEventListener("click",()=>{
            document.querySelectorAll(".category-pill").forEach(b=>b.classList.remove("active"));
            btn.classList.add("active");
            currentCategory=cat;
            batchIndex=0;
            prefetchCategory(currentCategory).then(renderNextBatch);
        });
        container.appendChild(btn);
    });
}

// Load More button
document.getElementById("load-more-btn").addEventListener("click",()=>renderNextBatch());

// Function to sync all Add to Cart buttons for a book
function updateAddToCartButtons(bookId) {
    // Card buttons
    document.querySelectorAll(`.add-to-cart[data-id="${bookId}"]`).forEach(btn => {
        btn.classList.add("added");
        btn.innerHTML = `<i class="bi bi-check2"></i> Added`;
        setTimeout(() => {
            btn.classList.remove("added");
            btn.innerHTML = `<i class="bi bi-cart-plus"></i> Add to Cart`;
        }, 1200);
    });

    // Modal button
    const modalBtn = document.getElementById("modal-add-to-cart");
    if (modalBtn && document.getElementById("details-title").dataset.id === bookId) {
        modalBtn.classList.add("added");
        modalBtn.innerHTML = `<i class="bi bi-check2"></i> Added`;
        setTimeout(() => {
            modalBtn.classList.remove("added");
            modalBtn.innerHTML = `<i class="bi bi-cart-plus"></i> Add to Cart`;
        }, 1200);
    }
}

// Card Add to Cart click
booksContainer.addEventListener("click", e => {
    const card = e.target.closest(".book-card");
    if (!card) return;
    const bookId = card.dataset.id;
    const books = bookCache[currentCategory] || [];
    const book = books.find(b => b.id === bookId);

    if (e.target.closest(".add-to-cart") && book && !cart.includes(book)) {
        cart.push(book);
        updateAddToCartButtons(bookId);
        console.log("Cart:", cart);
    }

    // View Details
    if(e.target.closest(".view-details")){
        fetch(`https://www.googleapis.com/books/v1/volumes/${bookId}`)
            .then(res => res.json())
            .then(data => {
                const info = data.volumeInfo;
                document.getElementById("details-img").src = info.imageLinks?.thumbnail || "https://via.placeholder.com/150x200";
                document.getElementById("details-title").innerText = info.title || "No title";
                document.getElementById("details-title").dataset.id = bookId;
                document.getElementById("details-authors").innerText = info.authors ? info.authors.join(", ") : "Unknown Author";
                document.getElementById("details-desc").innerText = stripHTML(info.description || "No description available");
                detailsModal.show();
            });
    }
});

// Modal Add to Cart click
document.getElementById("modal-add-to-cart").addEventListener("click", () => {
    const bookId = document.getElementById("details-title").dataset.id;
    const books = bookCache[currentCategory] || [];
    const book = books.find(b => b.id === bookId);

    if (book && !cart.includes(book)) {
        cart.push(book);
        updateAddToCartButtons(bookId);
        console.log("Cart:", cart);
    }
});

// Initialize
function init(){
    createCategoryFilters();
    prefetchAllCategories();
    prefetchCategory(currentCategory).then(renderNextBatch);
}

init();
