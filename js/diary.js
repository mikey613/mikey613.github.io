/* ========== 共同日记（改进版） ========== */
(function initDiary() {
    const calendar = document.getElementById('diaryCalendar');
    const dateInput = document.getElementById('diaryDate');
    const textInput = document.getElementById('diaryText');
    const submitBtn = document.getElementById('diarySubmit');
    let diaryData = {};
    let currentYear = new Date().getFullYear();
    let currentMonth = new Date().getMonth();

    async function loadDiary() {
        const entries = await DataSync.getList('diary');
        diaryData = {};
        entries.forEach(e => { diaryData[e.date] = { text: e.text, user: e.user_role, id: e.id }; });
        renderCalendar();
    }

    function renderCalendar() {
        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const today = new Date();
        const isCurrentMonth = today.getFullYear() === currentYear && today.getMonth() === currentMonth;
        const todayDate = today.getDate();

        const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
        
        let html = `
            <div class="diary-nav">
                <button class="diary-nav-btn" id="diaryPrevMonth"><i class="fas fa-chevron-left"></i></button>
                <span class="diary-month-title">${currentYear}年 ${monthNames[currentMonth]}</span>
                <button class="diary-nav-btn" id="diaryNextMonth"><i class="fas fa-chevron-right"></i></button>
            </div>
        `;

        // 星期标题
        ['日', '一', '二', '三', '四', '五', '六'].forEach(d => {
            html += '<div class="diary-day diary-weekday">' + d + '</div>';
        });

        // 空白格
        for (let i = 0; i < firstDay; i++) {
            html += '<div class="diary-day diary-empty"></div>';
        }

        // 日期格
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = currentYear + '-' + String(currentMonth + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
            const entry = diaryData[dateStr];
            const hasEntry = entry ? 'has-entry' : '';
            const isToday = (isCurrentMonth && d === todayDate) ? 'today' : '';
            const userIcon = entry && entry.user && AppUser.info(entry.user) ? AppUser.info(entry.user).icon : '';
            
            html += `<div class="diary-day ${hasEntry} ${isToday}" data-date="${dateStr}">
                <span class="diary-day-num">${d}</span>
                ${userIcon ? '<span class="diary-day-icon">' + userIcon + '</span>' : ''}
            </div>`;
        }

        calendar.innerHTML = html;

        // 绑定月份切换
        document.getElementById('diaryPrevMonth').addEventListener('click', () => {
            currentMonth--;
            if (currentMonth < 0) { currentMonth = 11; currentYear--; }
            renderCalendar();
        });
        document.getElementById('diaryNextMonth').addEventListener('click', () => {
            currentMonth++;
            if (currentMonth > 11) { currentMonth = 0; currentYear++; }
            renderCalendar();
        });

        // 绑定日期点击
        calendar.querySelectorAll('.diary-day[data-date]').forEach(el => {
            el.addEventListener('click', () => {
                const date = el.dataset.date;
                const entry = diaryData[date];
                if (entry) {
                    showDiaryDetail(date, entry);
                } else {
                    // 自动填充日期
                    dateInput.value = date;
                    textInput.focus();
                }
            });
        });
    }

    function showDiaryDetail(date, entry) {
        const userIcon = entry.user && AppUser.info(entry.user) ? AppUser.info(entry.user).icon : '📝';
        const userName = entry.user && AppUser.info(entry.user) ? AppUser.info(entry.user).name : '未知';
        
        // 创建或获取弹窗
        let modal = document.getElementById('diaryDetailModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'diaryDetailModal';
            modal.className = 'diary-detail-modal';
            document.body.appendChild(modal);
        }
        
        modal.innerHTML = `
            <div class="diary-detail-overlay"></div>
            <div class="diary-detail-content">
                <div class="diary-detail-header">
                    <span class="diary-detail-date">${date}</span>
                    <button class="diary-detail-close">&times;</button>
                </div>
                <div class="diary-detail-body">
                    <div class="diary-detail-user">${userIcon} ${userName}</div>
                    <div class="diary-detail-text">${entry.text}</div>
                </div>
            </div>
        `;
        
        modal.classList.add('show');
        
        // 关闭事件
        modal.querySelector('.diary-detail-close').addEventListener('click', () => {
            modal.classList.remove('show');
        });
        modal.querySelector('.diary-detail-overlay').addEventListener('click', () => {
            modal.classList.remove('show');
        });
    }

    submitBtn.addEventListener('click', async () => {
        const date = dateInput.value;
        const text = textInput.value.trim();
        if (!date || !text) return;
        
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        
        // 检查是否已存在
        const existing = Object.values(diaryData).find(e => {
            const entryDate = date;
            return diaryData[entryDate];
        });
        
        if (diaryData[date]) {
            await DataSync.update('diary', diaryData[date].id, { text: text, user_role: AppUser.get() || 'unknown' });
        } else {
            await DataSync.add('diary', { date: date, text: text, user_role: AppUser.get() || 'unknown' });
        }
        
        textInput.value = '';
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-pen"></i>';
        loadDiary();
    });

    const now = new Date();
    dateInput.value = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');

    // 初始化
    loadDiary();
    // 实时订阅
    DataSync.subscribe('diary', () => loadDiary());
})();
