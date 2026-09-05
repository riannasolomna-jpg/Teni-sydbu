from pathlib import Path

# Create a robust replacement admin.js based on the user's current file,
# fixing initialization and making login/API failures visible.
code = r'''const CATEGORIES = {
  stai: {
    title: "Стаи",
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
    sections: [
      ["all", "Всё"],
      ["staff", "Персонал"],
      ["housemates", "Домовец"]
    ]
  }
};

let posts = [];
let editingId = null;

const $ = id => document.getElementById(id);
const tokenKey = "arhiv_admin_token";

function token() {
  return sessionStorage.getItem(tokenKey) || "";
}

function headers(json = true) {
  const h = { "x-admin-password": token() };
  if (json) h["content-type"] = "application/json";
  return h;
}

function catTitle(c) {
  return CATEGORIES[c]?.title || c;
}

function secTitle(c, s) {
  return CATEGORIES[c]?.sections.find(x => x[0] === s)?.[1] || s;
}

function fillCategories() {
  const category = $("category");
  if (!category) return;
  category.innerHTML = Object.entries(CATEGORIES)
    .map(([k, v]) => `<option value="${k}">${v.title}</option>`)
    .join("");
  updateSections();
}

function updateSections() {
  const category = $("category");
  const section = $("section");
  if (!category || !section) return;

  const c = category.value;
  section.innerHTML = (CATEGORIES[c]?.sections || [])
    .filter(x => x[0] !== "all")
    .map(([k, v]) => `<option value="${k}">${v}</option>`)
    .join("");
}

function addBlock(data = { heading: "", text: "" }) {
  const blocks = $("blocks");
  if (!blocks) return;

  const wrap = document.createElement("div");
  wrap.className = "block-editor";
  wrap.innerHTML = `
    <button type="button" class="remove">Удалить блок</button>
    <div class="admin-field">
      <label>Заголовок блока</label>
      <input class="b-heading" maxlength="200">
    </div>
    <div class="admin-field">
      <label>Текст</label>
      <textarea class="b-text"></textarea>
    </div>
  `;

  wrap.querySelector(".b-heading").value = data.heading || "";
  wrap.querySelector(".b-text").value = data.text || "";
  wrap.querySelector(".remove").onclick = () => wrap.remove();
  blocks.appendChild(wrap);
}

function resetForm() {
  editingId = null;

  if ($("formTitle")) $("formTitle").textContent = "Новый материал";
  if ($("postForm")) $("postForm").reset();

  fillCategories();

  if ($("blocks")) {
    $("blocks").innerHTML = "";
    addBlock();
  }

  if ($("imageStatus")) $("imageStatus").textContent = "";
  if ($("saveMsg")) $("saveMsg").textContent = "";
}

async function loadPosts() {
  const r = await fetch("/api/posts", { cache: "no-store" });
  if (!r.ok) throw new Error(`Ошибка загрузки материалов: ${r.status}`);
  posts = await r.json();
  renderPosts();
}

function renderPosts() {
  const adminPosts = $("adminPosts");
  if (!adminPosts) return;

  if (!posts.length) {
    adminPosts.innerHTML = "<p>Материалов пока нет.</p>";
    return;
  }

  adminPosts.innerHTML = posts.map(p => `
    <div class="admin-post">
      <div>
        <strong>${esc(p.title)}</strong><br>
        <small>${esc(catTitle(p.category))} / ${esc(secTitle(p.category, p.section))}</small>
      </div>
      <div class="admin-actions">
        <button type="button" data-edit="${esc(p.id)}">Изменить</button>
        <button type="button" data-delete="${esc(p.id)}">Удалить</button>
      </div>
    </div>
  `).join("");

  adminPosts.querySelectorAll("[data-edit]")
    .forEach(b => b.onclick = () => editPost(b.dataset.edit));

  adminPosts.querySelectorAll("[data-delete]")
    .forEach(b => b.onclick = () => deletePost(b.dataset.delete));
}

function esc(v) {
  return String(v || "").replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;"
  }[c]));
}

function editPost(id) {
  const p = posts.find(x => x.id === id);
  if (!p) return;

  editingId = id;
  $("formTitle").textContent = "Изменить материал";
  $("title").value = p.title || "";
  $("excerpt").value = p.excerpt || "";
  $("category").value = p.category;
  updateSections();
  $("section").value = p.section;
  $("blocks").innerHTML = "";

  (p.blocks || []).forEach(addBlock);
  if (!p.blocks?.length) addBlock();

  $("image").value = p.image || "";
  $("imageStatus").textContent = p.image
    ? "Ссылка на изображение сохранена."
    : "";

  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function checkPassword(password) {
  return fetch("/api/admin/check", {
    method: "POST",
    headers: { "x-admin-password": password },
    cache: "no-store"
  });
}

async function showAdmin() {
  $("loginPanel").hidden = true;
  $("editorPanel").hidden = false;
  $("postsPanel").hidden = false;

  fillCategories();
  resetForm();

  try {
    await loadPosts();
  } catch (err) {
    $("adminPosts").textContent =
      err.message || "Не удалось загрузить материалы.";
  }
}

async function handleLogin(event) {
  event.preventDefault();

  const msg = $("loginMsg");
  const password = $("password").value;

  msg.className = "";
  msg.textContent = "Проверяем…";

  if (!password) {
    msg.className = "admin-error";
    msg.textContent = "Введите пароль.";
    return;
  }

  try {
    const r = await checkPassword(password);

    if (!r.ok) {
      msg.className = "admin-error";
      msg.textContent = r.status === 401
        ? "Неверный пароль."
        : `Ошибка авторизации (${r.status}).`;
      return;
    }

    sessionStorage.setItem(tokenKey, password);
    msg.textContent = "";
    await showAdmin();
  } catch (err) {
    msg.className = "admin-error";
    msg.textContent =
      "Не удалось связаться с сервером. Проверьте интернет и попробуйте ещё раз.";
    console.error(err);
  }
}

async function savePost(event) {
  event.preventDefault();

  $("saveMsg").className = "";
  $("saveMsg").textContent = "Сохраняем…";

  try {
    const blocks = [...document.querySelectorAll(".block-editor")]
      .map(x => ({
        heading: x.querySelector(".b-heading").value.trim(),
        text: x.querySelector(".b-text").value.trim()
      }))
      .filter(x => x.heading || x.text);

    if (!blocks.length) {
      throw new Error("Добавь хотя бы один блок текста.");
    }

    const body = {
      title: $("title").value.trim(),
      excerpt: $("excerpt").value.trim(),
      category: $("category").value,
      section: $("section").value,
      image: $("image").value.trim(),
      blocks
    };

    const url = editingId
      ? `/api/posts/${encodeURIComponent(editingId)}`
      : "/api/posts";

    const r = await fetch(url, {
      method: editingId ? "PUT" : "POST",
      headers: headers(),
      body: JSON.stringify(body)
    });

    const d = await r.json();

    if (!r.ok) {
      throw new Error(d.error || `Ошибка сохранения (${r.status})`);
    }

    $("saveMsg").className = "admin-ok";
    $("saveMsg").textContent = "Материал сохранён.";

    await loadPosts();
    resetForm();
  } catch (err) {
    $("saveMsg").className = "admin-error";
    $("saveMsg").textContent =
      err.message || "Произошла ошибка.";
  }
}

async function deletePost(id) {
  if (!confirm("Удалить этот материал?")) return;

  try {
    const r = await fetch(`/api/posts/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: headers(false)
    });

    if (r.ok) {
      await loadPosts();
    } else {
      alert("Не удалось удалить материал.");
    }
  } catch {
    alert("Не удалось связаться с сервером.");
  }
}

async function restoreSession() {
  const savedToken = token();
  if (!savedToken) return;

  try {
    const r = await checkPassword(savedToken);
    if (r.ok) {
      await showAdmin();
    } else {
      sessionStorage.removeItem(tokenKey);
    }
  } catch {
    // Ничего не делаем: пользователь всё равно увидит форму входа.
  }
}

document.addEventListener("DOMContentLoaded", () => {
  $("loginForm").addEventListener("submit", handleLogin);
  $("category").addEventListener("change", updateSections);
  $("addBlock").addEventListener("click", () => addBlock());
  $("cancelEdit").addEventListener("click", resetForm);
  $("postForm").addEventListener("submit", savePost);

  restoreSession();
});
'''

path = Path("/mnt/data/admin.js")
path.write_text(code, encoding="utf-8")
print(f"Готово: {path}")
                       
