const STORAGE_KEY = "assistant_api_base";
const THEME_KEY = "assistant_theme";
const defaultBase = window.location.origin;
let apiBase = (localStorage.getItem(STORAGE_KEY) || defaultBase).replace(/\/+$/, "");
let isDemoMode = false;

// Current Filter States
let currentReportYear = new Date().getFullYear();
let currentReportMonth = new Date().getMonth() + 1;
let currentExpenseCategory = "";
let currentNutritionDate = new Date().toISOString().split("T")[0];

// DOM Utilities
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const formatRupiah = value => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(value || 0));
const formatDate = value => value ? new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value)) : "—";
const titleCase = value => String(value || "").replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

// Mock Data for Demo/Preview when backend is not running
const mockData = {
  profile: {
    height_cm: 172,
    weight_kg: 66,
    age: 26,
    gender: "male",
    activity_level: "moderately_active",
    monthly_salary: 8500000,
    daily_calorie_target: 2150
  },
  bmr: 1640,
  tdee: 2255,
  overview: {
    budget: {
      current_spent: 1450000,
      total_budget: 8500000,
      remaining: 7050000,
      spent_percentage: 17
    },
    nutrition_today: {
      total_calories: 1680,
      remaining_calories: 470,
      target_calories: 2150,
      total_protein: 112,
      total_carbs: 185,
      total_fat: 48,
      status: "optimal"
    },
    workout_stats: {
      total_sessions: 6,
      total_duration_minutes: 270
    },
    recent_expenses: [
      { id: 1, description: "Makan Siang Nasi Padang", category: "makan", amount: 35000, occurred_at: new Date(Date.now() - 3600000 * 2).toISOString() },
      { id: 2, description: "Bensin Motor & Parkir", category: "transport", amount: 50000, occurred_at: new Date(Date.now() - 3600000 * 7).toISOString() },
      { id: 3, description: "Kopi Susu Espresso", category: "makan", amount: 24000, occurred_at: new Date(Date.now() - 3600000 * 18).toISOString() },
      { id: 4, description: "Langganan Spotify Family", category: "hiburan", amount: 86000, occurred_at: new Date(Date.now() - 3600000 * 48).toISOString() },
      { id: 5, description: "Belanja Mingguan Supermarket", category: "belanja", amount: 320000, occurred_at: new Date(Date.now() - 3600000 * 72).toISOString() }
    ],
    active_reminders: [
      { id: "rem-1", title: "Minum Vitamin & Air Putih", scheduled_at: new Date(Date.now() + 3600000 * 2).toISOString(), recurrence: "daily" },
      { id: "rem-2", title: "Review Pengeluaran Mingguan", scheduled_at: new Date(Date.now() + 3600000 * 6).toISOString(), recurrence: "weekly" },
      { id: "rem-3", title: "Jadwal Lari Sore 5K", scheduled_at: new Date(Date.now() + 3600000 * 24).toISOString(), recurrence: "" }
    ]
  },
  expenseReport: {
    period: "Oktober 2026",
    total: 1450000,
    breakdown: {
      makan: 680000,
      transport: 240000,
      belanja: 320000,
      hiburan: 86000,
      tagihan: 124000
    }
  },
  detailedExpenses: [
    { id: 101, description: "Makan Siang Nasi Padang", category: "makan", amount: 35000, occurred_at: new Date(Date.now() - 3600000 * 2).toISOString() },
    { id: 102, description: "Bensin Shell Super", category: "transport", amount: 50000, occurred_at: new Date(Date.now() - 3600000 * 7).toISOString() },
    { id: 103, description: "Kopi Susu Espresso", category: "makan", amount: 24000, occurred_at: new Date(Date.now() - 3600000 * 18).toISOString() },
    { id: 104, description: "Langganan Spotify", category: "hiburan", amount: 86000, occurred_at: new Date(Date.now() - 3600000 * 48).toISOString() },
    { id: 105, description: "Belanja Buah & Sayur", category: "belanja", amount: 320000, occurred_at: new Date(Date.now() - 3600000 * 72).toISOString() },
    { id: 106, description: "Tagihan Listrik PLN", category: "tagihan", amount: 124000, occurred_at: new Date(Date.now() - 3600000 * 96).toISOString() }
  ],
  nutrition: {
    status: "optimal",
    total_calories: 1680,
    target_calories: 2150,
    total_protein: 112,
    total_carbs: 185,
    total_fat: 48,
    meals: [
      { food_name: "Oatmeal Pisang & Whey Protein", estimated_calories: 420, logged_at: new Date(Date.now() - 3600000 * 6).toISOString() },
      { food_name: "Nasi Ayam Bakar & Sayur Lalap", estimated_calories: 680, logged_at: new Date(Date.now() - 3600000 * 3).toISOString() },
      { food_name: "Greek Yogurt & Almond Snack", estimated_calories: 260, logged_at: new Date(Date.now() - 3600000 * 1).toISOString() }
    ]
  },
  workouts: {
    stats: { total_sessions: 6, total_duration_minutes: 270 },
    recent: [
      { id: 1, type: "GYM", title: "Latihan Beban (Chest & Triceps)", duration_minutes: 55, calories_burned: 380, logged_at: new Date(Date.now() - 3600000 * 16).toISOString() },
      { id: 2, type: "RUN", title: "Lari Pagi Santai 5 km", duration_minutes: 32, calories_burned: 310, logged_at: new Date(Date.now() - 3600000 * 40).toISOString() },
      { id: 3, type: "CYC", title: "Bersepeda Sore Keliling Kota", duration_minutes: 45, calories_burned: 280, logged_at: new Date(Date.now() - 3600000 * 70).toISOString() }
    ]
  },
  chat: [
    { role: "assistant", message: "Halo! Saya bot asisten pribadi Anda. Ada yang bisa saya bantu terkait keuangan, asupan nutrisi, olahraga, atau profil fisik Anda?" }
  ]
};

// API Client
async function api(path, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);

  try {
    const response = await fetch(`${apiBase}${path}`, {
      ...options,
      signal: controller.signal,
      headers: { "Content-Type": "application/json", ...(options.headers || {}) }
    });
    clearTimeout(timeoutId);
    const text = await response.text();
    let payload = {};
    try { payload = text ? JSON.parse(text) : {}; } catch { payload = { error: text }; }
    if (!response.ok) throw new Error(payload.error || payload.message || `HTTP ${response.status}`);
    return payload;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

// Toast notification
function toast(message) {
  const el = $("#toast");
  if (!el) return;
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove("show"), 2800);
}

// View switcher
function showView(name) {
  $$(".view").forEach(el => el.classList.toggle("active", el.id === `view-${name}`));
  $$(".nav-item, .mobile-nav-item").forEach(el => el.classList.toggle("active", el.dataset.view === name));
  const titles = {
    overview: "Ringkasan",
    finance: "Keuangan & Pengeluaran",
    health: "Kesehatan & Nutrisi",
    profile: "Profil & Target Fisik",
    assistant: "Asisten AI",
    settings: "Pengaturan"
  };
  $("#pageTitle").textContent = titles[name] || "Ringkasan";
  
  if (name === "assistant") loadChat();
  if (name === "profile") loadProfile();
  if (name === "finance") {
    loadExpenseReport(currentReportYear, currentReportMonth);
    loadExpenseDetail(currentReportYear, currentReportMonth, currentExpenseCategory);
  }
}

function openLocalView(name) {
  showView(name);
  history.replaceState(null, "", `#${name}`);
}

// Theme handling
function initTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY) || (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
  document.documentElement.setAttribute("data-theme", savedTheme);
  
  const toggleBtn = $("#themeToggle");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme");
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem(THEME_KEY, next);
      toast(`Mode ${next === "dark" ? "Gelap" : "Terang"} diaktifkan`);
    });
  }
}

// Category Icons Mapping
function getCategoryIcon(cat) {
  const map = {
    makan: "🍽️",
    transport: "🚗",
    hiburan: "🎬",
    kesehatan: "💊",
    belanja: "🛍️",
    tagihan: "⚡",
    amal: "🤲",
    lainnya: "📦"
  };
  return map[cat] || "💸";
}

// Calculate BMI
function calculateBMI(heightCm, weightKg) {
  if (!heightCm || !weightKg) return { value: "—", status: "Belum lengkap" };
  const hM = heightCm / 100;
  const bmi = (weightKg / (hM * hM)).toFixed(1);
  let status = "Normal";
  if (bmi < 18.5) status = "Kurang Berat";
  else if (bmi >= 23 && bmi < 25) status = "Kelebihan Ringan";
  else if (bmi >= 25) status = "Obesitas / Berlebih";
  return { value: bmi, status };
}

// Load All Data
async function loadAll() {
  try {
    const overview = await api("/api/v1/stats/overview");
    const data = overview.data || {};
    isDemoMode = false;
    $("#demoBanner").style.display = "none";
    $("#apiStatus").textContent = "Terhubung";
    $("#apiStatus").className = "status-pill";
    $("#sideStatus").textContent = "API Terhubung";
    
    renderOverview(data);
    await Promise.all([
      loadProfile(),
      loadReminders(),
      loadNutrition(currentNutritionDate),
      loadWorkouts(),
      loadExpenseReport(currentReportYear, currentReportMonth),
      loadExpenseDetail(currentReportYear, currentReportMonth, currentExpenseCategory)
    ]);
  } catch (error) {
    // Graceful fallback to demo mode so user interface remains complete and clean
    isDemoMode = true;
    $("#demoBanner").style.display = "inline-flex";
    $("#apiStatus").textContent = "Mode Demo (Offline)";
    $("#apiStatus").className = "status-pill";
    $("#sideStatus").textContent = "Mode Demo";
    
    renderOverview(mockData.overview);
    renderProfile(mockData.profile, mockData.bmr, mockData.tdee);
    renderReminders($("#financeReminders"), mockData.overview.active_reminders, true);
    renderNutritionData(mockData.nutrition);
    renderWorkoutData(mockData.workouts);
    renderExpenseReport(mockData.expenseReport);
    renderExpenseDetail(mockData.detailedExpenses);
  }
}

// ==========================================
// 1. Profile Handlers (GET /api/v1/profile, PUT /api/v1/profile)
// ==========================================
async function loadProfile() {
  try {
    const payload = await api("/api/v1/profile");
    const res = payload.data || {};
    renderProfile(res.profile || {}, res.bmr || 0, res.tdee || 0);
  } catch (err) {
    if (isDemoMode) {
      renderProfile(mockData.profile, mockData.bmr, mockData.tdee);
    }
  }
}

function renderProfile(profile, bmr, tdee) {
  // Update Profile View Cards
  $("#cardBmrValue").textContent = bmr ? `${Math.round(bmr)} kcal` : "—";
  $("#cardTdeeValue").textContent = tdee ? `${Math.round(tdee)} kcal` : "—";
  
  const bmi = calculateBMI(profile.height_cm, profile.weight_kg);
  $("#cardBmiValue").textContent = bmi.value;
  $("#cardBmiStatus").textContent = `Status: ${bmi.status}`;
  
  $("#cardSalaryValue").textContent = formatRupiah(profile.monthly_salary || 0);

  // Update Overview Quick Profile Bar
  $("#quickBMR").textContent = bmr ? `${Math.round(bmr)} kcal` : "—";
  $("#quickTDEE").textContent = tdee ? `${Math.round(tdee)} kcal` : "—";
  $("#quickMetrics").textContent = `${profile.height_cm || 0} cm / ${profile.weight_kg || 0} kg`;

  // Populate Form Fields
  const form = $("#profileForm");
  if (form) {
    if (form.elements.height_cm) form.elements.height_cm.value = profile.height_cm || "";
    if (form.elements.weight_kg) form.elements.weight_kg.value = profile.weight_kg || "";
    if (form.elements.age) form.elements.age.value = profile.age || "";
    if (form.elements.gender) form.elements.gender.value = profile.gender || "male";
    if (form.elements.activity_level) form.elements.activity_level.value = profile.activity_level || "sedentary";
    if (form.elements.monthly_salary) form.elements.monthly_salary.value = profile.monthly_salary || "";
  }
}

$("#profileForm")?.addEventListener("submit", async event => {
  event.preventDefault();
  const form = new FormData(event.target);
  const payload = {
    height_cm: Number(form.get("height_cm")),
    weight_kg: Number(form.get("weight_kg")),
    age: parseInt(form.get("age")),
    gender: form.get("gender"),
    activity_level: form.get("activity_level"),
    monthly_salary: Number(form.get("monthly_salary"))
  };

  try {
    if (!isDemoMode) {
      const res = await api("/api/v1/profile", {
        method: "PUT",
        body: JSON.stringify(payload)
      });
      toast("Profil fisik & target berhasil disimpan!");
      const data = res.data || {};
      renderProfile(data.profile || payload, data.bmr, data.tdee);
    } else {
      mockData.profile = { ...mockData.profile, ...payload };
      // Simple Harris-Benedict fallback calculation
      const isMale = payload.gender === "male";
      const bmr = isMale
        ? 88.362 + (13.397 * payload.weight_kg) + (4.799 * payload.height_cm) - (5.677 * payload.age)
        : 447.593 + (9.247 * payload.weight_kg) + (3.098 * payload.height_cm) - (4.330 * payload.age);
      const mult = { sedentary: 1.2, lightly_active: 1.375, moderately_active: 1.55, very_active: 1.725, extra_active: 1.9 }[payload.activity_level] || 1.2;
      mockData.bmr = Math.round(bmr);
      mockData.tdee = Math.round(bmr * mult);
      renderProfile(mockData.profile, mockData.bmr, mockData.tdee);
      toast("Profil disimpan (Mode Demo)!");
    }
  } catch (error) {
    toast(error.message);
  }
});

// ==========================================
// 2. Expense Reports & Detail Handlers (/expenses/report & /expenses/detail)
// ==========================================
async function loadExpenseReport(year, month) {
  try {
    const payload = await api(`/api/v1/expenses/report?year=${year}&month=${month}`);
    renderExpenseReport(payload.data || {});
  } catch (err) {
    if (isDemoMode) renderExpenseReport(mockData.expenseReport);
  }
}

function renderExpenseReport(report) {
  const period = report.period || `Bulan ${currentReportMonth} ${currentReportYear}`;
  $("#reportPeriodTitle").textContent = `Distribusi Kategori (${period})`;
  $("#reportTotalSpent").textContent = formatRupiah(report.total || 0);

  const container = $("#categoryBreakdownBars");
  if (!container) return;

  const breakdown = report.breakdown || {};
  const total = report.total || 0;
  const entries = Object.entries(breakdown);

  if (!entries.length) {
    container.innerHTML = '<div class="empty-state" style="padding: 10px;"><small>Belum ada rincian kategori.</small></div>';
    return;
  }

  container.innerHTML = entries.map(([cat, amount]) => {
    const pct = total > 0 ? Math.round((amount / total) * 100) : 0;
    return `
      <div class="breakdown-item">
        <div class="breakdown-meta">
          <span class="breakdown-cat">${getCategoryIcon(cat)} ${titleCase(cat)}</span>
          <span class="breakdown-val">${formatRupiah(amount)} (${pct}%)</span>
        </div>
        <div class="breakdown-progress">
          <div class="breakdown-bar" style="width: ${pct}%;"></div>
        </div>
      </div>
    `;
  }).join("");
}

async function loadExpenseDetail(year, month, category = "") {
  try {
    const query = category ? `?year=${year}&month=${month}&category=${encodeURIComponent(category)}` : `?year=${year}&month=${month}`;
    const payload = await api(`/api/v1/expenses/detail${query}`);
    renderExpenseDetail(payload.data || []);
  } catch (err) {
    if (isDemoMode) {
      let filtered = mockData.detailedExpenses;
      if (category) filtered = filtered.filter(e => e.category === category);
      renderExpenseDetail(filtered);
    }
  }
}

function renderExpenseDetail(expenses) {
  const root = $("#detailExpenseList");
  if (!root) return;

  if (!expenses.length) {
    root.innerHTML = '<div class="empty-state"><p>Tidak ada transaksi pada filter periode ini.</p></div>';
    return;
  }

  root.innerHTML = expenses.map(item => `
    <div class="list-row">
      <div class="row-icon">${getCategoryIcon(item.category)}</div>
      <div class="row-main">
        <strong>${escapeHtml(item.description)}</strong>
        <small>${titleCase(item.category)} · ${formatDate(item.occurred_at || item.created_at)}</small>
      </div>
      <div class="row-value">${formatRupiah(item.amount)}</div>
    </div>
  `).join("");
}

// Populate Year Select Options
function initExpenseDateFilters() {
  const yearSelect = $("#expenseYearSelect");
  const monthSelect = $("#expenseMonthSelect");
  if (!yearSelect || !monthSelect) return;

  const currentYear = new Date().getFullYear();
  yearSelect.innerHTML = [currentYear - 1, currentYear, currentYear + 1]
    .map(y => `<option value="${y}" ${y === currentYear ? "selected" : ""}>${y}</option>`)
    .join("");

  monthSelect.value = currentReportMonth;

  yearSelect.addEventListener("change", () => {
    currentReportYear = parseInt(yearSelect.value);
    loadExpenseReport(currentReportYear, currentReportMonth);
    loadExpenseDetail(currentReportYear, currentReportMonth, currentExpenseCategory);
  });

  monthSelect.addEventListener("change", () => {
    currentReportMonth = parseInt(monthSelect.value);
    loadExpenseReport(currentReportYear, currentReportMonth);
    loadExpenseDetail(currentReportYear, currentReportMonth, currentExpenseCategory);
  });

  // Category filter pills
  $$(".cat-pill").forEach(pill => {
    pill.addEventListener("click", () => {
      $$(".cat-pill").forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      currentExpenseCategory = pill.dataset.cat || "";
      loadExpenseDetail(currentReportYear, currentReportMonth, currentExpenseCategory);
    });
  });
}

// Expense Form Submission (with occurred_at support)
$("#expenseForm")?.addEventListener("submit", async event => {
  event.preventDefault();
  const form = new FormData(event.target);
  const amount = Number(form.get("amount"));
  const category = form.get("category");
  const description = form.get("description");
  const localOccurred = form.get("occurred_at");
  const occurred_at = localOccurred ? localOccurred.replace("T", " ") + ":00" : "";

  try {
    if (!isDemoMode) {
      await api("/api/v1/expenses", {
        method: "POST",
        body: JSON.stringify({ amount, category, description, occurred_at })
      });
    } else {
      const newExp = {
        id: Date.now(),
        description,
        category,
        amount,
        occurred_at: localOccurred ? new Date(localOccurred).toISOString() : new Date().toISOString()
      };
      mockData.overview.recent_expenses.unshift(newExp);
      mockData.detailedExpenses.unshift(newExp);
      mockData.expenseReport.breakdown[category] = (mockData.expenseReport.breakdown[category] || 0) + amount;
      mockData.expenseReport.total += amount;
      mockData.overview.budget.current_spent += amount;
      mockData.overview.budget.remaining = Math.max(0, mockData.overview.budget.total_budget - mockData.overview.budget.current_spent);
      mockData.overview.budget.spent_percentage = Math.round((mockData.overview.budget.current_spent / mockData.overview.budget.total_budget) * 100);
    }
    event.target.reset();
    toast("Pengeluaran berhasil dicatat!");
    loadAll();
  } catch (error) {
    toast(error.message);
  }
});

// ==========================================
// 3. Reminders Management (with recurrence support)
// ==========================================
$("#reminderForm")?.addEventListener("submit", async event => {
  event.preventDefault();
  const form = new FormData(event.target);
  const local = form.get("scheduled_at");
  const scheduled = local ? local.replace("T", " ") + ":00" : "";
  const title = form.get("title");
  const recurrence = form.get("recurrence") || null;

  try {
    if (!isDemoMode) {
      await api("/api/v1/reminders", {
        method: "POST",
        body: JSON.stringify({ title, scheduled_at: scheduled, recurrence })
      });
    } else {
      mockData.overview.active_reminders.unshift({
        id: "rem-" + Date.now(),
        title,
        scheduled_at: new Date(local).toISOString(),
        recurrence
      });
    }
    event.target.reset();
    toast("Pengingat baru berhasil ditambahkan!");
    loadAll();
  } catch (error) {
    toast(error.message);
  }
});

function renderReminders(root, reminders, showDelete = true) {
  if (!root) return;
  if (!reminders.length) {
    root.innerHTML = '<div class="empty-state"><p>Tidak ada pengingat yang aktif.</p></div>';
    return;
  }
  root.innerHTML = reminders.slice(0, 10).map(item => `
    <div class="list-row">
      <div class="row-icon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      </div>
      <div class="row-main">
        <strong>${escapeHtml(item.title)}</strong>
        <small>
          ${formatDate(item.scheduled_at)}
          ${item.recurrence ? ` · <span style="color: var(--primary);">🔁 ${titleCase(item.recurrence)}</span>` : ""}
        </small>
      </div>
      ${showDelete ? `
        <button class="delete-button" data-delete-reminder="${item.id}" aria-label="Hapus pengingat" title="Hapus">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>` : ""}
    </div>`).join("");
}

async function loadReminders() {
  try {
    const payload = await api("/api/v1/reminders");
    renderReminders($("#financeReminders"), payload.data || [], true);
  } catch (e) {
    if (isDemoMode) renderReminders($("#financeReminders"), mockData.overview.active_reminders, true);
  }
}

$("#financeReminders")?.addEventListener("click", async event => {
  const button = event.target.closest("[data-delete-reminder]");
  if (!button) return;
  const remId = button.dataset.deleteReminder;
  try {
    if (!isDemoMode) {
      await api(`/api/v1/reminders/${remId}`, { method: "DELETE" });
    } else {
      mockData.overview.active_reminders = mockData.overview.active_reminders.filter(r => String(r.id) !== String(remId));
    }
    toast("Pengingat berhasil dihapus");
    loadAll();
  } catch (error) {
    toast(error.message);
  }
});

// ==========================================
// 4. Nutrition by Date Handlers (/nutrition/today?date=...)
// ==========================================
function renderNutritionData(data) {
  const percent = data.target_calories ? Math.min(Math.round(data.total_calories / data.target_calories * 100), 100) : 0;
  const ring = $(".nutrition-ring");
  if (ring) ring.style.setProperty("--ring", `${percent}%`);
  $("#nutritionPercent").textContent = `${percent}%`;
  $("#proteinValue").textContent = `${Math.round(data.total_protein || 0)} g`;
  $("#carbsValue").textContent = `${Math.round(data.total_carbs || 0)} g`;
  $("#fatValue").textContent = `${Math.round(data.total_fat || 0)} g`;
  $("#nutritionStatus").textContent = titleCase(data.status || "optimal");
  
  const mealRoot = $("#mealList");
  if (!mealRoot) return;
  mealRoot.innerHTML = data.meals?.length ? data.meals.slice(0, 8).map(meal => `
    <div class="list-row">
      <div class="row-icon">🥗</div>
      <div class="row-main">
        <strong>${escapeHtml(meal.food_name)}</strong>
        <small>${formatDate(meal.logged_at)}</small>
      </div>
      <div class="row-value">${meal.estimated_calories} kcal</div>
    </div>`).join("") : '<div class="empty-state"><p>Belum ada catatan makanan pada tanggal ini.</p></div>';
}

async function loadNutrition(dateStr) {
  try {
    const query = dateStr ? `?date=${dateStr}` : "";
    const payload = await api(`/api/v1/nutrition/today${query}`);
    renderNutritionData(payload.data || {});
  } catch (e) {
    if (isDemoMode) renderNutritionData(mockData.nutrition);
  }
}

$("#nutritionDateInput")?.addEventListener("change", event => {
  currentNutritionDate = event.target.value;
  loadNutrition(currentNutritionDate);
});

// ==========================================
// 5. Workouts Handlers (/workouts)
// ==========================================
function renderWorkoutData(data) {
  const stats = data.stats || {};
  const recent = data.recent || [];
  $("#healthWorkoutSessions").textContent = stats.total_sessions ?? 0;
  $("#healthWorkoutMinutes").textContent = stats.total_duration_minutes ?? 0;
  
  const workoutRoot = $("#workoutList");
  if (!workoutRoot) return;
  workoutRoot.innerHTML = recent.length ? recent.slice(0, 10).map(workout => {
    const badgeType = String(workout.type || "GYM").slice(0, 3).toUpperCase();
    return `
      <div class="list-row">
        <div class="row-icon">${escapeHtml(badgeType)}</div>
        <div class="row-main">
          <strong>${escapeHtml(workout.title)}</strong>
          <small>${formatDate(workout.logged_at)} · ${workout.duration_minutes} menit</small>
        </div>
        <div class="row-value">${workout.calories_burned} kcal</div>
      </div>`;
  }).join("") : '<div class="empty-state"><p>Belum ada aktivitas olahraga tercatat.</p></div>';
}

async function loadWorkouts() {
  try {
    const payload = await api("/api/v1/workouts");
    renderWorkoutData(payload.data || {});
  } catch (e) {
    if (isDemoMode) renderWorkoutData(mockData.workouts);
  }
}

// ==========================================
// 6. Overview Renderer
// ==========================================
function renderOverview(data) {
  const budget = data.budget || {};
  const expense = data.expense_report || {};
  const nutrition = data.nutrition_today || {};
  const workouts = data.workout_stats || {};

  const spentAmount = budget.current_spent ?? expense.total ?? 0;
  $("#spentValue").textContent = formatRupiah(spentAmount);
  $("#spentCaption").textContent = budget.remaining != null ? `${formatRupiah(budget.remaining)} sisa budget` : "Bulan ini";
  
  const percent = Math.min(Number(budget.spent_percentage || 0), 100);
  $("#budgetProgress").style.width = `${percent}%`;
  const percentEl = $("#spentPercentLabel");
  if (percentEl) percentEl.textContent = `${percent}%`;

  $("#calorieValue").textContent = `${nutrition.total_calories ?? 0} kcal`;
  $("#calorieCaption").textContent = `${nutrition.remaining_calories ?? 0} kcal tersisa hari ini`;

  $("#workoutValue").textContent = workouts.total_sessions ?? 0;
  $("#workoutCaption").textContent = `${workouts.total_duration_minutes ?? 0} menit latihan bulan ini`;

  renderExpenses($("#homeExpenses"), data.recent_expenses || []);
  renderReminders($("#homeReminders"), data.active_reminders || [], false);

  if (data.profile || data.bmr || data.tdee) {
    renderProfile(data.profile || {}, data.bmr || 0, data.tdee || 0);
  }
}

function renderExpenses(root, expenses) {
  if (!root) return;
  if (!expenses.length) {
    root.innerHTML = '<div class="empty-state"><p>Belum ada catatan pengeluaran bulan ini.</p></div>';
    return;
  }
  root.innerHTML = expenses.slice(0, 6).map(item => `
    <div class="list-row">
      <div class="row-icon">${getCategoryIcon(item.category)}</div>
      <div class="row-main">
        <strong>${escapeHtml(item.description)}</strong>
        <small>${titleCase(item.category)} · ${formatDate(item.occurred_at || item.created_at)}</small>
      </div>
      <div class="row-value">${formatRupiah(item.amount)}</div>
    </div>`).join("");
}

// ==========================================
// 7. Chat Handlers (/chat/history, /webhook/message, /chat/reset)
// ==========================================
async function loadChat() {
  const chatBox = $("#chatMessages");
  if (!chatBox) return;

  try {
    const payload = await api("/api/v1/chat/history?limit=30");
    const messages = payload.data || [];
    if (!messages.length) {
      chatBox.innerHTML = '<div class="empty-state"><p>Mulai percakapan dengan memilih prompt atau ketik pesan Anda.</p></div>';
      return;
    }
    chatBox.innerHTML = messages.map(msg => `<div class="message ${msg.role === "user" ? "user" : "assistant"}">${escapeHtml(msg.message)}</div>`).join("");
    chatBox.scrollTop = chatBox.scrollHeight;
  } catch (error) {
    chatBox.innerHTML = mockData.chat.map(msg => `<div class="message ${msg.role === "user" ? "user" : "assistant"}">${escapeHtml(msg.message)}</div>`).join("");
  }
}

$("#chatForm")?.addEventListener("submit", async event => {
  event.preventDefault();
  const input = $("#chatInput");
  const message = input.value.trim();
  if (!message) return;

  const chatMessages = $("#chatMessages");
  chatMessages.insertAdjacentHTML("beforeend", `<div class="message user">${escapeHtml(message)}</div>`);
  input.value = "";
  chatMessages.scrollTop = chatMessages.scrollHeight;

  try {
    if (!isDemoMode) {
      const payload = await api("/api/v1/webhook/message", { method: "POST", body: JSON.stringify({ from: "dashboard", message }) });
      chatMessages.insertAdjacentHTML("beforeend", `<div class="message assistant">${escapeHtml(payload.reply || payload.error || "Tidak ada jawaban.")}</div>`);
    } else {
      setTimeout(() => {
        let reply = "Pesan dicatat oleh asisten.";
        const low = message.toLowerCase();
        if (low.includes("pengeluaran") || low.includes("budget") || low.includes("uang")) {
          reply = `Total pengeluaran Anda saat ini adalah ${formatRupiah(mockData.overview.budget.current_spent)} dari total anggaran ${formatRupiah(mockData.overview.budget.total_budget)}. Sisa budget tersisa ${formatRupiah(mockData.overview.budget.remaining)}.`;
        } else if (low.includes("kalori") || low.includes("makan") || low.includes("nutrisi")) {
          reply = `Asupan kalori hari ini: ${mockData.nutrition.total_calories} kcal dari target ${mockData.nutrition.target_calories} kcal. Protein: ${mockData.nutrition.total_protein}g.`;
        } else if (low.includes("bmr") || low.includes("tdee") || low.includes("profil")) {
          reply = `Metrik fisik Anda: BMR = ${mockData.bmr} kcal (kebutuhan dasar) dan TDEE = ${mockData.tdee} kcal (total energi harian berdasarkan tingkat aktivitas).`;
        } else if (low.includes("jadwal") || low.includes("pengingat") || low.includes("agenda")) {
          reply = `Pengingat aktif terdekat: "${mockData.overview.active_reminders[0]?.title || 'Tidak ada jadwal'}" pada ${formatDate(mockData.overview.active_reminders[0]?.scheduled_at)}.`;
        } else if (low.includes("olahraga")) {
          reply = `Bulan ini Anda telah menyelesaikan ${mockData.workouts.stats.total_sessions} sesi latihan dengan total durasi ${mockData.workouts.stats.total_duration_minutes} menit.`;
        }
        chatMessages.insertAdjacentHTML("beforeend", `<div class="message assistant">${escapeHtml(reply)}</div>`);
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }, 500);
    }
  } catch (error) {
    toast(error.message);
  }
});

$$(".suggestion-chip").forEach(chip => {
  chip.addEventListener("click", () => {
    const prompt = chip.dataset.prompt;
    const input = $("#chatInput");
    if (input && prompt) {
      input.value = prompt;
      $("#chatForm")?.dispatchEvent(new Event("submit"));
    }
  });
});

$("#clearChat")?.addEventListener("click", async () => {
  try {
    if (!isDemoMode) {
      await api("/api/v1/chat/reset", { method: "POST" });
    } else {
      mockData.chat = [];
    }
    $("#chatMessages").innerHTML = '<div class="empty-state"><p>Percakapan telah dibersihkan.</p></div>';
    toast("Riwayat percakapan dihapus");
  } catch (error) {
    toast(error.message);
  }
});

// ==========================================
// 8. Settings & Health Ping (/health, /briefing)
// ==========================================
$("#settingsForm")?.addEventListener("submit", async event => {
  event.preventDefault();
  apiBase = $("#apiBaseInput").value.replace(/\/+$/, "");
  localStorage.setItem(STORAGE_KEY, apiBase);
  toast("Menghubungkan ke API…");
  await loadAll();
});

$("#pingHealthBtn")?.addEventListener("click", async () => {
  const resultEl = $("#pingResultText");
  resultEl.textContent = "Menguji koneksi ke /api/v1/health…";
  const start = performance.now();
  try {
    const payload = await api("/api/v1/health");
    const duration = Math.round(performance.now() - start);
    resultEl.innerHTML = `<span style="color: var(--primary);">● Status OK (200)</span> · Latensi: <strong>${duration} ms</strong> · Server siap`;
    toast("Koneksi API Sehat!");
  } catch (err) {
    resultEl.innerHTML = `<span style="color: var(--coral-text);">● Gagal terhubung</span>: ${err.message}`;
    toast("API tidak merespon");
  }
});

$$("[data-briefing]").forEach(button => button.addEventListener("click", async () => {
  try {
    if (!isDemoMode) {
      const payload = await api(`/api/v1/briefing/${button.dataset.briefing}`);
      $("#briefingOutput").textContent = payload.briefing || payload.debrief || payload.message || JSON.stringify(payload, null, 2);
    } else {
      const isMorning = button.dataset.briefing === "daily";
      $("#briefingOutput").textContent = isMorning 
        ? `[BRIEFING PAGI OTOMATIS]\nSelamat pagi! ☀️\n- Hari: ${$("#todayLabel").textContent}\n- Pengeluaran sisa budget: ${formatRupiah(mockData.overview.budget.remaining)}\n- Target kalori (TDEE): ${mockData.tdee} kcal\n- Agenda terdekat: ${mockData.overview.active_reminders[0]?.title}\nSemoga harimu menyenangkan dan produktif!`
        : `[DEBRIEF MALAM OTOMATIS]\nSelamat malam! 🌙\n- Total pengeluaran hari ini telah tercatat\n- Asupan kalori: ${mockData.nutrition.total_calories} kcal (${mockData.nutrition.status})\n- Siapkan jadwal istirahat Anda untuk esok hari.`;
    }
  } catch (error) {
    toast(error.message);
  }
}));

$$("[data-send-briefing]").forEach(button => button.addEventListener("click", async () => {
  try {
    if (!isDemoMode) {
      const payload = await api(`/api/v1/briefing/${button.dataset.sendBriefing}/send`, { method: "POST" });
      $("#briefingOutput").textContent = payload.status || "Berhasil dikirim ke channel bot.";
    } else {
      $("#briefingOutput").textContent = `[SIMULASI TERKIRIM] Briefing ${button.dataset.sendBriefing === "daily" ? "Pagi" : "Malam"} sukses dikirimkan ke webhook WhatsApp.`;
    }
    toast("Briefing berhasil dikirim!");
  } catch (error) {
    toast(error.message);
  }
}));

// ==========================================
// Initialization
// ==========================================
function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = String(value ?? "");
  return div.innerHTML;
}

$$("[data-view], [data-view-link]").forEach(button => {
  button.addEventListener("click", () => {
    const target = button.dataset.view || button.dataset.viewLink;
    if (target) openLocalView(target);
  });
});

$("#refreshButton")?.addEventListener("click", () => {
  loadAll();
  toast("Data sedang diperbarui…");
});

function init() {
  initTheme();
  initExpenseDateFilters();
  
  const now = new Date();
  const dateFormatted = new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long" }).format(now);
  const todayLabel = $("#todayLabel");
  if (todayLabel) todayLabel.textContent = dateFormatted;

  const dateInput = $("#nutritionDateInput");
  if (dateInput) dateInput.value = currentNutritionDate;

  const apiInput = $("#apiBaseInput");
  if (apiInput) apiInput.value = apiBase;

  const initialView = location.hash.slice(1);
  if (["overview", "finance", "health", "profile", "assistant", "settings"].includes(initialView)) {
    showView(initialView);
  }

  loadAll();
}

init();
