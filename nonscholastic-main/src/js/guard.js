// Nonscholastic - protected page guard
// Add data-role="learner" or data-role="educator" to <body> on protected pages.

(async function () {
    const requiredRole = document.body.dataset.role;
    const { data: { session } } = await supabaseClient.auth.getSession();

    if (!session) {
        window.location.href = "../auth/login.html";
        return;
    }

    const { data: profile, error } = await supabaseClient
        .from("profiles")
        .select("role, full_name")
        .eq("id", session.user.id)
        .single();

    if (error || !profile) {
        console.error(error);
        await supabaseClient.auth.signOut();
        window.location.href = "../auth/login.html";
        return;
    }

    if (requiredRole && profile.role !== requiredRole) {
        window.location.href = profile.role === "educator"
            ? "../instructor/instructor-dashboard.html"
            : "../user/user-dashboard.html";
        return;
    }

    window.nsUser = session.user;
    window.nsProfile = profile;

    // Replace the demo profile name when the page has the standard profile block.
    document.querySelectorAll(".profile-info strong").forEach(el => {
        if (profile.full_name) el.textContent = profile.full_name;
    });
})();

async function nsLogout() {
    await supabaseClient.auth.signOut();
    window.location.href = "../auth/login.html";
}
