/* ========== 喝水提醒（Supabase 同步） ========== */
(function initWater() {
    const cupsEl = document.getElementById('waterCups');
    const fillEl = document.getElementById('waterFill');
    const addBtn = document.getElementById('btnWaterAdd');
    const resetBtn = document.getElementById('btnWaterReset');
    const timerEl = document.getElementById('waterTimer');
    let waterData = { cups: 0, date: '' };

    async function loadWater() {
        const record = await DataSync.getSingle('water');
        const today = new Date().toDateString();
        if (record) {
            waterData = { cups: record.cups || 0, date: record.date || today };
        }
        // 如果日期不是今天，重置杯数
        if (waterData.date !== today) {
            waterData.cups = 0;
            waterData.date = today;
            await DataSync.updateSingle('water', { cups: 0, date: today });
        }
        render();
    }

    function render() {
        cupsEl.textContent = waterData.cups;
        fillEl.style.width = Math.min(waterData.cups / 8 * 100, 100) + '%';
    }

    addBtn.addEventListener('click', async () => {
        if (waterData.cups < 20) waterData.cups++;
        await DataSync.updateSingle('water', { cups: waterData.cups, date: waterData.date });
        render();
    });

    resetBtn.addEventListener('click', async () => {
        waterData.cups = 0;
        await DataSync.updateSingle('water', { cups: 0, date: waterData.date });
        render();
    });

    // 喝水提醒（每30分钟）
    setInterval(() => {
        if (waterData.cups < 8) {
            timerEl.textContent = '💧 记得喝水！今天已喝 ' + waterData.cups + ' 杯';
            timerEl.style.color = '#48dbfb';
            setTimeout(() => {
                timerEl.style.color = '';
                timerEl.textContent = '提醒间隔: 30分钟';
            }, 5000);
        }
    }, 30 * 60 * 1000);

    // 初始化
    loadWater();
    // 实时订阅
    DataSync.subscribe('water', () => loadWater());
})();
