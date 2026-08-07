/* ========== 星空画布 ========== */
(function initStarCanvas() {
    const canvas = document.getElementById('starCanvas');
    const ctx = canvas.getContext('2d');
    let stars = [];
    const STAR_COUNT = 200;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
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

    function drawStars() {
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
        requestAnimationFrame(drawStars);
    }

    resize();
    createStars();
    drawStars();

    window.addEventListener('resize', () => {
        resize();
        createStars();
    });
})();

/* ========== 流星效果 ========== */
(function initShootingStars() {
    const container = document.getElementById('shooting-stars');

    function createShootingStar() {
        const star = document.createElement('div');
        star.className = 'shooting-star';
        star.style.top = Math.random() * 50 + '%';
        star.style.left = (Math.random() * 50 + 50) + '%';
        star.style.animationDuration = (Math.random() * 1 + 0.5) + 's';
        container.appendChild(star);

        setTimeout(() => star.remove(), 2000);
    }

    setInterval(createShootingStar, 4000);
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

    links.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('open');
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
})();

/* ========== 心愿墙 ========== */
(function initWishes() {
    const wishInput = document.getElementById('wishInput');
    const addBtn = document.getElementById('addWish');
    const wall = document.getElementById('wishesWall');

    function addWish(text) {
        const wish = document.createElement('div');
        wish.className = 'wish-star';
        // 随机位置，避免太靠边
        const top = Math.random() * 80 + 5;
        const left = Math.random() * 75 + 5;
        wish.style.top = top + '%';
        wish.style.left = left + '%';
        wish.style.animationDelay = (Math.random() * 2) + 's';
        wish.innerHTML = '<span>' + text + '</span>';
        wall.appendChild(wish);
    }

    addBtn.addEventListener('click', () => {
        const text = wishInput.value.trim();
        if (!text) return;
        addWish(text);
        wishInput.value = '';
    });

    wishInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') addBtn.click();
    });
})();

/* ========== 音乐按钮（占位） ========== */
(function initMusic() {
    const btn = document.getElementById('musicToggle');
    let playing = false;

    btn.addEventListener('click', () => {
        playing = !playing;
        btn.classList.toggle('playing', playing);
        // 可在此处添加实际音频播放逻辑
        // const audio = new Audio('bgm.mp3');
        // playing ? audio.play() : audio.pause();
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

    // 每 2~4 秒发射一条
    function scheduleNext() {
        const delay = Math.random() * 2000 + 2000;
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
    // ============ 配置区 ============
    // 能访问 GitHub 时填写，不能访问时留空即可（自动用本地存储）
    const GITHUB_REPO = ''; // 格式: '用户名/仓库名'，如 'mikey613/mikey613.github.io'
    const GITHUB_TOKEN = ''; // GitHub Personal Access Token
    // ================================

    const useGitHub = !!(GITHUB_REPO && GITHUB_TOKEN);
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
    async function loadMessages() {
        if (useGitHub) {
            // GitHub 模式：从 data/messages.json 读取
            try {
                const resp = await fetch('data/messages.json?t=' + Date.now());
                if (!resp.ok) throw new Error('加载失败');
                const messages = await resp.json();
                renderMessages(messages);
            } catch (e) {
                gbLoading.innerHTML = '<i class="fas fa-exclamation-circle"></i> 加载失败，请刷新重试';
            }
        } else {
            // 本地模式：从 localStorage 读取 + 合并预设数据
            try {
                const resp = await fetch('data/messages.json');
                const preset = resp.ok ? await resp.json() : [];
                const local = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
                // 合并预设和本地的（去重）
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
            html += '<div class="gb-item">' +
                '<div class="gb-item-header">' +
                    '<span class="gb-item-name">' + escapeHtml(msg.name) + '</span>' +
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

    // GitHub 提交
    async function submitToGitHub(name, message) {
        showStatus('正在提交到 GitHub...', 'info');
        try {
            const resp = await fetch('https://api.github.com/repos/' + GITHUB_REPO + '/dispatches', {
                method: 'POST',
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'Authorization': 'token ' + GITHUB_TOKEN,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    event_type: 'new_message',
                    client_payload: { name, message }
                })
            });

            if (resp.status === 204) {
                showStatus('祝福已发送！约 1 分钟后刷新可见', 'success');
                gbName.value = '';
                gbMessage.value = '';
            } else {
                throw new Error('GitHub API: ' + resp.status);
            }
        } catch (e) {
            showStatus('提交失败: ' + e.message, 'error');
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

/* ========== 鼠标拖尾爱心 ========== */
(function initCursorTrail() {
    const hearts = ['❤️', '💕', '💖', '✨', '💗'];
    let lastTime = 0;

    document.addEventListener('mousemove', (e) => {
        const now = Date.now();
        if (now - lastTime < 120) return;
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

/* ========== 点击烟花 ========== */
(function initClickFirework() {
    const colors = ['#ff6b9d', '#7c6ef0', '#f5c842', '#a78bfa', '#ff9ff3', '#48dbfb'];

    document.addEventListener('click', (e) => {
        // 不干扰按钮等交互元素
        if (e.target.closest('button, a, input, textarea, select, .gallery-item, .puzzle-piece, .sweet-card, .nav-link')) return;

        const count = 12 + Math.floor(Math.random() * 8);
        for (let i = 0; i < count; i++) {
            const p = document.createElement('div');
            p.className = 'firework-particle';
            p.style.left = e.clientX + 'px';
            p.style.top = e.clientY + 'px';
            p.style.background = colors[Math.floor(Math.random() * colors.length)];

            const angle = (Math.PI * 2 / count) * i;
            const dist = 40 + Math.random() * 60;
            p.style.setProperty('--tx', Math.cos(angle) * dist + 'px');
            p.style.setProperty('--ty', Math.sin(angle) * dist + 'px');

            document.body.appendChild(p);
            setTimeout(() => p.remove(), 800);
        }
    });
})();

/* ========== 全屏飘浮爱心 ========== */
(function initFloatingHearts() {
    const container = document.getElementById('floatingHearts');
    const emojis = ['❤️', '💕', '💖', '💗', '🌸', '✨', '💫', '🌟'];

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

    // 每 2~4 秒生成一个
    function loop() {
        spawn();
        setTimeout(loop, 2000 + Math.random() * 2000);
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
