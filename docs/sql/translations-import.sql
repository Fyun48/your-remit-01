-- 基本翻譯資料匯入
-- 執行於 Supabase SQL Editor

-- 導覽列翻譯
INSERT INTO translations (key, category, zh_tw, en, vi, ind, th) VALUES
('nav.news', 'nav', '最新消息', 'News', 'Tin tức', 'Berita', 'ข่าวสาร'),
('nav.csr', 'nav', '企業責任', 'CSR', 'Trách nhiệm xã hội', 'Tanggung Jawab Sosial', 'ความรับผิดชอบต่อสังคม'),
('nav.career', 'nav', '人才招募', 'Careers', 'Tuyển dụng', 'Karir', 'ร่วมงานกับเรา'),
('nav.about', 'nav', '關於我們', 'About Us', 'Về chúng tôi', 'Tentang Kami', 'เกี่ยวกับเรา'),
('nav.app', 'nav', 'App 下載', 'Download App', 'Tải ứng dụng', 'Unduh Aplikasi', 'ดาวน์โหลดแอป'),
('nav.services', 'nav', '服務項目', 'Services', 'Dịch vụ', 'Layanan', 'บริการ'),
('nav.investors', 'nav', '投資人關係', 'Investor Relations', 'Quan hệ nhà đầu tư', 'Hubungan Investor', 'นักลงทุนสัมพันธ์')
ON CONFLICT (key) DO UPDATE SET
  zh_tw = EXCLUDED.zh_tw,
  en = EXCLUDED.en,
  vi = EXCLUDED.vi,
  ind = EXCLUDED.ind,
  th = EXCLUDED.th,
  updated_at = NOW();

-- 首頁 Hero 區塊
INSERT INTO translations (key, category, zh_tw, en, vi, ind, th) VALUES
('hero.badge', 'hero', '專業 · 信賴 · 創新', 'Professional · Trusted · Innovative', 'Chuyên nghiệp · Tin cậy · Đổi mới', 'Profesional · Terpercaya · Inovatif', 'มืออาชีพ · น่าเชื่อถือ · นวัตกรรม'),
('hero.title', 'hero', '跨境金融的<br>創新夥伴', 'Your Innovative<br>Cross-border Partner', 'Đối tác sáng tạo<br>Chuyển tiền quốc tế', 'Mitra Inovatif<br>Keuangan Lintas Batas', 'พันธมิตรนวัตกรรม<br>การเงินข้ามพรมแดน'),
('hero.subtitle', 'hero', '金優匯致力於提供安全、快速、便捷的國際匯款服務，讓您的資金輕鬆跨越國界', 'Your Remit provides secure, fast, and convenient international remittance services', 'Your Remit cung cấp dịch vụ chuyển tiền quốc tế an toàn, nhanh chóng và tiện lợi', 'Your Remit menyediakan layanan pengiriman uang internasional yang aman, cepat, dan nyaman', 'Your Remit ให้บริการโอนเงินระหว่างประเทศที่ปลอดภัย รวดเร็ว และสะดวก'),
('hero.cta', 'hero', '了解更多', 'Learn More', 'Tìm hiểu thêm', 'Pelajari Lebih Lanjut', 'เรียนรู้เพิ่มเติม'),
('hero.card_fast', 'hero', '快速到帳', 'Fast Transfer', 'Chuyển nhanh', 'Transfer Cepat', 'โอนเร็ว'),
('hero.card_fast_desc', 'hero', '最快10分鐘', 'As fast as 10 mins', 'Nhanh nhất 10 phút', 'Secepat 10 menit', 'เร็วสุด 10 นาที'),
('hero.card_secure', 'hero', '安全保障', 'Secure', 'An toàn', 'Aman', 'ปลอดภัย'),
('hero.card_secure_desc', 'hero', '金管會核准', 'FSC Approved', 'Được cấp phép', 'Disetujui OJK', 'ได้รับอนุญาต'),
('hero.card_support', 'hero', '專業服務', 'Professional', 'Chuyên nghiệp', 'Profesional', 'มืออาชีพ'),
('hero.card_support_desc', 'hero', '多語客服團隊', 'Multilingual Support', 'Hỗ trợ đa ngôn ngữ', 'Dukungan Multibahasa', 'รองรับหลายภาษา')
ON CONFLICT (key) DO UPDATE SET
  zh_tw = EXCLUDED.zh_tw,
  en = EXCLUDED.en,
  vi = EXCLUDED.vi,
  ind = EXCLUDED.ind,
  th = EXCLUDED.th,
  updated_at = NOW();

-- 服務項目
INSERT INTO translations (key, category, zh_tw, en, vi, ind, th) VALUES
('service.remittance', 'service', '國際匯款服務', 'International Remittance', 'Chuyển tiền quốc tế', 'Pengiriman Uang Internasional', 'บริการโอนเงินระหว่างประเทศ'),
('service.fintech', 'service', '金融科技', 'Fintech', 'Công nghệ tài chính', 'Teknologi Keuangan', 'ฟินเทค'),
('service.consulting', 'service', '企業顧問', 'Business Consulting', 'Tư vấn doanh nghiệp', 'Konsultasi Bisnis', 'ที่ปรึกษาธุรกิจ'),
('service.investment', 'service', '投資理財', 'Investment', 'Đầu tư', 'Investasi', 'การลงทุน')
ON CONFLICT (key) DO UPDATE SET
  zh_tw = EXCLUDED.zh_tw,
  en = EXCLUDED.en,
  vi = EXCLUDED.vi,
  ind = EXCLUDED.ind,
  th = EXCLUDED.th,
  updated_at = NOW();

-- 投資人專區
INSERT INTO translations (key, category, zh_tw, en, vi, ind, th) VALUES
('investor.title', 'investor', '投資人專區', 'Investor Relations', 'Quan hệ nhà đầu tư', 'Hubungan Investor', 'นักลงทุนสัมพันธ์'),
('investor.financial', 'investor', '財務資訊', 'Financial Information', 'Thông tin tài chính', 'Informasi Keuangan', 'ข้อมูลทางการเงิน'),
('investor.announcements', 'investor', '重大訊息', 'Announcements', 'Thông báo', 'Pengumuman', 'ประกาศ'),
('investor.governance', 'investor', '公司治理', 'Corporate Governance', 'Quản trị công ty', 'Tata Kelola Perusahaan', 'การกำกับดูแลกิจการ'),
('investor.shareholders', 'investor', '股東會資料', 'Shareholder Meeting', 'Họp cổ đông', 'Rapat Pemegang Saham', 'การประชุมผู้ถือหุ้น')
ON CONFLICT (key) DO UPDATE SET
  zh_tw = EXCLUDED.zh_tw,
  en = EXCLUDED.en,
  vi = EXCLUDED.vi,
  ind = EXCLUDED.ind,
  th = EXCLUDED.th,
  updated_at = NOW();

-- 頁尾
INSERT INTO translations (key, category, zh_tw, en, vi, ind, th) VALUES
('footer.company', 'footer', '金優匯股份有限公司', 'Your Remit Co., Ltd.', 'Công ty TNHH Your Remit', 'PT Your Remit', 'บริษัท Your Remit จำกัด'),
('footer.address', 'footer', '台北市中山區', 'Zhongshan District, Taipei', 'Quận Trung Sơn, Đài Bắc', 'Distrik Zhongshan, Taipei', 'เขตจงซาน ไทเป'),
('footer.contact', 'footer', '聯絡我們', 'Contact Us', 'Liên hệ', 'Hubungi Kami', 'ติดต่อเรา'),
('footer.follow', 'footer', '關注我們', 'Follow Us', 'Theo dõi', 'Ikuti Kami', 'ติดตามเรา'),
('footer.privacy', 'footer', '隱私權政策', 'Privacy Policy', 'Chính sách bảo mật', 'Kebijakan Privasi', 'นโยบายความเป็นส่วนตัว'),
('footer.terms', 'footer', '服務條款', 'Terms of Service', 'Điều khoản dịch vụ', 'Syarat Layanan', 'ข้อกำหนดการใช้บริการ'),
('footer.copyright', 'footer', '© 2024 金優匯 版權所有', '© 2024 Your Remit. All rights reserved.', '© 2024 Your Remit. Bảo lưu mọi quyền.', '© 2024 Your Remit. Hak cipta dilindungi.', '© 2024 Your Remit สงวนลิขสิทธิ์')
ON CONFLICT (key) DO UPDATE SET
  zh_tw = EXCLUDED.zh_tw,
  en = EXCLUDED.en,
  vi = EXCLUDED.vi,
  ind = EXCLUDED.ind,
  th = EXCLUDED.th,
  updated_at = NOW();

-- 通用元素
INSERT INTO translations (key, category, zh_tw, en, vi, ind, th) VALUES
('common.loading', 'common', '載入中...', 'Loading...', 'Đang tải...', 'Memuat...', 'กำลังโหลด...'),
('common.error', 'common', '發生錯誤', 'An error occurred', 'Đã xảy ra lỗi', 'Terjadi kesalahan', 'เกิดข้อผิดพลาด'),
('common.submit', 'common', '送出', 'Submit', 'Gửi', 'Kirim', 'ส่ง'),
('common.cancel', 'common', '取消', 'Cancel', 'Hủy', 'Batal', 'ยกเลิก'),
('common.confirm', 'common', '確認', 'Confirm', 'Xác nhận', 'Konfirmasi', 'ยืนยัน'),
('common.back', 'common', '返回', 'Back', 'Quay lại', 'Kembali', 'กลับ'),
('common.more', 'common', '更多', 'More', 'Xem thêm', 'Selengkapnya', 'เพิ่มเติม'),
('common.search', 'common', '搜尋', 'Search', 'Tìm kiếm', 'Cari', 'ค้นหา')
ON CONFLICT (key) DO UPDATE SET
  zh_tw = EXCLUDED.zh_tw,
  en = EXCLUDED.en,
  vi = EXCLUDED.vi,
  ind = EXCLUDED.ind,
  th = EXCLUDED.th,
  updated_at = NOW();

-- 顯示匯入結果
SELECT category, COUNT(*) as count FROM translations GROUP BY category ORDER BY category;
