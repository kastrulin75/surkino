(function () {
  SURKINO.mountChrome("films");

  const params = new URLSearchParams(location.search);
  const film = SURKINO.getFilm(params.get("id"));
  const root = document.getElementById("film-root");

  if (!film) {
    root.innerHTML = `
      <div class="page-head">
        <div class="empty glass">Фильм не найден. <a href="films.html" style="color:var(--accent)">К каталогу</a></div>
      </div>`;
    return;
  }

  document.title = `${film.title} — SURKINO`;

  const dates = SURKINO.getWeekDates();
  let selected = SURKINO.toDateKey(dates[0]);

  const original =
    film.year
      ? `<p class="film-original">${SURKINO.escapeHtml(String(film.year))}${film.isSeries ? " · сериал" : ""}</p>`
      : "";

  const cast =
    film.cast && film.cast.length
      ? `<div><dt>В ролях</dt><dd>${SURKINO.escapeHtml(film.cast.slice(0, 4).join(", "))}</dd></div>`
      : "";

  const budget = film.budget
    ? `<div><dt>Бюджет</dt><dd>${SURKINO.escapeHtml(film.budget)}</dd></div>`
    : "";

  root.innerHTML = `
    <header class="page-head">
      <nav class="breadcrumb">
        <a href="index.html">Главная</a><span>/</span>
        <a href="films.html">Фильмы</a><span>/</span>
        <span>${SURKINO.escapeHtml(film.title)}</span>
      </nav>
    </header>

    <div class="film-detail glass glass-strong">
      ${SURKINO.posterHtml(film, film.comingSoon ? "скоро" : film.isSeries ? "сериал" : film.age)}
      <div>
        <h1>${SURKINO.escapeHtml(film.title)}</h1>
        ${original}
        <div class="tags">
          ${film.rating > 0 ? `<span class="rating">${film.rating.toFixed(1)}</span>` : ""}
          <span>${SURKINO.escapeHtml(film.genres.join(" / "))}</span>
          ${film.durationMin ? `<span>${SURKINO.formatDuration(film.durationMin, film)}</span>` : ""}
          <span>${SURKINO.escapeHtml(film.age)}</span>
          ${film.comingSoon ? `<span>скоро</span>` : ""}
        </div>
        <dl class="meta-grid">
          <div><dt>Страна</dt><dd>${SURKINO.escapeHtml(film.country)}</dd></div>
          <div><dt>Режиссёр</dt><dd>${SURKINO.escapeHtml(film.director)}</dd></div>
          <div><dt>Год</dt><dd>${SURKINO.escapeHtml(String(film.year || "—"))}</dd></div>
          <div><dt>Премьера</dt><dd>${SURKINO.formatDateLong(new Date(film.premiere + "T12:00:00"))}</dd></div>
          ${budget}
          ${cast}
        </dl>
        <p class="film-desc">${SURKINO.escapeHtml(film.description)}</p>
      </div>
    </div>

    ${
      film.comingSoon
        ? ""
        : `
    <section>
      <div class="section-head">
        <div>
          <h2>Сеансы</h2>
          <p>Расписание по кинотеатрам Сургута</p>
        </div>
      </div>
      <div class="date-strip" id="date-strip" role="tablist"></div>
      <div id="sessions" style="margin-top:1.25rem"></div>
    </section>`
    }
  `;

  if (film.comingSoon) return;

  const strip = document.getElementById("date-strip");
  const sessions = document.getElementById("sessions");

  function renderSessions() {
    strip.innerHTML = SURKINO.dateStripHtml(dates, selected);
    const shows = SURKINO.getShowtimes({ filmId: film.id, date: selected });
    const byCinema = SURKINO.groupByCinema(shows);

    if (byCinema.size === 0) {
      sessions.innerHTML = `<div class="empty glass">На эту дату сеансов нет.</div>`;
      return;
    }

    let html = "";
    for (const [cinemaId, list] of byCinema) {
      const cinema = SURKINO.getCinema(cinemaId);
      if (!cinema) continue;
      const sorted = [...list].sort((a, b) => a.time.localeCompare(b.time));
      html += `
        <div class="schedule-item glass" style="display:block;margin-bottom:0.75rem">
          <div class="cinema-block-label">
            <a href="cinema.html?slug=${cinema.slug}">${SURKINO.escapeHtml(cinema.name)}</a>
            · ${SURKINO.escapeHtml(cinema.mall)} · ${SURKINO.escapeHtml(cinema.address)}
          </div>
          <div class="showtime-row">${sorted.map(SURKINO.showtimeHtml).join("")}</div>
        </div>`;
    }
    sessions.innerHTML = html;
  }

  strip.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-date]");
    if (!btn) return;
    selected = btn.getAttribute("data-date");
    renderSessions();
  });

  renderSessions();
})();
