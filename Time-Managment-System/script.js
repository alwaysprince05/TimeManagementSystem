document.addEventListener("DOMContentLoaded", () => {
    // Safely retrieve the logged-in user
    const loggedinUser = JSON.parse(localStorage.getItem("loggedinUser")) || null;

    // Redirect to landing page if user is already logged in
    if (loggedinUser) {
        window.location.href = "landing.html";
    }

    // Initialize local storage if it doesn't exist
    if (!localStorage.getItem("users")) {
        localStorage.setItem("users", JSON.stringify([]));
    }
    if (!localStorage.getItem("loggedinUser")) {
        localStorage.setItem("loggedinUser", JSON.stringify(null));
    }

    // DOM elements for registration page
    const message = document.getElementById("message");
    const nameInput = document.getElementById("Name");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const registerButton = document.getElementById("registerButton");
    const redirectToLoginButton = document.getElementById("redirectToLogin");
    const togglePasswordButton = document.getElementById("togglePasswordButton");

    // DOM elements for login page
    const loginMessage = document.getElementById("loginMessage");
    const loginEmailInput = document.getElementById("loginemail");
    const loginPasswordInput = document.getElementById("loginPassword");
    const loginButton = document.getElementById("loginButton");
    const redirectToRegisterButton = document.getElementById("redirectToRegister");
    const loginTogglePasswordButton = document.getElementById("loginTogglePasswordButton");

    const registerPage = document.getElementById("registerPage");
    const loginPage = document.getElementById("loginPage");

    // Helper function to switch pages
    function togglePages(showRegister) {
        if (showRegister) {
            registerPage.classList.add("active");
            loginPage.classList.remove("active");
        } else {
            loginPage.classList.add("active");
            registerPage.classList.remove("active");
        }
    }

    // Helper function to validate email format
    function validateEmail(email) {
        return email.endsWith('@gmail.com');
    }

    // Helper function to validate password strength
    function validatePassword(password) {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        return regex.test(password);
    }

    // Helper function to validate name (only letters and spaces)
    function validateName(name) {
        const regex = /^[a-zA-Z\s]+$/;
        return regex.test(name);
    }

    // Handle registration
    if (registerButton) {
        registerButton.addEventListener("click", () => {
            const name = nameInput.value.trim();
            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();

            if (!name || !email || !password) {
                message.textContent = "Please fill in all fields!";
                message.style.color = "red";
                return;
            }

            if (!validateName(name)) {
                message.textContent = "Name must only contain letters and spaces.";
                message.style.color = "red";
                return;
            }

            if (!validateEmail(email)) {
                message.textContent = "Email must end with @gmail.com.";
                message.style.color = "red";
                return;
            }

            if (!validatePassword(password)) {
                message.textContent = "Password must be at least 8 characters long and contain one uppercase letter, one lowercase letter, and one number.";
                message.style.color = "red";
                return;
            }

            const users = JSON.parse(localStorage.getItem("users"));
            const userExists = users.some(user => user.email === email);

            if (userExists) {
                message.textContent = "Email already registered. Try a different one.";
                message.style.color = "red";
            } else {
                users.push({ name, email, password });
                localStorage.setItem("users", JSON.stringify(users));
                message.textContent = "Account created successfully! You can now log in.";
                message.style.color = "green";

                // Clear input fields
                nameInput.value = "";
                emailInput.value = "";
                passwordInput.value = "";
            }
        });
    }

    // Redirect to login page
    if (redirectToLoginButton) {
        redirectToLoginButton.addEventListener("click", (e) => {
            e.preventDefault();
            togglePages(false);
        });
    }

    // Handle login
    if (loginButton) {
        loginButton.addEventListener("click", () => {
            const email = loginEmailInput.value.trim();
            const password = loginPasswordInput.value.trim();

            const users = JSON.parse(localStorage.getItem("users"));
            const user = users.find(user => user.email === email && user.password === password);

            if (user) {
                // Store logged-in user, including their name and email
                localStorage.setItem(
                    "loggedinUser",
                    JSON.stringify({ name: user.name, email: user.email })
                );

                loginMessage.textContent = `Welcome, ${user.name}! Redirecting...`;
                loginMessage.style.color = "green";

                setTimeout(() => {
                    window.location.href = "landing.html";
                }, 1000);
            } else {
                loginMessage.textContent = "User not found. Please sign up first.";
                loginMessage.style.color = "red";
            }
        });
    }

    // Redirect to register page
    if (redirectToRegisterButton) {
        redirectToRegisterButton.addEventListener("click", (e) => {
            e.preventDefault();
            togglePages(true);
        });
    }

    // Toggle password visibility for registration
    togglePasswordButton.addEventListener("click", () => {
        const type = passwordInput.type === "password" ? "text" : "password";
        passwordInput.type = type;
        togglePasswordButton.textContent = type === "password" ? "Show Password" : "Hide Password";
    });

    // Toggle password visibility for login
    loginTogglePasswordButton.addEventListener("click", () => {
        const type = loginPasswordInput.type === "password" ? "text" : "password";
        loginPasswordInput.type = type;
        loginTogglePasswordButton.textContent = type === "password" ? "Show Password" : "Hide Password";
    });
});
