const usernameInput = document.querySelector('#username');
const passwordInput = document.querySelector('#password');

const signInForm = document.querySelector("#signInForm");
const errorParagraph = document.querySelector("#errorMessage");
signInForm.addEventListener('submit', async (submitEvent) => {
  submitEvent.preventDefault();
  const response = await sendSignInData();
  if (!response || response.status !== 200) {
    signInForm.reset();
    errorParagraph.innerText = "Incorrect Username/Password";
  } else {
    errorParagraph.innerText = "";
    window.location.href = "index.html";
  }
});

async function sendSignInData() {
  try {
    const response = await fetch("http://localhost:5000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: usernameInput.value,
        password: passwordInput.value
      }),
      credentials: "include"
    });

    return response;

  } catch (error) {
    console.error(`Signin failed: ${error}`);
  }
}
