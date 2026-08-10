/* ========== 设备检测：移动端降级 ========== */
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const isLowEnd = isMobile || navigator.hardwareConcurrency <= 4;

/* ========== Supabase 配置 ========== */
const SUPABASE_URL = 'https://nlfbzbwyjrkglddyfvct.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sZmJ6Ynd5anJrZ2xkZHlmdmN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzMjQ5MTIsImV4cCI6MjEwMTkwMDkxMn0.AwiYu2mLcXMDnlYazJqRoCsf7gRlL3Y-xO_VJwjLcX8';

/* ========== GitHub 配置（兼容旧功能） ========== */
const GITHUB_TOKEN = ''; // 如需使用旧功能，填入你的 GitHub PAT
