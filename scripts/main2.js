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

      card.appendChild(body);
      col.appendChild(card);
      container.appendChild(col);
    }); // نهاية forEach
  }) // نهاية then
  .catch((err) => console.error(err)); // إضافة catch لو حصل خطأ
