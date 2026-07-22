/** Тема, шапка/подвал, общие UI-хелперы */

(function () {
  function getInitialTheme() {
    const saved = localStorage.getItem("surkino-theme");
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("surkino-theme", theme);
    const btn = document.querySelector("[data-theme-toggle]");
    if (btn) {
      btn.setAttribute(
        "aria-label",
        theme === "dark" ? "Включить светлую тему" : "Включить тёмную тему",
      );
      btn.innerHTML =
        theme === "dark"
          ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="2"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`
          : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M21 14.3A8.5 8.5 0 0 1 9.7 3 7 7 0 1 0 21 14.3Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`;
    }
  }

  SURKINO.initTheme = function () {
    applyTheme(getInitialTheme());
    document.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-theme-toggle]");
      if (!btn) return;
      const next =
        document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
    });
  };

  SURKINO.escapeHtml = function (str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  };

  SURKINO.hallsLabel = function (n) {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return `${n} зал`;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${n} зала`;
    return `${n} залов`;
  };

  SURKINO.posterHtml = function (film, badge) {
    const label = badge || (film.isSeries ? "сериал" : film.age) || "";
    const src = film.poster || `assets/img/posters/${film.id}.png`;
    return `
      <div class="poster">
        ${label ? `<span class="poster-badge">${SURKINO.escapeHtml(label)}</span>` : ""}
        <div class="poster-frame">
          <img src="${src}" alt="${SURKINO.escapeHtml(film.title)}" loading="lazy" />
        </div>
      </div>`;
  };

  SURKINO.filmCardHtml = function (film) {
    const badge = film.comingSoon ? "скоро" : film.isSeries ? "сериал" : film.age;
    const dur = SURKINO.formatDuration(film.durationMin, film);
    const meta = film.comingSoon
      ? film.genres.slice(0, 2).join(" · ")
      : `${film.genres.slice(0, 2).join(" · ")} · ${dur}`;
    return `
      <a class="film-card" href="film.html?id=${film.id}">
        ${SURKINO.posterHtml(film, badge)}
        <div class="film-card-meta">
          <h3>${SURKINO.escapeHtml(film.title)}</h3>
          <span>${SURKINO.escapeHtml(meta)}</span>
        </div>
      </a>`;
  };

  SURKINO.showtimeHtml = function (s) {
    const hall = SURKINO.getHall(s.cinemaId, s.hallId);
    return `
      <span class="showtime">
        ${s.time}
        ${s.format ? `<span class="fmt">${s.format}</span>` : ""}
        ${hall ? `<span class="hall">${SURKINO.escapeHtml(hall.name)}</span>` : ""}
      </span>`;
  };

  SURKINO.scheduleItemHtml = function (filmId, showtimes) {
    const film = SURKINO.getFilm(filmId);
    if (!film) return "";
    const byCinema = SURKINO.groupByCinema(showtimes);
    let blocks = "";
    for (const [cinemaId, list] of byCinema) {
      const cinema = SURKINO.getCinema(cinemaId);
      if (!cinema) continue;
      const sorted = [...list].sort((a, b) => a.time.localeCompare(b.time));
      blocks += `
        <div class="cinema-block">
          <div class="cinema-block-label">
            <a href="cinema.html?slug=${cinema.slug}">${SURKINO.escapeHtml(cinema.name)}</a>
            ${cinema.mall ? ` · ${SURKINO.escapeHtml(cinema.mall)}` : ""}
          </div>
          <div class="showtime-row">${sorted.map(SURKINO.showtimeHtml).join("")}</div>
        </div>`;
    }

    const tags = [
      film.rating > 0
        ? `<span class="rating">${film.rating.toFixed(1)}</span>`
        : "",
      `<span>${SURKINO.escapeHtml(film.genres.slice(0, 3).join(" / "))}</span>`,
      `<span>${SURKINO.formatDuration(film.durationMin, film)}</span>`,
      `<span>${SURKINO.escapeHtml(film.age)}</span>`,
    ]
      .filter(Boolean)
      .join("");

    return `
      <article class="schedule-item glass">
        <a href="film.html?id=${film.id}" class="schedule-poster">${SURKINO.posterHtml(film, film.age)}</a>
        <div class="schedule-body">
          <h3><a href="film.html?id=${film.id}">${SURKINO.escapeHtml(film.title)}</a></h3>
          <div class="tags">${tags}</div>
          ${blocks}
        </div>
      </article>`;
  };

  SURKINO.dateStripHtml = function (dates, selected) {
    return dates
      .map((d) => {
        const key = SURKINO.toDateKey(d);
        const label = SURKINO.formatDateShort(d);
        const [dayPart, weekday] = label.split(", ");
        return `
          <button type="button" class="date-chip${key === selected ? " is-active" : ""}" data-date="${key}" role="tab" aria-selected="${key === selected}">
            <span class="day">${dayPart}</span>
            <span class="label">${weekday}</span>
          </button>`;
      })
      .join("");
  };

  SURKINO.mountChrome = function (active) {
    const header = document.getElementById("site-header");
    const footer = document.getElementById("site-footer");
    if (!header || !footer) return;

    const links = [
      { href: "index.html", id: "home", label: "Афиша" },
      { href: "schedule.html", id: "schedule", label: "Расписание" },
      { href: "films.html", id: "films", label: "Фильмы" },
      { href: "cinemas.html", id: "cinemas", label: "Кинотеатры" },
    ];

    const navLinks = links
      .map(
        (l) =>
          `<a href="${l.href}" class="${l.id === active ? "is-active" : ""}">${l.label}</a>`,
      )
      .join("");

    header.innerHTML = `
      <div class="header-bar glass-pill">
        <a href="index.html" class="logo">
          <span class="logo-mark">SURKINO</span>
          <span class="logo-sub">афиша Сургута</span>
        </a>
        <nav class="nav" aria-label="Основная навигация">${navLinks}</nav>
        <div class="header-actions">
          <button type="button" class="icon-btn" data-theme-toggle aria-label="Тема"></button>
          <button type="button" class="icon-btn menu-btn" data-menu-toggle aria-label="Меню" aria-expanded="false">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </button>
        </div>
      </div>
      <nav class="mobile-nav" data-mobile-nav aria-label="Мобильная навигация">${navLinks}</nav>`;

    const cinemaLinks = SURKINO.cinemas
      .map((c) => `<li><a href="cinema.html?slug=${c.slug}">${SURKINO.escapeHtml(c.name)}</a></li>`)
      .join("");

    footer.innerHTML = `
      <div class="container">
        <div class="footer-inner glass">
          <div class="footer-grid">
            <div class="footer-brand">
              <a href="index.html" class="logo"><span class="logo-mark">SURKINO</span></a>
              <p>Единая афиша кинотеатров Сургута — сеансы, залы и новинки проката.</p>
            </div>
            <div class="footer-col">
              <h4>Разделы</h4>
              <ul>
                <li><a href="schedule.html">Расписание</a></li>
                <li><a href="films.html">Фильмы</a></li>
                <li><a href="cinemas.html">Кинотеатры</a></li>
              </ul>
            </div>
            <div class="footer-col">
              <h4>Кинотеатры</h4>
              <ul>${cinemaLinks}</ul>
            </div>
          </div>
          <div class="footer-legal">
            <p>
              Сайт сделан Матвеевым Ефимом в 2026. Все права защищены. Данный сайт является
              независимым редизайном (переосмыслением) оригинального ресурса
              <a href="https://surkino.ru/" target="_blank" rel="noopener noreferrer">surkino.ru</a>
              и создан исключительно в некоммерческих/образовательных/портфолио-целях.
              Автор редизайна не претендует на права на интеллектуальную собственность,
              товарные знаки, контент или оригинальный дизайн, принадлежащие законным
              правообладателям. Все права на оригинальный контент сохраняются за их владельцами.
            </p>
          </div>
        </div>
      </div>`;

    SURKINO.initTheme();

    const menuBtn = header.querySelector("[data-menu-toggle]");
    const mobileNav = header.querySelector("[data-mobile-nav]");
    menuBtn?.addEventListener("click", () => {
      const open = mobileNav.classList.toggle("is-open");
      menuBtn.setAttribute("aria-expanded", String(open));
      menuBtn.innerHTML = open
        ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`
        : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
    });
  };
})();
