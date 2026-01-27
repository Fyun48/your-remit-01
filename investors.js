/**
 * Investor Relations Page JavaScript
 * Handles data loading, password modal, and interactive features
 */

// Global state for password-protected downloads
let currentDocumentId = null;
let currentFileUrl = null;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all features
    initHeader();
    initMobileMenu();
    initBackToTop();
    loadLatestAnnouncements();
    loadQuickDownloads();
    initPasswordModal();
});

/**
 * Header scroll effect
 */
function initHeader() {
    const header = document.querySelector('.header');
    if (!header) return;

    const updateHeader = () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };

    updateHeader();
    window.addEventListener('scroll', throttle(updateHeader, 100));
}

/**
 * Mobile menu initialization
 */
function initMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.nav');
    const header = document.querySelector('.header');

    if (!menuBtn || !nav) return;

    // Create mobile nav container
    const mobileNav = document.createElement('div');
    mobileNav.className = 'mobile-nav';
    mobileNav.innerHTML = nav.innerHTML;
    header.appendChild(mobileNav);

    // Add mobile nav styles
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
            color: var(--color-gray-400);
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

    // Toggle menu
    menuBtn.addEventListener('click', () => {
        menuBtn.classList.toggle('active');
        mobileNav.classList.toggle('active');
        document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
    });

    // Handle dropdowns
    const dropdownItems = mobileNav.querySelectorAll('.has-dropdown');
    dropdownItems.forEach(item => {
        const link = item.querySelector('.nav-link');
        link.addEventListener('click', (e) => {
            e.preventDefault();
            item.classList.toggle('active');
        });
    });

    // Close menu when clicking links
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
 * Back to top button
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

    toggleVisibility();
    window.addEventListener('scroll', throttle(toggleVisibility, 100));

    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/**
 * Load latest announcements from API
 */
async function loadLatestAnnouncements() {
    const container = document.getElementById('latest-announcements');
    if (!container) return;

    try {
        const response = await fetch('/api/investor/documents?category=announcement&published_only=true');
        const data = await response.json();

        if (!data.success || !data.data || data.data.length === 0) {
            showEmptyState(container, '目前沒有公告');
            return;
        }

        // Get only the 3 most recent announcements
        const announcements = data.data.slice(0, 3);

        container.innerHTML = announcements.map(item => {
            const date = new Date(item.publish_date);
            const day = date.getDate();
            const month = date.toLocaleString('en-US', { month: 'short' });

            return `
                <div class="announcement-item">
                    <div class="announcement-date">
                        <span class="day">${day}</span>
                        <span class="month">${month}</span>
                    </div>
                    <div class="announcement-content">
                        <h4>${escapeHtml(item.title)}</h4>
                        ${item.description ? `<p>${escapeHtml(item.description)}</p>` : ''}
                        <a href="investors-announcements.html#${item.id}" class="announcement-link">
                            閱讀更多
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                <polyline points="12 5 19 12 12 19"></polyline>
                            </svg>
                        </a>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading announcements:', error);
        showEmptyState(container, '暫無公告');
    }
}

/**
 * Load quick downloads (latest annual and quarterly reports)
 */
async function loadQuickDownloads() {
    const container = document.getElementById('quick-downloads');
    if (!container) return;

    try {
        const response = await fetch('/api/investor/documents?category=financial&published_only=true');
        const data = await response.json();

        if (!data.success || !data.data || data.data.length === 0) {
            showEmptyState(container, '目前沒有可下載的文件');
            return;
        }

        const documents = data.data;

        // Find latest annual report
        const annualReport = documents.find(d => d.type === 'annual_report');

        // Find latest quarterly report
        const quarterlyReport = documents.find(d => d.type === 'quarterly_report');

        const downloads = [];
        if (annualReport) downloads.push(annualReport);
        if (quarterlyReport) downloads.push(quarterlyReport);

        if (downloads.length === 0) {
            showEmptyState(container, '目前沒有可下載的文件');
            return;
        }

        container.innerHTML = downloads.map(doc => {
            const isProtected = doc.is_protected;
            const fileSize = doc.file_size ? formatFileSize(doc.file_size) : '';
            const publishDate = formatDate(doc.publish_date);

            return `
                <div class="download-card">
                    <div class="download-info">
                        <div class="download-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                <line x1="16" y1="17" x2="8" y2="17"></line>
                                <polyline points="10 9 9 9 8 9"></polyline>
                            </svg>
                        </div>
                        <div class="download-details">
                            <h4>${escapeHtml(doc.title)}</h4>
                            <div class="download-meta">
                                <span>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                        <line x1="16" y1="2" x2="16" y2="6"></line>
                                        <line x1="8" y1="2" x2="8" y2="6"></line>
                                        <line x1="3" y1="10" x2="21" y2="10"></line>
                                    </svg>
                                    ${publishDate}
                                </span>
                                ${fileSize ? `
                                <span>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                                        <polyline points="13 2 13 9 20 9"></polyline>
                                    </svg>
                                    ${fileSize}
                                </span>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                    <div class="download-actions">
                        ${isProtected ? `
                            <span class="lock-icon" title="此文件需要密碼">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                </svg>
                            </span>
                            <button class="download-btn protected" onclick="showPasswordModal('${doc.id}', '${escapeHtml(doc.file_url)}', '${escapeHtml(doc.password_hint || '')}')">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="7 10 12 15 17 10"></polyline>
                                    <line x1="12" y1="15" x2="12" y2="3"></line>
                                </svg>
                                下載
                            </button>
                        ` : `
                            <a href="${escapeHtml(doc.file_url)}" class="download-btn" target="_blank" download>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="7 10 12 15 17 10"></polyline>
                                    <line x1="12" y1="15" x2="12" y2="3"></line>
                                </svg>
                                下載
                            </a>
                        `}
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading downloads:', error);
        showEmptyState(container, '目前沒有可下載的文件');
    }
}

/**
 * Initialize password modal functionality
 */
function initPasswordModal() {
    const modal = document.getElementById('password-modal');
    const overlay = document.getElementById('modal-overlay');
    const closeBtn = document.getElementById('modal-close');
    const cancelBtn = document.getElementById('cancel-btn');
    const verifyBtn = document.getElementById('verify-btn');
    const passwordInput = document.getElementById('password-input');
    const togglePasswordBtn = document.getElementById('toggle-password');

    if (!modal) return;

    // Close modal handlers
    const closeModal = () => {
        modal.classList.remove('active');
        passwordInput.value = '';
        document.getElementById('password-error').textContent = '';
        currentDocumentId = null;
        currentFileUrl = null;
    };

    overlay.addEventListener('click', closeModal);
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    // Toggle password visibility
    togglePasswordBtn.addEventListener('click', () => {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;
        togglePasswordBtn.innerHTML = type === 'password'
            ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
               </svg>`
            : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
               </svg>`;
    });

    // Verify password
    verifyBtn.addEventListener('click', verifyPassword);

    // Enter key to submit
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            verifyPassword();
        }
    });

    // Escape key to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

/**
 * Show password modal for protected document
 */
function showPasswordModal(documentId, fileUrl, passwordHint) {
    const modal = document.getElementById('password-modal');
    const hintElement = document.getElementById('password-hint');
    const passwordInput = document.getElementById('password-input');
    const errorElement = document.getElementById('password-error');

    currentDocumentId = documentId;
    currentFileUrl = fileUrl;

    hintElement.textContent = passwordHint || '此文件受密碼保護';
    errorElement.textContent = '';
    passwordInput.value = '';

    modal.classList.add('active');
    passwordInput.focus();
}

/**
 * Verify password and download document
 */
async function verifyPassword() {
    const password = document.getElementById('password-input').value;
    const errorElement = document.getElementById('password-error');
    const verifyBtn = document.getElementById('verify-btn');

    if (!password) {
        errorElement.textContent = '請輸入密碼';
        return;
    }

    // Disable button and show loading
    verifyBtn.disabled = true;
    verifyBtn.textContent = '驗證中...';

    try {
        const response = await fetch('/api/investor/verify-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                document_id: currentDocumentId,
                password: password
            })
        });

        const data = await response.json();

        if (data.success && data.data?.verified) {
            // Password correct - download the file
            errorElement.textContent = '';

            // If there's a download token, use it
            if (data.data.download_token) {
                window.location.href = `/api/investor/download?token=${data.data.download_token}`;
            } else {
                // Direct download
                window.open(currentFileUrl, '_blank');
            }

            // Close modal
            document.getElementById('password-modal').classList.remove('active');
            document.getElementById('password-input').value = '';
            currentDocumentId = null;
            currentFileUrl = null;
        } else {
            errorElement.textContent = data.error || '密碼錯誤，請重試';
        }
    } catch (error) {
        console.error('Password verification error:', error);
        errorElement.textContent = '驗證失敗，請稍後再試';
    } finally {
        verifyBtn.disabled = false;
        verifyBtn.textContent = '確認';
    }
}

/**
 * Show empty state in container
 */
function showEmptyState(container, message) {
    container.innerHTML = `
        <div class="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                <polyline points="13 2 13 9 20 9"></polyline>
            </svg>
            <p>${message}</p>
        </div>
    `;
}

/**
 * Format date to YYYY/MM/DD
 */
function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
}

/**
 * Format file size
 */
function formatFileSize(bytes) {
    if (!bytes) return '';
    const units = ['B', 'KB', 'MB', 'GB'];
    let unitIndex = 0;
    let size = bytes;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Throttle function
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
