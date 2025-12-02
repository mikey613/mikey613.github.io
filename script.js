// 核心配置信息（可直接修改）
const config = {
    groomName: "李文豪",
    brideName: "叶霞", 
    engagementDate: "2026-01-25", // 订婚日期（公历）
    engagementTime: "12:00",       // 订婚时间
    location: "XX市XX区XX酒店 三楼宴会厅", // 宴会地点
    // 照片配置（可添加/删除/替换）
    photos: [
        { url: "1.png", caption: "初遇的心动" },
        { url: "2.png", caption: "第一次约会" },
        { url: "3.png", caption: "旅行的美好" },
        { url: "4.png", caption: "甜蜜日常" },
        { url: "5.png", caption: "爱的告白" },
        { url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", caption: "浪漫时光" },
        { url: "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", caption: "幸福瞬间" },
        { url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", caption: "携手同行" }
    ]
};

// ==================== 农历转换功能 ====================
class LunarCalendar {
    static lunarInfo = [
        0x04bd8,0x04ae0,0x0a570,0x054d5,0x0d260,0x0d950,0x16554,0x056a0,0x09ad0,0x055d2,
        0x04ae0,0x0a5b6,0x0a4d0,0x0d250,0x1d255,0x0b540,0x0d6a0,0x0ada2,0x095b0,0x14977,
        0x04970,0x0a4b0,0x0b4b5,0x06a50,0x06d40,0x1ab54,0x02b60,0x09570,0x052f2,0x04970,
        0x06566,0x0d4a0,0x0ea50,0x06e95,0x05ad0,0x02b60,0x186e3,0x092e0,0x1c8d7,0x0c950,
        0x0d4a0,0x1d8a6,0x0b550,0x056a0,0x1a5b4,0x025d0,0x092d0,0x0d2b2,0x0a950,0x0b557,
        0x06ca0,0x0b550,0x15355,0x04da0,0x0a5b0,0x14573,0x052b0,0x0a9a8,0x0e950,0x06aa0,
        0x0aea6,0x0ab50,0x04b60,0x0aae4,0x0a570,0x05260,0x0f263,0x0d950,0x05b57,0x056a0,
        0x096d0,0x04dd5,0x04ad0,0x0a4d0,0x0d4d4,0x0d250,0x0d558,0x0b540,0x0b6a0,0x195a6,
        0x095b0,0x049b0,0x0a974,0x0a4b0,0x0b27a,0x06a50,0x06d40,0x0af46,0x0ab60,0x09570,
        0x04af5,0x04970,0x064b0,0x074a3,0x0ea50,0x06b58,0x05ac0,0x0ab60,0x096d5,0x092e0,
        0x0c960,0x0d954,0x0d4a0,0x0da50,0x07552,0x056a0,0x0abb7,0x025d0,0x092d0,0x0cab5,
        0x0a950,0x0b4a0,0x0baa4,0x0ad50,0x055d9,0x04ba0,0x0a5b0,0x15176,0x052b0,0x0a930,
        0x07954,0x06aa0,0x0ad50,0x05b52,0x04b60,0x0a6e6,0x0a4e0,0x0d260,0x0ea65,0x0d530,
        0x05aa0,0x076a3,0x096d0,0x04bd7,0x04ad0,0x0a4d0,0x1d0b6,0x0d250,0x0d520,0x0dd45,
        0x0b5a0,0x056d0,0x055b2,0x049b0,0x0a577,0x0a4b0,0x0aa50,0x1b255,0x06d20,0x0ada0
    ];
    
    static solarTerm = [
        0x41595,0x42496,0x43417,0x543a8,0x55328,0x562a9,
        0x67239,0x681b9,0x6913a,0x7a0ba,0x7b03a,0x7c0ba,
        0x41595,0x42496,0x43417,0x543a8,0x55328,0x562a9,
        0x67239,0x681b9,0x6913a,0x7a0ba,0x7b03a,0x7c0ba
    ];
    
    static Gan = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
    static Zhi = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
    static Shu = ['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪'];
    static LunarMonth = ['正','二','三','四','五','六','七','八','九','十','冬','腊'];
    static LunarDay = ['初一','初二','初三','初四','初五','初六','初七','初八','初九','初十',
        '十一','十二','十三','十四','十五','十六','十七','十八','十九','二十',
        '廿一','廿二','廿三','廿四','廿五','廿六','廿七','廿八','廿九','三十'];
    
    static getLunarDate(solarDate) {
        const year = solarDate.getFullYear();
        const month = solarDate.getMonth() + 1;
        const day = solarDate.getDate();
        
        let springNian = this.getSpring(year);
        let springNian2 = this.getSpring(year + 1);
        
        let lunarYear, lunarMonth, lunarDay, leap;
        let isLeap = false;
        
        if (this.solarToLunar(year, month, day) < springNian) {
            lunarYear = year - 1;
            [lunarMonth, lunarDay, leap] = this.lunarFromSolar(year, month, day);
        } else if (this.solarToLunar(year, month, day) < springNian2) {
            lunarYear = year;
            [lunarMonth, lunarDay, leap] = this.lunarFromSolar(year, month, day);
        } else {
            lunarYear = year + 1;
            [lunarMonth, lunarDay, leap] = this.lunarFromSolar(year, month, day);
        }
        
        const ganZhiYear = this.getGanZhi(lunarYear);
        const shu = this.Shu[(lunarYear - 4) % 12];
        const lunarMonthStr = leap ? `闰${this.LunarMonth[lunarMonth - 1]}` : this.LunarMonth[lunarMonth - 1];
        const lunarDayStr = this.LunarDay[lunarDay - 1];
        
        return {
            ganZhi: ganZhiYear,
            shu: shu,
            month: lunarMonthStr,
            day: lunarDayStr,
            full: `农历${ganZhiYear}${shu}年${lunarMonthStr}月${lunarDayStr}`
        };
    }
    
    static getSpring(year) {
        return this.solarToLunar(year, 2, 4);
    }
    
    static solarToLunar(year, month, day) {
        let n = Math.floor((year - 1900) * 365.2422) + Math.floor((month - 1) * 30.6 + 0.5) + day - 1;
        if (month > 2) n--;
        return n;
    }
    
    static lunarFromSolar(year, month, day) {
        const n = this.solarToLunar(year, month, day);
        const spring = this.getSpring(year);
        let m = n - spring;
        let lunarYear = year;
        if (m < 0) {
            lunarYear--;
            m += this.getLunarYearDays(lunarYear);
        }
        
        let leap = 0;
        let lunarMonth = 1;
        let days = 0;
        
        while (lunarMonth <= 12 && days + (leap ? this.getLeapMonthDays(lunarYear) : this.getLunarMonthDays(lunarYear, lunarMonth)) <= m) {
            days += leap ? this.getLeapMonthDays(lunarYear) : this.getLunarMonthDays(lunarYear, lunarMonth);
            leap = 0;
            lunarMonth++;
            if (this.getLeapMonth(lunarYear) === lunarMonth) {
                leap = 1;
            }
        }
        
        if (leap) {
            lunarMonth--;
            leap = 0;
        }
        
        const lunarDay = m - days + 1;
        if (this.getLeapMonth(lunarYear) === lunarMonth) {
            leap = 1;
            lunarMonth--;
        }
        
        return [lunarMonth, lunarDay, leap];
    }
    
    static getLunarYearDays(year) {
        let days = 0;
        for (let i = 0; i < 12; i++) {
            days += this.getLunarMonthDays(year, i + 1);
        }
        return days;
    }
    
    static getLunarMonthDays(year, month) {
        const info = this.lunarInfo[year - 1900];
        return (info & (0x10000 >> month)) ? 30 : 29;
    }
    
    static getLeapMonth(year) {
        const info = this.lunarInfo[year - 1900];
        return (info & 0xf) ? (info & 0xf) : 0;
    }
    
    static getLeapMonthDays(year) {
        const leapMonth = this.getLeapMonth(year);
        return leapMonth ? this.getLunarMonthDays(year, leapMonth) : 0;
    }
    
    static getGanZhi(year) {
        const gan = (year - 4) % 10;
        const zhi = (year - 4) % 12;
        return this.Gan[gan] + this.Zhi[zhi];
    }
}

// ==================== 本地存储工具函数 ====================
// 存储宾客回执
function saveReply(replyData) {
    let replies = JSON.parse(localStorage.getItem('engagementReplies')) || [];
    replies.unshift(replyData); // 新增回执放在最前面
    localStorage.setItem('engagementReplies', JSON.stringify(replies));
}

// 获取所有宾客回执
function getReplies() {
    return JSON.parse(localStorage.getItem('engagementReplies')) || [];
}

// 存储祝福
function saveWish(wishData) {
    let wishes = JSON.parse(localStorage.getItem('engagementWishes')) || [];
    wishes.unshift(wishData); // 新增祝福放在最前面
    localStorage.setItem('engagementWishes', JSON.stringify(wishes));
}

// 获取所有祝福
function getWishes() {
    return JSON.parse(localStorage.getItem('engagementWishes')) || [];
}

// ==================== 页面初始化 ====================
window.addEventListener('load', () => {
    initPageContent();
    initCarousel();
    initWishWall(); // 初始化祝福墙（读取本地存储）
    initReplyList(); // 初始化回执列表（读取本地存储）
    initScrollAnimation();
    initParticleBackground();
    initReplyForm(); // 初始化回执提交
    initShareFunction();
    initSaveInvitation();
    initClickEffect();
    initModalEvents(); // 初始化弹窗事件
    // 绑定轮播导航按钮事件
    document.querySelector('.carousel-prev').addEventListener('click', prevSlide);
    document.querySelector('.carousel-next').addEventListener('click', nextSlide);
});

// 初始化页面核心内容
function initPageContent() {
    // 格式化订婚日期
    const engagementDate = new Date(config.engagementDate);
    const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const weekDay = weekDays[engagementDate.getDay()];
    
    // 转换农历
    const lunar = LunarCalendar.getLunarDate(engagementDate);
    
    // 更新页面信息
    document.getElementById('engagement-date').textContent = 
        `${engagementDate.getFullYear()}年${String(engagementDate.getMonth() + 1).padStart(2, '0')}月${String(engagementDate.getDate()).padStart(2, '0')}日 中午${config.engagementTime}`;
    
    document.getElementById('lunar-date').textContent = 
        `农历${lunar.ganZhi}${lunar.shu}年${lunar.month}月${lunar.day} ${weekDay}`;
    
    document.getElementById('location').textContent = config.location;
    document.getElementById('traffic-location').innerHTML = 
        `<p><i class="fas fa-map-marker-alt" style="color: var(--primary-color); margin-right: 8px;"></i>
        宴会地点：<strong>${config.location}</strong></p>`;
    
    // 设置分享链接
    document.getElementById('page-url').value = window.location.href;
}

// ==================== 动态翻页动画 ====================
function initScrollAnimation() {
    const sections = document.querySelectorAll('.page-section');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, {
        threshold: 0.1
    });
    
    sections.forEach(section => {
        observer.observe(section);
    });
}

// ==================== 粒子背景效果 ====================
function initParticleBackground() {
    const container = document.getElementById('particle-container');
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        
        // 随机粒子类型（爱心、圆点、小花）
        const particleTypes = ['❤️', '💖', '💘', '🌸', '💍', '•'];
        const type = particleTypes[Math.floor(Math.random() * particleTypes.length)];
        
        particle.innerHTML = type;
        particle.style.position = 'absolute';
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.fontSize = `${5 + Math.random() * 15}px`;
        particle.style.color = ['var(--primary-color)', 'var(--secondary-color)', 'var(--accent-color)'][Math.floor(Math.random() * 3)];
        particle.style.opacity = `${0.3 + Math.random() * 0.7}`;
        particle.style.animation = `float ${5 + Math.random() * 10}s ease-in-out infinite ${Math.random() * 5}s`;
        particle.style.pointerEvents = 'none';
        
        container.appendChild(particle);
    }
}

// ==================== 照片轮播增强版 ====================
let currentSlide = 0;
const carousel = document.getElementById('photo-carousel');
const dotsContainer = document.getElementById('carousel-dots');

function initCarousel() {
    carousel.innerHTML = '';
    dotsContainer.innerHTML = '';
    
    // 添加轮播项
    config.photos.forEach((photo, index) => {
        const slide = document.createElement('div');
        slide.className = 'carousel-item';
        slide.style.backgroundImage = `url(${photo.url})`;
        slide.style.animation = `fadeIn 1s ease-out ${index * 0.2}s`;
        
        const content = document.createElement('div');
        content.className = 'carousel-item-content';
        content.innerHTML = `<h3>${photo.caption}</h3>`;
        
        slide.appendChild(content);
        carousel.appendChild(slide);
        
        // 添加轮播点
        const dot = document.createElement('div');
        dot.className = `carousel-dot ${index === 0 ? 'active' : ''}`;
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
    });
    
    // 自动轮播
    setInterval(nextSlide, 6000);
    
    // 手势滑动支持
    let startX = 0;
    carousel.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
    });
    
    carousel.addEventListener('touchend', (e) => {
        const endX = e.changedTouches[0].clientX;
        const diff = startX - endX;
        
        if (diff > 50) nextSlide();
        if (diff < -50) prevSlide();
    });
}

function goToSlide(index) {
    currentSlide = index;
    updateCarousel();
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % config.photos.length;
    updateCarousel();
}

function prevSlide() {
    currentSlide = (currentSlide - 1 + config.photos.length) % config.photos.length;
    updateCarousel();
}

function updateCarousel() {
    // 计算轮播平移距离（单个轮播项宽度 * 当前索引，向左平移）
    const slideWidth = carousel.offsetWidth;
    carousel.style.transform = `translateX(-${currentSlide * slideWidth}px)`;
    carousel.style.transition = 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
    
    // 更新轮播点激活状态
    const dots = document.querySelectorAll('.carousel-dot');
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
}

// ==================== 祝福墙功能 ====================
function initWishWall() {
    const wishWall = document.getElementById('wish-wall');
    const wishes = getWishes();
    
    if (wishes.length === 0) {
        wishWall.innerHTML = '<div style="text-align: center; color: #999; padding: 30px 0;">暂无祝福，快来写下你的美好祝愿吧～</div>';
        return;
    }
    
    // 渲染祝福列表
    wishWall.innerHTML = wishes.map(wish => `
        <div class="wish-item">
            <div class="wish-author">${wish.author || '匿名祝福'}</div>
            <div class="wish-text">${wish.text}</div>
            <div class="wish-time">${formatTime(wish.time)}</div>
        </div>
    `).join('');
}

// 提交祝福
function submitWish() {
    const author = document.getElementById('wish-author').value.trim();
    const text = document.getElementById('wish-text').value.trim();
    
    if (!text) {
        alert('祝福语不能为空哦～');
        return;
    }
    
    // 构造祝福数据
    const wishData = {
        author: author,
        text: text,
        time: new Date().getTime() // 存储时间戳
    };
    
    // 保存到本地存储
    saveWish(wishData);
    
    // 刷新祝福墙
    initWishWall();
    
    // 清空输入框并关闭弹窗
    document.getElementById('wish-author').value = '';
    document.getElementById('wish-text').value = '';
    document.getElementById('wish-modal').style.display = 'none';
    
    alert('祝福发送成功！感谢您的美好祝愿～');
}

// ==================== 宾客回执功能 ====================
function initReplyList() {
    const replyContent = document.getElementById('reply-content');
    const replyCount = document.getElementById('reply-count');
    const replies = getReplies();
    
    replyCount.textContent = replies.length;
    
    if (replies.length === 0) {
        replyContent.innerHTML = '<div style="text-align: center; color: #999; padding: 20px 0;">暂无宾客提交回执</div>';
        return;
    }
    
    // 渲染回执列表
    replyContent.innerHTML = replies.map(reply => `
        <div class="reply-item">
            <div class="reply-name">${reply.name}</div>
            <div>
                <span class="reply-status ${reply.attendance}">${reply.attendance === 'attend' ? '准时出席' : '无法出席'}</span>
                <span class="reply-count">出席人数：${reply.count}人</span>
            </div>
            ${reply.message ? `<div class="reply-message">留言：${reply.message}</div>` : ''}
            <div class="reply-time">提交时间：${formatTime(reply.time)}</div>
        </div>
    `).join('');
}

// 初始化回执表单提交
function initReplyForm() {
    const form = document.getElementById('reply-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('guest-name').value.trim();
        const attendance = document.getElementById('attendance').value;
        const count = document.getElementById('guest-count').value;
        const message = document.getElementById('guest-message').value.trim();
        
        if (!name || !attendance || !count) {
            alert('请填写完整的回执信息～');
            return;
        }
        
        // 构造回执数据
        const replyData = {
            name: name,
            attendance: attendance,
            count: count,
            message: message,
            time: new Date().getTime() // 存储时间戳
        };
        
        // 保存到本地存储
        saveReply(replyData);
        
        // 刷新回执列表
        initReplyList();
        
        // 重置表单
        form.reset();
        
        alert('回执提交成功！感谢您的配合～');
    });
}

// ==================== 分享功能 ====================
function initShareFunction() {
    const copyBtn = document.getElementById('copy-url');
    const copySuccess = document.getElementById('copy-success');
    const pageUrl = document.getElementById('page-url');
    
    // 复制链接
    copyBtn.addEventListener('click', () => {
        pageUrl.select();
        document.execCommand('copy');
        copySuccess.style.display = 'block';
        setTimeout(() => {
            copySuccess.style.display = 'none';
        }, 2000);
    });
    
    // 模拟社交平台分享（实际项目可替换为真实分享链接）
    const shareWechat = document.getElementById('share-wechat-btn');
    const shareWeibo = document.getElementById('share-weibo-btn');
    const shareQq = document.getElementById('share-qq-btn');
    
    shareWechat.addEventListener('click', () => {
        alert('已复制链接到剪贴板，可粘贴到微信分享给好友～');
        pageUrl.select();
        document.execCommand('copy');
    });
    
    shareWeibo.addEventListener('click', () => {
        const shareText = `${config.groomName} & ${config.brideName} 订婚宴邀请函，诚邀您见证幸福时刻！`;
        const weiboUrl = `https://service.weibo.com/share/share.php?url=${encodeURIComponent(pageUrl.value)}&title=${encodeURIComponent(shareText)}`;
        window.open(weiboUrl, '_blank', 'width=600,height=400');
    });
    
    shareQq.addEventListener('click', () => {
        const shareText = `${config.groomName} & ${config.brideName} 订婚宴邀请函，诚邀您见证幸福时刻！`;
        const qqUrl = `https://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(pageUrl.value)}&title=${encodeURIComponent(shareText)}`;
        window.open(qqUrl, '_blank', 'width=600,height=400');
    });
}

// ==================== 保存邀请函功能 ====================
function initSaveInvitation() {
    const saveBtn = document.getElementById('save-invitation');
    saveBtn.addEventListener('click', () => {
        alert('邀请函保存功能已触发！实际项目中可通过 html2canvas 生成图片并下载～');
        // 实际实现示例（需引入 html2canvas 库）：
        // html2canvas(document.querySelector('.page-container')).then(canvas => {
        //     const link = document.createElement('a');
        //     link.download = `${config.groomName}_${config.brideName}_订婚宴邀请函.png`;
        //     link.href = canvas.toDataURL('image/png');
        //     link.click();
        // });
    });
}

// ==================== 点击效果 ====================
function initClickEffect() {
    const buttons = document.querySelectorAll('.wish-btn, .submit-reply, .carousel-nav, .share-option');
    buttons.forEach(btn => {
        btn.addEventListener('click', function() {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    });
}

// ==================== 弹窗事件 ====================
function initModalEvents() {
    // 祝福弹窗
    const openWishModal = document.getElementById('open-wish-modal');
    const closeWishModal = document.getElementById('close-wish-modal');
    const wishModal = document.getElementById('wish-modal');
    const submitWishBtn = document.getElementById('submit-wish');
    
    openWishModal.addEventListener('click', () => {
        wishModal.style.display = 'flex';
    });
    
    closeWishModal.addEventListener('click', () => {
        wishModal.style.display = 'none';
    });
    
    submitWishBtn.addEventListener('click', submitWish);
    
    // 分享弹窗
    const openShareModal = document.getElementById('open-share-modal');
    const closeShareModal = document.getElementById('close-share-modal');
    const shareModal = document.getElementById('share-modal');
    
    openShareModal.addEventListener('click', () => {
        shareModal.style.display = 'flex';
    });
    
    closeShareModal.addEventListener('click', () => {
        shareModal.style.display = 'none';
    });
    
    // 点击弹窗外部关闭
    window.addEventListener('click', (e) => {
        if (e.target === wishModal) wishModal.style.display = 'none';
        if (e.target === shareModal) shareModal.style.display = 'none';
    });
}

// ==================== 工具函数：格式化时间 ====================
function formatTime(timestamp) {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hour}:${minute}`;
}