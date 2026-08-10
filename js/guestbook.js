/* ========== 嘉宾留言板（Supabase 持久化） ========== */
(function initGuestbook() {
    const input = document.getElementById('msgInput');
    const nameInput = document.getElementById('msgName');
    const submitBtn = document.getElementById('msgSubmit');
    const list = document.getElementById('msgList');

    function renderMessages(messages) {
        list.innerHTML = '';
        messages.forEach(m => {
            const div = document.createElement('div');
            div.className = 'msg-item';
            const userIcon = m.user_role && AppUser.info(m.user_role) ? AppUser.info(m.user_role).icon : '💬';
            div.innerHTML = `
                <div class="msg-header">
                    <span class="msg-icon">${userIcon}</span>
                    <span class="msg-name">${m.name || '匿名'}</span>
                    <span class="msg-time">${m.time || ''}</span>
                </div>
                <div class="msg-content">${m.message}</div>
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
        
        await DataSync.add('messages', {
            name: name,
            message: message,
            time: time,
            user_role: AppUser.get() || 'guest'
        });
        
        input.value = '';
        nameInput.value = '';
        loadMessages();
    }

    submitBtn.addEventListener('click', submitMessage);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') submitMessage();
    });

    // 初始化
    loadMessages();
    // 实时订阅
    DataSync.subscribe('messages', () => loadMessages());
})();
