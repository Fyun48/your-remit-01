# 多國語系設計文件

## 概述

為金優匯 Your Remit 網站加入多國語系支援，針對移工匯款市場提供東南亞語系介面。

## 支援語言

| 代碼 | 語言 | URL 前綴 |
|------|------|----------|
| `zh-TW` | 繁體中文 | `/`（預設，無前綴） |
| `en` | English | `/en/` |
| `vi` | Tiếng Việt | `/vi/` |
| `id` | Bahasa Indonesia | `/id/` |
| `th` | ภาษาไทย | `/th/` |

## URL 結構

```
首頁：
  /              → 繁體中文
  /en/           → English
  /vi/           → Vietnamese
  /id/           → Indonesian
  /th/           → Thai

其他頁面：
  /service-detail.html
  /en/service-detail.html
  /vi/service-detail.html
```

## 檔案結構

```
your-remit-01/
├── index.html           (繁中，載入 zh-TW 翻譯)
├── en/
│   ├── index.html
│   ├── news.html
│   └── ...
├── vi/
│   └── ...
├── id/
│   └── ...
├── th/
│   └── ...
└── js/
    └── i18n.js          (多語系核心邏輯)
```

## 資料庫結構

### translations 表（固定文字翻譯）

| 欄位 | 類型 | 說明 |
|------|------|------|
| `id` | uuid | 主鍵 |
| `key` | text | 翻譯鍵值，如 `nav.about`、`hero.title` |
| `zh_tw` | text | 繁體中文 |
| `en` | text | English |
| `vi` | text | Tiếng Việt |
| `id` | text | Bahasa Indonesia |
| `th` | text | ภาษาไทย |
| `category` | text | 分類：`nav`、`hero`、`footer`、`common` |
| `updated_at` | timestamp | 更新時間 |

### 動態內容擴充

`news` 表新增欄位：
- `title_en`, `title_vi`, `title_id`, `title_th`
- `content_en`, `content_vi`, `content_id`, `content_th`

`service_details` 表新增欄位：
- `title_en`, `title_vi`, `title_id`, `title_th`
- `description_en`, `description_vi`, `description_id`, `description_th`

## 前端實作

### 語言切換器
- 位置：Header 右上角
- 樣式：國旗圖示 + 語言代碼
- 點擊導向對應語言頁面

### 翻譯載入流程

1. 頁面載入時，`i18n.js` 偵測目前路徑判斷語言
2. 從 Supabase 載入該語言的翻譯資料
3. 快取到 localStorage（24 小時過期）
4. 掃描頁面所有 `data-i18n` 屬性，替換文字

### HTML 標記方式

```html
<a href="#" data-i18n="nav.about">關於我們</a>
```

## 後台管理

### 多語系管理頁籤

功能：
- 翻譯列表（依分類篩選、搜尋）
- 編輯介面（5 種語言並排編輯）
- 新增翻譯鍵值
- 匯出/匯入 CSV

### 動態內容多語

在新聞管理、服務管理編輯介面加入語言頁籤，可編輯各語言版本。

## 實作階段

### 第一階段：基礎建設
- 建立 Supabase `translations` 表
- 建立 `i18n.js` 核心模組
- 建立語言切換器元件
- 首頁加入 `data-i18n` 標記

### 第二階段：多語頁面
- 建立語言資料夾結構
- 複製 HTML 頁面到各語言資料夾
- 調整相對路徑

### 第三階段：後台管理
- 新增多語系管理頁籤
- 建立翻譯編輯介面
- 現有編輯介面加入多語支援

### 第四階段：內容翻譯
- 整理所有需翻譯的固定文字
- 翻譯並匯入資料

## 預設行為

- 首次進入網站顯示繁體中文
- 用戶需手動切換語言
- 翻譯未填寫時顯示繁中內容作為 fallback

---

建立日期：2026-01-28
