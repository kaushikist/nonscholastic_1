
/* Nonscholastic - Interactive Nono Chatbot */

(() => {
  if (document.getElementById("nono-chatbot")) return;

  const path = window.location.pathname.toLowerCase();
  const isEducator = path.includes("/instructor/");
  const role = isEducator ? "educator" : "learner";

  const learnerActions = [
    { label: "🔎 Explore classes", message: "explore", url: "explore.html" },
    { label: "📚 My courses", message: "courses", url: "my-courses.html" },
    { label: "📅 My schedule", message: "schedule", url: "schedule.html" },
    { label: "👤 My profile", message: "profile", url: "profile.html" }
  ];

  const educatorActions = [
    { label: "🎓 Manage my classes", message: "classes" },
    { label: "📅 Schedule a session", message: "sessions" },
    { label: "👥 Help my students", message: "students" },
    { label: "👤 My profile", message: "profile" }
  ];

  const actions = isEducator ? educatorActions : learnerActions;

  const style = document.createElement("style");
  style.textContent = `
    #nono-chatbot { position:fixed; right:22px; bottom:22px; z-index:99999;
      font-family:inherit; color:#25334b; }
    #nono-toggle { border:0; border-radius:30px; padding:13px 19px;
      background:#507db8; color:white; cursor:pointer; font-size:15px;
      font-weight:600; box-shadow:0 6px 22px #253b5b30; }
    #nono-toggle:hover { background:#3f69a3; }
    #nono-window { display:none; position:absolute; right:0; bottom:64px;
      width:min(355px,calc(100vw - 32px)); height:470px; max-height:70vh;
      background:white; border:1px solid #e2e9f3; border-radius:19px;
      box-shadow:0 14px 45px #203b6028; overflow:hidden; flex-direction:column; }
    #nono-window.nono-open { display:flex; }
    .nono-header { background:linear-gradient(135deg,#507db8,#6f9edb);
      color:white; padding:16px; display:flex; align-items:center; gap:11px; }
    .nono-avatar { width:40px; height:40px; border-radius:50%;
      background:#ffffff32; display:grid; place-items:center; font-size:23px; }
    .nono-heading { flex:1; }
    .nono-heading strong { display:block; font-size:16px; }
    .nono-heading small { opacity:.9; font-size:12px; }
    #nono-close { border:0; background:transparent; color:white;
      font-size:24px; cursor:pointer; }
    #nono-messages { flex:1; overflow-y:auto; padding:14px; background:#f8faff; }
    .nono-message { margin:0 0 11px; display:flex; }
    .nono-message span { max-width:88%; padding:10px 12px; border-radius:13px;
      font-size:13px; line-height:1.55; white-space:pre-wrap; overflow-wrap:anywhere; }
    .nono-bot span { background:white; border:1px solid #e7edf6; }
    .nono-user { justify-content:flex-end; }
    .nono-user span { background:#507db8; color:white; }
    #nono-actions { padding:9px 12px 3px; display:flex; gap:7px;
      flex-wrap:wrap; background:white; }
    .nono-chip { border:1px solid #d5e2f5; background:#f4f8ff; color:#345d96;
      border-radius:18px; padding:7px 10px; cursor:pointer; font-size:12px; }
    .nono-chip:hover { background:#e6efff; }
    #nono-form { display:flex; padding:11px; gap:7px; border-top:1px solid #edf0f6;
      background:white; }
    #nono-input { min-width:0; flex:1; border:1px solid #dce4ef;
      border-radius:22px; padding:11px 13px; font:inherit; font-size:13px;
      outline:none; }
    #nono-input:focus { border-color:#6f9edb; }
    #nono-send { border:0; border-radius:50%; width:40px; height:40px;
      background:#507db8; color:white; cursor:pointer; font-size:18px; }
    .nono-link { display:inline-block; margin-top:7px; color:#345d96;
      font-weight:600; text-decoration:underline; }
    @media(max-width:480px) {
      #nono-chatbot { right:12px; bottom:12px; }
      #nono-window { height:min(470px,72vh); }
    }
  `;
  document.head.appendChild(style);

  const root = document.createElement("div");
  root.id = "nono-chatbot";
  root.innerHTML = `
    <section id="nono-window" role="dialog" aria-label="Nono chatbot"
      aria-modal="false">
      <header class="nono-header">
        <div class="nono-avatar">✨</div>
        <div class="nono-heading">
          <strong>Nono · Nonscholastic</strong>
          <small>${isEducator ? "Educator assistant" : "Learning companion"}</small>
        </div>
        <button id="nono-close" aria-label="Close chat" type="button">×</button>
      </header>
      <div id="nono-messages" aria-live="polite"></div>
      <div id="nono-actions"></div>
      <form id="nono-form">
        <input id="nono-input" type="text" autocomplete="off"
          placeholder="Ask me anything..." aria-label="Your message" />
        <button id="nono-send" type="submit" aria-label="Send message">➤</button>
      </form>
    </section>
    <button id="nono-toggle" type="button" aria-expanded="false">
      ✨ Ask Nono
    </button>
  `;
  document.body.appendChild(root);

  const chatWindow = root.querySelector("#nono-window");
  const toggle = root.querySelector("#nono-toggle");
  const close = root.querySelector("#nono-close");
  const messages = root.querySelector("#nono-messages");
  const chips = root.querySelector("#nono-actions");
  const form = root.querySelector("#nono-form");
  const input = root.querySelector("#nono-input");

  function addMessage(text, sender = "bot", link = null) {
    const row = document.createElement("div");
    row.className = `nono-message nono-${sender}`;
    const bubble = document.createElement("span");
    bubble.textContent = text;

    if (link) {
      const anchor = document.createElement("a");
      anchor.className = "nono-link";
      anchor.href = link.url;
      anchor.textContent = link.label;
      bubble.appendChild(document.createElement("br"));
      bubble.appendChild(anchor);
    }

    row.appendChild(bubble);
    messages.appendChild(row);
    messages.scrollTop = messages.scrollHeight;
  }

  function setActions(items = actions) {
    chips.replaceChildren();
    items.forEach((action) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "nono-chip";
      button.textContent = action.label;
      button.addEventListener("click", () => {
        if (action.url) {
          addMessage(action.label, "user");
          window.location.href = action.url;
        } else {
          handleMessage(action.message);
        }
      });
      chips.appendChild(button);
    });
  }

  function openChat() {
    chatWindow.classList.add("nono-open");
    toggle.setAttribute("aria-expanded", "true");
    input.focus();
  }

  function closeChat() {
    chatWindow.classList.remove("nono-open");
    toggle.setAttribute("aria-expanded", "false");
  }

  toggle.addEventListener("click", () => {
    if (chatWindow.classList.contains("nono-open")) closeChat();
    else openChat();
  });
  close.addEventListener("click", closeChat);

  function getSupabaseClient() {
    try {
      if (window.supabaseClient) return window.supabaseClient;
      if (typeof supabaseClient !== "undefined") return supabaseClient;
    } catch (_) {}
    return null;
  }

  async function searchCourses() {
    const client = getSupabaseClient();
    if (!client) {
      addMessage("Course search isn't connected on this page yet. Open Explore Classes to browse the platform.");
      return;
    }

    addMessage("Let me look for available classes…");
    const { data, error } = await client
      .from("courses")
      .select("id, title, category, description")
      .limit(5);

    if (error) {
      console.error("Nono course search:", error);
      addMessage("I couldn't load classes right now. Please try the Explore Classes page.");
      return;
    }

    if (!data || data.length === 0) {
      addMessage("There aren't any classes listed yet. Check back soon, or explore again later!");
      return;
    }

    const result = data.map((course, index) =>
      `${index + 1}. ${course.title}${course.category ? " · " + course.category : ""}`
    ).join("\n");

    addMessage("Here are some classes currently listed:\n" + result);
  }

  function handleMessage(raw) {
    const message = raw.trim();
    if (!message) return;

    addMessage(message, "user");
    const text = message.toLowerCase();

    if (/\b(hi|hello|hey|hii|good morning|good evening)\b/.test(text)) {
      addMessage(`Hey there! 💙 I'm Nono, your ${isEducator ? "educator" : "learning"} assistant. What can I help you with?`);
      setActions();
    } else if (/\b(course|courses|class|classes|learn|explore|hobby|skill)\b/.test(text)) {
      if (/\b(search|find|show|available|recommend|list)\b/.test(text) || text === "explore") {
        searchCourses();
      } else {
        addMessage(isEducator
          ? "You can use Nonscholastic to organise classes and share your skills. What would you like to manage?"
          : "You can explore classes, save courses and keep track of your learning. Try Explore Classes to get started.");
        setActions();
      }
    } else if (/\b(progress|completed|lesson|learning progress)\b/.test(text)) {
      addMessage(isEducator
        ? "You can guide learners through their classes and check in with them. Open your educator dashboard to find the tools available to your account."
        : "Your progress page is where you can review your learning activity. Use the My Progress option in your dashboard navigation.");
      setActions();
    } else if (/\b(schedule|session|meeting|calendar|upcoming)\b/.test(text)) {
      addMessage(isEducator
        ? "To plan a session, open your educator dashboard and look for the session or scheduling controls. Make sure the date and meeting details are correct before sharing them."
        : "Check your Schedule page for upcoming sessions and learning plans.");
      if (!isEducator) setActions();
    } else if (/\b(student|students|learner|learners|enrol|enrollment)\b/.test(text)) {
      addMessage(isEducator
        ? "Keep class details clear, share session information with learners and check messages for questions. Available tools depend on the features enabled on your dashboard."
        : "You can use your dashboard to access your courses and communicate with educators where messaging is available.");
      setActions();
    } else if (/\b(profile|account|name|bio|settings)\b/.test(text)) {
      addMessage("You can manage your account from the Profile or Settings section of your dashboard.");
      setActions();
    } else if (/\b(saved|bookmark|favourite|favorite)\b/.test(text)) {
      addMessage(isEducator
        ? "Your dashboard is the place to manage your educator activity."
        : "You can revisit classes you've saved from your Saved section.");
      setActions();
    } else if (/\b(message|messages|chat|contact)\b/.test(text)) {
      addMessage("Open the Messages section of your dashboard to check conversations, if messaging is enabled for your account.");
      setActions();
    } else if (/\b(help|what can you do|options|menu)\b/.test(text)) {
      addMessage("I can help you navigate Nonscholastic, find classes, understand schedules and locate platform features. Choose an option below or type your question.");
      setActions();
    } else if (/\b(thank|thanks|thank you)\b/.test(text)) {
      addMessage("You're very welcome! ✨ Keep learning, creating and exploring.");
      setActions();
    } else if (/\b(classes|manage classes)\b/.test(text) && isEducator) {
      addMessage("Open your educator dashboard and look for the class-management controls. You can use them to organise your teaching activity.");
    } else if (/\b(logout|log out|sign out|signout)\b/.test(text)) {
      addMessage("To securely sign out, use the Logout button in your dashboard.");
    } else {
      addMessage("I'm still learning! I can help with courses, classes, schedules, progress, saved items, profiles and platform navigation. Try one of the options below. 💙");
      setActions();
    }
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const value = input.value;
    input.value = "";
    handleMessage(value);
  });

  addMessage(
    `Hi! 👋 Welcome to Nonscholastic. I'm Nono, your ${isEducator ? "educator" : "learning"} assistant. Ask me a question or choose an option below!`
  );
  setActions();
})();
