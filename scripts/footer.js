// This script dynamically adds a footer to the page and sets the current year.

// The HTML for the footer.
const footerHTML = `
<footer class="card-footer navbar-black bg-dark text-light">
    <div class="container-fluid d-flex justify-content-center">
        <span class="navbar-text">
            &copy; <span id="current-year"></span> Nova Web Solutions. All Rights Reserved.
        </span>
    </div>
</footer>
`;

// This function inserts the footer and updates the year.
const initializeFooter = () => {
    // 1. Insert the footer HTML at the end of the body.
    document.body.insertAdjacentHTML("beforeend", footerHTML);

    // 2. Find the year span and set its text content to the current year.
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
};


initializeFooter();
