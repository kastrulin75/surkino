/** Расписание — генерируется локально (заглушка под реальные данные) */

(function () {
  const WEEKDAYS = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"];
  const MONTHS = [
    "янв",
    "фев",
    "мар",
    "апр",
    "мая",
    "июн",
    "июл",
    "авг",
    "сен",
    "окт",
    "ноя",
    "дек",
  ];
  const TIME_SLOTS = [
    "10:15",
    "10:55",
    "11:30",
    "12:05",
    "12:55",
    "13:40",
    "14:20",
    "15:20",
    "16:10",
    "17:00",
    "18:25",
    "19:10",
    "19:55",
    "20:55",
    "21:55",
    "22:45",
  ];

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function hash(s) {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return h;
  }

  function toDateKey(d) {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  function getWeekDates(from = new Date()) {
    const start = new Date(from);
    start.setHours(0, 0, 0, 0);
    return Array.from({ length: 8 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }

  function formatDateShort(d) {
    return `${d.getDate()} ${MONTHS[d.getMonth()]}, ${WEEKDAYS[d.getDay()]}`;
  }

  function formatDateLong(d) {
    return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  }

  function formatDuration(min, film) {
    if (min == null || min === 0) return "—";
    if (film?.isSeries) return `≈${min} мин / сер.`;
    const h = Math.floor(min / 60);
    const m = min % 60;
    if (h === 0) return `${m} мин`;
    if (m === 0) return `${h} ч`;
    return `${h} ч ${m} мин`;
  }

  function buildSchedule() {
    const dates = getWeekDates();
    const showing = SURKINO.films.filter((f) => !f.comingSoon);
    const result = [];
    let counter = 0;

    for (const date of dates) {
      const dateKey = toDateKey(date);
      for (const film of showing) {
        const cinemaCount = 2 + (hash(`${film.id}-${dateKey}`) % 3);
        const shuffled = [...SURKINO.cinemas].sort(
          (a, b) =>
            hash(`${a.id}-${film.id}-${dateKey}`) -
            hash(`${b.id}-${film.id}-${dateKey}`),
        );

        for (let i = 0; i < cinemaCount; i++) {
          const cinema = shuffled[i];
          const hall =
            cinema.halls[hash(`${film.id}-${cinema.id}-${dateKey}`) % cinema.halls.length];
          const slotCount = 1 + (hash(`${film.id}-slots-${dateKey}-${cinema.id}`) % 3);

          for (let s = 0; s < slotCount; s++) {
            const time =
              TIME_SLOTS[
                (hash(`${film.id}-${cinema.id}-${dateKey}-${s}`) + s * 3) % TIME_SLOTS.length
              ];
            const formats = ["2D", "2D", "2D", "3D", "IMAX"];
            let format = formats[hash(`${film.id}-${time}`) % formats.length];
            if (format === "IMAX" && hall.id !== "cp-imax") format = "2D";
            result.push({
              id: `st-${counter++}`,
              filmId: film.id,
              cinemaId: cinema.id,
              hallId: hall.id,
              date: dateKey,
              time,
              format: format === "2D" ? null : format,
            });
          }
        }
      }
    }

    return result.sort(
      (a, b) => a.time.localeCompare(b.time) || a.cinemaId.localeCompare(b.cinemaId),
    );
  }

  SURKINO.showtimes = buildSchedule();

  SURKINO.getCinema = (idOrSlug) =>
    SURKINO.cinemas.find((c) => c.id === idOrSlug || c.slug === idOrSlug);

  SURKINO.getHall = (cinemaId, hallId) => {
    const cinema = SURKINO.getCinema(cinemaId);
    return cinema?.halls.find((h) => h.id === hallId);
  };

  SURKINO.getFilm = (id) => {
    const n = Number(id);
    return SURKINO.films.find((f) => f.id === n);
  };

  SURKINO.nowShowing = () => SURKINO.films.filter((f) => !f.comingSoon);
  SURKINO.comingSoon = () => SURKINO.films.filter((f) => f.comingSoon);

  SURKINO.getShowtimes = ({ date, filmId, cinemaId } = {}) =>
    SURKINO.showtimes.filter((s) => {
      if (date && s.date !== date) return false;
      if (filmId != null && s.filmId !== filmId) return false;
      if (cinemaId && s.cinemaId !== cinemaId) return false;
      return true;
    });

  SURKINO.groupByFilm = (list) => {
    const map = new Map();
    for (const s of list) {
      const arr = map.get(s.filmId) || [];
      arr.push(s);
      map.set(s.filmId, arr);
    }
    return map;
  };

  SURKINO.groupByCinema = (list) => {
    const map = new Map();
    for (const s of list) {
      const arr = map.get(s.cinemaId) || [];
      arr.push(s);
      map.set(s.cinemaId, arr);
    }
    return map;
  };

  SURKINO.toDateKey = toDateKey;
  SURKINO.getWeekDates = getWeekDates;
  SURKINO.formatDateShort = formatDateShort;
  SURKINO.formatDateLong = formatDateLong;
  SURKINO.formatDuration = formatDuration;
})();
