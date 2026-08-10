/* ========== Supabase 数据同步模块（带缓存） ========== */
const DataSync = (function() {
    let sb = null;
    const CACHE_PREFIX = 'sb-cache-';
    const CACHE_TTL = 5 * 60 * 1000; // 5分钟缓存
    
    function getClient() {
        if (!sb && typeof supabase !== 'undefined') {
            sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        }
        return sb;
    }
    
    // 缓存相关
    function getCacheKey(table, params) {
        return CACHE_PREFIX + table + (params ? '-' + params : '');
    }
    
    function getFromCache(key) {
        try {
            const item = localStorage.getItem(key);
            if (!item) return null;
            const { data, timestamp } = JSON.parse(item);
            if (Date.now() - timestamp > CACHE_TTL) {
                localStorage.removeItem(key);
                return null;
            }
            return data;
        } catch (e) {
            return null;
        }
    }
    
    function setCache(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify({
                data: data,
                timestamp: Date.now()
            }));
        } catch (e) {
            // 忽略存储错误
        }
    }
    
    function clearCache(table) {
        try {
            const keys = Object.keys(localStorage).filter(k => k.startsWith(CACHE_PREFIX));
            keys.forEach(k => {
                if (!table || k.includes(table)) {
                    localStorage.removeItem(k);
                }
            });
        } catch (e) {}
    }
    
    // 获取单条记录（用于单例数据如 pet, intimacy）
    async function getSingle(table, useCache = true) {
        const cacheKey = getCacheKey(table, 'single');
        
        // 先尝试从缓存读取
        if (useCache) {
            const cached = getFromCache(cacheKey);
            if (cached !== null) return cached;
        }
        
        const client = getClient();
        if (!client) return null;
        try {
            const { data, error } = await client.from(table).select('*').limit(1).maybeSingle();
            if (error) {
                console.warn('[DataSync] getSingle error:', error);
                return getFromCache(cacheKey); // 出错时返回旧缓存
            }
            setCache(cacheKey, data);
            return data;
        } catch (e) {
            console.warn('[DataSync] getSingle failed:', e);
            return getFromCache(cacheKey);
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
                if (!error) clearCache(table);
                return !error;
            } else {
                const { error } = await client.from(table).insert(values);
                if (!error) clearCache(table);
                return !error;
            }
        } catch (e) {
            console.warn('[DataSync] updateSingle failed:', e);
            return false;
        }
    }
    
    // 获取列表
    async function getList(table, order = 'id.asc', useCache = true) {
        const cacheKey = getCacheKey(table, order);
        
        // 先尝试从缓存读取
        if (useCache) {
            const cached = getFromCache(cacheKey);
            if (cached !== null) return cached;
        }
        
        const client = getClient();
        if (!client) return [];
        try {
            const [col, dir] = order.split('.');
            const { data, error } = await client.from(table).select('*').order(col, { ascending: dir === 'asc' });
            if (error) {
                console.warn('[DataSync] getList error:', error);
                return getFromCache(cacheKey) || []; // 出错时返回旧缓存
            }
            setCache(cacheKey, data || []);
            return data || [];
        } catch (e) {
            console.warn('[DataSync] getList failed:', e);
            return getFromCache(cacheKey) || [];
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
            clearCache(table);
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
            if (!error) clearCache(table);
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
            if (!error) clearCache(table);
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
    
    // 强制刷新（跳过缓存）
    async function refresh(table, order) {
        if (order) {
            return getList(table, order, false);
        }
        return getSingle(table, false);
    }
    
    return { 
        getClient, 
        getSingle, 
        updateSingle, 
        getList, 
        add, 
        update, 
        remove, 
        subscribe,
        refresh,
        clearCache
    };
})();
