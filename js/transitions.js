/** Плавные переходы между страницами + ожидание шрифтов */
(function () {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const LEAVE_MS = reduced ? 0 : 280;

  function revealPage() {
    document.documentElement.classList.remove("boot-pending", "page-leave");
    document.documentElement.classList.add("boot-ready");
  }

  function waitForFonts() {
    if (!document.fonts || !document.fonts.ready) {
      return Promise.resolve();
    }
    return Promise.race([
      document.fonts.ready,
      new Promise((resolve) => setTimeout(resolve, 450)),
    ]);
  }

  function boot() {
    if (document.documentElement.classList.contains("intro-pending")) {
      waitForFonts();
      return;
    }
    waitForFonts().then(revealPage);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
      revealPage();
    }
  });

  function isInternalLink(anchor) {
    if (!anchor || !anchor.href) return false;
    if (anchor.target && anchor.target !== "_self") return false;
    if (anchor.hasAttribute("download")) return false;
    if (anchor.getAttribute("href")?.startsWith("#")) return false;

    let url;
    try {
      url = new URL(anchor.href, location.href);
    } catch (e) {
      return false;
    }

    if (url.origin !== location.origin) return false;
    if (url.hash && url.pathname === location.pathname && url.search === location.search) {
      return false;
    }
    if (url.href === location.href) return false;
    return true;
  }

  document.addEventListener(
    "click",
    (event) => {
      if (event.defaultPrevented) return;
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = event.target.closest("a[href]");
      if (!isInternalLink(anchor)) return;

      event.preventDefault();
      const href = anchor.href;

      if (reduced) {
        location.href = href;
        return;
      }

      document.documentElement.classList.remove("boot-ready");
      document.documentElement.classList.add("page-leave");

      window.setTimeout(() => {
        location.href = href;
      }, LEAVE_MS);
    },
    true,
  );

  window.SURKINO = window.SURKINO || {};
  SURKINO.revealPage = revealPage;
})();
