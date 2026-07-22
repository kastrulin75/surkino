(function () {
  function shouldPlayIntro() {
    try {
      if (sessionStorage.getItem("surkino-intro-done")) return false;
    } catch (e) {
      /* ignore */
    }
    return document.documentElement.classList.contains("intro-pending");
  }

  function finishIntro() {
    const intro = document.getElementById("intro");
    document.documentElement.classList.remove("intro-pending");
    document.body.classList.remove("intro-playing");
    document.body.classList.add("intro-done");
    try {
      sessionStorage.setItem("surkino-intro-done", "1");
    } catch (e) {
      /* ignore */
    }
    if (intro) {
      intro.hidden = true;
      intro.setAttribute("aria-hidden", "true");
    }
    document.body.style.overflow = "";
    if (typeof SURKINO.revealPage === "function") {
      SURKINO.revealPage();
    }
  }

  function playIntro() {
    const intro = document.getElementById("intro");
    if (!intro) {
      finishIntro();
      return;
    }

    intro.hidden = false;
    intro.setAttribute("aria-hidden", "false");
    document.body.classList.add("intro-playing");
    document.body.style.overflow = "hidden";

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const totalMs = reduced ? 200 : 2600;

    window.setTimeout(() => {
      finishIntro();
    }, totalMs);
  }

  if (shouldPlayIntro()) {
    playIntro();
  } else {
    document.documentElement.classList.remove("intro-pending");
    const intro = document.getElementById("intro");
    if (intro) intro.hidden = true;
  }

  SURKINO.mountChrome("home");

  const dates = SURKINO.getWeekDates();
  let selected = SURKINO.toDateKey(dates[0]);

  const showing = SURKINO.nowShowing();
  const dayShows = () => SURKINO.getShowtimes({ date: selected });

  document.getElementById("hero-stats").innerHTML = `
    <div><strong>${SURKINO.cinemas.length}</strong><span>кинотеатров</span></div>
    <div><strong>${showing.length}</strong><span>в прокате</span></div>
    <div><strong>${dayShows().length}</strong><span>сеансов сегодня</span></div>
  `;

  const strip = document.getElementById("date-strip");
  const list = document.getElementById("schedule-list");

  function renderSchedule() {
    strip.innerHTML = SURKINO.dateStripHtml(dates, selected);
    const byFilm = SURKINO.groupByFilm(dayShows());
    const ids = [...byFilm.keys()].slice(0, 5);
    list.innerHTML =
      ids.length === 0
        ? `<div class="empty glass">На эту дату сеансов пока нет.</div>`
        : ids.map((id) => SURKINO.scheduleItemHtml(id, byFilm.get(id))).join("");

    const stats = document.getElementById("hero-stats");
    if (stats) {
      stats.children[2].innerHTML = `<strong>${dayShows().length}</strong><span>сеансов в день</span>`;
    }
  }

  strip.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-date]");
    if (!btn) return;
    selected = btn.getAttribute("data-date");
    renderSchedule();
  });

  renderSchedule();

  document.getElementById("films-now").innerHTML = showing
    .slice(0, 12)
    .map(SURKINO.filmCardHtml)
    .join("");

  const soon = SURKINO.comingSoon();
  const soonSection = document.getElementById("soon-section");
  if (soonSection) {
    if (soon.length === 0) {
      soonSection.hidden = true;
    } else {
      document.getElementById("films-soon").innerHTML = soon.map(SURKINO.filmCardHtml).join("");
    }
  }

  document.getElementById("cinemas-grid").innerHTML = SURKINO.cinemas
    .map(
      (c) => `
      <a href="cinema.html?slug=${c.slug}" class="cinema-card glass" style="--cinema-accent:${c.accent}">
        <div class="cinema-card-photo">
          <img src="${c.image}" alt="${SURKINO.escapeHtml(c.name)}" loading="lazy" />
        </div>
        <div class="cinema-card-body">
          <div class="accent-bar"></div>
          <h3>${SURKINO.escapeHtml(c.name)}</h3>
          <p>${SURKINO.escapeHtml(c.mall)} · ${SURKINO.escapeHtml(c.address)}</p>
          <div class="cinema-meta">${SURKINO.hallsLabel(c.hallsCount)} · ${c.capacity} мест</div>
          <div class="hall-list">
            ${c.halls
              .slice(0, 5)
              .map((h) => `<span class="hall-pill">${SURKINO.escapeHtml(h.name)}</span>`)
              .join("")}
            ${c.halls.length > 5 ? `<span class="hall-pill">+${c.halls.length - 5}</span>` : ""}
          </div>
        </div>
      </a>`,
    )
    .join("");
})();
