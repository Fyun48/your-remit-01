/**
 * 金優匯後台管理系統 JavaScript
 */

// Check authentication
if (sessionStorage.getItem('isLoggedIn') !== 'true') {
    window.location.href = 'login.html';
}

// Initialize data - 將從 Supabase 或 localStorage 載入
let newsData = [];
let imageData = [];
let bannerData = { interval: 2, slides: [] };
let contentData = {
    hero: {
        badge: '專業 · 信賴 · 創新',
        titleLine1: '金融服務',
        titleLine2: '新紀元',
        subtitle: '為您提供最專業的金融解決方案，跨境匯款、投資理財、企業顧問一站式服務'
    },
    about: {
        title: '關於金優匯',
        text1: '金優匯成立於服務客戶的理念之上，致力於提供最專業、最便捷的金融服務。我們深耕金融領域多年，累積豐富的專業經驗，以「誠信、專業、創新、服務」為核心價值，持續為客戶創造價值。',
        text2: '我們的團隊由資深金融專家組成，提供涵蓋國際匯款、金融科技、企業顧問及投資理財等全方位服務，致力成為您最值得信賴的金融夥伴。',
        years: 15,
        customers: 50000,
        locations: 30
    },
    services: {
        service1_title: '國際匯款服務',
        service1_desc: '提供快速、安全、便捷的跨境匯款服務，覆蓋全球主要國家與地區',
        service2_title: '金融科技',
        service2_desc: '運用最新科技打造數位金融平台，提供便捷的線上服務體驗',
        service3_title: '企業顧問',
        service3_desc: '專業團隊提供企業財務規劃、投資分析與風險管理等顧問服務',
        service4_title: '投資理財',
        service4_desc: '多元化投資產品與專業理財規劃，助您實現財富增值目標'
    },
    contact: {
        phone: '02-2796-5959',
        email: 'service@jinyouhui.com.tw',
        address: '台北市內湖區安美街181號'
    }
};

// Service Detail Data
let serviceDetailData = JSON.parse(localStorage.getItem('serviceDetailData')) || {
    '1': {
        title: '國際匯款服務',
        tag: 'International Remittance',
        description: '提供快速、安全、便捷的跨境匯款服務，覆蓋全球主要國家與地區，讓您的資金流動無國界。',
        sections: [
            {
                title: '全球覆蓋網絡',
                content: '我們的國際匯款服務覆蓋全球超過50個國家和地區，與當地主要銀行和金融機構建立合作關係，確保您的匯款能夠快速、安全地送達目的地。無論是商業往來還是個人匯款，我們都能為您提供最佳解決方案。',
                image: ''
            },
            {
                title: '快速到帳服務',
                content: '採用先進的金融科技系統，大幅縮短匯款處理時間。一般匯款可在1-3個工作日內到帳，緊急匯款更可在24小時內完成。實時追蹤功能讓您隨時掌握匯款狀態。',
                image: ''
            },
            {
                title: '安全保障機制',
                content: '我們採用業界最高標準的安全措施，包括SSL加密傳輸、多重身份驗證、防詐騙監控系統等，全方位保護您的資金安全。同時，我們嚴格遵守各國金融法規，確保所有交易合法合規。',
                image: ''
            }
        ]
    },
    '2': {
        title: '金融科技',
        tag: 'FinTech',
        description: '運用最新科技打造數位金融平台，提供便捷的線上服務體驗，讓金融服務觸手可及。',
        sections: [
            {
                title: '智能化平台',
                content: '我們的數位金融平台整合人工智能與大數據分析技術，為用戶提供個性化的金融服務建議。智能風控系統確保每筆交易的安全性，同時簡化操作流程，讓金融服務更加便捷。',
                image: ''
            },
            {
                title: '行動支付解決方案',
                content: '開發完整的行動支付生態系統，支援多種支付方式，包括二維碼支付、NFC感應支付、線上支付等。商戶可輕鬆接入我們的支付系統，消費者享受無縫的支付體驗。',
                image: ''
            },
            {
                title: 'API整合服務',
                content: '提供完善的API接口，讓企業客戶能夠將我們的金融服務無縫整合到自身系統中。專業的技術團隊提供全程支援，確保整合過程順暢高效。',
                image: ''
            }
        ]
    },
    '3': {
        title: '企業顧問',
        tag: 'Business Consulting',
        description: '專業團隊提供企業財務規劃、投資分析與風險管理等顧問服務，助力企業穩健發展。',
        sections: [
            {
                title: '財務規劃諮詢',
                content: '我們的資深財務顧問團隊為企業提供全面的財務規劃服務，包括現金流管理、資本結構優化、預算編制與控制等。透過深入分析企業財務狀況，制定切實可行的改善方案。',
                image: ''
            },
            {
                title: '投資策略分析',
                content: '運用專業的分析工具和豐富的市場經驗，為企業提供投資決策支援。從市場調研、項目評估到風險分析，全方位協助企業做出明智的投資決策。',
                image: ''
            },
            {
                title: '風險管理服務',
                content: '建立完善的風險管理體系，識別、評估和控制企業面臨的各類風險。提供風險預警機制和應急預案，確保企業在複雜的商業環境中穩健運營。',
                image: ''
            }
        ]
    },
    '4': {
        title: '投資理財',
        tag: 'Investment',
        description: '多元化投資產品與專業理財規劃，助您實現財富增值目標，打造穩健的財務未來。',
        sections: [
            {
                title: '多元投資產品',
                content: '提供豐富多樣的投資產品選擇，包括基金、債券、外匯、貴金屬等。根據不同的風險偏好和投資目標，為客戶量身定制投資組合，實現資產的穩健增值。',
                image: ''
            },
            {
                title: '專業理財規劃',
                content: '持證理財規劃師團隊為您提供一對一的理財諮詢服務。從財務診斷、目標設定到方案執行，全程陪伴您實現財務自由的夢想。',
                image: ''
            },
            {
                title: '投資教育服務',
                content: '定期舉辦投資講座和工作坊，分享市場趨勢和投資技巧。提供豐富的線上學習資源，幫助客戶提升投資知識和能力，做出更明智的投資決策。',
                image: ''
            }
        ]
    }
};

// DOM Elements
const sidebar = document.getElementById('sidebar');
const menuToggle = document.getElementById('menuToggle');
const logoutBtn = document.getElementById('logoutBtn');
const navLinks = document.querySelectorAll('.nav-link');
const contentSections = document.querySelectorAll('.content-section');
const toast = document.getElementById('toast');

// Initialize - 從 Supabase 載入資料
document.addEventListener('DOMContentLoaded', async () => {
    // 顯示載入狀態
    showLoadingState();
    
    try {
        // 並行載入所有資料
        // 注意：loadContentData() 在 admin-supabase-helpers.js 中定義（從 Supabase 載入）
        // 而 admin.js 中的 loadContentData() 是用來載入表單資料的
        [newsData, imageData, bannerData, contentData, serviceDetailData] = await Promise.all([
            loadNewsData(),
            loadImageData(),
            loadBannerData(),
            loadContentData(), // 這個是從 admin-supabase-helpers.js 載入的
            loadServiceDetailData()
        ]);
        
        // 初始化所有功能
        initNavigation();
        initLogout();
        initDashboard();
        initContentEditor();
        initNewsManagement();
        initBannerManagement();
        initImageManagement();
        initVisitorStats();
        initContactMessages();
        initNotifications();
        initSettings();
        initServiceDetailEditor();
        initAppSettings();
        updateStats();

        hideLoadingState();
    } catch (error) {
        console.error('載入資料失敗:', error);
        hideLoadingState();
        showToast('載入資料時發生錯誤，使用本地備份資料', 'error');
        
        // Fallback: 使用 localStorage
        newsData = JSON.parse(localStorage.getItem('newsData')) || [];
        imageData = JSON.parse(localStorage.getItem('imageData')) || [];
        bannerData = JSON.parse(localStorage.getItem('bannerData')) || { interval: 2, slides: [] };
        contentData = JSON.parse(localStorage.getItem('contentData')) || {};
        serviceDetailData = JSON.parse(localStorage.getItem('serviceDetailData')) || {};
        
        // 初始化功能
        initNavigation();
        initLogout();
        initDashboard();
        initContentEditor();
        initNewsManagement();
        initBannerManagement();
        initImageManagement();
        initVisitorStats();
        initContactMessages();
        initNotifications();
        initSettings();
        initServiceDetailEditor();
        initAppSettings();
        updateStats();
    }
});

// 載入狀態管理
function showLoadingState() {
    const loading = document.createElement('div');
    loading.id = 'dataLoading';
    loading.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 10000; color: white; font-size: 1.2rem;';
    loading.innerHTML = '<div>正在載入資料...</div>';
    document.body.appendChild(loading);
}

function hideLoadingState() {
    const loading = document.getElementById('dataLoading');
    if (loading) loading.remove();
}

// Navigation
function initNavigation() {
    // Mobile menu toggle
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });

    // Nav link clicks
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.dataset.section;
            
            // Update active nav link
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Show corresponding section
            contentSections.forEach(s => s.classList.remove('active'));
            document.getElementById(section).classList.add('active');
            
            // Close mobile menu
            sidebar.classList.remove('active');
        });
    });

    // Quick action buttons
    document.querySelectorAll('[data-goto]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const section = btn.dataset.goto;
            const action = btn.dataset.action;
            
            // Navigate to section
            navLinks.forEach(l => {
                l.classList.remove('active');
                if (l.dataset.section === section) {
                    l.classList.add('active');
                }
            });
            
            contentSections.forEach(s => s.classList.remove('active'));
            document.getElementById(section).classList.add('active');
            
            // Trigger action if specified
            if (action === 'add' && section === 'news') {
                setTimeout(() => {
                    document.getElementById('addNewsBtn').click();
                }, 100);
            }
        });
    });

    // Clickable stat cards
    document.querySelectorAll('.stat-card.clickable').forEach(card => {
        card.addEventListener('click', () => {
            const section = card.dataset.section;
            if (section) {
                // Navigate to section
                navLinks.forEach(l => {
                    l.classList.remove('active');
                    if (l.dataset.section === section) {
                        l.classList.add('active');
                    }
                });
                
                contentSections.forEach(s => s.classList.remove('active'));
                const targetSection = document.getElementById(section);
                if (targetSection) {
                    targetSection.classList.add('active');
                }
            }
        });
    });
}

// Logout
function initLogout() {
    logoutBtn.addEventListener('click', () => {
        if (confirm('確定要登出嗎？')) {
            sessionStorage.removeItem('isLoggedIn');
            sessionStorage.removeItem('username');
            window.location.href = 'login.html';
        }
    });
}

// Dashboard
function initDashboard() {
    renderRecentNews();
}

function renderRecentNews() {
    const container = document.getElementById('recentNews');
    const recentNews = newsData.slice(0, 3);
    
    container.innerHTML = recentNews.map(news => {
        const date = new Date(news.date);
        const day = date.getDate();
        const month = date.toLocaleString('en-US', { month: 'short' });
        
        return `
            <div class="recent-news-item">
                <div class="news-item-date">
                    <span class="day">${day}</span>
                    <span class="month">${month}</span>
                </div>
                <div class="news-item-content">
                    <span class="news-item-category">${news.category}</span>
                    <h4 class="news-item-title">${news.title}</h4>
                </div>
            </div>
        `;
    }).join('');
}

function updateStats() {
    document.getElementById('newsCount').textContent = newsData.length;
    document.getElementById('imageCount').textContent = imageData.length;
}

// Content Editor
function initContentEditor() {
    const tabs = document.querySelectorAll('.editor-tab');
    const panels = document.querySelectorAll('.editor-panel');
    
    // Tab switching
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;
            
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            panels.forEach(p => p.classList.remove('active'));
            const targetPanel = document.getElementById(`${targetTab}Editor`);
            if (targetPanel) {
                targetPanel.classList.add('active');
            } else {
                console.error(`找不到編輯面板: ${targetTab}Editor`);
            }
        });
    });
    
    // Load saved content into forms
    loadContentDataIntoForms();
    
    // Form submissions
    document.querySelectorAll('.editor-form').forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const section = form.dataset.section;
            const formData = new FormData(form);
            
            const data = {};
            formData.forEach((value, key) => {
                data[key] = value;
            });
            
            contentData[section] = data;
            
            // 儲存到 Supabase
            await saveContentSettings(contentData);
            
            showToast('內容已儲存成功！');
        });
    });
}

function loadContentDataIntoForms() {
    // Hero section
    const heroForm = document.querySelector('[data-section="hero"]');
    if (heroForm && contentData.hero) {
        Object.keys(contentData.hero).forEach(key => {
            const input = heroForm.querySelector(`[name="${key}"]`);
            if (input) input.value = contentData.hero[key];
        });
    }
    
    // About section
    const aboutForm = document.querySelector('[data-section="about"]');
    if (aboutForm && contentData.about) {
        Object.keys(contentData.about).forEach(key => {
            const input = aboutForm.querySelector(`[name="${key}"]`);
            if (input) input.value = contentData.about[key];
        });
    }
    
    // Services section
    const servicesForm = document.querySelector('[data-section="services"]');
    if (servicesForm && contentData.services) {
        Object.keys(contentData.services).forEach(key => {
            const input = servicesForm.querySelector(`[name="${key}"]`);
            if (input) input.value = contentData.services[key];
        });
    }
    
    // Contact section
    const contactForm = document.querySelector('[data-section="contact"]');
    if (contactForm && contentData.contact) {
        Object.keys(contentData.contact).forEach(key => {
            const input = contactForm.querySelector(`[name="${key}"]`);
            if (input) input.value = contentData.contact[key];
        });
    }
}

// News Management
function initNewsManagement() {
    const modal = document.getElementById('newsModal');
    const addBtn = document.getElementById('addNewsBtn');
    const closeBtn = document.getElementById('closeNewsModal');
    const cancelBtn = document.getElementById('cancelNewsBtn');
    const form = document.getElementById('newsForm');
    
    renderNewsList();
    
    // Open modal for new news
    addBtn.addEventListener('click', () => {
        document.getElementById('newsModalTitle').textContent = '新增消息';
        document.getElementById('newsId').value = '';
        form.reset();
        document.getElementById('newsDate').value = new Date().toISOString().split('T')[0];
        modal.classList.add('active');
    });
    
    // Close modal
    const closeModal = () => {
        modal.classList.remove('active');
    };
    
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    
    // Form submit
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = document.getElementById('newsId').value;
        const endDate = document.getElementById('newsEndDate').value;
        
        // 如果沒有 order，自動分配
        let order = newsData.length > 0 ? Math.max(...newsData.map(n => n.order || 0)) + 1 : 1;
        if (id) {
            const existing = newsData.find(n => n.id === parseInt(id));
            if (existing && existing.order) {
                order = existing.order;
            }
        }
        
        const newsItem = {
            id: id ? parseInt(id) : Date.now(),
            title: document.getElementById('newsTitle').value,
            category: document.getElementById('newsCategory').value,
            date: document.getElementById('newsDate').value,
            endDate: endDate || '',
            content: document.getElementById('newsContent').value,
            order: order
        };
        
        // 儲存到 Supabase
        await saveNewsItem(newsItem);
        
        if (id) {
            // Update existing
            const index = newsData.findIndex(n => n.id === newsItem.id || n.id === parseInt(id));
            if (index !== -1) {
                newsData[index] = newsItem;
            } else {
                newsData.push(newsItem);
            }
        } else {
            // Add new
            newsData.push(newsItem);
        }
        
        // 按 order 排序
        newsData.sort((a, b) => (a.order || 999) - (b.order || 999));
        
        await saveNewsData();
        renderNewsList();
        renderRecentNews();
        updateStats();
        closeModal();
        showToast(id ? '消息已更新！' : '消息已新增！');
    });
}

function renderNewsList() {
    const container = document.getElementById('newsList');
    
    if (newsData.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--color-gray-500); padding: 2rem;">目前沒有任何消息</p>';
        return;
    }
    
    // 按 order 排序
    const sortedNews = [...newsData].sort((a, b) => (a.order || 999) - (b.order || 999));
    
    container.innerHTML = sortedNews.map((news, index) => {
        const date = new Date(news.date);
        const day = date.getDate();
        const month = date.toLocaleString('en-US', { month: 'short' });
        
        // 檢查是否過期
        let expiredBadge = '';
        if (news.endDate) {
            const endDate = new Date(news.endDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (endDate < today) {
                expiredBadge = '<span class="expired-badge">已過期</span>';
            } else {
                expiredBadge = `<span class="active-badge">進行中</span>`;
            }
        }
        
        return `
            <div class="news-list-item" data-id="${news.id}">
                <div class="news-list-order">
                    <button class="order-btn" data-action="up" ${index === 0 ? 'disabled' : ''} onclick="moveNewsOrder(${news.id}, 'up')">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="18 15 12 9 6 15"></polyline>
                        </svg>
                    </button>
                    <span>${index + 1}</span>
                    <button class="order-btn" data-action="down" ${index === sortedNews.length - 1 ? 'disabled' : ''} onclick="moveNewsOrder(${news.id}, 'down')">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </button>
                </div>
                <div class="news-list-date">
                    <span class="day">${day}</span>
                    <span class="month">${month}</span>
                </div>
                <div class="news-list-content">
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                        <span class="news-list-category">${news.category}</span>
                        ${expiredBadge}
                        ${news.endDate ? `<span class="end-date-hint">期限: ${new Date(news.endDate).toLocaleDateString('zh-TW')}</span>` : ''}
                    </div>
                    <h3 class="news-list-title">${news.title}</h3>
                    <p class="news-list-excerpt">${news.content}</p>
                </div>
                <div class="news-list-actions">
                    <button class="action-btn edit" onclick="editNews(${news.id})" title="編輯">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="action-btn delete" onclick="deleteNews(${news.id})" title="刪除">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function editNews(id) {
    const news = newsData.find(n => n.id === id);
    if (!news) return;
    
    document.getElementById('newsModalTitle').textContent = '編輯消息';
    document.getElementById('newsId').value = news.id;
    document.getElementById('newsTitle').value = news.title;
    document.getElementById('newsCategory').value = news.category;
    document.getElementById('newsDate').value = news.date;
    document.getElementById('newsEndDate').value = news.endDate || '';
    document.getElementById('newsContent').value = news.content;
    
    document.getElementById('newsModal').classList.add('active');
}

function moveNewsOrder(id, direction) {
    const sortedNews = [...newsData].sort((a, b) => (a.order || 999) - (b.order || 999));
    const index = sortedNews.findIndex(n => n.id === id);
    
    if (index === -1) return;
    
    if (direction === 'up' && index > 0) {
        const temp = sortedNews[index].order;
        sortedNews[index].order = sortedNews[index - 1].order;
        sortedNews[index - 1].order = temp;
    } else if (direction === 'down' && index < sortedNews.length - 1) {
        const temp = sortedNews[index].order;
        sortedNews[index].order = sortedNews[index + 1].order;
        sortedNews[index + 1].order = temp;
    } else {
        return;
    }
    
    // 更新 newsData
    sortedNews.forEach(item => {
        const original = newsData.find(n => n.id === item.id);
        if (original) {
            original.order = item.order;
        }
    });
    
    saveNewsData();
    renderNewsList();
    showToast('排序已更新！');
}

async function deleteNews(id) {
    if (!confirm('確定要刪除這則消息嗎？')) return;
    
    // 從 Supabase 刪除
    await deleteNewsItem(id);
    
    // 從本地陣列刪除
    newsData = newsData.filter(n => n.id !== id);
    await saveNewsData();
    renderNewsList();
    renderRecentNews();
    updateStats();
    showToast('消息已刪除！');
}

async function saveNewsData() {
    // 儲存到 Supabase（如果已設定）
    // 注意：這裡只儲存整個陣列到 localStorage，個別項目的新增/更新/刪除會使用 saveNewsItem/deleteNewsItem
    localStorage.setItem('newsData', JSON.stringify(newsData));
}

// Banner Management
function initBannerManagement() {
    const bannerList = document.getElementById('bannerList');
    const addBannerBtn = document.getElementById('addBannerBtn');
    const intervalInput = document.getElementById('bannerInterval');
    const saveSettingsBtn = document.getElementById('saveBannerSettings');

    if (!bannerList) return;

    // 載入間隔設定
    if (intervalInput) {
        intervalInput.value = bannerData.interval || 2;
    }

    // 儲存設定
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', () => {
            const interval = parseInt(intervalInput.value);
            if (interval >= 1 && interval <= 5) {
                bannerData.interval = interval;
                saveBannerData();
                showToast('輪播間隔設定已儲存！');
            } else {
                showToast('請輸入 1-5 之間的數字', 'error');
                intervalInput.value = bannerData.interval || 2;
            }
        });
    }

    // 渲染輪播圖列表
    function renderBannerList() {
        if (bannerData.slides.length === 0) {
            bannerList.innerHTML = '<p style="text-align: center; color: #888; padding: 2rem;">尚未新增任何輪播圖片</p>';
        } else {
            bannerList.innerHTML = bannerData.slides.map((slide, index) => `
                <div class="banner-item" data-index="${index}">
                    <div class="banner-item-order">
                        <button class="order-btn" data-action="up" ${index === 0 ? 'disabled' : ''}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="18 15 12 9 6 15"></polyline>
                            </svg>
                        </button>
                        <span>${index + 1}</span>
                        <button class="order-btn" data-action="down" ${index === bannerData.slides.length - 1 ? 'disabled' : ''}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </button>
                    </div>
                    <div class="banner-item-preview">
                        ${slide.image ? `<img src="${slide.image}" alt="Banner ${index + 1}">` : '<div class="no-image"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg><span>尚未上傳</span></div>'}
                    </div>
                    <div class="banner-item-content">
                        <div class="form-group">
                            <label>連結網址 (選填，可連結到活動頁面)</label>
                            <input type="url" class="banner-link-input" value="${slide.link || ''}" placeholder="https://example.com/event">
                        </div>
                    </div>
                    <div class="banner-item-actions">
                        <button class="banner-select-btn" data-action="select" title="從圖片庫選擇">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                <polyline points="21 15 16 10 5 21"></polyline>
                            </svg>
                            選擇圖片
                        </button>
                        <button class="banner-upload-btn" data-action="upload">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="17 8 12 3 7 8"></polyline>
                                <line x1="12" y1="3" x2="12" y2="15"></line>
                            </svg>
                            上傳圖片
                        </button>
                        <button class="banner-delete-btn" data-action="delete">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                            刪除
                        </button>
                    </div>
                    <input type="file" class="banner-file-input" accept="image/*" hidden>
                </div>
            `).join('');
        }

        // 更新新增按鈕狀態
        if (addBannerBtn) {
            addBannerBtn.disabled = bannerData.slides.length >= 6;
            if (bannerData.slides.length >= 6) {
                addBannerBtn.innerHTML = `
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="15" y1="9" x2="9" y2="15"></line>
                        <line x1="9" y1="9" x2="15" y2="15"></line>
                    </svg>
                    已達上限（最多 6 張）
                `;
            } else {
                addBannerBtn.innerHTML = `
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    新增輪播圖片
                `;
            }
        }
    }

    // 初始渲染
    renderBannerList();

    // 新增輪播圖
    if (addBannerBtn) {
        addBannerBtn.addEventListener('click', () => {
            if (bannerData.slides.length < 6) {
                bannerData.slides.push({
                    image: '',
                    link: ''
                });
                saveBannerData();
                renderBannerList();
                showToast('已新增輪播圖位置');
            }
        });
    }

    // 輪播圖列表事件委託
    bannerList.addEventListener('click', async (e) => {
        const target = e.target.closest('[data-action]');
        if (!target) return;

        const action = target.dataset.action;
        const bannerItem = target.closest('.banner-item');
        
        if (!bannerItem) {
            console.error('找不到 banner-item');
            return;
        }
        
        const index = parseInt(bannerItem.dataset.index);
        if (isNaN(index)) {
            console.error('無效的 index:', bannerItem.dataset.index);
            return;
        }
        
        console.log('輪播圖操作:', action, 'index:', index);

        switch (action) {
            case 'up':
                if (index > 0) {
                    const temp = bannerData.slides[index];
                    bannerData.slides[index] = bannerData.slides[index - 1];
                    bannerData.slides[index - 1] = temp;
                    try {
                        const bannerDataForStorage = {
                            ...bannerData,
                            slides: bannerData.slides.map(slide => ({
                                id: slide.id,
                                image: slide.image && slide.image.startsWith('http') ? slide.image : '',
                                link: slide.link || '',
                                order: slide.order || 0
                            }))
                        };
                        localStorage.setItem('bannerData', JSON.stringify(bannerDataForStorage));
                    } catch (storageError) {
                        if (storageError.name === 'QuotaExceededError') {
                            console.warn('localStorage 空間不足，跳過本地儲存');
                        }
                    }
                    renderBannerList();
                    saveBannerDataInBackground().catch(error => {
                        console.error('背景同步失敗:', error);
                    });
                }
                break;
            case 'down':
                if (index < bannerData.slides.length - 1) {
                    const temp = bannerData.slides[index];
                    bannerData.slides[index] = bannerData.slides[index + 1];
                    bannerData.slides[index + 1] = temp;
                    try {
                        const bannerDataForStorage = {
                            ...bannerData,
                            slides: bannerData.slides.map(slide => ({
                                id: slide.id,
                                image: slide.image && slide.image.startsWith('http') ? slide.image : '',
                                link: slide.link || '',
                                order: slide.order || 0
                            }))
                        };
                        localStorage.setItem('bannerData', JSON.stringify(bannerDataForStorage));
                    } catch (storageError) {
                        if (storageError.name === 'QuotaExceededError') {
                            console.warn('localStorage 空間不足，跳過本地儲存');
                        }
                    }
                    renderBannerList();
                    saveBannerDataInBackground().catch(error => {
                        console.error('背景同步失敗:', error);
                    });
                }
                break;
            case 'select':
                openImageSelector(index);
                break;
            case 'upload':
                const fileInput = bannerItem.querySelector('.banner-file-input');
                fileInput.click();
                break;
            case 'delete':
                if (confirm('確定要刪除這張輪播圖片嗎？')) {
                    try {
                        console.log('開始刪除輪播圖，index:', index, 'bannerData.slides.length:', bannerData.slides?.length);
                        
                        // 檢查 index 是否有效
                        if (index < 0 || index >= bannerData.slides.length) {
                            console.error('無效的 index:', index);
                            showToast('無效的輪播圖位置', 'error');
                            return;
                        }
                        
                        const slideToDelete = bannerData.slides[index];
                        console.log('要刪除的 slide:', slideToDelete);
                        
                        // 立即從陣列中移除（給用戶即時反饋）
                        bannerData.slides.splice(index, 1);
                        
                        // 立即更新 UI 和 localStorage（只儲存 URL，不儲存 base64）
                        try {
                            const bannerDataForStorage = {
                                ...bannerData,
                                slides: bannerData.slides.map(slide => ({
                                    id: slide.id,
                                    image: slide.image && slide.image.startsWith('http') ? slide.image : '', // 只儲存 URL
                                    link: slide.link || '',
                                    order: slide.order || 0
                                }))
                            };
                            localStorage.setItem('bannerData', JSON.stringify(bannerDataForStorage));
                        } catch (storageError) {
                            if (storageError.name === 'QuotaExceededError') {
                                console.warn('localStorage 空間不足，跳過本地儲存');
                                // 嘗試清除舊資料
                                try {
                                    localStorage.removeItem('bannerData');
                                } catch (e) {
                                    console.error('無法清除 localStorage:', e);
                                }
                            } else {
                                console.error('儲存到 localStorage 失敗:', storageError);
                            }
                        }
                        
                        renderBannerList();
                        showToast('已刪除輪播圖片');
                        console.log('輪播圖已刪除，剩餘數量:', bannerData.slides.length);
                        
                        // 在背景異步刪除 Supabase 記錄並更新 order（不阻塞 UI）
                        (async () => {
                            try {
                                // 如果 slide 有 ID（在 Supabase 中），從 Supabase 刪除
                                if (slideToDelete && slideToDelete.id && typeof slideToDelete.id === 'string' && slideToDelete.id.includes('-')) {
                                    console.log('刪除輪播圖，ID:', slideToDelete.id);
                                    await deleteBannerSlide(slideToDelete.id);
                                }
                                
                                // 更新剩餘 slides 的 order
                                await saveBannerDataInBackground();
                            } catch (error) {
                                console.error('背景刪除失敗:', error);
                                showToast('已刪除，但同步到伺服器時發生錯誤', 'error');
                            }
                        })();
                    } catch (error) {
                        console.error('刪除輪播圖時發生錯誤:', error);
                        showToast('刪除失敗: ' + error.message, 'error');
                    }
                }
                break;
        }
    });

    // 連結輸入變更
    bannerList.addEventListener('input', (e) => {
        if (e.target.classList.contains('banner-link-input')) {
            const bannerItem = e.target.closest('.banner-item');
            const index = parseInt(bannerItem.dataset.index);
            bannerData.slides[index].link = e.target.value;
            
            // 只儲存 URL 到 localStorage（避免 QuotaExceededError）
            try {
                const bannerDataForStorage = {
                    ...bannerData,
                    slides: bannerData.slides.map(slide => ({
                        id: slide.id,
                        image: slide.image && slide.image.startsWith('http') ? slide.image : '', // 只儲存 URL
                        link: slide.link || '',
                        order: slide.order || 0
                    }))
                };
                localStorage.setItem('bannerData', JSON.stringify(bannerDataForStorage));
            } catch (storageError) {
                if (storageError.name === 'QuotaExceededError') {
                    console.warn('localStorage 空間不足，跳過本地儲存');
                } else {
                    console.error('儲存到 localStorage 失敗:', storageError);
                }
            }
            
            // 使用防抖（debounce）延遲同步，避免頻繁請求
            clearTimeout(bannerList.saveTimeout);
            bannerList.saveTimeout = setTimeout(() => {
                saveBannerDataInBackground().catch(error => {
                    console.error('背景同步失敗:', error);
                });
            }, 1000); // 1秒後同步
        }
    });

    // 圖片上傳
    bannerList.addEventListener('change', async (e) => {
        if (e.target.classList.contains('banner-file-input')) {
            const file = e.target.files[0];
            if (!file) {
                console.log('沒有選擇檔案');
                return;
            }

            const bannerItem = e.target.closest('.banner-item');
            if (!bannerItem) {
                console.error('找不到 banner-item');
                showToast('找不到輪播圖項目', 'error');
                return;
            }
            
            const index = parseInt(bannerItem.dataset.index);
            if (isNaN(index)) {
                console.error('無效的 index:', bannerItem.dataset.index);
                showToast('無效的輪播圖位置', 'error');
                return;
            }

            console.log('開始上傳圖片，index:', index, 'bannerData.slides.length:', bannerData.slides?.length);

            const reader = new FileReader();
            reader.onerror = (error) => {
                console.error('讀取檔案失敗:', error);
                showToast('讀取檔案失敗', 'error');
            };
            
            reader.onload = async (event) => {
                try {
                    console.log('圖片上傳完成，index:', index, 'bannerData.slides:', bannerData.slides);
                    
                    // 確保 bannerData.slides 存在
                    if (!bannerData.slides) {
                        bannerData.slides = [];
                    }
                    
                    // 確保該位置的 slide 存在
                    while (bannerData.slides.length <= index) {
                        bannerData.slides.push({
                            image: '',
                            link: ''
                        });
                    }
                    
                    // 先顯示載入狀態
                    showToast('正在上傳圖片...', 'info');
                    
                    // 上傳圖片（嘗試 Supabase Storage，失敗則使用 base64）
                    const uploadResult = await uploadBannerImageToStorage(file, file.name);
                    
                    if (uploadResult && uploadResult.url) {
                        // 更新圖片（可能是 URL 或 base64）
                        bannerData.slides[index].image = uploadResult.url;
                        bannerData.slides[index].order = index;
                        
                        // 如果是 base64，不儲存到 localStorage（避免 QuotaExceededError）
                        // 如果是 URL，可以儲存到 localStorage
                        try {
                            const bannerDataForStorage = {
                                ...bannerData,
                                slides: bannerData.slides.map(slide => ({
                                    id: slide.id,
                                    // 只儲存 URL，不儲存 base64
                                    image: slide.image && slide.image.startsWith('http') ? slide.image : '',
                                    link: slide.link || '',
                                    order: slide.order || 0
                                }))
                            };
                            localStorage.setItem('bannerData', JSON.stringify(bannerDataForStorage));
                        } catch (storageError) {
                            if (storageError.name === 'QuotaExceededError') {
                                console.warn('localStorage 空間不足，跳過本地儲存（base64 圖片只儲存在 Supabase）');
                                // 清除舊的 bannerData
                                try {
                                    localStorage.removeItem('bannerData');
                                } catch (e) {
                                    console.error('無法清除 localStorage:', e);
                                }
                            } else {
                                console.error('儲存到 localStorage 失敗:', storageError);
                            }
                        }
                        
                        renderBannerList();
                        if (uploadResult.isBase64) {
                            showToast('圖片已上傳（使用 base64，僅儲存在 Supabase）');
                        } else {
                            showToast('圖片已上傳');
                        }
                        console.log('UI 已更新');
                        
                        // 在背景異步同步到 Supabase（不阻塞 UI）
                        // base64 會儲存在 Supabase 資料庫中
                        saveBannerDataInBackground().catch(error => {
                            console.error('背景同步失敗:', error);
                            showToast('圖片已上傳，但同步到伺服器時發生錯誤', 'error');
                        });
                    } else {
                        // 上傳失敗（不應該發生，因為會 fallback 到 base64）
                        console.error('上傳圖片失敗');
                        showToast('圖片上傳失敗，請稍後再試', 'error');
                    }
                } catch (error) {
                    console.error('上傳圖片時發生錯誤:', error);
                    showToast('上傳圖片時發生錯誤: ' + error.message, 'error');
                }
            };
            reader.readAsDataURL(file);
        }
    });
}

// 背景同步到 Supabase（不阻塞 UI）
async function saveBannerDataInBackground() {
    console.log('背景同步輪播圖資料，slides 數量:', bannerData.slides?.length);
    
    // 儲存輪播圖設定
    if (bannerData.interval !== undefined) {
        await saveBannerSettings(bannerData.interval);
    }
    
    // 更新每個 slide 的 order 並並行儲存到 Supabase
    if (bannerData.slides && Array.isArray(bannerData.slides)) {
        // 更新 order
        bannerData.slides.forEach((slide, i) => {
            slide.order = i;
        });
        
        // 並行儲存所有 slides（比串行快很多）
        const savePromises = bannerData.slides.map(async (slide, i) => {
            console.log(`儲存輪播圖 ${i}:`, { id: slide.id, hasImage: !!slide.image, order: slide.order });
            
            // 儲存到 Supabase
            await saveBannerSlide(slide);
            
            // 確保 ID 已更新（如果是新增的）
            if (slide.id && typeof slide.id === 'string' && slide.id.includes('-')) {
                // ID 已更新，確保 bannerData 中的 slide 也有這個 ID
                if (!bannerData.slides[i].id || bannerData.slides[i].id !== slide.id) {
                    bannerData.slides[i].id = slide.id;
                }
            }
        });
        
        await Promise.all(savePromises);
    }
    
    // 更新 localStorage（確保資料同步）
    localStorage.setItem('bannerData', JSON.stringify(bannerData));
    console.log('背景同步完成');
}

// 完整儲存（包含清理，用於初始化或手動同步）
async function saveBannerData() {
    console.log('開始儲存輪播圖資料，slides 數量:', bannerData.slides?.length);
    
    // 儲存輪播圖設定
    if (bannerData.interval !== undefined) {
        await saveBannerSettings(bannerData.interval);
    }
    
    // 取得當前所有 slide 的 ID（用於刪除不在列表中的記錄）
    const currentSlideIds = new Set();
    if (bannerData.slides && Array.isArray(bannerData.slides)) {
        bannerData.slides.forEach(slide => {
            if (slide.id && typeof slide.id === 'string' && slide.id.includes('-')) {
                currentSlideIds.add(slide.id);
            }
        });
    }
    
    // 如果 Supabase 已連接，檢查並刪除不在當前列表中的記錄（僅在完整儲存時執行）
    const client = getSupabaseClient();
    if (client && currentSlideIds.size > 0) {
        try {
            // 取得 Supabase 中的所有輪播圖記錄
            const { data: allBanners, error } = await supabaseSelect('banners', {});
            if (!error && allBanners) {
                // 找出需要刪除的記錄（在 Supabase 中但不在當前列表中）
                const toDelete = allBanners.filter(banner => !currentSlideIds.has(banner.id));
                // 並行刪除
                await Promise.all(toDelete.map(banner => {
                    console.log('刪除不在列表中的輪播圖記錄:', banner.id);
                    return deleteBannerSlide(banner.id);
                }));
            }
        } catch (error) {
            console.error('清理輪播圖記錄失敗:', error);
        }
    }
    
    // 更新每個 slide 的 order 並並行儲存
    if (bannerData.slides && Array.isArray(bannerData.slides)) {
        // 更新 order
        bannerData.slides.forEach((slide, i) => {
            slide.order = i;
        });
        
        // 並行儲存所有 slides
        const savePromises = bannerData.slides.map(async (slide, i) => {
            console.log(`儲存輪播圖 ${i}:`, { id: slide.id, hasImage: !!slide.image, order: slide.order });
            
            // 儲存到 Supabase
            await saveBannerSlide(slide);
            
            // 確保 ID 已更新（如果是新增的）
            if (slide.id && typeof slide.id === 'string' && slide.id.includes('-')) {
                // ID 已更新，確保 bannerData 中的 slide 也有這個 ID
                if (!bannerData.slides[i].id || bannerData.slides[i].id !== slide.id) {
                    bannerData.slides[i].id = slide.id;
                }
            }
        });
        
        await Promise.all(savePromises);
    }
    
    // 同時儲存到 localStorage（作為備份）
    localStorage.setItem('bannerData', JSON.stringify(bannerData));
    console.log('輪播圖資料已儲存到 localStorage');
}

// Image Management
function initImageManagement() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    
    // 初始化分組過濾器
    updateGroupFilter();
    
    // 載入顯示模式
    imageViewMode = localStorage.getItem('imageViewMode') || 'grid';
    
    // 初始化顯示
    renderImageGrid('all', imageViewMode);
    
    // 分組過濾器變更
    const groupFilter = document.getElementById('imageGroupFilter');
    if (groupFilter) {
        groupFilter.addEventListener('change', (e) => {
            selectedImageIds.clear(); // 切換分組時清除選擇
            renderImageGrid(e.target.value, imageViewMode);
        });
    }
    
    // 圖片編輯 Modal
    const imageEditModal = document.getElementById('imageEditModal');
    const imageEditForm = document.getElementById('imageEditForm');
    const closeImageEditBtn = document.getElementById('closeImageEditModal');
    const cancelImageEditBtn = document.getElementById('cancelImageEditBtn');
    
    if (closeImageEditBtn) {
        closeImageEditBtn.addEventListener('click', () => {
            imageEditModal.classList.remove('active');
        });
    }
    
    if (cancelImageEditBtn) {
        cancelImageEditBtn.addEventListener('click', () => {
            imageEditModal.classList.remove('active');
        });
    }
    
    if (imageEditForm) {
        // 移除舊的事件監聽器（如果有的話）
        const newForm = imageEditForm.cloneNode(true);
        imageEditForm.parentNode.replaceChild(newForm, imageEditForm);
        const form = document.getElementById('imageEditForm');
        
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('表單提交事件觸發');
                try {
                    await saveImageEdit();
                } catch (error) {
                    console.error('儲存圖片編輯時發生錯誤:', error);
                    showToast('儲存失敗：' + (error.message || '未知錯誤'), 'error');
                }
                return false;
            });
        }
    } else {
        console.error('找不到 imageEditForm 元素');
    }
    
    // Click to upload
    if (uploadArea) {
        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });
        
        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            handleFiles(e.dataTransfer.files);
        });
    }
    
    // File input change
    if (fileInput) {
        fileInput.addEventListener('change', () => {
            handleFiles(fileInput.files);
            fileInput.value = '';
        });
    }
}

// 儲存所有分組（包括沒有圖片的分組）
let allGroups = new Set(['default']);

// 更新分組過濾器選項
function updateGroupFilter() {
    const groupFilter = document.getElementById('imageGroupFilter');
    if (!groupFilter) return;
    
    // 從圖片資料中取得所有分組
    imageData.forEach(img => {
        allGroups.add(img.group || 'default');
    });
    
    // 更新選項（保留「全部」選項和所有已知分組）
    const currentValue = groupFilter.value;
    groupFilter.innerHTML = '<option value="all">全部</option>';
    Array.from(allGroups).sort().forEach(group => {
        const option = document.createElement('option');
        option.value = group;
        option.textContent = group;
        groupFilter.appendChild(option);
    });
    
    // 恢復之前選擇的值
    if (currentValue && Array.from(allGroups).includes(currentValue)) {
        groupFilter.value = currentValue;
    }
}

// 編輯圖片
function editImage(id) {
    console.log('編輯圖片，ID:', id, '類型:', typeof id);
    
    // 嘗試多種方式找到圖片
    let image = imageData.find(img => {
        return img.id === id || 
               img.id === id.toString() || 
               String(img.id) === String(id);
    });
    
    if (!image) {
        console.error('找不到圖片，ID:', id);
        console.log('所有圖片 ID:', imageData.map(img => ({ id: img.id, type: typeof img.id })));
        showToast('找不到圖片', 'error');
        return;
    }
    
    console.log('找到圖片:', image);
    
    const modal = document.getElementById('imageEditModal');
    if (!modal) {
        console.error('找不到圖片編輯 Modal');
        showToast('找不到編輯視窗', 'error');
        return;
    }
    
    // 確保所有元素存在
    const elements = {
        id: document.getElementById('editImageId'),
        name: document.getElementById('editImageName'),
        group: document.getElementById('editImageGroup'),
        description: document.getElementById('editImageDescription'),
        showInBanner: document.getElementById('editImageShowInBanner'),
        preview: document.getElementById('editImagePreviewImg'),
        size: document.getElementById('editImageSize'),
        resolution: document.getElementById('editImageResolution'),
        createdAt: document.getElementById('editImageCreatedAt'),
        mimeType: document.getElementById('editImageMimeType')
    };
    
    // 檢查所有元素是否存在
    for (const [key, element] of Object.entries(elements)) {
        if (!element) {
            console.error(`找不到元素: editImage${key.charAt(0).toUpperCase() + key.slice(1)}`);
            showToast(`找不到編輯表單元素: ${key}`, 'error');
            return;
        }
    }
    
    // 更新分組選項（確保新分組也在選項中）
    updateGroupFilter();
    
    // 確保當前分組在選項中
    if (!allGroups.has(image.group || 'default')) {
        allGroups.add(image.group || 'default');
        updateGroupFilter();
    }
    
    // 更新編輯 Modal 中的分組選單（必須在所有分組都加入後）
    const editGroupSelect = elements.group;
    if (editGroupSelect && editGroupSelect.tagName === 'SELECT') {
        editGroupSelect.innerHTML = '';
        Array.from(allGroups).sort().forEach(group => {
            const option = document.createElement('option');
            option.value = group;
            option.textContent = group;
            editGroupSelect.appendChild(option);
        });
        // 設定當前值
        editGroupSelect.value = image.group || 'default';
        console.log('分組選單已更新，選項:', Array.from(allGroups));
    } else {
        console.error('editGroupSelect 不是 SELECT 元素:', editGroupSelect);
    }
    
    // 填入資料
    elements.id.value = image.id;
    elements.name.value = image.name || '';
    elements.description.value = image.description || '';
    elements.showInBanner.checked = image.showInBanner || false;
    
    // 顯示圖片預覽
    elements.preview.src = image.data;
    
    // 顯示圖片資訊
    elements.size.textContent = image.size || formatFileSize(image.fileSize || 0);
    elements.resolution.textContent = 
        (image.width && image.height) ? `${image.width} × ${image.height}` : '未知';
    elements.createdAt.textContent = 
        image.createdAt ? new Date(image.createdAt).toLocaleString('zh-TW') : '未知';
    elements.mimeType.textContent = image.mimeType || '未知';
    
    modal.classList.add('active');
    console.log('Modal 已開啟，當前分組:', image.group);
}

// 儲存圖片編輯
async function saveImageEdit() {
    console.log('開始儲存圖片編輯...');
    
    const idElement = document.getElementById('editImageId');
    if (!idElement) {
        console.error('找不到 editImageId 元素');
        showToast('找不到圖片 ID', 'error');
        return;
    }
    
    const id = idElement.value;
    console.log('圖片 ID:', id);
    
    if (!id) {
        console.error('圖片 ID 為空');
        showToast('圖片 ID 為空', 'error');
        return;
    }
    
    // 嘗試多種方式找到圖片
    let image = imageData.find(img => {
        return img.id === id || 
               img.id === id.toString() || 
               String(img.id) === String(id);
    });
    
    if (!image) {
        console.error('找不到圖片，ID:', id);
        showToast('找不到圖片', 'error');
        return;
    }
    
    console.log('找到圖片:', image);
    
    // 取得表單值
    const groupElement = document.getElementById('editImageGroup');
    const descriptionElement = document.getElementById('editImageDescription');
    const showInBannerElement = document.getElementById('editImageShowInBanner');
    
    if (!groupElement || !descriptionElement || !showInBannerElement) {
        console.error('找不到表單元素');
        showToast('找不到表單元素', 'error');
        return;
    }
    
    // 更新圖片資訊
    const newGroup = groupElement.value || 'default';
    const newDescription = descriptionElement.value || '';
    const newShowInBanner = showInBannerElement.checked || false;
    
    console.log('新資料:', { newGroup, newDescription, newShowInBanner });
    
    image.group = newGroup;
    image.description = newDescription;
    image.showInBanner = newShowInBanner;
    
    // 添加到分組集合
    allGroups.add(newGroup);
    
    try {
        // 儲存到 Supabase（如果圖片在 Supabase 中）
        if (typeof id === 'string' && id.includes('-')) {
            // UUID 格式，表示在 Supabase 中
            console.log('更新到 Supabase...');
            await updateImageItem(id, {
                group: newGroup,
                description: newDescription,
                show_in_banner: newShowInBanner
            });
            console.log('Supabase 更新成功');
        } else {
            console.log('圖片 ID 不是 UUID，跳過 Supabase 更新');
        }
        
        // 更新本地資料
        await saveImageData();
        console.log('本地資料已更新');
        
        // 更新顯示
        updateGroupFilter();
        const currentFilter = document.getElementById('imageGroupFilter');
        const currentViewMode = localStorage.getItem('imageViewMode') || 'grid';
        renderImageGrid(currentFilter ? currentFilter.value : 'all', currentViewMode);
        
        // 關閉 Modal
        const modal = document.getElementById('imageEditModal');
        if (modal) {
            modal.classList.remove('active');
        }
        
        showToast('圖片資訊已更新！');
        console.log('儲存完成');
    } catch (error) {
        console.error('儲存圖片編輯失敗:', error);
        showToast('儲存失敗：' + error.message, 'error');
    }
}

// 開啟圖片選擇器（用於輪播圖）
function openImageSelector(bannerIndex) {
    // 取得所有標記為可顯示在輪播圖的圖片
    const availableImages = imageData.filter(img => img.showInBanner === true);
    
    if (availableImages.length === 0) {
        showToast('沒有可用的圖片。請先在圖片管理中將圖片標記為「顯示在輪播圖選擇中」', 'error');
        return;
    }
    
    // 建立選擇器 Modal
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'imageSelectorModal';
    modal.dataset.bannerIndex = bannerIndex; // 儲存 bannerIndex 到 modal 的 data 屬性
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 900px;">
            <div class="modal-header">
                <h2>選擇圖片</h2>
                <button class="modal-close" id="closeImageSelectorBtn">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            <div style="padding: 20px;">
                <div class="image-selector-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 15px; max-height: 500px; overflow-y: auto;">
                    ${availableImages.map(img => {
                        const safeId = String(img.id).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
                        return `
                        <div class="image-select-item" data-image-id="${safeId}" data-banner-index="${bannerIndex}" style="cursor: pointer; border: 2px solid #ddd; border-radius: 8px; overflow: hidden; transition: all 0.2s;" onmouseover="this.style.borderColor='#2196F3'" onmouseout="this.style.borderColor='#ddd'">
                            <img src="${img.data}" alt="${img.name}" style="width: 100%; height: 120px; object-fit: cover;">
                            <div style="padding: 8px; font-size: 12px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;" title="${img.name}">${img.name}</div>
                        </div>
                    `;
                    }).join('')}
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 關閉按鈕事件
    const closeBtn = modal.querySelector('#closeImageSelectorBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            closeImageSelector();
        });
    }
    
    // 圖片選擇事件（使用事件委託）
    const imageGrid = modal.querySelector('.image-selector-grid');
    if (imageGrid) {
        imageGrid.addEventListener('click', (e) => {
            const imageItem = e.target.closest('.image-select-item');
            if (imageItem) {
                const imageId = imageItem.dataset.imageId;
                const itemBannerIndex = imageItem.dataset.bannerIndex || bannerIndex;
                console.log('點擊圖片選擇項，imageId:', imageId, 'bannerIndex:', itemBannerIndex);
                if (imageId) {
                    selectImageForBanner(parseInt(itemBannerIndex), imageId);
                } else {
                    console.error('找不到 imageId');
                }
            }
        });
    }
    
    // 點擊背景關閉
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeImageSelector();
        }
    });
    
    console.log('圖片選擇器已開啟，可用圖片數量:', availableImages.length);
}

// 關閉圖片選擇器
function closeImageSelector() {
    const modal = document.getElementById('imageSelectorModal');
    if (modal) {
        modal.remove();
    }
}

// 選擇圖片用於輪播圖
async function selectImageForBanner(bannerIndex, imageId) {
    console.log('選擇圖片，bannerIndex:', bannerIndex, '類型:', typeof bannerIndex, 'imageId:', imageId, '類型:', typeof imageId);
    
    // 確保 bannerIndex 是數字
    const index = parseInt(bannerIndex);
    if (isNaN(index)) {
        console.error('無效的 bannerIndex:', bannerIndex);
        showToast('無效的輪播圖位置', 'error');
        return;
    }
    
    // 確保 bannerIndex 是有效的
    if (index < 0 || index >= bannerData.slides.length) {
        console.error('無效的 bannerIndex:', index, 'slides 長度:', bannerData.slides.length);
        showToast('無效的輪播圖位置', 'error');
        return;
    }
    
    // 嘗試多種方式找到圖片
    let image = imageData.find(img => {
        return String(img.id) === String(imageId) || 
               img.id === imageId || 
               img.id === imageId.toString() ||
               String(img.id) === String(imageId);
    });
    
    if (!image) {
        console.error('找不到圖片，imageId:', imageId);
        console.log('所有圖片 ID:', imageData.map(img => ({ id: img.id, type: typeof img.id })));
        showToast('找不到圖片', 'error');
        return;
    }
    
    console.log('找到圖片:', image);
    
    // 更新輪播圖（使用圖片 URL，如果是 base64 則使用）
    bannerData.slides[index].image = image.data || image.url || image.file_url || '';
    bannerData.slides[index].order = index;
    
    // 立即更新 UI 和 localStorage（只儲存 URL，不儲存 base64）
    try {
        const bannerDataForStorage = {
            ...bannerData,
            slides: bannerData.slides.map(slide => ({
                id: slide.id,
                image: slide.image && slide.image.startsWith('http') ? slide.image : '', // 只儲存 URL
                link: slide.link || '',
                order: slide.order || 0
            }))
        };
        localStorage.setItem('bannerData', JSON.stringify(bannerDataForStorage));
    } catch (storageError) {
        if (storageError.name === 'QuotaExceededError') {
            console.warn('localStorage 空間不足，跳過本地儲存');
            // 嘗試清除舊資料
            try {
                localStorage.removeItem('bannerData');
            } catch (e) {
                console.error('無法清除 localStorage:', e);
            }
        } else {
            console.error('儲存到 localStorage 失敗:', storageError);
        }
    }
    
    renderBannerList();
    closeImageSelector();
    showToast('圖片已選擇！');
    console.log('圖片選擇完成，已更新輪播圖位置', index);
    
    // 在背景異步同步到 Supabase（不阻塞 UI）
    saveBannerDataInBackground().catch(error => {
        console.error('背景同步失敗:', error);
        showToast('圖片已選擇，但同步到伺服器時發生錯誤', 'error');
    });
}

// 新增分組
function addNewGroup() {
    const groupName = prompt('請輸入新分組名稱：');
    if (!groupName || !groupName.trim()) return;
    
    const trimmedName = groupName.trim();
    
    // 檢查是否已存在
    if (allGroups.has(trimmedName)) {
        showToast('此分組已存在', 'error');
        return;
    }
    
    // 添加到分組集合
    allGroups.add(trimmedName);
    
    // 更新過濾器選項
    updateGroupFilter();
    
    // 設定為當前選擇
    const groupFilter = document.getElementById('imageGroupFilter');
    if (groupFilter) {
        groupFilter.value = trimmedName;
    }
    
    // 更新顯示
    renderImageGrid(trimmedName, imageViewMode);
    
    showToast('分組已新增！');
}

async function handleFiles(files) {
    for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) continue;
        
        try {
            // 上傳到 Supabase Storage
            const result = await uploadImageToStorage(file, file.name);
            
            // 確保使用 Supabase 返回的 ID
            const imageId = result.id || (result.url ? Date.now() + Math.random() : Date.now() + Math.random());
            
            const imageItem = {
                id: imageId,
                name: file.name,
                size: formatFileSize(file.size),
                fileSize: file.size,
                data: result.url || (typeof result === 'string' ? result : result.url) || result, // Supabase URL 或 base64 fallback
                filePath: result.path || null,
                width: result.width || 0,
                height: result.height || 0,
                group: 'default',
                description: '',
                showInBanner: false,
                createdAt: new Date().toISOString(),
                mimeType: file.type
            };
            
            imageData.push(imageItem);
            
            // 無論是否上傳到 Supabase，都更新 localStorage 作為備份
            await saveImageData();
            
            updateGroupFilter();
            renderImageGrid('all', imageViewMode);
            updateStats();
            showToast('圖片已上傳！');
        } catch (error) {
            console.error('上傳圖片失敗:', error);
            showToast('圖片上傳失敗，請稍後再試', 'error');
        }
    }
}

// 圖片顯示模式（grid 或 list）
let imageViewMode = localStorage.getItem('imageViewMode') || 'grid';
let selectedImageIds = new Set();

function renderImageGrid(filterGroup = 'all', viewMode = imageViewMode) {
    const container = document.getElementById('imageGrid');
    if (!container) return;
    
    // 更新顯示模式
    imageViewMode = viewMode;
    localStorage.setItem('imageViewMode', viewMode);
    
    // 更新按鈕樣式
    const gridBtn = document.getElementById('viewModeGrid');
    const listBtn = document.getElementById('viewModeList');
    if (gridBtn && listBtn) {
        if (viewMode === 'grid') {
            gridBtn.style.background = '#2196F3';
            gridBtn.style.color = 'white';
            listBtn.style.background = '#f5f5f5';
            listBtn.style.color = '#333';
        } else {
            gridBtn.style.background = '#f5f5f5';
            gridBtn.style.color = '#333';
            listBtn.style.background = '#2196F3';
            listBtn.style.color = 'white';
        }
    }
    
    if (imageData.length === 0) {
        container.innerHTML = '<div class="no-data">尚無圖片，請上傳圖片</div>';
        container.className = 'image-grid';
        updateSelectedCount();
        return;
    }
    
    // 過濾分組
    let filteredImages = imageData;
    if (filterGroup !== 'all') {
        filteredImages = imageData.filter(img => (img.group || 'default') === filterGroup);
    }
    
    if (filteredImages.length === 0) {
        container.innerHTML = '<div class="no-data">此分組中沒有圖片</div>';
        container.className = 'image-grid';
        updateSelectedCount();
        return;
    }
    
    // 根據顯示模式渲染
    if (viewMode === 'list') {
        // 列表模式（像檔案總管）
        container.className = 'image-list';
        container.innerHTML = `
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #f5f5f5; border-bottom: 2px solid #ddd;">
                        <th style="padding: 12px; text-align: left; width: 40px;">
                            <input type="checkbox" id="selectAllCheckbox" onchange="toggleSelectAll(this.checked)">
                        </th>
                        <th style="padding: 12px; text-align: left; width: 80px;">預覽</th>
                        <th style="padding: 12px; text-align: left;">檔案名稱</th>
                        <th style="padding: 12px; text-align: left;">分組</th>
                        <th style="padding: 12px; text-align: left;">描述</th>
                        <th style="padding: 12px; text-align: left; width: 100px;">檔案大小</th>
                        <th style="padding: 12px; text-align: left; width: 120px;">解析度</th>
                        <th style="padding: 12px; text-align: left; width: 150px;">上傳時間</th>
                        <th style="padding: 12px; text-align: left; width: 100px;">操作</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredImages.map(img => {
                        const createdAt = img.createdAt ? new Date(img.createdAt).toLocaleString('zh-TW') : '未知';
                        const resolution = (img.width && img.height) ? `${img.width} × ${img.height}` : '未知';
                        const group = img.group || 'default';
                        const description = img.description || '';
                        const showInBanner = img.showInBanner || false;
                        const isSelected = selectedImageIds.has(String(img.id));
                        
                        return `
                        <tr style="border-bottom: 1px solid #eee; ${isSelected ? 'background: #e3f2fd;' : ''}" data-id="${img.id}">
                            <td style="padding: 12px;">
                                <input type="checkbox" class="image-checkbox" data-id="${img.id}" onchange="toggleImageSelection('${String(img.id).replace(/'/g, "\\'")}', this.checked)" ${isSelected ? 'checked' : ''}>
                            </td>
                            <td style="padding: 12px;">
                                <img src="${img.data}" alt="${img.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;">
                                ${showInBanner ? '<span style="display: block; font-size: 10px; color: #2196F3; margin-top: 4px;">輪播圖</span>' : ''}
                            </td>
                            <td style="padding: 12px; font-weight: 500;">${img.name}</td>
                            <td style="padding: 12px;"><span style="background: #e3f2fd; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${group}</span></td>
                            <td style="padding: 12px; color: #666; font-size: 14px;">${description || '-'}</td>
                            <td style="padding: 12px; font-size: 14px;">${img.size}</td>
                            <td style="padding: 12px; font-size: 14px;">${resolution}</td>
                            <td style="padding: 12px; font-size: 14px; color: #666;">${createdAt}</td>
                            <td style="padding: 12px;">
                                <button onclick="editImage('${String(img.id).replace(/'/g, "\\'")}')" style="padding: 4px 8px; background: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; margin-right: 4px;">編輯</button>
                                <button onclick="deleteImage('${String(img.id).replace(/'/g, "\\'")}')" style="padding: 4px 8px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">刪除</button>
                            </td>
                        </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
    } else {
        // 網格模式（原有顯示方式）
        container.className = 'image-grid';
        container.innerHTML = filteredImages.map(img => {
            const createdAt = img.createdAt ? new Date(img.createdAt).toLocaleString('zh-TW') : '未知';
            const resolution = (img.width && img.height) ? `${img.width} × ${img.height}` : '未知';
            const group = img.group || 'default';
            const description = img.description || '';
            const showInBanner = img.showInBanner || false;
            const isSelected = selectedImageIds.has(String(img.id));
            
            return `
            <div class="image-item ${isSelected ? 'selected' : ''}" data-id="${img.id}">
                <div class="image-item-checkbox" style="position: absolute; top: 8px; left: 8px; z-index: 10;">
                    <input type="checkbox" class="image-checkbox" data-id="${img.id}" onchange="toggleImageSelection('${String(img.id).replace(/'/g, "\\'")}', this.checked)" ${isSelected ? 'checked' : ''} style="width: 20px; height: 20px; cursor: pointer;">
                </div>
                <div class="image-item-preview">
                    <img src="${img.data}" alt="${img.name}">
                    ${showInBanner ? '<span class="banner-badge">輪播圖</span>' : ''}
                </div>
                <div class="image-item-actions">
                    <button class="image-action-btn" onclick="editImage('${String(img.id).replace(/'/g, "\\'")}')" title="編輯">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="image-action-btn" onclick="deleteImage('${String(img.id).replace(/'/g, "\\'")}')" title="刪除">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
                <div class="image-item-info">
                    <p class="image-item-name" title="${img.name}">${img.name}</p>
                    ${description ? `<p class="image-item-desc" title="${description}">${description}</p>` : ''}
                    <div class="image-item-meta">
                        <span class="image-meta-item">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                            </svg>
                            ${img.size}
                        </span>
                        <span class="image-meta-item">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="9" y1="3" x2="9" y2="21"></line>
                            </svg>
                            ${resolution}
                        </span>
                    </div>
                    <div class="image-item-meta">
                        <span class="image-meta-item">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                            ${createdAt}
                        </span>
                        <span class="image-meta-item group-tag">${group}</span>
                    </div>
                </div>
            </div>
        `;
        }).join('');
    }
    
    updateSelectedCount();
}

async function deleteImage(id) {
    if (!confirm('確定要刪除這張圖片嗎？')) return;
    
    const image = imageData.find(img => img.id === id);
    if (!image) return;
    
    // 從 Supabase 刪除
    await deleteImageItem(id, image.filePath);
    
    // 從本地陣列刪除
    imageData = imageData.filter(img => img.id !== id);
    await saveImageData();
    const currentFilter = document.getElementById('imageGroupFilter')?.value || 'all';
    renderImageGrid(currentFilter, imageViewMode);
    updateStats();
    showToast('圖片已刪除！');
}

async function saveImageData() {
    // 圖片已透過 uploadImageToStorage 儲存到 Supabase
    // 這裡只更新 localStorage 作為備份
    try {
        localStorage.setItem('imageData', JSON.stringify(imageData));
    } catch (e) {
        if (e.name === 'QuotaExceededError') {
            showToast('儲存空間已滿，請刪除部分圖片');
        }
    }
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// 切換圖片選擇
function toggleImageSelection(id, checked) {
    if (checked) {
        selectedImageIds.add(String(id));
    } else {
        selectedImageIds.delete(String(id));
    }
    updateSelectedCount();
    
    // 更新視覺效果
    const item = document.querySelector(`[data-id="${id}"]`);
    if (item) {
        if (checked) {
            item.classList.add('selected');
        } else {
            item.classList.remove('selected');
        }
    }
}

// 全選/取消全選
function toggleSelectAll(checked) {
    const currentFilter = document.getElementById('imageGroupFilter')?.value || 'all';
    let filteredImages = imageData;
    if (currentFilter !== 'all') {
        filteredImages = imageData.filter(img => (img.group || 'default') === currentFilter);
    }
    
    filteredImages.forEach(img => {
        if (checked) {
            selectedImageIds.add(String(img.id));
        } else {
            selectedImageIds.delete(String(img.id));
        }
    });
    
    // 更新所有 checkbox
    document.querySelectorAll('.image-checkbox').forEach(checkbox => {
        checkbox.checked = checked;
    });
    
    // 更新視覺效果
    filteredImages.forEach(img => {
        const item = document.querySelector(`[data-id="${img.id}"]`);
        if (item) {
            if (checked) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        }
    });
    
    updateSelectedCount();
}

// 全選圖片
function selectAllImages() {
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    if (selectAllCheckbox) {
        selectAllCheckbox.checked = true;
        toggleSelectAll(true);
    } else {
        // 如果沒有 checkbox，直接執行全選
        toggleSelectAll(true);
    }
}

// 更新選中數量
function updateSelectedCount() {
    const count = selectedImageIds.size;
    const countSpan = document.getElementById('selectedCount');
    const deleteBtn = document.getElementById('deleteSelectedBtn');
    
    if (countSpan) {
        countSpan.textContent = count;
    }
    
    if (deleteBtn) {
        if (count > 0) {
            deleteBtn.style.display = 'inline-block';
        } else {
            deleteBtn.style.display = 'none';
        }
    }
}

// 刪除選中的圖片
async function deleteSelectedImages() {
    const count = selectedImageIds.size;
    if (count === 0) {
        showToast('請先選擇要刪除的圖片', 'error');
        return;
    }
    
    if (!confirm(`確定要刪除選中的 ${count} 張圖片嗎？此操作無法復原。`)) return;
    
    const idsToDelete = Array.from(selectedImageIds);
    let deletedCount = 0;
    
    for (const id of idsToDelete) {
        const image = imageData.find(img => String(img.id) === String(id));
        if (image) {
            try {
                await deleteImageItem(id, image.filePath);
                imageData = imageData.filter(img => String(img.id) !== String(id));
                deletedCount++;
            } catch (error) {
                console.error('刪除圖片失敗:', id, error);
            }
        }
    }
    
    selectedImageIds.clear();
    await saveImageData();
    const currentFilter = document.getElementById('imageGroupFilter')?.value || 'all';
    renderImageGrid(currentFilter, imageViewMode);
    updateStats();
    showToast(`已刪除 ${deletedCount} 張圖片！`);
}

// 設定顯示模式
function setImageViewMode(mode) {
    imageViewMode = mode;
    localStorage.setItem('imageViewMode', mode);
    const currentFilter = document.getElementById('imageGroupFilter')?.value || 'all';
    renderImageGrid(currentFilter, mode);
}

// 從編輯 Modal 新增分組
function addNewGroupFromEdit() {
    const groupName = prompt('請輸入新分組名稱：');
    if (!groupName || !groupName.trim()) return;
    
    const trimmedName = groupName.trim();
    
    // 檢查是否已存在
    if (allGroups.has(trimmedName)) {
        showToast('此分組已存在', 'error');
        return;
    }
    
    // 添加到分組集合
    allGroups.add(trimmedName);
    
    // 更新編輯 Modal 中的分組選單
    const editGroupSelect = document.getElementById('editImageGroup');
    if (editGroupSelect && editGroupSelect.tagName === 'SELECT') {
        const option = document.createElement('option');
        option.value = trimmedName;
        option.textContent = trimmedName;
        editGroupSelect.appendChild(option);
        editGroupSelect.value = trimmedName;
    }
    
    // 更新主過濾器
    updateGroupFilter();
    
    showToast('分組已新增！');
}

// Visitor Statistics Management
let visitorLogs = [];
let dailyVisitorStats = {};

async function initVisitorStats() {
    // 從 Supabase 載入訪客統計
    const visitorData = await loadVisitorStats();
    visitorLogs = visitorData.logs || [];
    dailyVisitorStats = visitorData.stats || {};
    
    const reportTabs = document.querySelectorAll('.report-tab');
    const tableBody = document.getElementById('visitorTableBody');
    
    if (!tableBody) return;

    let currentReport = 'daily';

    // 報表切換
    reportTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            reportTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentReport = tab.dataset.report;
            renderVisitorTable();
        });
    });

    // 渲染訪客表格
    function renderVisitorTable() {
        // 使用已載入的 visitorLogs（從 Supabase 或 localStorage）
        const today = new Date();
        
        let filteredLogs = [];
        
        switch (currentReport) {
            case 'daily':
                // 今日記錄
                const todayStr = today.toISOString().split('T')[0];
                filteredLogs = visitorLogs.filter(v => v.date === todayStr);
                break;
            case 'monthly':
                // 本月記錄
                const monthStr = today.toISOString().slice(0, 7);
                filteredLogs = visitorLogs.filter(v => v.date && v.date.startsWith(monthStr));
                break;
            case 'quarterly':
                // 本季記錄（過去3個月）
                const threeMonthsAgo = new Date(today);
                threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
                filteredLogs = visitorLogs.filter(v => {
                    const vDate = new Date(v.date);
                    return vDate >= threeMonthsAgo;
                });
                break;
        }

        // 按時間倒序排列
        filteredLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        if (filteredLogs.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4" class="no-data">暫無訪客記錄</td></tr>';
            return;
        }

        tableBody.innerHTML = filteredLogs.map(log => {
            const date = new Date(log.timestamp);
            const dateStr = date.toLocaleDateString('zh-TW');
            const timeStr = date.toLocaleTimeString('zh-TW');
            
            // 解析 User Agent 取得簡短裝置資訊
            const ua = log.userAgent || '';
            let device = '未知裝置';
            if (ua.includes('Mobile')) device = '手機';
            else if (ua.includes('Tablet')) device = '平板';
            else if (ua.includes('Windows')) device = 'Windows 電腦';
            else if (ua.includes('Mac')) device = 'Mac 電腦';
            else if (ua.includes('Linux')) device = 'Linux 電腦';

            return `
                <tr>
                    <td>${dateStr} ${timeStr}</td>
                    <td>${log.referrer || '直接訪問'}</td>
                    <td>${log.page || '/'}</td>
                    <td>${device}</td>
                </tr>
            `;
        }).join('');
    }

    // 更新統計數據
    function updateVisitorSummary() {
        // 使用已載入的資料（從 Supabase 或 localStorage）
        const today = new Date().toISOString().split('T')[0];
        const currentMonth = new Date().toISOString().slice(0, 7);

        // 今日訪客（從 dailyVisitorStats 計算）
        const todayCount = dailyVisitorStats[today] || 0;
        const todayVisitorsEl = document.getElementById('todayVisitors');
        if (todayVisitorsEl) {
            todayVisitorsEl.textContent = todayCount;
        }

        // 本月訪客
        let monthCount = 0;
        Object.keys(dailyVisitorStats).forEach(date => {
            if (date.startsWith(currentMonth)) {
                monthCount += dailyVisitorStats[date];
            }
        });
        const monthVisitorsEl = document.getElementById('monthVisitors');
        if (monthVisitorsEl) {
            monthVisitorsEl.textContent = monthCount;
        }

        // 總訪客數
        document.getElementById('totalVisitors').textContent = visitorLogs.length;

        // 更新儀表板上的訪客數
        const visitorCountEl = document.getElementById('visitorCount');
        if (visitorCountEl) {
            visitorCountEl.textContent = visitorLogs.length.toLocaleString();
        }
    }

    // 初始化
    renderVisitorTable();
    updateVisitorSummary();
}

// Contact Messages Management
let contactMessages = [];

async function initContactMessages() {
    const messageList = document.getElementById('messageList');
    const modal = document.getElementById('messageDetailModal');
    const closeModalBtn = document.getElementById('closeMessageModal');
    const closeDetailBtn = document.getElementById('closeMessageDetailBtn');
    const deleteBtn = document.getElementById('deleteMessageBtn');

    if (!messageList) return;

    // 從 Supabase 載入聯絡訊息
    contactMessages = await loadContactMessages();
    let currentMessageId = null;

    // 渲染訊息列表
    function renderMessageList() {
        if (contactMessages.length === 0) {
            messageList.innerHTML = '<div class="no-data">尚無聯絡訊息</div>';
            return;
        }

        // 按時間倒序排列
        const sortedMessages = [...contactMessages].sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
        );

        messageList.innerHTML = sortedMessages.map(msg => {
            const date = new Date(msg.timestamp);
            const dateStr = date.toLocaleDateString('zh-TW');
            const timeStr = date.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });

            return `
                <div class="message-item ${msg.read ? '' : 'unread'}" data-id="${msg.id}">
                    <div class="message-header">
                        <div class="message-sender">
                            <span class="message-name">${msg.name}</span>
                            <span class="message-email">${msg.email}</span>
                        </div>
                        <span class="message-timestamp">${dateStr} ${timeStr}</span>
                    </div>
                    <div class="message-subject">${msg.subject || '無主旨'}</div>
                    <div class="message-preview">${msg.message}</div>
                </div>
            `;
        }).join('');

        updateMessageSummary();
        updateNotifications();
    }

    // 更新訊息統計
    function updateMessageSummary() {
        const totalEl = document.getElementById('totalMessages');
        const unreadEl = document.getElementById('unreadMessages');
        const contactCountEl = document.getElementById('contactCount');

        const unreadCount = contactMessages.filter(m => !m.read).length;

        if (totalEl) totalEl.textContent = contactMessages.length;
        if (unreadEl) unreadEl.textContent = unreadCount;
        if (contactCountEl) contactCountEl.textContent = contactMessages.length;
    }

    // 顯示訊息詳情
    async function showMessageDetail(id) {
        const msg = contactMessages.find(m => m.id === id);
        if (!msg) return;

        currentMessageId = id;

        // 標記為已讀
        if (!msg.read) {
            msg.read = true;
            await updateContactMessageRead(id, true);
            await saveContactMessages();
            renderMessageList();
        }

        const date = new Date(msg.timestamp);
        const dateStr = date.toLocaleDateString('zh-TW');
        const timeStr = date.toLocaleTimeString('zh-TW');

        document.getElementById('messageDetailContent').innerHTML = `
            <div class="message-detail-header">
                <h3>${msg.subject || '無主旨'}</h3>
                <div class="message-detail-meta">
                    <span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        ${msg.name}
                    </span>
                    <span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                            <polyline points="22,6 12,13 2,6"></polyline>
                        </svg>
                        ${msg.email}
                    </span>
                    ${msg.phone ? `
                    <span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                        </svg>
                        ${msg.phone}
                    </span>
                    ` : ''}
                    <span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        ${dateStr} ${timeStr}
                    </span>
                </div>
            </div>
            <div class="message-detail-body">${msg.message}</div>
        `;

        modal.classList.add('active');
    }

    // 刪除訊息
    function deleteMessage() {
        if (!currentMessageId) return;
        
        if (confirm('確定要刪除這則訊息嗎？')) {
            contactMessages = contactMessages.filter(m => m.id !== currentMessageId);
            saveContactMessages();
            renderMessageList();
            modal.classList.remove('active');
            showToast('訊息已刪除');
        }
    }

    async function saveContactMessages() {
        // 聯絡訊息主要透過前端表單提交到 Supabase
        // 這裡只更新 localStorage 作為備份
        localStorage.setItem('contactMessages', JSON.stringify(contactMessages));
    }

    // 事件監聽
    messageList.addEventListener('click', (e) => {
        const item = e.target.closest('.message-item');
        if (item) {
            showMessageDetail(item.dataset.id);
        }
    });

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => modal.classList.remove('active'));
    }
    if (closeDetailBtn) {
        closeDetailBtn.addEventListener('click', () => modal.classList.remove('active'));
    }
    if (deleteBtn) {
        deleteBtn.addEventListener('click', deleteMessage);
    }
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('active');
        });
    }

    // 初始化
    renderMessageList();
}

// Notifications Management
function initNotifications() {
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationSidebar = document.getElementById('notificationSidebar');
    const notificationList = document.getElementById('notificationList');
    const notificationBadge = document.getElementById('notificationBadge');
    const markAllReadBtn = document.getElementById('markAllRead');

    if (!notificationBtn || !notificationSidebar) return;

    // 切換通知側邊欄
    notificationBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        notificationSidebar.classList.toggle('active');
    });

    // 點擊其他地方關閉
    document.addEventListener('click', (e) => {
        if (!notificationSidebar.contains(e.target) && e.target !== notificationBtn) {
            notificationSidebar.classList.remove('active');
        }
    });

    // 標記全部已讀
    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', async () => {
            // 更新所有訊息為已讀
            for (const msg of contactMessages) {
                if (!msg.read) {
                    await updateContactMessageRead(msg.id, true);
                    msg.read = true;
                }
            }
            localStorage.setItem('contactMessages', JSON.stringify(contactMessages));
            updateNotifications();
            showToast('已將所有通知標記為已讀');
        });
    }
}

// 更新通知
function updateNotifications() {
    const notificationList = document.getElementById('notificationList');
    const notificationBadge = document.getElementById('notificationBadge');

    if (!notificationList) return;

    // 使用已載入的 contactMessages（從 Supabase 或 localStorage）
    const unreadMessages = contactMessages.filter(m => !m.read);

    // 更新徽章
    if (notificationBadge) {
        notificationBadge.textContent = unreadMessages.length;
        notificationBadge.style.display = unreadMessages.length > 0 ? 'flex' : 'none';
    }

    // 渲染通知列表
    if (unreadMessages.length === 0) {
        notificationList.innerHTML = '<div class="notification-empty">目前沒有未讀通知</div>';
        return;
    }

    // 取最新的10筆
    const recentNotifications = unreadMessages.slice(0, 10);

    notificationList.innerHTML = recentNotifications.map(msg => {
        const date = new Date(msg.timestamp);
        const timeAgo = getTimeAgo(date);

        return `
            <div class="notification-item unread" data-id="${msg.id}" data-section="messages">
                <div class="notification-icon message">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                </div>
                <div class="notification-content">
                    <div class="notification-title">新訊息來自 ${msg.name}</div>
                    <div class="notification-text">${msg.subject || msg.message.substring(0, 30)}...</div>
                    <div class="notification-time">${timeAgo}</div>
                </div>
            </div>
        `;
    }).join('');

    // 點擊通知跳轉
    notificationList.querySelectorAll('.notification-item').forEach(item => {
        item.addEventListener('click', () => {
            const section = item.dataset.section;
            if (section) {
                // 切換到訊息頁面
                document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
                document.getElementById(section)?.classList.add('active');
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                document.querySelector(`.nav-link[data-section="${section}"]`)?.classList.add('active');
                
                document.getElementById('notificationSidebar').classList.remove('active');
            }
        });
    });
}

// 計算時間差
function getTimeAgo(date) {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '剛剛';
    if (minutes < 60) return `${minutes} 分鐘前`;
    if (hours < 24) return `${hours} 小時前`;
    if (days < 7) return `${days} 天前`;
    return date.toLocaleDateString('zh-TW');
}

// Settings
function initSettings() {
    const siteForm = document.getElementById('siteSettingsForm');
    const accountForm = document.getElementById('accountSettingsForm');
    
    siteForm.addEventListener('submit', (e) => {
        e.preventDefault();
        showToast('網站設定已儲存！');
    });
    
    accountForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newPassword = accountForm.querySelector('[name="newPassword"]').value;
        const confirmPassword = accountForm.querySelector('[name="confirmPassword"]').value;
        
        if (newPassword !== confirmPassword) {
            alert('兩次輸入的密碼不一致');
            return;
        }
        
        if (newPassword.length > 0 && newPassword.length < 6) {
            alert('密碼長度至少需要 6 個字元');
            return;
        }
        
        accountForm.reset();
        showToast('密碼已更新！');
    });
}

// Toast notification
function showToast(message) {
    const toastMessage = toast.querySelector('.toast-message');
    toastMessage.textContent = message;
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Service Detail Editor
let currentServiceId = null;

function initServiceDetailEditor() {
    const modal = document.getElementById('serviceDetailModal');
    const closeBtn = document.getElementById('closeServiceDetailModal');
    const cancelBtn = document.getElementById('cancelServiceDetailBtn');
    const form = document.getElementById('serviceDetailForm');

    if (!modal) return;

    // Close modal handlers
    const closeModal = () => {
        modal.classList.remove('active');
        currentServiceId = null;
    };

    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Form submit
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        saveServiceDetail();
        closeModal();
        showToast('服務詳細內容已儲存！');
    });

    // Image upload handlers
    for (let i = 1; i <= 3; i++) {
        const uploadInput = document.getElementById(`section${i}Upload`);
        if (uploadInput) {
            uploadInput.addEventListener('change', function() {
                handleServiceImageUpload(i, this.files[0]);
            });
        }
    }
}

function openServiceDetailEditor(serviceId) {
    currentServiceId = serviceId.toString();
    const modal = document.getElementById('serviceDetailModal');
    const service = serviceDetailData[currentServiceId];

    if (!service) {
        showToast('找不到服務資料');
        return;
    }

    // Update modal title
    document.getElementById('serviceDetailModalTitle').textContent = `編輯 ${service.title} 詳細頁面`;
    document.getElementById('serviceDetailId').value = currentServiceId;

    // Fill basic info
    document.getElementById('serviceDetailTitle').value = service.title || '';
    document.getElementById('serviceDetailTag').value = service.tag || '';
    document.getElementById('serviceDetailDesc').value = service.description || '';

    // Fill sections
    for (let i = 0; i < 3; i++) {
        const section = service.sections[i] || { title: '', content: '', image: '' };
        document.getElementById(`section${i + 1}Title`).value = section.title || '';
        document.getElementById(`section${i + 1}Content`).value = section.content || '';
        document.getElementById(`section${i + 1}Image`).value = section.image || '';

        // Update image preview
        const preview = document.getElementById(`section${i + 1}Preview`);
        if (section.image) {
            preview.innerHTML = `<img src="${section.image}" alt="Preview">`;
        } else {
            preview.innerHTML = '<span class="no-image">尚未上傳圖片</span>';
        }
    }

    // Show modal
    modal.classList.add('active');
}

function handleServiceImageUpload(sectionIndex, file) {
    if (!file || !file.type.startsWith('image/')) {
        showToast('請選擇有效的圖片檔案');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const imageData = e.target.result;
        document.getElementById(`section${sectionIndex}Image`).value = imageData;
        
        const preview = document.getElementById(`section${sectionIndex}Preview`);
        preview.innerHTML = `<img src="${imageData}" alt="Preview">`;
        
        showToast('圖片已上傳');
    };
    reader.readAsDataURL(file);
}

function removeServiceImage(sectionIndex) {
    document.getElementById(`section${sectionIndex}Image`).value = '';
    const preview = document.getElementById(`section${sectionIndex}Preview`);
    preview.innerHTML = '<span class="no-image">尚未上傳圖片</span>';
    
    // Clear file input
    const uploadInput = document.getElementById(`section${sectionIndex}Upload`);
    if (uploadInput) uploadInput.value = '';
}

async function saveServiceDetail() {
    if (!currentServiceId) return;

    const service = {
        title: document.getElementById('serviceDetailTitle').value,
        tag: document.getElementById('serviceDetailTag').value,
        description: document.getElementById('serviceDetailDesc').value,
        sections: []
    };

    for (let i = 1; i <= 3; i++) {
        service.sections.push({
            title: document.getElementById(`section${i}Title`).value,
            content: document.getElementById(`section${i}Content`).value,
            image: document.getElementById(`section${i}Image`).value
        });
    }

    serviceDetailData[currentServiceId] = service;
    
    // 儲存到 Supabase
    await saveServiceDetail(currentServiceId, service);
    
    try {
        localStorage.setItem('serviceDetailData', JSON.stringify(serviceDetailData));
    } catch (e) {
        if (e.name === 'QuotaExceededError') {
            showToast('儲存空間已滿，請減少圖片大小');
            return;
        }
    }

    // Also update the main service title/description in contentData
    const serviceKey = `service${currentServiceId}`;
    if (contentData.services) {
        contentData.services[`${serviceKey}_title`] = service.title;
        contentData.services[`${serviceKey}_desc`] = service.description;
        localStorage.setItem('contentData', JSON.stringify(contentData));
        
        // Update form fields
        const titleInput = document.querySelector(`[name="${serviceKey}_title"]`);
        const descInput = document.querySelector(`[name="${serviceKey}_desc"]`);
        if (titleInput) titleInput.value = service.title;
        if (descInput) descInput.value = service.description;
    }
}

function previewService(event) {
    event.preventDefault();
    if (currentServiceId) {
        window.open(`service-detail.html?id=${currentServiceId}`, '_blank');
    }
}

// Make functions globally available
window.editNews = editNews;
window.deleteNews = deleteNews;
window.deleteImage = deleteImage;
window.openServiceDetailEditor = openServiceDetailEditor;
window.removeServiceImage = removeServiceImage;
window.previewService = previewService;

// ==================== App Settings ====================

function initAppSettings() {
    const androidForm = document.getElementById('androidAppForm');
    const iosForm = document.getElementById('iosAppForm');

    if (!androidForm || !iosForm) return;

    // Load current settings
    loadAppSettings();

    // Handle checkbox toggle for custom image
    document.querySelectorAll('.app-form input[name="use_custom_image"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const customGroup = this.closest('form').querySelector('.custom-image-group');
            customGroup.style.display = this.checked ? 'block' : 'none';
        });
    });

    // Handle store URL change to update preview
    document.querySelectorAll('.app-form input[name="store_url"]').forEach(input => {
        input.addEventListener('input', function() {
            const platform = this.closest('.app-card').dataset.platform;
            const previewImg = document.getElementById(`${platform}-qr-preview`);
            const useCustom = this.closest('form').querySelector('input[name="use_custom_image"]').checked;

            if (!useCustom && this.value) {
                previewImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(this.value)}`;
            }
        });
    });

    // Handle custom image URL change to update preview
    document.querySelectorAll('.app-form input[name="custom_qr_image"]').forEach(input => {
        input.addEventListener('input', function() {
            const platform = this.closest('.app-card').dataset.platform;
            const previewImg = document.getElementById(`${platform}-qr-preview`);
            const useCustom = this.closest('form').querySelector('input[name="use_custom_image"]').checked;

            if (useCustom && this.value) {
                previewImg.src = this.value;
            }
        });
    });

    // Android form submit
    androidForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveAppSettings('android', androidForm);
    });

    // iOS form submit
    iosForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveAppSettings('ios', iosForm);
    });
}

async function loadAppSettings() {
    try {
        const response = await API.get('/app-settings');
        if (!response.success || !response.data) return;

        response.data.forEach(app => {
            const form = document.getElementById(`${app.platform}AppForm`);
            if (!form) return;

            form.querySelector('input[name="app_name"]').value = app.app_name || 'YourRemit App';
            form.querySelector('input[name="store_url"]').value = app.store_url || '';
            form.querySelector('input[name="use_custom_image"]').checked = app.use_custom_image || false;
            form.querySelector('input[name="custom_qr_image"]').value = app.custom_qr_image || '';

            // Show/hide custom image group
            const customGroup = form.querySelector('.custom-image-group');
            customGroup.style.display = app.use_custom_image ? 'block' : 'none';

            // Update preview
            const previewImg = document.getElementById(`${app.platform}-qr-preview`);
            if (app.use_custom_image && app.custom_qr_image) {
                previewImg.src = app.custom_qr_image;
            } else if (app.store_url) {
                previewImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(app.store_url)}`;
            }
        });
    } catch (error) {
        console.log('App settings not available yet');
    }
}

async function saveAppSettings(platform, form) {
    const formData = new FormData(form);
    const data = {
        app_name: formData.get('app_name'),
        store_url: formData.get('store_url'),
        use_custom_image: formData.get('use_custom_image') === 'on',
        custom_qr_image: formData.get('custom_qr_image')
    };

    try {
        const response = await API.put(`/app-settings/${platform}`, data);
        if (response.success) {
            showToast(`${platform === 'android' ? 'Android' : 'iOS'} App 設定已儲存`, 'success');
        } else {
            showToast('儲存失敗: ' + (response.error || '未知錯誤'), 'error');
        }
    } catch (error) {
        console.error('Save app settings error:', error);
        showToast('儲存失敗，請稍後再試', 'error');
    }
}

