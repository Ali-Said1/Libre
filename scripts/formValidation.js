//Sign up form validation

const usernameInput = document.querySelector('#username');
usernameInput.addEventListener('input',validateUsername);

const emailInput = document.querySelector("#email");
emailInput.addEventListener('input',validateEmail);

const passwordInput = document.querySelector('#password');
passwordInput.addEventListener('input',validatePassword);

const confirmPasswordInput = document.querySelector('#confirmPassword');
confirmPasswordInput.addEventListener('input',validateConfirmPassword);

const signupForm = document.querySelector("form");

signupForm.addEventListener('submit',(submitEvent)=>{
    submitEvent.preventDefault();
    if (validateUsername() && validateEmail() && validatePassword() && validateConfirmPassword()) {
        signupForm.submit();
    }
})

function validateUsername() {
    const username = usernameInput.value;
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
        usernameInput.classList.remove("is-valid");
        usernameInput.classList.add("is-invalid");
        return false;
    }
    usernameInput.classList.remove("is-invalid");
    usernameInput.classList.add("is-valid");
    return true;
}

function validateEmail() {
    const email = emailInput.value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        emailInput.classList.remove("is-valid");
        emailInput.classList.add("is-invalid");
        return false;
    }
    emailInput.classList.remove("is-invalid");
    emailInput.classList.add('is-valid');
        return true;
}
function validatePassword() {
    const password = passwordInput.value;
    const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/
    //Makes sure that the password is at least 8 characters long, contains one uppercase, one special char and one number.
    if (!passwordRegex.test(password)) {
        passwordInput.classList.remove("is-valid")
        passwordInput.classList.add("is-invalid");
        return false;
    }
    passwordInput.classList.add("is-valid")
    passwordInput.classList.remove("is-invalid");
    return true;
}

function validateConfirmPassword() {
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    if (confirmPassword != password) {
        confirmPasswordInput.classList.remove("is-valid")
        confirmPasswordInput.classList.add("is-invalid");
        return false;
    }
    confirmPasswordInput.classList.add("is-valid");
    confirmPasswordInput.classList.remove("is-invalid");
    return true;

}