/**
 * 金優匯 - 主要 JavaScript 檔案
 * 包含所有互動功能與動畫效果
 */

document.addEventListener('DOMContentLoaded', async () => {
    // 初始化 SPA 路由器
    initSPARouter();

    // 初始化所有功能
    await initPageFeatures();
});

/**
 * 初始化頁面功能（每次頁面切換後都要呼叫）
 */
async function initPageFeatures() {
    initHeader();
    initMobileMenu();
    initBannerSlider();
    loadNewsData();
    initNewsTabs();
    initScrollAnimations();
    initBackToTop();
    initContactForm();
    initSmoothScroll();
    initCookieConsent();
    trackVisitor();

    // 載入並更新內容設定（統計數字、聯絡資訊等）
    await loadAndUpdateContent();

    // 載入 App QR Code 設定
    await loadAppQRCodes();

    // 載入網站設定（聯絡資訊、社群連結）
    await loadSiteSettings();

    // 載入內容後再初始化計數動畫
    initCounterAnimation();
}

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
 * 載入網站設定（聯絡資訊、社群連結）
 * 從 content_settings 資料表的 contact 區塊讀取
 */
async function loadSiteSettings() {
    try {
        const { data, error } = await supabaseSelect('content_settings', { limit: 1 });
        if (error || !data || data.length === 0) {
            console.log('Content settings not available, using defaults');
            initAddressLink(); // 使用預設地址
            return;
        }

        const contentData = data[0].settings || {};
        const contact = contentData.contact || {};

        // 更新 Footer 聯絡資訊
        const phoneEl = document.getElementById('contact-phone');
        const emailEl = document.getElementById('contact-email');
        const addressEl = document.getElementById('contact-address');

        if (phoneEl && contact.phone) phoneEl.textContent = contact.phone;
        if (emailEl && contact.email) emailEl.textContent = contact.email;
        if (addressEl && contact.address) addressEl.textContent = contact.address;

        // 更新首頁聯絡區塊
        const indexPhoneEl = document.getElementById('index-contact-phone');
        const indexEmailEl = document.getElementById('index-contact-email');
        const indexAddressEl = document.getElementById('index-contact-address');

        if (indexPhoneEl && contact.phone) indexPhoneEl.textContent = contact.phone;
        if (indexEmailEl && contact.email) indexEmailEl.textContent = contact.email;
        if (indexAddressEl && contact.address) indexAddressEl.textContent = contact.address;

        // 更新地址的 Google Maps 連結
        initAddressLink();

        // 更新懸浮社群按鈕連結
        const linkedinBtn = document.getElementById('float-linkedin');
        const facebookBtn = document.getElementById('float-facebook');
        const instagramBtn = document.getElementById('float-instagram');

        if (linkedinBtn && contact.linkedin_url) linkedinBtn.href = contact.linkedin_url;
        if (facebookBtn && contact.facebook_url) facebookBtn.href = contact.facebook_url;
        if (instagramBtn && contact.instagram_url) instagramBtn.href = contact.instagram_url;

        // 更新 Footer 社群連結（與懸浮按鈕同步）
        const footerFacebook = document.getElementById('footer-facebook');
        const footerLine = document.getElementById('footer-line');
        const footerInstagram = document.getElementById('footer-instagram');

        if (footerFacebook && contact.facebook_url) footerFacebook.href = contact.facebook_url;
        if (footerLine && contact.line_url) footerLine.href = contact.line_url;
        if (footerInstagram && contact.instagram_url) footerInstagram.href = contact.instagram_url;

        console.log('Contact settings loaded successfully');
    } catch (error) {
        console.log('Failed to load contact settings:', error);
        initAddressLink(); // 發生錯誤時也要初始化地址連結
    }
}

/**
 * 初始化地址的 Google Maps 連結
 */
function initAddressLink() {
    const addressLink = document.getElementById('contact-address-link');
    const addressEl = document.getElementById('contact-address');

    if (addressLink && addressEl) {
        const address = addressEl.textContent || '台北市內湖區安美街181號';
        const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
        addressLink.href = googleMapsUrl;
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
 * Cookie 同意橫幅
 */
function initCookieConsent() {
    // 檢查是否已經同意過
    const consentStatus = localStorage.getItem('cookieConsent');
    if (consentStatus) {
        return; // 已經做過選擇，不再顯示
    }

    // 建立 Cookie 橫幅 HTML
    const banner = document.createElement('div');
    banner.className = 'cookie-banner';
    banner.innerHTML = `
        <div class="cookie-content">
            <div class="cookie-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 6v6l4 2"></path>
                </svg>
            </div>
            <div class="cookie-text">
                <h4>我們使用 Cookies</h4>
                <p>我們使用 Cookies 和類似技術來改善您的瀏覽體驗、分析網站流量，並提供個人化內容。點擊「接受」即表示您同意我們使用 Cookies。</p>
            </div>
            <div class="cookie-actions">
                <button class="cookie-btn cookie-btn-accept" id="cookieAccept">接受</button>
                <button class="cookie-btn cookie-btn-decline" id="cookieDecline">拒絕</button>
                <a href="#" class="cookie-link" id="cookieMore">了解更多</a>
            </div>
        </div>
    `;

    // 加入頁面
    document.body.appendChild(banner);

    // 動畫顯示（延遲一下讓頁面載入完成）
    setTimeout(() => {
        banner.classList.add('show');
    }, 1000);

    // 接受按鈕
    document.getElementById('cookieAccept').addEventListener('click', () => {
        localStorage.setItem('cookieConsent', 'accepted');
        localStorage.setItem('cookieConsentDate', new Date().toISOString());
        hideCookieBanner(banner);
        // 可以在這裡啟用追蹤功能
        enableTracking();
    });

    // 拒絕按鈕
    document.getElementById('cookieDecline').addEventListener('click', () => {
        localStorage.setItem('cookieConsent', 'declined');
        localStorage.setItem('cookieConsentDate', new Date().toISOString());
        hideCookieBanner(banner);
    });

    // 了解更多（可連結到隱私政策頁面）
    document.getElementById('cookieMore').addEventListener('click', (e) => {
        e.preventDefault();
        // 可以改成連結到隱私政策頁面
        alert('隱私權政策：我們收集的資料包括訪問時間、頁面瀏覽、裝置資訊等，用於改善網站體驗和分析流量。我們不會將您的個人資料出售給第三方。');
    });
}

/**
 * 隱藏 Cookie 橫幅
 */
function hideCookieBanner(banner) {
    banner.classList.remove('show');
    banner.classList.add('hide');
    setTimeout(() => {
        banner.remove();
    }, 300);
}

/**
 * 啟用追蹤功能（用戶同意後）
 */
function enableTracking() {
    console.log('Cookie 已接受，追蹤功能已啟用');

    // 啟用 Google Analytics 4 追蹤
    if (typeof gtag !== 'undefined') {
        gtag('consent', 'update', {
            'analytics_storage': 'granted',
            'ad_storage': 'granted'
        });
        console.log('Google Analytics 4 追蹤已啟用');
    }

    // 啟用 Microsoft Clarity（動態載入）
    if (typeof clarity === 'undefined') {
        (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "v8f7fdqqm7");
        console.log('Microsoft Clarity 追蹤已啟用');
    }
}

/**
 * 檢查用戶是否已同意 Cookie
 */
function hasCookieConsent() {
    return localStorage.getItem('cookieConsent') === 'accepted';
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
            display: flex;
            flex-direction: column;
            align-items: stretch;
            gap: 0;
        }

        .mobile-nav .nav-item {
            width: 100%;
        }

        .mobile-nav .nav-link {
            display: flex;
            padding: var(--space-lg);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            font-size: 1.1rem;
            color: white;
        }

        .mobile-nav .nav-link:hover {
            color: var(--color-accent);
            background: rgba(255, 255, 255, 0.05);
        }

        .mobile-nav .dropdown-arrow {
            margin-left: auto;
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
            color: rgba(255, 255, 255, 0.7);
            padding: var(--space-md) var(--space-xl);
            display: block;
        }

        .mobile-nav .dropdown li a:hover {
            color: var(--color-accent);
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
    // 支援兩種新聞卡片格式：.news-card (首頁) 和 .news-item (新聞頁)
    const newsCards = document.querySelectorAll('.news-card, .news-item');

    if (!tabs.length || !newsCards.length) return;

    const categoryMap = {
        'announcement': '服務公告',
        'activity': '活動資訊',
        'media': '媒體報導'
    };

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // 移除所有 active 狀態
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const tabType = tab.dataset.tab;

            // 篩選新聞卡片
            newsCards.forEach(card => {
                // 從 data-category 屬性或 .news-item-category / .news-category 元素取得分類
                let category = card.dataset.category;
                if (!category) {
                    const categoryEl = card.querySelector('.news-item-category, .news-category');
                    if (categoryEl) {
                        category = categoryEl.textContent.trim();
                    }
                }

                let shouldShow = false;

                if (tabType === 'all') {
                    shouldShow = true;
                } else {
                    shouldShow = category === categoryMap[tabType];
                }

                if (shouldShow) {
                    card.style.display = '';
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
        const aboutTexts = document.querySelectorAll('.about-text');
        if (stats.text1 && aboutTexts[0]) {
            aboutTexts[0].textContent = stats.text1;
        }

        if (stats.text2 && aboutTexts[1]) {
            aboutTexts[1].textContent = stats.text2;
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
 * 回到頂部按鈕與懸浮社群按鈕
 */
function initBackToTop() {
    const backToTop = document.querySelector('.back-to-top');
    const floatingSocial = document.querySelector('.floating-social');
    const floatTop = document.getElementById('float-top');
    const floatEmail = document.getElementById('float-email');

    const toggleVisibility = () => {
        const showThreshold = 300;
        if (window.scrollY > showThreshold) {
            if (backToTop) backToTop.classList.add('visible');
            if (floatingSocial) floatingSocial.classList.add('visible');
        } else {
            if (backToTop) backToTop.classList.remove('visible');
            if (floatingSocial) floatingSocial.classList.remove('visible');
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

    // 點擊回到頂部（原始按鈕）
    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // 點擊懸浮回到頂部按鈕
    if (floatTop) {
        floatTop.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // 點擊 Email 按鈕
    if (floatEmail) {
        floatEmail.addEventListener('click', (e) => {
            e.preventDefault();
            const emailSpan = document.getElementById('contact-email');
            const email = emailSpan ? emailSpan.textContent : 'service@yourremit.com';
            window.location.href = `mailto:${email}`;
        });
    }
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

// ==================== SPA 路由器 ====================

/**
 * SPA 路由器 - 實現無刷新頁面切換
 */
let isNavigating = false;

function initSPARouter() {
    // 攔截所有內部連結點擊
    document.addEventListener('click', handleLinkClick);

    // 處理瀏覽器上一頁/下一頁
    window.addEventListener('popstate', handlePopState);

    // 標記當前頁面已載入
    window.spaInitialized = true;
}

/**
 * 處理連結點擊
 */
function handleLinkClick(e) {
    const link = e.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href) return;

    // 取得當前頁面路徑
    const currentPath = window.location.pathname;

    // 需要排除 SPA 的頁面（使用額外 CSS 或特殊結構）
    const excludedPages = ['investor', 'service-detail', 'app-download'];
    const isCurrentPageExcluded = excludedPages.some(page => currentPath.includes(page));
    const isTargetPageExcluded = excludedPages.some(page => href.includes(page));

    // 跳過以下情況：
    // - 外部連結
    // - 錨點連結 (#)
    // - 新視窗連結
    // - 下載連結
    // - JavaScript 連結
    // - 管理後台連結
    // - 當前頁面或目標頁面使用額外 CSS
    if (
        href.startsWith('http') ||
        href.startsWith('//') ||
        href.startsWith('#') ||
        href.startsWith('javascript:') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.includes('admin') ||
        href.includes('login') ||
        isCurrentPageExcluded ||
        isTargetPageExcluded ||
        link.target === '_blank' ||
        link.hasAttribute('download') ||
        link.classList.contains('no-spa')
    ) {
        return;
    }

    // 如果是同頁面的錨點，讓瀏覽器處理
    if (href.includes('#') && href.split('#')[0] === '' ) {
        return;
    }

    e.preventDefault();
    navigateToPage(href);
}

/**
 * 導航到新頁面
 */
async function navigateToPage(url) {
    if (isNavigating) return;
    isNavigating = true;

    // 顯示載入指示器
    showPageLoader();

    try {
        // 標準化 URL
        let targetUrl = url;
        if (!targetUrl.endsWith('.html') && !targetUrl.includes('.html?') && !targetUrl.includes('.html#')) {
            if (targetUrl === '/' || targetUrl === '') {
                targetUrl = 'index.html';
            } else if (!targetUrl.includes('.')) {
                targetUrl = targetUrl + '.html';
            }
        }

        // 處理相對路徑
        const currentPath = window.location.pathname;
        const currentDir = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);

        let fullUrl;
        if (targetUrl.startsWith('/')) {
            fullUrl = targetUrl;
        } else {
            fullUrl = currentDir + targetUrl;
        }

        // 取得新頁面內容
        const response = await fetch(fullUrl);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const html = await response.text();

        // 解析新頁面
        const parser = new DOMParser();
        const newDoc = parser.parseFromString(html, 'text/html');

        // 取得新頁面的主要內容（排除 header）
        const newMain = newDoc.querySelector('main') || newDoc.querySelector('.page-hero')?.parentElement || newDoc.body;
        const currentMain = document.querySelector('main') || document.body;

        // 取得新頁面標題
        const newTitle = newDoc.querySelector('title')?.textContent || document.title;

        // 取得新頁面的 body class
        const newBodyClass = newDoc.body.className;

        // 抽取 header 之後、footer 之前的內容
        const newContent = extractMainContent(newDoc);
        const oldContent = extractMainContent(document);

        if (newContent && oldContent) {
            // 淡出效果
            oldContent.style.opacity = '0';
            oldContent.style.transition = 'opacity 0.2s ease';

            await new Promise(resolve => setTimeout(resolve, 200));

            // 替換內容
            oldContent.innerHTML = newContent.innerHTML;

            // 更新 body class
            document.body.className = newBodyClass;

            // 淡入效果
            oldContent.style.opacity = '1';
        }

        // 更新頁面標題
        document.title = newTitle;

        // 更新 URL（不觸發 popstate）
        const urlWithoutHash = fullUrl.split('#')[0];
        const hash = fullUrl.includes('#') ? '#' + fullUrl.split('#')[1] : '';
        history.pushState({ url: fullUrl }, newTitle, fullUrl);

        // 捲動到頁面頂部或指定錨點
        if (hash) {
            const target = document.querySelector(hash);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
            window.scrollTo({ top: 0, behavior: 'instant' });
        }

        // 重新初始化頁面功能
        await initPageFeatures();

        // 更新導航列的 active 狀態
        updateNavActiveState(fullUrl);

    } catch (error) {
        console.error('SPA navigation error:', error);
        // 如果 SPA 導航失敗，使用傳統方式導航
        window.location.href = url;
    } finally {
        hidePageLoader();
        isNavigating = false;
    }
}

/**
 * 抽取主要內容（header 和 footer 之間的內容）
 */
function extractMainContent(doc) {
    // 嘗試找到 main 元素
    let main = doc.querySelector('main#page-content');
    if (main) return main;

    // 如果沒有 main 元素，創建一個虛擬容器
    const header = doc.querySelector('header.header');
    const footer = doc.querySelector('footer.footer');

    if (!header) return null;

    // 取得 header 之後的所有兄弟元素，直到 footer
    const content = doc.createElement('div');
    let sibling = header.nextElementSibling;

    while (sibling && sibling !== footer) {
        if (!sibling.classList.contains('cookie-consent') &&
            !sibling.classList.contains('float-social') &&
            !sibling.classList.contains('back-to-top') &&
            sibling.tagName !== 'SCRIPT') {
            content.appendChild(sibling.cloneNode(true));
        }
        sibling = sibling.nextElementSibling;
    }

    return content;
}

/**
 * 處理瀏覽器上一頁/下一頁
 */
async function handlePopState(e) {
    if (e.state && e.state.url) {
        await navigateToPage(e.state.url);
    } else {
        // 如果沒有 state，重新載入當前 URL
        await navigateToPage(window.location.pathname);
    }
}

/**
 * 更新導航列的 active 狀態
 */
function updateNavActiveState(currentUrl) {
    const navLinks = document.querySelectorAll('.nav-link');
    const currentPage = currentUrl.split('/').pop().split('?')[0].split('#')[0];

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (!href) return;

        const linkPage = href.split('/').pop().split('?')[0].split('#')[0];

        if (linkPage === currentPage ||
            (currentPage === 'index.html' && (linkPage === '' || linkPage === '/'))) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

/**
 * 顯示頁面載入指示器
 */
function showPageLoader() {
    let loader = document.getElementById('spa-loader');
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'spa-loader';
        loader.innerHTML = `
            <div class="spa-loader-bar"></div>
        `;
        document.body.appendChild(loader);
    }
    loader.classList.add('active');
}

/**
 * 隱藏頁面載入指示器
 */
function hidePageLoader() {
    const loader = document.getElementById('spa-loader');
    if (loader) {
        loader.classList.remove('active');
    }
}

