(function () {
  SURKINO.mountChrome("cinemas");

  const params = new URLSearchParams(location.search);
  const cinema = SURKINO.getCinema(params.get("slug"));
  const root = document.getElementById("cinema-root");

  if (!cinema) {
    root.innerHTML = `
      <div class="page-head">
        <div class="empty glass">Кинотеатр не найден. <a href="cinemas.html" style="color:var(--accent)">К списку</a></div>
      </div>`;
    return;
  }

  document.title = `${cinema.name} — SURKINO`;

  const dates = SURKINO.getWeekDates();
  let selected = SURKINO.toDateKey(dates[0]);

  root.innerHTML = `
    <header class="page-head">
      <nav class="breadcrumb">
        <a href="index.html">Главная</a><span>/</span>
        <a href="cinemas.html">Кинотеатры</a><span>/</span>
        <span>${SURKINO.escapeHtml(cinema.name)}</span>
      </nav>
      <img class="cinema-hero-photo" src="${cinema.image}" alt="${SURKINO.escapeHtml(cinema.name)}" />
      <div class="accent-bar" style="--cinema-accent:${cinema.accent};width:3rem;height:4px;margin:0 0 0.85rem"></div>
      <h1>${SURKINO.escapeHtml(cinema.name)}</h1>
      <p>${SURKINO.escapeHtml(cinema.mall)} · ${SURKINO.escapeHtml(cinema.address)}</p>
      <div class="cinema-meta" style="margin-top:0.75rem">${SURKINO.hallsLabel(cinema.hallsCount)} · ${cinema.capacity} мест</div>
      <p style="margin-top:0.75rem;color:var(--text-soft);max-width:56ch">${SURKINO.escapeHtml(cinema.note)}</p>
      <div class="hall-list" style="margin-top:1rem">
        ${cinema.halls
          .map(
            (h) =>
              `<span class="hall-pill">${SURKINO.escapeHtml(h.name)}${h.seats ? ` · ${h.seats} мест` : ""}</span>`,
          )
          .join("")}
      </div>
    </header>
    <div class="date-strip" id="date-strip" role="tablist"></div>
    <div class="schedule-list" id="schedule-list" style="margin-top:1.25rem"></div>
  `;

  const strip = document.getElementById("date-strip");
  const list = document.getElementById("schedule-list");

  function render() {
    strip.innerHTML = SURKINO.dateStripHtml(dates, selected);
    const shows = SURKINO.getShowtimes({ date: selected, cinemaId: cinema.id });
    const byFilm = SURKINO.groupByFilm(shows);
    const ids = [...byFilm.keys()];
    list.innerHTML =
      ids.length === 0
        ? `<div class="empty glass">На эту дату сеансов нет.</div>`
        : ids.map((id) => SURKINO.scheduleItemHtml(id, byFilm.get(id))).join("");
  }

  strip.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-date]");
    if (!btn) return;
    selected = btn.getAttribute("data-date");
    render();
  });

  render();
})();
