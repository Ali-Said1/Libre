import { createBook } from "./products_api.js"
import authUser from "./authUser.js";

const response = await authUser();
if (!response.ok) {
    window.location.href = "/signin.html"
}

const noBooksInWishlist = document.querySelector("#noWishlist");
async function getWishlist() {
    const reponse = await fetch("http://localhost:5000/wishlist", {
        method: "GET",
        credentials: 'include'
    });
    const body = await reponse.json();
    return body;

}
async function renderWishlist() {
    try {
        const wishlist = await getWishlist();
        if (wishlist.length === 0) {
            noBooksInWishlist.classList.remove("d-none");
        } else {
            noBooksInWishlist.classList.add("d-none");
            const wishlistContainer = document.querySelector("#wishlistContainer");
            wishlistContainer.innerHTML = ""
            for (const bookId of wishlist) {
                const googleBooksResponse = await fetch(`https://www.googleapis.com/books/v1/volumes/${bookId}`);
                const bookData = await googleBooksResponse.json()
                const book = createBook(bookData);
                /*Book response from createBook function:
                {
                    id,
                    title,
                    authors,
                    description,
                    publishedDate,
                    thumbnail: `http://books.google.com/books/content?id=${bookData.id}&printsec=frontcover&img=1&zoom=1`,
                }
                */
                const bookContainer = document.createElement("div");
                bookContainer.setAttribute("class", "card col-12 col-sm-6 col-lg-4 mx-auto");
                bookContainer.style.width = "18rem";
                const bookImage = document.createElement("img");
                bookImage.setAttribute("src", book.thumbnail);
                bookImage.setAttribute("class", "card-img-top");

                const cardBody = document.createElement("div");
                cardBody.setAttribute("class", "card-body text-center");
                const bookName = document.createElement("h5");

                bookName.innerText = book.title;
                bookName.setAttribute("class", "card-title");

                const viewButton = document.createElement("button");
                viewButton.setAttribute("class", "btn btn-primary w-100 mt-5");
                viewButton.innerText = "View Book";

                const removeButton = document.createElement("button");
                removeButton.setAttribute("class", "btn btn-danger w-100 mt-3");
                removeButton.addEventListener('click', async () => { await removeWishlistItem(bookId) });
                removeButton.innerText = "Remove from wishlist";


                cardBody.appendChild(bookName);
                cardBody.appendChild(viewButton);
                cardBody.appendChild(removeButton);

                bookContainer.appendChild(bookImage);
                bookContainer.appendChild(cardBody);

                wishlistContainer.appendChild(bookContainer);
            }
        }
    }
    catch (e) {
        console.error(e.message)
        noBooksInWishlist.classList.remove("d-none");

    }
}

async function removeWishlistItem(id) {
    console.log("Deleting book id:", id);
    const response = await fetch(`http://localhost:5000/wishlist`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: id }),
        credentials: 'include'
    });
    await renderWishlist();
}

document.addEventListener('DOMContentLoaded', renderWishlist)