* { margin: 0; padding: 0; box-sizing: border-box; }

:root {
  --bg: #ffffff;
  --bg2: #f8f8fa;
  --bg3: #f0f0f4;
  --bg4: #e4e4ec;
  --border: rgba(0,0,0,0.07);
  --border2: rgba(0,0,0,0.13);
  --text: #111118;
  --text2: #555568;
  --text3: #9090a8;
  --accent: #6c5ce7;
  --accent2: #5a4bd1;
  --accent-bg: rgba(108,92,231,0.08);
  --accent-text: #6c5ce7;
  --green: #00b894;
  --green-bg: rgba(0,184,148,0.1);
  --amber: #e17055;
  --amber-bg: rgba(225,112,85,0.1);
  --red: #d63031;
  --red-bg: rgba(214,48,49,0.1);
  --blue: #0984e3;
  --blue-bg: rgba(9,132,227,0.1);
  --shadow: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04);
  --shadow2: 0 4px 12px rgba(0,0,0,0.08);
  --r: 10px;
  --r2: 14px;
  --font: 'DM Sans', sans-serif;
  --mono: 'DM Mono', monospace;
}

[data-theme="dark"] {
  --bg: #0f0f13;
  --bg2: #17171d;
  --bg3: #1e1e26;
  --bg4: #26262f;
  --border: rgba(255,255,255,0.07);
  --border2: rgba(255,255,255,0.13);
  --text: #f0f0f8;
  --text2: #9090b0;
  --text3: #5a5a78;
  --accent: #7c6aff;
  --accent2: #a594ff;
  --accent-bg: rgba(124,106,255,0.12);
  --accent-text: #a594ff;
  --green: #34d399;
  --green-bg: rgba(52,211,153,0.1);
  --amber: #fbbf24;
  --amber-bg: rgba(251,191,36,0.1);
  --red: #f87171;
  --red-bg: rgba(248,113,113,0.1);
  --blue: #60a5fa;
  --blue-bg: rgba(96,165,250,0.1);
  --shadow: 0 1px 3px rgba(0,0,0,0.3);
  --shadow2: 0 4px 12px rgba(0,0,0,0.4);
}

html, body { height: 100%; }

body {
  font-family: var(--font);
  background: var(--bg);
  color: var(--text);
  font-size: 14px;
  overflow: hidden;
  transition: background 0.2s, color 0.2s;
}

::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--bg4); border-radius: 10px; }
