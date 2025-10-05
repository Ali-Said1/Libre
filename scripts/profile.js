import authUser from "./authUser.js";

const response = await authUser();
if (!response.ok) {
    window.location.href = "/signin.html"
}

const usernameParagraph = document.querySelector('#username');
const emailParagraph = document.querySelector("#useremail");
const currentPasswordInput = document.querySelector("#currentPassword");
const invalidPasswordWarning = document.querySelector("#invalidCurrentPassword");
const passwordChangedAlert = document.querySelector("#passwordChanged");
const changePasswordForm = document.querySelector("form");
const newPasswordInput = document.querySelector("#newPassword");
newPasswordInput.addEventListener('input', validateNewPassword);
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
    const newPassword = newPasswordInput.value;
    const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/;
    //Makes sure that the password is at least 8 characters long, contains one uppercase, one special char and one number.
    if (!passwordRegex.test(newPassword)) {
        newPasswordInput.classList.remove("is-valid");
        newPasswordInput.classList.add("is-invalid");
        return false;
    }
    newPasswordInput.classList.add("is-valid");
    newPasswordInput.classList.remove("is-invalid");
    return true;
}

async function changeCurrentPassword() {
    const newPassword = newPasswordInput.value;
    try {
        const response = await fetch('http://localhost:5000/changepassword', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ oldPassword: currentPasswordInput.value.trim(), newPassword })
        });
        if (response.status === 401) {
            invalidPasswordWarning.classList.remove("d-none");
            setTimeout(() => invalidPasswordWarning.classList.add("d-none"), 2500)
            return
        }

        if (response.ok) {
            passwordChangedAlert.classList.remove("d-none");
            setTimeout(() => passwordChangedAlert.classList.add("d-none"), 2500)
        } else {
            const errorData = await response.json();
            console.error(errorData);
        }
    } catch (err) {
        console.error(err);
    }
}
changePasswordForm.addEventListener('submit', (submitEvent) => {
    submitEvent.preventDefault();
    if (validateNewPassword()) {
        changeCurrentPassword()
    }
})
showAccountInfo();
