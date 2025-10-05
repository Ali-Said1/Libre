import authUser from "./authUser.js";

const response = await authUser();
if (response.ok) {
  window.location.href = "/index.html"
}
// const usernameInput = document.querySelector('#username');
// const passwordInput = document.querySelector('#password');
// const emailInput = document.querySelector('#email');

// const signUpForm = document.querySelector("#signUpForm");
const errorParagraph = document.querySelector("#errorMessage");

signUpForm.addEventListener('submit', async (submitEvent) => {
  submitEvent.preventDefault();
  if (!validateUsername() || !validateEmail() || !validatePassword() || !validateConfirmPassword()) {
    return
  }
  const response = await sendSignUpData();
  if (!response || response.status !== 200) {
    signUpForm.reset();
    const body = await response.json()
    errorParagraph.innerText = body.error;
    usernameInput.classList.remove("is-invalid");
    usernameInput.classList.remove("is-valid");
    emailInput.classList.remove("is-valid");
    emailInput.classList.remove("is-invalid");
    passwordInput.classList.remove("is-invalid");
    passwordInput.classList.remove("is-valid");
    confirmPasswordInput.classList.remove("is-invalid");
    confirmPasswordInput.classList.remove("is-valid");
  } else {
    errorParagraph.innerText = "";
    console.log(window.location.href)
    window.location.href = "/signin.html";
    const body = await response.json()
    console.log(body)
  }

});

async function sendSignUpData() {
  try {
    const response = await fetch("http://localhost:5000/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: usernameInput.value,
        email: emailInput.value,
        password: passwordInput.value
      }),
      credentials: "include"
    });

    return response;

  } catch (error) {
    console.error(`Signup failed: ${error}`);
  }
}