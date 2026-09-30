# Nonscholastic

Nonscholastic is a learning platform for extracurricular skills, hobbies, workshops and educator-led classes.

## Current backend integration

- Supabase Authentication for learner/educator signup and login
- Supabase `profiles` table for role-based access
- Existing frontend UI preserved
- Protected learner and educator pages
- Supabase logout button on learner and educator pages
- Root `index.html` redirects to the login page
- Complete `database.sql` schema and RLS policies included
- LocalStorage course-save/prototype features are still kept for now

## Folder structure

```text
nonscholastic-main/
├── src/
│   ├── app.js
│   ├── js/
│   │   ├── supabase.js
│   │   ├── auth.js
│   │   ├── signup.js
│   │   └── guard.js
│   ├── screens/
│   │   ├── auth/
│   │   ├── instructor/
│   │   └── user/
│   └── styles/
│       └── global.css
└── README.md
```

## Supabase

The browser uses the Supabase publishable key in `src/js/supabase.js`. This is intended for browser use. Never replace it with a service-role/secret key.

The database schema should already contain the `profiles` table and the `handle_new_user` trigger from the Nonscholastic SQL setup.

## Test

1. Open `src/screens/auth/signup.html`.
2. Create a learner account.
3. Confirm the email if email confirmation is enabled in Supabase.
4. Sign in through `login.html`.
5. The app reads the user's `profiles.role` and opens the learner or educator dashboard.
6. Try opening a protected dashboard while logged out; it should return to login.

For local development, a simple local server is recommended instead of opening HTML files directly with `file://`. For example, VS Code Live Server works well.
