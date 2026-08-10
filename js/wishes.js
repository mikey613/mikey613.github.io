/* ========== 心愿墙（Supabase 同步） ========== */
(function initWishes() {
    const wishInput = document.getElementById('wishInput');
    const addBtn = document.getElementById('addWish');
    const wall = document.getElementById('wishesWall');

    // 显示加载状态
    wall.innerHTML = '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:var(--text-secondary);">正在加载心愿...</div>';

    async function loadWishes() {
        const wishes = await DataSync.getList('wishes');
        renderAll(wishes);
    }

    function renderAll(wishes) {
        wall.innerHTML = '';
        if (wishes.length === 0) {
            wall.innerHTML = '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:var(--text-secondary);">还没有心愿，写下第一个吧 ✨</div>';
            return;
        }
        wishes.forEach(renderWish);
    }

    function renderWish(wish) {
        const el = document.createElement('div');
        el.className = 'wish-star';
        el.style.top = (wish.top_pos || Math.random() * 80 + 5) + '%';
        el.style.left = (wish.left_pos || Math.random() * 75 + 5) + '%';
        el.style.animationDelay = (wish.delay || Math.random() * 2) + 's';
        const userIcon = wish.user_role && AppUser.info(wish.user_role) ? AppUser.info(wish.user_role).icon : '';
        el.innerHTML = '<span>' + wish.text + (userIcon ? ' <small>' + userIcon + '</small>' : '') + '</span>';
        wall.appendChild(el);
    }

    addBtn.addEventListener('click', async () => {
        const text = wishInput.value.trim();
        if (!text) return;
        await DataSync.add('wishes', {
            text: text,
            top_pos: Math.random() * 80 + 5,
            left_pos: Math.random() * 75 + 5,
            delay: Math.random() * 2,
            user_role: AppUser.get() || 'unknown'
        });
        loadWishes();
        wishInput.value = '';
    });

    wishInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') addBtn.click();
    });

    // 初始化
    loadWishes();
    // 实时订阅
    DataSync.subscribe('wishes', () => loadWishes());
})();
