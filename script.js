/* ==================================================
   PIXEL CRM — COMPLETE FRONTEND APPLICATION
   HTML + CSS + Vanilla JavaScript
================================================== */
/* ================= BACKEND API HELPER ================= */

async function api(url, options = {}) {
    const config = {
        ...options,
        headers: {
            ...(options.headers || {})
        }
    };

    if (config.body && typeof config.body !== "string") {
        config.headers["Content-Type"] = "application/json";
        config.body = JSON.stringify(config.body);
    }

    config.credentials = "same-origin";

    const response = await fetch(url, config);

    let result = {};

    try {
        result = await response.json();
    } catch {
        result = {};
    }

    if (!response.ok) {
        throw new Error(result.error || "API request failed");
    }

    return result;
}
/* ================= LOAD DATA FROM SQLITE ================= */

async function loadBackendData() {
    const results = await Promise.all([
        api("/api/leads"),
        api("/api/deals"),
        api("/api/campaigns"),
        api("/api/activity"),
        api("/api/settings")
    ]);

    leads = results[0];
    deals = results[1];
    campaigns = results[2];
    activity = results[3];

    settings = {
        ...defaultSettings,
        ...results[4]
    };

    applyTheme(settings.theme || "light");

    // Update dashboard data
    renderDashboard();

    // Update UI preferences
    applySettings();
    loadSettingsUI();
}

/* ================= STORAGE ================= */

const STORE = {
    user: "pixelcrm_user",
    leads: "pixelcrm_leads",
    deals: "pixelcrm_deals",
    campaigns: "pixelcrm_campaigns",
    activity: "pixelcrm_activity",
    theme: "pixelcrm_theme",
    settings: "pixelcrm_settings"
};

function getSaved(key, fallback) {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : structuredClone(fallback);
    } catch {
        return structuredClone(fallback);
    }
}

function saveData() {
    // Data is now stored in SQLite by the backend.
    // This function is retained for compatibility with
    // the existing dashboard rendering code.
}


let settingsSaveQueue = Promise.resolve();

function saveSettings() {
    const snapshot = { ...settings };
    settingsSaveQueue = settingsSaveQueue
        .catch(() => { })
        .then(() => api("/api/settings", {
            method: "PUT",
            body: snapshot
        }));

    return settingsSaveQueue;
}

/* ================= DEFAULT DATA ================= */

const defaultLeads = [
    {
        id: 1,
        name: "Olivia Rhye",
        company: "TechNova",
        email: "olivia@technova.io",
        status: "Qualified",
        source: "Website",
        value: 84000,
        owner: "David Allen"
    },
    {
        id: 2,
        name: "Phoenix Baker",
        company: "Bright Labs",
        email: "phoenix@brightlabs.com",
        status: "New",
        source: "Referral",
        value: 52000,
        owner: "Sarah Chen"
    },
    {
        id: 3,
        name: "Lana Steiner",
        company: "Core Systems",
        email: "lana@coresys.co",
        status: "Contacted",
        source: "LinkedIn",
        value: 125000,
        owner: "David Allen"
    },
    {
        id: 4,
        name: "Demi Wilkinson",
        company: "Acme Inc.",
        email: "demi@acme.com",
        status: "Negotiation",
        source: "Campaign",
        value: 76000,
        owner: "Mike Ross"
    },
    {
        id: 5,
        name: "Candice Wu",
        company: "Growth Co.",
        email: "candice@growth.co",
        status: "Qualified",
        source: "Website",
        value: 99000,
        owner: "Sarah Chen"
    },
    {
        id: 6,
        name: "Natali Craig",
        company: "Design Studio",
        email: "natali@studio.design",
        status: "New",
        source: "Instagram",
        value: 41000,
        owner: "Mike Ross"
    }
];

const defaultDeals = [
    {
        id: 1,
        title: "Enterprise Annual Plan",
        company: "TechNova",
        amount: 240000,
        status: "Won",
        closeDate: "2026-11-28",
        owner: "David Allen"
    },
    {
        id: 2,
        title: "Product Suite Expansion",
        company: "Bright Labs",
        amount: 185000,
        status: "In Progress",
        closeDate: "2026-12-05",
        owner: "Sarah Chen"
    },
    {
        id: 3,
        title: "CRM Implementation",
        company: "Core Systems",
        amount: 320000,
        status: "Negotiation",
        closeDate: "2026-12-12",
        owner: "David Allen"
    },
    {
        id: 4,
        title: "Marketing Automation",
        company: "Acme Inc.",
        amount: 97000,
        status: "Lost",
        closeDate: "2026-11-18",
        owner: "Mike Ross"
    },
    {
        id: 5,
        title: "Support Package Renewal",
        company: "Growth Co.",
        amount: 142000,
        status: "In Progress",
        closeDate: "2026-12-20",
        owner: "Sarah Chen"
    }
];

const defaultCampaigns = [
    {
        id: 1,
        name: "November Product Launch",
        channel: "Email",
        status: "Active",
        sent: 12000,
        opened: 4820,
        clicks: 920
    },
    {
        id: 2,
        name: "Customer Win-back",
        channel: "Email",
        status: "Active",
        sent: 8600,
        opened: 3510,
        clicks: 720
    },
    {
        id: 3,
        name: "Holiday Offers",
        channel: "Social Media",
        status: "Scheduled",
        sent: 0,
        opened: 0,
        clicks: 0
    },
    {
        id: 4,
        name: "New Feature Webinar",
        channel: "Email",
        status: "Completed",
        sent: 5400,
        opened: 2700,
        clicks: 610
    }
];

const defaultActivity = [
    {
        id: 1,
        title: "New lead added",
        description: "Olivia Rhye · TechNova",
        time: "2m ago",
        type: "purple"
    },
    {
        id: 2,
        title: "Deal closed",
        description: "Enterprise Annual Plan",
        time: "1h ago",
        type: "green"
    },
    {
        id: 3,
        title: "Campaign launched",
        description: "November Product Launch",
        time: "3h ago",
        type: "orange"
    }
];

const defaultSettings = {
    greeting: true,
    compact: false,
    activity: true,

    newLeadNotifications: true,
    dealNotifications: true,
    campaignNotifications: true,
    emailNotifications: false
};

/* ================= APPLICATION STATE ================= */

let leads = getSaved(STORE.leads, defaultLeads);
let deals = getSaved(STORE.deals, defaultDeals);
let campaigns = getSaved(STORE.campaigns, defaultCampaigns);
let activity = getSaved(STORE.activity, defaultActivity);

let currentUser = getSaved(STORE.user, null);
let settings = { ...defaultSettings };

let currentPage = "Dashboard";
let currentFilter = "All";
let tableSearchTerm = "";
let globalSearchTerm = "";
let editingId = null;

let revenueChart = null;
let campaignChart = null;
let dealReportChart = null;
let leadReportChart = null;

let toastTimeout = null;

/* ================= HELPERS ================= */

const $ = id => document.getElementById(id);

function formatMoney(value) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(Number(value) || 0);
}

function compactMoney(value) {
    value = Number(value) || 0;

    if (value >= 10000000) {
        return "₹" + (value / 10000000).toFixed(1) + "Cr";
    }

    if (value >= 100000) {
        return "₹" + (value / 100000).toFixed(1) + "L";
    }

    if (value >= 1000) {
        return "₹" + (value / 1000).toFixed(1) + "K";
    }

    return formatMoney(value);
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => {
        const map = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return map[character];
    });
}

function initials(name) {
    return String(name || "User")
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(part => part[0])
        .join("")
        .toUpperCase();
}

function statusClass(status) {
    return "status-" + String(status || "")
        .toLowerCase()
        .replace(/\s+/g, "-");
}

function getCollection() {
    if (currentPage === "Leads") return leads;
    if (currentPage === "Deals") return deals;
    if (currentPage === "Campaigns") return campaigns;

    return [];
}

function setCollection(collection) {
    if (currentPage === "Leads") leads = collection;
    if (currentPage === "Deals") deals = collection;
    if (currentPage === "Campaigns") campaigns = collection;
}

function showToast(message, type = "success") {
    const toast = $("toast");

    $("toastMessage").textContent = message;

    const icon = toast.querySelector("i");

    icon.className = type === "error"
        ? "fa-solid fa-circle-exclamation"
        : "fa-solid fa-circle-check";

    icon.style.color = type === "error"
        ? "var(--red)"
        : "var(--green)";

    toast.classList.remove("hidden");

    clearTimeout(toastTimeout);

    toastTimeout = setTimeout(() => {
        toast.classList.add("hidden");
    }, 2800);
}

/* ================= ACTIVITY ================= */

/* ================= BACKEND AUTHENTICATION ================= */

loginForm.addEventListener("submit", async event => {
    event.preventDefault();

    const username = $("username").value.trim();
    const password = $("password").value;

    $("loginError").textContent = "";

    try {
        const result = await api("/api/auth/login", {
            method: "POST",
            body: {
                username,
                password
            }
        });

        currentUser = result.user;

        await loadBackendData();

        showApp();

        showToast("Login successful");

    } catch (error) {
        $("loginError").textContent = error.message;
    }
});

$("fillDemo").addEventListener("click", () => {
    $("username").value = "admin";
    $("password").value = "Pixel@123";
    $("loginError").textContent = "";
});

$("togglePassword").addEventListener("click", () => {
    const input = $("password");
    const icon = $("togglePassword").querySelector("i");

    if (input.type === "password") {
        input.type = "text";
        icon.className = "fa-regular fa-eye-slash";
    } else {
        input.type = "password";
        icon.className = "fa-regular fa-eye";
    }
});

$("forgotPassword").addEventListener("click", () => {
    alert("Password recovery will be added in a future version.");
});

/* ================= USER UI ================= */

function updateUserUI() {
    if (!currentUser) return;

    const userName = currentUser.name || "David Allen";
    const userInitials = initials(userName);

    $("topName").textContent = userName;
    $("dashboardUserName").textContent = userName.split(" ")[0];

    $("topAvatar").textContent = userInitials;
    $("dropdownAvatar").textContent = userInitials;

    $("dropdownName").textContent = userName;
    $("dropdownRole").textContent = currentUser.role || "Admin Head";

    $("profileBigAvatar").textContent = userInitials;
    $("profileFullName").textContent = userName;
    $("profileRole").textContent = currentUser.role || "Admin Head";

    $("profileUsername").textContent = currentUser.username || "admin";
    $("profileEmail").textContent = currentUser.email || "admin@pixelcrm.com";
    $("profileRoleInfo").textContent = currentUser.role || "Admin Head";

    $("settingsUsername").textContent = currentUser.username || "admin";
}

/* ================= PROFILE DROPDOWN ================= */

$("profileButton").addEventListener("click", event => {
    event.stopPropagation();

    $("profileDropdown").classList.toggle("hidden");
    $("notificationDropdown").classList.add("hidden");
});

$("profileMenuButton").addEventListener("click", () => {
    closeAllDropdowns();
    openProfileModal();
});
function showApp() {
    $("loginPage").classList.add("hidden");
    $("app").classList.remove("hidden");
    updateUserUI();
}

async function logout() {
    try {
        await api("/api/auth/logout", { method: "POST" });
        currentUser = null;
        localStorage.removeItem(STORE.user);
        $("app").classList.add("hidden");
        $("loginPage").classList.remove("hidden");
    } catch (error) {
        $("loginError").textContent = error.message;
    }
}
$("profileLogout").addEventListener("click", logout);
$("settingsLogout").addEventListener("click", logout);

/* ================= PROFILE MODAL ================= */

function openProfileModal() {
    updateUserUI();
    $("profileModal").classList.remove("hidden");
}

function closeProfileModal() {
    $("profileModal").classList.add("hidden");
}

$("closeProfileModal").addEventListener("click", closeProfileModal);

$("profileModal").addEventListener("click", event => {
    if (event.target === $("profileModal")) {
        closeProfileModal();
    }
});

$("editProfileButton").addEventListener("click", () => {
    $("editProfileName").value = currentUser.name || "";
    $("editProfileEmail").value = currentUser.email || "";
    $("editProfileUsername").value = currentUser.username || "";

    closeProfileModal();

    $("editProfileModal").classList.remove("hidden");
});

function closeEditProfile() {
    $("editProfileModal").classList.add("hidden");
}

$("closeEditProfile").addEventListener("click", closeEditProfile);
$("cancelEditProfile").addEventListener("click", closeEditProfile);

$("editProfileModal").addEventListener("click", event => {
    if (event.target === $("editProfileModal")) {
        closeEditProfile();
    }
});

$("editProfileForm").addEventListener("submit", async event => {
    event.preventDefault();

    const profile = {
        name: $("editProfileName").value.trim(),
        email: $("editProfileEmail").value.trim()
    };

    try {
        const result = await api("/api/profile", {
            method: "PUT",
            body: profile
        });
        currentUser = result.user;
        updateUserUI();
        closeEditProfile();
        showToast("Profile updated successfully");
    } catch (error) {
        showToast(error.message, "error");
    }
});

/* ================= THEME ================= */

function applyTheme(theme) {
    document.body.classList.toggle("dark-theme", theme === "dark");

    updateThemeUI(theme);
}

function updateThemeUI(theme) {
    const isDark = theme === "dark";

    $("themeMenuText").textContent = isDark ? "Light Mode" : "Dark Mode";

    $("themeMenuIcon").className = isDark
        ? "fa-regular fa-sun"
        : "fa-regular fa-moon";

    $("settingsThemeSelect").value = theme;

    document.querySelectorAll("[data-theme-preview]").forEach(button => {
        button.classList.toggle(
            "selected",
            button.dataset.themePreview === theme
        );
    });
}

function toggleTheme() {
    const isDark = document.body.classList.contains("dark-theme");

    saveSetting("theme", isDark ? "light" : "dark");
}

$("themeMenuButton").addEventListener("click", () => {
    toggleTheme();
});

$("settingsThemeSelect").addEventListener("change", event => {
    saveSetting("theme", event.target.value);
});

document.querySelectorAll("[data-theme-preview]").forEach(button => {
    button.addEventListener("click", () => {
        saveSetting("theme", button.dataset.themePreview);
    });
});

/* ================= SETTINGS ================= */

function openSettings() {
    closeAllDropdowns();

    loadSettingsUI();

    $("settingsModal").classList.remove("hidden");
}

function closeSettings() {
    $("settingsModal").classList.add("hidden");
}

$("settingsButton").addEventListener("click", openSettings);
$("sidebarSettingsButton").addEventListener("click", openSettings);
$("closeSettingsModal").addEventListener("click", closeSettings);
$("doneSettings").addEventListener("click", closeSettings);

$("settingsModal").addEventListener("click", event => {
    if (event.target === $("settingsModal")) {
        closeSettings();
    }
});

document.querySelectorAll(".settings-nav-item").forEach(button => {
    button.addEventListener("click", () => {
        const section = button.dataset.settings;

        document.querySelectorAll(".settings-nav-item").forEach(item => {
            item.classList.remove("active");
        });

        document.querySelectorAll(".settings-panel").forEach(panel => {
            panel.classList.remove("active");
        });

        button.classList.add("active");

        $("settings-" + section).classList.add("active");
    });
});

function loadSettingsUI() {
    $("greetingToggle").checked = settings.greeting;
    $("compactToggle").checked = settings.compact;
    $("activityToggle").checked = settings.activity;

    $("newLeadsNotification").checked = settings.newLeadNotifications;
    $("dealNotification").checked = settings.dealNotifications;
    $("campaignNotification").checked = settings.campaignNotifications;
    $("emailNotification").checked = settings.emailNotifications;

    $("settingsThemeSelect").value = settings.theme || "light";
}

function applySettings() {
    document.body.classList.toggle("compact-tables", settings.compact);
    document.body.classList.toggle("hide-activity", !settings.activity);

    const greeting = $("dashboardPage").querySelector(".dashboard-heading");

    if (greeting) {
        greeting.style.display = settings.greeting ? "" : "none";
    }
}

async function saveSetting(key, value) {
    settings[key] = value;

    if (key === "theme") applyTheme(value);
    applySettings();

    $("settingsSaveMessage").textContent = "Saving preferences…";

    try {
        await saveSettings();
        $("settingsSaveMessage").textContent = "Preferences saved to your account.";
    } catch (error) {
        $("settingsSaveMessage").textContent = "Could not save preferences.";
        showToast(error.message, "error");
    }
}

$("greetingToggle").addEventListener("change", event => {
    saveSetting("greeting", event.target.checked);
});

$("compactToggle").addEventListener("change", event => {
    saveSetting("compact", event.target.checked);
});

$("activityToggle").addEventListener("change", event => {
    saveSetting("activity", event.target.checked);
});

$("newLeadsNotification").addEventListener("change", event => {
    saveSetting("newLeadNotifications", event.target.checked);
});

$("dealNotification").addEventListener("change", event => {
    saveSetting("dealNotifications", event.target.checked);
});

$("campaignNotification").addEventListener("change", event => {
    saveSetting("campaignNotifications", event.target.checked);
});

$("emailNotification").addEventListener("change", event => {
    saveSetting("emailNotifications", event.target.checked);
});

/* ================= SIDEBAR ================= */

function openSidebar() {
    $("sidebar").classList.add("sidebar-open");
    $("sidebarOverlay").classList.add("active");
}

function closeSidebar() {
    $("sidebar").classList.remove("sidebar-open");
    $("sidebarOverlay").classList.remove("active");
}

$("menuButton").addEventListener("click", openSidebar);
$("closeSidebar").addEventListener("click", closeSidebar);
$("sidebarOverlay").addEventListener("click", closeSidebar);

/* ================= NAVIGATION ================= */

const pageElements = {
    Dashboard: $("dashboardPage"),
    Leads: $("managementPage"),
    Deals: $("managementPage"),
    Campaigns: $("managementPage"),
    Reports: $("reportsPage"),
    Messages: $("messagesPage")
};

function navigate(page) {
    currentPage = page;

    Object.values(pageElements).forEach(element => {
        element.classList.add("hidden");
    });

    pageElements[page]?.classList.remove("hidden");

    document.querySelectorAll(".nav-item[data-page]").forEach(button => {
        button.classList.toggle("active", button.dataset.page === page);
    });

    $("breadcrumbPage").textContent = page;

    if (page === "Dashboard") {
        renderDashboard();
    }

    if (["Leads", "Deals", "Campaigns"].includes(page)) {
        tableSearchTerm = "";
        currentFilter = "All";
        $("tableSearch").value = "";
        renderTable();
    }

    if (page === "Reports") {
        renderReports();
    }

    if (page === "Messages") {
        renderMessages();
    }

    closeSidebar();
}

document.querySelectorAll(".nav-item[data-page]").forEach(button => {
    button.addEventListener("click", () => navigate(button.dataset.page));
});

document.querySelectorAll("[data-page-link]").forEach(button => {
    button.addEventListener("click", () => navigate(button.dataset.pageLink));
});

$("sidebarHelpButton").addEventListener("click", () => {
    alert("Pixel CRM Demo\n\nHelp and support features will be available in a future version.");
});

$("promoButton").addEventListener("click", () => {
    showToast("Workspace features are ready to explore!");
});

/* ================= DROPDOWNS ================= */

function closeAllDropdowns() {
    $("profileDropdown").classList.add("hidden");
    $("notificationDropdown").classList.add("hidden");
}

document.addEventListener("click", event => {
    if (
        !event.target.closest(".profile-dropdown-wrap") &&
        !event.target.closest("#notificationButton")
    ) {
        closeAllDropdowns();
    }
});

/* ================= NOTIFICATIONS ================= */

$("notificationButton").addEventListener("click", event => {
    event.stopPropagation();

    $("notificationDropdown").classList.toggle("hidden");
    $("profileDropdown").classList.add("hidden");
});

$("clearNotifications").addEventListener("click", () => {
    $("notificationList").innerHTML = `
        <div class="empty-state">You're all caught up!</div>
    `;

    $("notificationButton").querySelector(".notification-dot").style.display = "none";

    showToast("Notifications cleared");
});

/* ================= MESSAGES ================= */

$("messageButton").addEventListener("click", () => {
    navigate("Messages");
});

const demoMessages = [
    {
        name: "Sarah Chen",
        message: "The Bright Labs deal is progressing well. I'll share the update shortly.",
        time: "10:42 AM"
    },
    {
        name: "Mike Ross",
        message: "Campaign report is ready for review.",
        time: "Yesterday"
    },
    {
        name: "David Allen",
        message: "Let's review this month's revenue numbers.",
        time: "Yesterday"
    },
    {
        name: "Olivia Rhye",
        message: "Thanks for the product demonstration. Looking forward to next steps.",
        time: "Monday"
    }
];

function renderMessages() {
    $("messagesList").innerHTML = demoMessages.map(message => `
        <div class="message-row">
            <div class="avatar">${initials(message.name)}</div>

            <div class="message-copy">
                <b>${escapeHTML(message.name)}</b>
                <p>${escapeHTML(message.message)}</p>
            </div>

            <span class="message-time">${escapeHTML(message.time)}</span>
        </div>
    `).join("");
}

/* ================= DASHBOARD ================= */

function renderDashboard() {
    saveData();

    updateUserUI();

    const pipeline = deals
        .filter(deal => deal.status !== "Lost")
        .reduce((sum, deal) => sum + Number(deal.amount || 0), 0);

    const revenue = deals
        .filter(deal => deal.status === "Won")
        .reduce((sum, deal) => sum + Number(deal.amount || 0), 0);

    $("totalLeads").textContent = leads.length;
    $("totalPipeline").textContent = compactMoney(pipeline);
    $("totalRevenue").textContent = compactMoney(revenue);
    $("totalCampaigns").textContent = campaigns.length;

    $("sidebarLeadCount").textContent = leads.length;

    renderRevenueChart();
    renderCampaignChart();
    renderLeadConversion();
    renderActivity();
    renderRecentLeads();

    updateDateGreeting();
}

function updateDateGreeting() {
    const now = new Date();

    const formatted = now.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric"
    });

    $("greetingLabel").textContent = formatted.toUpperCase();
}

/* ================= REVENUE CHART ================= */

const revenueMonths = [
    "Jan", "Feb", "Mar", "Apr",
    "May", "Jun", "Jul", "Aug",
    "Sep", "Oct", "Nov", "Dec"
];

const revenueValues = [
    32000, 41000, 38000, 52000,
    49000, 61000, 57000, 68000,
    74000, 69000, 86000, 92000
];

const pipelineValues = [
    21000, 29000, 35000, 42000,
    45000, 51000, 49000, 62000,
    65000, 72000, 78000, 81000
];

function renderRevenueChart() {
    const canvas = $("revenueChart");

    if (!canvas) return;

    const context = canvas.getContext("2d");
    const period = $("chartPeriod").value;

    const labels = period === "half"
        ? revenueMonths.slice(-6)
        : revenueMonths;

    const revenue = period === "half"
        ? revenueValues.slice(-6)
        : revenueValues;

    const pipeline = period === "half"
        ? pipelineValues.slice(-6)
        : pipelineValues;

    if (revenueChart) {
        revenueChart.destroy();
    }

    revenueChart = new Chart(context, {
        type: "line",

        data: {
            labels,

            datasets: [
                {
                    label: "Revenue",
                    data: revenue,
                    borderColor: "#7955e8",
                    backgroundColor: "rgba(121,85,232,.10)",
                    fill: true,
                    tension: .4,
                    borderWidth: 3,
                    pointRadius: 3,
                    pointBackgroundColor: "#7955e8"
                },

                {
                    label: "Pipeline",
                    data: pipeline,
                    borderColor: "#aeb5c5",
                    backgroundColor: "transparent",
                    fill: false,
                    tension: .4,
                    borderWidth: 2,
                    pointRadius: 2
                }
            ]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            interaction: {
                intersect: false,
                mode: "index"
            },

            plugins: {
                legend: {
                    display: false
                },

                tooltip: {
                    callbacks: {
                        label: context =>
                            context.dataset.label + ": " + formatMoney(context.parsed.y)
                    }
                }
            },

            scales: {
                x: {
                    grid: {
                        display: false
                    },

                    ticks: {
                        color: getChartTextColor(),
                        font: { size: 10 }
                    }
                },

                y: {
                    beginAtZero: true,

                    grid: {
                        color: getChartGridColor()
                    },

                    ticks: {
                        color: getChartTextColor(),
                        font: { size: 10 },

                        callback: value => compactMoney(value)
                    }
                }
            }
        }
    });
}

$("chartPeriod").addEventListener("change", renderRevenueChart);

/* ================= CAMPAIGN CHART ================= */

function renderCampaignChart() {
    const context = $("campaignChart").getContext("2d");

    const sent = campaigns.reduce(
        (sum, campaign) => sum + Number(campaign.sent || 0),
        0
    );

    const opened = campaigns.reduce(
        (sum, campaign) => sum + Number(campaign.opened || 0),
        0
    );

    const clicks = campaigns.reduce(
        (sum, campaign) => sum + Number(campaign.clicks || 0),
        0
    );

    const openRate = sent
        ? Math.round(opened / sent * 100)
        : 0;

    const clickRate = sent
        ? Math.round(clicks / sent * 100)
        : 0;

    const otherRate = Math.max(
        0,
        100 - openRate - clickRate
    );

    $("campaignOpenRate").textContent = openRate + "%";
    $("donutCenterValue").textContent = openRate + "%";

    if (campaignChart) {
        campaignChart.destroy();
    }

    campaignChart = new Chart(context, {
        type: "doughnut",

        data: {
            labels: ["Opened", "Clicked", "Other"],

            datasets: [{
                data: [openRate, clickRate, otherRate],
                backgroundColor: [
                    "#7955e8",
                    "#36b5a0",
                    "#e8eaf2"
                ],
                borderWidth: 0,
                hoverOffset: 5
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "76%",

            plugins: {
                legend: {
                    display: false
                },

                tooltip: {
                    callbacks: {
                        label: context =>
                            context.label + ": " + context.parsed + "%"
                    }
                }
            }
        }
    });

    const legend = [
        {
            name: "Opened",
            value: openRate,
            color: "#7955e8"
        },
        {
            name: "Clicked",
            value: clickRate,
            color: "#36b5a0"
        },
        {
            name: "Other",
            value: otherRate,
            color: "#e8eaf2"
        }
    ];

    $("campaignLegend").innerHTML = legend.map(item => `
        <div>
            <span>
                <i style="background:${item.color}"></i>
                ${item.name}
            </span>

            <strong>${item.value}%</strong>
        </div>
    `).join("");
}

/* ================= LEAD CONVERSION ================= */

function renderLeadConversion() {
    const statuses = [
        "New",
        "Contacted",
        "Qualified",
        "Negotiation"
    ];

    $("conversionList").innerHTML = statuses.map(status => {
        const count = leads.filter(lead => lead.status === status).length;

        const percentage = leads.length
            ? Math.round(count / leads.length * 100)
            : 0;

        return `
            <div class="conversion-item">

                <div class="conversion-label">
                    <span>${status}</span>
                    <b>${count}</b>
                </div>

                <div class="progress-track">
                    <div class="progress-fill" style="width:${percentage}%"></div>
                </div>

            </div>
        `;
    }).join("");
}

/* ================= ACTIVITY ================= */

function renderActivity() {
    $("activityList").innerHTML = activity.slice(0, 5).map(item => {
        const colorClass = item.type === "green"
            ? "green-dot-activity"
            : item.type === "orange"
                ? "orange-dot-activity"
                : "purple-dot-activity";

        return `
            <div class="activity-item">

                <div class="activity-dot ${colorClass}"></div>

                <div class="activity-copy">
                    <b>${escapeHTML(item.title)}</b>
                    <p>${escapeHTML(item.description)}</p>
                </div>

                <span>${escapeHTML(item.time)}</span>

            </div>
        `;
    }).join("");
}

$("activityRefreshButton").addEventListener("click", () => {
    renderActivity();
    showToast("Activity refreshed");
});

/* ================= RECENT LEADS ================= */

function renderRecentLeads() {
    const recent = leads.slice(0, 5);

    $("recentLeadsBody").innerHTML = recent.map(lead => `
        <tr>
            <td>
                <div class="table-primary">${escapeHTML(lead.name)}</div>
            </td>

            <td>${escapeHTML(lead.company)}</td>

            <td>
                <span class="status ${statusClass(lead.status)}">
                    ${escapeHTML(lead.status)}
                </span>
            </td>

            <td>${formatMoney(lead.value)}</td>

            <td>${escapeHTML(lead.owner)}</td>
        </tr>
    `).join("");
}

/* ================= MANAGEMENT TABLE CONFIG ================= */

const tableConfigs = {
    Leads: {
        columns: [
            { key: "name", label: "Lead", primary: true },
            { key: "company", label: "Company" },
            { key: "email", label: "Email" },
            { key: "status", label: "Status", status: true },
            { key: "value", label: "Value", money: true },
            { key: "owner", label: "Owner" }
        ],

        filters: [
            "New",
            "Contacted",
            "Qualified",
            "Negotiation"
        ]
    },

    Deals: {
        columns: [
            { key: "title", label: "Deal", primary: true },
            { key: "company", label: "Company" },
            { key: "amount", label: "Amount", money: true },
            { key: "status", label: "Status", status: true },
            { key: "closeDate", label: "Closing date" },
            { key: "owner", label: "Owner" }
        ],

        filters: [

            "In Progress",
            "Negotiation",
            "Won",
            "Lost"
        ]
    },

    Campaigns: {
        columns: [
            { key: "name", label: "Campaign", primary: true },
            { key: "channel", label: "Channel" },
            { key: "status", label: "Status", status: true },
            { key: "sent", label: "Sent" },
            { key: "opened", label: "Opened" },
            { key: "clicks", label: "Clicks" }
        ],

        filters: [
            "Active",
            "Scheduled",
            "Completed"
        ]
    }
};

/* ================= RENDER MANAGEMENT TABLE ================= */

function renderTable() {
    const config = tableConfigs[currentPage];

    if (!config) return;

    $("managementTitle").textContent = currentPage;
    $("tableTitle").textContent = currentPage;

    $("managementSubtitle").textContent =
        `Manage and track your ${currentPage.toLowerCase()}.`;

    $("addRecordButton").innerHTML =
        `<i class="fa-solid fa-plus"></i> Add ${currentPage.slice(0, -1)}`;

    $("tableHead").innerHTML = `
        <tr>
            ${config.columns.map(column => `<th>${column.label}</th>`).join("")}
            <th>Actions</th>
        </tr>
    `;

    $("statusFilter").innerHTML = `
        <option value="All">All statuses</option>
        ${config.filters.map(status => `
            <option value="${status}">${status}</option>
        `).join("")}
    `;

    $("statusFilter").value = currentFilter;

    const rows = getCollection().filter(record => {
        const searchMatches = JSON.stringify(record)
            .toLowerCase()
            .includes(tableSearchTerm);

        const filterMatches =
            currentFilter === "All" ||
            record.status === currentFilter;

        return searchMatches && filterMatches;
    });

    $("recordCount").textContent = `${rows.length} records`;

    if (!rows.length) {
        $("tableBody").innerHTML = `
            <tr>
                <td colspan="${config.columns.length + 1}">
                    <div class="empty-state">No records found.</div>
                </td>
            </tr>
        `;

        return;
    }

    $("tableBody").innerHTML = rows.map(record => {
        const cells = config.columns.map(column => {
            const value = record[column.key];

            if (column.status) {
                return `
                    <td>
                        <span class="status ${statusClass(value)}">
                            ${escapeHTML(value)}
                        </span>
                    </td>
                `;
            }

            if (column.money) {
                return `<td>${formatMoney(value)}</td>`;
            }

            if (column.primary) {
                return `
                    <td>
                        <div class="table-primary">${escapeHTML(value)}</div>
                    </td>
                `;
            }

            return `<td>${escapeHTML(value)}</td>`;
        }).join("");

        return `
            <tr>
                ${cells}

                <td>
                    <div class="row-actions">

                        <button class="icon-btn"
                                title="Edit"
                                data-action="edit"
                                data-id="${record.id}">
                            <i class="fa-solid fa-pen"></i>
                        </button>

                        <button class="icon-btn delete-btn"
                                title="Delete"
                                data-action="delete"
                                data-id="${record.id}">
                            <i class="fa-solid fa-trash"></i>
                        </button>

                    </div>
                </td>
            </tr>
        `;
    }).join("");
}

/* ================= SEARCH & FILTER ================= */

$("tableSearch").addEventListener("input", event => {
    tableSearchTerm = event.target.value.trim().toLowerCase();
    renderTable();
});

$("statusFilter").addEventListener("change", event => {
    currentFilter = event.target.value;
    renderTable();
});

$("globalSearch").addEventListener("input", event => {
    globalSearchTerm = event.target.value.trim().toLowerCase();

    if (!globalSearchTerm) return;

    const matchLeads = leads.some(item =>
        JSON.stringify(item).toLowerCase().includes(globalSearchTerm)
    );

    const matchDeals = deals.some(item =>
        JSON.stringify(item).toLowerCase().includes(globalSearchTerm)
    );

    const matchCampaigns = campaigns.some(item =>
        JSON.stringify(item).toLowerCase().includes(globalSearchTerm)
    );

    if (matchLeads) {
        navigate("Leads");
    } else if (matchDeals) {
        navigate("Deals");
    } else if (matchCampaigns) {
        navigate("Campaigns");
    } else {
        return;
    }

    $("tableSearch").value = event.target.value;
    tableSearchTerm = globalSearchTerm;

    renderTable();
});

/* ================= ADD / EDIT RECORDS ================= */

function getFormFields(page) {
    const configurations = {
        Leads: [
            {
                key: "name",
                label: "Lead name",
                type: "text",
                required: true
            },
            {
                key: "company",
                label: "Company",
                type: "text",
                required: true
            },
            {
                key: "email",
                label: "Email",
                type: "email"
            },
            {
                key: "status",
                label: "Status",
                type: "select",
                options: ["New", "Contacted", "Qualified", "Negotiation"]
            },
            {
                key: "source",
                label: "Source",
                type: "text"
            },
            {
                key: "value",
                label: "Value (₹)",
                type: "number"
            },
            {
                key: "owner",
                label: "Owner",
                type: "text"
            }
        ],

        Deals: [
            {
                key: "title",
                label: "Deal title",
                type: "text",
                required: true
            },
            {
                key: "company",
                label: "Company",
                type: "text",
                required: true
            },
            {
                key: "amount",
                label: "Amount (₹)",
                type: "number"
            },
            {
                key: "status",
                label: "Status",
                type: "select",
                options: ["In Progress", "Negotiation", "Won", "Lost"]
            },
            {
                key: "closeDate",
                label: "Closing date",
                type: "date"
            },
            {
                key: "owner",
                label: "Owner",
                type: "text"
            }
        ],

        Campaigns: [
            {
                key: "name",
                label: "Campaign name",
                type: "text",
                required: true
            },
            {
                key: "channel",
                label: "Channel",
                type: "select",
                options: ["Email", "Social Media", "SMS", "Other"]
            },
            {
                key: "status",
                label: "Status",
                type: "select",
                options: ["Active", "Scheduled", "Completed"]
            },
            {
                key: "sent",
                label: "Emails sent",
                type: "number"
            },
            {
                key: "opened",
                label: "Opened",
                type: "number"
            },
            {
                key: "clicks",
                label: "Clicks",
                type: "number"
            }
        ]
    };

    return configurations[page] || [];
}

function openRecordModal(record = null) {
    editingId = record ? record.id : null;

    $("modalTitle").textContent =
        `${record ? "Edit" : "Add"} ${currentPage.slice(0, -1)}`;

    const fields = getFormFields(currentPage);

    $("formFields").innerHTML = fields.map(field => {
        let input = "";

        if (field.type === "select") {
            input = `
                <select name="${field.key}" required>
                    ${field.options.map(option => `
                        <option value="${option}"
                            ${record && record[field.key] === option ? "selected" : ""}>
                            ${option}
                        </option>
                    `).join("")}
                </select>
            `;
        } else {
            input = `
                <input
                    name="${field.key}"
                    type="${field.type}"
                    value="${record ? escapeHTML(record[field.key] ?? "") : ""}"
                    ${field.required ? "required" : ""}
                    ${field.type === "number" ? 'min="0"' : ""}
                >
            `;
        }

        return `
            <label class="form-field">
                ${field.label}
                ${input}
            </label>
        `;
    }).join("");

    $("modalOverlay").classList.remove("hidden");
}

function closeRecordModal() {
    $("modalOverlay").classList.add("hidden");
    $("recordForm").reset();
    editingId = null;
}

$("addRecordButton").addEventListener("click", () => {
    openRecordModal();
});

$("dashboardAddLeadButton").addEventListener("click", () => {
    navigate("Leads");
    openRecordModal();
});

$("closeModal").addEventListener("click", closeRecordModal);
$("cancelModal").addEventListener("click", closeRecordModal);

$("modalOverlay").addEventListener("click", event => {
    if (event.target === $("modalOverlay")) {
        closeRecordModal();
    }
});

/* ================= RECORD FORM ================= */

/* ================= RECORD FORM ================= */

$("recordForm").addEventListener("submit", async event => {
    event.preventDefault();

    const endpointByPage = {
        Leads: "/api/leads",
        Deals: "/api/deals",
        Campaigns: "/api/campaigns"
    };

    const endpoint = endpointByPage[currentPage];

    if (!endpoint) {
        showToast("This page does not support saved records.", "error");
        return;
    }

    const formData = new FormData(event.target);
    const fields = getFormFields(currentPage);
    const record = {};

    fields.forEach(field => {
        const value = formData.get(field.key);
        record[field.key] =
            field.type === "number" ? Number(value) || 0 : value;
    });

    try {
        await api(
            editingId !== null ? `${endpoint}/${editingId}` : endpoint,
            {
                method: editingId !== null ? "PUT" : "POST",
                body: record
            }
        );

        await loadBackendData();
        closeRecordModal();
        renderTable();
        renderDashboard();
        showToast(editingId !== null ? "Record updated" : "Record added");
    } catch (error) {
        showToast(error.message, "error");
        console.error(error);
    }
});

/* ================= EDIT & DELETE ================= */

$("tableBody").addEventListener("click", event => {
    const button = event.target.closest("[data-action]");

    if (!button) return;

    const id = Number(button.dataset.id);
    const action = button.dataset.action;

    const record = getCollection().find(item => item.id === id);

    if (!record) return;

    if (action === "edit") {
        openRecordModal(record);
    }

    if (action === "delete") {
        deleteRecord(id);
    }
});

async function deleteRecord(id) {
    const confirmed = confirm(
        "Are you sure you want to delete this record?"
    );

    if (!confirmed) return;

    try {
        const endpoint = "/api/" + currentPage.toLowerCase();

        await api(`${endpoint}/${id}`, {
            method: "DELETE"
        });

        await loadBackendData();

        renderTable();
        renderDashboard();

        showToast("Record deleted successfully");

    } catch (error) {
        showToast(error.message, "error");
    }
}

/* ================= REPORTS ================= */

function getChartTextColor() {
    return document.body.classList.contains("dark-theme")
        ? "#a0a5b7"
        : "#969cad";
}

function getChartGridColor() {
    return document.body.classList.contains("dark-theme")
        ? "rgba(255,255,255,.06)"
        : "#f0f1f5";
}

function renderReports() {
    renderDealReport();
    renderLeadReport();

    const wonDeals = deals.filter(deal => deal.status === "Won");
    const lostDeals = deals.filter(deal => deal.status === "Lost");

    const totalRevenue = wonDeals.reduce(
        (sum, deal) => sum + Number(deal.amount || 0),
        0
    );

    $("reportTotalLeads").textContent = leads.length;
    $("reportTotalDeals").textContent = deals.length;
    $("reportWonDeals").textContent = wonDeals.length;
    $("reportLostDeals").textContent = lostDeals.length;
    $("reportRevenue").textContent = formatMoney(totalRevenue);
}

function renderDealReport() {
    if (dealReportChart) {
        dealReportChart.destroy();
    }

    dealReportChart = new Chart($("dealReportChart"), {
        type: "bar",

        data: {
            labels: ["Won", "In Progress", "Negotiation", "Lost"],

            datasets: [{
                label: "Deals",

                data: [
                    deals.filter(deal => deal.status === "Won").length,
                    deals.filter(deal => deal.status === "In Progress").length,
                    deals.filter(deal => deal.status === "Negotiation").length,
                    deals.filter(deal => deal.status === "Lost").length
                ],

                backgroundColor: [
                    "#36b5a0",
                    "#61a8f0",
                    "#7955e8",
                    "#e36b77"
                ],

                borderRadius: 6,
                barPercentage: .6
            }]
        },

        options: chartOptions()
    });
}

function renderLeadReport() {
    if (leadReportChart) {
        leadReportChart.destroy();
    }

    leadReportChart = new Chart($("leadReportChart"), {
        type: "bar",

        data: {
            labels: ["New", "Contacted", "Qualified", "Negotiation"],

            datasets: [{
                label: "Leads",

                data: [
                    leads.filter(lead => lead.status === "New").length,
                    leads.filter(lead => lead.status === "Contacted").length,
                    leads.filter(lead => lead.status === "Qualified").length,
                    leads.filter(lead => lead.status === "Negotiation").length
                ],

                backgroundColor: [
                    "#61a8f0",
                    "#f0a14c",
                    "#36b5a0",
                    "#7955e8"
                ],

                borderRadius: 6,
                barPercentage: .6
            }]
        },

        options: chartOptions()
    });
}

function chartOptions() {
    return {
        responsive: true,
        maintainAspectRatio: false,

        plugins: {
            legend: {
                display: false
            }
        },

        scales: {
            x: {
                grid: {
                    display: false
                },

                ticks: {
                    color: getChartTextColor(),
                    font: { size: 10 }
                }
            },

            y: {
                beginAtZero: true,

                ticks: {
                    precision: 0,
                    color: getChartTextColor()
                },

                grid: {
                    color: getChartGridColor()
                }
            }
        }
    };
}

/* ================= EXPORT ================= */

function exportCSV(data, filename) {
    if (!data.length) {
        showToast("No records to export", "error");
        return;
    }

    const headers = Object.keys(data[0]);

    const csvRows = [
        headers.join(","),

        ...data.map(row =>
            headers.map(header => {
                const value = String(row[header] ?? "")
                    .replace(/"/g, '""');

                return `"${value}"`;
            }).join(",")
        )
    ];

    const csvContent = csvRows.join("\n");

    const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);

    showToast("CSV exported successfully");
}

$("exportDashboardButton").addEventListener("click", () => {
    exportCSV(leads, "pixelcrm-leads.csv");
});

$("exportReportsButton").addEventListener("click", () => {
    exportCSV(deals, "pixelcrm-deals-report.csv");
});

/* ================= KEYBOARD SHORTCUT ================= */

document.addEventListener("keydown", event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        $("globalSearch").focus();
    }

    if (event.key === "Escape") {
        closeAllDropdowns();
        closeSidebar();

        $("modalOverlay").classList.add("hidden");
        $("profileModal").classList.add("hidden");
        $("editProfileModal").classList.add("hidden");
        $("settingsModal").classList.add("hidden");
    }
});

/* ================= INITIALIZATION ================= */

function initialize() {
    if (currentUser) {
        showApp();
    } else {
        loginPage.classList.remove("hidden");
        app.classList.add("hidden");

        applyTheme("light");
    }

    applySettings();
}


initialize();
