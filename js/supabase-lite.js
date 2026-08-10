/* ========== 轻量级 Supabase 客户端（不依赖外部 SDK） ========== */
const supabase = (function() {
    function createClient(supabaseUrl, supabaseKey) {
        const headers = {
            'apikey': supabaseKey,
            'Authorization': 'Bearer ' + supabaseKey,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        };

        return {
            from: function(table) {
                const baseUrl = supabaseUrl + '/rest/v1/' + table;
                
                return {
                    select: function(columns) {
                        columns = columns || '*';
                        return {
                            _url: baseUrl + '?select=' + columns,
                            _order: null,
                            _limit: null,
                            _filters: [],
                            _maybeSingle: false,
                            
                            order: function(col, opts) {
                                const dir = opts && opts.ascending ? 'asc' : 'desc';
                                this._order = col + '.' + dir;
                                return this;
                            },
                            limit: function(n) {
                                this._limit = n;
                                return this;
                            },
                            eq: function(col, val) {
                                this._filters.push(col + '=eq.' + val);
                                return this;
                            },
                            maybeSingle: function() {
                                this._maybeSingle = true;
                                return this;
                            },
                            then: function(resolve, reject) {
                                let url = this._url;
                                if (this._order) url += '&order=' + this._order;
                                if (this._limit) url += '&limit=' + this._limit;
                                this._filters.forEach(function(f) { url += '&' + f; });
                                
                                return fetch(url, { method: 'GET', headers: headers })
                                    .then(function(res) { return res.json(); })
                                    .then(function(data) {
                                        if (Array.isArray(data) && data.length === 0) {
                                            return resolve({ data: null, error: null });
                                        }
                                        resolve({ data: data, error: null });
                                    })
                                    .catch(function(err) {
                                        console.warn('[Supabase] select error:', err);
                                        resolve({ data: null, error: err });
                                    });
                            }
                        };
                    },
                    
                    insert: function(values) {
                        return {
                            _select: null,
                            select: function() {
                                this._select = true;
                                return this;
                            },
                            then: function(resolve, reject) {
                                const url = baseUrl + (this._select ? '?select=*' : '');
                                return fetch(url, {
                                    method: 'POST',
                                    headers: headers,
                                    body: JSON.stringify(values)
                                })
                                .then(function(res) { return res.json(); })
                                .then(function(data) {
                                    resolve({ data: data, error: null });
                                })
                                .catch(function(err) {
                                    console.warn('[Supabase] insert error:', err);
                                    resolve({ data: null, error: err });
                                });
                            }
                        };
                    },
                    
                    update: function(values) {
                        return {
                            _filters: [],
                            eq: function(col, val) {
                                this._filters.push(col + '=eq.' + val);
                                return this;
                            },
                            then: function(resolve, reject) {
                                let url = baseUrl + '?';
                                this._filters.forEach(function(f, i) {
                                    if (i > 0) url += '&';
                                    url += f;
                                });
                                return fetch(url, {
                                    method: 'PATCH',
                                    headers: headers,
                                    body: JSON.stringify(values)
                                })
                                .then(function(res) { return res.json(); })
                                .then(function(data) {
                                    resolve({ data: data, error: null });
                                })
                                .catch(function(err) {
                                    console.warn('[Supabase] update error:', err);
                                    resolve({ data: null, error: err });
                                });
                            }
                        };
                    },
                    
                    delete: function() {
                        return {
                            _filters: [],
                            eq: function(col, val) {
                                this._filters.push(col + '=eq.' + val);
                                return this;
                            },
                            then: function(resolve, reject) {
                                let url = baseUrl + '?';
                                this._filters.forEach(function(f, i) {
                                    if (i > 0) url += '&';
                                    url += f;
                                });
                                return fetch(url, {
                                    method: 'DELETE',
                                    headers: headers
                                })
                                .then(function(res) { return res.json(); })
                                .then(function(data) {
                                    resolve({ data: data, error: null });
                                })
                                .catch(function(err) {
                                    console.warn('[Supabase] delete error:', err);
                                    resolve({ data: null, error: err });
                                });
                            }
                        };
                    }
                };
            },
            
            channel: function(name) {
                // 简化版实时订阅（暂不支持）
                return {
                    on: function() { return this; },
                    subscribe: function() { return this; }
                };
            }
        };
    }

    return { createClient: createClient };
})();
