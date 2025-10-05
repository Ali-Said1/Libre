const usernameParagraph = document.querySelector('#username');
const emailParagraph = document.querySelector("#useremail");
const currentPasswordInput = document.querySelector("#currentPassword");
const invalidPasswordWarning = document.querySelector("#invalidCurrentPassword");
const passwordChangedAlert = document.querySelector("#passwordChanged");
const changePasswordForm = document.querySelector("form");

async function showAccountInfo() {
    try {
        const response = await fetch('http://localhost:5000/me', { credentials: 'include' });
        const accountInfo = await response.json();
        usernameParagraph.innerText = accountInfo.username;
        emailParagraph.innerText = accountInfo.email;
    } catch (err) {
        console.error(err);
    }
}
function validateNewPassword() {
    const passwordInput = document.querySelector("#newPassword");
    const newPassword = passwordInput.value;
    const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/;
    //Makes sure that the password is at least 8 characters long, contains one uppercase, one special char and one number.
    if (!passwordRegex.test(newPassword)) {
        passwordInput.classList.remove("is-valid");
        passwordInput.classList.add("is-invalid");
        return false;
    }
    passwordInput.classList.add("is-valid");
    passwordInput.classList.remove("is-invalid");
    return true;
}

async function changeCurrentPassword() {
    const newPassword = currentPasswordInput.value;
    try {
        const res = await fetch('http://localhost:5000/me', { credentials: 'include' });
        const accountInfo = await res.json();
        const enteredPassword = currentPasswordInput.value;

        if (enteredPassword !== accountInfo.password) {
            invalidPasswordWarning.classList.remove("d-none");
            return;
        } else {
            invalidPasswordWarning.classList.add("d-none");
        }

        const response = await fetch('http://localhost:5000/me', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ password: newPassword })
        });

        if (response.ok) {
            passwordChangedAlert.classList.remove("d-none");
        } else {
            const errorData = await response.json();
            console.error(errorData);
        }
    } catch (err) {
        console.error(err);
    }
}
// changePasswordForm.addEventListener('submit', (submitEvent) => {
//     submitEvent.preventDefault();
//     if (validateNewPassword()) {
//         changePasswordForm.submit();
//     }
// })
showAccountInfo();

changePasswordForm.addEventListener("submit",changeCurrentPassword)