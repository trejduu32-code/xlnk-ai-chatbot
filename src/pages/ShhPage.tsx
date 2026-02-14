const ShhPage = () => {
  return (
    <div style={{ width: "100%", height: "100vh", margin: 0, padding: 0 }}>
      <iframe
        srcDoc={shhHtml}
        style={{ width: "100%", height: "100%", border: "none" }}
        title="Xlnk AI - Static"
      />
    </div>
  );
};

const shhHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Xlnk AI</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  :root {
    --bg: #0a0a0a;
    --card: #0f0f0f;
    --border: #2e2e2e;
    --fg: #f0f1f5;
    --muted: #8c8c8c;
    --secondary: #1f1f1f;
    --accent: #2e2e2e;
  }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: var(--bg);
    color: var(--fg);
    height: 100vh;
    overflow: hidden;
    display: flex;
  }

  /* Sidebar */
  .sidebar {
    width: 288px;
    background: var(--card);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    transition: transform 0.3s;
    position: fixed;
    left: 0; top: 0;
    height: 100%;
    z-index: 50;
  }
  .sidebar.closed { transform: translateX(-100%); }
  .sidebar-header {
    padding: 16px;
    border-bottom: 1px solid var(--border);
  }
  .sidebar-header-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
  .sidebar-title {
    font-size: 18px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .new-chat-btn {
    width: 100%;
    padding: 10px;
    background: var(--secondary);
    color: var(--fg);
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    transition: background 0.2s;
  }
  .new-chat-btn:hover { background: var(--accent); }
  .close-btn {
    background: none; border: none; color: var(--muted);
    cursor: pointer; padding: 8px; border-radius: 8px;
    transition: background 0.2s;
  }
  .close-btn:hover { background: var(--accent); }
  .conv-list {
    flex: 1;
    overflow-y: auto;
    padding: 12px;
  }
  .conv-item {
    width: 100%;
    text-align: left;
    padding: 10px 12px;
    background: none;
    border: none;
    color: var(--fg);
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    transition: background 0.2s;
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 4px;
  }
  .conv-item:hover, .conv-item.active { background: var(--accent); }

  /* Overlay */
  .overlay {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.6);
    z-index: 40;
    backdrop-filter: blur(4px);
  }
  .overlay.show { display: block; }

  /* Main */
  .main {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
    transition: margin-left 0.3s;
  }
  .main.shifted { margin-left: 288px; }

  /* Header */
  .header {
    padding: 12px 16px;
    border-bottom: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .menu-btn {
    background: none; border: none; color: var(--fg);
    cursor: pointer; padding: 8px; border-radius: 8px;
    transition: background 0.2s;
  }
  .menu-btn:hover { background: var(--accent); }
  .logo-text {
    font-size: 18px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* Model Dropdown - Liquid Glass */
  .model-dropdown { position: relative; }
  .model-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border-radius: 16px;
    border: 1px solid rgba(255,255,255,0.15);
    background: rgba(255,255,255,0.05);
    backdrop-filter: blur(20px);
    color: var(--fg);
    font-size: 13px;
    cursor: pointer;
    transition: all 0.3s;
    box-shadow: inset 0 1px 1px rgba(255,255,255,0.1), 0 4px 24px rgba(0,0,0,0.3);
  }
  .model-btn:hover {
    background: rgba(255,255,255,0.1);
    border-color: rgba(255,255,255,0.25);
    box-shadow: inset 0 1px 1px rgba(255,255,255,0.15), 0 8px 32px rgba(0,0,0,0.4);
  }
  .model-menu {
    display: none;
    position: absolute;
    right: 0;
    top: calc(100% + 8px);
    min-width: 140px;
    background: var(--card);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 12px;
    overflow: hidden;
    z-index: 100;
    box-shadow: 0 8px 32px rgba(0,0,0,0.5);
    backdrop-filter: blur(20px);
  }
  .model-menu.open { display: block; }
  .model-option {
    width: 100%;
    text-align: left;
    padding: 10px 16px;
    background: none;
    border: none;
    color: var(--fg);
    font-size: 14px;
    cursor: pointer;
    transition: background 0.2s;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .model-option:hover { background: var(--accent); }
  .model-option.selected { background: rgba(255,255,255,0.05); }
  .check { font-size: 12px; }

  /* Chat Area */
  .chat-area {
    flex: 1;
    overflow-y: auto;
    padding: 24px 16px 140px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .chat-area::-webkit-scrollbar { width: 10px; }
  .chat-area::-webkit-scrollbar-track { background: transparent; }
  .chat-area::-webkit-scrollbar-thumb {
    background: var(--muted);
    border-radius: 5px;
  }

  /* Empty State */
  .empty-state {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-bottom: 120px;
  }
  .empty-inner { text-align: center; }
  .empty-icon {
    width: 64px; height: 64px;
    background: var(--secondary);
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;
    font-size: 32px;
  }
  .empty-title {
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 8px;
  }
  .empty-desc {
    color: var(--muted);
    font-size: 14px;
    max-width: 320px;
    margin: 0 auto;
  }

  /* Messages */
  .msg { display: flex; gap: 12px; animation: fadeIn 0.3s; }
  .msg.user { justify-content: flex-end; }
  .msg.assistant { justify-content: flex-start; }
  .msg-avatar {
    width: 32px; height: 32px;
    border-radius: 50%;
    background: var(--secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 14px;
  }
  .msg-bubble {
    max-width: 80%;
    padding: 12px 16px;
    border-radius: 16px;
    font-size: 14px;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-word;
  }
  .msg.user .msg-bubble {
    background: var(--secondary);
    border-bottom-right-radius: 4px;
  }
  .msg.assistant .msg-bubble {
    background: #262626;
    border-bottom-left-radius: 4px;
  }

  /* Search Sources */
  .sources-card {
    margin-top: 8px;
    margin-left: 44px;
    padding: 12px;
    border: 1px solid var(--border);
    border-radius: 12px;
    background: var(--card);
  }
  .sources-title {
    font-size: 11px;
    color: var(--muted);
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .source-link {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 8px;
    border-radius: 8px;
    text-decoration: none;
    color: var(--fg);
    font-size: 12px;
    transition: background 0.2s;
  }
  .source-link:hover { background: rgba(255,255,255,0.05); }
  .source-link img { width: 16px; height: 16px; border-radius: 3px; }
  .source-host { font-size: 10px; color: var(--muted); }

  /* Input Area */
  .input-area {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    padding: 16px;
    padding-bottom: 24px;
    display: flex;
    justify-content: center;
    background: linear-gradient(to top, var(--bg), var(--bg), transparent);
  }
  .input-container {
    width: 100%;
    max-width: 640px;
    border-radius: 16px;
    padding: 1.5px;
    background: linear-gradient(to bottom right, #808080, #363636, #363636, #363636);
    position: relative;
    overflow: hidden;
  }
  .input-inner {
    background: rgba(0,0,0,0.5);
    border-radius: 15px;
    overflow: hidden;
  }
  .input-inner textarea {
    width: 100%;
    height: 50px;
    background: transparent;
    border: none;
    color: var(--fg);
    font-size: 14px;
    padding: 12px;
    resize: none;
    outline: none;
    font-family: inherit;
  }
  .input-inner textarea::placeholder { color: rgba(255,255,255,0.5); }
  .input-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 12px 12px;
  }
  .attach-btn {
    background: none; border: none;
    color: rgba(255,255,255,0.1);
    cursor: pointer;
    transition: all 0.3s;
    font-size: 18px;
  }
  .attach-btn:hover { color: #fff; transform: translateY(-2px); }
  .send-btn {
    width: 34px; height: 34px;
    border-radius: 10px;
    border: none;
    background: linear-gradient(to top, #292929, #545454, #292929);
    box-shadow: inset 0 6px 2px -4px rgba(255,255,255,0.5);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--muted);
    font-size: 16px;
    transition: all 0.15s;
  }
  .send-btn:hover { color: var(--fg); }
  .send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .send-btn:active { transform: scale(0.95); }

  /* Loading */
  .loading-dots {
    display: flex; gap: 4px;
    padding: 12px 16px;
    background: #262626;
    border-radius: 16px;
    border-bottom-left-radius: 4px;
  }
  .loading-dots span {
    width: 8px; height: 8px;
    background: var(--muted);
    border-radius: 50%;
    animation: bounce 1.4s infinite;
  }
  .loading-dots span:nth-child(2) { animation-delay: 0.15s; }
  .loading-dots span:nth-child(3) { animation-delay: 0.3s; }

  /* Typing cursor */
  .cursor {
    display: inline-block;
    width: 3px;
    height: 1.1em;
    background: rgba(255,255,255,0.8);
    border-radius: 2px;
    vertical-align: middle;
    margin-left: 2px;
    animation: blink 0.8s step-end infinite;
  }

  @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes bounce {
    0%, 80%, 100% { transform: translateY(0); }
    40% { transform: translateY(-6px); }
  }
  @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }

  @media (max-width: 768px) {
    .main.shifted { margin-left: 0; }
    .msg-bubble { max-width: 90%; }
  }
</style>
</head>
<body>

<!-- Overlay -->
<div class="overlay" id="overlay" onclick="closeSidebar()"></div>

<!-- Sidebar -->
<aside class="sidebar closed" id="sidebar">
  <div class="sidebar-header">
    <div class="sidebar-header-top">
      <span class="sidebar-title">✦ Chats</span>
      <button class="close-btn" onclick="closeSidebar()">✕</button>
    </div>
    <button class="new-chat-btn" onclick="newChat()">+ New Chat</button>
  </div>
  <div class="conv-list" id="convList"></div>
</aside>

<!-- Main -->
<div class="main" id="mainArea">
  <!-- Header -->
  <div class="header">
    <div class="header-left">
      <button class="menu-btn" onclick="toggleSidebar()">☰</button>
      <span class="logo-text">✦ Xlnk AI</span>
    </div>
    <div class="model-dropdown">
      <button class="model-btn" onclick="toggleModelMenu(event)">
        <span id="selectedModelLabel">700M</span>
        <span style="font-size:10px">▼</span>
      </button>
      <div class="model-menu" id="modelMenu"></div>
    </div>
  </div>

  <!-- Chat -->
  <div style="flex:1;position:relative;display:flex;flex-direction:column;overflow:hidden;">
    <div class="chat-area" id="chatArea">
      <div class="empty-state" id="emptyState">
        <div class="empty-inner">
          <div class="empty-icon">✦</div>
          <div class="empty-title">Welcome to Xlnk AI</div>
          <p class="empty-desc">Your intelligent assistant powered by cutting-edge language models. Start a conversation below.</p>
        </div>
      </div>
    </div>
    <div class="input-area">
      <div class="input-container">
        <div class="input-inner">
          <textarea id="msgInput" placeholder="ask Xlnk Ai...✦˚" onkeydown="handleKey(event)"></textarea>
          <div class="input-actions">
            <button class="attach-btn" onclick="document.getElementById('fileInput').click()">📎</button>
            <input type="file" id="fileInput" style="display:none" multiple onchange="handleFiles(event)">
            <button class="send-btn" id="sendBtn" onclick="handleSendClick()">➤</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<script>
const MODELS = [
  { value: "https://xlnk-350m.hf.space/v1/chat/completions", label: "350M" },
  { value: "https://xlnk-ai.hf.space/v1/chat/completions", label: "700M" },
  { value: "https://xlnk-corelm.hf.space/v1/chat/completions", label: "1B" },
  { value: "https://xlnk-ai-corelm.hf.space/v1/chat/completions", label: "CoreLM" },
];
const SEARCH_ENGINES = [
  { url: "https://search.sapti.me/search?q={q}&format=json&categories=general" },
  { url: "https://searx.tiekoetter.com/search?q={q}&format=json&categories=general" },
  { url: "https://xlnk-search.hf.space/search?q={q}" },
];

let selectedModel = MODELS[1].value;
let conversations = JSON.parse(localStorage.getItem("shh-convos") || "[]");
let activeId = conversations[0]?.id || null;
let isLoading = false;
let abortCtrl = null;
let streamingContent = "";
const isMobile = () => window.innerWidth < 768;

// Init model menu
function renderModelMenu() {
  const menu = document.getElementById("modelMenu");
  menu.innerHTML = MODELS.map(m =>
    '<button class="model-option ' + (m.value === selectedModel ? 'selected' : '') + '" onclick="selectModel(\\'' + m.value + '\\',\\'' + m.label + '\\')">' +
    '<span>' + m.label + '</span>' +
    (m.value === selectedModel ? '<span class="check">✓</span>' : '') +
    '</button>'
  ).join("");
}
renderModelMenu();

function selectModel(val, label) {
  selectedModel = val;
  document.getElementById("selectedModelLabel").textContent = label;
  document.getElementById("modelMenu").classList.remove("open");
  renderModelMenu();
}
function toggleModelMenu(e) {
  e.stopPropagation();
  document.getElementById("modelMenu").classList.toggle("open");
}
document.addEventListener("click", () => document.getElementById("modelMenu").classList.remove("open"));

// Sidebar
function toggleSidebar() {
  const sb = document.getElementById("sidebar");
  const ov = document.getElementById("overlay");
  const main = document.getElementById("mainArea");
  if (sb.classList.contains("closed")) {
    sb.classList.remove("closed");
    if (isMobile()) ov.classList.add("show");
    else main.classList.add("shifted");
  } else closeSidebar();
}
function closeSidebar() {
  document.getElementById("sidebar").classList.add("closed");
  document.getElementById("overlay").classList.remove("show");
  document.getElementById("mainArea").classList.remove("shifted");
}

// Conversations
function save() { localStorage.setItem("shh-convos", JSON.stringify(conversations)); }
function genId() { return Math.random().toString(36).substr(2, 12); }

function newChat() {
  const c = { id: genId(), title: "New Chat", messages: [] };
  conversations.unshift(c);
  activeId = c.id;
  save(); renderConvs(); renderMessages();
  closeSidebar();
}
function renderConvs() {
  const list = document.getElementById("convList");
  list.innerHTML = conversations.map(c =>
    '<button class="conv-item ' + (c.id === activeId ? 'active' : '') + '" onclick="loadConv(\\'' + c.id + '\\')">' +
    '💬 <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + c.title + '</span></button>'
  ).join("");
}

function loadConv(id) {
  activeId = id;
  renderConvs();
  renderMessages();
  if (isMobile()) closeSidebar();
}

function getActive() { return conversations.find(c => c.id === activeId); }

function renderMessages() {
  const area = document.getElementById("chatArea");
  const conv = getActive();
  const empty = document.getElementById("emptyState");

  if (!conv || conv.messages.length === 0) {
    area.innerHTML = '';
    area.appendChild(empty || createEmpty());
    document.getElementById("emptyState").style.display = "flex";
    return;
  }

  let html = '';
  conv.messages.forEach(m => {
    if (m.role === "user") {
      html += '<div class="msg user"><div class="msg-bubble">' + escHtml(m.content) + '</div><div class="msg-avatar">👤</div></div>';
    } else {
      html += '<div class="msg assistant"><div class="msg-avatar">🤖</div><div class="msg-bubble">' + escHtml(m.content) + '</div></div>';
      if (m.sources && m.sources.length > 0) {
        html += '<div class="sources-card"><div class="sources-title">🌐 Sources searched</div>';
        m.sources.forEach(s => {
          try {
            const host = new URL(s.url).hostname;
            html += '<a class="source-link" href="' + s.url + '" target="_blank"><img src="https://www.google.com/s2/favicons?domain=' + host + '&sz=16" alt=""><div><div>' + escHtml(s.title || host) + '</div><div class="source-host">' + host + '</div></div></a>';
          } catch(e) {}
        });
        html += '</div>';
      }
    }
  });
  area.innerHTML = html;
  area.scrollTop = area.scrollHeight;
}

function createEmpty() {
  const d = document.createElement("div");
  d.className = "empty-state";
  d.id = "emptyState";
  d.innerHTML = '<div class="empty-inner"><div class="empty-icon">✦</div><div class="empty-title">Welcome to Xlnk AI</div><p class="empty-desc">Your intelligent assistant powered by cutting-edge language models.</p></div>';
  return d;
}

function escHtml(s) { const d = document.createElement("div"); d.textContent = s; return d.innerHTML; }

// Search
function shouldSearch(msg) {
  const l = msg.toLowerCase();
  return /^(what|who|when|where|why|how|which|is|are|was|were|do|does|did|can|could|will|would|should)\\b/.test(l) ||
    /\\b(latest|current|recent|news|today|update|price|weather|score)\\b/.test(l) ||
    /\\b(tell me about|explain|define|meaning of|search for|look up|find)\\b/.test(l);
}

async function fetchSearch(query) {
  for (const eng of SEARCH_ENGINES) {
    try {
      const url = eng.url.replace("{q}", encodeURIComponent(query));
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (!res.ok) continue;
      const data = await res.json();
      const results = Array.isArray(data) ? data : data.results || data.data || [];
      if (!results.length) continue;
      const sources = results.slice(0, 5).map(r => ({
        title: r.title || r.name || "",
        url: r.url || r.link || r.href || "",
        snippet: r.snippet || r.content || r.description || r.text || "",
      })).filter(s => s.url);
      if (!sources.length) continue;
      const ctx = sources.map((s, i) => "[" + (i+1) + "] " + s.title + ": " + s.snippet).join("\\n");
      return { context: ctx, sources };
    } catch(e) { continue; }
  }
  return { context: "", sources: [] };
}

// Send
function handleKey(e) {
  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendClick(); }
}
function handleFiles(e) { /* simplified - just note files attached */ }

async function handleSendClick() {
  const input = document.getElementById("msgInput");
  const msg = input.value.trim();
  if (!msg || isLoading) return;
  input.value = "";

  if (!activeId) newChat();
  const conv = getActive();
  if (conv.title === "New Chat") conv.title = msg.substring(0, 30) + (msg.length > 30 ? "..." : "");

  conv.messages.push({ role: "user", content: msg });
  save(); renderConvs(); renderMessages();

  isLoading = true;
  updateSendBtn();

  // Show loading
  const area = document.getElementById("chatArea");
  const loadEl = document.createElement("div");
  loadEl.className = "msg assistant";
  loadEl.id = "loadingMsg";
  loadEl.innerHTML = '<div class="msg-avatar">🤖</div><div class="loading-dots"><span></span><span></span><span></span></div>';
  area.appendChild(loadEl);
  area.scrollTop = area.scrollHeight;

  try {
    let searchCtx = "";
    let sources = [];
    if (shouldSearch(msg)) {
      const sr = await fetchSearch(msg);
      searchCtx = sr.context;
      sources = sr.sources;
    }

    const prompt = searchCtx
      ? "Web search results:\\n" + searchCtx + "\\n\\nUser question: " + msg + "\\n\\nUse the search results above to help answer."
      : msg;

    const allMsgs = conv.messages.map(m => ({ role: m.role, content: m.content }));
    allMsgs[allMsgs.length - 1].content = prompt;

    abortCtrl = new AbortController();
    const res = await fetch(selectedModel, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: allMsgs, max_tokens: -1, stream: true }),
      signal: abortCtrl.signal,
    });

    if (!res.ok) throw new Error("Failed");

    // Remove loading
    document.getElementById("loadingMsg")?.remove();

    // Streaming bubble
    const streamEl = document.createElement("div");
    streamEl.className = "msg assistant";
    streamEl.innerHTML = '<div class="msg-avatar">🤖</div><div class="msg-bubble" id="streamBubble"></div>';
    area.appendChild(streamEl);

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let acc = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      for (const line of chunk.split("\\n")) {
        if (line.startsWith("data: ")) {
          const d = line.slice(6).trim();
          if (d === "[DONE]") continue;
          try {
            const p = JSON.parse(d);
            const delta = p.choices?.[0]?.delta?.content || "";
            if (delta) {
              acc += delta;
              document.getElementById("streamBubble").innerHTML = escHtml(acc) + '<span class="cursor"></span>';
              area.scrollTop = area.scrollHeight;
            }
          } catch(e) {
            if (d && !d.startsWith("{")) {
              acc += d;
              document.getElementById("streamBubble").innerHTML = escHtml(acc) + '<span class="cursor"></span>';
            }
          }
        }
      }
    }

    streamEl.remove();
    if (acc) {
      const asstMsg = { role: "assistant", content: acc };
      if (sources.length) asstMsg.sources = sources;
      conv.messages.push(asstMsg);
    }
  } catch(err) {
    document.getElementById("loadingMsg")?.remove();
    if (err.name === "AbortError") {
      const bubble = document.getElementById("streamBubble");
      const partial = bubble ? bubble.textContent : "";
      bubble?.closest(".msg")?.remove();
      if (partial) conv.messages.push({ role: "assistant", content: partial });
    } else {
      conv.messages.push({ role: "assistant", content: "Sorry, something went wrong." });
    }
  } finally {
    isLoading = false;
    abortCtrl = null;
    updateSendBtn();
    save(); renderConvs(); renderMessages();
  }
}

function updateSendBtn() {
  const btn = document.getElementById("sendBtn");
  if (isLoading) {
    btn.textContent = "■";
    btn.onclick = () => abortCtrl?.abort();
  } else {
    btn.textContent = "➤";
    btn.onclick = handleSendClick;
  }
}

// Init
renderConvs();
renderMessages();
if (!isMobile()) toggleSidebar();
</script>
</body>
</html>`;

export default ShhPage;
