let animat = document.querySelector(".animat");
let hello = " Hello, welcome to  Libre!";
let i = 0;
const interval = setInterval(() => {
  if (i != hello.length) {
    animat.textContent += hello.charAt(i);
    i++;
  } else clearInterval(interval);
}, 140);