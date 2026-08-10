/* ========== 日常打卡（Supabase 同步） ========== */
(function initCheckin() {
    const btn = document.getElementById('btnCheckin');
    const streakEl = document.getElementById('checkinStreak');
    const grid = document.getElementById('checkinGrid');
    let checkinData = { dates: [] };

    async function loadCheckin() {
        const record = await DataSync.getSingle('checkin');
        if (record && record.dates) {
            checkinData = { dates: record.dates };
        }
        render();
    }

    function getStreak() {
        const dates = checkinData.dates.map(d => d.date || d).sort();
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

    function render() {
        const today = new Date();
        grid.innerHTML = '';
        for (let i = 27; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const ds = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
            const entry = checkinData.dates.find(e => (e.date || e) === ds);
            const checked = !!entry;
            const isToday = i === 0;
            const userIcon = entry && entry.user && AppUser.info(entry.user) ? AppUser.info(entry.user).icon : '';
            const div = document.createElement('div');
            div.className = 'checkin-day' + (checked ? ' checked' : '') + (isToday ? ' today' : '');
            div.textContent = d.getDate();
            div.title = ds + (userIcon ? ' (' + userIcon + ')' : '');
            grid.appendChild(div);
        }
        streakEl.textContent = '连续打卡: ' + getStreak() + ' 天';
        
        // 检查今天是否已打卡
        const todayStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
        if (checkinData.dates.some(e => (e.date || e) === todayStr)) {
            btn.textContent = '已打卡 ✓';
            btn.disabled = true;
        } else {
            btn.textContent = '立即打卡';
            btn.disabled = false;
        }
    }

    btn.addEventListener('click', async () => {
        const today = new Date();
        const ds = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
        if (checkinData.dates.some(e => (e.date || e) === ds)) {
            btn.textContent = '今天已经打过卡啦 ✓';
            btn.disabled = true;
            return;
        }
        checkinData.dates.push({ date: ds, user: AppUser.get() || 'unknown' });
        await DataSync.updateSingle('checkin', { dates: checkinData.dates });
        render();
    });

    // 初始化
    loadCheckin();
    // 实时订阅
    DataSync.subscribe('checkin', () => loadCheckin());
})();
