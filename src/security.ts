// Runtime security: disable text selection, right-click override, devtools detection
export function initSecurity() {
  // Extra devtools detection via element getter trick
  try {
    const check = new RegExp(/./);
    check.toString = function () {
      const el = document.createElement('div');
      el.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:#0a0e1a;color:#ef4444;display:flex;align-items:center;justify-content:center;font-size:1.5rem;z-index:99999;font-family:sans-serif';
      el.textContent = 'DevTools detected. Access denied.';
      return '';
    };
    setInterval(() => {
      console.log(check);
      console.clear();
    }, 800);
  } catch {}

  // Periodic console clear
  setInterval(() => {
    try { console.clear(); } catch {}
  }, 5000);
}

// Verify integrity: check if core files are loaded
export function isCompromised(): boolean {
  try {
    if (typeof window === 'undefined') return true;
    const root = document.getElementById('root');
    if (!root) return true;
    return false;
  } catch {
    return true;
  }
}
