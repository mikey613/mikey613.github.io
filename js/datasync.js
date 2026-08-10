/* ========== Supabase 数据同步模块 ========== */
const DataSync = (function() {
    let sb = null;
    
    function getClient() {
        if (!sb && typeof supabase !== 'undefined') {
            sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        }
        return sb;
    }
    
    // 获取单条记录（用于单例数据如 pet, intimacy）
    async function getSingle(table) {
        const client = getClient();
        if (!client) return null;
        try {
            const { data, error } = await client.from(table).select('*').limit(1).maybeSingle();
            if (error) {
                console.warn('[DataSync] getSingle error:', error);
                return null;
            }
            return data;
        } catch (e) {
            console.warn('[DataSync] getSingle failed:', e);
            return null;
        }
    }
    
    // 更新单条记录
    async function updateSingle(table, values) {
        const client = getClient();
        if (!client) return false;
        try {
            // 先检查是否存在
            const { data: existing } = await client.from(table).select('id').limit(1).maybeSingle();
            if (existing) {
                const { error } = await client.from(table).update(values).eq('id', existing.id);
                return !error;
            } else {
                const { error } = await client.from(table).insert(values);
                return !error;
            }
        } catch (e) {
            console.warn('[DataSync] updateSingle failed:', e);
            return false;
        }
    }
    
    // 获取列表
    async function getList(table, order = 'id.asc') {
        const client = getClient();
        if (!client) return [];
        try {
            const [col, dir] = order.split('.');
            const { data, error } = await client.from(table).select('*').order(col, { ascending: dir === 'asc' });
            if (error) {
                console.warn('[DataSync] getList error:', error);
                return [];
            }
            return data || [];
        } catch (e) {
            console.warn('[DataSync] getList failed:', e);
            return [];
        }
    }
    
    // 添加记录
    async function add(table, values) {
        const client = getClient();
        if (!client) return null;
        try {
            const { data, error } = await client.from(table).insert(values).select();
            if (error) {
                console.warn('[DataSync] add error:', error);
                return null;
            }
            return data?.[0] || values;
        } catch (e) {
            console.warn('[DataSync] add failed:', e);
            return null;
        }
    }
    
    // 更新记录
    async function update(table, id, values) {
        const client = getClient();
        if (!client) return false;
        try {
            const { error } = await client.from(table).update(values).eq('id', id);
            return !error;
        } catch (e) {
            console.warn('[DataSync] update failed:', e);
            return false;
        }
    }
    
    // 删除记录
    async function remove(table, id) {
        const client = getClient();
        if (!client) return false;
        try {
            const { error } = await client.from(table).delete().eq('id', id);
            return !error;
        } catch (e) {
            console.warn('[DataSync] remove failed:', e);
            return false;
        }
    }
    
    // 实时订阅
    function subscribe(table, callback) {
        const client = getClient();
        if (!client) return null;
        return client.channel('table-' + table)
            .on('postgres_changes', { event: '*', schema: 'public', table: table }, callback)
            .subscribe();
    }
    
    return { getClient, getSingle, updateSingle, getList, add, update, remove, subscribe };
})();
