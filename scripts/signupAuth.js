const usernameInput = document.querySelector('#username');
const passwordInput = document.querySelector('#password');
const emailInput = document.querySelector('#email');

const signUpForm = document.querySelector("#signUpForm");

signUpForm.addEventListener('submit',async (submitEvent)=>{
    submitEvent.preventDefault();
    await sendSignUpData();
})

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

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const responseBody = await response.json();
      console.log(responseBody);

    } catch (error) {
      console.error(`Signup failed: ${error}`);
  }
}


