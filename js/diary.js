/* ========== 共同日记（Supabase 同步） ========== */
(function initDiary() {
    const calendar = document.getElementById('diaryCalendar');
    const dateInput = document.getElementById('diaryDate');
    const textInput = document.getElementById('diaryText');
    const submitBtn = document.getElementById('diarySubmit');
    let diaryData = {};

    async function loadDiary() {
        const entries = await DataSync.getList('diary');
        diaryData = {};
        entries.forEach(e => { diaryData[e.date] = { text: e.text, user: e.user_role }; });
        renderCalendar();
    }

    function renderCalendar() {
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
            const entry = diaryData[dateStr];
            const hasEntry = entry ? 'has-entry' : '';
            const isToday = d === today ? 'today' : '';
            const entryText = entry ? entry.text : '';
            const entryUser = entry ? entry.user : '';
            const userIcon = entryUser && AppUser.info(entryUser) ? AppUser.info(entryUser).icon : '';
            const tooltip = entryText + (userIcon ? ' (' + userIcon + ')' : '');
            html += '<div class="diary-day ' + hasEntry + ' ' + isToday + '" title="' + tooltip + '">' + d + '</div>';
        }
        calendar.innerHTML = html;
    }

    submitBtn.addEventListener('click', async () => {
        const date = dateInput.value;
        const text = textInput.value.trim();
        if (!date || !text) return;
        // 检查是否已存在
        const existing = await DataSync.getList('diary');
        const found = existing.find(e => e.date === date);
        if (found) {
            await DataSync.update('diary', found.id, { text: text, user_role: AppUser.get() || 'unknown' });
        } else {
            await DataSync.add('diary', { date: date, text: text, user_role: AppUser.get() || 'unknown' });
        }
        textInput.value = '';
        loadDiary();
    });

    const now = new Date();
    dateInput.value = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');

    // 初始化
    loadDiary();
    // 实时订阅
    DataSync.subscribe('diary', () => loadDiary());
})();
