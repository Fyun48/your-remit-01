/**
 * 後台資料庫整合輔助函數（NeonDB）
 * 提供資料載入、儲存、更新、刪除等功能
 * 如果 API 連線失敗，會自動 fallback 到 localStorage
 */

// ============================================
// 資料載入函數
// ============================================

/**
 * 載入最新消息
 */
async function loadNewsData() {
    const client = getSupabaseClient();
    if (!client) {
        // Fallback to localStorage
        return JSON.parse(localStorage.getItem('newsData')) || [];
    }

    try {
        const { data, error } = await supabaseSelect('news', {
            order: { column: 'order', ascending: true }
        });

        if (error) throw error;

        // 轉換格式（Supabase 使用 snake_case，前端使用 camelCase）
        return (data || []).map(item => ({
            id: item.id,
            title: item.title,
            category: item.category,
            date: item.date,
            endDate: item.end_date || '',
            content: item.content,
            order: item.order || 0
        }));
    } catch (error) {
        console.error('載入最新消息失敗:', error);
        // Fallback to localStorage
        return JSON.parse(localStorage.getItem('newsData')) || [];
    }
}

/**
 * 載入輪播圖資料
 */
async function loadBannerData() {
    const client = getSupabaseClient();
    if (!client) {
        // Fallback to localStorage
        const stored = JSON.parse(localStorage.getItem('bannerData')) || { interval: 2, slides: [] };
        return stored;
    }

    try {
        // 載入輪播圖設定
        const { data: settingsData, error: settingsError } = await supabaseSelect('banner_settings', { limit: 1 });
        const interval = settingsData && settingsData.length > 0 ? settingsData[0].interval : 2;

        // 載入輪播圖列表
        const { data: bannersData, error: bannersError } = await supabaseSelect('banners', {
            order: { column: 'order', ascending: true }
        });

        if (bannersError) throw bannersError;

        // 轉換格式
        const slides = (bannersData || []).map(item => ({
            id: item.id,
            image: item.image_url,
            link: item.link_url || ''
        }));

        return { interval, slides };
    } catch (error) {
        console.error('載入輪播圖失敗:', error);
        // Fallback to localStorage
        return JSON.parse(localStorage.getItem('bannerData')) || { interval: 2, slides: [] };
    }
}

/**
 * 載入圖片資料
 */
async function loadImageData() {
    const client = getSupabaseClient();
    if (!client) {
        // Fallback to localStorage
        return JSON.parse(localStorage.getItem('imageData')) || [];
    }

    try {
        const { data, error } = await supabaseSelect('images', {
            order: { column: 'created_at', ascending: false }
        });

        if (error) throw error;

        // 轉換格式
        return (data || []).map(item => ({
            id: item.id,
            name: item.name,
            data: item.file_url,
            size: item.file_size ? formatFileSize(item.file_size) : '0 B',
            fileSize: item.file_size || 0,
            mimeType: item.mime_type,
            width: item.width || 0,
            height: item.height || 0,
            group: item.group || 'default',
            description: item.description || '',
            showInBanner: item.show_in_banner || false,
            createdAt: item.created_at,
            filePath: item.file_path
        }));
    } catch (error) {
        console.error('載入圖片失敗:', error);
        // Fallback to localStorage
        return JSON.parse(localStorage.getItem('imageData')) || [];
    }
}

/**
 * 載入內容設定
 */
async function loadContentData() {
    const client = getSupabaseClient();
    if (!client) {
        // Fallback to localStorage
        return JSON.parse(localStorage.getItem('contentData')) || {};
    }

    try {
        const { data, error } = await supabaseSelect('content_settings', { limit: 1 });

        if (error) throw error;

        if (data && data.length > 0) {
            return data[0].settings || {};
        }

        return {};
    } catch (error) {
        console.error('載入內容設定失敗:', error);
        // Fallback to localStorage
        return JSON.parse(localStorage.getItem('contentData')) || {};
    }
}

/**
 * 載入服務詳情
 */
async function loadServiceDetailData() {
    const client = getSupabaseClient();
    if (!client) {
        // Fallback to localStorage
        return JSON.parse(localStorage.getItem('serviceDetailData')) || {};
    }

    try {
        const { data, error } = await supabaseSelect('service_details');

        if (error) throw error;

        // 轉換格式（以 service_id 為 key）
        const result = {};
        (data || []).forEach(item => {
            result[item.service_id] = {
                title: item.title,
                tag: item.tag,
                description: item.description,
                sections: item.sections || []
            };
        });

        return result;
    } catch (error) {
        console.error('載入服務詳情失敗:', error);
        // Fallback to localStorage
        return JSON.parse(localStorage.getItem('serviceDetailData')) || {};
    }
}

/**
 * 載入聯絡訊息
 */
async function loadContactMessages() {
    const client = getSupabaseClient();
    if (!client) {
        // Fallback to localStorage
        return JSON.parse(localStorage.getItem('contactMessages')) || [];
    }

    try {
        const { data, error } = await supabaseSelect('contact_messages', {
            order: { column: 'created_at', ascending: false }
        });

        if (error) throw error;

        // 轉換格式
        return (data || []).map(item => ({
            id: item.id,
            name: item.name,
            email: item.email,
            phone: item.phone || '',
            subject: item.subject || '',
            message: item.message,
            read: item.read || false,
            timestamp: item.created_at
        }));
    } catch (error) {
        console.error('載入聯絡訊息失敗:', error);
        // Fallback to localStorage
        return JSON.parse(localStorage.getItem('contactMessages')) || [];
    }
}

/**
 * 載入訪客統計
 */
async function loadVisitorStats() {
    const client = getSupabaseClient();
    if (!client) {
        // Fallback to localStorage
        const logs = JSON.parse(localStorage.getItem('visitorLogs')) || [];
        const stats = JSON.parse(localStorage.getItem('dailyVisitorStats')) || {};
        return { logs, stats };
    }

    try {
        // 載入訪客記錄
        const { data: logsData, error: logsError } = await supabaseSelect('visitor_logs', {
            order: { column: 'created_at', ascending: false },
            limit: 1000
        });

        if (logsError) throw logsError;

        // 計算每日統計
        const stats = {};
        (logsData || []).forEach(log => {
            const date = log.date;
            if (!stats[date]) {
                stats[date] = 0;
            }
            stats[date]++;
        });

        // 轉換格式
        const logs = (logsData || []).map(item => ({
            id: item.id,
            date: item.date,
            time: item.time,
            referrer: item.referrer,
            page: item.page,
            userAgent: item.user_agent,
            screenSize: item.screen_size,
            language: item.language,
            timestamp: item.created_at
        }));

        return { logs, stats };
    } catch (error) {
        console.error('載入訪客統計失敗:', error);
        // Fallback to localStorage
        const logs = JSON.parse(localStorage.getItem('visitorLogs')) || [];
        const stats = JSON.parse(localStorage.getItem('dailyVisitorStats')) || {};
        return { logs, stats };
    }
}

// ============================================
// 資料儲存函數
// ============================================

/**
 * 儲存最新消息（新增或更新）
 */
async function saveNewsItem(newsItem) {
    const client = getSupabaseClient();
    
    // 準備 Supabase 格式
    const payload = {
        title: newsItem.title,
        category: newsItem.category,
        date: newsItem.date,
        end_date: newsItem.endDate || null,
        content: newsItem.content,
        order: newsItem.order || 0
    };

    try {
        if (client) {
            if (newsItem.id && typeof newsItem.id === 'string' && newsItem.id.includes('-')) {
                // UUID，更新現有記錄
                const { error } = await supabaseUpdate('news', newsItem.id, payload);
                if (error) throw error;
            } else {
                // 新增記錄
                const { data, error } = await supabaseInsert('news', payload);
                if (error) throw error;
                if (data && data.length > 0) {
                    newsItem.id = data[0].id;
                }
            }
        }
    } catch (error) {
        console.error('儲存最新消息到 Supabase 失敗:', error);
    }

    // 同時儲存到 localStorage（作為備份）
    let newsData = JSON.parse(localStorage.getItem('newsData')) || [];
    const index = newsData.findIndex(n => n.id === newsItem.id);
    if (index !== -1) {
        newsData[index] = newsItem;
    } else {
        newsData.push(newsItem);
    }
    localStorage.setItem('newsData', JSON.stringify(newsData));
}

/**
 * 刪除最新消息
 */
async function deleteNewsItem(id) {
    const client = getSupabaseClient();

    try {
        if (client && typeof id === 'string' && id.includes('-')) {
            // UUID，從 Supabase 刪除
            const { error } = await supabaseDelete('news', id);
            if (error) throw error;
        }
    } catch (error) {
        console.error('從 Supabase 刪除最新消息失敗:', error);
    }

    // 同時從 localStorage 刪除
    let newsData = JSON.parse(localStorage.getItem('newsData')) || [];
    newsData = newsData.filter(n => n.id !== id);
    localStorage.setItem('newsData', JSON.stringify(newsData));
}

/**
 * 儲存輪播圖設定
 */
async function saveBannerSettings(interval) {
    const client = getSupabaseClient();

    try {
        if (client) {
            // 取得現有設定
            const { data: existing } = await supabaseSelect('banner_settings', { limit: 1 });
            
            if (existing && existing.length > 0) {
                // 更新
                await supabaseUpdate('banner_settings', existing[0].id, { interval });
            } else {
                // 新增
                await supabaseInsert('banner_settings', { interval });
            }
        }
    } catch (error) {
        console.error('儲存輪播圖設定到 Supabase 失敗:', error);
    }

    // 同時儲存到 localStorage
    const bannerData = JSON.parse(localStorage.getItem('bannerData')) || { interval: 2, slides: [] };
    bannerData.interval = interval;
    localStorage.setItem('bannerData', JSON.stringify(bannerData));
}

/**
 * 儲存輪播圖項目
 */
async function saveBannerSlide(slide) {
    const client = getSupabaseClient();

    const payload = {
        image_url: slide.image || '',
        link_url: slide.link || null,
        order: slide.order || 0
    };

    try {
        if (client) {
            if (slide.id && typeof slide.id === 'string' && slide.id.includes('-')) {
                // UUID，更新
                console.log('更新輪播圖:', slide.id);
                await supabaseUpdate('banners', slide.id, payload);
            } else {
                // 新增
                console.log('新增輪播圖:', payload);
                const { data, error } = await supabaseInsert('banners', payload);
                if (error) {
                    console.error('Supabase 插入錯誤:', error);
                    throw error;
                }
                if (data && data.length > 0) {
                    slide.id = data[0].id;
                    console.log('輪播圖已新增，ID:', slide.id);
                }
            }
        } else {
            console.log('Supabase 客戶端未初始化，僅儲存到 localStorage');
        }
    } catch (error) {
        console.error('儲存輪播圖到 Supabase 失敗:', error);
    }

    // 同時儲存到 localStorage（確保資料同步，但不儲存 base64）
    try {
        const bannerData = JSON.parse(localStorage.getItem('bannerData')) || { interval: 2, slides: [] };
        
        // 根據 order 找到對應的 slide，如果找不到則新增
        const index = bannerData.slides.findIndex(s => {
            if (slide.id && s.id) {
                return s.id === slide.id;
            }
            // 如果沒有 ID，根據 order 匹配
            return s.order === slide.order;
        });
        
        // 只儲存 URL，不儲存 base64（避免 QuotaExceededError）
        const slideForStorage = {
            id: slide.id,
            image: slide.image && slide.image.startsWith('http') ? slide.image : '', // 只儲存 URL
            link: slide.link || null,
            order: slide.order || 0
        };
        
        if (index !== -1) {
            // 更新現有的 slide
            bannerData.slides[index] = slideForStorage;
        } else {
            // 新增 slide
            bannerData.slides.push(slideForStorage);
        }
        
        // 確保 slides 按 order 排序
        bannerData.slides.sort((a, b) => (a.order || 0) - (b.order || 0));
        
        localStorage.setItem('bannerData', JSON.stringify(bannerData));
        console.log('輪播圖已儲存到 localStorage，slides 數量:', bannerData.slides.length);
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
}

/**
 * 刪除輪播圖項目
 */
async function deleteBannerSlide(id) {
    const client = getSupabaseClient();

    try {
        if (client && typeof id === 'string' && id.includes('-')) {
            await supabaseDelete('banners', id);
        }
    } catch (error) {
        console.error('從 Supabase 刪除輪播圖失敗:', error);
    }

    // 同時從 localStorage 刪除
    const bannerData = JSON.parse(localStorage.getItem('bannerData')) || { interval: 2, slides: [] };
    bannerData.slides = bannerData.slides.filter(s => s.id !== id);
    localStorage.setItem('bannerData', JSON.stringify(bannerData));
}

/**
 * 上傳圖片到 Supabase Storage
 */
async function uploadImageToStorage(file, fileName) {
    const client = getSupabaseClient();
    if (!client) {
        // Fallback: 轉換為 base64
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    try {
        // 產生唯一檔名
        const timestamp = Date.now();
        const extension = fileName.split('.').pop();
        const path = `images/${timestamp}-${fileName}`;

        // 上傳到 Supabase Storage
        const { data, error } = await supabaseUploadFile('images', path, file);

        if (error) throw error;

        // 獲取圖片尺寸
        const imageDimensions = await getImageDimensions(file);
        
        // 儲存到 images 資料表
        const imageRecord = {
            name: fileName,
            file_path: path,
            file_url: data.publicUrl,
            file_size: file.size,
            mime_type: file.type,
            width: imageDimensions.width,
            height: imageDimensions.height,
            group: 'default',
            description: '',
            show_in_banner: false
        };

        const { data: insertData, error: insertError } = await supabaseInsert('images', imageRecord);
        if (insertError) throw insertError;

        return {
            id: insertData[0].id,
            url: data.publicUrl,
            path: path,
            width: imageDimensions.width,
            height: imageDimensions.height
        };
    } catch (error) {
        console.error('上傳圖片到 Supabase 失敗:', error);
        // Fallback: 轉換為 base64
        const imageDimensions = await getImageDimensions(file);
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve({
                url: e.target.result,
                width: imageDimensions.width,
                height: imageDimensions.height
            });
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
}

/**
 * 上傳輪播圖到 Supabase Storage（不上傳到 images 表）
 * 如果上傳失敗，返回 base64 字串
 */
async function uploadBannerImageToStorage(file, fileName) {
    const client = getSupabaseClient();
    
    // 先嘗試上傳到 Supabase Storage
    if (client) {
        try {
            // 產生唯一檔名
            const timestamp = Date.now();
            const randomStr = Math.random().toString(36).substring(2, 9);
            const extension = fileName.split('.').pop();
            const path = `banners/${timestamp}-${randomStr}.${extension}`;

            // 上傳到 Supabase Storage
            const { data, error } = await supabaseUploadFile('images', path, file);

            if (!error && data) {
                // 上傳成功，返回 URL
                return {
                    url: data.publicUrl,
                    path: path,
                    isBase64: false
                };
            } else {
                // 上傳失敗，記錄錯誤但不中斷流程
                console.warn('上傳到 Supabase Storage 失敗，將使用 base64:', error?.message || '未知錯誤');
            }
        } catch (error) {
            console.warn('上傳到 Supabase Storage 時發生錯誤，將使用 base64:', error);
        }
    }
    
    // 如果上傳失敗或沒有 Supabase，返回 base64
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve({
            url: e.target.result,
            path: null,
            isBase64: true
        });
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

/**
 * 獲取圖片尺寸
 */
function getImageDimensions(file) {
    return new Promise((resolve) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve({ width: img.width, height: img.height });
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            resolve({ width: 0, height: 0 });
        };
        img.src = url;
    });
}

/**
 * 更新圖片資訊
 */
async function updateImageItem(id, updates) {
    const client = getSupabaseClient();
    
    try {
        if (client && typeof id === 'string' && id.includes('-')) {
            // UUID，更新到 Supabase
            const { data, error } = await supabaseUpdate('images', id, updates);
            if (error) {
                console.error('更新圖片資訊到 Supabase 失敗:', error);
                throw error;
            }
            console.log('圖片資訊已更新到 Supabase:', data);
        } else {
            console.warn('圖片 ID 不是 UUID 格式，跳過 Supabase 更新');
        }
    } catch (error) {
        console.error('更新圖片資訊到 Supabase 失敗:', error);
        throw error;
    }
    
    // 同時更新 localStorage（作為備份）
    const imageData = JSON.parse(localStorage.getItem('imageData')) || [];
    const index = imageData.findIndex(img => img.id === id || img.id === id.toString());
    if (index !== -1) {
        // 轉換更新資料格式（Supabase 使用 snake_case，前端使用 camelCase）
        const localUpdates = {
            group: updates.group,
            description: updates.description,
            showInBanner: updates.show_in_banner
        };
        Object.assign(imageData[index], localUpdates);
        localStorage.setItem('imageData', JSON.stringify(imageData));
    }
}

/**
 * 刪除圖片
 */
async function deleteImageItem(id, filePath) {
    const client = getSupabaseClient();

    try {
        if (client) {
            // 從資料表刪除
            if (typeof id === 'string' && id.includes('-')) {
                await supabaseDelete('images', id);
            }

            // 從 Storage 刪除
            if (filePath) {
                await supabaseDeleteFile('images', filePath);
            }
        }
    } catch (error) {
        console.error('從 Supabase 刪除圖片失敗:', error);
    }

    // 同時從 localStorage 刪除
    let imageData = JSON.parse(localStorage.getItem('imageData')) || [];
    imageData = imageData.filter(img => img.id !== id);
    localStorage.setItem('imageData', JSON.stringify(imageData));
}

/**
 * 儲存內容設定
 */
async function saveContentSettings(settings) {
    const client = getSupabaseClient();

    console.log('正在儲存內容設定到 Supabase:', settings);

    try {
        if (client) {
            // 取得現有設定
            const { data: existing, error: selectError } = await supabaseSelect('content_settings', { limit: 1 });

            if (selectError) {
                console.error('查詢現有設定失敗:', selectError);
            }

            if (existing && existing.length > 0) {
                // 更新
                console.log('更新現有設定，ID:', existing[0].id);
                const { data, error } = await supabaseUpdate('content_settings', existing[0].id, { settings });
                if (error) {
                    console.error('更新內容設定失敗:', error);
                } else {
                    console.log('內容設定已成功更新到 Supabase');
                }
            } else {
                // 新增
                console.log('建立新的內容設定');
                const { data, error } = await supabaseInsert('content_settings', { settings });
                if (error) {
                    console.error('新增內容設定失敗:', error);
                } else {
                    console.log('內容設定已成功新增到 Supabase');
                }
            }
        } else {
            console.warn('Supabase 客戶端未初始化，只儲存到 localStorage');
        }
    } catch (error) {
        console.error('儲存內容設定到 Supabase 失敗:', error);
    }

    // 同時儲存到 localStorage
    localStorage.setItem('contentData', JSON.stringify(settings));
    console.log('內容設定已儲存到 localStorage');
}

/**
 * 儲存服務詳情
 */
async function saveServiceDetail(serviceId, serviceData) {
    const client = getSupabaseClient();

    const payload = {
        service_id: serviceId,
        title: serviceData.title,
        tag: serviceData.tag,
        description: serviceData.description,
        sections: serviceData.sections || []
    };

    try {
        if (client) {
            // 檢查是否存在
            const { data: existing } = await supabaseSelect('service_details', {
                eq: { service_id: serviceId }
            });

            if (existing && existing.length > 0) {
                // 更新
                await supabaseUpdate('service_details', existing[0].id, payload);
            } else {
                // 新增
                await supabaseInsert('service_details', payload);
            }
        }
    } catch (error) {
        console.error('儲存服務詳情到 Supabase 失敗:', error);
    }

    // 同時儲存到 localStorage
    let serviceDetailData = JSON.parse(localStorage.getItem('serviceDetailData')) || {};
    serviceDetailData[serviceId] = serviceData;
    localStorage.setItem('serviceDetailData', JSON.stringify(serviceDetailData));
}

/**
 * 更新聯絡訊息已讀狀態
 */
async function updateContactMessageRead(id, read) {
    const client = getSupabaseClient();

    try {
        if (client && typeof id === 'string' && id.includes('-')) {
            await supabaseUpdate('contact_messages', id, { read });
        }
    } catch (error) {
        console.error('更新聯絡訊息狀態失敗:', error);
    }

    // 同時更新 localStorage
    let messages = JSON.parse(localStorage.getItem('contactMessages')) || [];
    const index = messages.findIndex(m => m.id === id);
    if (index !== -1) {
        messages[index].read = read;
        localStorage.setItem('contactMessages', JSON.stringify(messages));
    }
}

// ============================================
// 輔助函數
// ============================================

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

