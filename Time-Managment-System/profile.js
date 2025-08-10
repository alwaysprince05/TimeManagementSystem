const profileUsername = document.getElementById("profilename");
const profileEmail = document.getElementById("profileEmail");
const editProfileButton = document.getElementById("editProfileButton");
const popup = document.getElementById("popup");
const overlay = document.getElementById("overlay");
const saveButton = document.getElementById("saveButton");
const cancelButton = document.getElementById("cancelButton");
const newNameInput = document.getElementById("newName");
const newEmailInput = document.getElementById("newEmail");
const loggedinUser = JSON.parse(localStorage.getItem("loggedinUser"));

if (!loggedinUser) {
    window.location.href = "index.html";
} else {
    profileUsername.textContent = `Name: ${loggedinUser.name}`;
    profileEmail.textContent = `Email: ${loggedinUser.email}`;
}

editProfileButton.addEventListener("click", () => {
    newNameInput.value = loggedinUser.name;
    newEmailInput.value = loggedinUser.email;
    popup.classList.add("active");
    overlay.classList.add("active");
});

cancelButton.addEventListener("click", () => {
    popup.classList.remove("active");
    overlay.classList.remove("active");
});

saveButton.addEventListener("click", () => {
    const newName = newNameInput.value.trim();
    const newEmail = newEmailInput.value.trim();

    if (newName && newEmail) {
        loggedinUser.name = newName;
        loggedinUser.email = newEmail;
        localStorage.setItem("loggedinUser", JSON.stringify(loggedinUser));

        profileUsername.textContent = `Name: ${loggedinUser.name}`;
        profileEmail.textContent = `Email: ${loggedinUser.email}`;

        alert("Profile updated successfully!");
        popup.classList.remove("active");
        overlay.classList.remove("active");
    } else {
        alert("Please fill in all fields.");
    }
});

overlay.addEventListener("click", () => {
    popup.classList.remove("active");
    overlay.classList.remove("active");
});
