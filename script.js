/* Архив Дома — демонстрационная версия.
   Контент ниже легко заменяется на реальные материалы.
   Позже эти данные можно подключить к админке/API. */

const CATEGORIES = {
  stai: {
    title: "Стаи",
    icon: "I",
    description: "История, устройство, культура и внутренние особенности стай.",
    sections: [
      ["all", "Всё"],
      ["zhrecy", "Жрецы"],
      ["iskry", "Искры"],
      ["gavena", "Гавена"],
      ["utoplenniki", "Утопленники"],
      ["komety", "Кометы"],
      ["orfy", "Орфы"]
    ]
  },
  places: {
    title: "Места",
    icon: "II",
    description: "Особые помещения, территории и места, связанные с Домом.",
    sections: [
      ["all", "Всё"],
      ["stai", "Места стай"],
      ["floor1", "1 этаж"],
      ["floor2", "2 этаж"],
      ["floor3", "3 этаж"],
      ["yard", "Двор"],
      ["basement", "Подвал"]
    ]
  },
  director: {
    title: "Папки директора",
    icon: "III",
    description: "Материалы из личного архива директора о людях, связанных с Домом.",
    sections: [
      ["all", "Всё"],
      ["staff", "Персонал"],
      ["housemates", "Домовец"]
    ]
  }
};

const POSTS = [
  {
    id: "iskry-example",
    title: "История Искр",
    category: "stai",
    section: "iskry",
    excerpt: "Демонстрационный материал, показывающий, как выглядит цельная архивная статья.",
    image: "",
    blocks: [
      { heading: "Начало", text: "Здесь будет первый кусок лора. В редакторе ты сможешь создавать такие блоки самостоятельно, чтобы большой материал не превращался в сплошную стену текста." },
      { heading: "Особенности", text: "Следующий фрагмент находится в отдельной рамке, но всё ещё является частью одной статьи. Внутри блока можно использовать обычный текст и абзацы." }
    ]
  },
  {
    id: "basement-example",
    title: "Заброшенная комната в подвале",
    category: "places",
    section: "basement",
    excerpt: "Пример материала о месте.",
    image: "",
    blocks: [
      { heading: "Описание", text: "Демонстрационный текст. Здесь можно описывать помещение, его историю, детали интерьера и всё то, что не обязательно знать для игры." }
    ]
  },
  {
    id: "director-example",
    title: "Папка № 01",
    category: "director",
    section: "staff",
    excerpt: "Пример записи из папок директора.",
    image: "",
    blocks: [
      { heading: "Сведения", text: "В этом разделе будут находиться материалы о персонажах и личностях, связанных с Домом." }
    ]
  }
];

const app = document.getElementById("app");
const mainNav = document.getElementById("mainNav");
const sideMenu = document.getElementById("sideMenu");
const menuBackdrop = document.getElementById("menuBackdrop");
const searchPanel = document.getElementById("searchPanel");
const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");

function categoryName(category) {
  return CATEGORIES[category]?.title || "Архив";
}

function sectionName(category, section) {
  const item = CATEGORIES[category]?.sections.find(x => x[0] === section);
  return item ? item[1] : section;
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[char]));
}

function renderNav() {
  mainNav.innerHTML = Object.entries(CATEGORIES).map(([key, category]) => `
    <section class="nav-section" data-nav="${key}">
      <button class="nav-main" type="button">${category.title}</button>
      <div class="nav-sub">
        ${category.sections.map(([section, title]) => `
          <button class="nav-link" data-route="#category/${key}/${section}" type="button">${title}</button>
        `).join("")}
      </div>
    </section>
  `).join("");

  mainNav.querySelectorAll(".nav-main").forEach(btn => {
    btn.addEventListener("click", () => btn.parentElement.classList.toggle("expanded"));
  });

  mainNav.querySelectorAll(".nav-link").forEach(btn => {
    btn.addEventListener("click", () => {
      location.hash = btn.dataset.route.slice(1);
      closeMenu();
    });
  });
}

function renderHome() {
  app.innerHTML = `
    <section class="hero">
      <div class="eyebrow">Внутренний архив</div>
      <h1>Архив Дома</h1>
      <p>Приветствуем тебя! Ты попал в архив ролевой <strong>«Тени судьбы»</strong>.</p>
      <p>Здесь собраны дополнительные материалы, связанные с миром нашего проекта: история и устройство стай, особенности Дома, интересные места, сведения о его обитателях и другие детали, которым не нашлось места в основном информационном канале.</p>
      <div class="note">
        <strong>Важно.</strong> Знакомство с архивом не является обязательным для игры.
        Весь представленный здесь лор существует прежде всего для того, чтобы обогатить мир ролевой,
        добавить ему глубины и дать возможность внимательным игрокам находить новые детали,
        истории и поводы для творчества.
      </div>
      <p>Вы можете свободно использовать сведения из архива в своей игре, если они не противоречат основной информации проекта.</p>
      <p><em>Приятного изучения.</em></p>
    </section>

    <div class="archive-grid">
      ${Object.entries(CATEGORIES).map(([key, item], index) => `
        <a class="archive-card" href="#category/${key}/all">
          <span class="number">0${index + 1}</span>
          <h2>${item.title}</h2>
          <p>${item.description}</p>
        </a>
      `).join("")}
    </div>
  `;
}

function renderCategory(category, section) {
  const cat = CATEGORIES[category];
  if (!cat) return renderHome();

  const filtered = section === "all"
    ? POSTS.filter(p => p.category === category)
    : POSTS.filter(p => p.category === category && p.section === section);

  app.innerHTML = `
    <section class="page-heading">
      <div class="eyebrow">${cat.title}</div>
      <h1>${sectionName(category, section)}</h1>
      <p>${cat.description}</p>
    </section>

    <section class="post-list">
      ${filtered.length ? filtered.map(post => `
        <button class="post-card" data-post="${escapeHtml(post.id)}" type="button">
          <h2>${escapeHtml(post.title)}</h2>
          <p>${escapeHtml(post.excerpt)}</p>
          <div class="post-meta">${categoryName(post.category)} / ${sectionName(post.category, post.section)}</div>
        </button>
      `).join("") : `<div class="empty">В этом разделе пока нет материалов.</div>`}
    </section>
  `;

  app.querySelectorAll("[data-post]").forEach(card => {
    card.addEventListener("click", () => {
      location.hash = `post/${encodeURIComponent(card.dataset.post)}`;
    });
  });
}

function renderPost(id) {
  const post = POSTS.find(p => p.id === id);
  if (!post) {
    app.innerHTML = `<div class="empty">Материал не найден. <a href="#home">Вернуться на главную</a>.</div>`;
    return;
  }

  app.innerHTML = `
    <article class="post">
      <a class="back-link" href="#category/${post.category}/${post.section}">← Назад в архив</a>
      <div class="eyebrow">${categoryName(post.category)} / ${sectionName(post.category, post.section)}</div>
      <h1>${escapeHtml(post.title)}</h1>
      <p class="post-lead">${escapeHtml(post.excerpt)}</p>
      ${post.image ? `<img class="post-image" src="${escapeHtml(post.image)}" alt="">` : ""}
      ${post.blocks.map(block => `
        <section class="lore-block">
          ${block.heading ? `<h2>${escapeHtml(block.heading)}</h2>` : ""}
          ${String(block.text || "").split(/\n\s*\n/).map(p => `<p>${escapeHtml(p)}</p>`).join("")}
        </section>
      `).join('<div class="divider"></div>')}
    </article>
  `;
}

function render() {
  const raw = location.hash.slice(1) || "home";
  const parts = raw.split("/");

  if (parts[0] === "category") {
    renderCategory(parts[1], parts[2] || "all");
  } else if (parts[0] === "post") {
    renderPost(decodeURIComponent(parts.slice(1).join("/")));
  } else {
    renderHome();
  }

  updateActiveNav(raw);
  window.scrollTo({ top: 0, behavior: "instant" });
}

function updateActiveNav(raw) {
  mainNav.querySelectorAll(".nav-link").forEach(link => {
    link.classList.toggle("active", link.dataset.route.slice(1) === raw);
  });
}

function openMenu() {
  sideMenu.classList.add("open");
  menuBackdrop.classList.add("open");
  sideMenu.setAttribute("aria-hidden", "false");
  document.getElementById("menuToggle").setAttribute("aria-expanded", "true");
}

function closeMenu() {
  sideMenu.classList.remove("open");
  menuBackdrop.classList.remove("open");
  sideMenu.setAttribute("aria-hidden", "true");
  document.getElementById("menuToggle").setAttribute("aria-expanded", "false");
}

function updateSearch() {
  const query = searchInput.value.trim().toLowerCase();

  if (!query) {
    searchResults.innerHTML = "";
    return;
  }

  const matches = POSTS.filter(post => {
    const haystack = [
      post.title,
      post.excerpt,
      categoryName(post.category),
      sectionName(post.category, post.section),
      ...post.blocks.map(b => `${b.heading || ""} ${b.text || ""}`)
    ].join(" ").toLowerCase();
    return haystack.includes(query);
  });

  searchResults.innerHTML = matches.length
    ? matches.map(post => `
      <div class="search-result" data-search-post="${escapeHtml(post.id)}">
        <strong>${escapeHtml(post.title)}</strong><br>
        <small>${categoryName(post.category)} / ${sectionName(post.category, post.section)}</small>
      </div>
    `).join("")
    : `<div class="empty">Ничего не найдено.</div>`;

  searchResults.querySelectorAll("[data-search-post]").forEach(item => {
    item.addEventListener("click", () => {
      location.hash = `post/${encodeURIComponent(item.dataset.searchPost)}`;
      searchPanel.classList.remove("open");
      searchPanel.setAttribute("aria-hidden", "true");
    });
  });
}

document.getElementById("menuToggle").addEventListener("click", openMenu);
document.getElementById("menuClose").addEventListener("click", closeMenu);
menuBackdrop.addEventListener("click", closeMenu);

document.getElementById("searchToggle").addEventListener("click", () => {
  const open = searchPanel.classList.toggle("open");
  searchPanel.setAttribute("aria-hidden", String(!open));
  if (open) setTimeout(() => searchInput.focus(), 50);
});

document.getElementById("clearSearch").addEventListener("click", () => {
  searchInput.value = "";
  updateSearch();
  searchInput.focus();
});

searchInput.addEventListener("input", updateSearch);
window.addEventListener("hashchange", render);

renderNav();
render();
