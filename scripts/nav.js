import authUser from "./authUser.js";
let logCheck = false;
const { ok } = await authUser();
if (ok) logCheck = true;

function logoutLogic(e) {
  e.preventDefault()
  fetch('http://localhost:5000/logout', { method: "POST", credentials: 'include' }).then(window.location.reload())

  return false;
}

let nv = `
<ul class="nv nav-pills p-2 w-100 d-flex align-items-center list-unstyled" style="color: rgb(224, 32, 32) !important;">
  <li class="nav-item mx-3">
    <a class="nav-link" href="index.html">Home</a>
  </li>
 <li class="nav-item mx-3">
    <a class="nav-link" href="wishlist.html">Wishlist</a>
  </li>
  <li class="nav-item ms-auto mx-2">
    <a href="carts.html" style="color: rgb(224, 32, 32); font-size: 1.4rem">
      <i class="bi bi-cart"></i>
    </a>
  </li>
  <li class="nav-item mx-3">
    <a class="nav-link" href="products.html">Products</a>
  </li>
  ${logCheck ? `
  <li class="nav-item mx-3">
    <a class="nav-link" href="profile.html">Profile</a>
  </li>
  <li id="logoutButton" class="nav-item mx-3">
    <a class="nav-link" href="#">Log Out</a>
  </li>
  ` : `
  <li class="nav-item mx-3">
    <a class="nav-link" href="signin.html">Login</a>
  </li>
  <li class="nav-item mx-3">
    <a class="nav-link" href="signup.html">Register</a>
  </li>
  `}
</ul>
`;

document.body.insertAdjacentHTML("afterbegin", nv);

document.getElementById('logoutButton')?.addEventListener('click', logoutLogic)
