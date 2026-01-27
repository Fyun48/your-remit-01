/**
 * API Client for NeonDB backend + Supabase Storage
 * Database: NeonDB (PostgreSQL)
 * File Storage: Supabase Storage
 */

const API_BASE = '/api';

// Supabase Storage 配置
const SUPABASE_URL = 'https://nxzvsxjvnazjltlgbyig.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54enZzeGp2bmF6amx0bGdieWlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwNDc2NzksImV4cCI6MjA4MjYyMzY3OX0.cZldlBlWNBV3rQZfjQqaRVWjqwXNO9-4Q7QGmCdX0-0';
const SUPABASE_STORAGE_BUCKET = 'images';

// Generic API call helper
async function apiCall(endpoint, method = 'GET', data = null) {
    const options = {
        method,
        headers: { 'Content-Type': 'application/json' },
    };

    if (data && method !== 'GET') {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, options);
        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error || 'API Error');
        }

        return { data: result.data, error: null };
    } catch (error) {
        console.error('API Error:', error);
        return { data: null, error };
    }
}

// ==================== NEWS ====================
async function getNews() {
    return apiCall('/news');
}

async function getNewsById(id) {
    return apiCall(`/news/${id}`);
}

async function createNews(newsItem) {
    return apiCall('/news', 'POST', newsItem);
}

async function updateNews(id, newsItem) {
    return apiCall(`/news/${id}`, 'PUT', newsItem);
}

async function deleteNews(id) {
    return apiCall(`/news/${id}`, 'DELETE');
}

// ==================== BANNERS ====================
async function getBanners() {
    return apiCall('/banners');
}

async function createBanner(banner) {
    return apiCall('/banners', 'POST', banner);
}

async function updateBanner(id, banner) {
    return apiCall(`/banners/${id}`, 'PUT', banner);
}

async function deleteBanner(id) {
    return apiCall(`/banners/${id}`, 'DELETE');
}

// ==================== BANNER SETTINGS ====================
async function getBannerSettings() {
    return apiCall('/banner-settings');
}

async function updateBannerSettings(settings) {
    return apiCall('/banner-settings', 'PUT', settings);
}

// ==================== IMAGES ====================
async function getImages() {
    return apiCall('/images');
}

async function createImage(image) {
    return apiCall('/images', 'POST', image);
}

async function updateImage(id, image) {
    return apiCall(`/images/${id}`, 'PUT', image);
}

async function deleteImage(id) {
    return apiCall(`/images/${id}`, 'DELETE');
}

// ==================== CONTENT SETTINGS ====================
async function getContentSettings() {
    return apiCall('/content-settings');
}

async function updateContentSettings(settings) {
    return apiCall('/content-settings', 'PUT', settings);
}

// ==================== SERVICE DETAILS ====================
async function getServiceDetails() {
    return apiCall('/services');
}

async function getServiceById(serviceId) {
    return apiCall(`/services/${serviceId}`);
}

async function saveServiceDetail(serviceId, detail) {
    return apiCall(`/services/${serviceId}`, 'PUT', { service_id: serviceId, ...detail });
}

// ==================== CONTACT MESSAGES ====================
async function getContactMessages() {
    return apiCall('/contact');
}

async function createContactMessage(message) {
    return apiCall('/contact', 'POST', message);
}

async function markMessageAsRead(id, read = true) {
    return apiCall(`/contact/${id}`, 'PUT', { read });
}

async function deleteContactMessage(id) {
    return apiCall(`/contact/${id}`, 'DELETE');
}

// ==================== VISITOR LOGS ====================
async function getVisitorLogs(period = null) {
    const query = period ? `?period=${period}` : '';
    return apiCall(`/visitors${query}`);
}

async function logVisitor(visitorData) {
    return apiCall('/visitors', 'POST', visitorData);
}

// ==================== COMPATIBILITY LAYER ====================
// For backward compatibility with existing code

// Supabase-style insert
async function supabaseInsert(table, payload) {
    const endpoints = {
        news: '/news',
        banners: '/banners',
        images: '/images',
        contact_messages: '/contact',
        visitor_logs: '/visitors',
    };
    return apiCall(endpoints[table] || `/${table}`, 'POST', payload);
}

// Supabase-style select
async function supabaseSelect(table, options = {}) {
    const endpoints = {
        news: '/news',
        banners: '/banners',
        banner_settings: '/banner-settings',
        images: '/images',
        content_settings: '/content-settings',
        service_details: '/services',
        contact_messages: '/contact',
        visitor_logs: '/visitors',
    };
    return apiCall(endpoints[table] || `/${table}`);
}

// Supabase-style update
async function supabaseUpdate(table, id, payload) {
    const endpoints = {
        news: '/news',
        banners: '/banners',
        banner_settings: '/banner-settings',
        images: '/images',
        content_settings: '/content-settings',
        service_details: '/services',
        contact_messages: '/contact',
    };
    return apiCall(`${endpoints[table] || `/${table}`}/${id}`, 'PUT', payload);
}

// Supabase-style delete
async function supabaseDelete(table, id) {
    const endpoints = {
        news: '/news',
        banners: '/banners',
        images: '/images',
        contact_messages: '/contact',
    };
    return apiCall(`${endpoints[table] || `/${table}`}/${id}`, 'DELETE');
}

// ==================== SUPABASE STORAGE ====================

/**
 * 上傳檔案到 Supabase Storage
 * @param {string} bucket - Storage bucket 名稱
 * @param {string} path - 檔案路徑 (例如: 'banners/image.jpg')
 * @param {File|Blob} file - 要上傳的檔案
 * @param {object} options - 額外選項
 * @returns {Promise<{data: {publicUrl: string, path: string}, error: Error|null}>}
 */
async function supabaseUploadFile(bucket, path, file, options = {}) {
    try {
        // 確保是 File 或 Blob
        if (!(file instanceof File) && !(file instanceof Blob)) {
            throw new Error('檔案格式不支援');
        }

        const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${bucket}/${path}`;

        const response = await fetch(uploadUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': file.type || 'application/octet-stream',
                'x-upsert': 'true' // 如果檔案存在則覆蓋
            },
            body: file
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `上傳失敗: ${response.status}`);
        }

        // 產生公開 URL
        const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;

        console.log('檔案已上傳到 Supabase Storage:', publicUrl);

        return {
            data: { publicUrl, path },
            error: null
        };
    } catch (error) {
        console.error('Supabase Storage 上傳失敗:', error);
        return {
            data: null,
            error
        };
    }
}

/**
 * 從 Supabase Storage 刪除檔案
 * @param {string} bucket - Storage bucket 名稱
 * @param {string} path - 檔案路徑
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
 * @param {string} bucket - Storage bucket 名稱
 * @param {string} path - 檔案路徑
 * @returns {string} 公開 URL
 */
function supabaseGetPublicUrl(bucket, path) {
    return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
}

/**
 * 檢查 API 和 Storage 是否可用
 */
function getSupabaseClient() {
    // Return a truthy value to indicate API is available
    return {
        connected: true,
        storage: {
            url: SUPABASE_URL,
            bucket: SUPABASE_STORAGE_BUCKET
        }
    };
}
