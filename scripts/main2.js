import { createBook } from "./products_api.js";
const cartContainer = document.getElementById("bookContainer");
const noBooksInCart = document.querySelector("#noCart");
async function getCart() {
  const reponse = await fetch("http://localhost:5000/cart", {
    method: "GET",
    credentials: 'include'
  });
  const body = await reponse.json();
  return body;

}


async function renderCart() {
  try {
    const cart = await getCart();
    if (cart.length === 0) {
      noBooksInCart.classList.remove("d-none");
    } else {
      noBooksInCart.classList.add("d-none");
      cartContainer.innerHTML = ""
      cart.forEach(async ({ productId: bookId, quantity }) => {
        const googleBooksResponse = await fetch(`https://www.googleapis.com/books/v1/volumes/${bookId}`);
        const bookData = await googleBooksResponse.json()
        const book = createBook(bookData);
        renderBook(book, quantity)

      })
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
    }
  }
  catch (e) {
    console.error(e.message)
    noBooksInCart.classList.remove("d-none");

  }
}

function renderBook(bookData, quantity) {
  const col = document.createElement("div");
  col.classList.add("col-lg-4", "col-md-6", "col-sm-12", "mb-4");

  const card = document.createElement("div");
  card.classList.add("card", "h-100", "shadow-sm");

  const img = document.createElement("img");
  img.src = bookData.thumbnail;
  img.classList.add("card-img-top", "img-fluid");
  img.alt = bookData.title;
  card.appendChild(img);

  const body = document.createElement("div");
  body.classList.add("card-body", "d-flex", "flex-column");

  const title = document.createElement("h5");
  title.classList.add("card-title");
  title.textContent = bookData.title;
  body.appendChild(title);

  const author = document.createElement("p");
  author.classList.add("card-text", "text-muted", "mb-3");
  author.textContent = "By " + bookData.authors.map((a) => a.name).join(", ");
  body.appendChild(author);

  const link = document.createElement("a");
  link.classList.add("btn", "btn-primary", "mb-3");
  link.href = bookData.thumbnail;
  link.textContent = "Read Book";
  body.appendChild(link);

  // Controls section
  const controls = document.createElement("div");
  controls.classList.add("d-flex", "align-items-center", "justify-content-between", "mt-3");

  // Quantity wrapper ( - Quantity + )
  const qtyWrapper = document.createElement("div");
  qtyWrapper.classList.add("d-flex", "align-items-center");

  const less = document.createElement("button");
  less.classList.add("btn", "btn-outline-danger", "me-2");
  less.textContent = "–";

  const num = document.createElement("span");
  num.textContent = `Quantity: ${quantity}`;
  num.classList.add("fw-bold");

  const more = document.createElement("button");
  more.classList.add("btn", "btn-outline-primary", "ms-2");
  more.textContent = "+";

  qtyWrapper.append(less, num, more);

  // Remove (trash) button
  const remove = document.createElement("button");
  remove.classList.add("btn", "btn-sm", "btn-danger");
  remove.innerHTML = '<i class="fa-solid fa-trash"></i>';

  controls.append(qtyWrapper, remove);

  body.appendChild(controls);
  card.appendChild(body);
  col.appendChild(card);
  cartContainer.appendChild(col);


  more.addEventListener("click", async () => {
    let quantity = parseInt(num.textContent.replace("Quantity: ", "")) + 1;
    num.textContent = `Quantity: ${quantity}`;

    const response = await fetch("http://localhost:5000/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: bookData.id }),
      credentials: "include",
    });
    if (!response.ok) {
      num.textContent = `Quantity: ${quantity - 1}`;
    }
  });

  less.addEventListener("click", async () => {
    let quantity = parseInt(num.textContent.replace("Quantity: ", ""));
    if (quantity > 0) quantity--;
    num.textContent = `Quantity: ${quantity}`;
    if (quantity === 0) {
      col.remove()
      deletebook(bookData)
    }
    const response = await fetch(`http://localhost:5000/cart`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: bookData.id }),
      credentials: "include",
    });
    if (!response.ok)
      num.textContent = `Quantity: ${quantity + 1}`

  });

  remove.addEventListener("click", () => deletebook(bookData));

}

async function deletebook(bookData) {
  await fetch(`http://localhost:5000/cart`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId: bookData.id }),
    credentials: "include",
  });
  renderCart()

}

renderCart()