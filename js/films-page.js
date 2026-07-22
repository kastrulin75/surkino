(function () {
  SURKINO.mountChrome("films");

  let tab = "now";
  let q = "";
  const hasSoon = SURKINO.comingSoon().length > 0;

  const grid = document.getElementById("films-grid");
  const tabs = document.getElementById("tabs");
  const search = document.getElementById("search");

  if (!hasSoon) {
    tabs.querySelector('[data-tab="soon"]')?.remove();
  }

  function render() {
    tabs.querySelectorAll(".filter-chip").forEach((el) => {
      el.classList.toggle("is-active", el.getAttribute("data-tab") === tab);
    });

    let list = tab === "now" ? SURKINO.nowShowing() : SURKINO.comingSoon();
    const query = q.trim().toLowerCase();
    if (query) {
      list = list.filter(
        (f) =>
          f.title.toLowerCase().includes(query) ||
          (f.originalTitle && f.originalTitle.toLowerCase().includes(query)) ||
          f.genres.some((g) => g.toLowerCase().includes(query)),
      );
    }

    grid.innerHTML =
      list.length === 0
        ? `<div class="empty glass" style="grid-column:1/-1">Ничего не найдено.</div>`
        : list.map(SURKINO.filmCardHtml).join("");
  }

  tabs.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-tab]");
    if (!btn) return;
    tab = btn.getAttribute("data-tab");
    render();
  });

  search.addEventListener("input", () => {
    q = search.value;
    render();
  });

  render();
})();
