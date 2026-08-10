/* ========== 心情记录（Supabase 同步） ========== */
(function initMood() {
    const picker = document.getElementById('moodPicker');
    const history = document.getElementById('moodHistory');
    let moodData = {};

    async function loadMoods() {
        const entries = await DataSync.getList('moods');
        moodData = {};
        entries.forEach(e => { moodData[e.date] = { emoji: e.emoji, user: e.user_role }; });
        renderHistory();
    }

    function renderHistory() {
        const today = new Date();
        history.innerHTML = '';
        for (let i = 13; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const ds = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
            const entry = moodData[ds];
            const emoji = entry ? entry.emoji : '';
            const user = entry ? entry.user : '';
            const userIcon = user && AppUser.info(user) ? AppUser.info(user).icon : '';
            const div = document.createElement('div');
            div.className = 'mood-dot';
            div.textContent = emoji;
            div.title = ds + (emoji ? ': ' + emoji : '') + (userIcon ? ' (' + userIcon + ')' : '');
            history.appendChild(div);
        }
    }

    picker.addEventListener('click', async (e) => {
        const emoji = e.target.closest('.mood-emoji');
        if (!emoji) return;
        const today = new Date();
        const ds = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
        // 检查是否已存在
        const existing = await DataSync.getList('moods');
        const found = existing.find(m => m.date === ds);
        if (found) {
            await DataSync.update('moods', found.id, { emoji: emoji.textContent, user_role: AppUser.get() || 'unknown' });
        } else {
            await DataSync.add('moods', { date: ds, emoji: emoji.textContent, user_role: AppUser.get() || 'unknown' });
        }

        picker.querySelectorAll('.mood-emoji').forEach(e => e.classList.remove('selected'));
        emoji.classList.add('selected');
        loadMoods();
    });

    // 初始化
    loadMoods();
    // 实时订阅
    DataSync.subscribe('moods', () => loadMoods());
})();
