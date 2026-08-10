/* ========== 角色选择系统 ========== */
const AppUser = (function() {
    const KEY = 'love-user-role';
    const USERS = {
        hao: { name: '文豪', icon: '🤵', color: 'var(--accent-light)' },
        xia: { name: '霞霞', icon: '👰', color: 'var(--pink)' }
    };

    function get() {
        return localStorage.getItem(KEY) || '';
    }

    function set(role) {
        localStorage.setItem(KEY, role);
    }

    function info(role) {
        return USERS[role] || null;
    }

    function init() {
        const overlay = document.getElementById('roleOverlay');
        const badge = document.getElementById('userBadge');
        const badgeIcon = document.getElementById('userBadgeIcon');
        const badgeName = document.getElementById('userBadgeName');
        const switchBtn = document.getElementById('userSwitch');

        function showBadge() {
            const role = get();
            const u = info(role);
            if (!u) return;
            badgeIcon.textContent = u.icon;
            badgeName.textContent = u.name;
            badge.style.display = 'flex';
            overlay.classList.add('hidden');
        }

        document.getElementById('roleHao').addEventListener('click', () => {
            set('hao');
            showBadge();
        });

        document.getElementById('roleXia').addEventListener('click', () => {
            set('xia');
            showBadge();
        });

        switchBtn.addEventListener('click', () => {
            overlay.classList.remove('hidden');
            badge.style.display = 'none';
        });

        // 初始化：如果已选过角色，直接显示
        if (get()) {
            showBadge();
        }
    }

    return { get, set, info, init, USERS };
})();
