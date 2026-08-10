/* ========== 共享待办（Supabase 同步） ========== */
(function initTodo() {
    const input = document.getElementById('todoInput');
    const addBtn = document.getElementById('todoAdd');
    const list = document.getElementById('todoList');

    async function loadTodos() {
        const todos = await DataSync.getList('todos');
        render(todos);
    }

    function render(todos) {
        list.innerHTML = '';
        todos.forEach((t) => {
            const li = document.createElement('li');
            li.className = t.done ? 'done' : '';
            const userTag = t.user_role ? '<span class="data-user-tag ' + t.user_role + '">' + (AppUser.info(t.user_role) ? AppUser.info(t.user_role).icon : '') + '</span>' : '';
            li.innerHTML =
                '<span class="todo-check" data-id="' + t.id + '">✓</span>' +
                '<span>' + t.text + '</span>' +
                userTag +
                '<span class="todo-del" data-id="' + t.id + '"><i class="fas fa-times"></i></span>';
            list.appendChild(li);
        });
    }

    addBtn.addEventListener('click', async () => {
        const text = input.value.trim();
        if (!text) return;
        await DataSync.add('todos', { text: text, done: false, user_role: AppUser.get() || 'unknown' });
        input.value = '';
        loadTodos();
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') addBtn.click();
    });

    list.addEventListener('click', async (e) => {
        const check = e.target.closest('.todo-check');
        const del = e.target.closest('.todo-del');
        if (check) {
            const id = parseInt(check.dataset.id);
            const todos = await DataSync.getList('todos');
            const todo = todos.find(t => t.id === id);
            if (todo) {
                await DataSync.update('todos', id, { done: !todo.done });
                loadTodos();
            }
        }
        if (del) {
            const id = parseInt(del.dataset.id);
            await DataSync.remove('todos', id);
            loadTodos();
        }
    });

    // 初始化
    loadTodos();
    // 实时订阅
    DataSync.subscribe('todos', () => loadTodos());
})();
