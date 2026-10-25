/* =========================================================
   National Crime Reporting Portal - script.js
   Sections:
   1. Constants & data
   2. Utilities (storage, toast, escaping)
   3. Navigation & tabs
   4. Home (metrics, live feed, FAQ)
   5. Live map (filter + search)
   6. Report form (validation + save)
   7. Track case
   8. Safety hub (tips, checklist, scam checker)
   9. Contact form
   10. Officer login & dashboard
   11. Initialisation
   ========================================================= */
"use strict";

/* =========================================================
   1. CONSTANTS & DATA
   ========================================================= */
var KEYS = {
    reports: "cp_reports",
    messages: "cp_messages",
    officer: "cp_officer",
    checklist: "cp_checklist"
};

var OFFICER_DEMO = { email: "officer@police.gov.in", password: "Officer@123" };
var PAGES = ["home", "map", "report", "track", "safety", "about", "contact", "dashboard"];
var STAGES = ["Received", "Assigned to Division", "Under Investigation", "Resolved"];

var CATEGORY_LABELS = {
    cyber: "Financial Cybercrime / Online Fraud",
    theft: "Theft, Burglary & Robbery",
    harassment: "Harassment / Assault"
};
var DIVISIONS = {
    cyber: "Regional Special Cyber Unit",
    theft: "District Crime Branch",
    harassment: "Women & Child Safety Cell"
};
var TYPE_META = {
    cyber: { cls: "pin-red", dot: "dot-red", label: "Cybercrime" },
    theft: { cls: "pin-orange", dot: "dot-orange", label: "Theft" },
    harassment: { cls: "pin-yellow", dot: "dot-yellow", label: "Harassment" }
};

// Incidents shown on the live map (sample data)
var crimeIncidents = [
    { id: 1, type: "cyber", category: "Financial Cyber Fraud", location: "Connaught Place, Central Delhi", lat: 28.6139, lng: 77.2090, time: "10 mins ago", status: "Active Tracking" },
    { id: 2, type: "theft", category: "Theft / Robbery", location: "Sector 18 Market, Noida", lat: 28.5355, lng: 77.3910, time: "35 mins ago", status: "Patrol Dispatched" },
    { id: 3, type: "harassment", category: "Harassment Report", location: "Cyber Hub, Gurugram", lat: 28.4595, lng: 77.0266, time: "1 hour ago", status: "Case Verified" },
    { id: 4, type: "cyber", category: "Identity Theft Online", location: "Rohini Sector 14, Delhi", lat: 28.7041, lng: 77.1025, time: "3 hours ago", status: "Bank Server Frozen" },
    { id: 5, type: "theft", category: "Vehicle Theft", location: "Karol Bagh, Delhi", lat: 28.6519, lng: 77.1909, time: "4 hours ago", status: "FIR Registered" },
    { id: 6, type: "harassment", category: "Street Harassment", location: "Saket Metro Station, Delhi", lat: 28.5245, lng: 77.2066, time: "5 hours ago", status: "CCTV Under Review" },
    { id: 7, type: "cyber", category: "UPI Payment Scam", location: "Dwarka Sector 10, Delhi", lat: 28.5921, lng: 77.0460, time: "6 hours ago", status: "Amount Put on Hold" },
    { id: 8, type: "theft", category: "Mobile Snatching", location: "Lajpat Nagar Market, Delhi", lat: 28.5677, lng: 77.2433, time: "8 hours ago", status: "Suspect Identified" },
    { id: 9, type: "cyber", category: "Fake Loan App Extortion", location: "Sector 15, Faridabad", lat: 28.4089, lng: 77.3178, time: "Yesterday", status: "Under Investigation" },
    { id: 10, type: "theft", category: "Shop Burglary", location: "Raj Nagar, Ghaziabad", lat: 28.6692, lng: 77.4538, time: "Yesterday", status: "Forensics Assigned" }
];

// Metric cards on the home page (numbers animate when the page loads)
var metricData = [
    { target: 100, prefix: "", suffix: "%", label: "Encrypted & Confidential" },
    { target: 15, prefix: "< ", suffix: " Mins", label: "Average Response Time" },
    { text: "24/7", label: "Active Monitoring Units" },
    { target: 12480, prefix: "", suffix: "+", label: "Cases Resolved (sample)" }
];

var faqData = [
    { q: "Can I report a crime without giving my name?", a: "Yes. Tick the \"Submit anonymously\" option on the report form. Your name and phone number are then not collected at all." },
    { q: "How do I track my complaint?", a: "After submitting, you receive a Reference ID such as CR-123456. Enter it on the Track Case page to see the current stage and history." },
    { q: "Is this portal for emergencies?", a: "No. If someone is in immediate danger, call 112 right away. Use this portal to register complaints that can wait a few minutes." },
    { q: "What details should I include in my statement?", a: "Mention what happened, when and where it happened, who was involved, and any numbers, links, vehicle plates or other identifying details." },
    { q: "I lost money in an online fraud. What should I do first?", a: "Call the cybercrime helpline 1930 immediately so the transaction can be put on hold, then file a report here with the transaction details." },
    { q: "Who can see my report?", a: "Only authorised officers who log in through the official login can review reports and update their status." }
];

var tipsData = [
    { cat: "cyber", icon: "🔑", title: "Never share your OTP or PIN", text: "Banks and government offices never ask for OTPs, UPI PINs or card CVV over a call, SMS or chat." },
    { cat: "cyber", icon: "🔗", title: "Think before you click", text: "Check the web address of any link in SMS or WhatsApp. Fake sites copy logos but use slightly different domains." },
    { cat: "cyber", icon: "🛡️", title: "Turn on two-factor login", text: "Enable two-step verification on email, social media and banking apps so a stolen password is not enough." },
    { cat: "cyber", icon: "📱", title: "Install apps from official stores only", text: "Loan, KYC and 'support' apps sent via links often steal contacts and photos. Avoid installing APK files." },
    { cat: "theft", icon: "🔒", title: "Double-lock your home", text: "Use a secondary lock, keep spare keys with a trusted person and never hide them near the door." },
    { cat: "theft", icon: "🏍️", title: "Secure your vehicle", text: "Use a steering or wheel lock, park in lit areas and note down your chassis and engine numbers." },
    { cat: "theft", icon: "👜", title: "Be alert in crowded places", text: "Keep phones and wallets in front pockets and avoid using your phone near the road edge or train doors." },
    { cat: "harassment", icon: "📍", title: "Share your live location", text: "When travelling alone at night, share your trip with a trusted contact and keep the 112 shortcut handy." },
    { cat: "harassment", icon: "📝", title: "Keep evidence safe", text: "Save screenshots, call logs and messages. Do not delete chats even if they are upsetting." },
    { cat: "harassment", icon: "📞", title: "Know your helplines", text: "Women helpline 1091 and the emergency number 112 work 24x7 from any phone." }
];

var checklistData = [
    "Enable two-factor authentication on email and banking apps",
    "Use a different strong password for every important account",
    "Save 112, 1930 and 1091 in my phone contacts",
    "Turn off auto-download of files in messaging apps",
    "Review which apps have access to my contacts and location",
    "Note down my vehicle and phone IMEI numbers",
    "Tell family members about common UPI and OTP scams",
    "Keep digital copies of important documents in a secure place"
];

var scamQuestions = [
    { q: "Did someone contact you unexpectedly and ask for an OTP, PIN or password?", w: 3 },
    { q: "Are you being pressured to act urgently (\"your account will be blocked today\")?", w: 2 },
    { q: "Were you asked to pay money first to receive a prize, loan or refund?", w: 3 },
    { q: "Did you get a link or app file asking you to log in or install something?", w: 2 },
    { q: "Is the sender using a personal mobile number instead of an official domain?", w: 1 },
    { q: "Were you asked to keep the transaction secret from family or the bank?", w: 2 },
    { q: "Were you promised very high returns with little or no risk?", w: 2 }
];

/* Module state */
var currentCaptcha = "";
var mapInstance = null;
var markerLayer = null;
var markerById = {};
var mapFilter = "all";
var tipFilter = "all";
var lastSubmittedId = "";
var countersDone = false;

/* =========================================================
   2. UTILITIES
   ========================================================= */
function $(id) { return document.getElementById(id); }

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (ch) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[ch];
    });
}

function loadJSON(key, fallback) {
    try {
        var raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
}

function saveJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (e) { return false; }
}

function formatDate(ts) {
    return new Date(ts).toLocaleString("en-IN", {
        day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
    });
}

function toast(message, type) {
    var host = $("toastHost");
    if (!host) return;
    var el = document.createElement("div");
    el.className = "toast toast-" + (type || "info");
    el.textContent = message;
    host.appendChild(el);
    setTimeout(function () {
        if (el.parentNode) el.parentNode.removeChild(el);
    }, 3800);
}

function setError(fieldId, message) {
    var err = $("err-" + fieldId);
    var field = $(fieldId);
    if (err) err.textContent = message || "";
    if (field) field.classList.toggle("invalid", !!message);
}

function clearErrors(ids) {
    for (var i = 0; i < ids.length; i++) setError(ids[i], "");
}

function isOfficer() {
    try { return sessionStorage.getItem(KEYS.officer) === "1"; }
    catch (e) { return false; }
}

/* =========================================================
   3. NAVIGATION
   ========================================================= */
function toggleMobileMenu() {
    var menu = $("navLinks");
    var btn = $("menuToggle");
    var open = menu.classList.toggle("open");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    btn.textContent = open ? "✕" : "☰";
}

function closeMobileMenu() {
    var menu = $("navLinks");
    var btn = $("menuToggle");
    if (menu) menu.classList.remove("open");
    if (btn) { btn.setAttribute("aria-expanded", "false"); btn.textContent = "☰"; }
}

function goTo(id) {
    if (location.hash === "#" + id) { showTab(id); }
    else { location.hash = "#" + id; }
}

function routeFromHash() {
    var id = location.hash.replace("#", "");
    if (PAGES.indexOf(id) === -1) id = "home";
    showTab(id);
}

function showTab(id) {
    if (id === "dashboard" && !isOfficer()) {
        history.replaceState(null, "", "#home");
        toast("Officer login required to open the dashboard.", "error");
        openModal();
        id = "home";
    }

    for (var i = 0; i < PAGES.length; i++) {
        var page = $("page-" + PAGES[i]);
        if (page) page.classList.toggle("active", PAGES[i] === id);
    }

    var links = document.querySelectorAll(".nav-links a");
    for (var j = 0; j < links.length; j++) {
        links[j].classList.toggle("active", links[j].getAttribute("data-tab") === id);
    }

    closeMobileMenu();
    window.scrollTo(0, 0);

    if (id === "home") animateCounters();
    if (id === "map") ensureMap();
    if (id === "track") renderMyReports();
    if (id === "dashboard") renderDashboard();
}

function startReport(type) {
    $("crimeType").value = type;
    setError("crimeType", "");
    goTo("report");
}

/* =========================================================
   4. HOME
   ========================================================= */
function renderMetrics() {
    var grid = $("metricsGrid");
    if (!grid) return;
    grid.innerHTML = "";
    for (var i = 0; i < metricData.length; i++) {
        var m = metricData[i];
        var card = document.createElement("div");
        card.className = "metric-card";

        var num = document.createElement("div");
        num.className = "metric-num";
        if (m.text) {
            num.textContent = m.text;
        } else {
            num.setAttribute("data-target", m.target);
            num.setAttribute("data-prefix", m.prefix);
            num.setAttribute("data-suffix", m.suffix);
            num.textContent = m.prefix + m.target.toLocaleString("en-IN") + m.suffix;
        }

        var label = document.createElement("div");
        label.className = "metric-label";
        label.textContent = m.label;

        card.appendChild(num);
        card.appendChild(label);
        grid.appendChild(card);
    }
}

function animateCounters() {
    if (countersDone) return;
    countersDone = true;
    var nums = document.querySelectorAll(".metric-num[data-target]");
    var duration = 1400;
    var start = null;

    function step(ts) {
        if (start === null) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        for (var i = 0; i < nums.length; i++) {
            var target = Number(nums[i].getAttribute("data-target"));
            var value = Math.round(target * eased);
            nums[i].textContent = nums[i].getAttribute("data-prefix") + value.toLocaleString("en-IN") + nums[i].getAttribute("data-suffix");
        }
        if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

function renderLiveFeed() {
    var list = $("liveFeed");
    if (!list) return;
    list.innerHTML = "";
    crimeIncidents.slice(0, 4).forEach(function (inc) {
        var li = document.createElement("li");
        li.innerHTML =
            '<span class="dot ' + TYPE_META[inc.type].dot + '"></span>' +
            "<div><strong>" + escapeHtml(inc.category) + "</strong>" +
            "<span>" + escapeHtml(inc.location) + " &middot; " + escapeHtml(inc.time) + "</span></div>";
        list.appendChild(li);
    });
}

function renderFaq() {
    var wrap = $("faqList");
    if (!wrap) return;
    wrap.innerHTML = "";
    faqData.forEach(function (item, index) {
        var box = document.createElement("div");
        box.className = "faq-item";
        box.innerHTML =
            '<button type="button" class="faq-q" aria-expanded="false" aria-controls="faq-a-' + index + '">' +
            "<span>" + escapeHtml(item.q) + '</span><span class="faq-icon">+</span></button>' +
            '<div class="faq-a" id="faq-a-' + index + '"><p>' + escapeHtml(item.a) + "</p></div>";
        box.querySelector(".faq-q").addEventListener("click", function () { toggleFaq(box); });
        wrap.appendChild(box);
    });
}

function toggleFaq(box) {
    var open = !box.classList.contains("open");
    var all = document.querySelectorAll(".faq-item");
    for (var i = 0; i < all.length; i++) {
        all[i].classList.remove("open");
        all[i].querySelector(".faq-a").style.maxHeight = "0px";
        all[i].querySelector(".faq-q").setAttribute("aria-expanded", "false");
    }
    if (open) {
        box.classList.add("open");
        var answer = box.querySelector(".faq-a");
        answer.style.maxHeight = answer.scrollHeight + "px";
        box.querySelector(".faq-q").setAttribute("aria-expanded", "true");
    }
}

/* =========================================================
   5. LIVE MAP
   ========================================================= */
function getFilteredIncidents() {
    var term = ($("mapSearch").value || "").trim().toLowerCase();
    return crimeIncidents.filter(function (inc) {
        if (mapFilter !== "all" && inc.type !== mapFilter) return false;
        if (!term) return true;
        var haystack = (inc.category + " " + inc.location + " " + TYPE_META[inc.type].label + " " + inc.status).toLowerCase();
        return haystack.indexOf(term) !== -1;
    });
}

function setMapFilter(filter) {
    mapFilter = filter;
    var chips = document.querySelectorAll("#mapFilters .chip");
    for (var i = 0; i < chips.length; i++) {
        chips[i].classList.toggle("active", chips[i].getAttribute("data-filter") === filter);
    }
    renderMapView();
}

function renderMapView() {
    var items = getFilteredIncidents();
    var list = $("mapList");
    $("mapCount").textContent = "Showing " + items.length + " of " + crimeIncidents.length + " incidents";
    list.innerHTML = "";

    if (items.length === 0) {
        list.innerHTML = '<li class="empty-state">No incidents match your filters.</li>';
    }

    items.forEach(function (inc) {
        var li = document.createElement("li");
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "incident-btn";
        btn.innerHTML =
            '<span class="dot ' + TYPE_META[inc.type].dot + '"></span>' +
            "<div><strong>" + escapeHtml(inc.category) + "</strong>" +
            "<span>" + escapeHtml(inc.location) + "</span>" +
            "<em>" + escapeHtml(inc.time) + " &middot; " + escapeHtml(inc.status) + "</em></div>";
        btn.addEventListener("click", function () { flyToIncident(inc.id); });
        li.appendChild(btn);
        list.appendChild(li);
    });

    updateMapMarkers(items);
}

function ensureMap() {
    var container = $("crimeMap");
    if (typeof L === "undefined") {
        container.innerHTML = '<div class="map-fallback">The map library could not be loaded. Please check your internet connection and refresh the page.</div>';
        return;
    }
    if (!mapInstance) {
        initCrimeMap();
    } else {
        setTimeout(function () { mapInstance.invalidateSize(); }, 120);
    }
}

function initCrimeMap() {
    mapInstance = L.map("crimeMap").setView([28.6139, 77.2090], 10);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: "&copy; OpenStreetMap &copy; CARTO",
        maxZoom: 18
    }).addTo(mapInstance);

    markerLayer = L.layerGroup().addTo(mapInstance);
    updateMapMarkers(getFilteredIncidents());
}

function updateMapMarkers(items) {
    if (!mapInstance || !markerLayer) return;
    markerLayer.clearLayers();
    markerById = {};

    items.forEach(function (inc) {
        var icon = L.divIcon({
            className: "blinking-pin " + TYPE_META[inc.type].cls,
            iconSize: [16, 16],
            iconAnchor: [8, 8]
        });
        var marker = L.marker([inc.lat, inc.lng], { icon: icon }).addTo(markerLayer);

        marker.bindPopup(
            '<div style="padding:4px;line-height:1.6;">' +
            '<strong style="color:#f43f5e;font-size:13px;">' + escapeHtml(inc.category) + "</strong><br>" +
            "<span>🏷️ " + escapeHtml(TYPE_META[inc.type].label) + "</span><br>" +
            "<span>📍 <strong>Location:</strong> " + escapeHtml(inc.location) + "</span><br>" +
            "<span>⏱️ <strong>Reported:</strong> " + escapeHtml(inc.time) + "</span><br>" +
            '<span style="color:#22d3ee;font-weight:bold;">Status: ' + escapeHtml(inc.status) + "</span></div>"
        );
        marker.on("mouseover", function () { this.openPopup(); });
        markerById[inc.id] = marker;
    });

    // Fit map to visible pins
    if (items.length > 0) {
        var bounds = L.latLngBounds(items.map(function (i) { return [i.lat, i.lng]; }));
        mapInstance.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
    }
}

function flyToIncident(id) {
    var inc = crimeIncidents.filter(function (i) { return i.id === id; })[0];
    if (!inc || !mapInstance) {
        toast("The map is not available right now.", "error");
        return;
    }
    mapInstance.flyTo([inc.lat, inc.lng], 14, { duration: 1 });
    if (markerById[id]) markerById[id].openPopup();
    $("crimeMap").scrollIntoView({ behavior: "smooth", block: "center" });
}

/* =========================================================
   6. REPORT FORM
   ========================================================= */
function setDateMax() {
    var now = new Date();
    var local = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    $("crimeDate").max = local;
}

function toggleAnonymous() {
    var anon = $("anonymous").checked;
    $("contactFields").style.display = anon ? "none" : "block";
    if (anon) clearErrors(["reporterName", "reporterPhone"]);
}

function updateDescCounter() {
    var len = $("crimeDesc").value.length;
    var counter = $("descCount");
    counter.textContent = len + " / 1000";
    counter.classList.toggle("warn", len > 900);
}

function generateReportId(existing) {
    var id;
    do {
        id = "CR-" + Math.floor(100000 + Math.random() * 900000);
    } while (id === "CR-849201" || existing.some(function (r) { return r.id === id; }));
    return id;
}

function handleReportSubmit(event) {
    event.preventDefault();
    var ids = ["crimeType", "crimeLoc", "crimeDate", "crimeDesc", "reporterName", "reporterPhone", "severity"];
    clearErrors(ids);
    var firstInvalid = null;

    function fail(id, msg) {
        setError(id, msg);
        if (!firstInvalid) firstInvalid = id;
    }

    var type = $("crimeType").value;
    var loc = $("crimeLoc").value.trim();
    var dateVal = $("crimeDate").value;
    var desc = $("crimeDesc").value.trim();
    var anon = $("anonymous").checked;
    var name = $("reporterName").value.trim();
    var phone = $("reporterPhone").value.trim();
    var sevInput = document.querySelector('input[name="severity"]:checked');

    if (!type) fail("crimeType", "Please select a category.");
    if (loc.length < 3) fail("crimeLoc", "Enter a location (at least 3 characters).");

    if (!dateVal) {
        fail("crimeDate", "Select when the incident happened.");
    } else if (new Date(dateVal).getTime() > Date.now()) {
        fail("crimeDate", "The date cannot be in the future.");
    }

    if (!sevInput) {
        $("err-severity").textContent = "Please choose a severity level.";
        if (!firstInvalid) firstInvalid = "severity";
    }

    if (desc.length < 30) fail("crimeDesc", "Please describe the incident in at least 30 characters (" + desc.length + " so far).");

    if (!anon) {
        if (name.length < 2 || !/^[A-Za-z .'-]+$/.test(name)) fail("reporterName", "Enter your name (letters only).");
        if (!/^[6-9]\d{9}$/.test(phone)) fail("reporterPhone", "Enter a valid 10-digit Indian mobile number.");
    }

    if (firstInvalid) {
        toast("Please fix the highlighted fields.", "error");
        var target = $(firstInvalid);
        if (target) target.focus();
        return false;
    }

    var reports = loadJSON(KEYS.reports, []);
    var now = Date.now();
    var report = {
        id: generateReportId(reports),
        type: type,
        location: loc,
        incidentDate: dateVal,
        severity: sevInput.value,
        description: desc,
        anonymous: anon,
        name: anon ? "" : name,
        phone: anon ? "" : phone,
        filedAt: now,
        stage: 0,
        history: [{ stage: 0, at: now, note: "Report received and registered." }]
    };
    reports.push(report);

    if (!saveJSON(KEYS.reports, reports)) {
        toast("Could not save the report (browser storage unavailable).", "error");
        return false;
    }

    lastSubmittedId = report.id;
    $("successId").textContent = report.id;
    $("reportSuccess").style.display = "block";
    $("reportForm").style.display = "none";
    $("reportSuccess").scrollIntoView({ behavior: "smooth", block: "center" });
    toast("Report registered: " + report.id, "success");
    return false;
}

function copyRefId() {
    var text = $("successId").textContent;
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(
            function () { toast("Reference ID copied.", "success"); },
            function () { toast("Copy failed. Please copy it manually: " + text, "error"); }
        );
    } else {
        toast("Copy not supported. Your ID is " + text, "info");
    }
}

function trackSubmitted() {
    $("trackId").value = lastSubmittedId;
    goTo("track");
    lookupCase(lastSubmittedId);
}

function newReport() {
    $("reportForm").reset();
    clearErrors(["crimeType", "crimeLoc", "crimeDate", "crimeDesc", "reporterName", "reporterPhone", "severity"]);
    updateDescCounter();
    toggleAnonymous();
    $("reportSuccess").style.display = "none";
    $("reportForm").style.display = "block";
}

/* =========================================================
   7. TRACK CASE
   ========================================================= */
function getDemoCase() {
    var day = 86400000;
    var now = Date.now();
    return {
        id: "CR-849201",
        type: "cyber",
        location: "Connaught Place, New Delhi",
        incidentDate: "",
        severity: "High",
        description: "Demo case: unauthorised UPI transactions after a phishing call claiming to be from the bank.",
        anonymous: true,
        filedAt: now - 2 * day,
        stage: 2,
        history: [
            { stage: 0, at: now - 2 * day, note: "Report received and registered." },
            { stage: 1, at: now - 2 * day + 3600000, note: "Assigned to Regional Special Cyber Unit." },
            { stage: 2, at: now - day, note: "Statement verification and CCTV review in progress." }
        ]
    };
}

function findReport(id) {
    if (id === "CR-849201") return getDemoCase();
    var reports = loadJSON(KEYS.reports, []);
    return reports.filter(function (r) { return r.id === id; })[0] || null;
}

function useDemoId() {
    $("trackId").value = "CR-849201";
    lookupCase("CR-849201");
}

function trackCase(event) {
    event.preventDefault();
    var id = $("trackId").value.trim().toUpperCase();
    $("trackId").value = id;
    lookupCase(id);
    return false;
}

function lookupCase(id) {
    setError("trackId", "");
    var box = $("trackResult");

    if (!/^CR-\d{6}$/.test(id)) {
        setError("trackId", "Invalid format. Use CR- followed by 6 digits, e.g. CR-849201.");
        box.style.display = "none";
        return;
    }

    var report = findReport(id);
    if (!report) {
        setError("trackId", "No case found with this ID on this device. Check the number and try again.");
        box.style.display = "none";
        return;
    }
    renderCase(report);
}

function renderCase(r) {
    var timeline = "";
    for (var i = 0; i < STAGES.length; i++) {
        var cls = "";
        if (i < r.stage || r.stage === STAGES.length - 1) cls = "done";
        else if (i === r.stage) cls = "current";
        timeline += '<li class="' + cls + '">' + escapeHtml(STAGES[i]) + "</li>";
    }

    var history = r.history.slice().reverse().map(function (h) {
        return "<li>" + escapeHtml(h.note) + "<span>" + escapeHtml(formatDate(h.at)) + " &middot; " + escapeHtml(STAGES[h.stage]) + "</span></li>";
    }).join("");

    var html =
        '<div class="case-card">' +
        '<div class="case-head"><h3>' + escapeHtml(r.id) + "</h3>" +
        '<span class="status-badge st-' + r.stage + '">' + escapeHtml(STAGES[r.stage]) + "</span></div>" +
        '<div class="case-meta">' +
        "<div><span>Category</span>" + escapeHtml(CATEGORY_LABELS[r.type]) + "</div>" +
        "<div><span>Handling Division</span>" + escapeHtml(DIVISIONS[r.type]) + "</div>" +
        "<div><span>Location</span>" + escapeHtml(r.location) + "</div>" +
        "<div><span>Filed On</span>" + escapeHtml(formatDate(r.filedAt)) + "</div>" +
        "<div><span>Severity</span>" + escapeHtml(r.severity) + "</div>" +
        "<div><span>Reporter</span>" + (r.anonymous ? "Anonymous" : escapeHtml(r.name)) + "</div></div>" +
        '<div class="case-desc">' + escapeHtml(r.description) + "</div>" +
        '<ul class="timeline">' + timeline + "</ul>" +
        '<h4 class="history-title">Case history</h4><ul class="history">' + history + "</ul></div>";

    var box = $("trackResult");
    box.innerHTML = html;
    box.style.display = "block";
}

function renderMyReports() {
    var wrap = $("myReports");
    var reports = loadJSON(KEYS.reports, []).slice().reverse().slice(0, 6);
    if (reports.length === 0) {
        wrap.innerHTML = '<div class="empty-state">No reports filed from this device yet.</div>';
        return;
    }
    wrap.innerHTML = "";
    reports.forEach(function (r) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "my-report-btn";
        btn.innerHTML = "<span><strong>" + escapeHtml(r.id) + "</strong> &middot; " + escapeHtml(TYPE_META[r.type].label) + "</span>" +
            '<span class="status-badge st-' + r.stage + '">' + escapeHtml(STAGES[r.stage]) + "</span>";
        btn.addEventListener("click", function () {
            $("trackId").value = r.id;
            lookupCase(r.id);
        });
        wrap.appendChild(btn);
    });
}

/* =========================================================
   8. SAFETY HUB
   ========================================================= */
function setTipFilter(filter) {
    tipFilter = filter;
    var chips = document.querySelectorAll("#tipFilters .chip");
    for (var i = 0; i < chips.length; i++) {
        chips[i].classList.toggle("active", chips[i].getAttribute("data-filter") === filter);
    }
    renderTips();
}

function renderTips() {
    var grid = $("tipsGrid");
    var term = ($("tipSearch").value || "").trim().toLowerCase();
    var tagNames = { cyber: "Cyber safety", theft: "Theft prevention", harassment: "Personal safety" };

    var items = tipsData.filter(function (t) {
        if (tipFilter !== "all" && t.cat !== tipFilter) return false;
        return !term || (t.title + " " + t.text).toLowerCase().indexOf(term) !== -1;
    });

    if (items.length === 0) {
        grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1;">No tips match your search.</div>';
        return;
    }

    grid.innerHTML = items.map(function (t) {
        return '<article class="tip-card"><span class="tip-icon">' + t.icon + "</span>" +
            '<span class="tag">' + tagNames[t.cat] + "</span>" +
            "<h4>" + escapeHtml(t.title) + "</h4><p>" + escapeHtml(t.text) + "</p></article>";
    }).join("");
}

function renderChecklist() {
    var saved = loadJSON(KEYS.checklist, []);
    var wrap = $("checklist");
    wrap.innerHTML = "";
    checklistData.forEach(function (text, index) {
        var label = document.createElement("label");
        label.className = "check";
        var input = document.createElement("input");
        input.type = "checkbox";
        input.checked = saved.indexOf(index) !== -1;
        input.addEventListener("change", updateChecklist);
        input.setAttribute("data-index", index);
        var span = document.createElement("span");
        span.textContent = text;
        label.appendChild(input);
        label.appendChild(span);
        wrap.appendChild(label);
    });
    updateChecklistProgress();
}

function updateChecklist() {
    var boxes = document.querySelectorAll("#checklist input");
    var checked = [];
    for (var i = 0; i < boxes.length; i++) {
        if (boxes[i].checked) checked.push(Number(boxes[i].getAttribute("data-index")));
    }
    saveJSON(KEYS.checklist, checked);
    updateChecklistProgress();
}

function updateChecklistProgress() {
    var boxes = document.querySelectorAll("#checklist input");
    var done = 0;
    for (var i = 0; i < boxes.length; i++) if (boxes[i].checked) done++;
    var pct = boxes.length ? Math.round((done / boxes.length) * 100) : 0;
    $("checkProgress").style.width = pct + "%";
    $("checkProgressText").textContent = done + " of " + boxes.length + " completed (" + pct + "%)" + (pct === 100 ? " - great job! 🎉" : "");
}

function renderScamChecker() {
    var form = $("scamForm");
    var html = "";
    scamQuestions.forEach(function (item, i) {
        html += '<div class="scam-q"><p>' + (i + 1) + ". " + escapeHtml(item.q) + "</p>" +
            '<div class="yn"><label><input type="radio" name="scam' + i + '" value="1"><span>Yes</span></label>' +
            '<label><input type="radio" name="scam' + i + '" value="0"><span>No</span></label></div></div>';
    });
    html += '<button type="submit" class="btn btn-primary btn-block">Check Risk Level</button>';
    form.innerHTML = html;
}

function evaluateScam(event) {
    event.preventDefault();
    var score = 0;
    var max = 0;

    for (var i = 0; i < scamQuestions.length; i++) {
        var chosen = document.querySelector('input[name="scam' + i + '"]:checked');
        if (!chosen) {
            toast("Please answer question " + (i + 1) + ".", "error");
            return false;
        }
        max += scamQuestions[i].w;
        if (chosen.value === "1") score += scamQuestions[i].w;
    }

    var pct = Math.round((score / max) * 100);
    var level, cls, advice;
    if (score <= 2) {
        level = "Low risk"; cls = "risk-low";
        advice = "This looks fairly safe, but stay careful. Verify the sender through an official channel before sharing any details.";
    } else if (score <= 6) {
        level = "Medium risk"; cls = "risk-med";
        advice = "Several warning signs are present. Do not click links or send money. Contact the organisation using the number on its official website.";
    } else {
        level = "High risk - likely a scam"; cls = "risk-high";
        advice = "Stop all communication and do not share OTPs or make payments. If money is already lost, call 1930 immediately and file a report on this portal.";
    }

    var box = $("scamResult");
    box.innerHTML = '<div class="scam-result ' + cls + '"><h4>' + level + " (" + pct + "%)</h4><p>" + advice + "</p>" +
        (cls === "risk-high" ? '<p style="margin-top:10px;"><a class="btn btn-primary btn-sm" href="#report" onclick="startReport(\'cyber\')">Report this fraud</a></p>' : "") + "</div>";
    box.style.display = "block";
    return false;
}

/* =========================================================
   9. CONTACT FORM
   ========================================================= */
function handleContactSubmit(event) {
    event.preventDefault();
    var ids = ["cName", "cEmail", "cSubject", "cMessage"];
    clearErrors(ids);
    var ok = true;

    var name = $("cName").value.trim();
    var email = $("cEmail").value.trim();
    var subject = $("cSubject").value;
    var message = $("cMessage").value.trim();

    if (name.length < 2) { setError("cName", "Please enter your full name."); ok = false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { setError("cEmail", "Enter a valid email address."); ok = false; }
    if (!subject) { setError("cSubject", "Please choose a subject."); ok = false; }
    if (message.length < 10) { setError("cMessage", "Message must be at least 10 characters."); ok = false; }

    if (!ok) {
        toast("Please fix the highlighted fields.", "error");
        return false;
    }

    var messages = loadJSON(KEYS.messages, []);
    messages.push({ name: name, email: email, subject: subject, message: message, at: Date.now() });
    saveJSON(KEYS.messages, messages);

    $("contactForm").reset();
    $("contactSuccess").style.display = "block";
    toast("Message sent successfully.", "success");
    setTimeout(function () { $("contactSuccess").style.display = "none"; }, 6000);
    return false;
}

/* =========================================================
   10. OFFICER LOGIN & DASHBOARD
   ========================================================= */
function openModal() {
    $("authModal").classList.add("show");
    $("loginError").textContent = "";
    generateCaptcha();
    setTimeout(function () { $("loginEmail").focus(); }, 50);
}

function closeModal() {
    $("authModal").classList.remove("show");
}

function togglePassword() {
    var input = $("loginPassword");
    var show = input.type === "password";
    input.type = show ? "text" : "password";
    $("togglePw").textContent = show ? "Hide" : "Show";
}

function generateCaptcha() {
    var chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    var result = "";
    for (var i = 0; i < 5; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    currentCaptcha = result;
    $("captchaCode").textContent = result;
    $("captchaInput").value = "";
}

function handleLogin(event) {
    event.preventDefault();
    var email = $("loginEmail").value.trim().toLowerCase();
    var password = $("loginPassword").value;
    var captcha = $("captchaInput").value.trim().toUpperCase();
    var errBox = $("loginError");

    function reject(msg) {
        errBox.textContent = msg;
        generateCaptcha();
        return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return reject("Enter a valid officer email address.");
    if (password.length < 6) return reject("Password must be at least 6 characters.");
    if (captcha !== currentCaptcha) return reject("Incorrect captcha code. A new one has been generated.");
    if (email !== OFFICER_DEMO.email || password !== OFFICER_DEMO.password) return reject("Invalid officer credentials.");

    try { sessionStorage.setItem(KEYS.officer, "1"); } catch (e) { /* ignore */ }
    $("loginForm").reset();
    closeModal();
    updateAuthUI();
    toast("Official access granted. Welcome, Officer.", "success");
    goTo("dashboard");
    return false;
}

function logout() {
    try { sessionStorage.removeItem(KEYS.officer); } catch (e) { /* ignore */ }
    updateAuthUI();
    if (location.hash === "#dashboard") goTo("home");
    toast("Logged out successfully.", "info");
}

function updateAuthUI() {
    var auth = $("navAuth");
    var dashLi = $("navDashLi");
    if (isOfficer()) {
        auth.innerHTML = '<span class="officer-tag">👮 Officer Authenticated</span>' +
            '<button type="button" class="btn btn-outline btn-sm" onclick="logout()">Logout</button>';
        dashLi.style.display = "";
    } else {
        auth.innerHTML = '<button type="button" class="btn btn-outline btn-sm" onclick="openModal()">Official Login</button>';
        dashLi.style.display = "none";
    }
}

function setupDashFilter() {
    var select = $("dashStatus");
    STAGES.forEach(function (name, i) {
        var opt = document.createElement("option");
        opt.value = String(i);
        opt.textContent = name;
        select.appendChild(opt);
    });
}

function getDashReports() {
    var term = ($("dashSearch").value || "").trim().toLowerCase();
    var status = $("dashStatus").value;
    return loadJSON(KEYS.reports, []).filter(function (r) {
        if (status !== "all" && String(r.stage) !== status) return false;
        if (!term) return true;
        return (r.id + " " + r.location + " " + r.description + " " + CATEGORY_LABELS[r.type]).toLowerCase().indexOf(term) !== -1;
    }).sort(function (a, b) { return b.filedAt - a.filedAt; });
}

function renderDashboard() {
    if (!isOfficer()) return;
    var all = loadJSON(KEYS.reports, []);
    var counts = [0, 0, 0, 0];
    var high = 0;
    all.forEach(function (r) {
        counts[r.stage]++;
        if (r.severity === "High") high++;
    });

    $("dashStats").innerHTML =
        '<div class="stat-card"><b>' + all.length + "</b><span>Total reports</span></div>" +
        '<div class="stat-card"><b>' + counts[0] + "</b><span>New</span></div>" +
        '<div class="stat-card"><b>' + (counts[1] + counts[2]) + "</b><span>In progress</span></div>" +
        '<div class="stat-card"><b>' + counts[3] + "</b><span>Resolved</span></div>" +
        '<div class="stat-card"><b>' + high + "</b><span>High severity</span></div>";

    var rows = getDashReports();
    var body = $("dashBody");
    var empty = $("dashEmpty");
    body.innerHTML = "";

    if (rows.length === 0) {
        empty.style.display = "block";
        empty.textContent = all.length === 0
            ? "No reports yet. File one from the Report Incident page, then manage it here."
            : "No reports match your filters.";
        return;
    }
    empty.style.display = "none";

    rows.forEach(function (r) {
        var tr = document.createElement("tr");
        var options = STAGES.map(function (s, i) {
            return '<option value="' + i + '"' + (i === r.stage ? " selected" : "") + ">" + escapeHtml(s) + "</option>";
        }).join("");

        tr.innerHTML =
            "<td>" + escapeHtml(r.id) + "</td>" +
            "<td>" + escapeHtml(TYPE_META[r.type].label) + "</td>" +
            "<td>" + escapeHtml(r.location) + "</td>" +
            '<td><span class="sev-pill ' + escapeHtml(r.severity) + '">' + escapeHtml(r.severity) + "</span></td>" +
            "<td>" + escapeHtml(formatDate(r.filedAt)) + "</td>" +
            '<td><select class="table-select" aria-label="Update status of ' + escapeHtml(r.id) + '">' + options + "</select></td>" +
            '<td><button type="button" class="btn btn-danger btn-sm">Delete</button></td>';

        tr.querySelector("select").addEventListener("change", function () { updateStage(r.id, Number(this.value)); });
        tr.querySelector("button").addEventListener("click", function () { deleteReport(r.id); });
        body.appendChild(tr);
    });
}

function updateStage(id, stage) {
    var reports = loadJSON(KEYS.reports, []);
    for (var i = 0; i < reports.length; i++) {
        if (reports[i].id === id) {
            reports[i].stage = stage;
            reports[i].history.push({ stage: stage, at: Date.now(), note: "Status updated by officer to \"" + STAGES[stage] + "\"." });
            break;
        }
    }
    saveJSON(KEYS.reports, reports);
    renderDashboard();
    toast(id + " updated to " + STAGES[stage] + ".", "success");
}

function deleteReport(id) {
    if (!confirm("Delete report " + id + "? This cannot be undone.")) return;
    var reports = loadJSON(KEYS.reports, []).filter(function (r) { return r.id !== id; });
    saveJSON(KEYS.reports, reports);
    renderDashboard();
    toast(id + " deleted.", "info");
}

function clearAllReports() {
    var reports = loadJSON(KEYS.reports, []);
    if (reports.length === 0) { toast("There are no reports to clear.", "info"); return; }
    if (!confirm("Delete all " + reports.length + " reports stored on this device?")) return;
    saveJSON(KEYS.reports, []);
    renderDashboard();
    toast("All reports cleared.", "info");
}

function csvCell(value) {
    return "\"" + String(value).replace(/"/g, "\"\"") + "\"";
}

function exportCSV() {
    var rows = getDashReports();
    if (rows.length === 0) { toast("Nothing to export.", "error"); return; }

    var lines = [["Reference ID", "Category", "Location", "Severity", "Status", "Filed At", "Reporter", "Description"].map(csvCell).join(",")];
    rows.forEach(function (r) {
        lines.push([r.id, CATEGORY_LABELS[r.type], r.location, r.severity, STAGES[r.stage], formatDate(r.filedAt),
            r.anonymous ? "Anonymous" : r.name, r.description].map(csvCell).join(","));
    });

    var blob = new Blob(["\ufeff" + lines.join("\r\n")], { type: "text/csv;charset=utf-8;" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "crime-reports.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast("Exported " + rows.length + " report(s) to CSV.", "success");
}

/* =========================================================
   11. INITIALISATION
   ========================================================= */
function setupRevealObserver() {
    var items = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
        for (var i = 0; i < items.length; i++) items[i].classList.add("visible");
        return;
    }
    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });
    for (var j = 0; j < items.length; j++) observer.observe(items[j]);
}

window.addEventListener("DOMContentLoaded", function () {
    renderMetrics();
    renderLiveFeed();
    renderFaq();
    renderTips();
    renderChecklist();
    renderScamChecker();
    renderMapView();
    setupDashFilter();
    setDateMax();
    generateCaptcha();
    updateAuthUI();
    toggleAnonymous();
    setupRevealObserver();

    $("crimeDesc").addEventListener("input", updateDescCounter);

    // Clear field errors as the user types
    ["crimeType", "crimeLoc", "crimeDate", "crimeDesc", "reporterName", "reporterPhone", "trackId", "cName", "cEmail", "cSubject", "cMessage"].forEach(function (id) {
        var el = $(id);
        if (el) {
            el.addEventListener("input", function () { setError(id, ""); });
            el.addEventListener("change", function () { setError(id, ""); });
        }
    });
    var sevRadios = document.querySelectorAll('input[name="severity"]');
    for (var i = 0; i < sevRadios.length; i++) {
        sevRadios[i].addEventListener("change", function () { $("err-severity").textContent = ""; });
    }

    // Only digits allowed in phone field
    $("reporterPhone").addEventListener("input", function () {
        this.value = this.value.replace(/\D/g, "");
    });

    // Modal: Esc key and click on backdrop
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") { closeModal(); closeMobileMenu(); }
    });
    $("authModal").addEventListener("click", function (e) {
        if (e.target === this) closeModal();
    });

    // Back-to-top button
    window.addEventListener("scroll", function () {
        $("backTop").classList.toggle("show", window.scrollY > 450);
    });

    window.addEventListener("hashchange", routeFromHash);
    routeFromHash();
});
