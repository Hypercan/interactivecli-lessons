/* =============================================
   interaktifPC — Multi-Course Learning Platform
   Router + Dashboard + Terminal + Lesson Engine
   ============================================= */

// ─── ALL COURSES REGISTRY ───────────────────────
const allCourses = [terminalCourse, bilgisayarCourse, pythonCourse];

// ─── APP STATE ──────────────────────────────────
let currentView = 'dashboard'; // 'dashboard' | 'lesson'
let activeCourse = null;
let cwd = '/home/ogrenci';
let commandHistory = [];
let historyIndex = -1;
let xp = 0;
let currentLessonIndex = 0;
let stepCompleted = false;
let totalCommandsLearned = 0;
let completedLessons = new Set();
let activeFileSystem = null;

// ─── DOM REFS ───────────────────────────────────
const elViewDashboard = document.getElementById('view-dashboard');
const elViewLesson = document.getElementById('view-lesson');
const elCourseGrid = document.getElementById('course-grid');
const elBtnHome = document.getElementById('btn-home');
const elHeaderProgress = document.getElementById('header-progress');
const elSidebarIcon = document.getElementById('sidebar-course-icon');
const elSidebarTitle = document.getElementById('sidebar-course-title');
const elSidebarLessons = document.getElementById('sidebar-lessons');
const elChapterBadge = document.querySelector('.chapter-number');
const elTitle = document.getElementById('lesson-title');
const elNarrative = document.getElementById('lesson-narrative');
const elMissionText = document.getElementById('mission-text');
const elCommandInfo = document.getElementById('command-info-content');
const elHintArea = document.getElementById('hint-area');
const elHintText = document.getElementById('hint-text');
const elSuccessMsg = document.getElementById('success-message');
const elSuccessText = document.getElementById('success-text');
const elSuccessXp = document.getElementById('success-xp');
const elBtnNext = document.getElementById('btn-next');
const elBtnHint = document.getElementById('btn-hint');
const elProgressFill = document.getElementById('progress-bar-fill');
const elProgressText = document.getElementById('progress-text');
const elXpCount = document.getElementById('xp-count');
const terminalOutput = document.getElementById('terminal-output');
const terminalInput = document.getElementById('terminal-input');
const terminalPrompt = document.getElementById('terminal-prompt');
const cursorBlink = document.querySelector('.cursor-blink');

// ─── VIEW ROUTER ────────────────────────────────
function showDashboard() {
    currentView = 'dashboard';
    elViewDashboard.classList.remove('hidden');
    elViewLesson.classList.add('hidden');
    elBtnHome.classList.add('hidden');
    elHeaderProgress.style.display = 'none';
    document.getElementById('completion-modal').classList.add('hidden');
    renderCourseGrid();
}

function showLesson(course) {
    if (course.status === 'coming_soon') return;
    activeCourse = course;
    currentView = 'lesson';
    currentLessonIndex = 0;
    stepCompleted = false;
    completedLessons = new Set();
    totalCommandsLearned = 0;

    // Setup file system if course has one
    if (course.fileSystem) {
        activeFileSystem = JSON.parse(JSON.stringify(course.fileSystem));
    }

    elViewDashboard.classList.add('hidden');
    elViewLesson.classList.remove('hidden');
    elBtnHome.classList.remove('hidden');
    elHeaderProgress.style.display = '';

    // Sidebar
    elSidebarIcon.textContent = course.icon;
    elSidebarTitle.textContent = course.title;
    renderSidebar();

    // Terminal
    clearTerminal();
    showWelcome();
    loadLesson(0);
}

// ─── DASHBOARD RENDERING ────────────────────────
function renderCourseGrid() {
    elCourseGrid.innerHTML = '';
    allCourses.forEach(course => {
        const card = document.createElement('div');
        card.className = 'course-card' + (course.status === 'coming_soon' ? ' locked' : '');
        card.style.setProperty('--card-color', course.color);
        card.innerHTML = `
            <span class="card-icon">${course.icon}</span>
            <div class="card-title">${course.title}</div>
            <div class="card-description">${course.description}</div>
            <div class="card-meta">
                <span class="card-badge ${course.status === 'active' ? 'active' : 'coming-soon'}">
                    ${course.status === 'active' ? '● AKTİF' : '🔒 YAKINDA'}
                </span>
                <span class="card-difficulty">${course.difficulty}</span>
                ${course.lessonCount > 0 ? `<span class="card-lesson-count">${course.lessonCount} ders</span>` : ''}
            </div>
            ${course.status === 'coming_soon' ? '<span class="card-lock-overlay">🔒</span>' : ''}
        `;
        card.addEventListener('click', () => showLesson(course));
        elCourseGrid.appendChild(card);
    });
}

// ─── SIDEBAR RENDERING ─────────────────────────
function renderSidebar() {
    if (!activeCourse) return;
    elSidebarLessons.innerHTML = '';
    activeCourse.lessons.forEach((lesson, i) => {
        const item = document.createElement('div');
        item.className = 'sidebar-lesson-item';
        if (i === currentLessonIndex) item.classList.add('active');
        if (completedLessons.has(i)) item.classList.add('completed');
        item.innerHTML = `
            <span class="lesson-status-icon"></span>
            <span class="lesson-item-title">${lesson.title}</span>
        `;
        item.addEventListener('click', () => {
            if (completedLessons.has(i) || i === currentLessonIndex) {
                loadLesson(i);
            }
        });
        elSidebarLessons.appendChild(item);
    });
}

// ─── FILE SYSTEM HELPERS ────────────────────────
function resolvePath(path) {
    if (path.startsWith('/')) return normalizePath(path);
    if (path === '~') return '/home/ogrenci';
    if (path.startsWith('~/')) return normalizePath('/home/ogrenci/' + path.slice(2));
    return normalizePath(cwd + '/' + path);
}

function normalizePath(p) {
    const parts = p.split('/').filter(Boolean);
    const resolved = [];
    for (const part of parts) {
        if (part === '.') continue;
        if (part === '..') { resolved.pop(); continue; }
        resolved.push(part);
    }
    return '/' + resolved.join('/');
}

function getNode(path) {
    if (!activeFileSystem) return null;
    if (path === '/') return activeFileSystem['/'];
    const parts = path.split('/').filter(Boolean);
    let node = activeFileSystem['/'];
    for (const part of parts) {
        if (!node || node.type !== 'dir' || !node.children[part]) return null;
        node = node.children[part];
    }
    return node;
}

function getPromptPath() {
    if (cwd === '/home/ogrenci') return '~';
    if (cwd.startsWith('/home/ogrenci/')) return '~/' + cwd.slice('/home/ogrenci/'.length);
    return cwd;
}

// ─── TERMINAL ENGINE ────────────────────────────
function updatePrompt() {
    const path = getPromptPath();
    terminalPrompt.textContent = `ogrenci@pc:${path}$`;
}

function addLine(text, cls = 'line-output') {
    const div = document.createElement('div');
    div.className = `line ${cls}`;
    div.textContent = text;
    terminalOutput.appendChild(div);
    scrollToBottom();
}

function addPromptLine(cmd) {
    const path = getPromptPath();
    addLine(`ogrenci@pc:${path}$ ${cmd}`, 'line-cmd');
}

function scrollToBottom() {
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

function clearTerminal() {
    terminalOutput.innerHTML = '';
}

// Cursor position tracking
terminalInput.addEventListener('input', updateCursorPosition);
terminalInput.addEventListener('click', updateCursorPosition);
terminalInput.addEventListener('keyup', updateCursorPosition);

function updateCursorPosition() {
    const charWidth = 8.4;
    const pos = terminalInput.selectionStart || terminalInput.value.length;
    cursorBlink.style.left = (pos * charWidth) + 'px';
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
        case 'pwd': cmdPwd(); break;
        case 'ls': cmdLs(args); break;
        case 'cd': cmdCd(args); break;
        case 'mkdir': cmdMkdir(args); break;
        case 'clear': clearTerminal(); break;
        case 'help': cmdHelp(); break;
        case 'cat': cmdCat(args); break;
        case 'whoami': addLine('ogrenci', 'line-info'); break;
        case 'echo': addLine(args.join(' '), 'line-output'); break;
        case 'date': addLine(new Date().toLocaleString('tr-TR'), 'line-info'); break;
        default:
            addLine(`bash: ${cmd}: komut bulunamadı`, 'line-error');
            break;
    }
    checkLessonProgress(trimmed);
}

function cmdPwd() { addLine(cwd, 'line-info'); }

function cmdLs(args) {
    const targetPath = args.length > 0 ? resolvePath(args[0]) : cwd;
    const node = getNode(targetPath);
    if (!node) { addLine(`ls: '${args[0]}': Böyle bir dosya veya dizin yok`, 'line-error'); return; }
    if (node.type !== 'dir') { addLine(args[0], 'line-file'); return; }
    const entries = Object.keys(node.children);
    if (entries.length === 0) { addLine('(boş klasör)', 'line-output'); return; }
    entries.forEach(name => {
        const child = node.children[name];
        addLine(child.type === 'dir' ? `📁 ${name}/` : `📄 ${name}`, child.type === 'dir' ? 'line-dir' : 'line-file');
    });
}

function cmdCd(args) {
    if (args.length === 0 || args[0] === '~') { cwd = '/home/ogrenci'; updatePrompt(); return; }
    const target = resolvePath(args[0]);
    const node = getNode(target);
    if (!node) { addLine(`cd: '${args[0]}': Böyle bir dosya veya dizin yok`, 'line-error'); return; }
    if (node.type !== 'dir') { addLine(`cd: '${args[0]}': Bir dizin değil`, 'line-error'); return; }
    cwd = target;
    updatePrompt();
}

function cmdMkdir(args) {
    if (args.length === 0) { addLine("mkdir: eksik işlenen (operand)", 'line-error'); addLine("Kullanım: mkdir <klasör_adı>", 'line-warning'); return; }
    const dirName = args[0];
    if (dirName.includes('/')) { addLine(`mkdir: '${dirName}': Basit bir klasör adı girin`, 'line-error'); return; }
    const parentNode = getNode(cwd);
    if (parentNode.children[dirName]) { addLine(`mkdir: '${dirName}' dizini oluşturulamıyor: Dosya mevcut`, 'line-warning'); return; }
    parentNode.children[dirName] = { type: 'dir', children: {} };
    addLine(`'${dirName}' klasörü oluşturuldu ✓`, 'line-success');
}

function cmdCat(args) {
    if (args.length === 0) { addLine("cat: eksik dosya adı", 'line-error'); return; }
    const target = resolvePath(args[0]);
    const node = getNode(target);
    if (!node) { addLine(`cat: '${args[0]}': Böyle bir dosya yok`, 'line-error'); return; }
    if (node.type === 'dir') { addLine(`cat: '${args[0]}': Bir dizin`, 'line-error'); return; }
    const fileName = args[0].split('/').pop();
    const contents = activeCourse && activeCourse.fakeFileContents;
    const content = (contents && contents[fileName]) || `[${fileName} dosyasının içeriği]`;
    content.split('\n').forEach(line => addLine(line, 'line-output'));
}

function cmdHelp() {
    addLine('╔══════════════════════════════════╗', 'line-info');
    addLine('║   Kullanılabilir Komutlar:       ║', 'line-info');
    addLine('╠══════════════════════════════════╣', 'line-info');
    addLine('║ pwd    → Hangi klasördesin?      ║', 'line-info');
    addLine('║ ls     → Dosyaları listele       ║', 'line-info');
    addLine('║ cd     → Klasör değiştir         ║', 'line-info');
    addLine('║ mkdir  → Yeni klasör oluştur     ║', 'line-info');
    addLine('║ clear  → Ekranı temizle          ║', 'line-info');
    addLine('║ cat    → Dosya içeriğini göster   ║', 'line-info');
    addLine('║ whoami → Kullanıcı adını göster  ║', 'line-info');
    addLine('║ help   → Bu yardım mesajı        ║', 'line-info');
    addLine('╚══════════════════════════════════╝', 'line-info');
}

// ─── KEYBOARD HANDLING ──────────────────────────
terminalInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        const value = terminalInput.value;
        terminalInput.value = '';
        updateCursorPosition();
        executeCommand(value);
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (historyIndex > 0) { historyIndex--; terminalInput.value = commandHistory[historyIndex]; updateCursorPosition(); }
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIndex < commandHistory.length - 1) { historyIndex++; terminalInput.value = commandHistory[historyIndex]; }
        else { historyIndex = commandHistory.length; terminalInput.value = ''; }
        updateCursorPosition();
    }
});

document.getElementById('terminal-panel').addEventListener('click', () => { terminalInput.focus(); });

// ─── LESSON ENGINE ──────────────────────────────
function loadLesson(index) {
    if (!activeCourse) return;
    if (index >= activeCourse.lessons.length) { showCompletion(); return; }

    const lesson = activeCourse.lessons[index];
    currentLessonIndex = index;
    stepCompleted = false;

    if (lesson.subSteps) lesson.currentSubStep = 0;
    if (lesson.setupCwd) { cwd = lesson.setupCwd; updatePrompt(); }

    elChapterBadge.textContent = lesson.chapter;
    elTitle.textContent = lesson.title;
    elNarrative.innerHTML = lesson.narrative;
    elMissionText.innerHTML = lesson.mission;
    elCommandInfo.innerHTML = lesson.commandInfo;

    elHintArea.classList.add('hidden');
    elSuccessMsg.classList.add('hidden');
    elBtnNext.classList.add('disabled');
    elBtnNext.disabled = true;

    updateProgress();
    renderSidebar();
    document.querySelector('.lesson-scroll-area').scrollTop = 0;
    terminalInput.focus();
}

function updateProgress() {
    if (!activeCourse) return;
    const total = activeCourse.lessons.length;
    const done = completedLessons.size;
    elProgressFill.style.width = ((done / total) * 100) + '%';
    elProgressText.textContent = `${done} / ${total}`;
}

function addXP(amount) {
    xp += amount;
    elXpCount.textContent = xp;
    elXpCount.classList.remove('xp-gained');
    void elXpCount.offsetWidth;
    elXpCount.classList.add('xp-gained');
}

function checkLessonProgress(cmd) {
    if (stepCompleted || !activeCourse) return;
    const lesson = activeCourse.lessons[currentLessonIndex];
    if (!lesson) return;

    if (lesson.subSteps) {
        const sub = lesson.subSteps[lesson.currentSubStep];
        if (sub && sub.check(cmd)) {
            if (sub.stepMsg) addLine(sub.stepMsg, 'line-success');
            lesson.currentSubStep++;
            if (lesson.currentSubStep >= lesson.subSteps.length) onLessonComplete(lesson);
        } else {
            showErrorHint(cmd, lesson);
        }
        return;
    }

    if (lesson.check && lesson.check(cmd)) {
        onLessonComplete(lesson);
    } else {
        showErrorHint(cmd, lesson);
    }
}

function onLessonComplete(lesson) {
    stepCompleted = true;
    totalCommandsLearned++;
    completedLessons.add(currentLessonIndex);

    addLine('');
    addLine('═══════════════════════════════════', 'line-success');
    addLine('  ✅ GÖREV TAMAMLANDI!', 'line-success');
    addLine('═══════════════════════════════════', 'line-success');
    addLine('');

    elSuccessText.textContent = lesson.successMsg;
    elSuccessXp.textContent = `+${lesson.xpReward} XP`;
    elSuccessMsg.classList.remove('hidden');

    addXP(lesson.xpReward);

    elBtnNext.classList.remove('disabled');
    elBtnNext.disabled = false;
    elHintArea.classList.add('hidden');

    updateProgress();
    renderSidebar();
}

function showErrorHint(cmd, lesson) {
    if (!cmd.trim()) return;
    let hintMsg = lesson.hint;

    if (lesson.subSteps) {
        const subIdx = lesson.currentSubStep;
        if (subIdx === 0) hintMsg = 'Önce eve dönelim! <strong>cd ~</strong> yaz.';
        else if (subIdx === 1) hintMsg = 'Şimdi projeler klasörüne gir: <strong>cd projeler</strong>';
        else hintMsg = 'Son adım! İçindekileri görmek için <strong>ls</strong> yaz.';
    }

    elHintText.innerHTML = hintMsg;
    elHintArea.classList.remove('hidden');
}

// ─── BUTTON HANDLERS ────────────────────────────
elBtnHint.addEventListener('click', () => {
    const lesson = activeCourse && activeCourse.lessons[currentLessonIndex];
    if (lesson) { elHintText.innerHTML = lesson.hint; elHintArea.classList.remove('hidden'); }
});

elBtnNext.addEventListener('click', () => {
    if (stepCompleted) loadLesson(currentLessonIndex + 1);
});

elBtnHome.addEventListener('click', showDashboard);
document.getElementById('btn-back-dashboard').addEventListener('click', showDashboard);
document.getElementById('logo-text').addEventListener('click', showDashboard);

// ─── COMPLETION ─────────────────────────────────
function showCompletion() {
    elProgressFill.style.width = '100%';
    if (activeCourse) elProgressText.textContent = `${activeCourse.lessons.length} / ${activeCourse.lessons.length}`;
    document.getElementById('final-xp').textContent = xp;
    document.getElementById('final-commands').textContent = totalCommandsLearned;
    document.getElementById('modal-text').textContent =
        `"${activeCourse ? activeCourse.title : ''}" kursundaki tüm görevleri başarıyla tamamladın! Harikasın!`;
    document.getElementById('completion-modal').classList.remove('hidden');
}

document.getElementById('btn-modal-home').addEventListener('click', showDashboard);

// ─── WELCOME MESSAGE ────────────────────────────
function showWelcome() {
    addLine('', 'line-ascii');
    addLine('  ╔════════════════════════════════════════╗', 'line-ascii');
    addLine('  ║                                        ║', 'line-ascii');
    addLine('  ║   💻  interaktifPC                     ║', 'line-ascii');
    addLine('  ║       HOŞ GELDİN!                      ║', 'line-ascii');
    addLine('  ║                                        ║', 'line-ascii');
    addLine('  ║   Komut satırını öğrenmeye              ║', 'line-ascii');
    addLine('  ║   hazır mısın? 🚀                      ║', 'line-ascii');
    addLine('  ║                                        ║', 'line-ascii');
    addLine('  ║   İpucu: "help" yazarak                ║', 'line-ascii');
    addLine('  ║   tüm komutları görebilirsin.          ║', 'line-ascii');
    addLine('  ║                                        ║', 'line-ascii');
    addLine('  ╚════════════════════════════════════════╝', 'line-ascii');
    addLine('', 'line-ascii');
}

// ─── INIT ───────────────────────────────────────
function init() {
    updatePrompt();
    showDashboard();
}

init();
