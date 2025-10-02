const usernameInput = document.querySelector('#username');
const passwordInput = document.querySelector('#password');

const signInForm = document.querySelector("#signInForm");

signInForm.addEventListener('submit', async (submitEvent) => {
  submitEvent.preventDefault();
  await sendSignInData();
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

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const responseBody = await response.json();
    console.log(responseBody);

  } catch (error) {
    console.error(`Signin failed: ${error}`);
  }
}
