/* ========== 共同日记（支持一天多条） ========== */
(function initDiary() {
    const calendar = document.getElementById('diaryCalendar');
    const dateInput = document.getElementById('diaryDate');
    const textInput = document.getElementById('diaryText');
    const submitBtn = document.getElementById('diarySubmit');
    let diaryData = {}; // date -> [entries]
    let currentYear = new Date().getFullYear();
    let currentMonth = new Date().getMonth();

    async function loadDiary() {
        const entries = await DataSync.getList('diary');
        diaryData = {};
        entries.forEach(e => {
            if (!diaryData[e.date]) diaryData[e.date] = [];
            diaryData[e.date].push({ text: e.text, user: e.user_role, id: e.id, time: e.created_at });
        });
        renderCalendar();
    }

    function renderCalendar() {
        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const today = new Date();
        const isCurrentMonth = today.getFullYear() === currentYear && today.getMonth() === currentMonth;
        const todayDate = today.getDate();

        const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
        
        // 检查是否是当前月
        const isCurrentMonthView = isCurrentMonth;
        
        let html = `
            <div class="diary-nav">
                <button class="diary-nav-btn" id="diaryPrevMonth"><i class="fas fa-chevron-left"></i></button>
                <span class="diary-month-title">${currentYear}年 ${monthNames[currentMonth]}</span>
                <div class="diary-nav-right">
                    <button class="diary-nav-btn diary-today-btn${isCurrentMonthView ? ' diary-today-hidden' : ''}" id="diaryTodayBtn">今</button>
                    <button class="diary-nav-btn" id="diaryNextMonth"><i class="fas fa-chevron-right"></i></button>
                </div>
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
            const entries = diaryData[dateStr];
            const hasEntry = entries && entries.length > 0 ? 'has-entry' : '';
            const isToday = (isCurrentMonth && d === todayDate) ? 'today' : '';
            const entryCount = entries ? entries.length : 0;
            
            // 显示所有作者的图标
            let iconsHtml = '';
            if (entries) {
                const users = [...new Set(entries.map(e => e.user).filter(Boolean))];
                users.slice(0, 3).forEach(user => {
                    const info = AppUser.info(user);
                    if (info) iconsHtml += '<span class="diary-day-icon">' + info.icon + '</span>';
                });
            }
            
            html += `<div class="diary-day ${hasEntry} ${isToday}" data-date="${dateStr}">
                <span class="diary-day-num">${d}</span>
                <div class="diary-day-icons">${iconsHtml}</div>
                ${entryCount > 1 ? '<span class="diary-day-count">+' + entryCount + '</span>' : ''}
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
        
        // 绑定“今天”按钮
        const todayBtn = document.getElementById('diaryTodayBtn');
        if (todayBtn) {
            todayBtn.addEventListener('click', () => {
                const now = new Date();
                currentYear = now.getFullYear();
                currentMonth = now.getMonth();
                // 更新日期输入框为今天
                const todayStr = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
                dateInput.value = todayStr;
                renderCalendar();
            });
        }

        // 绑定日期点击
        calendar.querySelectorAll('.diary-day[data-date]').forEach(el => {
            el.addEventListener('click', () => {
                const date = el.dataset.date;
                const entries = diaryData[date];
                if (entries && entries.length > 0) {
                    showDiaryDetail(date, entries);
                } else {
                    // 自动填充日期
                    dateInput.value = date;
                    textInput.focus();
                }
            });
        });
    }

    function showDiaryDetail(date, entries) {
        // 创建或获取弹窗
        let modal = document.getElementById('diaryDetailModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'diaryDetailModal';
            modal.className = 'diary-detail-modal';
            document.body.appendChild(modal);
        }
        
        // 按时间排序（最新的在前）
        const sortedEntries = [...entries].sort((a, b) => {
            if (!a.time) return 1;
            if (!b.time) return -1;
            return new Date(b.time) - new Date(a.time);
        });
        
        let entriesHtml = sortedEntries.map((entry, idx) => {
            const userIcon = entry.user && AppUser.info(entry.user) ? AppUser.info(entry.user).icon : '📝';
            const userName = entry.user && AppUser.info(entry.user) ? AppUser.info(entry.user).name : '未知';
            const timeStr = entry.time ? new Date(entry.time).toLocaleString('zh-CN') : '';
            
            return `
                <div class="diary-detail-entry">
                    <div class="diary-detail-entry-header">
                        <span class="diary-detail-user">${userIcon} ${userName}</span>
                        <span class="diary-detail-time">${timeStr}</span>
                    </div>
                    <div class="diary-detail-text">${entry.text}</div>
                </div>
            `;
        }).join('');
        
        modal.innerHTML = `
            <div class="diary-detail-overlay"></div>
            <div class="diary-detail-content">
                <div class="diary-detail-header">
                    <span class="diary-detail-date">${date}</span>
                    <span class="diary-detail-count">${entries.length} 条日记</span>
                    <button class="diary-detail-close">&times;</button>
                </div>
                <div class="diary-detail-body">
                    ${entriesHtml}
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
        if (!date || !text) {
            alert('请选择日期并输入内容');
            return;
        }
        
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        
        try {
            // 总是添加新条目（不覆盖）
            const result = await DataSync.add('diary', { 
                date: date, 
                text: text, 
                user_role: AppUser.get() || 'unknown' 
            });
            
            if (result) {
                textInput.value = '';
                textInput.focus();
                console.log('[Diary] 日记添加成功:', result);
            } else {
                console.error('[Diary] 日记添加失败');
                alert('保存失败，请重试');
            }
        } catch (e) {
            console.error('[Diary] 提交异常:', e);
            alert('保存失败: ' + e.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-pen"></i>';
            loadDiary();
        }
    });

    const now = new Date();
    dateInput.value = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');

    // 初始化
    loadDiary();
    // 实时订阅
    DataSync.subscribe('diary', () => loadDiary());
})();
