let nv = `
<ul class="nv nav-pills p-2 w-100 d-flex align-items-center list-unstyled" style="color: rgb(224, 32, 32) !important;">
  <li class="nav-item mx-3">
    <a class="nav-link" href="home.html">Home</a>
  </li>
 <li class="nav-item mx-3">
    <a class="nav-link" href="wishlist.html">Wishlist</a>
  </li>
  <li class="nav-item ms-auto mx-2">
    <a href="carts.html" style="color: rgb(224, 32, 32); font-size: 1.4rem">
      <i class="fa-solid fa-cart-shopping"></i>
    </a>
  </li>
  <li class="nav-item mx-3">
    <a class="nav-link" href="products.html">Products</a>
  </li>
  <li class="nav-item mx-3">
    <a class="nav-link" href="signup.html">Sign up</a>
  </li>
  <li class="nav-item mx-3">
    <a class="nav-link" href="signin.html">Sign in</a>
  </li>
</ul>
`;

document.body.insertAdjacentHTML("afterbegin", nv);
