/**
 * 多國語系核心模組 (i18n.js)
 * 支援語言：zh-TW, en, vi, ind, th
 */

const I18N = {
    // 支援的語言
    LANGUAGES: {
        'zh-TW': { name: '繁體中文', flag: '🇹🇼', code: 'zh_tw', urlPrefix: '' },
        'en': { name: 'English', flag: '🇺🇸', code: 'en', urlPrefix: 'en' },
        'vi': { name: 'Tiếng Việt', flag: '🇻🇳', code: 'vi', urlPrefix: 'vi' },
        'id': { name: 'Indonesia', flag: '🇮🇩', code: 'ind', urlPrefix: 'id' },
        'th': { name: 'ภาษาไทย', flag: '🇹🇭', code: 'th', urlPrefix: 'th' }
    },

    // 當前語言
    currentLang: 'zh-TW',

    // 翻譯快取
    translations: {},

    // 快取過期時間（24小時）
    CACHE_DURATION: 24 * 60 * 60 * 1000,

    /**
     * 初始化多語系
     */
    async init() {
        // 偵測當前語言
        this.currentLang = this.detectLanguage();

        // 設定 HTML lang 屬性
        document.documentElement.lang = this.currentLang;

        // 載入翻譯
        await this.loadTranslations();

        // 套用翻譯到頁面
        this.applyTranslations();

        // 建立語言切換器
        this.createLanguageSwitcher();

        console.log(`[i18n] 初始化完成，當前語言: ${this.currentLang}`);
    },

    /**
     * 從 URL 路徑偵測語言
     */
    detectLanguage() {
        const path = window.location.pathname;

        // 檢查 URL 前綴
        if (path.startsWith('/en/') || path === '/en') return 'en';
        if (path.startsWith('/vi/') || path === '/vi') return 'vi';
        if (path.startsWith('/id/') || path === '/id') return 'id';
        if (path.startsWith('/th/') || path === '/th') return 'th';

        // 預設繁體中文
        return 'zh-TW';
    },

    /**
     * 取得當前語言的資料庫欄位名稱
     */
    getLangColumn() {
        return this.LANGUAGES[this.currentLang]?.code || 'zh_tw';
    },

    /**
     * 載入翻譯資料
     */
    async loadTranslations() {
        const cacheKey = `i18n_cache_${this.currentLang}`;
        const cacheTimeKey = `i18n_cache_time_${this.currentLang}`;

        // 檢查快取
        const cachedData = localStorage.getItem(cacheKey);
        const cacheTime = localStorage.getItem(cacheTimeKey);

        if (cachedData && cacheTime) {
            const age = Date.now() - parseInt(cacheTime);
            if (age < this.CACHE_DURATION) {
                this.translations = JSON.parse(cachedData);
                console.log('[i18n] 使用快取的翻譯資料');
                return;
            }
        }

        // 從 Supabase 載入
        try {
            const response = await fetch(
                `${SUPABASE_URL}/rest/v1/translations?select=key,zh_tw,${this.getLangColumn()}`,
                {
                    headers: {
                        'apikey': SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                    }
                }
            );

            if (!response.ok) throw new Error('載入翻譯失敗');

            const data = await response.json();

            // 轉換為 key-value 格式
            this.translations = {};
            const langCol = this.getLangColumn();

            data.forEach(item => {
                // 優先使用當前語言，沒有則用繁中
                this.translations[item.key] = item[langCol] || item.zh_tw;
            });

            // 儲存快取
            localStorage.setItem(cacheKey, JSON.stringify(this.translations));
            localStorage.setItem(cacheTimeKey, Date.now().toString());

            console.log(`[i18n] 已載入 ${Object.keys(this.translations).length} 條翻譯`);

        } catch (error) {
            console.error('[i18n] 載入翻譯失敗:', error);
            // 載入失敗時使用空物件，頁面會顯示原始繁中內容
            this.translations = {};
        }
    },

    /**
     * 套用翻譯到頁面元素
     */
    applyTranslations() {
        // 如果是繁中，不需要替換
        if (this.currentLang === 'zh-TW') return;

        // 找到所有有 data-i18n 屬性的元素
        const elements = document.querySelectorAll('[data-i18n]');

        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = this.translations[key];

            if (translation) {
                // 檢查是否有 placeholder 屬性需要翻譯
                if (el.hasAttribute('data-i18n-placeholder')) {
                    el.placeholder = translation;
                }
                // 檢查是否有 title 屬性需要翻譯
                else if (el.hasAttribute('data-i18n-title')) {
                    el.title = translation;
                }
                // 預設替換 innerHTML
                else {
                    el.innerHTML = translation;
                }
            }
        });

        console.log(`[i18n] 已套用翻譯到 ${elements.length} 個元素`);
    },

    /**
     * 取得翻譯文字
     */
    t(key, fallback = '') {
        if (this.currentLang === 'zh-TW') {
            return fallback || key;
        }
        return this.translations[key] || fallback || key;
    },

    /**
     * 建立語言切換器
     */
    createLanguageSwitcher() {
        // 檢查是否已存在
        if (document.querySelector('.language-switcher')) return;

        // 找到 header 的導航區域
        const nav = document.querySelector('.nav-right') || document.querySelector('.header-container');
        if (!nav) return;

        // 建立語言切換器
        const switcher = document.createElement('div');
        switcher.className = 'language-switcher';

        const currentLangInfo = this.LANGUAGES[this.currentLang];

        switcher.innerHTML = `
            <button class="lang-toggle" aria-label="切換語言">
                <span class="lang-flag">${currentLangInfo.flag}</span>
                <span class="lang-code">${this.currentLang === 'zh-TW' ? '繁' : this.currentLang.toUpperCase()}</span>
                <svg class="lang-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
            </button>
            <div class="lang-dropdown">
                ${Object.entries(this.LANGUAGES).map(([code, lang]) => `
                    <a href="${this.getLanguageUrl(code)}"
                       class="lang-option ${code === this.currentLang ? 'active' : ''}"
                       data-lang="${code}">
                        <span class="lang-flag">${lang.flag}</span>
                        <span class="lang-name">${lang.name}</span>
                    </a>
                `).join('')}
            </div>
        `;

        // 插入到導航列
        nav.appendChild(switcher);

        // 綁定事件
        const toggle = switcher.querySelector('.lang-toggle');
        const dropdown = switcher.querySelector('.lang-dropdown');

        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('show');
        });

        // 語言選項點擊 - 確保導航發生
        const langOptions = switcher.querySelectorAll('.lang-option');
        langOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                const href = option.getAttribute('href');
                if (href && href !== '#') {
                    // 確保頁面導航
                    window.location.href = href;
                }
            });
        });

        // 點擊外部關閉
        document.addEventListener('click', () => {
            dropdown.classList.remove('show');
        });
    },

    /**
     * 取得切換語言的 URL
     */
    getLanguageUrl(targetLang) {
        let currentPath = window.location.pathname;
        const currentLangPrefix = this.LANGUAGES[this.currentLang].urlPrefix;
        const targetLangPrefix = this.LANGUAGES[targetLang].urlPrefix;

        // 處理本地 file:// 協議的情況
        const isLocalFile = window.location.protocol === 'file:';
        if (isLocalFile) {
            // 取得檔案名稱
            const fileName = currentPath.split('/').pop() || 'index.html';

            // 判斷當前是否在語言子資料夾
            const pathParts = currentPath.split('/');
            const langFolders = ['en', 'vi', 'id', 'th'];
            let currentFolder = '';

            for (let i = pathParts.length - 2; i >= 0; i--) {
                if (langFolders.includes(pathParts[i])) {
                    currentFolder = pathParts[i];
                    break;
                }
            }

            // 建構目標 URL
            if (targetLangPrefix) {
                if (currentFolder) {
                    // 從語言資料夾切換到另一個語言資料夾
                    return currentPath.replace(`/${currentFolder}/`, `/${targetLangPrefix}/`);
                } else {
                    // 從根目錄切換到語言資料夾
                    const lastSlash = currentPath.lastIndexOf('/');
                    return currentPath.substring(0, lastSlash) + `/${targetLangPrefix}/${fileName}`;
                }
            } else {
                // 切換到繁中（根目錄）
                if (currentFolder) {
                    return currentPath.replace(`/${currentFolder}/`, '/');
                }
                return currentPath;
            }
        }

        // 移除當前語言前綴
        let basePath = currentPath;
        if (currentLangPrefix && currentPath.startsWith(`/${currentLangPrefix}/`)) {
            basePath = currentPath.substring(currentLangPrefix.length + 1);
        } else if (currentLangPrefix && currentPath === `/${currentLangPrefix}`) {
            basePath = '/index.html';
        }

        // 確保 basePath 以 / 開頭
        if (!basePath.startsWith('/')) {
            basePath = '/' + basePath;
        }

        // 處理根路徑
        if (basePath === '/' || basePath === '') {
            basePath = '/index.html';
        }

        // 加上目標語言前綴
        if (targetLangPrefix) {
            return `/${targetLangPrefix}${basePath}`;
        }

        // 繁中不需要前綴
        return basePath;
    },

    /**
     * 清除翻譯快取
     */
    clearCache() {
        Object.keys(this.LANGUAGES).forEach(lang => {
            localStorage.removeItem(`i18n_cache_${lang}`);
            localStorage.removeItem(`i18n_cache_time_${lang}`);
        });
        console.log('[i18n] 快取已清除');
    }
};

// 頁面載入時初始化
document.addEventListener('DOMContentLoaded', () => {
    // 確保 Supabase 變數已定義（來自 api-client.js）
    if (typeof SUPABASE_URL !== 'undefined' && typeof SUPABASE_ANON_KEY !== 'undefined') {
        I18N.init();
    } else {
        console.warn('[i18n] Supabase 設定未找到，多語系功能未啟用');
    }
});
