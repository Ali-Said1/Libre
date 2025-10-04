const allBooks = {
  adventure: [],
  action: [],
  art: [],
  biography: [],
  business: [],
  computers: [],
  cooking: [],
  drama: [],
  education: [],
  family: [],
  history: [],
  humor: [],
  romance: [],
  sports: [],
};

const createBook = function (bookData) {
  const {
    id,
    volumeInfo: { title, authors, description, publishedDate },
  } = bookData;
  return {
    id,
    title,
    authors,
    description,
    publishedDate,
    thumbnail: `http://books.google.com/books/content?id=${bookData.id}&printsec=frontcover&img=1&zoom=1`,
  };
};

const getBooksByCategory = async function (category = "all") {
  // Timeout Promisified
  const timeoutPromise = function (s = 4) {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Timed out")), s * 1000);
    });
  };

  // Get All Categories
  const categories = Object.keys(allBooks);
  if (category === "all") {
    // Setup promises for all categories
    const promises = categories.map(async (cat) => {
      try {
        const res = await Promise.race([
          fetch(
            `https://www.googleapis.com/books/v1/volumes?q=subject:${cat}&startIndex=${allBooks?.[cat].length}&maxResults=5`
          ),
          timeoutPromise(),
        ]);
        const data = await res.json();
        return { cat, data };
      } catch (error) {
        return { cat, error };
      }
    });
    // Check after all promises are settled (max 4 seconds)
    try {
      const results = await Promise.allSettled(promises);
      results.forEach((r) => {
        if (r.status === "fulfilled" && r.value.data) {
          r.value.data.items.forEach((bookData) => {
            allBooks[r.value.cat].push(createBook(bookData));
          });
        }
      });
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  } else {
    if (!categories.includes(category)) return false;
    try {
      const response = await Promise.race([
        fetch(
          `https://www.googleapis.com/books/v1/volumes?q=subject:${category}&startIndex=${allBooks?.[category].length}&maxResults=20`
        ),
        timeoutPromise(),
      ]);
      const { items } = await response.json();
      console.log(items);
      items.forEach((bookData) =>
        allBooks[category].push(createBook(bookData))
      );
      return true;
    } catch {
      return false;
    }
  }
};

export { allBooks, getBooksByCategory };
