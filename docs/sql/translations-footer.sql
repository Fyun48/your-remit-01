-- Footer 完整翻譯
-- 執行於 Supabase SQL Editor

-- Footer 標題
INSERT INTO translations (key, category, zh_tw, en, vi, ind, th) VALUES
('footer.about_title', 'footer', '關於金優匯', 'About Us', 'Về chúng tôi', 'Tentang Kami', 'เกี่ยวกับเรา'),
('footer.services_title', 'footer', '服務項目', 'Services', 'Dịch vụ', 'Layanan', 'บริการ'),
('footer.support_title', 'footer', '客戶服務', 'Customer Service', 'Hỗ trợ khách hàng', 'Layanan Pelanggan', 'บริการลูกค้า'),
('footer.investor_title', 'footer', '投資人專區', 'Investor Relations', 'Quan hệ nhà đầu tư', 'Hubungan Investor', 'นักลงทุนสัมพันธ์'),
('footer.contact_title', 'footer', '聯絡資訊', 'Contact Info', 'Thông tin liên hệ', 'Info Kontak', 'ข้อมูลติดต่อ')
ON CONFLICT (key) DO UPDATE SET
  zh_tw = EXCLUDED.zh_tw, en = EXCLUDED.en, vi = EXCLUDED.vi, ind = EXCLUDED.ind, th = EXCLUDED.th, updated_at = NOW();

-- Footer 關於我們連結
INSERT INTO translations (key, category, zh_tw, en, vi, ind, th) VALUES
('footer.about_intro', 'footer', '公司簡介', 'Company Profile', 'Giới thiệu công ty', 'Profil Perusahaan', 'ข้อมูลบริษัท'),
('footer.about_philosophy', 'footer', '經營理念', 'Our Philosophy', 'Triết lý kinh doanh', 'Filosofi Kami', 'ปรัชญาของเรา'),
('footer.about_history', 'footer', '發展沿革', 'Our History', 'Lịch sử phát triển', 'Sejarah Kami', 'ประวัติของเรา'),
('footer.about_locations', 'footer', '據點資訊', 'Locations', 'Địa điểm', 'Lokasi', 'สถานที่')
ON CONFLICT (key) DO UPDATE SET
  zh_tw = EXCLUDED.zh_tw, en = EXCLUDED.en, vi = EXCLUDED.vi, ind = EXCLUDED.ind, th = EXCLUDED.th, updated_at = NOW();

-- Footer 客戶服務連結
INSERT INTO translations (key, category, zh_tw, en, vi, ind, th) VALUES
('footer.support_faq', 'footer', '常見問題', 'FAQ', 'Câu hỏi thường gặp', 'FAQ', 'คำถามที่พบบ่อย')
ON CONFLICT (key) DO UPDATE SET
  zh_tw = EXCLUDED.zh_tw, en = EXCLUDED.en, vi = EXCLUDED.vi, ind = EXCLUDED.ind, th = EXCLUDED.th, updated_at = NOW();

-- Footer 投資人連結 (更新)
INSERT INTO translations (key, category, zh_tw, en, vi, ind, th) VALUES
('investor.announcements', 'investor', '公司公告', 'Announcements', 'Thông báo', 'Pengumuman', 'ประกาศ'),
('investor.shareholders', 'investor', '股東會資訊', 'Shareholder Meeting', 'Thông tin cổ đông', 'Info Pemegang Saham', 'ข้อมูลผู้ถือหุ้น')
ON CONFLICT (key) DO UPDATE SET
  zh_tw = EXCLUDED.zh_tw, en = EXCLUDED.en, vi = EXCLUDED.vi, ind = EXCLUDED.ind, th = EXCLUDED.th, updated_at = NOW();

-- 更新 Copyright
UPDATE translations SET
  zh_tw = 'Copyright © 2025 金優匯股份有限公司 Your Remit | yourpay. All Rights Reserved.',
  en = 'Copyright © 2025 Your Remit Co., Ltd. All Rights Reserved.',
  vi = 'Bản quyền © 2025 Your Remit. Đã đăng ký bản quyền.',
  ind = 'Hak Cipta © 2025 Your Remit. Hak Cipta Dilindungi.',
  th = 'ลิขสิทธิ์ © 2025 Your Remit สงวนลิขสิทธิ์',
  updated_at = NOW()
WHERE key = 'footer.copyright';

-- 如果 copyright 不存在則新增
INSERT INTO translations (key, category, zh_tw, en, vi, ind, th)
SELECT 'footer.copyright', 'footer',
  'Copyright © 2025 金優匯股份有限公司 Your Remit | yourpay. All Rights Reserved.',
  'Copyright © 2025 Your Remit Co., Ltd. All Rights Reserved.',
  'Bản quyền © 2025 Your Remit. Đã đăng ký bản quyền.',
  'Hak Cipta © 2025 Your Remit. Hak Cipta Dilindungi.',
  'ลิขสิทธิ์ © 2025 Your Remit สงวนลิขสิทธิ์'
WHERE NOT EXISTS (SELECT 1 FROM translations WHERE key = 'footer.copyright');

-- 顯示匯入結果
SELECT key, en FROM translations WHERE category = 'footer' ORDER BY key;
