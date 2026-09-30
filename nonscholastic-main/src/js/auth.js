// Nonscholastic - login

const loginForm = document.getElementById("loginForm");
const errorBox = document.getElementById("errorBox");

function showLoginError(message) {
    if (!errorBox) return;
    errorBox.textContent = message;
    errorBox.classList.add("show");
}

if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        errorBox?.classList.remove("show");

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const submitButton = loginForm.querySelector('button[type="submit"]');

        if (!email || !password) {
            showLoginError("Please enter your email and password.");
            return;
        }

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = "Signing in...";
        }

        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            console.error(error);
            showLoginError(error.message);
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = "Sign in →";
            }
            return;
        }

        const { data: profile, error: profileError } = await supabaseClient
            .from("profiles")
            .select("role, full_name")
            .eq("id", data.user.id)
            .single();

        if (profileError || !profile) {
            console.error(profileError);
            await supabaseClient.auth.signOut();
            showLoginError("Login worked, but your profile could not be loaded. Please try again.");
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = "Sign in →";
            }
            return;
        }

        if (profile.role === "educator") {
            window.location.href = "../instructor/instructor-dashboard.html";
        } else {
            window.location.href = "../user/user-dashboard.html";
        }
    });
}
