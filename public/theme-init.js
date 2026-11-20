// Apply the saved light/dark theme before first paint (no flash).
// A separate file rather than an inline <script>, so the Content-Security-Policy can stay strict.
try {
  if (localStorage.getItem('dr:theme') === 'light') document.documentElement.dataset.theme = 'light';
} catch (e) {
  /* storage blocked: stay dark */
}
