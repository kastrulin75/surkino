(function () {
  SURKINO.mountChrome("cinemas");

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
          <p style="margin-top:0.65rem;font-size:0.82rem;color:var(--text-faint)">${SURKINO.escapeHtml(c.note)}</p>
          <div class="hall-list">
            ${c.halls
              .map(
                (h) =>
                  `<span class="hall-pill">${SURKINO.escapeHtml(h.name)}${h.seats ? ` · ${h.seats}` : ""}</span>`,
              )
              .join("")}
          </div>
        </div>
      </a>`,
    )
    .join("");
})();
