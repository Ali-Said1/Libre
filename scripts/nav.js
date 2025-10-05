import authUser from "./authUser.js";
let logCheck = false;
const { ok } = await authUser();
if (ok) logCheck = true;

function logoutLogic(e) {
  e.preventDefault();
  fetch('http://localhost:5000/logout', { method: "POST", credentials: 'include' })
    .then(response => {
      if (response.ok) {
        window.location.reload();
      } else {
        console.error("Logout failed with status:", response.status);
      }
    })
    .catch(error => {
      console.error("An error occurred during logout:", error);
    });

  return false;
}

const navbarHTML = `
<nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
    <div class="container-fluid">
        <!-- GROUP 1: Always-visible left-side links -->
        <div class="d-flex align-items-center">
            <ul class="navbar-nav flex-row">
                <li class="nav-item">
                    <a class="nav-link text-danger" href="index.html">Home</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link text-danger" href="wishlist.html">Wishlist</a>
                </li>
            </ul>
        </div>

       
        
        <!-- GROUP 3: Burger menu button for the right-side links -->
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNavbar" aria-controls="mainNavbar" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
            </button>
            
            <!-- Collapsible content for the right-side links -->
            <div class="collapse navbar-collapse flex-grow-0" id="mainNavbar">
            <ul class="navbar-nav">
            <li class="nav-item">
                 <a href="carts.html" class="nav-link text-danger fs-4">
                    <i class="bi bi-cart d-flex align-items-center"></i>
                </a>
            </li>
                <li class="nav-item">
                    <a class="nav-link text-danger" href="products.html">Products</a>
                </li>

                <!-- Conditional links based on login status -->
                ${logCheck ? `
                <li class="nav-item">
                    <a class="nav-link text-danger" href="profile.html">Profile</a>
                </li>
                <li id="logoutButton" class="nav-item">
                    <a class="nav-link text-danger" href="#" style="cursor: pointer;">Log Out</a>
                </li>
                ` : `
                <li class="nav-item">
                    <a class="nav-link text-danger" href="signin.html">Login</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link text-danger" href="signup.html">Register</a>
                </li>
                `}
            </ul>
        </div>
    </div>
</nav>
`;

const ensureBootstrapIcons = () => {
  if (!document.querySelector('link[href*="bootstrap-icons"]')) {
    const iconsLink = document.createElement('link');
    iconsLink.rel = 'stylesheet';
    iconsLink.href = 'node_modules/bootstrap-icons/font/bootstrap-icons.css';
    document.head.appendChild(iconsLink);
  }
};


ensureBootstrapIcons();

document.body.insertAdjacentHTML("afterbegin", navbarHTML);

const logoutButton = document.getElementById('logoutButton');
if (logoutButton) {
  logoutButton.addEventListener('click', logoutLogic);
}

