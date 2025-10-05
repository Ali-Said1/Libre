const container = document.getElementById("bookContainer");

fetch("https://gutendex.com/books/")
  .then((res) => res.json())
  .then((data) => {
    const booksData = data.results;

    booksData.forEach((book) => {
      const col = document.createElement("div");
      col.classList.add("col-lg-4", "col-md-6", "col-sm-12");

      const card = document.createElement("div");
      card.classList.add("card");
      card.style.width = "100%";

      const img = document.createElement("img");
      img.src = book.formats["image/jpeg"];
      img.classList.add("card-img-top");
      img.alt = book.title;
      card.appendChild(img);

      const body = document.createElement("div");
      body.classList.add("card-body");

      const title = document.createElement("h5");
      title.classList.add("card-title");
      title.textContent = book.title;
      body.appendChild(title);

      const author = document.createElement("p");
      author.classList.add("card-text");
      author.textContent = "By " + book.authors.map((a) => a.name).join(", ");
      body.appendChild(author);

      const link = document.createElement("a");
      link.classList.add("btn", "btn-primary");
      link.href = book.formats["text/html"];
      link.textContent = "Read Book";
      body.appendChild(link);

      const more = document.createElement("button");
      more.classList.add("btn", "m-3", "bg-primary");
      more.textContent = "+";
      more.style.color = "white";

      const less = document.createElement("button");
      less.classList.add("btn", "m-3", "bg-danger");
      less.textContent = "-";
      less.style.color = "white";
      let _div = document.createElement("div");
      _div.classList.add("d-flex", "justify-content-center");

      const remove = document.createElement("button");
      remove.classList.add("btn", "m-3", "bg-danger", "text-center");
      remove.innerHTML = '<i class="fa-solid fa-trash"></i>';
      remove.style.color = "white";
      _div.append(remove);

      const num = document.createElement("span");
      num.textContent = "Quantity: 0";
      num.classList.add("mx-2", "fw-bold");

      body.append(more, num, less, _div);

      card.appendChild(body);
      col.appendChild(card);
      container.appendChild(col);

      more.addEventListener("click", () => {
        let quantity = parseInt(num.textContent.replace("Quantity: ", "")) + 1;
        num.textContent = `Quantity: ${quantity}`;

        fetch("http://localhost:5000/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: book.id, quantity }),
          credentials: "include",
        });
      });

      less.addEventListener("click", () => {
        let quantity = parseInt(num.textContent.replace("Quantity: ", ""));
        if (quantity > 0) quantity--;
        num.textContent = `Quantity: ${quantity}`;

        fetch(`http://localhost:5000/cart/${book.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity }),
          credentials: "include",
        });
      });

      remove.addEventListener("click", () => {
        num.textContent = "Quantity: 0";

        fetch(`http://localhost:5000/cart/${book.id}`, {
          method: "DELETE",
          credentials: "include",
        });
      });
    });
  })
  .catch((err) => console.error(err));

