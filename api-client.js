/**
 * API Client for NeonDB backend
 * Replaces Supabase client with direct API calls
 */

const API_BASE = '/api';

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

// Image upload - now stores locally or uses base64
async function supabaseUploadFile(bucket, path, file, options = {}) {
    // For now, convert to base64 and store URL
    // In production, you might want to use a proper file storage service
    return new Promise((resolve, reject) => {
        if (typeof file === 'string' && file.startsWith('data:')) {
            // Already base64
            resolve({
                data: { publicUrl: file, path: path },
                error: null
            });
        } else if (file instanceof File || file instanceof Blob) {
            const reader = new FileReader();
            reader.onload = () => {
                resolve({
                    data: { publicUrl: reader.result, path: path },
                    error: null
                });
            };
            reader.onerror = () => reject({ data: null, error: reader.error });
            reader.readAsDataURL(file);
        } else {
            reject({ data: null, error: new Error('Unsupported file format') });
        }
    });
}

// Delete file - no-op for now since we're using base64/local
async function supabaseDeleteFile(bucket, path) {
    return { data: null, error: null };
}

// Get public URL - return as-is
function supabaseGetPublicUrl(bucket, path) {
    return path;
}

// Check if API is available
function getSupabaseClient() {
    // Return a truthy value to indicate API is available
    return { connected: true };
}
