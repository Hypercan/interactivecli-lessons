/* =============================================
   TERMINAL MACERASI — Interactive CLI Lessons
   Virtual File System + Terminal + Lesson Engine
   ============================================= */

// ─── VIRTUAL FILE SYSTEM ────────────────────────
const fileSystem = {
  "/": {
    type: "dir",
    children: {
      home: {
        type: "dir",
        children: {
          ogrenci: {
            type: "dir",
            children: {
              belgeler: {
                type: "dir",
                children: {
                  "odevler.txt": { type: "file" },
                  "notlar.txt": { type: "file" },
                },
              },
              resimler: {
                type: "dir",
                children: {
                  "tatil.jpg": { type: "file" },
                  "selfie.png": { type: "file" },
                },
              },
              muzik: {
                type: "dir",
                children: {},
              },
              projeler: {
                type: "dir",
                children: {
                  "web-sitesi": {
                    type: "dir",
                    children: {
                      "index.html": { type: "file" },
                      "style.css": { type: "file" },
                    },
                  },
                },
              },
              "gizli_dosya.txt": { type: "file" },
              "hosgeldin.txt": { type: "file" },
            },
          },
        },
      },
    },
  },
};

let cwd = "/home/ogrenci";
let commandHistory = [];
let historyIndex = -1;
let xp = 0;
let currentLessonIndex = 0;
let stepCompleted = false;
let totalCommandsLearned = 0;

// ─── FILE SYSTEM HELPERS ────────────────────────
function resolvePath(path) {
  if (path.startsWith("/")) return normalizePath(path);
  if (path === "~") return "/home/ogrenci";
  if (path.startsWith("~/"))
    return normalizePath("/home/ogrenci/" + path.slice(2));
  return normalizePath(cwd + "/" + path);
}

function normalizePath(p) {
  const parts = p.split("/").filter(Boolean);
  const resolved = [];
  for (const part of parts) {
    if (part === ".") continue;
    if (part === "..") {
      resolved.pop();
      continue;
    }
    resolved.push(part);
  }
  return "/" + resolved.join("/");
}

function getNode(path) {
  if (path === "/") return fileSystem["/"];
  const parts = path.split("/").filter(Boolean);
  let node = fileSystem["/"];
  for (const part of parts) {
    if (!node || node.type !== "dir" || !node.children[part]) return null;
    node = node.children[part];
  }
  return node;
}

function getPromptPath() {
  if (cwd === "/home/ogrenci") return "~";
  if (cwd.startsWith("/home/ogrenci/"))
    return "~/" + cwd.slice("/home/ogrenci/".length);
  return cwd;
}

// ─── TERMINAL ENGINE ────────────────────────────
const terminalOutput = document.getElementById("terminal-output");
const terminalInput = document.getElementById("terminal-input");
const terminalPrompt = document.getElementById("terminal-prompt");
const cursorBlink = document.querySelector(".cursor-blink");

function updatePrompt() {
  const path = getPromptPath();
  terminalPrompt.textContent = `ogrenci@terminal:${path}$`;
}

function addLine(text, cls = "line-output") {
  const div = document.createElement("div");
  div.className = `line ${cls}`;
  div.textContent = text;
  terminalOutput.appendChild(div);
  scrollToBottom();
}

function addHTML(html, cls = "line-output") {
  const div = document.createElement("div");
  div.className = `line ${cls}`;
  div.innerHTML = html;
  terminalOutput.appendChild(div);
  scrollToBottom();
}

function addPromptLine(cmd) {
  const path = getPromptPath();
  addLine(`ogrenci@terminal:${path}$ ${cmd}`, "line-cmd");
}

function scrollToBottom() {
  terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

function clearTerminal() {
  terminalOutput.innerHTML = "";
}

// Cursor position tracking
terminalInput.addEventListener("input", updateCursorPosition);
terminalInput.addEventListener("click", updateCursorPosition);
terminalInput.addEventListener("keyup", updateCursorPosition);

function updateCursorPosition() {
  const charWidth = 8.4;
  const pos = terminalInput.selectionStart || terminalInput.value.length;
  cursorBlink.style.left = pos * charWidth + "px";
}

// ─── COMMAND EXECUTION ──────────────────────────
function executeCommand(input) {
  const trimmed = input.trim();
  if (!trimmed) return;

  addPromptLine(trimmed);
  commandHistory.push(trimmed);
  historyIndex = commandHistory.length;

  const parts = trimmed.split(/\s+/);
  const cmd = parts[0].toLowerCase();
  const args = parts.slice(1);

  switch (cmd) {
    case "pwd":
      cmdPwd();
      break;
    case "ls":
      cmdLs(args);
      break;
    case "cd":
      cmdCd(args);
      break;
    case "mkdir":
      cmdMkdir(args);
      break;
    case "clear":
      clearTerminal();
      break;
    case "help":
      cmdHelp();
      break;
    case "cat":
      cmdCat(args);
      break;
    case "whoami":
      addLine("ogrenci", "line-info");
      break;
    case "echo":
      addLine(args.join(" "), "line-output");
      break;
    case "date":
      addLine(new Date().toLocaleString("tr-TR"), "line-info");
      break;
    default:
      addLine(`bash: ${cmd}: komut bulunamadı`, "line-error");
      break;
  }

  // Check lesson after command
  checkLessonProgress(trimmed);
}

function cmdPwd() {
  addLine(cwd, "line-info");
}

function cmdLs(args) {
  const targetPath = args.length > 0 ? resolvePath(args[0]) : cwd;
  const node = getNode(targetPath);
  if (!node) {
    addLine(
      `ls: '${args[0]}' erişilemiyor: Böyle bir dosya veya dizin yok`,
      "line-error",
    );
    return;
  }
  if (node.type !== "dir") {
    addLine(args[0], "line-file");
    return;
  }
  const entries = Object.keys(node.children);
  if (entries.length === 0) {
    addLine("(boş klasör)", "line-output");
    return;
  }
  entries.forEach((name) => {
    const child = node.children[name];
    if (child.type === "dir") {
      addLine(`📁 ${name}/`, "line-dir");
    } else {
      addLine(`📄 ${name}`, "line-file");
    }
  });
}

function cmdCd(args) {
  if (args.length === 0 || args[0] === "~") {
    cwd = "/home/ogrenci";
    updatePrompt();
    return;
  }
  const target = resolvePath(args[0]);
  const node = getNode(target);
  if (!node) {
    addLine(`cd: '${args[0]}': Böyle bir dosya veya dizin yok`, "line-error");
    return;
  }
  if (node.type !== "dir") {
    addLine(`cd: '${args[0]}': Bir dizin değil`, "line-error");
    return;
  }
  cwd = target;
  updatePrompt();
}

function cmdMkdir(args) {
  if (args.length === 0) {
    addLine("mkdir: eksik işlenen (operand)", "line-error");
    addLine("Kullanım: mkdir <klasör_adı>", "line-warning");
    return;
  }
  const dirName = args[0];
  if (dirName.includes("/")) {
    addLine(`mkdir: '${dirName}': Basit bir klasör adı girin`, "line-error");
    return;
  }
  const parentNode = getNode(cwd);
  if (parentNode.children[dirName]) {
    addLine(
      `mkdir: '${dirName}' dizini oluşturulamıyor: Dosya mevcut`,
      "line-warning",
    );
    return;
  }
  parentNode.children[dirName] = { type: "dir", children: {} };
  addLine(`'${dirName}' klasörü oluşturuldu ✓`, "line-success");
}

function cmdCat(args) {
  if (args.length === 0) {
    addLine("cat: eksik dosya adı", "line-error");
    return;
  }
  const target = resolvePath(args[0]);
  const node = getNode(target);
  if (!node) {
    addLine(`cat: '${args[0]}': Böyle bir dosya yok`, "line-error");
    return;
  }
  if (node.type === "dir") {
    addLine(`cat: '${args[0]}': Bir dizin`, "line-error");
    return;
  }
  // Fun fake file contents
  const fileName = args[0].split("/").pop();
  const fakeContents = {
    "hosgeldin.txt":
      "Merhaba! Terminal Macerasına hoş geldin! 🎮\nBurada komut satırının temellerini öğreneceksin.",
    "odevler.txt":
      "📝 Yapılacaklar:\n1. Matematik ödevi\n2. Türkçe kompozisyon\n3. Terminal öğren! ✅",
    "notlar.txt":
      "📓 Ders Notları:\n- Bilgisayar bilimi çok eğlenceli!\n- Terminal = Süper güç 💪",
    "gizli_dosya.txt":
      "🔐 Tebrikler! Gizli dosyayı buldun!\nBu dosyayı sadece gerçek hackerlar bulabilir. 😎",
  };
  const content = fakeContents[fileName] || `[${fileName} dosyasının içeriği]`;
  content.split("\n").forEach((line) => addLine(line, "line-output"));
}

function cmdHelp() {
  addLine("╔══════════════════════════════════╗", "line-info");
  addLine("║   Kullanılabilir Komutlar:       ║", "line-info");
  addLine("╠══════════════════════════════════╣", "line-info");
  addLine("║ pwd    → Hangi klasördesin?      ║", "line-info");
  addLine("║ ls     → Dosyaları listele       ║", "line-info");
  addLine("║ cd     → Klasör değiştir         ║", "line-info");
  addLine("║ mkdir  → Yeni klasör oluştur     ║", "line-info");
  addLine("║ clear  → Ekranı temizle          ║", "line-info");
  addLine("║ cat    → Dosya içeriğini göster   ║", "line-info");
  addLine("║ whoami → Kullanıcı adını göster  ║", "line-info");
  addLine("║ echo   → Mesaj yazdır            ║", "line-info");
  addLine("║ help   → Bu yardım mesajı        ║", "line-info");
  addLine("╚══════════════════════════════════╝", "line-info");
}

// ─── KEYBOARD HANDLING ──────────────────────────
terminalInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    const value = terminalInput.value;
    terminalInput.value = "";
    updateCursorPosition();
    executeCommand(value);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    if (historyIndex > 0) {
      historyIndex--;
      terminalInput.value = commandHistory[historyIndex];
      updateCursorPosition();
    }
  } else if (e.key === "ArrowDown") {
    e.preventDefault();
    if (historyIndex < commandHistory.length - 1) {
      historyIndex++;
      terminalInput.value = commandHistory[historyIndex];
    } else {
      historyIndex = commandHistory.length;
      terminalInput.value = "";
    }
    updateCursorPosition();
  }
});

// Focus input when clicking terminal
document.getElementById("terminal-panel").addEventListener("click", () => {
  terminalInput.focus();
});

// ─── LESSON DEFINITIONS ─────────────────────────
const lessons = [
  {
    chapter: "BÖLÜM 1",
    title: "🗺️ Neredesin? (pwd)",
    narrative: `
            <p>Bir terminali ilk açtığında, kendini karanlık bir ekranın karşısında bulursun. Tıpkı bir oyunda yeni bir dünyaya ışınlanmak gibi! 🎮</p>
            <p>İlk yapman gereken şey: <strong>nerede olduğunu bulmak.</strong></p>
            <p><code>pwd</code> komutu "Print Working Directory" yani <strong>"Çalışma Dizinini Yazdır"</strong> demek. Sana o an hangi klasörde olduğunu söyler.</p>
        `,
    mission:
      "Terminale <code>pwd</code> yaz ve Enter'a bas. Hangi klasördesin, öğren!",
    commandInfo: `
            <code>pwd</code> = Print Working Directory (Çalışma Dizinini Yazdır)
            <span class="cmd-syntax">$ pwd</span>
            Bu komut sana o an bilgisayarın dosya sisteminde nerede olduğunu gösterir. GPS gibi düşün! 📍
        `,
    check: (cmd) => cmd.trim().toLowerCase() === "pwd",
    hint: "Terminale sadece <strong>pwd</strong> yazıp Enter'a bas. Hepsi bu kadar!",
    successMsg:
      'Harika! 🎉 Şu an /home/ogrenci klasöründesin. Bu senin "ev" klasörün — tüm dosyaların burada!',
    xpReward: 50,
    setupCwd: "/home/ogrenci",
  },
  {
    chapter: "BÖLÜM 2",
    title: "👀 Etrafına Bak! (ls)",
    narrative: `
            <p>Artık nerede olduğunu biliyorsun. Ama etrafında neler var? Hangi dosya ve klasörler seni bekliyor? 🤔</p>
            <p><code>ls</code> komutu "List" yani <strong>"Listele"</strong> demek. Bulunduğun klasördeki tüm dosya ve alt klasörleri gösterir.</p>
            <p>Bir odaya girdiğinde etrafına bakmak gibi düşün! 👁️</p>
        `,
    mission: "Terminale <code>ls</code> yaz ve etrafındaki dosyaları keşfet!",
    commandInfo: `
            <code>ls</code> = List (Listele)
            <span class="cmd-syntax">$ ls</span>
            Bulunduğun klasördeki tüm dosya ve klasörleri listeler. 📁 ile başlayanlar klasör, 📄 ile başlayanlar dosyadır.
        `,
    check: (cmd) => cmd.trim().toLowerCase() === "ls",
    hint: "Terminale <strong>ls</strong> yaz ve Enter'a bas. Klasördeki dosyaları göreceksin!",
    successMsg:
      "Süper! 🌟 Gördün mü? Belgeler, resimler, müzik, projeler klasörlerin ve bazı dosyaların var. Bir hacker gibi keşfediyorsun!",
    xpReward: 50,
    setupCwd: "/home/ogrenci",
  },
  {
    chapter: "BÖLÜM 3",
    title: "🚶 Klasör Değiştir (cd)",
    narrative: `
            <p>Etrafını gördün, şimdi hareket etme zamanı! Bir klasörün içine girmek istiyorsan <code>cd</code> komutunu kullanırsın. 🚪</p>
            <p><code>cd</code> = "Change Directory" yani <strong>"Dizin Değiştir"</strong> demek.</p>
            <p>Örneğin <code>cd belgeler</code> yazarsan, "belgeler" klasörünün içine girersin.</p>
        `,
    mission:
      "<code>belgeler</code> klasörüne gir! Terminale <code>cd belgeler</code> yaz.",
    commandInfo: `
            <code>cd</code> = Change Directory (Dizin Değiştir)
            <span class="cmd-syntax">$ cd klasor_adi</span>
            Bir klasörün içine girmek için kullanılır. Geri çıkmak için <code>cd ..</code> kullanabilirsin.
        `,
    check: (cmd) => cmd.trim().toLowerCase() === "cd belgeler",
    hint: "Terminale <strong>cd belgeler</strong> yaz (cd ile belgeler arasında boşluk var!). Sonra <strong>pwd</strong> ile kontrol edebilirsin.",
    successMsg:
      'Tamam! 🚀 "belgeler" klasörüne girdin! Artık cd komutuyla istediğin yere gidebilirsin. Geri dönmek için cd .. yazabilirsin.',
    xpReward: 75,
    setupCwd: "/home/ogrenci",
  },
  {
    chapter: "BÖLÜM 4",
    title: "🏗️ Klasör Oluştur (mkdir)",
    narrative: `
            <p>Şimdi gerçek bir yaratıcı ol! Kendi klasörünü oluşturma zamanı geldi. 🎨</p>
            <p><code>mkdir</code> = "Make Directory" yani <strong>"Dizin Oluştur"</strong> demek.</p>
            <p>Yeni bir proje başlatmak istiyorsan, önce onun için bir klasör oluşturmalısın!</p>
        `,
    mission:
      '"oyunlar" adında yeni bir klasör oluştur! Terminale <code>mkdir oyunlar</code> yaz.',
    commandInfo: `
            <code>mkdir</code> = Make Directory (Dizin Oluştur)
            <span class="cmd-syntax">$ mkdir klasor_adi</span>
            Yeni bir boş klasör oluşturur. Klasör adında boşluk kullanmaktan kaçın!
        `,
    check: (cmd) => cmd.trim().toLowerCase() === "mkdir oyunlar",
    hint: "Terminale <strong>mkdir oyunlar</strong> yaz. mkdir ile oyunlar arasında boşluk olmalı!",
    successMsg:
      'Müthiş! 🏗️ "oyunlar" klasörünü oluşturdun! ls yazarak kontrol edebilirsin. Artık dosya sistemi senin oyun alanın!',
    xpReward: 75,
    setupCwd: "/home/ogrenci",
  },
  {
    chapter: "BÖLÜM 5",
    title: "🧹 Ekranı Temizle (clear)",
    narrative: `
            <p>Terminalde çok fazla yazı biriktiğinde ekran karışabilir. Endişelenme! 😅</p>
            <p><code>clear</code> komutu ekranı tertemiz yapar. Tıpkı bir tahtayı silmek gibi!</p>
            <p>Not: clear komutu sadece ekranı temizler, dosyalarına dokunmaz. Her şey güvende! 🔒</p>
        `,
    mission: "Terminali temizle! <code>clear</code> komutunu yaz.",
    commandInfo: `
            <code>clear</code> = Temizle
            <span class="cmd-syntax">$ clear</span>
            Terminal ekranındaki tüm yazıları siler ve temiz bir ekranla başlaman sağlar. Dosyalara dokunmaz!
        `,
    check: (cmd) => cmd.trim().toLowerCase() === "clear",
    hint: "Terminale sadece <strong>clear</strong> yaz ve Enter'a bas!",
    successMsg:
      "Temiz ekran, temiz zihin! 🧹✨ clear komutu en çok kullanacağın komutlardan biri olacak!",
    xpReward: 50,
    setupCwd: "/home/ogrenci",
  },
  {
    chapter: "FİNAL GÖREVİ",
    title: "🏆 Büyük Macera!",
    narrative: `
            <p>Tüm temel komutları öğrendin! Şimdi hepsini bir arada kullanma zamanı. 💪</p>
            <p>Sana bir görev veriyorum: <strong>projeler</strong> klasörüne gir ve orada neler olduğunu keşfet!</p>
            <p>İpucu: Önce <code>cd</code> ile klasöre gir, sonra <code>ls</code> ile içindekilere bak!</p>
        `,
    mission:
      "Önce ana klasöre dön (<code>cd ~</code>), sonra <code>projeler</code> klasörüne git ve <code>ls</code> ile içindekilere bak! Sırayla: <code>cd ~</code> → <code>cd projeler</code> → <code>ls</code>",
    commandInfo: `
            Birden fazla komutu sırayla kullanabilirsin!
            <span class="cmd-syntax">$ cd ~        (ev klasörüne dön)</span>
            <span class="cmd-syntax">$ cd projeler (projeler klasörüne gir)</span>
            <span class="cmd-syntax">$ ls          (içindekileri listele)</span>
        `,
    check: null, // Multi-step: handled by subSteps
    subSteps: [
      {
        check: (cmd) => cmd.trim() === "cd ~" || cmd.trim() === "cd",
        stepMsg: '✓ Ev klasörüne döndün! Şimdi "cd projeler" yaz.',
      },
      {
        check: (cmd) => cmd.trim().toLowerCase() === "cd projeler",
        stepMsg: '✓ Projeler klasörüne girdin! Şimdi "ls" yaz.',
      },
      { check: (cmd) => cmd.trim().toLowerCase() === "ls", stepMsg: null },
    ],
    currentSubStep: 0,
    hint: "Sırayla yap: Önce <strong>cd ~</strong> (ev klasörüne dön), sonra <strong>cd projeler</strong>, sonra <strong>ls</strong>.",
    successMsg:
      "EFSANE! 🏆🎮 Tüm komutları ustaca kullandın! Artık terminali fetheden bir yazılımcısın!",
    xpReward: 100,
    setupCwd: "/home/ogrenci/belgeler",
  },
];

// ─── LESSON RENDERING ───────────────────────────
const elChapterBadge = document.querySelector(".chapter-number");
const elTitle = document.getElementById("lesson-title");
const elNarrative = document.getElementById("lesson-narrative");
const elMissionText = document.getElementById("mission-text");
const elCommandInfo = document.getElementById("command-info-content");
const elHintArea = document.getElementById("hint-area");
const elHintText = document.getElementById("hint-text");
const elSuccessMsg = document.getElementById("success-message");
const elSuccessText = document.getElementById("success-text");
const elSuccessXp = document.getElementById("success-xp");
const elBtnNext = document.getElementById("btn-next");
const elBtnHint = document.getElementById("btn-hint");
const elProgressFill = document.getElementById("progress-bar-fill");
const elProgressText = document.getElementById("progress-text");
const elXpCount = document.getElementById("xp-count");

function loadLesson(index) {
  if (index >= lessons.length) {
    showCompletion();
    return;
  }
  const lesson = lessons[index];
  currentLessonIndex = index;
  stepCompleted = false;

  // Reset sub-steps for final lesson
  if (lesson.subSteps) lesson.currentSubStep = 0;

  // Set cwd if defined
  if (lesson.setupCwd) {
    cwd = lesson.setupCwd;
    updatePrompt();
  }

  // Update UI
  elChapterBadge.textContent = lesson.chapter;
  elTitle.textContent = lesson.title;
  elNarrative.innerHTML = lesson.narrative;
  elMissionText.innerHTML = lesson.mission;
  elCommandInfo.innerHTML = lesson.commandInfo;

  // Hide feedback
  elHintArea.classList.add("hidden");
  elSuccessMsg.classList.add("hidden");

  // Disable next button
  elBtnNext.classList.add("disabled");
  elBtnNext.disabled = true;

  // Update progress
  updateProgress();

  // Scroll lesson to top
  document.querySelector(".lesson-scroll-area").scrollTop = 0;

  // Focus terminal
  terminalInput.focus();
}

function updateProgress() {
  const total = lessons.length;
  const done = currentLessonIndex;
  const pct = (done / total) * 100;
  elProgressFill.style.width = pct + "%";
  elProgressText.textContent = `${done} / ${total}`;
}

function addXP(amount) {
  xp += amount;
  elXpCount.textContent = xp;
  elXpCount.classList.remove("xp-gained");
  void elXpCount.offsetWidth; // trigger reflow
  elXpCount.classList.add("xp-gained");
}

// ─── LESSON PROGRESS CHECK ──────────────────────
function checkLessonProgress(cmd) {
  if (stepCompleted) return;
  const lesson = lessons[currentLessonIndex];
  if (!lesson) return;

  // Multi-step lesson (final)
  if (lesson.subSteps) {
    const sub = lesson.subSteps[lesson.currentSubStep];
    if (sub && sub.check(cmd)) {
      if (sub.stepMsg) {
        addLine(sub.stepMsg, "line-success");
      }
      lesson.currentSubStep++;
      if (lesson.currentSubStep >= lesson.subSteps.length) {
        onLessonComplete(lesson);
      }
    } else {
      showErrorHint(cmd, lesson);
    }
    return;
  }

  // Single-step lesson
  if (lesson.check(cmd)) {
    onLessonComplete(lesson);
  } else {
    showErrorHint(cmd, lesson);
  }
}

function onLessonComplete(lesson) {
  stepCompleted = true;
  totalCommandsLearned++;

  // Show success in terminal
  addLine("");
  addLine("═══════════════════════════════════", "line-success");
  addLine("  ✅ GÖREV TAMAMLANDI!", "line-success");
  addLine("═══════════════════════════════════", "line-success");
  addLine("");

  // Show success in lesson panel
  elSuccessText.textContent = lesson.successMsg;
  elSuccessXp.textContent = `+${lesson.xpReward} XP`;
  elSuccessMsg.classList.remove("hidden");

  // Add XP
  addXP(lesson.xpReward);

  // Enable next button
  elBtnNext.classList.remove("disabled");
  elBtnNext.disabled = false;

  // Hide hint
  elHintArea.classList.add("hidden");
}

function showErrorHint(cmd, lesson) {
  const trimmed = cmd.trim().toLowerCase();

  // Context-aware hints
  let hintMsg = "";
  if (trimmed === "") return;

  if (lesson.check && lesson.check === lessons[0].check && trimmed !== "pwd") {
    hintMsg = `"${cmd}" komutu şu an aradığımız değil. Terminale <strong>pwd</strong> yazmayı dene!`;
  } else if (
    lesson.check &&
    lesson.check === lessons[1].check &&
    trimmed !== "ls"
  ) {
    hintMsg = `Hmm, <strong>ls</strong> komutunu denedin mi? Etrafındaki dosyaları görmek için <strong>ls</strong> yaz!`;
  } else if (lesson.subSteps) {
    const subIdx = lesson.currentSubStep;
    if (subIdx === 0) hintMsg = "Önce eve dönelim! <strong>cd ~</strong> yaz.";
    else if (subIdx === 1)
      hintMsg = "Şimdi projeler klasörüne gir: <strong>cd projeler</strong>";
    else
      hintMsg = "Son adım! İçindekileri görmek için <strong>ls</strong> yaz.";
  } else {
    hintMsg = lesson.hint;
  }

  elHintText.innerHTML = hintMsg;
  elHintArea.classList.remove("hidden");
}

// ─── BUTTON HANDLERS ────────────────────────────
elBtnHint.addEventListener("click", () => {
  const lesson = lessons[currentLessonIndex];
  if (lesson) {
    elHintText.innerHTML = lesson.hint;
    elHintArea.classList.remove("hidden");
  }
});

elBtnNext.addEventListener("click", () => {
  if (stepCompleted) {
    loadLesson(currentLessonIndex + 1);
  }
});

// ─── COMPLETION ─────────────────────────────────
function showCompletion() {
  // Update progress to 100%
  elProgressFill.style.width = "100%";
  elProgressText.textContent = `${lessons.length} / ${lessons.length}`;

  document.getElementById("final-xp").textContent = xp;
  document.getElementById("final-commands").textContent = totalCommandsLearned;
  document.getElementById("completion-modal").classList.remove("hidden");
}

document.getElementById("btn-restart").addEventListener("click", () => {
  document.getElementById("completion-modal").classList.add("hidden");
  xp = 0;
  totalCommandsLearned = 0;
  elXpCount.textContent = "0";
  commandHistory = [];
  historyIndex = -1;
  clearTerminal();
  // Reset file system (re-add oyunlar might be present)
  const ogrenciNode = getNode("/home/ogrenci");
  if (ogrenciNode && ogrenciNode.children["oyunlar"]) {
    delete ogrenciNode.children["oyunlar"];
  }
  loadLesson(0);
  showWelcome();
});

// ─── WELCOME MESSAGE ────────────────────────────
function showWelcome() {
  addLine("", "line-ascii");
  addLine("  ╔════════════════════════════════════════╗", "line-ascii");
  addLine("  ║                                        ║", "line-ascii");
  addLine("  ║   ⌨️  TERMINAL MACERASINA               ║", "line-ascii");
  addLine("  ║       HOŞ GELDİN!                      ║", "line-ascii");
  addLine("  ║                                        ║", "line-ascii");
  addLine("  ║   Komut satırını öğrenmeye              ║", "line-ascii");
  addLine("  ║   hazır mısın? 🚀                      ║", "line-ascii");
  addLine("  ║                                        ║", "line-ascii");
  addLine('  ║   İpucu: "help" yazarak                ║', "line-ascii");
  addLine("  ║   tüm komutları görebilirsin.          ║", "line-ascii");
  addLine("  ║                                        ║", "line-ascii");
  addLine("  ╚════════════════════════════════════════╝", "line-ascii");
  addLine("", "line-ascii");
}

// ─── INIT ───────────────────────────────────────
function init() {
  updatePrompt();
  showWelcome();
  loadLesson(0);
}

init();
