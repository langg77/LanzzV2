// === Elemen DOM ===
const popupSendBug = document.getElementById("popupSendBug");
const popupError = document.getElementById("popupError");
const popupConfirmDelete = document.getElementById("popupConfirmDelete");
const popupConfirmLogout = document.getElementById("popupConfirmLogout");
const popupTo = document.getElementById("popupTo");
const popupBugType = document.getElementById("popupBugType");
const popupErrorText = document.getElementById("popupErrorText");
const waitText = document.getElementById("waitText");
const inputNumber = document.getElementById("number");
const bugTypeSelect = document.getElementById("bugType");
const historyBox = document.getElementById("historyBox");
const historyList = document.getElementById("historyList");
const historyIcon = document.querySelector(".history-icon");
const sendBtn = document.getElementById("sendBug");
const botStatus = document.getElementById("botStatus");
const clearHistoryBtn = document.getElementById("clearHistory");
const confirmYesBtn = document.getElementById("confirmYes");
const confirmLogoutBtn = document.getElementById("logoutYes");
const infoBtn = document.getElementById("infoBtn");
const infoPopup = document.getElementById("infoPopup");
const loginScreen = document.getElementById("lockScreen");
const mainScreen = document.getElementById("mainScreen");
const holo = document.querySelector(".sky-holo-main");
const holo2 = document.querySelector(".sky-holo");
const loginBox = document.getElementById("loginBox");
const registerBox = document.getElementById("registerBox");

// === Data & Inisialisasi ===
let history = [];
try {
    history = JSON.parse(localStorage.getItem("bugHistory")) || [];
} catch {
    history = [];
}
let accounts = JSON.parse(localStorage.getItem("accounts")) || [];
let bugSpamCount = 0;
let isBotActive = true;

const COOLDOWN_MINUTES = 10;
const BUG_COOLDOWN_MS = COOLDOWN_MINUTES * 60 * 1000;

// === Utilitas ===
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getCooldownRemaining() {
    const until = parseInt(localStorage.getItem("bugServerBusyUntil"));
    return isNaN(until) ? 0 : Math.max(0, until - Date.now());
}

function updateHistoryUI() {
    if (!historyList || !historyBox) return;

    historyList.innerHTML = "";
    history.slice(-5).reverse().forEach(item => {
        const li = document.createElement("li");
        li.textContent = `${item.number} (${item.type})`;
        historyList.appendChild(li);
    });
    historyBox.style.display = history.length ? "block" : "none";
}

// === Popup ===
function openPopup(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = "flex";
}

function closePopup(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
}

function showSendBugPopup(number, bugType) {
    if (popupTo) popupTo.textContent = number;
    if (popupBugType) popupBugType.textContent = bugType;
    openPopup("popupSendBug");
}

function showPopupError(message) {
    if (popupErrorText) popupErrorText.textContent = message;
    openPopup("popupError");
}

// === Cooldown ===
function deactivateBot() {
    isBotActive = false;
    bugSpamCount = 0;
    if (botStatus) botStatus.textContent = "Server Sibuk";
    if (botCode) botCode.textContent = "";
    if (botName) botName.textContent = "";
    if (sendBtn) sendBtn.disabled = true;

    const interval = setInterval(() => {
        const remaining = getCooldownRemaining();
        if (remaining <= 0) {
            clearInterval(interval);
            activateBot();
        } else {
            const m = Math.floor(remaining / 60000);
            const s = Math.floor((remaining % 60000) / 1000);
            if (sendBtn) sendBtn.textContent = `Wait ${m}:${s < 10 ? "0" : ""}${s}`;
        }
    }, 1000);
}

function activateBot() {
    isBotActive = true;
    bugSpamCount = 0;
    if (sendBtn) {
        sendBtn.disabled = false;
        sendBtn.textContent = "SEND BUG";
    }
    if (botStatus) botStatus.textContent = "Server Aktif";
    if (botCode) botCode.textContent = "LanzzV2";
    if (botName) botName.textContent = "Lanzz";
    localStorage.removeItem("bugServerBusyUntil");
}

// === Inject akun default kalau kosong ===
if (accounts.length === 0) {
    accounts = [{ user: "lang", pass: "vip" }];
    localStorage.setItem("accounts", JSON.stringify(accounts));
}

// === Show Form Login / Register ===
function showLogin() {
    loginBox.style.display = "block";
    registerBox.style.display = "none";
}

function showRegister() {
    loginBox.style.display = "none";
    registerBox.style.display = "block";
}

// === Login ===
function login() {
    const username = document.getElementById("username")?.value.trim();
    const password = document.getElementById("password")?.value.trim();
    const loginError = document.getElementById("loginError");

    const acc = accounts.find(a => a.user === username && a.pass === password);

    if (acc) {
        localStorage.setItem("loggedInUser", username);
        loginScreen.style.display = "none";
        mainScreen.style.display = "block";
        loginError.style.display = "none";
    } else {
        loginError.textContent = "Username / Password salah!";
        loginError.style.display = "block";
    }
}

// === Register ===
function register() {
    const user = document.getElementById("regUsername")?.value.trim();
    const pass = document.getElementById("regPassword")?.value.trim();
    const confirm = document.getElementById("confirmPassword")?.value.trim();
    const code = document.getElementById("uniqueCode")?.value.trim().toUpperCase(); // <- penting
    const allowedCodes = ["UNIX-12", "INVIS-21", "FRSH-27"];

    if (!user || !pass || !confirm || !code) {
        alert("Semua kolom harus diisi!");
        return;
    }

    if (pass !== confirm) {
        alert("Konfirmasi password tidak cocok!");
        return;
    }

    const usernameExist = accounts.find(a => a.user === user);
    if (usernameExist) {
        alert("Username sudah terdaftar!");
        return;
    }

    if (!allowedCodes.includes(code)) {
        alert("Kode unik tidak valid!");
        return;
    }

    const codeUsed = accounts.find(a => a.code === code);
    if (codeUsed) {
        alert("Kode unik sudah digunakan!");
        return;
    }

    const newAcc = { user, pass, code };
    accounts.push(newAcc);
    localStorage.setItem("accounts", JSON.stringify(accounts));

    alert("Akun berhasil didaftarkan. Silakan login.");
    showLogin();
}

// === Logout ===
function logout() {
    openPopup("popupConfirmLogout");
}

confirmLogoutBtn?.addEventListener("click", () => {
    localStorage.removeItem("loggedInUser");
    closePopup("popupConfirmLogout");
    location.reload();
});

// === Auto Login ===
window.addEventListener("DOMContentLoaded", () => {
    const loggedInUser = localStorage.getItem("loggedInUser");
    if (loggedInUser) {
        loginScreen.style.display = "none";
        mainScreen.style.display = "block";
    }
});

// === Send Bug ===
sendBtn?.addEventListener("click", async () => {
    if (!isBotActive) return;

    const number = inputNumber?.value.trim();
    const type = bugTypeSelect?.value;

    if (!number.startsWith("628")) return showPopupError("Nomor harus diawali dengan 628");
    if (number.length > 13) return showPopupError("Maksimal 13 digit angka.");
    if (!/^\d+$/.test(number)) return showPopupError("Nomor hanya boleh angka.");

    waitText.textContent = "wait.";
    await delay(500);
    waitText.textContent = "wait..";
    await delay(500);
    waitText.textContent = "wait...";
    await delay(500);
    waitText.textContent = "";

    showSendBugPopup(number, type);
    history.push({ number, type });
    localStorage.setItem("bugHistory", JSON.stringify(history));
    updateHistoryUI();

    bugSpamCount++;
    if (bugSpamCount >= 3) {
        const busyUntil = Date.now() + BUG_COOLDOWN_MS;
        localStorage.setItem("bugServerBusyUntil", busyUntil.toString());
        deactivateBot();
    }
});

// === History dan Popup Control ===
historyIcon?.addEventListener("click", () => {
    if (!historyBox) return;
    historyBox.style.display = historyBox.style.display === "block" ? "none" : "block";
    if (historyBox.style.display === "block") updateHistoryUI();
});

clearHistoryBtn?.addEventListener("click", () => {
    openPopup("popupConfirmDelete");
});

confirmYesBtn?.addEventListener("click", () => {
    history = [];
    localStorage.removeItem("bugHistory");
    updateHistoryUI();
    closePopup("popupConfirmDelete");
});

// === Info Button ===
infoBtn?.addEventListener("click", () => {
    if (!infoPopup) return;
    infoPopup.style.display = infoPopup.style.display === "block" ? "none" : "block";
});

document.addEventListener("click", (e) => {
    if (infoBtn && infoPopup &&
        !infoBtn.contains(e.target) &&
        !infoPopup.contains(e.target)) {
        infoPopup.style.display = "none";
    }
});

// === Hologram Effect ===
const messages = ["Website Bugs", "SC LanzzV2", "Free User"];
function showHologram(target, list) {
    if (!target) return;
    const randomText = list[Math.floor(Math.random() * list.length)];
    target.textContent = randomText;
    target.style.opacity = "1";
    target.style.transform = "translateX(-50%) translateY(0px)";
    setTimeout(() => {
        target.style.opacity = "0";
        target.style.transform = "translateX(-50%) translateY(-20px)";
    }, 5000);
}

showHologram(holo, messages);
showHologram(holo2, messages);
setInterval(() => showHologram(holo, messages), 10000);
setInterval(() => showHologram(holo2, messages), 10000);

// === Autologin ===
window.onload = () => {
    const loggedInUser = localStorage.getItem("loggedInUser");
    if (loggedInUser) {
        loginScreen.style.display = "none";
        mainScreen.style.display = "block";
    }

    const remaining = getCooldownRemaining();
    if (remaining > 0) {
        deactivateBot();
    } else {
        activateBot();
    }
};

const botBtn = document.getElementById("botBtn");
const chatScreen = document.getElementById("chatScreen");
const backBtn = document.getElementById("backBtn");

botBtn.addEventListener("click", () => {
    chatScreen.classList.remove("hidden");
    resetChat(); // mulai ulang setiap dibuka
});

backBtn.addEventListener("click", () => {
    chatScreen.classList.add("hidden");
    clearChat(); // bersihin isi chat
});

function resetChat() {
    clearChat(); // kosongin isi chat dulu
    const chatBody = document.getElementById("chatBody");

    const msg = document.createElement("div");
    msg.className = "chat-message bot";
    msg.innerHTML = `
        <div class="chat-header-row">
            <span class="username">LanzzV2</span>
        </div>
        <span class="message-text">halo ada yang bisa di bantu?</span>
        <div class="button-group" id="initialOptions">
            <button class="chat-option" onclick="handleYes()">Ya</button>
            <button class="chat-option" onclick="handleNo()">Tidak</button>
        </div>
    `;
    chatBody.appendChild(msg);
    scrollToBottom();
}

function clearChat() {
    const chatBody = document.getElementById("chatBody");
    chatBody.innerHTML = '';
}

function handleYes() {
    removeElementById("initialOptions");

    const btnGroup = `
        <div class="button-group" id="helpOptions">
            <button class="chat-option" onclick="selectHelp('ga masuk')">bug tidak masuk</button>
            <button class="chat-option" onclick="selectHelp('ga ngefek')">bug tidak ada efek</button>
            <button class="chat-option" onclick="selectHelp('lainnya')">delay terlalu lama</button>
            <button class="chat-option" onclick="cancelHelp()">tidak ada</button>
        </div>
    `;
    typeBotMessage("silakan pilih bantuan yang dibutuhkan:", btnGroup);
}

function handleNo() {
    removeElementById("initialOptions");
    typeBotMessage("oke sip, kalau butuh tinggal pencet lagi yaa!");
    setTimeout(() => chatScreen.classList.add("hidden"), 3000);
}

function cancelHelp() {
    removeElementById("helpOptions");
    typeBotMessage("oke, bantuan dilewati dulu");
    setTimeout(() => chatScreen.classList.add("hidden"), 3000);
}

function selectHelp(type) {
    removeElementById("helpOptions");

    let msg = "";
    if (type === "ga masuk") {
        msg = "baik, kami akan cek ketersediaan botnya...";
    } else if (type === "ga ngefek") {
        msg = "oke, kami akan ganti source codenya...";
        document.getElementById("botCode").textContent = "LanzzV3";
        document.getElementById("botName").textContent = "Kayla21";
    } else {
        msg = "siap, kami akan mempercepat proses nya...";
    }

    typeBotMessage(msg);
    setTimeout(() => chatScreen.classList.add("hidden"), 3000);
}

function removeElementById(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

function scrollToBottom() {
    const chatBody = document.getElementById("chatBody");
    chatBody.scrollTop = chatBody.scrollHeight;
}

function typeBotMessage(message, buttons = '') {
    const chatBody = document.getElementById("chatBody");

    // Placeholder: sedang mengetik...
    const typingMsg = document.createElement("div");
    typingMsg.className = "chat-message bot typing";
    typingMsg.innerHTML = `
        <div class="chat-header-row">
            <span class="username">LanzzV2</span>
        </div>
        <span class="message-text">...</span>
    `;
    chatBody.appendChild(typingMsg);
    scrollToBottom();

    setTimeout(() => {
        let i = 0;
        const typingSpeed = 25;
        const finalMsg = document.createElement("div");
        finalMsg.className = "chat-message bot";
        finalMsg.innerHTML = `
            <div class="chat-header-row">
                <span class="username">LanzzV2</span>
            </div>
            <span class="message-text" id="typingText"></span>
            ${buttons}
        `;
        chatBody.replaceChild(finalMsg, typingMsg);

        const textSpan = finalMsg.querySelector("#typingText");

        function typeChar() {
            if (i < message.length) {
                textSpan.textContent += message.charAt(i);
                i++;
                scrollToBottom();
                setTimeout(typeChar, typingSpeed);
            }
        }

        typeChar();
    }, 500); // delay sebelum mulai ngetik
}
