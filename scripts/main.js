let animat = document.querySelector(".animat");
let hello = " Hello, welcome to  Libre!";
let i = 0;
const interval = setInterval(() => {
  if (i != hello.length) {
    animat.textContent += hello.charAt(i);
    i++;
  } else clearInterval(interval);
}, 140);
fetch("https://gutendex.com/books/")
  .then((t) => t.json()) 
  .then((e) => {
    console.log(e);
  })
  .catch((err) => console.error(err));
