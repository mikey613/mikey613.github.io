/* ========== 嘉宾留言板（惊艳版） ========== */
(function initGuestbook() {
    const input = document.getElementById('gbMessage');
    const nameInput = document.getElementById('gbName');
    const submitBtn = document.getElementById('submitGb');
    const list = document.getElementById('gbList');
    const loading = document.getElementById('gbLoading');

    function renderMessages(messages) {
        // 隐藏加载提示
        if (loading) loading.style.display = 'none';
        
        list.innerHTML = '';
        if (messages.length === 0) {
            list.innerHTML = '<div class="gb-empty"><div class="gb-empty-icon">💌</div>还没有留言，快来抢沙发吧！</div>';
            return;
        }
        messages.forEach(m => {
            const div = document.createElement('div');
            div.className = 'gb-item';
            
            // 确定角色和图标
            const role = m.user_role || 'guest';
            let icon = '💬';
            let badge = '嘉宾';
            if (role === 'hao') { icon = '🤵'; badge = '文豪'; }
            else if (role === 'xia') { icon = '👰'; badge = '霞霞'; }
            
            div.innerHTML = `
                <div class="gb-item-avatar ${role}">${icon}</div>
                <div class="gb-item-header">
                    <span class="gb-item-name">${m.name || '匿名'}</span>
                    <span class="gb-item-badge ${role}">${badge}</span>
                    <span class="gb-item-time">${m.time || ''}</span>
                </div>
                <div class="gb-item-message">${m.message}</div>
            `;
            list.appendChild(div);
        });
    }

    async function loadMessages() {
        const messages = await DataSync.getList('messages', 'id.desc');
        renderMessages(messages);
    }

    async function submitMessage() {
        const message = input.value.trim();
        if (!message) return;
        const name = nameInput.value.trim() || '匿名';
        const time = new Date().toLocaleString('zh-CN');
        
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 发送中...';
        
        await DataSync.add('messages', {
            name: name,
            message: message,
            time: time,
            user_role: AppUser.get() || 'guest'
        });
        
        input.value = '';
        nameInput.value = '';
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> 发送祝福';
        loadMessages();
    }

    submitBtn.addEventListener('click', submitMessage);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submitMessage();
        }
    });

    // 初始化 - 先显示缓存，再后台刷新
    loadMessages();
    // 后台刷新
    setTimeout(() => DataSync.refresh('messages', 'id.desc').then(renderMessages), 100);
    // 实时订阅
    DataSync.subscribe('messages', () => loadMessages());
})();
