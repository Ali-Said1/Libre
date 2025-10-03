let btnSeeDetalis = document.querySelector(".btnSeeDetalis");
let body = document.querySelector("body");
let mainContent = document.querySelector("#mainContent");
let contaner = document.querySelector(".container");
async function getBooks() {
  const response = await fetch(`https://gutendex.com/books/`);
  const body = await response.json();
  //   console.log(body.results);
  const getArray = body.results;
  return getArray;
}

async function showBook() {
  let data = await getBooks();
  data.forEach((book, index) => {
    // console.log(book);
    // console.log(book.summaries[0]); description
    // console.log(book.formats["image/jpeg"]); img;

    const bookDiv = document.createElement("div");
    bookDiv.className =
      "book-card col-12 col-sm-6 col-md-3 col-lg-3 rounded-3 d-flex flex-column  align-items-center p-2 ";

    const imgDiv = document.createElement("div");
    imgDiv.className =
      "bg-body-secondary d-flex flex-column  align-items-center p-2";

    const img = document.createElement("img");
    img.src = book.formats["image/jpeg"];
    img.className = "w-75 rounded-3";

    const button = document.createElement("button");
    button.className = "border-0 py-1 px-3 rounded-3 btnSeeDetalis";
    const icone = document.createElement("i");
    icone.className = "bi bi-eye";
    button.append(icone);
    button.dataset.index = index;

    imgDiv.append(img);
    bookDiv.append(imgDiv, button);
    mainContent.appendChild(bookDiv);

    button.addEventListener("click", () => {
      showBookDetails(book);
    });
  });
}

document.addEventListener("DOMContentLoaded", () => showBook());

function showBookDetails(book) {
  body.innerHTML = "";
  body.style.backgroundColor = "black";

  const card = document.createElement("div");
  card.className =
    "w-75 bg-body-tertiary rounded-3 p-2 m-auto d-flex justify-content-evenly gap-5 mt-5";

  const img = document.createElement("img");
  img.src = book.formats["image/jpeg"];
  //   img.classList.add("w-100");

  const content = document.createElement("div");
  content.classList.add("d-flex", "flex-column", "gap-1");

  const title = document.createElement("h1");
  title.textContent = book.title;

  const description = document.createElement("p");
  description.textContent = book.summaries[0] || "No description available.";

  const button = document.createElement("button");
  button.classList.add(
    "border-0",
    "px-3",
    "py-2",
    "rounded-2",
    "addCart",
    "bg-danger"
  );
  button.innerHTML = '<i class="bi bi-cart3"></i> Add to Cart';

  const backBtn = document.createElement("button");

  backBtn.className = "btn btn-light mt-3";
  backBtn.textContent = "Back To Books";
  backBtn.addEventListener("click", () => {
    body.innerHTML = "";
    body.style.backgroundColor = "white";

    contaner = document.createElement("div");
    contaner.className = "container";

    mainContent = document.createElement("div");
    mainContent.id = "mainContent";
    mainContent.className = "row justify-content-evenly gap-2 mt-3";

    contaner.append(mainContent);
    body.appendChild(contaner);
    showBook();
  });

  content.append(title, description, button, backBtn);
  card.append(img, content);

  body.appendChild(card);
}
