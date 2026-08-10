/* ========== GitHub 兼容层（保留旧功能，新功能用 Supabase） ========== */
const GitHubSync = (function() {
    const REPO = 'mikey613/mikey613.github.io';
    const BRANCH = 'main';
    const API = `https://api.github.com/repos/${REPO}/contents`;

    async function get(path) {
        try {
            const res = await fetch(`${API}/${path}?t=${Date.now()}`, {
                headers: { 'Authorization': `token ${GITHUB_TOKEN}` }
            });
            if (!res.ok) return null;
            const data = await res.json();
            return { content: JSON.parse(atob(data.content)), sha: data.sha };
        } catch (e) { return null; }
    }

    async function set(path, content, sha) {
        try {
            const res = await fetch(`${API}/${path}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${GITHUB_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `update ${path}`,
                    content: btoa(unescape(encodeURIComponent(JSON.stringify(content)))),
                    sha: sha,
                    branch: BRANCH
                })
            });
            if (!res.ok) return false;
            const data = await res.json();
            return data.content?.sha || true;
        } catch (e) { return false; }
    }

    return { get, set };
})();
