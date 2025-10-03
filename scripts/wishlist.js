/*<div class="card col-12 col-sm-6 col-lg-4 mx-auto" style="width: 18rem;">
    <img src="..." class="card-img-top" alt="...">
    <div class="card-body">
        <h4 class="card-title text-center">Book title</h4>
    </div>
    <button class="btn btn-danger text-center">Remove</button>
</img></div> */

const noBooksInWishlist = document.querySelector("#noWishlist");
async function getWishlist() {
    const reponse = await fetch("http://localhost:3000/wishlist");
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
            for (const item of wishlist) {
                const itemContainer = document.createElement("div");
                itemContainer.setAttribute("class", "card col-12 col-sm-6 col-lg-4 mx-auto");
                itemContainer.style.width = "18rem";

                const bookImage = document.createElement("img");
                bookImage.setAttribute("src", item.image);
                bookImage.setAttribute("class", "card-img-top");

                const cardBody = document.createElement("div");
                cardBody.setAttribute("class", "card-body text-center");
                const bookName = document.createElement("h5");

                bookName.innerText = item.title;
                bookName.setAttribute("class", "card-title");

                const removeButton = document.createElement("button");
                removeButton.setAttribute("class", "btn btn-danger w-100 mt-5");
                removeButton.addEventListener('click', async () => { await removeItem(item.id) });
                removeButton.innerText = "Remove";

                cardBody.appendChild(bookName);
                cardBody.appendChild(removeButton);

                itemContainer.appendChild(bookImage);
                itemContainer.appendChild(cardBody);

                wishlistContainer.appendChild(itemContainer);
            }
        }
    }
    catch (e) {
        console.error(e.message)
        noBooksInWishlist.classList.remove("d-none");

    }
}

async function removeItem(id) {
    console.log("Deleting book id:", id);
    const response = await fetch(`http://localhost:3000/books/${id}`, { method: "DELETE" });
    console.log(response.status);
    await renderWishlist();
}

document.addEventListener('DOMContentLoaded', renderWishlist)