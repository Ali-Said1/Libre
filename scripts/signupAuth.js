const usernameInput = document.querySelector('#username');
const passwordInput = document.querySelector('#password');
const emailInput = document.querySelector('#email');

const signUpForm = document.querySelector("#signUpForm");
const errorParagraph = document.querySelector("#errorMessage");

signUpForm.addEventListener('submit', async (submitEvent) => {
  submitEvent.preventDefault();
  const response = await sendSignUpData();
  if (!response || response.status !== 200) {
    signUpForm.reset();
    errorParagraph.innerText = "Registration failed. Please try again.";
  } else {
    errorParagraph.innerText = "";
    window.location.href = "signin.html";
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