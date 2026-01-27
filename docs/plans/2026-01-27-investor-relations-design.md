# 投資人關係專區設計文件

**日期**：2026-01-27
**功能**：Investor Relations 投資人關係專區
**權限**：預設公開，個別項目可設定密碼保護

---

## 1. 整體架構

### 專區名稱
- 中文：投資人關係
- 英文：Investor Relations

### 頁面結構
```
/investors/                  → 投資人關係首頁（總覽）
/investors/financials        → 財務報告（年報 + 季報）
/investors/announcements     → 公司公告/重大訊息
/investors/governance        → 公司治理
/investors/shareholders      → 股東會資訊
```

### 導航入口
- **頂部導航**：在「企業責任」和「人才招募」之間加入「投資人關係」（帶下拉選單）
- **Footer**：在「客戶服務」旁新增「投資人專區」區塊

### 內容類型
1. 年度財務報告（年報、財報 PDF）
2. 季度報告（季度財務摘要）
3. 公司公告/重大訊息（官方聲明、重大事項）
4. 公司治理資訊（董事會成員、組織架構、公司章程）
5. 股東會資訊（通知、議事錄、會議資料）

---

## 2. 資料庫設計

### 投資人文件表 `investor_documents`

```sql
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

-- 文件類型說明：
-- financial: annual_report, quarterly_report
-- announcement: major_announcement, press_release
-- governance: charter, policy, regulation
-- shareholder: meeting_notice, agenda, minutes
```

### 公司治理資訊表 `governance_info`

```sql
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
```

### 索引

```sql
CREATE INDEX IF NOT EXISTS idx_investor_docs_category ON investor_documents(category);
CREATE INDEX IF NOT EXISTS idx_investor_docs_year ON investor_documents(fiscal_year DESC);
CREATE INDEX IF NOT EXISTS idx_investor_docs_published ON investor_documents(is_published);
CREATE INDEX IF NOT EXISTS idx_governance_type ON governance_info(type);
```

---

## 3. API 端點

### 投資人文件

| 方法 | 端點 | 說明 |
|------|------|------|
| GET | `/api/investor/documents` | 取得文件列表（可依 category、year 篩選） |
| GET | `/api/investor/documents/:id` | 取得單一文件 |
| POST | `/api/investor/documents` | 新增文件 |
| PUT | `/api/investor/documents/:id` | 更新文件 |
| DELETE | `/api/investor/documents/:id` | 刪除文件 |
| POST | `/api/investor/verify-password` | 驗證文件密碼，取得下載 token |

### 公司治理

| 方法 | 端點 | 說明 |
|------|------|------|
| GET | `/api/investor/governance` | 取得治理資訊（可依 type 篩選） |
| POST | `/api/investor/governance` | 新增治理資訊 |
| PUT | `/api/investor/governance/:id` | 更新治理資訊 |
| DELETE | `/api/investor/governance/:id` | 刪除治理資訊 |

---

## 4. 前台頁面設計

### 4.1 投資人關係首頁 `/investors/`

**Hero 區域**
- 深藍背景 + 標題「投資人關係」
- 副標題：「提供透明、即時的企業資訊，建立與投資人的信任橋樑」

**快速導航卡片**
- 4 張卡片連結到各子頁面
- 財務報告、公司公告、公司治理、股東會資訊
- 每張卡片有圖示 + 標題 + 簡述

**最新公告區塊**
- 顯示最近 3 則重大訊息
- 日期 + 標題 + 閱讀更多連結

**重要文件快速下載**
- 最新年報
- 最新季報
- 一鍵下載按鈕

### 4.2 財務報告頁 `/investors/financials`

**分頁標籤**
- 年度報告 | 季度報告

**年度報告呈現**
- 按年份分組（2025、2024、2023...）
- 卡片式呈現：年度 + 標題 + 發布日期 + 下載按鈕
- 受保護檔案顯示 🔒 圖示

**季度報告呈現**
- 表格式呈現
- 欄位：年度、季度、發布日期、檔案大小、下載
- 可按年份篩選

### 4.3 公司公告頁 `/investors/announcements`

**呈現方式**
- 時間軸呈現，最新在上
- 每則公告：日期標籤 + 標題 + 摘要 + 附件下載

**篩選功能**
- 年份下拉選單
- 類型篩選（重大訊息/新聞稿/其他）

### 4.4 公司治理頁 `/investors/governance`

**區塊一：董事會成員**
- 表格或列表呈現
- 欄位：姓名、職稱、簡歷
- 無照片

**區塊二：組織架構**
- 顯示組織架構圖圖片
- 支援點擊放大

**區塊三：公司章程與內規**
- 文件列表
- 標題 + 發布日期 + 下載按鈕

### 4.5 股東會資訊頁 `/investors/shareholders`

**按年份分組**
- 最新年份展開，歷年摺疊

**每場股東會資訊**
- 會議日期、地點
- 相關文件：
  - 開會通知
  - 議事手冊
  - 議事錄
  - 其他附件

---

## 5. 後台管理介面

### 5.1 側邊欄

在「App 設定」下方新增：
```
📊 投資人專區
   ├── 文件管理
   ├── 公司治理
   └── 股東會資料
```

### 5.2 文件管理頁

**頂部篩選**
- 分類：全部 / 財務報告 / 公司公告 / 股東會
- 年份：下拉選單

**表格欄位**
- 標題
- 分類
- 年度/季度
- 發布日期
- 保護狀態（🔒/🔓）
- 發布狀態
- 操作（編輯/刪除）

**新增/編輯表單**
```
分類選擇：[年報/季報/公告/股東會資料]
標題：________________
說明：________________（可選）
檔案：[上傳] 或 [輸入外部連結]
財務年度：[2025 ▼]（條件顯示）
季度：[Q1 ▼]（季報時顯示）
發布日期：[日期選擇器]

密碼保護：[  ] 啟用
└── 密碼：________________
└── 密碼提示：________________（可選）

發布狀態：◉ 上線  ○ 草稿
```

### 5.3 公司治理管理頁

**董事會成員**
- 表格管理：姓名、職稱、簡歷、排序
- 支援拖曳排序

**組織架構**
- 上傳組織圖圖片
- 預覽功能

**章程與內規**
- 文件列表管理
- 標題 + 檔案 + 排序

### 5.4 操作功能

- 拖曳排序
- 批次刪除
- 快速切換發布狀態
- 複製上一年度資料

---

## 6. 密碼保護機制

### 前台體驗

1. 受保護項目顯示 🔒 圖示
2. 點擊下載 → 彈出密碼輸入 Modal
3. 輸入密碼 → 驗證
4. 正確 → 開始下載
5. 可選「記住此文件密碼」（sessionStorage）

### 後台設定

- 每個文件獨立設定密碼保護
- 密碼欄位：輸入明文，儲存時自動雜湊
- 可設定密碼提示
- 支援批次設定密碼

### 安全機制

- 密碼使用 SHA-256 雜湊儲存
- API 頻率限制（防暴力破解）
- 錯誤 5 次 → 鎖定 5 分鐘

### 驗證流程

```
1. 前台請求下載受保護文件
2. POST /api/investor/verify-password
   Body: { document_id, password }
3. 後端驗證密碼雜湊
4. 正確 → 回傳臨時下載 token（5 分鐘有效）
5. 前台用 token 下載：GET /api/investor/download?token=xxx
```

---

## 7. 檔案結構

```
your-remit-01/
├── investors.html              # 投資人關係首頁
├── investors-financials.html   # 財務報告頁
├── investors-announcements.html # 公司公告頁
├── investors-governance.html   # 公司治理頁
├── investors-shareholders.html # 股東會資訊頁
├── investors.css               # 投資人專區樣式
├── investors.js                # 投資人專區腳本
├── admin.html                  # 後台（新增投資人管理區塊）
├── admin.css                   # 後台樣式（新增）
├── admin.js                    # 後台腳本（新增）
└── netlify/functions/api.ts    # API（新增端點）
```

---

## 8. 實現順序

1. **資料庫** - 建立 investor_documents、governance_info 表
2. **API** - 新增 /api/investor/* 端點
3. **後台管理** - 文件管理、公司治理管理介面
4. **前台首頁** - investors.html 總覽頁
5. **前台子頁** - 財報、公告、治理、股東會頁面
6. **密碼保護** - 驗證機制、前台 Modal
7. **導航整合** - 頂部導航、Footer 連結
8. **測試** - 功能測試、響應式測試
