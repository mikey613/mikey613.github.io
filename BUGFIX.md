# Bug 修复记录

## 项目：mikey613.github.io 恋爱纪念网站

---

## 1. Supabase SDK 加载顺序问题

### 问题描述
页面加载后，留言板一直显示"加载留言中..."，心愿墙等功能无响应。

### 根本原因
- Supabase SDK 在 `<head>` 中使用 `defer` 属性加载
- 模块脚本（wishes.js, guestbook.js 等）在 `<body>` 末尾立即执行
- 模块执行时调用 `DataSync.getList()`，但此时 Supabase SDK 尚未加载完成
- `getClient()` 返回 `null`，数据加载失败

### 修复方案
移除 Supabase SDK 的 `defer` 属性，确保同步加载。

### 修改文件
- `index.html` 第 10 行

```diff
- <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2" defer></script>
+ <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

---

## 2. 留言板元素 ID 不匹配

### 问题描述
留言板功能完全无法工作，点击发送按钮无反应。

### 根本原因
HTML 中的元素 ID 与 JavaScript 中引用的 ID 不一致：

| 功能 | HTML ID | JS 引用 ID |
|------|---------|------------|
| 姓名输入 | `gbName` | `msgName` |
| 留言输入 | `gbMessage` | `msgInput` |
| 提交按钮 | `submitGb` | `msgSubmit` |
| 留言列表 | `gbList` | `msgList` |

### 修复方案
更新 `guestbook.js` 使用正确的元素 ID，并添加加载提示隐藏逻辑。

### 修改文件
- `js/guestbook.js`

---

## 3. 兑换券字段名不匹配

### 问题描述
兑换券无法正确显示创建者和接收者，兑换按钮点击无效。

### 根本原因
迁移到 Supabase 后，字段名发生了变化，但渲染代码未更新：

| 旧字段名 (GitHub) | 新字段名 (Supabase) |
|-------------------|---------------------|
| `user` | `user_role` |
| `to` | `target_user` |

另外，兑换按钮使用 `data-i`（数组索引），但点击处理器读取 `data-id`（数据库 ID）。

### 修复方案
- 更新 `renderWith()` 使用正确的字段名
- 将 `data-i` 改为 `data-id`

### 修改文件
- `script.js` 第 1736-1747 行

---

## 4. 歌单字段名不匹配

### 问题描述
歌单中无法显示添加者图标。

### 根本原因
迁移到 Supabase 后，字段名从 `user` 改为 `user_role`，但渲染代码未更新。

### 修复方案
更新 `renderWith()` 中 `s.user` 为 `s.user_role`。

### 修改文件
- `script.js` 第 2195-2206 行

---

## 5. 宠物模块残留无用变量

### 问题描述
代码中存在未使用的变量 `localSha`（原用于 GitHub 存储的 SHA 值）。

### 根本原因
迁移到 Supabase 后不再需要 SHA 值，但变量声明未清理。

### 修复方案
删除 `let localSha = null;` 声明。

### 修改文件
- `script.js` 第 1965 行

---

## 6. Supabase 权限问题 (401 错误)

### 问题描述
所有数据写入操作返回 401 Unauthorized。

### 根本原因
新建的 Supabase 表没有给 `anon` 角色授权。

### 修复方案
在 Supabase SQL Editor 中执行以下 SQL：

```sql
-- 禁用所有表的 RLS
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE todos DISABLE ROW LEVEL SECURITY;
ALTER TABLE diary DISABLE ROW LEVEL SECURITY;
ALTER TABLE wishes DISABLE ROW LEVEL SECURITY;
ALTER TABLE moods DISABLE ROW LEVEL SECURITY;
ALTER TABLE checkin DISABLE ROW LEVEL SECURITY;
ALTER TABLE water DISABLE ROW LEVEL SECURITY;
ALTER TABLE drawings DISABLE ROW LEVEL SECURITY;
ALTER TABLE photos DISABLE ROW LEVEL SECURITY;
ALTER TABLE coupons DISABLE ROW LEVEL SECURITY;
ALTER TABLE intimacy DISABLE ROW LEVEL SECURITY;
ALTER TABLE capsules DISABLE ROW LEVEL SECURITY;
ALTER TABLE secrets DISABLE ROW LEVEL SECURITY;
ALTER TABLE pet DISABLE ROW LEVEL SECURITY;
ALTER TABLE playlist DISABLE ROW LEVEL SECURITY;

-- 给 anon 角色授权
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon;
```

---

## 7. GitHub API 401 错误

### 问题描述
控制台报错 `Failed to load resource: 401 Unauthorized`，请求地址为 `api.github.com`。

### 根本原因
部分功能仍使用 `GitHubSync` 模块访问 GitHub API，但 `GITHUB_TOKEN` 为空。

### 修复方案
将所有剩余功能迁移到 Supabase：
- 画作 (drawings)
- 照片 (photos)
- 兑换券 (coupons)
- 亲密打卡 (intimacy)
- 记忆胶囊 (capsules)
- 秘密信箱 (secrets)
- 电子宠物 (pet)
- 情侣歌单 (playlist)
- 时光机 (diary 历史记录)
- 数据导出功能

### 修改文件
- `script.js` 多处

---

## 8. Supabase 服务器区域问题

### 问题描述
Supabase 服务器位于澳大利亚，访问延迟高。

### 修复方案
1. 创建新的新加坡区域 Supabase 项目
2. 重建所有数据库表
3. 更新 `config.js` 中的 Supabase URL 和 Key

### 修改文件
- `js/config.js`

---

## 9. 10 秒自动刷新问题

### 问题描述
页面每 10 秒自动刷新一次，用户体验差。

### 修复方案
移除所有 `setInterval(render, 10000)` 调用，改用 Supabase 实时订阅 `DataSync.subscribe()`。

### 修改文件
- `js/guestbook.js`
- `js/wishes.js`
- `js/diary.js`
- `js/todo.js`
- `js/checkin.js`
- `js/water.js`
- `js/mood.js`

---

## 10. JS 代码模块化拆分

### 问题描述
`script.js` 文件过大（3000+ 行），维护困难。

### 修复方案
将功能模块拆分为独立文件：

| 文件 | 功能 |
|------|------|
| `js/config.js` | 设备检测、Supabase/GitHub 配置 |
| `js/datasync.js` | Supabase 数据同步模块 |
| `js/github-sync.js` | GitHub 兼容层（已废弃） |
| `js/app-user.js` | 角色选择系统 |
| `js/guestbook.js` | 嘉宾留言板 |
| `js/wishes.js` | 心愿墙 |
| `js/diary.js` | 共同日记 |
| `js/todo.js` | 共享待办 |
| `js/checkin.js` | 日常打卡 |
| `js/water.js` | 喝水提醒 |
| `js/mood.js` | 心情记录 |
| `script.js` | UI 效果和其他功能 |

### 修改文件
- `index.html` - 更新脚本加载顺序
- 创建 `js/` 目录及所有模块文件

---

## 数据库表结构

| 表名 | 字段 | 说明 |
|------|------|------|
| messages | id, name, message, time, user_role | 嘉宾留言 |
| todos | id, text, done, user_role | 共享待办 |
| diary | id, date, text, user_role | 共同日记 |
| wishes | id, text, top_pos, left_pos, delay, user_role | 心愿墙 |
| moods | id, date, emoji, user_role | 心情记录 |
| checkin | id, dates (JSONB) | 日常打卡 |
| water | id, cups, date | 喝水记录 |
| drawings | id, image, user_role, time | 画作 |
| photos | id, image, user_role, time | 照片 |
| coupons | id, title, target_user, user_role, redeemed | 兑换券 |
| intimacy | id, hugs, kisses, holds | 亲密打卡 |
| capsules | id, content, created_date, open_date, user_role | 记忆胶囊 |
| secrets | id, from_user, to_user, content, time | 秘密信箱 |
| pet | id, mood, hunger, clean, energy, coins, total_care | 电子宠物 |
| playlist | id, name, artist, user_role | 情侣歌单 |

---

## 修复日期
2026-08-10
