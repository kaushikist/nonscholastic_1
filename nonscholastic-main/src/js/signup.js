// Nonscholastic - signup

const signupForm = document.getElementById("signupForm");
const signupErrorBox = document.getElementById("errorBox");

function showSignupError(message) {
    if (!signupErrorBox) return;
    signupErrorBox.textContent = message;
    signupErrorBox.classList.add("show");
}

if (signupForm) {
    signupForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        signupErrorBox?.classList.remove("show");

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const city = document.getElementById("city").value.trim();
        const interest = document.getElementById("interest").value;
        const role = document.querySelector('input[name="role"]:checked')?.value || "learner";
        const terms = document.getElementById("terms");
        const submitButton = signupForm.querySelector('button[type="submit"]');

        if (name.length < 2) {
            showSignupError("Please enter your full name.");
            return;
        }

        if (!email || !email.includes("@")) {
            showSignupError("Please enter a valid email address.");
            return;
        }

        if (password.length < 6) {
            showSignupError("Password must contain at least 6 characters.");
            return;
        }

        if (!terms?.checked) {
            showSignupError("Please agree to the terms to continue.");
            return;
        }

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = "Creating account...";
        }

        const { data, error } = await supabaseClient.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name,
                    role,
                    city,
                    interest
                }
            }
        });

        if (error) {
            console.error(error);
            showSignupError(error.message);
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = "Create my account →";
            }
            return;
        }

        // The database trigger creates the profiles row automatically.
        // If email confirmation is disabled, update optional profile fields now.
        if (data.user && data.session) {
            const { error: profileError } = await supabaseClient
                .from("profiles")
                .update({ full_name: name })
                .eq("id", data.user.id);

            if (profileError) console.warn("Profile update warning:", profileError);

            window.location.href = role === "educator"
                ? "../instructor/instructor-dashboard.html"
                : "../user/user-dashboard.html";
            return;
        }

        alert("Account created successfully! Please check your email to confirm your account, then sign in.");
        window.location.href = "login.html";
    });
}
