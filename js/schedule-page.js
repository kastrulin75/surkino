(function () {
  SURKINO.mountChrome("schedule");

  const dates = SURKINO.getWeekDates();
  let selected = SURKINO.toDateKey(dates[0]);
  let cinemaId = "all";

  const strip = document.getElementById("date-strip");
  const filters = document.getElementById("cinema-filters");
  const list = document.getElementById("schedule-list");

  filters.innerHTML =
    `<button type="button" class="filter-chip is-active" data-cinema="all">Все кинотеатры</button>` +
    SURKINO.cinemas
      .map(
        (c) =>
          `<button type="button" class="filter-chip" data-cinema="${c.id}">${SURKINO.escapeHtml(c.name)}</button>`,
      )
      .join("");

  function render() {
    strip.innerHTML = SURKINO.dateStripHtml(dates, selected);
    filters.querySelectorAll(".filter-chip").forEach((el) => {
      el.classList.toggle("is-active", el.getAttribute("data-cinema") === cinemaId);
    });

    const shows = SURKINO.getShowtimes({
      date: selected,
      cinemaId: cinemaId === "all" ? undefined : cinemaId,
    });
    const byFilm = SURKINO.groupByFilm(shows);
    const ids = [...byFilm.keys()];
    list.innerHTML =
      ids.length === 0
        ? `<div class="empty glass">Нет сеансов для выбранных фильтров.</div>`
        : ids.map((id) => SURKINO.scheduleItemHtml(id, byFilm.get(id))).join("");
  }

  strip.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-date]");
    if (!btn) return;
    selected = btn.getAttribute("data-date");
    render();
  });

  filters.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-cinema]");
    if (!btn) return;
    cinemaId = btn.getAttribute("data-cinema");
    render();
  });

  render();
})();
