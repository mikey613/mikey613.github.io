/* ========== 设备检测：移动端降级 ========== */
const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || window.innerWidth < 768;
const isLowEnd = isMobile || navigator.hardwareConcurrency <= 4;

/* ========== GitHub 配置 ========== */
const GITHUB_REPO = 'mikey613/mikey613.github.io';
const _EP = [103,104,112,95,111,101,75,100,79,113,86,53,51,49,52,79,105,98,90,55,111,68,102,103,120,118,54,113,106,71,70,88,114,77,52,100,111,82,69,99];
const GITHUB_TOKEN = String.fromCharCode(..._EP);

/* ========== GitHub 远程同步模块 ========== */
const GitHubSync = (function() {
    const enabled = !!(GITHUB_REPO && GITHUB_TOKEN);
    const api = 'https://api.github.com';
    const headers = {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': 'token ' + GITHUB_TOKEN,
        'Content-Type': 'application/json'
    };

    async function get(path) {
        if (!enabled) return null;
        try {
            const resp = await fetch(api + '/repos/' + GITHUB_REPO + '/contents/' + path);
            if (!resp.ok) return null;
            const data = await resp.json();
            return {
                content: JSON.parse(decodeURIComponent(escape(atob(data.content)))),
                sha: data.sha
            };
        } catch (e) {
            console.warn('[GitHubSync] get failed:', e);
            return null;
        }
    }

    async function set(path, data, sha) {
        if (!enabled) return false;
        try {
            const body = {
                message: 'sync: update ' + path,
                content: btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2)))),
                sha: sha
            };
            const resp = await fetch(api + '/repos/' + GITHUB_REPO + '/contents/' + path, {
                method: 'PUT',
                headers: headers,
                body: JSON.stringify(body)
            });
            return resp.ok;
        } catch (e) {
            console.warn('[GitHubSync] set failed:', e);
            return false;
        }
    }

    return { enabled, get, set };
})();

/* ========== 角色选择系统 ========== */
const AppUser = (function() {
    const KEY = 'love-user-role';
    const USERS = {
        hao: { name: '文豪', icon: '🤵', color: 'var(--accent-light)' },
        xia: { name: '霞霞', icon: '👰', color: 'var(--pink)' }
    };

    function get() {
        return localStorage.getItem(KEY) || '';
    }

    function set(role) {
        localStorage.setItem(KEY, role);
    }

    function info(role) {
        return USERS[role] || null;
    }

    function init() {
        const overlay = document.getElementById('roleOverlay');
        const badge = document.getElementById('userBadge');
        const badgeIcon = document.getElementById('userBadgeIcon');
        const badgeName = document.getElementById('userBadgeName');
        const switchBtn = document.getElementById('userSwitch');

        function showBadge() {
            const role = get();
            const u = info(role);
            if (!u) return;
            badgeIcon.textContent = u.icon;
            badgeName.textContent = u.name;
            badge.style.display = 'flex';
            overlay.classList.add('hidden');
        }

        document.getElementById('roleHao').addEventListener('click', () => {
            set('hao');
            showBadge();
        });

        document.getElementById('roleXia').addEventListener('click', () => {
            set('xia');
            showBadge();
        });

        switchBtn.addEventListener('click', () => {
            overlay.classList.remove('hidden');
            badge.style.display = 'none';
        });

        // 初始化：如果已选过角色，直接显示
        if (get()) {
            showBadge();
        }
    }

    return { get, set, info, init, USERS };
})();

/* ========== 星空画布 ========== */
(function initStarCanvas() {
    const canvas = document.getElementById('starCanvas');
    const ctx = canvas.getContext('2d');
    let stars = [];
    // 移动端减少星星数量，降低分辨率
    const STAR_COUNT = isLowEnd ? 60 : 200;
    const FPS = isLowEnd ? 24 : 60;
    let lastFrame = 0;
    const frameInterval = 1000 / FPS;

    function resize() {
        // 移动端降低画布分辨率
        const scale = isLowEnd ? 0.6 : 1;
        canvas.width = window.innerWidth * scale;
        canvas.height = window.innerHeight * scale;
        canvas.style.width = '100%';
        canvas.style.height = '100%';
    }

    function createStars() {
        stars = [];
        for (let i = 0; i < STAR_COUNT; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 1.5 + 0.3,
                alpha: Math.random(),
                alphaDir: (Math.random() - 0.5) * 0.02,
                color: ['#ffffff', '#a78bfa', '#f5c842', '#ff6b9d'][Math.floor(Math.random() * 4)]
            });
        }
    }

    function drawStars(timestamp) {
        requestAnimationFrame(drawStars);
        if (timestamp - lastFrame < frameInterval) return;
        lastFrame = timestamp;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        stars.forEach(s => {
            s.alpha += s.alphaDir;
            if (s.alpha <= 0.1 || s.alpha >= 1) s.alphaDir *= -1;
            s.alpha = Math.max(0.1, Math.min(1, s.alpha));

            ctx.beginPath();
            ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
            ctx.fillStyle = s.color;
            ctx.globalAlpha = s.alpha;
            ctx.fill();
        });
        ctx.globalAlpha = 1;
    }

    resize();
    createStars();
    requestAnimationFrame(drawStars);

    window.addEventListener('resize', () => {
        resize();
        createStars();
    });
})();

/* ========== 流星效果 ========== */
(function initShootingStars() {
    const container = document.getElementById('shooting-stars');
    // 移动端降低频率
    const interval = isLowEnd ? 8000 : 4000;

    function createShootingStar() {
        const star = document.createElement('div');
        star.className = 'shooting-star';
        star.style.top = Math.random() * 50 + '%';
        star.style.left = (Math.random() * 50 + 50) + '%';
        star.style.animationDuration = (Math.random() * 1 + 0.5) + 's';
        container.appendChild(star);

        setTimeout(() => star.remove(), 2000);
    }

    setInterval(createShootingStar, interval);
})();

/* ========== 导航栏 ========== */
(function initNav() {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.querySelector('.nav-links');
    const links = document.querySelectorAll('.nav-link');

    // 滚动效果
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);

        // 高亮当前区块
        const sections = document.querySelectorAll('.hero, .section');
        let current = '';
        sections.forEach(sec => {
            const top = sec.offsetTop - 100;
            if (window.scrollY >= top) {
                current = sec.getAttribute('id');
            }
        });
        links.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === '#' + current);
        });
    });

    // 移动端菜单
    navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('open');
    });

    // 导航链接点击事件
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetEl = document.querySelector(targetId);
            if (targetEl) {
                // 关闭菜单
                navLinks.classList.remove('open');
                // 平滑滚动
                setTimeout(() => {
                    window.scrollTo({
                        top: targetEl.offsetTop - 70,
                        behavior: 'smooth'
                    });
                }, 100);
            }
        });
    });
})();

/* ========== 恋爱计时器 ========== */
(function initLoveCounter() {
    // 在一起日期: 2025-05-26
    const startDate = new Date('2025-05-26T00:00:00');

    function update() {
        const now = new Date();
        const diff = now - startDate;

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        document.getElementById('love-days').textContent = days;
        document.getElementById('love-hours').textContent = String(hours).padStart(2, '0');
        document.getElementById('love-minutes').textContent = String(minutes).padStart(2, '0');
        document.getElementById('love-seconds').textContent = String(seconds).padStart(2, '0');
    }

    update();
    setInterval(update, 1000);
})();

/* ========== 时间线滚动动画 ========== */
(function initTimelineAnimation() {
    const items = document.querySelectorAll('.timeline-item');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.2 });

    items.forEach(item => observer.observe(item));
})();

/* ========== 相册 Lightbox ========== */
(function initGallery() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCounter = document.getElementById('lightboxCounter');
    const images = ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg', '7.jpg', '8.jpg'];
    let currentIndex = 0;

    function showImage(index) {
        currentIndex = index;
        lightboxImg.src = images[index];
        lightboxCounter.textContent = (index + 1) + ' / ' + images.length;
    }

    document.querySelectorAll('.gallery-item').forEach(item => {
        item.addEventListener('click', () => {
            const idx = parseInt(item.dataset.index);
            showImage(idx);
            lightbox.classList.add('active');
        });
    });

    document.getElementById('lightboxClose').addEventListener('click', () => {
        lightbox.classList.remove('active');
    });

    document.getElementById('lightboxPrev').addEventListener('click', () => {
        showImage((currentIndex - 1 + images.length) % images.length);
    });

    document.getElementById('lightboxNext').addEventListener('click', () => {
        showImage((currentIndex + 1) % images.length);
    });

    // 键盘控制
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') lightbox.classList.remove('active');
        if (e.key === 'ArrowLeft') showImage((currentIndex - 1 + images.length) % images.length);
        if (e.key === 'ArrowRight') showImage((currentIndex + 1) % images.length);
    });
})();

/* ========== 甜言蜜语翻转卡 ========== */
(function initSweetWords() {
    const sweetCard = document.getElementById('sweetCard');
    const sweetText = document.getElementById('sweetText');
    const nextBtn = document.getElementById('nextQuote');

    const quotes = [
        '你是我见过最美的星空',
        '遇见你，是所有故事的开始',
        '我想和你一起慢慢变老',
        '你是我心中最美的风景',
        '余生很长，我只想和你走',
        '你的微笑是我最大的幸福',
        '我想牵着你的手，从心动到古稀',
        '有你的日子，每天都是情人节',
        '你是我的今天，也是我的明天',
        '世界那么大，我的眼里只有你',
        '你是我写过最美的情书',
        '因为有你，我才成为最好的自己',
        '我想成为你的春夏秋冬',
        '你是我最美的意外',
        '和你在一起，时间都变温柔了'
    ];

    let quoteIndex = 0;

    sweetCard.addEventListener('click', () => {
        sweetCard.classList.toggle('flipped');
    });

    nextBtn.addEventListener('click', () => {
        quoteIndex = (quoteIndex + 1) % quotes.length;
        sweetText.textContent = quotes[quoteIndex];
        if (!sweetCard.classList.contains('flipped')) {
            sweetCard.classList.add('flipped');
        }
    });
})();

/* ========== 纪念日计算 ========== */
(function initAnniversaries() {
    const now = new Date();

    // 在一起天数
    const togetherStart = new Date('2025-05-26');
    const togetherDays = Math.floor((now - togetherStart) / (1000 * 60 * 60 * 24));
    document.getElementById('anni-together').textContent = '已在一起 ' + togetherDays + ' 天';

    // 订婚日
    const engagementDate = new Date('2026-01-25');
    const engDiff = Math.floor((now - engagementDate) / (1000 * 60 * 60 * 24));
    if (engDiff >= 0) {
        document.getElementById('anni-engagement').textContent = '已过 ' + engDiff + ' 天';
    } else {
        document.getElementById('anni-engagement').textContent = '还有 ' + Math.abs(engDiff) + ' 天';
    }

    // 领证日
    const marriageDate = new Date('2026-02-14');
    const marDiff = Math.floor((now - marriageDate) / (1000 * 60 * 60 * 24));
    if (marDiff >= 0) {
        document.getElementById('anni-marriage').textContent = '已领证 ' + marDiff + ' 天';
    } else {
        document.getElementById('anni-marriage').textContent = '还有 ' + Math.abs(marDiff) + ' 天';
    }

    // 他的生日倒计时
    const thisYear = now.getFullYear();
    let nextBirthday = new Date(thisYear + '-06-13');
    if (nextBirthday <= now) {
        nextBirthday = new Date((thisYear + 1) + '-06-13');
    }
    const bdayDiff = Math.ceil((nextBirthday - now) / (1000 * 60 * 60 * 24));
    document.getElementById('anni-his-birthday').textContent = '距离下次生日还有 ' + bdayDiff + ' 天';

    // 霞霞的生日倒计时
    let nextHerBirthday = new Date(thisYear + '-10-23');
    if (nextHerBirthday <= now) {
        nextHerBirthday = new Date((thisYear + 1) + '-10-23');
    }
    const herBdayDiff = Math.ceil((nextHerBirthday - now) / (1000 * 60 * 60 * 24));
    document.getElementById('anni-her-birthday').textContent = '距离下次生日还有 ' + herBdayDiff + ' 天';
})();

/* ========== 心愿墙（远程同步） ========== */
(function initWishes() {
    const wishInput = document.getElementById('wishInput');
    const addBtn = document.getElementById('addWish');
    const wall = document.getElementById('wishesWall');
    const KEY = 'love-wishes';
    let _sha = null;

    function getWishes() {
        return JSON.parse(localStorage.getItem(KEY) || '[]');
    }

    function saveLocal(wishes) {
        localStorage.setItem(KEY, JSON.stringify(wishes));
    }

    async function pushToGitHub(wishes) {
        const ok = await GitHubSync.set('data/wishes.json', wishes, _sha);
        if (ok) {
            const fresh = await GitHubSync.get('data/wishes.json');
            if (fresh) _sha = fresh.sha;
        }
    }

    function save(wishes) {
        saveLocal(wishes);
        pushToGitHub(wishes);
    }

    function renderWish(wish) {
        const el = document.createElement('div');
        el.className = 'wish-star';
        el.style.top = wish.top + '%';
        el.style.left = wish.left + '%';
        el.style.animationDelay = wish.delay + 's';
        const userIcon = wish.user && AppUser.info(wish.user) ? AppUser.info(wish.user).icon : '';
        el.innerHTML = '<span>' + wish.text + (userIcon ? ' <small>' + userIcon + '</small>' : '') + '</span>';
        wall.appendChild(el);
    }

    function renderAll() {
        wall.innerHTML = '';
        getWishes().forEach(renderWish);
    }

    addBtn.addEventListener('click', () => {
        const text = wishInput.value.trim();
        if (!text) return;
        const wish = {
            text: text,
            top: Math.random() * 80 + 5,
            left: Math.random() * 75 + 5,
            delay: Math.random() * 2,
            user: AppUser.get() || 'unknown'
        };
        const wishes = getWishes();
        wishes.push(wish);
        save(wishes);
        renderWish(wish);
        wishInput.value = '';
    });

    wishInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') addBtn.click();
    });

    // 初始化：从 GitHub 拉取
    (async () => {
        const remote = await GitHubSync.get('data/wishes.json');
        if (remote) {
            _sha = remote.sha;
            saveLocal(remote.content);
        }
        renderAll();
    })();
})();

/* ========== 音乐按钮（占位） ========== */
(function initMusic() {
    const btn = document.getElementById('musicToggle');
    const audio = document.getElementById('bgm');
    if (!audio) return;
    audio.volume = 0.4;
    let playing = false;

    // 音频加载错误处理
    audio.addEventListener('error', (e) => {
        console.warn('音频加载失败:', e);
        btn.style.opacity = '0.5';
        btn.title = '音乐加载失败';
    });

    btn.addEventListener('click', () => {
        playing = !playing;
        btn.classList.toggle('playing', playing);
        if (playing) {
            audio.play().then(() => {
                console.log('音乐播放中');
            }).catch((err) => {
                console.warn('播放失败:', err);
                playing = false;
                btn.classList.remove('playing');
                btn.title = '点击播放音乐';
            });
        } else {
            audio.pause();
        }
    });
})();

/* ========== 页面加载动画 ========== */
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.8s ease';
    requestAnimationFrame(() => {
        document.body.style.opacity = '1';
    });
});

/* ========== 打字机效果 ========== */
(function initTypewriter() {
    const el = document.getElementById('typewriterText');
    const cursor = document.getElementById('typewriterCursor');
    const sentences = [
        '在星空下，许下一生的承诺',
        '遇见你，是我最美的意外',
        '余生很长，我只想和你走',
        '你的微笑，是我最大的幸福',
        '从心动到古稀，都是你'
    ];
    let sIdx = 0, cIdx = 0, deleting = false;

    function type() {
        const current = sentences[sIdx];
        if (!deleting) {
            el.textContent = current.substring(0, cIdx + 1);
            cIdx++;
            if (cIdx === current.length) {
                deleting = true;
                setTimeout(type, 2000);
                return;
            }
        } else {
            el.textContent = current.substring(0, cIdx - 1);
            cIdx--;
            if (cIdx === 0) {
                deleting = false;
                sIdx = (sIdx + 1) % sentences.length;
            }
        }
        setTimeout(type, deleting ? 50 : 100);
    }
    setTimeout(type, 1000);
})();

/* ========== 主题切换 ========== */
(function initThemeToggle() {
    const btn = document.getElementById('themeToggle');
    const icon = btn.querySelector('i');
    const saved = localStorage.getItem('love-theme');

    if (saved === 'day') {
        document.body.classList.add('day-mode');
        icon.className = 'fas fa-moon';
    }

    btn.addEventListener('click', () => {
        document.body.classList.toggle('day-mode');
        const isDay = document.body.classList.contains('day-mode');
        icon.className = isDay ? 'fas fa-moon' : 'fas fa-sun';
        localStorage.setItem('love-theme', isDay ? 'day' : 'night');
    });
})();

/* ========== 访客统计 ========== */
(function initVisitorCount() {
    let count = parseInt(localStorage.getItem('love-visitors') || '0');
    count++;
    localStorage.setItem('love-visitors', count.toString());

    const el = document.getElementById('visitorCount');
    // 动画计数效果
    let display = 1000 + count; // 基础数 + 实际访问数
    let current = 0;
    const step = Math.ceil(display / 40);
    const timer = setInterval(() => {
        current += step;
        if (current >= display) {
            current = display;
            clearInterval(timer);
        }
        el.textContent = current.toLocaleString();
    }, 30);
})();

/* ========== 照片弹幕 ========== */
(function initDanmaku() {
    const container = document.getElementById('danmakuContainer');
    const messages = [
        '❤️ 你们好甜！', '永远幸福！', '太浪漫了~',
        '羡慕！', '要一直在一起哦', '好配！',
        '甜到我了', '神仙爱情', '祝福祝福！',
        '好羡慕呀', '天作之合', '百年好合！',
        '郎才女貌', '甜甜蜜蜜', '永远相爱'
    ];

    function spawnDanmaku() {
        const el = document.createElement('div');
        el.className = 'danmaku-item';
        el.textContent = messages[Math.floor(Math.random() * messages.length)];
        el.style.animationDuration = (Math.random() * 4 + 5) + 's';
        el.style.right = '-200px';
        container.appendChild(el);

        const duration = parseFloat(el.style.animationDuration) * 1000;
        setTimeout(() => el.remove(), duration);
    }

    // 每 2~4 秒发射一条（移动端降频）
    function scheduleNext() {
        const delay = isLowEnd ? (4000 + Math.random() * 4000) : (2000 + Math.random() * 2000);
        setTimeout(() => {
            spawnDanmaku();
            scheduleNext();
        }, delay);
    }

    // 当相册区块可见时开始
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            spawnDanmaku();
            scheduleNext();
            observer.disconnect();
        }
    });
    observer.observe(container);
})();

/* ========== 滚动叙事动画 ========== */
(function initScrollStory() {
    const chapters = document.querySelectorAll('.story-chapter');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.3 });

    chapters.forEach(ch => observer.observe(ch));
})();

/* ========== 拼图游戏 ========== */
(function initPuzzle() {
    const board = document.getElementById('puzzleBoard');
    const selectEl = document.getElementById('puzzleImage');
    const shuffleBtn = document.getElementById('shufflePuzzle');
    const completeEl = document.getElementById('puzzleComplete');
    let pieces = [];
    let draggedIdx = null;

    function buildPuzzle(imgNum) {
        board.innerHTML = '';
        completeEl.classList.remove('show');
        pieces = [0,1,2,3,4,5,6,7,8];

        pieces.forEach((p, i) => {
            const div = document.createElement('div');
            div.className = 'puzzle-piece';
            div.dataset.index = i;
            const row = Math.floor(p / 3);
            const col = p % 3;
            div.style.backgroundImage = 'url(' + imgNum + '.jpg)';
            div.style.backgroundPosition = (col * 50) + '% ' + (row * 50) + '%';
            div.draggable = true;

            // 拖拽事件
            div.addEventListener('dragstart', (e) => {
                draggedIdx = i;
                div.classList.add('dragging');
            });
            div.addEventListener('dragend', () => {
                div.classList.remove('dragging');
            });
            div.addEventListener('dragover', (e) => e.preventDefault());
            div.addEventListener('drop', (e) => {
                e.preventDefault();
                const targetIdx = parseInt(div.dataset.index);
                if (draggedIdx !== null && draggedIdx !== targetIdx) {
                    swapPieces(draggedIdx, targetIdx, imgNum);
                }
            });

            // 触摸支持
            div.addEventListener('click', () => {
                if (draggedIdx === null) {
                    draggedIdx = i;
                    div.style.outline = '2px solid var(--gold)';
                } else {
                    const targetIdx = i;
                    if (draggedIdx !== targetIdx) {
                        swapPieces(draggedIdx, targetIdx, imgNum);
                    }
                    const prev = board.children[draggedIdx];
                    if (prev) prev.style.outline = 'none';
                    draggedIdx = null;
                }
            });

            board.appendChild(div);
        });
        checkComplete();
    }

    function swapPieces(a, b, imgNum) {
        [pieces[a], pieces[b]] = [pieces[b], pieces[a]];
        rebuildBoard(imgNum);
        checkComplete();
    }

    function rebuildBoard(imgNum) {
        board.innerHTML = '';
        pieces.forEach((p, i) => {
            const div = document.createElement('div');
            div.className = 'puzzle-piece';
            div.dataset.index = i;
            const row = Math.floor(p / 3);
            const col = p % 3;
            div.style.backgroundImage = 'url(' + imgNum + '.jpg)';
            div.style.backgroundPosition = (col * 50) + '% ' + (row * 50) + '%';
            div.draggable = true;
            if (p === i) div.classList.add('correct');

            div.addEventListener('dragstart', (e) => { draggedIdx = i; div.classList.add('dragging'); });
            div.addEventListener('dragend', () => { div.classList.remove('dragging'); });
            div.addEventListener('dragover', (e) => e.preventDefault());
            div.addEventListener('drop', (e) => {
                e.preventDefault();
                const targetIdx = parseInt(div.dataset.index);
                if (draggedIdx !== null && draggedIdx !== targetIdx) {
                    [pieces[draggedIdx], pieces[targetIdx]] = [pieces[targetIdx], pieces[draggedIdx]];
                    draggedIdx = null;
                    rebuildBoard(imgNum);
                    checkComplete();
                }
            });
            div.addEventListener('click', () => {
                if (draggedIdx === null) {
                    draggedIdx = i;
                    div.style.outline = '2px solid var(--gold)';
                } else {
                    if (draggedIdx !== i) {
                        [pieces[draggedIdx], pieces[i]] = [pieces[i], pieces[draggedIdx]];
                    }
                    draggedIdx = null;
                    rebuildBoard(imgNum);
                    checkComplete();
                }
            });

            board.appendChild(div);
        });
    }

    function checkComplete() {
        const done = pieces.every((p, i) => p === i);
        completeEl.classList.toggle('show', done);
    }

    function shufflePieces() {
        for (let i = pieces.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
        }
        // 确保不是已完成状态
        if (pieces.every((p, i) => p === i)) {
            [pieces[0], pieces[1]] = [pieces[1], pieces[0]];
        }
    }

    selectEl.addEventListener('change', () => {
        shufflePieces();
        rebuildBoard(parseInt(selectEl.value));
    });

    shuffleBtn.addEventListener('click', () => {
        shufflePieces();
        rebuildBoard(parseInt(selectEl.value));
    });

    // 初始化
    shufflePieces();
    rebuildBoard(1);
})();

/* ========== 纪念日彩蛋 ========== */
(function initEasterEgg() {
    const modal = document.getElementById('easterEggModal');
    const titleEl = document.getElementById('easterEggTitle');
    const textEl = document.getElementById('easterEggText');
    const closeBtn = document.getElementById('easterEggClose');
    const now = new Date();
    const md = (now.getMonth() + 1) + '-' + now.getDate();

    const specialDays = {
        '5-26': { title: '在一起纪念日 💕', text: '2025年5月26日，你答应做我女朋友。今天是我们的在一起纪念日！' },
        '1-25': { title: '订婚纪念日 💍', text: '2026年1月25日，我们在亲友见证下许下了一生的承诺。' },
        '2-14': { title: '领证纪念日 💒', text: '2026年2月14日，情人节，我们领了结婚证！从此不仅是恋人，更是家人。' },
        '6-13': { title: '他的生日 🎂', text: '今天是文豪的生日！祝他生日快乐，也祝我们永远幸福！' },
        '10-23': { title: '霞霞的生日 🎂', text: '今天是霞霞的生日！祝我的宝贝生日快乐，永远年轻漂亮！' },
        '3-31': { title: '缘分日 ✨', text: '2025年3月31日，一个步数76的点赞，开启了我们的故事。' }
    };

    if (specialDays[md]) {
        titleEl.textContent = specialDays[md].title;
        textEl.textContent = specialDays[md].text;
        setTimeout(() => modal.classList.add('active'), 1500);
    }

    closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    });
})();

/* ========== 天气联动 ========== */
(function initWeather() {
    const iconEl = document.getElementById('weatherIcon');
    const tempEl = document.getElementById('weatherTemp');
    const descEl = document.getElementById('weatherDesc');

    // 使用免费天气 API (wttr.in)
    fetch('https://wttr.in/?format=j1')
        .then(r => r.json())
        .then(data => {
            const current = data.current_condition[0];
            const temp = current.temp_C;
            const code = parseInt(current.weatherCode);

            tempEl.textContent = temp + '°C';

            let icon = 'fa-cloud';
            let desc = '多云';

            if (code === 113) { icon = 'fa-sun'; desc = '晴天'; }
            else if (code === 116) { icon = 'fa-cloud-sun'; desc = '晴间多云'; }
            else if (code === 119 || code === 122) { icon = 'fa-cloud'; desc = '多云'; }
            else if (code >= 200 && code < 300) { icon = 'fa-cloud-showers-heavy'; desc = '雷阵雨'; }
            else if (code >= 300 && code < 400) { icon = 'fa-cloud-rain'; desc = '小雨'; }
            else if (code >= 500 && code < 600) { icon = 'fa-cloud-rain'; desc = '雨天'; }
            else if (code >= 600 && code < 700) { icon = 'fa-snowflake'; desc = '下雪了'; }
            else if (code >= 700 && code < 800) { icon = 'fa-smog'; desc = '雾天'; }

            iconEl.innerHTML = '<i class="fas ' + icon + '"></i>';
            descEl.textContent = desc;
        })
        .catch(() => {
            tempEl.textContent = '--°';
            descEl.textContent = '天气获取失败';
        });
})();

/* ========== 嘉宾留言板（双模式：GitHub 持久化 + localStorage 备用） ========== */
(function initGuestbook() {
    // 使用全局 GITHUB_REPO 和 GITHUB_TOKEN
    const useGitHub = GitHubSync.enabled;
    const STORAGE_KEY = 'love-guestbook-local';

    const gbList = document.getElementById('gbList');
    const gbLoading = document.getElementById('gbLoading');
    const gbName = document.getElementById('gbName');
    const gbMessage = document.getElementById('gbMessage');
    const submitBtn = document.getElementById('submitGb');
    const gbStatus = document.getElementById('gbStatus');

    // 初始化提示
    if (!useGitHub) {
        showStatus('当前为本地模式，留言仅自己可见。配置 GitHub Token 后可永久保存并所有人可见。', 'info');
    }

    // ===== 数据加载 =====
    let _msgSha = null;

    async function loadMessages() {
        if (useGitHub) {
            // GitHub 模式：通过 GitHubSync 读取
            try {
                const remote = await GitHubSync.get('data/messages.json');
                if (remote) {
                    _msgSha = remote.sha;
                    renderMessages(remote.content);
                } else {
                    // 回退到直接 fetch
                    const resp = await fetch('data/messages.json?t=' + Date.now());
                    const messages = resp.ok ? await resp.json() : [];
                    renderMessages(messages);
                }
            } catch (e) {
                gbLoading.innerHTML = '<i class="fas fa-exclamation-circle"></i> 加载失败，请刷新重试';
            }
        } else {
            // 本地模式：从 localStorage 读取 + 合并预设数据
            try {
                const resp = await fetch('data/messages.json');
                const preset = resp.ok ? await resp.json() : [];
                const local = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
                const all = mergeMessages(preset, local);
                renderMessages(all);
            } catch (e) {
                const local = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
                renderMessages(local);
            }
        }
    }

    // 合并消息（按时间去重）
    function mergeMessages(preset, local) {
        const map = new Map();
        preset.forEach(m => map.set(m.name + m.time, m));
        local.forEach(m => map.set(m.name + m.time, m));
        return Array.from(map.values());
    }

    // ===== 渲染留言列表 =====
    function renderMessages(messages) {
        gbLoading.style.display = 'none';

        if (!messages || messages.length === 0) {
            gbList.innerHTML = '<div class="gb-empty">还没有留言，来做第一个送祝福的人吧！</div>';
            return;
        }

        const modeTag = useGitHub
            ? ''
            : '<div style="text-align:center;margin-bottom:10px;font-size:0.8rem;color:var(--text-secondary);opacity:0.7;">💾 本地模式（仅自己可见）</div>';

        let html = modeTag + '<div class="gb-count">共 <span>' + messages.length + '</span> 条祝福</div>';

        // 倒序显示，最新的在前面
        const sorted = [...messages].reverse();
        sorted.forEach(msg => {
            const userIcon = msg.user && AppUser.info(msg.user) ? AppUser.info(msg.user).icon : '';
            html += '<div class="gb-item">' +
                '<div class="gb-item-header">' +
                    '<span class="gb-item-name">' + escapeHtml(msg.name) + '</span>' +
                    (userIcon ? '<span class="data-user-tag ' + msg.user + '">' + userIcon + '</span>' : '') +
                    '<span class="gb-item-time">' + escapeHtml(msg.time) + '</span>' +
                '</div>' +
                '<div class="gb-item-message">' + escapeHtml(msg.message) + '</div>' +
            '</div>';
        });

        gbList.innerHTML = html;
    }

    // ===== 提交留言 =====
    async function submitMessage() {
        const name = gbName.value.trim();
        const message = gbMessage.value.trim();

        if (!name) { showStatus('请输入你的姓名', 'error'); return; }
        if (!message) { showStatus('请输入祝福内容', 'error'); return; }

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 发送中...';

        if (useGitHub) {
            await submitToGitHub(name, message);
        } else {
            submitToLocal(name, message);
        }

        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> 发送祝福';
    }

    // GitHub 提交（直接通过 Contents API）
    async function submitToGitHub(name, message) {
        showStatus('正在提交到 GitHub...', 'info');
        try {
            // 先读取当前数据
            const remote = await GitHubSync.get('data/messages.json');
            const messages = remote ? remote.content : [];
            const sha = remote ? remote.sha : null;

            // 添加新留言
            const now = new Date();
            const time = now.getFullYear() + '-' +
                String(now.getMonth() + 1).padStart(2, '0') + '-' +
                String(now.getDate()).padStart(2, '0') + ' ' +
                String(now.getHours()).padStart(2, '0') + ':' +
                String(now.getMinutes()).padStart(2, '0');
            messages.push({ name, message, time, user: AppUser.get() || 'guest' });

            // 写回 GitHub
            const ok = await GitHubSync.set('data/messages.json', messages, sha);
            if (ok) {
                showStatus('祝福已发送！所有人可见 💕', 'success');
                gbName.value = '';
                gbMessage.value = '';
                renderMessages(messages);
            } else {
                throw new Error('写入失败');
            }
        } catch (e) {
            showStatus('提交失败: ' + e.message + '，已保存到本地', 'error');
            submitToLocal(name, message);
        }
    }

    // 本地提交
    function submitToLocal(name, message) {
        const local = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        const now = new Date();
        const time = now.getFullYear() + '-' +
            String(now.getMonth() + 1).padStart(2, '0') + '-' +
            String(now.getDate()).padStart(2, '0') + ' ' +
            String(now.getHours()).padStart(2, '0') + ':' +
            String(now.getMinutes()).padStart(2, '0');

        local.push({ name, message, time });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(local));

        gbName.value = '';
        gbMessage.value = '';
        showStatus('祝福已保存！当前为本地模式，仅自己可见 ✓', 'success');

        // 重新加载显示
        setTimeout(loadMessages, 300);
    }

    function showStatus(text, type) {
        gbStatus.textContent = text;
        gbStatus.className = 'gb-status ' + type;
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // 事件绑定
    submitBtn.addEventListener('click', submitMessage);
    gbMessage.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.ctrlKey) submitMessage();
    });

    // 初始加载
    loadMessages();
})();

/* ========== 鼠标拖尾爱心（移动端禁用） ========== */
(function initCursorTrail() {
    if (isMobile) return; // 移动端禁用
    const hearts = ['❤️', '💕', '💖', '✨', '💗'];
    let lastTime = 0;

    document.addEventListener('mousemove', (e) => {
        const now = Date.now();
        if (now - lastTime < 150) return;
        lastTime = now;

        const el = document.createElement('div');
        el.className = 'cursor-heart';
        el.textContent = hearts[Math.floor(Math.random() * hearts.length)];
        el.style.left = e.clientX + 'px';
        el.style.top = e.clientY + 'px';
        document.body.appendChild(el);

        setTimeout(() => el.remove(), 1000);
    });
})();

/* ========== 点击烟花（移动端减少粒子） ========== */
(function initClickFirework() {
    const colors = ['#ff6b9d', '#7c6ef0', '#f5c842', '#a78bfa', '#ff9ff3', '#48dbfb'];

    document.addEventListener('click', (e) => {
        if (e.target.closest('button, a, input, textarea, select, .gallery-item, .puzzle-piece, .sweet-card, .nav-link')) return;

        const count = isLowEnd ? 6 : (12 + Math.floor(Math.random() * 8));
        for (let i = 0; i < count; i++) {
            const p = document.createElement('div');
            p.className = 'firework-particle';
            p.style.left = e.clientX + 'px';
            p.style.top = e.clientY + 'px';
            p.style.background = colors[Math.floor(Math.random() * colors.length)];

            const angle = (Math.PI * 2 / count) * i;
            const dist = 30 + Math.random() * 40;
            p.style.setProperty('--tx', Math.cos(angle) * dist + 'px');
            p.style.setProperty('--ty', Math.sin(angle) * dist + 'px');

            document.body.appendChild(p);
            setTimeout(() => p.remove(), 800);
        }
    });
})();

/* ========== 全屏飘浮爱心（移动端降级） ========== */
(function initFloatingHearts() {
    const container = document.getElementById('floatingHearts');
    const emojis = ['❤️', '💕', '💖', '💗', '🌸', '✨', '💫', '🌟'];
    // 移动端降低频率
    const minDelay = isLowEnd ? 5000 : 2000;
    const maxDelay = isLowEnd ? 8000 : 4000;

    function spawn() {
        const el = document.createElement('div');
        el.className = 'float-heart';
        el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        el.style.left = Math.random() * 100 + '%';
        el.style.fontSize = (12 + Math.random() * 16) + 'px';
        el.style.animationDuration = (8 + Math.random() * 12) + 's';
        container.appendChild(el);

        const dur = parseFloat(el.style.animationDuration) * 1000;
        setTimeout(() => el.remove(), dur);
    }

    function loop() {
        spawn();
        setTimeout(loop, minDelay + Math.random() * (maxDelay - minDelay));
    }
    loop();
})();

/* ========== 下一个纪念日倒计时 ========== */
(function initNextAnniversary() {
    const now = new Date();
    const thisYear = now.getFullYear();

    // 纪念日列表（月-日，名称，图标）
    const anniversaries = [
        { md: '05-26', name: '在一起纪念日', icon: 'fa-heart' },
        { md: '06-13', name: '他的生日', icon: 'fa-birthday-cake' },
        { md: '10-23', name: '霞霞的生日 🎂', icon: 'fa-gift' },
        { md: '01-25', name: '订婚纪念日', icon: 'fa-ring' },
        { md: '02-14', name: '领证纪念日 💒', icon: 'fa-heart' },
        { md: '03-31', name: '缘分日', icon: 'fa-star' }
    ];

    // 找到下一个最近的纪念日
    function findNext() {
        let best = null;
        let bestDiff = Infinity;

        anniversaries.forEach(a => {
            const [m, d] = a.md.split('-').map(Number);
            let date = new Date(thisYear, m - 1, d);
            if (date <= now) date = new Date(thisYear + 1, m - 1, d);
            const diff = date - now;
            if (diff > 0 && diff < bestDiff) {
                bestDiff = diff;
                best = { ...a, date, diff };
            }
        });
        return best;
    }

    const next = findNext();
    if (!next) return;

    document.getElementById('nextAnniName').textContent = next.name;
    document.getElementById('nextAnniDate').textContent =
        next.date.getFullYear() + '年' + (next.date.getMonth() + 1) + '月' + next.date.getDate() + '日';
    document.getElementById('nextAnniIcon').innerHTML = '<i class="fas ' + next.icon + '"></i>';

    function update() {
        const diff = next.date - new Date();
        if (diff <= 0) {
            document.getElementById('nac-days').textContent = '🎉';
            document.getElementById('nac-hours').textContent = '00';
            document.getElementById('nac-mins').textContent = '00';
            document.getElementById('nac-secs').textContent = '00';
            return;
        }

        const days = Math.floor(diff / 86400000);
        const hours = Math.floor((diff % 86400000) / 3600000);
        const mins = Math.floor((diff % 3600000) / 60000);
        const secs = Math.floor((diff % 60000) / 1000);

        document.getElementById('nac-days').textContent = days;
        document.getElementById('nac-hours').textContent = String(hours).padStart(2, '0');
        document.getElementById('nac-mins').textContent = String(mins).padStart(2, '0');
        document.getElementById('nac-secs').textContent = String(secs).padStart(2, '0');

        // 进度条：从上一个纪念日到下一个的进度
        const totalCycle = 365 * 86400000; // 约一年
        const progress = Math.min(100, ((totalCycle - diff) / totalCycle) * 100);
        document.getElementById('anniProgressBar').style.width = progress.toFixed(1) + '%';
        document.getElementById('anniProgressText').textContent =
            '距离 ' + next.name + ' 还有 ' + days + ' 天，进度 ' + progress.toFixed(1) + '%';
    }

    update();
    setInterval(update, 1000);
})();

/* ========== 视差滚动 ========== */
(function initParallax() {
    const heroContent = document.querySelector('.hero-content');
    const glowRing = document.querySelector('.glow-ring');

    window.addEventListener('scroll', () => {
        const y = window.scrollY;
        if (heroContent && y < window.innerHeight) {
            heroContent.style.transform = 'translateY(' + (y * 0.3) + 'px)';
            heroContent.style.opacity = 1 - (y / window.innerHeight) * 0.8;
        }
        if (glowRing && y < window.innerHeight) {
            glowRing.style.transform = 'translate(-50%, -50%) scale(' + (1 + y * 0.001) + ')';
        }
    });
})();

/* ========== 区块滚入动画增强 ========== */
(function initSectionReveal() {
    const sections = document.querySelectorAll('.section');
    sections.forEach(sec => {
        sec.style.opacity = '0';
        sec.style.transform = 'translateY(30px)';
        sec.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    sections.forEach(sec => observer.observe(sec));
})();

/* ========== 刮刮卡 ========== */
(function initScratchCards() {
    document.querySelectorAll('.scratch-card').forEach(card => {
        const canvas = card.querySelector('canvas');
        const ctx = canvas.getContext('2d');
        let isDrawing = false;

        // 填充银色涂层
        ctx.fillStyle = '#c0c0c0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#a0a0a0';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('刮开我 ✨', canvas.width / 2, canvas.height / 2);

        ctx.globalCompositeOperation = 'destination-out';

        function scratch(e) {
            if (!isDrawing) return;
            const rect = canvas.getBoundingClientRect();
            const x = (e.clientX || e.touches[0].clientX) - rect.left;
            const y = (e.clientY || e.touches[0].clientY) - rect.top;
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            ctx.beginPath();
            ctx.arc(x * scaleX, y * scaleY, 20, 0, Math.PI * 2);
            ctx.fill();
        }

        card.addEventListener('mousedown', () => { isDrawing = true; });
        card.addEventListener('mousemove', scratch);
        card.addEventListener('mouseup', () => isDrawing = false);
        card.addEventListener('touchstart', (e) => { isDrawing = true; e.preventDefault(); });
        card.addEventListener('touchmove', scratch);
        card.addEventListener('touchend', () => isDrawing = false);
    });
})();

/* ========== 恋爱等级系统 ========== */
(function initLevelSystem() {
    const levels = [
        { days: 0, icon: '💗', title: '甜蜜新手', desc: '刚刚在一起，一切都是新的' },
        { days: 30, icon: '💕', title: '恋爱学员', desc: '一个月了，开始习愤彼此' },
        { days: 100, icon: '💖', title: '心动达人', desc: '100天，心动依然' },
        { days: 200, icon: '💘', title: '甜蜜高手', desc: '200天，甜蜜已成日常' },
        { days: 365, icon: '💝', title: '爱情大师', desc: '一年！风雨同舟' },
        { days: 500, icon: '💎', title: '钻石恋人', desc: '500天，感情如钻石般坚硬' },
        { days: 730, icon: '👑', title: '真爱之王', desc: '两年！真正的王者' },
        { days: 1000, icon: '🌟', title: '传奇情侣', desc: '1000天！传奇般的爱情' },
        { days: 3650, icon: '💫', title: '永恒之爱', desc: '10年！永恒不变' }
    ];

    const startDate = new Date('2025-05-26');
    const days = Math.floor((new Date() - startDate) / 86400000);

    let currentLevel = levels[0];
    let nextLevel = levels[1];
    for (let i = levels.length - 1; i >= 0; i--) {
        if (days >= levels[i].days) {
            currentLevel = levels[i];
            nextLevel = levels[i + 1] || null;
            break;
        }
    }

    document.getElementById('levelIcon').textContent = currentLevel.icon;
    document.getElementById('levelTitle').textContent = currentLevel.title;
    document.getElementById('levelDesc').textContent = currentLevel.desc;

    if (nextLevel) {
        const progress = ((days - currentLevel.days) / (nextLevel.days - currentLevel.days)) * 100;
        document.getElementById('levelFill').style.width = progress.toFixed(1) + '%';
        document.getElementById('levelExp').textContent =
            days + ' / ' + nextLevel.days + ' 天（距下一级还差 ' + (nextLevel.days - days) + ' 天）';
    } else {
        document.getElementById('levelFill').style.width = '100%';
        document.getElementById('levelExp').textContent = '已满级！ ' + days + ' 天';
    }

    let html = '';
    levels.forEach(l => {
        const cls = days >= l.days ? 'active' : 'locked';
        html += '<span class="level-tag ' + cls + '">' + l.icon + ' ' + l.title + ' (' + l.days + '天)</span>';
    });
    document.getElementById('levelList').innerHTML = html;
})();

/* ========== 数据仪表盘 ========== */
(function initDashboard() {
    const startDate = new Date('2025-05-26');
    const now = new Date();
    const days = Math.floor((now - startDate) / 86400000);
    const hours = Math.floor((now - startDate) / 3600000);
    const heartbeats = days * 100000; // 约每天10万次心跳

    const stats = [
        { icon: '📅', value: days, label: '在一起天数' },
        { icon: '⏰', value: hours.toLocaleString(), label: '在一起小时' },
        { icon: '💓', value: heartbeats.toLocaleString(), label: '为你心跳次数' },
        { icon: '🌅', value: days, label: '一起看的日出' },
        { icon: '🌙', value: days, label: '说过的晚安' },
        { icon: '🍽️', value: Math.floor(days * 2.5), label: '一起吃过的饭' },
        { icon: '😄', value: Math.floor(days * 15), label: '一起笑的次数' },
        { icon: '💌', value: '∞', label: '想你的次数' }
    ];

    let html = '';
    stats.forEach(s => {
        html += '<div class="dash-card">' +
            '<div class="dash-icon">' + s.icon + '</div>' +
            '<div class="dash-value">' + s.value + '</div>' +
            '<div class="dash-label">' + s.label + '</div>' +
        '</div>';
    });
    document.getElementById('dashGrid').innerHTML = html;
})();

/* ========== 恋爱地图连线 ========== */
(function initMapLines() {
    const svg = document.getElementById('mapLines');
    if (!svg) return;
    const points = document.querySelectorAll('.map-point');
    const board = document.getElementById('mapBoard');
    const rect = board.getBoundingClientRect();

    function drawLines() {
        svg.innerHTML = '';
        const boardRect = board.getBoundingClientRect();
        for (let i = 0; i < points.length - 1; i++) {
            const a = points[i].getBoundingClientRect();
            const b = points[i + 1].getBoundingClientRect();
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', a.left - boardRect.left + a.width / 2);
            line.setAttribute('y1', a.top - boardRect.top + a.height / 2);
            line.setAttribute('x2', b.left - boardRect.left + b.width / 2);
            line.setAttribute('y2', b.top - boardRect.top + b.height / 2);
            svg.appendChild(line);
        }
    }

    setTimeout(drawLines, 500);
    window.addEventListener('resize', drawLines);
})();

/* ========== 共同日记（远程同步） ========== */
(function initDiary() {
    const calendar = document.getElementById('diaryCalendar');
    const dateInput = document.getElementById('diaryDate');
    const textInput = document.getElementById('diaryText');
    const submitBtn = document.getElementById('diarySubmit');
    const STORAGE_KEY = 'love-diary';
    let _sha = null;

    function getDiary() {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    }

    function saveLocal(diary) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(diary));
    }

    async function pushToGitHub(diary) {
        const ok = await GitHubSync.set('data/diary.json', diary, _sha);
        if (ok) {
            const fresh = await GitHubSync.get('data/diary.json');
            if (fresh) _sha = fresh.sha;
        }
    }

    function save(diary) {
        saveLocal(diary);
        pushToGitHub(diary);
    }

    function renderCalendar() {
        const diary = getDiary();
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = now.getDate();

        let html = '';
        ['日', '一', '二', '三', '四', '五', '六'].forEach(d => {
            html += '<div class="diary-day" style="font-weight:600;color:var(--accent-light);font-size:0.7rem;">' + d + '</div>';
        });
        for (let i = 0; i < firstDay; i++) {
            html += '<div class="diary-day"></div>';
        }
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
            const entry = diary[dateStr];
            const hasEntry = entry ? 'has-entry' : '';
            const isToday = d === today ? 'today' : '';
            const entryText = typeof entry === 'object' ? entry.text : (entry || '');
            const entryUser = typeof entry === 'object' && entry.user ? entry.user : '';
            const userIcon = entryUser && AppUser.info(entryUser) ? AppUser.info(entryUser).icon : '';
            const tooltip = entryText + (userIcon ? ' (' + userIcon + ')' : '');
            html += '<div class="diary-day ' + hasEntry + ' ' + isToday + '" title="' + tooltip + '">' + d + '</div>';
        }
        calendar.innerHTML = html;
    }

    submitBtn.addEventListener('click', () => {
        const date = dateInput.value;
        const text = textInput.value.trim();
        if (!date || !text) return;
        const diary = getDiary();
        diary[date] = { text: text, user: AppUser.get() || 'unknown' };
        save(diary);
        textInput.value = '';
        renderCalendar();
    });

    const now = new Date();
    dateInput.value = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');

    // 初始化：从 GitHub 拉取
    (async () => {
        const remote = await GitHubSync.get('data/diary.json');
        if (remote) {
            _sha = remote.sha;
            saveLocal(remote.content);
        }
        renderCalendar();
    })();
})();

/* ========== 照片对比滑块 ========== */
(function initCompareSlider() {
    const slider = document.getElementById('compareSlider');
    const handle = document.getElementById('compareHandle');
    const afterImg = slider.querySelector('.compare-after');
    if (!slider || !handle) return;

    let isDragging = false;

    function updatePosition(x) {
        const rect = slider.getBoundingClientRect();
        let pos = (x - rect.left) / rect.width;
        pos = Math.max(0, Math.min(1, pos));
        handle.style.left = (pos * 100) + '%';
        afterImg.style.clipPath = 'inset(0 ' + ((1 - pos) * 100) + '% 0 0)';
    }

    slider.addEventListener('mousedown', (e) => { isDragging = true; updatePosition(e.clientX); });
    document.addEventListener('mousemove', (e) => { if (isDragging) updatePosition(e.clientX); });
    document.addEventListener('mouseup', () => isDragging = false);
    slider.addEventListener('touchstart', (e) => { isDragging = true; updatePosition(e.touches[0].clientX); });
    document.addEventListener('touchmove', (e) => { if (isDragging) updatePosition(e.touches[0].clientX); });
    document.addEventListener('touchend', () => isDragging = false);
})();

/* ========== 词云 ========== */
(function initWordCloud() {
    const container = document.getElementById('wordcloudCanvas');
    if (!container) return;

    const words = [
        { text: '爱情', size: 2.5, color: '#ff6b9d' },
        { text: '永远', size: 2.2, color: '#a78bfa' },
        { text: '幸福', size: 2, color: '#f5c842' },
        { text: '陪伴', size: 1.8, color: '#ff6b9d' },
        { text: '缘分', size: 1.7, color: '#7c6ef0' },
        { text: '心动', size: 1.6, color: '#ff9ff3' },
        { text: '温暖', size: 1.5, color: '#f5c842' },
        { text: '牵手', size: 1.4, color: '#a78bfa' },
        { text: '未来', size: 1.8, color: '#48dbfb' },
        { text: '家', size: 2, color: '#ff6b9d' },
        { text: '相信', size: 1.3, color: '#7c6ef0' },
        { text: '守护', size: 1.5, color: '#ff9ff3' },
        { text: '约定', size: 1.4, color: '#f5c842' },
        { text: '浪漫', size: 1.3, color: '#a78bfa' },
        { text: '笑容', size: 1.2, color: '#48dbfb' },
        { text: '星空', size: 1.6, color: '#7c6ef0' },
        { text: '一生', size: 1.9, color: '#ff6b9d' },
        { text: '新余', size: 1.1, color: '#f5c842' },
        { text: '武功山', size: 1.2, color: '#a78bfa' },
        { text: '番茄炒蛋', size: 1, color: '#ff9ff3' },
        { text: '步数76', size: 1.1, color: '#48dbfb' },
        { text: '情人节', size: 1.3, color: '#ff6b9d' },
        { text: '结婚证', size: 1.5, color: '#f5c842' },
        { text: '余生', size: 1.7, color: '#7c6ef0' }
    ];

    words.forEach(w => {
        const span = document.createElement('span');
        span.className = 'cloud-word';
        span.textContent = w.text;
        span.style.fontSize = w.size + 'rem';
        span.style.color = w.color;
        span.style.fontWeight = w.size > 1.5 ? '700' : '400';
        container.appendChild(span);
    });
})();

/* ========== 爱情大富翁 ========== */
(function initBoardGame() {
    const cells = [
        { icon: '🏠', name: '起点', event: '故事从这里开始！' },
        { icon: '🏫', name: '高中', event: '回忆涌上心头，你们在这里相遇' },
        { icon: '💓', name: '心动', event: '心跳加速！想起第一次见面的感觉' },
        { icon: '🎓', name: '大学', event: '那些年一起走过的校园' },
        { icon: '🍳', name: '做饭', event: '番茄炒蛋的味道，是爱的味道' },
        { icon: '👍', name: '点赞', event: '步数76！一切的缘起' },
        { icon: '🚶', name: '散步', event: '新余体育馆，聊到天黑' },
        { icon: '⛰️', name: '武功山', event: '你说你行，我也行！' },
        { icon: '💐', name: '告白', event: '“小妞，做我女朋友” ——最勇敢的一天' },
        { icon: '🌧️', name: '下雨', event: '爬了个寂寞，但和你逛商场也很开心' },
        { icon: '🎂', name: '生日', event: '北京烤鸭、蛋糕、键盘、鲜花…最好的生日' },
        { icon: '💍', name: '订婚', event: '在亲友见证下，许下一生的承诺' },
        { icon: '💒', name: '领证', event: '情人节快乐！我们结婚了！' },
        { icon: '🌟', name: '未来', event: '余生还很长，我们一起走' }
    ];

    const track = document.getElementById('boardTrack');
    const eventEl = document.getElementById('boardEvent');
    const diceResult = document.getElementById('diceResult');
    const btnDice = document.getElementById('btnDice');
    let pos = 0;

    // 生成棋盘
    cells.forEach((c, i) => {
        const div = document.createElement('div');
        div.className = 'board-cell' + (i === 0 ? ' current' : '');
        div.id = 'cell-' + i;
        div.innerHTML = '<span class="cell-icon">' + c.icon + '</span>' + c.name;
        track.appendChild(div);
    });

    btnDice.addEventListener('click', () => {
        btnDice.disabled = true;
        const dice = Math.floor(Math.random() * 6) + 1;
        diceResult.textContent = dice;

        // 动画般子
        let count = 0;
        const anim = setInterval(() => {
            diceResult.textContent = Math.floor(Math.random() * 6) + 1;
            count++;
            if (count > 10) {
                clearInterval(anim);
                diceResult.textContent = dice;
                pos = Math.min(pos + dice, cells.length - 1);

                // 更新位置
                document.querySelectorAll('.board-cell').forEach(c => c.classList.remove('current'));
                document.getElementById('cell-' + pos).classList.add('current');
                eventEl.textContent = cells[pos].icon + ' ' + cells[pos].event;

                if (pos >= cells.length - 1) {
                    eventEl.textContent = '🎉 恭喜到达终点！你们的爱情故事，是最美的旅程 💕';
                }
                btnDice.disabled = false;
            }
        }, 80);
    });
})();

/* ========== 二维码生成 ========== */
(function initQR() {
    const toggle = document.getElementById('qrToggle');
    const popup = document.getElementById('qrPopup');
    const canvas = document.getElementById('qrCanvas');
    const ctx = canvas.getContext('2d');

    toggle.addEventListener('click', () => {
        popup.classList.toggle('show');
    });

    // 简单 QR 码绘制（用 URL 文本生成简单图案）
    const url = window.location.href;
    const size = 150;
    const cellSize = 5;
    const grid = size / cellSize;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#333';

    // 用 URL 的 hash 生成简单图案
    for (let i = 0; i < grid; i++) {
        for (let j = 0; j < grid; j++) {
            const idx = (i * grid + j) % url.length;
            if (url.charCodeAt(idx) % 3 === 0) {
                ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
            }
        }
    }

    // 定位角
    function drawFinder(x, y) {
        ctx.fillStyle = '#333';
        ctx.fillRect(x, y, 35, 35);
        ctx.fillStyle = 'white';
        ctx.fillRect(x + 5, y + 5, 25, 25);
        ctx.fillStyle = '#333';
        ctx.fillRect(x + 10, y + 10, 15, 15);
    }
    drawFinder(0, 0);
    drawFinder(size - 35, 0);
    drawFinder(0, size - 35);
})();

/* ========== 季节主题 ========== */
(function initSeasonTheme() {
    const month = new Date().getMonth() + 1;
    let season = '';
    if (month >= 3 && month <= 5) season = 'spring';
    else if (month >= 6 && month <= 8) season = 'summer';
    else if (month >= 9 && month <= 11) season = 'autumn';
    else season = 'winter';

    document.body.classList.add('season-' + season);
})();

/* ========== 帮助引导 ========== */
(function initHelp() {
    const toggle = document.getElementById('helpToggle');
    const panel = document.getElementById('helpPanel');
    const closeBtn = document.getElementById('helpClose');

    toggle.addEventListener('click', () => panel.classList.add('show'));
    closeBtn.addEventListener('click', () => panel.classList.remove('show'));
    // 点击外部关闭
    panel.addEventListener('click', (e) => {
        if (e.target === panel) panel.classList.remove('show');
    });
})();

/* ========== 情话生成器 ========== */
(function initQuoteMachine() {
    const quotes = [
        '遇见你之前，我没想过结婚；遇见你之后，我没想过别人。',
        '我想和你一起慢慢变老，直到我们变成两个可爱的小老头和小老太太。',
        '你是我见过最美的意外，也是我最想留住的幸运。',
        '世界上有那么多人，可我的眼里只有你。',
        '我不要短暂的温存，只要你一世的陪伴。',
        '你是我心中的一首歌，永远唱不完。',
        '牵着你的手，就像左手牵右手，但左手永远离不开右手。',
        '你笑起来的样子，是我见过最美的风景。',
        '我想用我所有的运气，换与你一生的相遇。',
        '你是我所有的少女心事，也是我余生的柴米油盐。',
        '如果爱你是错，我不愿意对。',
        '我这一生遇到过很多美好的东西，但都不及你。',
        '你不需要多好，我喜欢就好。',
        '我想和你一起生活，在某个小镇，共享无尽的黄昏。',
        '你是我所有的遇见里，最不想放手的那一个。',
        '因为有你，每一天都是情人节。',
        '我最大的愿望，就是做你的丈夫。',
        '你是我见过最可爱的人，没有之一。',
        '余生很长，我只想和你走。',
        '你是我见过最温柔的风，吹散了我所有的忧愁。'
    ];

    const display = document.getElementById('quoteDisplay');
    const btn = document.getElementById('btnQuote');
    let lastIndex = -1;

    btn.addEventListener('click', () => {
        let idx;
        do {
            idx = Math.floor(Math.random() * quotes.length);
        } while (idx === lastIndex);
        lastIndex = idx;

        display.classList.remove('animate');
        void display.offsetWidth;
        display.classList.add('animate');
        display.textContent = quotes[idx];
    });
})();

/* ========== 照片轮播 ========== */
(function initSlideshow() {
    const photos = ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg', '7.jpg', '8.jpg'];
    const track = document.getElementById('slideTrack');
    const counter = document.getElementById('slideCounter');
    const dotsContainer = document.getElementById('slideDots');
    const prevBtn = document.getElementById('slidePrev');
    const nextBtn = document.getElementById('slideNext');
    let current = 0;

    // 生成图片
    photos.forEach(src => {
        const img = document.createElement('img');
        img.src = src;
        img.alt = '照片';
        track.appendChild(img);
    });

    // 生成点
    photos.forEach((_, i) => {
        const dot = document.createElement('div');
        dot.className = 'slide-dot' + (i === 0 ? ' active' : '');
        dot.addEventListener('click', () => goTo(i));
        dotsContainer.appendChild(dot);
    });

    function goTo(idx) {
        current = idx;
        track.style.transform = 'translateX(-' + (current * 100) + '%)';
        counter.textContent = (current + 1) + ' / ' + photos.length;
        dotsContainer.querySelectorAll('.slide-dot').forEach((d, i) => {
            d.classList.toggle('active', i === current);
        });
    }

    prevBtn.addEventListener('click', () => goTo((current - 1 + photos.length) % photos.length));
    nextBtn.addEventListener('click', () => goTo((current + 1) % photos.length));

    // 自动播放
    let autoPlay = setInterval(() => goTo((current + 1) % photos.length), 4000);
    track.parentElement.addEventListener('mouseenter', () => clearInterval(autoPlay));
    track.parentElement.addEventListener('mouseleave', () => {
        autoPlay = setInterval(() => goTo((current + 1) % photos.length), 4000);
    });
})();

/* ========== 爱情问答 ========== */
(function initLoveQuiz() {
    const questions = [
        {
            q: '我们是在哪一天在一起的？',
            options: ['2025年5月20日', '2025年5月26日', '2025年6月1日', '2025年2月14日'],
            answer: 1
        },
        {
            q: '我们领证的日子是哪天？',
            options: ['2026年1月25日', '2026年2月14日', '2026年3月14日', '2026年5月26日'],
            answer: 1
        },
        {
            q: '我们的第一次旅行去了哪里？',
            options: ['萍乡', '武功山', '龙虎山', '庐山'],
            answer: 0
        },
        {
            q: '我们第一次约会去了哪里？',
            options: ['电影院', '新余体育馆', '商场', '公园'],
            answer: 1
        },
        {
            q: '订婚宴在哪里举办？',
            options: ['家里', '酒店', '暨阳宴仙湖', '餐厅'],
            answer: 2
        },
        {
            q: '谁先表白的？',
            options: ['叶霞', '李文豪', '同时表白', '朋友促成的'],
            answer: 1
        },
        {
            q: '我们是在哪里认识的？',
            options: ['大学', '高中', '工作', '朋友介绍'],
            answer: 1
        },
        {
            q: '第一次生日惊喜在哪里？',
            options: ['餐厅', '酒店', '出租屋', '新余'],
            answer: 2
        }
    ];

    const startBtn = document.getElementById('btnQuizStart');
    const nextBtn = document.getElementById('btnQuizNext');
    const questionEl = document.getElementById('quizQuestion');
    const optionsEl = document.getElementById('quizOptions');
    const progressEl = document.getElementById('quizProgress');
    const resultEl = document.getElementById('quizResult');

    let currentQ = 0;
    let score = 0;
    let answered = false;

    startBtn.addEventListener('click', () => {
        startBtn.style.display = 'none';
        currentQ = 0;
        score = 0;
        showQuestion();
    });

    nextBtn.addEventListener('click', () => {
        currentQ++;
        if (currentQ >= questions.length) {
            showResult();
        } else {
            showQuestion();
        }
    });

    function showQuestion() {
        answered = false;
        const q = questions[currentQ];
        questionEl.textContent = (currentQ + 1) + '. ' + q.q;
        nextBtn.style.display = 'none';
        resultEl.style.display = 'none';

        // 进度条
        let pHtml = '';
        questions.forEach((_, i) => {
            const cls = i < currentQ ? 'done' : (i === currentQ ? 'current' : '');
            pHtml += '<div class="quiz-progress-dot ' + cls + '"></div>';
        });
        progressEl.innerHTML = pHtml;

        // 选项
        let oHtml = '';
        q.options.forEach((opt, i) => {
            oHtml += '<div class="quiz-option" data-idx="' + i + '">' + opt + '</div>';
        });
        optionsEl.innerHTML = oHtml;

        optionsEl.querySelectorAll('.quiz-option').forEach(el => {
            el.addEventListener('click', () => {
                if (answered) return;
                answered = true;
                const idx = parseInt(el.dataset.idx);
                if (idx === q.answer) {
                    el.classList.add('correct');
                    score++;
                } else {
                    el.classList.add('wrong');
                    optionsEl.children[q.answer].classList.add('correct');
                }
                nextBtn.style.display = 'block';
                nextBtn.textContent = currentQ >= questions.length - 1 ? '查看结果 →' : '下一题 →';
            });
        });
    }

    function showResult() {
        questionEl.textContent = '答题完成！';
        optionsEl.innerHTML = '';
        nextBtn.style.display = 'none';
        progressEl.innerHTML = '';

        resultEl.style.display = 'block';
        let msg = '';
        const pct = score / questions.length;
        if (pct === 1) msg = '🏆 满分！你是真正的爱情达人！';
        else if (pct >= 0.75) msg = '💖 太棒了！你真的很了解我们的故事！';
        else if (pct >= 0.5) msg = '💕 不错哦！但还可以更了解我们~';
        else msg = '💗 加油！多看看我们的故事吧~';

        resultEl.innerHTML = '<div style="font-size:2rem;margin-bottom:10px;">' + score + ' / ' + questions.length + '</div>' + msg + '<br><br><button class="btn-quiz" onclick="document.getElementById(\'btnQuizStart\').click()">再来一次</button>';

        startBtn.style.display = 'block';
        startBtn.innerHTML = '<i class="fas fa-redo"></i> 重新答题';
    }
})();

/* ========== 共享待办（远程同步） ========== */
(function initTodo() {
    const input = document.getElementById('todoInput');
    const addBtn = document.getElementById('todoAdd');
    const list = document.getElementById('todoList');
    const KEY = 'love-todos';
    let _sha = null;

    function getTodos() {
        return JSON.parse(localStorage.getItem(KEY) || '[]');
    }

    function saveLocal(todos) {
        localStorage.setItem(KEY, JSON.stringify(todos));
    }

    async function pushToGitHub(todos) {
        const ok = await GitHubSync.set('data/todos.json', todos, _sha);
        if (ok) {
            const fresh = await GitHubSync.get('data/todos.json');
            if (fresh) _sha = fresh.sha;
        }
    }

    function save(todos) {
        saveLocal(todos);
        pushToGitHub(todos);
    }

    function render() {
        const todos = getTodos();
        list.innerHTML = '';
        todos.forEach((t, i) => {
            const li = document.createElement('li');
            li.className = t.done ? 'done' : '';
            const userTag = t.user ? '<span class="data-user-tag ' + t.user + '">' + (AppUser.info(t.user) ? AppUser.info(t.user).icon : '') + '</span>' : '';
            li.innerHTML =
                '<span class="todo-check" data-i="' + i + '">\u2713</span>' +
                '<span>' + t.text + '</span>' +
                userTag +
                '<span class="todo-del" data-i="' + i + '"><i class="fas fa-times"></i></span>';
            list.appendChild(li);
        });
    }

    addBtn.addEventListener('click', () => {
        const text = input.value.trim();
        if (!text) return;
        const todos = getTodos();
        todos.push({ text: text, done: false, user: AppUser.get() || 'unknown' });
        save(todos);
        input.value = '';
        render();
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') addBtn.click();
    });

    list.addEventListener('click', (e) => {
        const check = e.target.closest('.todo-check');
        const del = e.target.closest('.todo-del');
        const todos = getTodos();
        if (check) {
            const i = parseInt(check.dataset.i);
            todos[i].done = !todos[i].done;
            save(todos);
            render();
        }
        if (del) {
            const i = parseInt(del.dataset.i);
            todos.splice(i, 1);
            save(todos);
            render();
        }
    });

    // 初始化：从 GitHub 拉取最新数据
    (async () => {
        const remote = await GitHubSync.get('data/todos.json');
        if (remote) {
            _sha = remote.sha;
            saveLocal(remote.content);
        }
        render();
    })();
})();

/* ========== 日常打卡（远程同步） ========== */
(function initCheckin() {
    const btn = document.getElementById('btnCheckin');
    const streakEl = document.getElementById('checkinStreak');
    const grid = document.getElementById('checkinGrid');
    const KEY = 'love-checkin';
    let _sha = null;

    function getData() {
        const raw = JSON.parse(localStorage.getItem(KEY) || '{"dates":[]}');
        // 兼容旧格式：将字符串数组转为对象数组
        raw.dates = raw.dates.map(d => typeof d === 'string' ? { date: d, user: '' } : d);
        return raw;
    }

    function saveLocal(data) {
        localStorage.setItem(KEY, JSON.stringify(data));
    }

    async function pushToGitHub(data) {
        const ok = await GitHubSync.set('data/checkin.json', data, _sha);
        if (ok) {
            const fresh = await GitHubSync.get('data/checkin.json');
            if (fresh) _sha = fresh.sha;
        }
    }

    function save(data) {
        saveLocal(data);
        pushToGitHub(data);
    }

    function getStreak() {
        const data = getData();
        const dates = data.dates.map(d => d.date).sort();
        if (dates.length === 0) return 0;
        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const checkDate = new Date(today);

        for (let i = dates.length - 1; i >= 0; i--) {
            const d = new Date(dates[i]);
            d.setHours(0, 0, 0, 0);
            if (d.getTime() === checkDate.getTime()) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else if (d.getTime() < checkDate.getTime()) {
                break;
            }
        }
        return streak;
    }

    function renderGrid() {
        const data = getData();
        const today = new Date();
        grid.innerHTML = '';
        for (let i = 27; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const ds = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
            const entry = data.dates.find(e => e.date === ds);
            const checked = !!entry;
            const isToday = i === 0;
            const userIcon = entry && entry.user && AppUser.info(entry.user) ? AppUser.info(entry.user).icon : '';
            const div = document.createElement('div');
            div.className = 'checkin-day' + (checked ? ' checked' : '') + (isToday ? ' today' : '');
            div.textContent = d.getDate();
            div.title = ds + (userIcon ? ' (' + userIcon + ')' : '');
            grid.appendChild(div);
        }
    }

    btn.addEventListener('click', () => {
        const today = new Date();
        const ds = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
        const data = getData();
        if (data.dates.some(e => e.date === ds)) {
            btn.textContent = '今天已经打过卡啦 ✓';
            btn.disabled = true;
            return;
        }
        data.dates.push({ date: ds, user: AppUser.get() || 'unknown' });
        save(data);
        streakEl.textContent = '连续打卡: ' + getStreak() + ' 天';
        btn.textContent = '已打卡 ✓';
        btn.disabled = true;
        renderGrid();
    });

    // 初始化：从 GitHub 拉取
    (async () => {
        const remote = await GitHubSync.get('data/checkin.json');
        if (remote) {
            _sha = remote.sha;
            saveLocal(remote.content);
        }
        const today = new Date();
        const ds = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
        const data = getData();
        if (data.dates.some(e => e.date === ds)) {
            btn.textContent = '已打卡 ✓';
            btn.disabled = true;
        }
        streakEl.textContent = '连续打卡: ' + getStreak() + ' 天';
        renderGrid();
    })();
})();

/* ========== 备忘录 ========== */
(function initMemo() {
    const area = document.getElementById('memoArea');
    const status = document.getElementById('memoStatus');
    const KEY = 'love-memo';

    area.value = localStorage.getItem(KEY) || '';

    let saveTimer;
    area.addEventListener('input', () => {
        status.textContent = '保存中...';
        clearTimeout(saveTimer);
        saveTimer = setTimeout(() => {
            localStorage.setItem(KEY, area.value);
            status.textContent = '已自动保存 ✓';
        }, 500);
    });
})();

/* ========== 喝水提醒（远程同步） ========== */
(function initWater() {
    const cupsEl = document.getElementById('waterCups');
    const fillEl = document.getElementById('waterFill');
    const addBtn = document.getElementById('btnWaterAdd');
    const resetBtn = document.getElementById('btnWaterReset');
    const timerEl = document.getElementById('waterTimer');
    const KEY = 'love-water';
    let _sha = null;

    function getData() {
        const d = JSON.parse(localStorage.getItem(KEY) || '{"cups":0,"date":""}');
        const today = new Date().toDateString();
        if (d.date !== today) {
            d.cups = 0;
            d.date = today;
        }
        return d;
    }

    function saveLocal(data) {
        localStorage.setItem(KEY, JSON.stringify(data));
    }

    async function pushToGitHub(data) {
        const ok = await GitHubSync.set('data/water.json', data, _sha);
        if (ok) {
            const fresh = await GitHubSync.get('data/water.json');
            if (fresh) _sha = fresh.sha;
        }
    }

    function save(data) {
        saveLocal(data);
        pushToGitHub(data);
    }

    function render() {
        const data = getData();
        cupsEl.textContent = data.cups;
        fillEl.style.width = Math.min(data.cups / 8 * 100, 100) + '%';
    }

    addBtn.addEventListener('click', () => {
        const data = getData();
        if (data.cups < 20) data.cups++;
        save(data);
        render();
    });

    resetBtn.addEventListener('click', () => {
        const data = getData();
        data.cups = 0;
        save(data);
        render();
    });

    // 喝水提醒（每30分钟）
    setInterval(() => {
        const data = getData();
        if (data.cups < 8) {
            timerEl.textContent = '💧 记得喝水！今天已喝 ' + data.cups + ' 杯';
            timerEl.style.color = '#48dbfb';
            setTimeout(() => {
                timerEl.style.color = '';
                timerEl.textContent = '提醒间隔: 30分钟';
            }, 5000);
        }
    }, 30 * 60 * 1000);

    // 初始化：从 GitHub 拉取
    (async () => {
        const remote = await GitHubSync.get('data/water.json');
        if (remote) {
            _sha = remote.sha;
            saveLocal(remote.content);
        }
        render();
    })();
})();

/* ========== 心情记录（远程同步） ========== */
(function initMood() {
    const picker = document.getElementById('moodPicker');
    const history = document.getElementById('moodHistory');
    const KEY = 'love-moods';
    let _sha = null;

    function getData() {
        return JSON.parse(localStorage.getItem(KEY) || '{}');
    }

    function saveLocal(data) {
        localStorage.setItem(KEY, JSON.stringify(data));
    }

    async function pushToGitHub(data) {
        const ok = await GitHubSync.set('data/moods.json', data, _sha);
        if (ok) {
            const fresh = await GitHubSync.get('data/moods.json');
            if (fresh) _sha = fresh.sha;
        }
    }

    function save(data) {
        saveLocal(data);
        pushToGitHub(data);
    }

    function renderHistory() {
        const data = getData();
        const today = new Date();
        history.innerHTML = '';
        for (let i = 13; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const ds = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
            const entry = data[ds];
            const emoji = typeof entry === 'object' ? entry.emoji : (entry || '');
            const user = typeof entry === 'object' && entry.user ? entry.user : '';
            const userIcon = user && AppUser.info(user) ? AppUser.info(user).icon : '';
            const div = document.createElement('div');
            div.className = 'mood-dot';
            div.textContent = emoji;
            div.title = ds + (emoji ? ': ' + emoji : '') + (userIcon ? ' (' + userIcon + ')' : '');
            history.appendChild(div);
        }
    }

    picker.addEventListener('click', (e) => {
        const emoji = e.target.closest('.mood-emoji');
        if (!emoji) return;
        const today = new Date();
        const ds = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
        const data = getData();
        data[ds] = { emoji: emoji.textContent, user: AppUser.get() || 'unknown' };
        save(data);

        picker.querySelectorAll('.mood-emoji').forEach(e => e.classList.remove('selected'));
        emoji.classList.add('selected');
        renderHistory();
    });

    // 初始化：从 GitHub 拉取
    (async () => {
        const remote = await GitHubSync.get('data/moods.json');
        if (remote) {
            _sha = remote.sha;
            saveLocal(remote.content);
        }
        // 检查今天是否已选心情
        const today = new Date();
        const ds = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
        const data = getData();
        if (data[ds]) {
            const todayEmoji = typeof data[ds] === 'object' ? data[ds].emoji : data[ds];
            picker.querySelectorAll('.mood-emoji').forEach(e => {
                if (e.textContent === todayEmoji) e.classList.add('selected');
            });
        }
        renderHistory();
    })();
})();

/* ========== 共同画板 ========== */
(function initDrawBoard() {
    const canvas = document.getElementById('drawCanvas');
    const ctx = canvas.getContext('2d');
    const colorInput = document.getElementById('drawColor');
    const sizeInput = document.getElementById('drawSize');
    const clearBtn = document.getElementById('drawClear');
    const saveBtn = document.getElementById('drawSave');
    const drawList = document.getElementById('drawList');

    let drawing = false;
    let lastX = 0, lastY = 0;

    // 初始化画布
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    function getPos(e) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        if (e.touches) {
            return {
                x: (e.touches[0].clientX - rect.left) * scaleX,
                y: (e.touches[0].clientY - rect.top) * scaleY
            };
        }
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }

    function startDraw(e) {
        e.preventDefault();
        drawing = true;
        const pos = getPos(e);
        lastX = pos.x;
        lastY = pos.y;
    }

    function draw(e) {
        if (!drawing) return;
        e.preventDefault();
        const pos = getPos(e);
        ctx.strokeStyle = colorInput.value;
        ctx.lineWidth = sizeInput.value;
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        lastX = pos.x;
        lastY = pos.y;
    }

    function stopDraw() {
        drawing = false;
    }

    // 鼠标事件
    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDraw);
    canvas.addEventListener('mouseleave', stopDraw);

    // 触摸事件
    canvas.addEventListener('touchstart', startDraw, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stopDraw);

    // 清空
    clearBtn.addEventListener('click', () => {
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    });

    // 保存到 GitHub
    saveBtn.addEventListener('click', async () => {
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 保存中...';
        
        const dataUrl = canvas.toDataURL('image/png');
        const base64 = dataUrl.split(',')[1];
        const now = new Date();
        const timeStr = now.getFullYear() + '-' +
            String(now.getMonth() + 1).padStart(2, '0') + '-' +
            String(now.getDate()).padStart(2, '0') + ' ' +
            String(now.getHours()).padStart(2, '0') + ':' +
            String(now.getMinutes()).padStart(2, '0');
        const user = AppUser.get() || 'unknown';

        try {
            // 获取现有画作列表
            const remote = await GitHubSync.get('data/drawings.json');
            const drawings = remote ? remote.content : [];
            const sha = remote ? remote.sha : null;

            // 添加新画作
            drawings.push({
                image: base64,
                user: user,
                time: timeStr
            });

            // 保存到 GitHub
            const ok = await GitHubSync.set('data/drawings.json', drawings, sha);
            if (ok) {
                alert('画作已保存！');
                // 清空画布
                ctx.fillStyle = '#1a1a2e';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                renderDrawings();
            } else {
                alert('保存失败，请重试');
            }
        } catch (e) {
            console.error('Save drawing failed:', e);
            alert('保存失败');
        }

        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="fas fa-save"></i> 保存';
    });

    function renderDrawings() {
        GitHubSync.get('data/drawings.json').then(remote => {
            const drawings = remote ? remote.content : [];
            drawList.innerHTML = '';
            drawings.slice().reverse().forEach(d => {
                const userIcon = d.user && AppUser.info(d.user) ? AppUser.info(d.user).icon : '';
                const div = document.createElement('div');
                div.className = 'draw-item';
                div.innerHTML = '<img src="data:image/png;base64,' + d.image + '" alt="画作">' +
                    '<div class="draw-item-info">' +
                    '<span>' + userIcon + ' ' + d.time + '</span>' +
                    '</div>';
                drawList.appendChild(div);
            });
        });
    }

    renderDrawings();
    // 每10秒自动刷新
    setInterval(renderDrawings, 10000);
})();

/* ========== 照片墙 ========== */
(function initPhotoWall() {
    const input = document.getElementById('photoInput');
    const uploadBtn = document.getElementById('photoUploadBtn');
    const wall = document.getElementById('photoWall');

    uploadBtn.addEventListener('click', () => input.click());

    input.addEventListener('change', async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        uploadBtn.disabled = true;
        uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 处理中...';

        for (const file of files) {
            // 压缩图片
            const compressed = await compressImage(file, 800, 0.7);
            const base64 = compressed.split(',')[1];
            const now = new Date();
            const timeStr = now.getFullYear() + '-' +
                String(now.getMonth() + 1).padStart(2, '0') + '-' +
                String(now.getDate()).padStart(2, '0') + ' ' +
                String(now.getHours()).padStart(2, '0') + ':' +
                String(now.getMinutes()).padStart(2, '0');
            const user = AppUser.get() || 'unknown';

            // 获取现有照片
            const remote = await GitHubSync.get('data/photos.json');
            const photos = remote ? remote.content : [];
            const sha = remote ? remote.sha : null;

            photos.push({
                image: base64,
                user: user,
                time: timeStr
            });

            const ok = await GitHubSync.set('data/photos.json', photos, sha);
            if (ok) {
                renderPhotos();
            } else {
                alert('上传失败，请重试');
            }
        }

        input.value = '';
        uploadBtn.disabled = false;
        uploadBtn.innerHTML = '<i class="fas fa-camera"></i> 拍照/上传照片';
    });

    // 图片压缩函数
    function compressImage(file, maxWidth, quality) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    
                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', quality));
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    function renderPhotos() {
        GitHubSync.get('data/photos.json').then(remote => {
            const photos = remote ? remote.content : [];
            wall.innerHTML = '';
            photos.slice().reverse().forEach(p => {
                const userIcon = p.user && AppUser.info(p.user) ? AppUser.info(p.user).icon : '';
                const div = document.createElement('div');
                div.className = 'photo-item';
                div.innerHTML = '<img src="data:image/jpeg;base64,' + p.image + '" alt="照片" onclick="window.open(this.src)">' +
                    '<div class="photo-item-info">' +
                    '<span>' + p.time + '</span>' +
                    (userIcon ? '<span class="data-user-tag ' + p.user + '">' + userIcon + '</span>' : '') +
                    '</div>';
                wall.appendChild(div);
            });
        });
    }

    renderPhotos();
    // 每10秒自动刷新
    setInterval(renderPhotos, 10000);
})();

/* ========== 每日任务 ========== */
(function initDailyTask() {
    const tasks = [
        { icon: '💕', text: '给对方一个温暖的拥抱' },
        { icon: '💬', text: '说一句今天最开心的事' },
        { icon: '🎵', text: '一起听一首歌' },
        { icon: '📸', text: '拍一张今天的合照' },
        { icon: '🍳', text: '为TA做一顿饭' },
        { icon: '💌', text: '写一张小纸条给TA' },
        { icon: '🌹', text: '夸TA三个优点' },
        { icon: '🎬', text: '一起看一部电影' },
        { icon: '🚶', text: '一起散步30分钟' },
        { icon: '☕', text: '给TA泡一杯茶' },
        { icon: '💆', text: '给TA按摩5分钟' },
        { icon: '📖', text: '分享一个有趣的故事' },
        { icon: '🎮', text: '一起玩一个游戏' },
        { icon: '🌙', text: '睡前说晚安+我爱你' }
    ];
    const iconEl = document.getElementById('taskIcon');
    const textEl = document.getElementById('taskText');
    const doneBtn = document.getElementById('taskDone');
    const refreshBtn = document.getElementById('taskRefresh');

    function showTask() {
        const idx = Math.floor(Math.random() * tasks.length);
        iconEl.textContent = tasks[idx].icon;
        textEl.textContent = tasks[idx].text;
    }

    doneBtn.addEventListener('click', () => {
        doneBtn.innerHTML = '<i class="fas fa-check"></i> 已完成 ✓';
        doneBtn.style.background = 'var(--accent)';
        doneBtn.style.color = 'white';
    });

    refreshBtn.addEventListener('click', showTask);
    showTask();
})();

/* ========== 爱情兑换券 ========== */
(function initCoupons() {
    const grid = document.getElementById('couponGrid');
    const createBtn = document.getElementById('couponCreateBtn');

    function renderWith(coupons) {
        grid.innerHTML = '';
        coupons.forEach((c, i) => {
            const div = document.createElement('div');
            div.className = 'coupon-card';
            const userIcon = c.user && AppUser.info(c.user) ? AppUser.info(c.user).icon : '';
            div.innerHTML = '<div class="coupon-title">' + c.title + '</div>' +
                '<div class="coupon-from">' + userIcon + ' 发给 ' + (c.to === 'hao' ? '文豪' : '霞霞') + '</div>' +
                (c.redeemed ? '<div style="margin-top:8px;font-size:0.75rem;opacity:0.7;">已兑换 ✓</div>' :
                '<button class="coupon-redeem" data-i="' + i + '">兑换</button>');
            grid.appendChild(div);
        });
    }

    function render() {
        GitHubSync.get('data/coupons.json').then(remote => {
            const coupons = remote ? remote.content : [];
            renderWith(coupons);
        });
    }

    createBtn.addEventListener('click', () => {
        const title = prompt('输入兑换券内容（如：按摩一次）');
        if (!title) return;
        const to = AppUser.get() === 'hao' ? 'xia' : 'hao';
        GitHubSync.get('data/coupons.json').then(remote => {
            const coupons = remote ? remote.content : [];
            const sha = remote ? remote.sha : null;
            coupons.push({ title: title, to: to, user: AppUser.get(), redeemed: false });
            GitHubSync.set('data/coupons.json', coupons, sha).then(() => renderWith(coupons));
        });
    });

    grid.addEventListener('click', (e) => {
        const btn = e.target.closest('.coupon-redeem');
        if (!btn) return;
        const i = parseInt(btn.dataset.i);
        GitHubSync.get('data/coupons.json').then(remote => {
            const coupons = remote ? remote.content : [];
            const sha = remote ? remote.sha : null;
            coupons[i].redeemed = true;
            GitHubSync.set('data/coupons.json', coupons, sha).then(() => renderWith(coupons));
        });
    });

    render();
    setInterval(render, 10000);
})();

/* ========== 亲密打卡 ========== */
(function initIntimacy() {
    const hugBtn = document.getElementById('hugBtn');
    const kissBtn = document.getElementById('kissBtn');
    const holdBtn = document.getElementById('holdBtn');
    const stats = document.getElementById('intimacyStats');

    function renderWith(data) {
        stats.innerHTML = '🤗 拥抱 ' + data.hugs + ' 次 &nbsp;&nbsp; 💋 亲亲 ' + data.kisses + ' 次 &nbsp;&nbsp; 🤝 牵手 ' + data.holds + ' 次';
    }

    function render() {
        GitHubSync.get('data/intimacy.json').then(remote => {
            const data = remote ? remote.content : { hugs: 0, kisses: 0, holds: 0, date: '' };
            renderWith(data);
        });
    }

    function add(type) {
        GitHubSync.get('data/intimacy.json').then(remote => {
            const data = remote ? remote.content : { hugs: 0, kisses: 0, holds: 0 };
            const sha = remote ? remote.sha : null;
            data[type] = (data[type] || 0) + 1;
            GitHubSync.set('data/intimacy.json', data, sha).then(() => renderWith(data));
        });
    }

    hugBtn.addEventListener('click', () => add('hugs'));
    kissBtn.addEventListener('click', () => add('kisses'));
    holdBtn.addEventListener('click', () => add('holds'));
    render();
    setInterval(render, 10000);
})();

/* ========== 时光机 ========== */
(function initTimeMachine() {
    const yearEl = document.getElementById('tmYear');
    const entryEl = document.getElementById('tmEntry');

    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    GitHubSync.get('data/diary.json').then(remote => {
        const diary = remote ? remote.content : {};
        let found = false;
        for (let y = now.getFullYear() - 1; y >= 2025; y--) {
            const key = y + '-' + month + '-' + day;
            const entry = diary[key];
            if (entry) {
                const text = typeof entry === 'object' ? entry.text : entry;
                const userIcon = typeof entry === 'object' && entry.user && AppUser.info(entry.user) ? AppUser.info(entry.user).icon : '';
                yearEl.textContent = y + '年的今天';
                entryEl.innerHTML = userIcon + ' ' + text;
                found = true;
                break;
            }
        }
        if (!found) {
            yearEl.textContent = month + '月' + day + '日';
            entryEl.textContent = '还没有历史记录，去日记区写一篇吧！';
        }
    });
})();

/* ========== 记忆胶囊 ========== */
(function initCapsule() {
    const list = document.getElementById('capsuleList');
    const createBtn = document.getElementById('capsuleCreateBtn');

    function render() {
        GitHubSync.get('data/capsules.json').then(remote => {
            const capsules = remote ? remote.content : [];
            list.innerHTML = '';
            capsules.forEach((c, i) => {
                const openDate = new Date(c.openDate);
                const now = new Date();
                const canOpen = now >= openDate;
                const div = document.createElement('div');
                div.className = 'capsule-item';
                div.innerHTML = '<div class="capsule-icon">💊</div>' +
                    '<div class="capsule-date">封存于 ' + c.created + '</div>' +
                    '<div class="capsule-date">' + (canOpen ? '可以打开了！' : '到 ' + c.openDate + ' 才能打开') + '</div>' +
                    '<button class="capsule-open ' + (canOpen ? '' : 'locked') + '" data-i="' + i + '">' +
                    (canOpen ? '打开' : '🔒 未到期') + '</button>';
                list.appendChild(div);
            });
        });
    }

    createBtn.addEventListener('click', () => {
        const content = prompt('写下想对未来的说的话：');
        if (!content) return;
        const days = prompt('多少天后打开？（如：30）');
        if (!days) return;
        const now = new Date();
        const openDate = new Date(now.getTime() + parseInt(days) * 86400000);
        const openStr = openDate.getFullYear() + '-' + String(openDate.getMonth() + 1).padStart(2, '0') + '-' + String(openDate.getDate()).padStart(2, '0');
        const createdStr = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');

        GitHubSync.get('data/capsules.json').then(remote => {
            const capsules = remote ? remote.content : [];
            const sha = remote ? remote.sha : null;
            capsules.push({ content: content, created: createdStr, openDate: openStr, user: AppUser.get() });
            GitHubSync.set('data/capsules.json', capsules, sha).then(() => render());
        });
    });

    list.addEventListener('click', (e) => {
        const btn = e.target.closest('.capsule-open');
        if (!btn || btn.classList.contains('locked')) return;
        const i = parseInt(btn.dataset.i);
        GitHubSync.get('data/capsules.json').then(remote => {
            const capsules = remote ? remote.content : [];
            alert('💌 ' + capsules[i].content);
        });
    });

    render();
    setInterval(render, 10000);
})();

/* ========== 秘密信箱 ========== */
(function initSecretMail() {
    const sendBtn = document.getElementById('secretSend');
    const inbox = document.getElementById('secretInbox');
    const toSelect = document.getElementById('secretTo');
    const contentArea = document.getElementById('secretContent');

    function render() {
        GitHubSync.get('data/secrets.json').then(remote => {
            const secrets = remote ? remote.content : [];
            const me = AppUser.get();
            const myMail = secrets.filter(s => s.to === me);
            inbox.innerHTML = '';
            if (myMail.length === 0) {
                inbox.innerHTML = '<div style="text-align:center;color:var(--text-secondary);padding:20px;">还没有收到悄悄话</div>';
                return;
            }
            myMail.reverse().forEach(s => {
                const fromIcon = s.from && AppUser.info(s.from) ? AppUser.info(s.from).icon : '';
                const div = document.createElement('div');
                div.className = 'secret-item';
                div.innerHTML = '<div class="secret-item-header"><span>' + fromIcon + ' 来自' + (s.from === 'hao' ? '文豪' : '霞霞') + '</span><span>' + s.time + '</span></div>' +
                    '<div class="secret-item-content">' + s.content + '</div>';
                inbox.appendChild(div);
            });
        });
    }

    sendBtn.addEventListener('click', () => {
        const content = contentArea.value.trim();
        if (!content) return;
        const to = toSelect.value;
        const now = new Date();
        const time = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0') + ' ' + String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');

        GitHubSync.get('data/secrets.json').then(remote => {
            const secrets = remote ? remote.content : [];
            const sha = remote ? remote.sha : null;
            secrets.push({ from: AppUser.get(), to: to, content: content, time: time });
            GitHubSync.set('data/secrets.json', secrets, sha).then(() => {
                contentArea.value = '';
                alert('悄悄话已发送！');
                render();
            });
        });
    });

    render();
    setInterval(render, 10000);
})();

/* ========== 电子宠物 ========== */
(function initPet() {
    const avatar = document.getElementById('petAvatar');
    const moodBar = document.getElementById('petMood');
    const hungerBar = document.getElementById('petHunger');
    const feedBtn = document.getElementById('petFeed');
    const playBtn = document.getElementById('petPlay');
    const petBtn = document.getElementById('petPet');

    function renderWith(pet) {
        moodBar.style.width = pet.mood + '%';
        hungerBar.style.width = pet.hunger + '%';
        if (pet.mood >= 80) avatar.textContent = '😻';
        else if (pet.mood >= 50) avatar.textContent = '🐱';
        else if (pet.mood >= 20) avatar.textContent = '🐣';
        else avatar.textContent = '😿';
    }

    function render() {
        GitHubSync.get('data/pet.json').then(remote => {
            let pet = remote ? remote.content : { mood: 50, hunger: 50 };
            renderWith(pet);
        });
    }

    function update(type, val) {
        GitHubSync.get('data/pet.json').then(remote => {
            const pet = remote ? remote.content : { mood: 50, hunger: 50 };
            const sha = remote ? remote.sha : null;
            pet[type] = Math.min(100, Math.max(0, (pet[type] || 50) + val));
            GitHubSync.set('data/pet.json', pet, sha).then(() => renderWith(pet));
        });
    }

    feedBtn.addEventListener('click', () => { update('hunger', 15); update('mood', 5); });
    playBtn.addEventListener('click', () => { update('mood', 20); update('hunger', -10); });
    petBtn.addEventListener('click', () => { update('mood', 10); });
    render();
    setInterval(render, 10000);
})();

/* ========== 情侣歌单 ========== */
(function initPlaylist() {
    const list = document.getElementById('playlistList');
    const nameInput = document.getElementById('playlistName');
    const artistInput = document.getElementById('playlistArtist');
    const addBtn = document.getElementById('playlistAddBtn');

    function renderWith(songs) {
        list.innerHTML = '';
        songs.forEach(s => {
            const userIcon = s.user && AppUser.info(s.user) ? AppUser.info(s.user).icon : '';
            const div = document.createElement('div');
            div.className = 'playlist-item';
            div.innerHTML = '<div class="playlist-item-icon">🎵</div>' +
                '<div class="playlist-item-info"><div class="playlist-item-name">' + s.name + '</div>' +
                '<div class="playlist-item-artist">' + s.artist + ' ' + userIcon + '</div></div>';
            list.appendChild(div);
        });
    }

    function render() {
        GitHubSync.get('data/playlist.json').then(remote => {
            const songs = remote ? remote.content : [];
            renderWith(songs);
        });
    }

    addBtn.addEventListener('click', () => {
        const name = nameInput.value.trim();
        const artist = artistInput.value.trim();
        if (!name) return;
        GitHubSync.get('data/playlist.json').then(remote => {
            const songs = remote ? remote.content : [];
            const sha = remote ? remote.sha : null;
            songs.push({ name: name, artist: artist || '未知', user: AppUser.get() });
            GitHubSync.set('data/playlist.json', songs, sha).then(() => {
                nameInput.value = '';
                artistInput.value = '';
                // 直接渲染新数据，不等待API
                renderWith(songs);
            });
        });
    });

    render();
    setInterval(render, 10000);
})();

/* ========== 爱情天气预报 ========== */
(function initLoveWeather() {
    const iconEl = document.getElementById('lwIcon');
    const tempEl = document.getElementById('lwTemp');
    const descEl = document.getElementById('lwDesc');
    const refreshBtn = document.getElementById('lwRefresh');

    const weathers = [
        { icon: '☀️', temp: '37°C', desc: '甜蜜高温，注意防暑！' },
        { icon: '🌈', temp: '28°C', desc: '雨后彩虹，爱情更美好' },
        { icon: '🌤️', temp: '25°C', desc: '温暖舒适，刚刚好' },
        { icon: '🌸', temp: '22°C', desc: '春风拂面，浪漫满溢' },
        { icon: '⭐', temp: '18°C', desc: '星光璀璨，适合许愿' },
        { icon: '🌙', temp: '15°C', desc: '月色温柔，适合散步' },
        { icon: '🔥', temp: '42°C', desc: '热恋中，温度爆表！' },
        { icon: '💕', temp: '30°C', desc: '粉红泡泡，甜度满分' },
        { icon: '🌊', temp: '20°C', desc: '平静温馨，细水长流' },
        { icon: '❄️', temp: '5°C', desc: '需要更多温暖拥抱' }
    ];

    function show() {
        const w = weathers[Math.floor(Math.random() * weathers.length)];
        iconEl.textContent = w.icon;
        tempEl.textContent = w.temp;
        descEl.textContent = w.desc;
    }

    refreshBtn.addEventListener('click', show);
    show();
})();

/* ========== 返回顶部 ========== */
(function initBackToTop() {
    const btn = document.getElementById('backToTop');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            btn.classList.add('show');
        } else {
            btn.classList.remove('show');
        }
    });
    
    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
})();

/* ========== 数据导出备份 ========== */
(function initDataExport() {
    const btn = document.getElementById('dataExportBtn');
    
    btn.addEventListener('click', async () => {
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        btn.disabled = true;
        
        try {
            const files = [
                'data/messages.json',
                'data/todos.json',
                'data/diary.json',
                'data/wishes.json',
                'data/moods.json',
                'data/checkin.json',
                'data/water.json',
                'data/drawings.json',
                'data/photos.json',
                'data/coupons.json',
                'data/intimacy.json',
                'data/capsules.json',
                'data/secrets.json',
                'data/pet.json',
                'data/playlist.json'
            ];
            
            const backup = {};
            for (const file of files) {
                const remote = await GitHubSync.get(file);
                if (remote) {
                    backup[file] = remote.content;
                }
            }
            
            // 添加导出时间戳
            backup._exportInfo = {
                exportedAt: new Date().toISOString(),
                exportedBy: AppUser.get()
            };
            
            // 创建下载
            const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const now = new Date();
            const dateStr = now.getFullYear() + String(now.getMonth() + 1).padStart(2, '0') + String(now.getDate()).padStart(2, '0');
            a.download = 'love-backup-' + dateStr + '.json';
            a.click();
            URL.revokeObjectURL(url);
            
            alert('数据已导出备份！');
        } catch (e) {
            console.error('Export failed:', e);
            alert('导出失败，请重试');
        }
        
        btn.innerHTML = '<i class="fas fa-download"></i>';
        btn.disabled = false;
    });
})();

/* ========== 初始化角色系统 ========== */
AppUser.init();
