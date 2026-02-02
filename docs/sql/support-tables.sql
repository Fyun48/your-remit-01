-- =====================================================
-- 客戶服務頁面資料表
-- Support Page Tables for Backend Management
-- =====================================================

-- 1. FAQ 常見問題表
CREATE TABLE IF NOT EXISTS support_faq (
    id SERIAL PRIMARY KEY,
    category VARCHAR(50) NOT NULL DEFAULT 'general',  -- 分類: remittance, account, security, app, general
    question TEXT NOT NULL,                            -- 問題
    answer TEXT NOT NULL,                              -- 答案 (支援 HTML)
    sort_order INT DEFAULT 0,                          -- 排序順序
    is_published BOOLEAN DEFAULT true,                 -- 是否發布
    lang VARCHAR(10) DEFAULT 'zh-TW',                  -- 語言版本
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 隱私權政策表
CREATE TABLE IF NOT EXISTS support_privacy (
    id SERIAL PRIMARY KEY,
    section_num INT NOT NULL,                          -- 章節編號
    title VARCHAR(200) NOT NULL,                       -- 章節標題
    content TEXT NOT NULL,                             -- 內容 (支援 HTML)
    sort_order INT DEFAULT 0,
    lang VARCHAR(10) DEFAULT 'zh-TW',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 服務條款表
CREATE TABLE IF NOT EXISTS support_terms (
    id SERIAL PRIMARY KEY,
    section_num INT NOT NULL,                          -- 章節編號
    title VARCHAR(200) NOT NULL,                       -- 章節標題
    content TEXT NOT NULL,                             -- 內容 (支援 HTML)
    sort_order INT DEFAULT 0,
    lang VARCHAR(10) DEFAULT 'zh-TW',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 客服設定表 (聯絡資訊、服務時間等)
CREATE TABLE IF NOT EXISTS support_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    description VARCHAR(255),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 插入預設資料
-- =====================================================

-- FAQ 預設資料
INSERT INTO support_faq (category, question, answer, sort_order, lang) VALUES
('remittance', '如何進行國際匯款？', '<p>進行國際匯款非常簡單，只需以下步驟：</p><ol><li>登入金優匯 App 或網站</li><li>選擇「國際匯款」服務</li><li>輸入收款人資訊（姓名、銀行帳號、SWIFT Code）</li><li>輸入匯款金額，系統會自動顯示匯率與手續費</li><li>確認資訊後，完成身份驗證即可送出</li></ol><p>一般情況下，匯款會在 1-3 個工作日內到達收款帳戶。</p>', 1, 'zh-TW'),
('remittance', '匯款有金額限制嗎？', '<p>依照金融法規規定，個人每日匯款上限為新台幣 50 萬元，每年累計上限為新台幣 500 萬元。企業用戶則根據營業規模有不同額度，詳情請洽客服專線。若需要更高額度，可申請提升額度服務，需提供相關證明文件。</p>', 2, 'zh-TW'),
('remittance', '匯款手續費如何計算？', '<p>我們的手續費採用透明計價方式：</p><ul><li>基本手續費：每筆 NT$100 起</li><li>匯款金額 10 萬以上：手續費 0.1%</li><li>VIP 會員享優惠費率</li></ul><p>在您送出匯款前，系統會清楚顯示所有費用明細，絕無隱藏收費。</p>', 3, 'zh-TW'),
('account', '如何開立金優匯帳戶？', '<p>開立帳戶完全免費，只需準備：</p><ul><li>有效身分證件（身分證或護照）</li><li>可接收驗證碼的手機號碼</li><li>電子郵件信箱</li></ul><p>下載 App 後依指示完成註冊，通過身分驗證後即可開始使用所有服務。整個流程約需 5-10 分鐘。</p>', 4, 'zh-TW'),
('account', '忘記密碼怎麼辦？', '<p>您可以透過以下方式重設密碼：</p><ol><li>在登入頁面點擊「忘記密碼」</li><li>輸入註冊時使用的電子郵件或手機號碼</li><li>系統會發送驗證碼至您的信箱或手機</li><li>輸入驗證碼後即可設定新密碼</li></ol><p>若仍無法重設，請聯繫客服協助處理。</p>', 5, 'zh-TW'),
('security', '金優匯如何保障交易安全？', '<p>我們採用多重安全機制保護您的資金與資料：</p><ul><li>SSL/TLS 256 位元加密傳輸</li><li>雙因素身份驗證（2FA）</li><li>24 小時交易監控系統</li><li>生物辨識登入（指紋/臉部辨識）</li><li>符合 PCI-DSS 國際安全標準</li></ul><p>金優匯已取得金管會核准之電子支付機構許可，受政府監管，您可安心使用。</p>', 6, 'zh-TW'),
('security', '發現可疑交易該怎麼處理？', '<p>若發現帳戶有異常活動，請立即：</p><ol><li>撥打 24 小時客服專線：02-2796-5959</li><li>在 App 中點擊「緊急凍結帳戶」</li><li>立即更改登入密碼</li></ol><p>我們的風控團隊會在最短時間內協助您處理，並追蹤可疑交易來源。</p>', 7, 'zh-TW'),
('app', 'App 支援哪些作業系統？', '<p>金優匯 App 支援以下系統：</p><ul><li>iOS 14.0 以上版本（iPhone 8 以上機型）</li><li>Android 8.0 以上版本</li></ul><p>您也可以透過網頁版使用完整服務功能，支援 Chrome、Safari、Edge 等主流瀏覽器。</p>', 8, 'zh-TW');

-- 隱私權政策預設資料
INSERT INTO support_privacy (section_num, title, content, sort_order, lang) VALUES
(1, '資料蒐集範圍', '<p>為提供您完善的金融服務，我們可能蒐集以下個人資料：</p><ul><li><strong>基本資料：</strong>姓名、身分證字號、出生日期、國籍</li><li><strong>聯絡資訊：</strong>電話號碼、電子郵件、通訊地址</li><li><strong>金融資訊：</strong>銀行帳戶、交易紀錄、匯款歷史</li><li><strong>裝置資訊：</strong>IP 位址、裝置識別碼、瀏覽器類型</li></ul>', 1, 'zh-TW'),
(2, '資料使用目的', '<p>我們蒐集的資料僅用於以下目的：</p><ul><li>提供並改善金融服務品質</li><li>進行身分驗證與防詐騙偵測</li><li>遵循法規要求與主管機關規定</li><li>發送重要通知與服務更新資訊</li><li>進行內部統計分析與服務優化</li></ul>', 2, 'zh-TW'),
(3, '資料保護措施', '<p>我們採用業界最高標準的安全措施保護您的資料：</p><ul><li>所有資料傳輸採用 SSL/TLS 加密技術</li><li>敏感資料以 AES-256 加密儲存</li><li>定期進行資安稽核與滲透測試</li><li>員工接受嚴格的資安教育訓練</li><li>建立完善的存取控制與監控機制</li></ul>', 3, 'zh-TW'),
(4, '第三方分享政策', '<p>除以下情況外，我們不會將您的個人資料分享給第三方：</p><ul><li>取得您的明確同意</li><li>配合司法或主管機關的合法調查</li><li>與合作銀行進行必要的交易處理</li><li>委託經授權的服務提供商（須遵守保密義務）</li></ul>', 4, 'zh-TW'),
(5, 'Cookie 使用說明', '<p>我們使用 Cookie 及類似技術來提升您的使用體驗：</p><ul><li><strong>必要 Cookie：</strong>維持網站基本功能運作</li><li><strong>分析 Cookie：</strong>了解網站使用狀況以進行改善</li><li><strong>行銷 Cookie：</strong>提供個人化內容與廣告</li></ul><p>您可以透過瀏覽器設定管理 Cookie 偏好，但部分功能可能因此受限。</p>', 5, 'zh-TW'),
(6, '您的權利', '<p>依據個人資料保護法，您享有以下權利：</p><ul><li>查詢或請求閱覽您的個人資料</li><li>請求製給個人資料複本</li><li>請求補充或更正個人資料</li><li>請求停止蒐集、處理或利用個人資料</li><li>請求刪除個人資料</li></ul><p>如需行使上述權利，請透過客服管道與我們聯繫。</p>', 6, 'zh-TW');

-- 服務條款預設資料
INSERT INTO support_terms (section_num, title, content, sort_order, lang) VALUES
(1, '服務說明', '<p>金優匯股份有限公司（以下簡稱「本公司」）提供以下金融服務：</p><ul><li>國際匯款服務：跨境資金轉帳與外幣兌換</li><li>金融科技服務：數位支付與帳戶管理</li><li>企業顧問服務：跨境商務與財務諮詢</li><li>投資理財服務：基金、保險等金融商品</li></ul><p>本公司保留修改、暫停或終止任何服務的權利，並將事先公告。</p>', 1, 'zh-TW'),
(2, '帳戶規範', '<p>使用本服務須遵守以下規範：</p><ul><li>申請人須年滿 20 歲，具完全行為能力</li><li>須提供真實、正確、完整的個人資料</li><li>帳戶僅限本人使用，不得轉讓或借予他人</li><li>妥善保管帳號密碼，因保管不當造成的損失由用戶自行負責</li><li>禁止將本服務用於任何違法活動</li></ul>', 2, 'zh-TW'),
(3, '交易規則', '<p>進行交易時，請注意以下事項：</p><ul><li>匯款指示一經確認送出，原則上不可撤銷</li><li>匯率以交易當下系統顯示為準</li><li>收款方資訊錯誤導致的延遲或損失，由匯款人自行負責</li><li>大額交易可能需要額外的身分驗證</li><li>本公司有權拒絕可疑或違規交易</li></ul>', 3, 'zh-TW'),
(4, '費用說明', '<p>本服務收費標準如下：</p><ul><li>匯款手續費：依匯款金額與目的地國家計算</li><li>匯率差價：買賣匯率間之價差</li><li>帳戶管理費：基本帳戶免費，進階功能另計</li><li>其他費用：如電報費、中轉行費用等</li></ul><p>所有費用將在交易確認前清楚顯示，詳細費率表請參閱官網公告。</p>', 4, 'zh-TW'),
(5, '免責聲明', '<p>以下情況本公司不承擔責任：</p><ul><li>因不可抗力（天災、戰爭、政府行為等）造成的服務中斷</li><li>因電信網路或第三方系統問題導致的延遲或錯誤</li><li>用戶自身疏失或違反使用規範造成的損失</li><li>收款國家政策變動導致的資金凍結或退回</li><li>投資理財商品的市場風險與可能虧損</li></ul>', 5, 'zh-TW'),
(6, '爭議處理', '<p>如有爭議，處理程序如下：</p><ul><li>首先透過客服管道進行協商</li><li>協商不成可向金融消費評議中心申訴</li><li>本條款以中華民國法律為準據法</li><li>因本條款所生爭訟，以臺灣臺北地方法院為第一審管轄法院</li></ul>', 6, 'zh-TW');

-- 客服設定預設資料
INSERT INTO support_settings (key, value, description) VALUES
('phone', '02-2796-5959', '客服電話'),
('email', 'service@yourremit.com', '客服信箱'),
('address', '台北市內湖區安美街181號', '總公司地址'),
('service_hours', '週一至週五 09:00-18:00', '服務時間'),
('privacy_updated', '2025-01-15', '隱私權政策更新日期'),
('terms_updated', '2025-01-15', '服務條款更新日期');

-- =====================================================
-- 設定 RLS 政策 (Row Level Security)
-- =====================================================

-- 啟用 RLS
ALTER TABLE support_faq ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_privacy ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_settings ENABLE ROW LEVEL SECURITY;

-- 允許匿名讀取已發布的 FAQ
CREATE POLICY "Allow public read faq" ON support_faq
    FOR SELECT USING (is_published = true);

-- 允許匿名讀取隱私政策
CREATE POLICY "Allow public read privacy" ON support_privacy
    FOR SELECT USING (true);

-- 允許匿名讀取服務條款
CREATE POLICY "Allow public read terms" ON support_terms
    FOR SELECT USING (true);

-- 允許匿名讀取設定
CREATE POLICY "Allow public read settings" ON support_settings
    FOR SELECT USING (true);

-- 允許所有操作（給管理後台使用）
CREATE POLICY "Allow all operations faq" ON support_faq
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations privacy" ON support_privacy
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations terms" ON support_terms
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations settings" ON support_settings
    FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- 建立更新時間觸發器
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_support_faq_updated_at
    BEFORE UPDATE ON support_faq
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_privacy_updated_at
    BEFORE UPDATE ON support_privacy
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_terms_updated_at
    BEFORE UPDATE ON support_terms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
