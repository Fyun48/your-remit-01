/**
 * 金優匯 - 主要 JavaScript 檔案
 * 包含所有互動功能與動畫效果
 */

document.addEventListener('DOMContentLoaded', async () => {
    // 初始化所有功能
    initHeader();
    initMobileMenu();
    initBannerSlider();
    loadNewsData();
    initNewsTabs();
    initScrollAnimations();
    initBackToTop();
    initContactForm();
    initSmoothScroll();
    trackVisitor();

    // 載入並更新內容設定（統計數字、聯絡資訊等）
    await loadAndUpdateContent();

    // 載入 App QR Code 設定
    await loadAppQRCodes();

    // 載入內容後再初始化計數動畫
    initCounterAnimation();
});

/**
 * 載入 App QR Code 設定
 */
async function loadAppQRCodes() {
    try {
        const response = await API.get('/app-settings');
        if (!response.success || !response.data) return;

        const settings = response.data;

        settings.forEach(app => {
            const heroImg = document.getElementById(`hero-qr-${app.platform}`);
            const footerImg = document.getElementById(`footer-qr-${app.platform}`);

            let qrSrc;
            if (app.use_custom_image && app.custom_qr_image) {
                // 使用自訂圖片
                qrSrc = app.custom_qr_image;
            } else if (app.store_url) {
                // 使用連結自動生成 QR code
                const heroSize = 100;
                const footerSize = 80;

                if (heroImg) {
                    heroImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=${heroSize}x${heroSize}&data=${encodeURIComponent(app.store_url)}`;
                }
                if (footerImg) {
                    footerImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=${footerSize}x${footerSize}&data=${encodeURIComponent(app.store_url)}`;
                }
                return;
            }

            if (qrSrc) {
                if (heroImg) heroImg.src = qrSrc;
                if (footerImg) footerImg.src = qrSrc;
            }
        });
    } catch (error) {
        console.log('App QR settings not available, using defaults');
    }
}

/**
 * 載入並顯示最新消息
 */
function loadNewsData() {
    const newsContainer = document.querySelector('.news-grid');
    if (!newsContainer) return;

    const newsData = JSON.parse(localStorage.getItem('newsData')) || [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 過濾：只顯示未過期的消息（endDate 為空或未過期）
    const activeNews = newsData.filter(news => {
        if (!news.endDate) return true;
        const endDate = new Date(news.endDate);
        return endDate >= today;
    });

    // 按 order 排序
    activeNews.sort((a, b) => (a.order || 999) - (b.order || 999));

    if (activeNews.length === 0) {
        newsContainer.innerHTML = '<p style="text-align: center; padding: 2rem; color: var(--color-gray-500);">目前沒有最新消息</p>';
        return;
    }

    newsContainer.innerHTML = activeNews.map(news => {
        const date = new Date(news.date);
        const day = date.getDate();
        const month = date.toLocaleString('en-US', { month: 'short' });
        const excerpt = news.content.length > 50 ? news.content.substring(0, 50) + '...' : news.content;

        return `
            <article class="news-card" data-category="${news.category}">
                <div class="news-date">
                    <span class="day">${day}</span>
                    <span class="month">${month}</span>
                </div>
                <div class="news-content">
                    <span class="news-category">${news.category}</span>
                    <h3 class="news-title">${news.title}</h3>
                    <p class="news-excerpt">${excerpt}</p>
                    <a href="#" class="news-link">
                        閱讀更多
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                    </a>
                </div>
            </article>
        `;
    }).join('');

    // 重新初始化 tabs（因為 news cards 已更新）
    initNewsTabs();
}

/**
 * 訪客追蹤功能
 */
function trackVisitor() {
    // 取得訪客資料
    const visitorData = {
        id: Date.now() + Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0],
        referrer: document.referrer || '直接訪問',
        page: window.location.pathname,
        userAgent: navigator.userAgent,
        screenSize: `${window.screen.width}x${window.screen.height}`,
        language: navigator.language
    };

    // 從 localStorage 取得現有訪客記錄
    let visitorLogs = JSON.parse(localStorage.getItem('visitorLogs')) || [];

    // 檢查是否在同一session已記錄（防止重複計算）
    const sessionKey = 'visitor_session_' + visitorData.date;
    if (!sessionStorage.getItem(sessionKey)) {
        visitorLogs.push(visitorData);
        localStorage.setItem('visitorLogs', JSON.stringify(visitorLogs));
        sessionStorage.setItem(sessionKey, 'true');

        // 更新今日訪客數
        updateTodayVisitorCount();

        // 同時寫入資料庫（背景執行，不阻塞）
        if (typeof logVisitor === 'function') {
            logVisitor({
                date: visitorData.date,
                time: visitorData.time,
                referrer: visitorData.referrer,
                page: visitorData.page,
                user_agent: visitorData.userAgent,
                screen_size: visitorData.screenSize,
                language: visitorData.language
            }).catch(err => console.warn('訪客記錄寫入資料庫失敗:', err));
        }
    }
}

/**
 * 更新今日訪客數
 */
function updateTodayVisitorCount() {
    const today = new Date().toISOString().split('T')[0];
    let dailyStats = JSON.parse(localStorage.getItem('dailyVisitorStats')) || {};
    
    if (!dailyStats[today]) {
        dailyStats[today] = 0;
    }
    dailyStats[today]++;
    
    localStorage.setItem('dailyVisitorStats', JSON.stringify(dailyStats));
}

/**
 * Header 滾動效果
 */
function initHeader() {
    const header = document.querySelector('.header');
    let lastScrollY = window.scrollY;

    const updateHeader = () => {
        const currentScrollY = window.scrollY;

        if (currentScrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        lastScrollY = currentScrollY;
    };

    // 初始檢查
    updateHeader();

    // 監聽滾動事件，使用節流優化效能
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateHeader();
                ticking = false;
            });
            ticking = true;
        }
    });
}

/**
 * 手機版選單
 */
function initMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.nav');
    const header = document.querySelector('.header');

    if (!menuBtn || !nav) return;

    // 創建手機版選單容器
    const mobileNav = document.createElement('div');
    mobileNav.className = 'mobile-nav';
    mobileNav.innerHTML = nav.innerHTML;
    header.appendChild(mobileNav);

    // 添加手機版選單樣式
    const style = document.createElement('style');
    style.textContent = `
        .mobile-nav {
            position: fixed;
            top: var(--header-height);
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(26, 26, 46, 0.98);
            backdrop-filter: blur(12px);
            padding: var(--space-xl);
            opacity: 0;
            visibility: hidden;
            transform: translateY(-20px);
            transition: all var(--transition-base);
            overflow-y: auto;
            z-index: 999;
        }
        
        .mobile-nav.active {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
        }
        
        .mobile-nav .nav-list {
            flex-direction: column;
            align-items: stretch;
            gap: 0;
        }
        
        .mobile-nav .nav-link {
            padding: var(--space-lg);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            font-size: 1.1rem;
        }
        
        .mobile-nav .dropdown {
            position: static;
            opacity: 1;
            visibility: visible;
            transform: none;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 0;
            box-shadow: none;
            max-height: 0;
            overflow: hidden;
            transition: max-height var(--transition-base);
        }
        
        .mobile-nav .has-dropdown.active .dropdown {
            max-height: 300px;
        }
        
        .mobile-nav .dropdown li a {
            color: var(--color-gray-400);
            padding: var(--space-md) var(--space-xl);
        }
        
        .mobile-menu-btn.active span:nth-child(1) {
            transform: rotate(45deg) translate(5px, 5px);
        }
        
        .mobile-menu-btn.active span:nth-child(2) {
            opacity: 0;
        }
        
        .mobile-menu-btn.active span:nth-child(3) {
            transform: rotate(-45deg) translate(6px, -6px);
        }
    `;
    document.head.appendChild(style);

    // 切換選單
    menuBtn.addEventListener('click', () => {
        menuBtn.classList.toggle('active');
        mobileNav.classList.toggle('active');
        document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
    });

    // 處理下拉選單
    const dropdownItems = mobileNav.querySelectorAll('.has-dropdown');
    dropdownItems.forEach(item => {
        const link = item.querySelector('.nav-link');
        link.addEventListener('click', (e) => {
            e.preventDefault();
            item.classList.toggle('active');
        });
    });

    // 點擊連結後關閉選單
    const navLinks = mobileNav.querySelectorAll('a:not(.has-dropdown > .nav-link)');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            menuBtn.classList.remove('active');
            mobileNav.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
}

/**
 * 輪播圖功能
 */
async function initBannerSlider() {
    const sliderWrapper = document.getElementById('sliderWrapper');
    const indicatorsContainer = document.getElementById('sliderIndicators');
    const prevBtn = document.getElementById('sliderPrev');
    const nextBtn = document.getElementById('sliderNext');
    
    if (!sliderWrapper) return;

    // 從 Supabase 或 localStorage 載入輪播圖資料
    let bannerData = getDefaultBannerData();
    
    try {
        const client = getSupabaseClient();
        if (client) {
            // 嘗試從 Supabase 載入
            console.log('正在從 Supabase 載入輪播圖資料...');
            
            // 載入輪播圖設定
            const { data: settingsData, error: settingsError } = await supabaseSelect('banner_settings', { limit: 1 });
            if (!settingsError && settingsData && settingsData.length > 0) {
                bannerData.interval = settingsData[0].interval || 2;
            }
            
            // 載入輪播圖列表
            const { data: bannersData, error: bannersError } = await supabaseSelect('banners', {
                order: { column: 'order', ascending: true }
            });
            
            if (!bannersError && bannersData && bannersData.length > 0) {
                // 過濾掉沒有圖片或圖片為空的記錄，並去重（根據 ID）
                const seenIds = new Set();
                bannerData.slides = bannersData
                    .filter(item => {
                        // 只保留有圖片的記錄
                        if (!item.image_url || item.image_url.trim() === '') {
                            return false;
                        }
                        // 去重：如果已經見過這個 ID，跳過
                        if (seenIds.has(item.id)) {
                            console.warn('發現重複的輪播圖記錄，ID:', item.id);
                            return false;
                        }
                        seenIds.add(item.id);
                        return true;
                    })
                    .map(item => ({
                        id: item.id,
                        image: item.image_url || '',
                        link: item.link_url || ''
                    }));
                console.log('從 Supabase 載入輪播圖成功，共', bannerData.slides.length, '張（已過濾重複和空圖片）');
            } else if (bannersError) {
                console.error('從 Supabase 載入輪播圖失敗:', bannersError);
            }
        }
    } catch (error) {
        console.error('載入輪播圖資料失敗:', error);
    }
    
    // 如果 Supabase 沒有資料，從 localStorage 載入
    if (!bannerData.slides || bannerData.slides.length === 0) {
        const localData = JSON.parse(localStorage.getItem('bannerData'));
        if (localData && localData.slides && localData.slides.length > 0) {
            // 過濾掉沒有圖片的記錄，並去重
            const seenIds = new Set();
            const filteredSlides = localData.slides
                .filter(slide => {
                    // 只保留有圖片的記錄
                    if (!slide.image || slide.image.trim() === '') {
                        return false;
                    }
                    // 去重：如果已經見過這個 ID，跳過
                    if (slide.id && seenIds.has(slide.id)) {
                        console.warn('發現重複的輪播圖記錄，ID:', slide.id);
                        return false;
                    }
                    if (slide.id) {
                        seenIds.add(slide.id);
                    }
                    return true;
                });
            
            if (filteredSlides.length > 0) {
                bannerData.slides = filteredSlides;
                console.log('從 localStorage 載入輪播圖，共', bannerData.slides.length, '張（已過濾重複和空圖片）');
            }
        }
    }
    
    // 確保 bannerData 有 slides 屬性
    if (!bannerData.slides) {
        bannerData.slides = [];
    }
    
    let currentIndex = 0;
    let autoPlayInterval = null;
    const intervalTime = (bannerData.interval || 2) * 1000; // 預設 2 秒

    // 渲染輪播圖
    function renderSlides() {
        // 先過濾和去重
        const seenIds = new Set();
        const validSlides = (bannerData.slides || []).filter(slide => {
            // 只保留有圖片的記錄
            if (!slide.image || slide.image.trim() === '') {
                return false;
            }
            // 去重：如果已經見過這個 ID，跳過
            if (slide.id && seenIds.has(slide.id)) {
                console.warn('發現重複的輪播圖記錄，ID:', slide.id);
                return false;
            }
            if (slide.id) {
                seenIds.add(slide.id);
            }
            return true;
        });
        
        if (validSlides.length === 0) {
            sliderWrapper.innerHTML = `
                <div class="slider-slide">
                    <div class="slider-placeholder">
                        <span>請在後台管理上傳輪播圖片</span>
                    </div>
                </div>
            `;
            indicatorsContainer.innerHTML = '';
            if (prevBtn) prevBtn.style.display = 'none';
            if (nextBtn) nextBtn.style.display = 'none';
            return;
        }

        // 渲染圖片（使用過濾後的 slides）
        sliderWrapper.innerHTML = validSlides.map((slide, index) => {
            const imgHtml = slide.image 
                ? `<img src="${slide.image}" alt="Banner ${index + 1}">`
                : `<div class="slider-placeholder"><span>圖片 ${index + 1}</span></div>`;
            
            if (slide.link) {
                return `<div class="slider-slide"><a href="${slide.link}" target="_blank">${imgHtml}</a></div>`;
            }
            return `<div class="slider-slide">${imgHtml}</div>`;
        }).join('');

        // 渲染指示點（使用過濾後的 slides）
        indicatorsContainer.innerHTML = validSlides.map((_, index) => 
            `<button class="slider-indicator ${index === 0 ? 'active' : ''}" data-index="${index}"></button>`
        ).join('');

        // 顯示箭頭（使用過濾後的 slides）
        if (prevBtn) prevBtn.style.display = validSlides.length > 1 ? 'flex' : 'none';
        if (nextBtn) nextBtn.style.display = validSlides.length > 1 ? 'flex' : 'none';
    }

    // 切換到指定幻燈片
    function goToSlide(index) {
        const slides = sliderWrapper.querySelectorAll('.slider-slide');
        const indicators = indicatorsContainer.querySelectorAll('.slider-indicator');
        
        if (slides.length === 0) return;
        
        currentIndex = (index + slides.length) % slides.length;
        sliderWrapper.style.transform = `translateX(-${currentIndex * 100}%)`;
        
        indicators.forEach((indicator, i) => {
            indicator.classList.toggle('active', i === currentIndex);
        });
    }

    // 下一張
    function nextSlide() {
        goToSlide(currentIndex + 1);
    }

    // 上一張
    function prevSlide() {
        goToSlide(currentIndex - 1);
    }

    // 開始自動播放
    function startAutoPlay() {
        if (autoPlayInterval) clearInterval(autoPlayInterval);
        if (!bannerData.slides || bannerData.slides.length <= 1) return;
        
        autoPlayInterval = setInterval(nextSlide, intervalTime);
    }

    // 停止自動播放
    function stopAutoPlay() {
        if (autoPlayInterval) {
            clearInterval(autoPlayInterval);
            autoPlayInterval = null;
        }
    }

    // 初始化
    renderSlides();
    startAutoPlay();

    // 事件監聽
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            prevSlide();
            stopAutoPlay();
            startAutoPlay();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            nextSlide();
            stopAutoPlay();
            startAutoPlay();
        });
    }

    indicatorsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('slider-indicator')) {
            const index = parseInt(e.target.dataset.index);
            goToSlide(index);
            stopAutoPlay();
            startAutoPlay();
        }
    });

    // 滑鼠懸停時停止自動播放
    sliderWrapper.parentElement.addEventListener('mouseenter', stopAutoPlay);
    sliderWrapper.parentElement.addEventListener('mouseleave', startAutoPlay);

    // 觸控滑動支援
    let touchStartX = 0;
    let touchEndX = 0;

    sliderWrapper.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        stopAutoPlay();
    }, { passive: true });

    sliderWrapper.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        }
        startAutoPlay();
    }, { passive: true });
}

/**
 * 預設輪播圖資料
 */
function getDefaultBannerData() {
    return {
        interval: 2, // 預設 2 秒
        slides: []
    };
}

/**
 * 最新消息分頁
 */
function initNewsTabs() {
    const tabs = document.querySelectorAll('.news-tab');
    const newsCards = document.querySelectorAll('.news-card');

    if (!tabs.length) return;

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // 移除所有 active 狀態
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const tabType = tab.dataset.tab;

            // 篩選新聞卡片
            newsCards.forEach(card => {
                const category = card.dataset.category;
                let shouldShow = false;

                if (tabType === 'all') {
                    shouldShow = true;
                } else {
                    const categoryMap = {
                        'announcement': '服務公告',
                        'activity': '活動資訊',
                        'media': '媒體報導'
                    };
                    shouldShow = category === categoryMap[tabType];
                }

                if (shouldShow) {
                    card.style.display = 'flex';
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 150);
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

/**
 * 載入並更新內容設定（統計數字、聯絡資訊等）
 */
async function loadAndUpdateContent() {
    let contentData = {};
    
    try {
        // 嘗試從 Supabase 載入
        const client = getSupabaseClient();
        if (client) {
            console.log('正在從 Supabase 載入內容設定...');
            const { data, error } = await supabaseSelect('content_settings', { limit: 1 });
            
            if (error) {
                console.error('Supabase 查詢錯誤:', error);
            } else if (data && data.length > 0) {
                contentData = data[0].settings || {};
                console.log('從 Supabase 載入的內容設定:', contentData);
            } else {
                console.log('Supabase 中沒有內容設定資料');
            }
        } else {
            console.log('Supabase 客戶端未初始化，使用 localStorage');
        }
    } catch (error) {
        console.error('從 Supabase 載入內容設定失敗:', error);
    }
    
    // 如果 Supabase 沒有資料，從 localStorage 載入
    if (!contentData || Object.keys(contentData).length === 0) {
        const localData = JSON.parse(localStorage.getItem('contentData')) || {};
        if (Object.keys(localData).length > 0) {
            console.log('使用 localStorage 備份資料:', localData);
            contentData = localData;
        } else {
            console.log('沒有找到任何內容設定資料');
            return; // 如果完全沒有資料，就不更新
        }
    }
    
    console.log('將要更新的內容設定:', contentData);
    
    // 更新統計數字（關於我們區域）
    if (contentData.about) {
        const stats = contentData.about;
        
        // 更新年服務經驗
        const yearsCounter = document.querySelector('.about-stats .stat-item:nth-child(1) .stat-number');
        if (yearsCounter && stats.years) {
            yearsCounter.setAttribute('data-count', stats.years);
            yearsCounter.textContent = '0';
        }
        
        // 更新服務客戶
        const customersCounter = document.querySelector('.about-stats .stat-item:nth-child(2) .stat-number');
        if (customersCounter && stats.customers) {
            customersCounter.setAttribute('data-count', stats.customers);
            customersCounter.textContent = '0';
        }
        
        // 更新服務據點
        const locationsCounter = document.querySelector('.about-stats .stat-item:nth-child(3) .stat-number');
        if (locationsCounter && stats.locations) {
            locationsCounter.setAttribute('data-count', stats.locations);
            locationsCounter.textContent = '0';
        }
        
        // 更新關於我們的文字內容
        if (stats.text1) {
            const aboutText1 = document.querySelector('.about-text:nth-of-type(1)');
            if (aboutText1) aboutText1.textContent = stats.text1;
        }
        
        if (stats.text2) {
            const aboutText2 = document.querySelector('.about-text:nth-of-type(2)');
            if (aboutText2) aboutText2.textContent = stats.text2;
        }
        
        if (stats.title) {
            const aboutTitle = document.querySelector('.about-title');
            if (aboutTitle) aboutTitle.textContent = stats.title;
        }
    }
    
    // 更新聯絡資訊
    if (contentData.contact) {
        const contact = contentData.contact;
        console.log('更新聯絡資訊:', contact);
        
        // 更新電話
        if (contact.phone) {
            const phoneValue = document.querySelector('.contact-item:nth-child(1) .contact-value');
            if (phoneValue) {
                phoneValue.textContent = contact.phone;
                console.log('✅ 電話已更新為:', contact.phone);
            } else {
                console.warn('⚠️ 找不到電話元素');
            }
        }
        
        // 更新 Email
        if (contact.email) {
            const emailValue = document.querySelector('.contact-item:nth-child(2) .contact-value');
            if (emailValue) {
                emailValue.textContent = contact.email;
                console.log('✅ Email 已更新為:', contact.email);
            } else {
                console.warn('⚠️ 找不到 Email 元素');
            }
        }
        
        // 更新地址
        if (contact.address) {
            // 嘗試多個選擇器以確保找到元素
            let addressValue = document.querySelector('.contact-item:nth-child(3) .contact-value');
            if (!addressValue) {
                // 備用選擇器：直接找包含地址的元素
                const contactItems = document.querySelectorAll('.contact-item');
                contactItems.forEach(item => {
                    const label = item.querySelector('.contact-label');
                    if (label && label.textContent.includes('地址')) {
                        addressValue = item.querySelector('.contact-value');
                    }
                });
            }
            
            if (addressValue) {
                const oldAddress = addressValue.textContent;
                addressValue.textContent = contact.address;
                console.log('✅ 地址已更新');
                console.log('   舊地址:', oldAddress);
                console.log('   新地址:', contact.address);
            } else {
                console.error('❌ 找不到地址元素');
                console.log('嘗試的選擇器: .contact-item:nth-child(3) .contact-value');
                console.log('所有聯絡項目:', document.querySelectorAll('.contact-item'));
            }
        } else {
            console.warn('⚠️ contentData.contact.address 為空');
        }
    } else {
        console.warn('⚠️ contentData.contact 不存在');
    }
    
    // 更新 Hero 區域
    if (contentData.hero) {
        const hero = contentData.hero;
        
        if (hero.badge) {
            const heroBadge = document.querySelector('.hero-badge');
            if (heroBadge) heroBadge.textContent = hero.badge;
        }
        
        if (hero.titleLine1) {
            const heroTitleLine1 = document.querySelector('.hero-title-line:first-child');
            if (heroTitleLine1) heroTitleLine1.textContent = hero.titleLine1;
        }
        
        if (hero.titleLine2) {
            const heroTitleLine2 = document.querySelector('.hero-title-line.highlight');
            if (heroTitleLine2) heroTitleLine2.textContent = hero.titleLine2;
        }
        
        if (hero.subtitle) {
            const heroSubtitle = document.querySelector('.hero-subtitle');
            if (heroSubtitle) heroSubtitle.textContent = hero.subtitle;
        }
    }
}

/**
 * 數字計數動畫
 */
function initCounterAnimation() {
    const counters = document.querySelectorAll('[data-count]');
    
    if (!counters.length) return;

    const animateCounter = (element) => {
        const target = parseInt(element.dataset.count, 10);
        const duration = 2000; // 2 秒
        const start = 0;
        const startTime = performance.now();

        const updateCounter = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // 使用 easeOutExpo 緩動函數
            const easeProgress = 1 - Math.pow(2, -10 * progress);
            const current = Math.floor(start + (target - start) * easeProgress);
            
            element.textContent = current.toLocaleString();

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target.toLocaleString();
            }
        };

        requestAnimationFrame(updateCounter);
    };

    // 使用 Intersection Observer 監測元素進入視窗
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.5,
        rootMargin: '0px 0px -50px 0px'
    });

    counters.forEach(counter => observer.observe(counter));
}

/**
 * 滾動動畫
 */
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
}

/**
 * 回到頂部按鈕
 */
function initBackToTop() {
    const backToTop = document.querySelector('.back-to-top');
    
    if (!backToTop) return;

    const toggleVisibility = () => {
        if (window.scrollY > 500) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    };

    // 初始檢查
    toggleVisibility();

    // 監聽滾動
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                toggleVisibility();
                ticking = false;
            });
            ticking = true;
        }
    });

    // 點擊回到頂部
    backToTop.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

/**
 * 聯絡表單處理
 */
function initContactForm() {
    const form = document.querySelector('.contact-form');
    
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        // 顯示載入狀態
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
            <svg class="spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" stroke-dasharray="60" stroke-dashoffset="20">
                    <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
                </circle>
            </svg>
            發送中...
        `;

        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // 取得表單資料
            const formData = new FormData(form);
            const messageData = {
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                name: formData.get('name') || form.querySelector('[name="name"]')?.value || '',
                email: formData.get('email') || form.querySelector('[name="email"]')?.value || '',
                phone: formData.get('phone') || form.querySelector('[name="phone"]')?.value || '',
                subject: formData.get('subject') || form.querySelector('[name="subject"]')?.value || '網站聯絡表單',
                message: formData.get('message') || form.querySelector('[name="message"]')?.value || '',
                read: false
            };

            // 優先嘗試寫入 Supabase（若已設定）
            let supabaseError = null;
            try {
                if (typeof supabaseInsert === 'function') {
                    const { error } = await supabaseInsert('contact_messages', {
                        name: messageData.name,
                        email: messageData.email,
                        phone: messageData.phone,
                        subject: messageData.subject,
                        message: messageData.message,
                        created_at: messageData.timestamp
                    });
                    if (error) {
                        supabaseError = error;
                        console.error('Supabase insert error:', error);
                    }
                }
            } catch (err) {
                supabaseError = err;
                console.error('Supabase insert exception:', err);
            }

            // 無論 Supabase 是否成功，仍在 localStorage 保留一份備份
            try {
                let contactMessages = JSON.parse(localStorage.getItem('contactMessages')) || [];
                contactMessages.push(messageData);
                localStorage.setItem('contactMessages', JSON.stringify(contactMessages));
            } catch (err) {
                console.warn('localStorage contactMessages 儲存失敗：', err);
            }
            
            // 顯示成功或部分成功訊息
            if (supabaseError) {
                showNotification('訊息已送出（本機已備份），但雲端儲存失敗，請稍後再試。', 'error');
            } else {
                showNotification('訊息已成功送出！我們會盡快與您聯繫。', 'success');
            }
            form.reset();
        } catch (error) {
            console.error('送出聯絡表單發生錯誤：', error);
            showNotification('發送失敗，請稍後再試。', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    });

    // 添加輸入驗證視覺效果
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('blur', () => {
            if (input.value.trim()) {
                input.classList.add('has-value');
            } else {
                input.classList.remove('has-value');
            }
        });
    });
}

/**
 * 顯示通知訊息
 */
function showNotification(message, type = 'info') {
    // 移除現有通知
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // 創建通知元素
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="notification-close" aria-label="關閉">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>
    `;

    // 添加樣式
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                bottom: var(--space-xl);
                left: 50%;
                transform: translateX(-50%) translateY(100px);
                display: flex;
                align-items: center;
                gap: var(--space-md);
                padding: var(--space-md) var(--space-xl);
                background: var(--color-dark);
                color: var(--color-white);
                border-radius: var(--radius-md);
                box-shadow: var(--shadow-xl);
                z-index: 10000;
                opacity: 0;
                transition: all var(--transition-base);
            }
            
            .notification.show {
                transform: translateX(-50%) translateY(0);
                opacity: 1;
            }
            
            .notification-success {
                background: #0D7377;
            }
            
            .notification-error {
                background: #C62828;
            }
            
            .notification-close {
                display: flex;
                align-items: center;
                justify-content: center;
                padding: var(--space-xs);
                color: rgba(255, 255, 255, 0.7);
                transition: color var(--transition-fast);
            }
            
            .notification-close:hover {
                color: var(--color-white);
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // 顯示動畫
    requestAnimationFrame(() => {
        notification.classList.add('show');
    });

    // 自動關閉
    const autoClose = setTimeout(() => {
        closeNotification(notification);
    }, 5000);

    // 手動關閉
    notification.querySelector('.notification-close').addEventListener('click', () => {
        clearTimeout(autoClose);
        closeNotification(notification);
    });
}

function closeNotification(notification) {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
}

/**
 * 平滑滾動到錨點
 */
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === '#') return;
            
            const target = document.querySelector(href);
            if (!target) return;
            
            e.preventDefault();
            
            const headerHeight = document.querySelector('.header').offsetHeight;
            const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight - 20;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        });
    });
}

/**
 * 防抖函數
 */
function debounce(func, wait = 100) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * 節流函數
 */
function throttle(func, limit = 100) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

