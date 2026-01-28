/**
 * API Client - 完整使用 Supabase
 * Database: Supabase PostgreSQL
 * File Storage: Supabase Storage
 */

// Supabase 配置
const SUPABASE_URL = 'https://nxzvsxjvnazjltlgbyig.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54enZzeGp2bmF6amx0bGdieWlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwNDc2NzksImV4cCI6MjA4MjYyMzY3OX0.cZldlBlWNBV3rQZfjQqaRVWjqwXNO9-4Q7QGmCdX0-0';
const SUPABASE_STORAGE_BUCKET = 'images';

// Supabase REST API 基礎 URL
const SUPABASE_REST_URL = `${SUPABASE_URL}/rest/v1`;

// 通用 headers
function getHeaders(preferReturn = false) {
    const headers = {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
    };
    if (preferReturn) {
        headers['Prefer'] = 'return=representation';
    }
    return headers;
}

// ==================== 通用 CRUD 函數 ====================

/**
 * SELECT - 查詢資料
 */
async function supabaseSelect(table, options = {}) {
    try {
        let url = `${SUPABASE_REST_URL}/${table}?select=*`;

        // 排序
        if (options.order) {
            const dir = options.order.ascending ? 'asc' : 'desc';
            url += `&order=${options.order.column}.${dir}`;
        }

        // 限制筆數
        if (options.limit) {
            url += `&limit=${options.limit}`;
        }

        // 篩選條件
        if (options.eq) {
            for (const [key, value] of Object.entries(options.eq)) {
                url += `&${key}=eq.${value}`;
            }
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: getHeaders()
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `查詢失敗: ${response.status}`);
        }

        const data = await response.json();
        return { data, error: null };
    } catch (error) {
        console.error(`Supabase SELECT ${table} 失敗:`, error);
        return { data: null, error };
    }
}

/**
 * INSERT - 新增資料
 */
async function supabaseInsert(table, payload) {
    try {
        const response = await fetch(`${SUPABASE_REST_URL}/${table}`, {
            method: 'POST',
            headers: getHeaders(true),
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `新增失敗: ${response.status}`);
        }

        const data = await response.json();
        return { data, error: null };
    } catch (error) {
        console.error(`Supabase INSERT ${table} 失敗:`, error);
        return { data: null, error };
    }
}

/**
 * UPDATE - 更新資料
 */
async function supabaseUpdate(table, id, payload) {
    try {
        const response = await fetch(`${SUPABASE_REST_URL}/${table}?id=eq.${id}`, {
            method: 'PATCH',
            headers: getHeaders(true),
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `更新失敗: ${response.status}`);
        }

        const data = await response.json();
        return { data, error: null };
    } catch (error) {
        console.error(`Supabase UPDATE ${table} 失敗:`, error);
        return { data: null, error };
    }
}

/**
 * DELETE - 刪除資料
 */
async function supabaseDelete(table, id) {
    try {
        const response = await fetch(`${SUPABASE_REST_URL}/${table}?id=eq.${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `刪除失敗: ${response.status}`);
        }

        return { data: { deleted: true }, error: null };
    } catch (error) {
        console.error(`Supabase DELETE ${table} 失敗:`, error);
        return { data: null, error };
    }
}

// ==================== SUPABASE STORAGE ====================

/**
 * 上傳檔案到 Supabase Storage
 */
async function supabaseUploadFile(bucket, path, file, options = {}) {
    try {
        if (!(file instanceof File) && !(file instanceof Blob)) {
            throw new Error('檔案格式不支援');
        }

        const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${bucket}/${path}`;

        const response = await fetch(uploadUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': file.type || 'application/octet-stream',
                'x-upsert': 'true'
            },
            body: file
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || errorData.error || `上傳失敗: ${response.status}`);
        }

        const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
        console.log('檔案已上傳到 Supabase Storage:', publicUrl);

        return {
            data: { publicUrl, path },
            error: null
        };
    } catch (error) {
        console.error('Supabase Storage 上傳失敗:', error);
        return { data: null, error };
    }
}

/**
 * 從 Supabase Storage 刪除檔案
 */
async function supabaseDeleteFile(bucket, path) {
    try {
        const deleteUrl = `${SUPABASE_URL}/storage/v1/object/${bucket}/${path}`;

        const response = await fetch(deleteUrl, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `刪除失敗: ${response.status}`);
        }

        console.log('檔案已從 Supabase Storage 刪除:', path);
        return { data: { path }, error: null };
    } catch (error) {
        console.error('Supabase Storage 刪除失敗:', error);
        return { data: null, error };
    }
}

/**
 * 取得 Supabase Storage 公開 URL
 */
function supabaseGetPublicUrl(bucket, path) {
    return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
}

// ==================== 相容層 (給現有程式碼使用) ====================

/**
 * 檢查 Supabase 是否可用
 */
function getSupabaseClient() {
    return {
        connected: true,
        url: SUPABASE_URL,
        storage: {
            url: SUPABASE_URL,
            bucket: SUPABASE_STORAGE_BUCKET
        }
    };
}

// ==================== 便捷函數 ====================

// News
async function getNews() {
    return supabaseSelect('news', { order: { column: 'order', ascending: true } });
}

async function getNewsById(id) {
    return supabaseSelect('news', { eq: { id } });
}

async function createNews(newsItem) {
    return supabaseInsert('news', newsItem);
}

async function updateNews(id, newsItem) {
    return supabaseUpdate('news', id, newsItem);
}

async function deleteNews(id) {
    return supabaseDelete('news', id);
}

// Banners
async function getBanners() {
    return supabaseSelect('banners', { order: { column: 'order', ascending: true } });
}

async function createBanner(banner) {
    return supabaseInsert('banners', banner);
}

async function updateBanner(id, banner) {
    return supabaseUpdate('banners', id, banner);
}

async function deleteBanner(id) {
    return supabaseDelete('banners', id);
}

// Banner Settings
async function getBannerSettings() {
    return supabaseSelect('banner_settings', { limit: 1 });
}

async function updateBannerSettings(settings) {
    const { data: existing } = await supabaseSelect('banner_settings', { limit: 1 });
    if (existing && existing.length > 0) {
        return supabaseUpdate('banner_settings', existing[0].id, settings);
    }
    return supabaseInsert('banner_settings', settings);
}

// Images
async function getImages() {
    return supabaseSelect('images', { order: { column: 'created_at', ascending: false } });
}

async function createImage(image) {
    return supabaseInsert('images', image);
}

async function updateImage(id, image) {
    return supabaseUpdate('images', id, image);
}

async function deleteImage(id) {
    return supabaseDelete('images', id);
}

// Content Settings
async function getContentSettings() {
    return supabaseSelect('content_settings', { limit: 1 });
}

async function updateContentSettings(settings) {
    const { data: existing } = await supabaseSelect('content_settings', { limit: 1 });
    if (existing && existing.length > 0) {
        return supabaseUpdate('content_settings', existing[0].id, { settings });
    }
    return supabaseInsert('content_settings', { settings });
}

// Service Details
async function getServiceDetails() {
    return supabaseSelect('service_details');
}

async function getServiceById(serviceId) {
    return supabaseSelect('service_details', { eq: { service_id: serviceId } });
}

async function saveServiceDetail(serviceId, detail) {
    const { data: existing } = await supabaseSelect('service_details', { eq: { service_id: serviceId } });
    if (existing && existing.length > 0) {
        return supabaseUpdate('service_details', existing[0].id, { service_id: serviceId, ...detail });
    }
    return supabaseInsert('service_details', { service_id: serviceId, ...detail });
}

// Contact Messages
async function getContactMessages() {
    return supabaseSelect('contact_messages', { order: { column: 'created_at', ascending: false } });
}

async function createContactMessage(message) {
    return supabaseInsert('contact_messages', message);
}

async function markMessageAsRead(id, read = true) {
    return supabaseUpdate('contact_messages', id, { read });
}

async function deleteContactMessage(id) {
    return supabaseDelete('contact_messages', id);
}

// Visitor Logs
async function getVisitorLogs() {
    return supabaseSelect('visitor_logs', { order: { column: 'created_at', ascending: false } });
}

async function logVisitor(visitorData) {
    return supabaseInsert('visitor_logs', visitorData);
}

// Admin Credentials (stored in Supabase)
async function getAdminCredentialsFromDB() {
    try {
        const { data, error } = await supabaseSelect('admin_settings', { limit: 1 });
        if (error) {
            console.error('Failed to get admin credentials:', error);
            return null;
        }
        return data && data.length > 0 ? data[0] : null;
    } catch (e) {
        console.error('Error fetching admin credentials:', e);
        return null;
    }
}

async function saveAdminCredentialsToDB(username, password) {
    try {
        const { data: existing } = await supabaseSelect('admin_settings', { limit: 1 });
        if (existing && existing.length > 0) {
            return await supabaseUpdate('admin_settings', existing[0].id, { username, password });
        } else {
            return await supabaseInsert('admin_settings', { username, password });
        }
    } catch (e) {
        console.error('Error saving admin credentials:', e);
        return { error: e.message };
    }
}
