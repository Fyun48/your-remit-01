-- ============================================
-- NeonDB 資料表結構
-- 在 NeonDB SQL Editor 或 psql 中執行
-- ============================================

-- 1. 最新消息表
CREATE TABLE IF NOT EXISTS news (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('服務公告', '活動資訊', '媒體報導')),
    date DATE NOT NULL,
    end_date DATE,
    content TEXT NOT NULL,
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 輪播圖表
CREATE TABLE IF NOT EXISTS banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_url TEXT NOT NULL,
    link_url TEXT,
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 輪播圖設定表（單一記錄）
CREATE TABLE IF NOT EXISTS banner_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interval INTEGER DEFAULT 2 CHECK (interval >= 1 AND interval <= 5),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(id)
);

-- 插入預設設定
INSERT INTO banner_settings (id, interval) 
VALUES (gen_random_uuid(), 2)
ON CONFLICT (id) DO NOTHING;

-- 4. 圖片管理表
CREATE TABLE IF NOT EXISTS images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    width INTEGER,
    height INTEGER,
    "group" TEXT DEFAULT 'default',
    description TEXT,
    show_in_banner BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 內容設定表（單一記錄，JSON 格式）
CREATE TABLE IF NOT EXISTS content_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(id)
);

-- 插入預設設定
INSERT INTO content_settings (id, settings) 
VALUES (
    gen_random_uuid(),
    '{
        "hero": {
            "badge": "專業 · 信賴 · 創新",
            "titleLine1": "金融服務",
            "titleLine2": "新紀元",
            "subtitle": "為您提供最專業的金融解決方案，跨境匯款、投資理財、企業顧問一站式服務"
        },
        "about": {
            "title": "關於金優匯",
            "text1": "金優匯成立於服務客戶的理念之上，致力於提供最專業、最便捷的金融服務。我們深耕金融領域多年，累積豐富的專業經驗，以「誠信、專業、創新、服務」為核心價值，持續為客戶創造價值。",
            "text2": "我們的團隊由資深金融專家組成，提供涵蓋國際匯款、金融科技、企業顧問及投資理財等全方位服務，致力成為您最值得信賴的金融夥伴。",
            "years": 15,
            "customers": 50000,
            "locations": 30
        },
        "services": {
            "service1_title": "國際匯款服務",
            "service1_desc": "提供快速、安全、便捷的跨境匯款服務，覆蓋全球主要國家與地區",
            "service2_title": "金融科技",
            "service2_desc": "運用最新科技打造數位金融平台，提供便捷的線上服務體驗",
            "service3_title": "企業顧問",
            "service3_desc": "專業團隊提供企業財務規劃、投資分析與風險管理等顧問服務",
            "service4_title": "投資理財",
            "service4_desc": "多元化投資產品與專業理財規劃，助您實現財富增值目標"
        },
        "contact": {
            "phone": "02-2796-5959",
            "email": "service@jinyouhui.com.tw",
            "address": "台北市內湖區安美街181號"
        }
    }'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- 6. 服務詳情表
CREATE TABLE IF NOT EXISTS service_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    tag TEXT NOT NULL,
    description TEXT NOT NULL,
    sections JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. 聯絡訊息表（已在 script.js 中使用）
-- 如果還沒有建立，執行以下：
CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. 訪客記錄表
CREATE TABLE IF NOT EXISTS visitor_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    time TIME NOT NULL,
    referrer TEXT,
    page TEXT,
    user_agent TEXT,
    screen_size TEXT,
    language TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. App 設定表（QR Code 管理）
CREATE TABLE IF NOT EXISTS app_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform TEXT NOT NULL UNIQUE CHECK (platform IN ('android', 'ios')),
    app_name TEXT NOT NULL DEFAULT 'YourRemit App',
    store_url TEXT,
    custom_qr_image TEXT,
    use_custom_image BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 插入預設 App 設定
INSERT INTO app_settings (platform, app_name, store_url, use_custom_image)
VALUES
    ('android', 'YourRemit App', 'https://play.google.com/store/apps/details?id=com.yourremit.app', FALSE),
    ('ios', 'YourRemit App', 'https://apps.apple.com/app/yourremit', FALSE)
ON CONFLICT (platform) DO NOTHING;

CREATE TRIGGER update_app_settings_updated_at BEFORE UPDATE ON app_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. 投資人文件表
CREATE TABLE IF NOT EXISTS investor_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL CHECK (category IN ('financial', 'announcement', 'governance', 'shareholder')),
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    publish_date DATE NOT NULL,
    fiscal_year INTEGER,
    fiscal_quarter INTEGER CHECK (fiscal_quarter >= 1 AND fiscal_quarter <= 4),
    is_protected BOOLEAN DEFAULT FALSE,
    password_hash TEXT,
    password_hint TEXT,
    is_published BOOLEAN DEFAULT TRUE,
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. 公司治理資訊表
CREATE TABLE IF NOT EXISTS governance_info (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('board_member', 'org_chart', 'charter', 'policy')),
    name TEXT NOT NULL,
    title TEXT,
    description TEXT,
    file_url TEXT,
    "order" INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 建立索引以提升查詢效能
-- ============================================

CREATE INDEX IF NOT EXISTS idx_news_date ON news(date DESC);
CREATE INDEX IF NOT EXISTS idx_news_category ON news(category);
CREATE INDEX IF NOT EXISTS idx_news_order ON news("order");
CREATE INDEX IF NOT EXISTS idx_banners_order ON banners("order");
CREATE INDEX IF NOT EXISTS idx_contact_messages_created ON contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_read ON contact_messages(read);
CREATE INDEX IF NOT EXISTS idx_visitor_logs_date ON visitor_logs(date DESC);
CREATE INDEX IF NOT EXISTS idx_investor_docs_category ON investor_documents(category);
CREATE INDEX IF NOT EXISTS idx_investor_docs_year ON investor_documents(fiscal_year DESC);
CREATE INDEX IF NOT EXISTS idx_investor_docs_published ON investor_documents(is_published);
CREATE INDEX IF NOT EXISTS idx_governance_type ON governance_info(type);

-- ============================================
-- 建立更新時間自動更新函數
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 套用到需要自動更新時間的表格
CREATE TRIGGER update_news_updated_at BEFORE UPDATE ON news
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_banners_updated_at BEFORE UPDATE ON banners
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_details_updated_at BEFORE UPDATE ON service_details
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_investor_documents_updated_at BEFORE UPDATE ON investor_documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_governance_info_updated_at BEFORE UPDATE ON governance_info
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 注意事項
-- ============================================
-- 1. NeonDB 不需要 Row Level Security (RLS)
-- 2. 圖片儲存使用本地 /pic 資料夾或 base64
-- 3. 在 NeonDB Console 或 psql 中執行此 SQL
