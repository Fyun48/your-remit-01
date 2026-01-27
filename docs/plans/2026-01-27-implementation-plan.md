# 視覺改版 + 投資人關係專區 實現計劃

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 將金優匯網站全面升級為大膽創意風格，並新增投資人關係專區功能。

**Architecture:** 純 CSS + Vanilla JavaScript，不引入框架。使用 CSS 變數管理主題色彩，Intersection Observer 實現滾動動畫。投資人專區使用現有 Netlify Functions + NeonDB 架構。

**Tech Stack:** HTML5, CSS3 (CSS Variables, @keyframes), Vanilla JavaScript, Netlify Functions, PostgreSQL (NeonDB)

---

## Phase 1: 基礎設施

### Task 1: 更新資料庫 Schema

**Files:**
- Modify: `neondb-schema.sql`

**Step 1: 新增投資人文件表和治理資訊表 SQL**

在 `neondb-schema.sql` 末尾添加：

```sql
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

-- 索引
CREATE INDEX IF NOT EXISTS idx_investor_docs_category ON investor_documents(category);
CREATE INDEX IF NOT EXISTS idx_investor_docs_year ON investor_documents(fiscal_year DESC);
CREATE INDEX IF NOT EXISTS idx_investor_docs_published ON investor_documents(is_published);
CREATE INDEX IF NOT EXISTS idx_governance_type ON governance_info(type);

-- Triggers
CREATE TRIGGER update_investor_documents_updated_at BEFORE UPDATE ON investor_documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_governance_info_updated_at BEFORE UPDATE ON governance_info
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

**Step 2: Commit**

```bash
git add neondb-schema.sql
git commit -m "feat(db): add investor_documents and governance_info tables"
```

---

### Task 2: 更新 CSS 變數系統

**Files:**
- Modify: `styles.css:1-70`

**Step 1: 更新 CSS 變數為新視覺系統**

替換 `:root` 區塊：

```css
:root {
    /* Primary Colors - Deep Navy Blue */
    --color-primary: #1B3A57;
    --color-primary-light: #2A5580;
    --color-primary-dark: #0D1E2D;

    /* Accent Colors - Teal/Cyan */
    --color-accent: #2DBDB6;
    --color-accent-light: #4DD4CD;
    --color-accent-dark: #1F9E98;

    /* Gradients */
    --gradient-primary: linear-gradient(135deg, #1B3A57 0%, #0D1E2D 100%);
    --gradient-accent: linear-gradient(135deg, #2DBDB6 0%, #1F9E98 100%);
    --gradient-hero: linear-gradient(135deg, #0D1E2D 0%, #1B3A57 50%, #0D1E2D 100%);
    --gradient-text: linear-gradient(135deg, #2DBDB6 0%, #4DD4CD 100%);

    /* Neutral Colors */
    --color-dark: #0D1E2D;
    --color-gray-900: #1C2D42;
    --color-gray-800: #2D4156;
    --color-gray-700: #4A6380;
    --color-gray-600: #6B849E;
    --color-gray-500: #8FA3B8;
    --color-gray-400: #B3C3D1;
    --color-gray-300: #D1DCE5;
    --color-gray-200: #E5ECF2;
    --color-gray-100: #F4F7FA;
    --color-white: #FFFFFF;

    /* Typography */
    --font-primary: 'Noto Sans TC', -apple-system, BlinkMacSystemFont, sans-serif;
    --font-display: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif;

    /* Font Sizes - Fluid */
    --text-hero: clamp(3rem, 8vw, 7rem);
    --text-h1: clamp(2.5rem, 5vw, 4rem);
    --text-h2: clamp(2rem, 4vw, 3rem);
    --text-h3: clamp(1.5rem, 3vw, 2rem);
    --text-body: 1rem;
    --text-small: 0.875rem;

    /* Spacing */
    --space-xs: 0.25rem;
    --space-sm: 0.5rem;
    --space-md: 1rem;
    --space-lg: 1.5rem;
    --space-xl: 2rem;
    --space-2xl: 3rem;
    --space-3xl: 4rem;
    --space-4xl: 6rem;

    /* Border Radius */
    --radius-sm: 4px;
    --radius-md: 8px;
    --radius-lg: 16px;
    --radius-xl: 24px;
    --radius-full: 9999px;

    /* Shadows - Brand colored */
    --shadow-sm: 0 2px 8px rgba(27, 58, 87, 0.08);
    --shadow-md: 0 4px 16px rgba(27, 58, 87, 0.12);
    --shadow-lg: 0 8px 32px rgba(27, 58, 87, 0.16);
    --shadow-xl: 0 20px 60px rgba(27, 58, 87, 0.3);
    --shadow-glow: 0 0 40px rgba(45, 189, 182, 0.4);

    /* Transitions */
    --transition-fast: 0.15s ease;
    --transition-base: 0.3s ease;
    --transition-slow: 0.5s ease;
    --transition-bounce: 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);

    /* Header Height */
    --header-height: 80px;
}
```

**Step 2: Commit**

```bash
git add styles.css
git commit -m "feat(css): update CSS variables for bold creative style"
```

---

### Task 3: 新增共用動畫 Keyframes

**Files:**
- Modify: `styles.css` (在變數區塊後)

**Step 1: 添加動畫 keyframes**

```css
/* ================================
   Animation Keyframes
================================ */

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes fadeInLeft {
    from {
        opacity: 0;
        transform: translateX(-30px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

@keyframes fadeInRight {
    from {
        opacity: 0;
        transform: translateX(30px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

@keyframes float {
    0%, 100% {
        transform: translateY(0);
    }
    50% {
        transform: translateY(-20px);
    }
}

@keyframes pulse {
    0%, 100% {
        opacity: 1;
    }
    50% {
        opacity: 0.5;
    }
}

@keyframes glow {
    0%, 100% {
        box-shadow: 0 0 20px rgba(45, 189, 182, 0.3);
    }
    50% {
        box-shadow: 0 0 40px rgba(45, 189, 182, 0.6);
    }
}

@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes rotate {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

/* Animation utility classes */
.animate-fade-in-up {
    animation: fadeInUp 0.6s ease forwards;
}

.animate-fade-in-left {
    animation: fadeInLeft 0.6s ease forwards;
}

.animate-fade-in-right {
    animation: fadeInRight 0.6s ease forwards;
}

.animate-float {
    animation: float 6s ease-in-out infinite;
}

.animate-glow {
    animation: glow 2s ease-in-out infinite;
}

/* Stagger delays */
.delay-100 { animation-delay: 0.1s; }
.delay-200 { animation-delay: 0.2s; }
.delay-300 { animation-delay: 0.3s; }
.delay-400 { animation-delay: 0.4s; }
.delay-500 { animation-delay: 0.5s; }
```

**Step 2: Commit**

```bash
git add styles.css
git commit -m "feat(css): add animation keyframes and utility classes"
```

---

## Phase 2: 投資人專區 API

### Task 4: 新增投資人文件 API 端點

**Files:**
- Modify: `netlify/functions/api.ts`

**Step 1: 在 VISITOR LOGS 區塊前新增投資人 API**

```typescript
    // ==================== INVESTOR DOCUMENTS ====================
    if (path === '/investor/documents' || path.startsWith('/investor/documents/')) {
      const id = path.split('/')[3];

      if (method === 'GET') {
        if (id) {
          const result = await sql`SELECT * FROM investor_documents WHERE id = ${id}`;
          return result.length ? success(result[0]) : error('Not found', 404);
        }

        const { category, year, published_only } = params;
        let query = sql`SELECT * FROM investor_documents`;

        if (category && year) {
          query = sql`SELECT * FROM investor_documents WHERE category = ${category} AND fiscal_year = ${parseInt(year)} ORDER BY publish_date DESC, "order" ASC`;
        } else if (category) {
          query = sql`SELECT * FROM investor_documents WHERE category = ${category} ORDER BY fiscal_year DESC, publish_date DESC, "order" ASC`;
        } else if (year) {
          query = sql`SELECT * FROM investor_documents WHERE fiscal_year = ${parseInt(year)} ORDER BY publish_date DESC, "order" ASC`;
        } else if (published_only === 'true') {
          query = sql`SELECT * FROM investor_documents WHERE is_published = true ORDER BY fiscal_year DESC, publish_date DESC`;
        } else {
          query = sql`SELECT * FROM investor_documents ORDER BY fiscal_year DESC, publish_date DESC, "order" ASC`;
        }

        const result = await query;
        return success(result);
      }

      if (method === 'POST') {
        const passwordHash = body.password ? await hashPassword(body.password) : null;
        const result = await sql`
          INSERT INTO investor_documents (category, type, title, description, file_url, file_size, publish_date, fiscal_year, fiscal_quarter, is_protected, password_hash, password_hint, is_published, "order")
          VALUES (${body.category}, ${body.type}, ${body.title}, ${body.description || null}, ${body.file_url}, ${body.file_size || null}, ${body.publish_date}, ${body.fiscal_year || null}, ${body.fiscal_quarter || null}, ${body.is_protected || false}, ${passwordHash}, ${body.password_hint || null}, ${body.is_published !== false}, ${body.order || 0})
          RETURNING *
        `;
        return success(result[0], 201);
      }

      if (method === 'PUT' && id) {
        const passwordHash = body.password ? await hashPassword(body.password) : undefined;
        const updateFields = passwordHash !== undefined
          ? sql`
              category = ${body.category},
              type = ${body.type},
              title = ${body.title},
              description = ${body.description || null},
              file_url = ${body.file_url},
              file_size = ${body.file_size || null},
              publish_date = ${body.publish_date},
              fiscal_year = ${body.fiscal_year || null},
              fiscal_quarter = ${body.fiscal_quarter || null},
              is_protected = ${body.is_protected || false},
              password_hash = ${passwordHash},
              password_hint = ${body.password_hint || null},
              is_published = ${body.is_published !== false},
              "order" = ${body.order || 0},
              updated_at = NOW()
            `
          : sql`
              category = ${body.category},
              type = ${body.type},
              title = ${body.title},
              description = ${body.description || null},
              file_url = ${body.file_url},
              file_size = ${body.file_size || null},
              publish_date = ${body.publish_date},
              fiscal_year = ${body.fiscal_year || null},
              fiscal_quarter = ${body.fiscal_quarter || null},
              is_protected = ${body.is_protected || false},
              password_hint = ${body.password_hint || null},
              is_published = ${body.is_published !== false},
              "order" = ${body.order || 0},
              updated_at = NOW()
            `;

        const result = await sql`
          UPDATE investor_documents SET ${updateFields}
          WHERE id = ${id}
          RETURNING *
        `;
        return result.length ? success(result[0]) : error('Not found', 404);
      }

      if (method === 'DELETE' && id) {
        await sql`DELETE FROM investor_documents WHERE id = ${id}`;
        return success({ deleted: true });
      }
    }
```

**Step 2: 新增密碼驗證端點和 helper 函數**

在文件頂部 helpers 區塊添加：

```typescript
// Simple password hashing (for demo - use bcrypt in production)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}
```

新增密碼驗證 API：

```typescript
    // ==================== INVESTOR PASSWORD VERIFY ====================
    if (path === '/investor/verify-password' && method === 'POST') {
      const { document_id, password } = body;

      if (!document_id || !password) {
        return error('Missing document_id or password', 400);
      }

      const result = await sql`SELECT password_hash, is_protected FROM investor_documents WHERE id = ${document_id}`;

      if (!result.length) {
        return error('Document not found', 404);
      }

      if (!result[0].is_protected) {
        return success({ verified: true, message: 'Document is not protected' });
      }

      const isValid = await verifyPassword(password, result[0].password_hash);

      if (isValid) {
        // Generate simple token (in production, use JWT)
        const token = `${document_id}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        return success({ verified: true, token });
      } else {
        return error('Invalid password', 401);
      }
    }
```

**Step 3: Commit**

```bash
git add netlify/functions/api.ts
git commit -m "feat(api): add investor documents endpoints with password protection"
```

---

### Task 5: 新增公司治理 API 端點

**Files:**
- Modify: `netlify/functions/api.ts`

**Step 1: 新增 governance API**

```typescript
    // ==================== GOVERNANCE INFO ====================
    if (path === '/investor/governance' || path.startsWith('/investor/governance/')) {
      const id = path.split('/')[3];

      if (method === 'GET') {
        if (id) {
          const result = await sql`SELECT * FROM governance_info WHERE id = ${id}`;
          return result.length ? success(result[0]) : error('Not found', 404);
        }

        const { type, published_only } = params;
        let result;

        if (type) {
          result = await sql`SELECT * FROM governance_info WHERE type = ${type} ORDER BY "order" ASC`;
        } else if (published_only === 'true') {
          result = await sql`SELECT * FROM governance_info WHERE is_published = true ORDER BY type, "order" ASC`;
        } else {
          result = await sql`SELECT * FROM governance_info ORDER BY type, "order" ASC`;
        }

        return success(result);
      }

      if (method === 'POST') {
        const result = await sql`
          INSERT INTO governance_info (type, name, title, description, file_url, "order", is_published)
          VALUES (${body.type}, ${body.name}, ${body.title || null}, ${body.description || null}, ${body.file_url || null}, ${body.order || 0}, ${body.is_published !== false})
          RETURNING *
        `;
        return success(result[0], 201);
      }

      if (method === 'PUT' && id) {
        const result = await sql`
          UPDATE governance_info SET
            type = ${body.type},
            name = ${body.name},
            title = ${body.title || null},
            description = ${body.description || null},
            file_url = ${body.file_url || null},
            "order" = ${body.order || 0},
            is_published = ${body.is_published !== false},
            updated_at = NOW()
          WHERE id = ${id}
          RETURNING *
        `;
        return result.length ? success(result[0]) : error('Not found', 404);
      }

      if (method === 'DELETE' && id) {
        await sql`DELETE FROM governance_info WHERE id = ${id}`;
        return success({ deleted: true });
      }
    }
```

**Step 2: Commit**

```bash
git add netlify/functions/api.ts
git commit -m "feat(api): add governance info endpoints"
```

---

## Phase 3: 首頁視覺改版

### Task 6: 重新設計 Hero 區域 HTML

**Files:**
- Modify: `index.html:103-175`

**Step 1: 更新 Hero HTML 結構**

替換整個 Hero section：

```html
    <!-- Hero 區域 -->
    <section class="hero">
        <!-- 背景裝飾 -->
        <div class="hero-bg">
            <div class="hero-gradient"></div>
            <div class="hero-shape hero-shape-1"></div>
            <div class="hero-shape hero-shape-2"></div>
            <div class="hero-grid"></div>
        </div>

        <!-- 主要內容 -->
        <div class="hero-container">
            <div class="hero-content">
                <div class="hero-badge animate-fade-in-up">專業 · 信賴 · 創新</div>
                <h1 class="hero-title">
                    <span class="hero-title-line animate-fade-in-up delay-100">金融服務</span>
                    <span class="hero-title-line hero-title-highlight animate-fade-in-up delay-200">新紀元</span>
                </h1>
                <p class="hero-subtitle animate-fade-in-up delay-300">
                    為您提供最專業的金融解決方案，跨境匯款、投資理財、企業顧問一站式服務
                </p>
                <div class="hero-cta animate-fade-in-up delay-400">
                    <a href="#news" class="btn btn-primary btn-glow">
                        最新消息
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                    </a>
                    <a href="#contact" class="btn btn-outline-light">聯繫我們</a>
                </div>

                <!-- App 下載 QR Code -->
                <div class="hero-app-download animate-fade-in-up delay-500">
                    <span class="app-download-label">下載 YourRemit App</span>
                    <div class="app-qr-codes">
                        <div class="qr-code-item">
                            <img id="hero-qr-android" src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://play.google.com/store/apps/details?id=com.yourremit.app" alt="Android App QR Code">
                            <span>Android</span>
                        </div>
                        <div class="qr-code-item">
                            <img id="hero-qr-ios" src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://apps.apple.com/app/yourremit" alt="iOS App QR Code">
                            <span>iOS</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 視覺裝飾 -->
            <div class="hero-visual">
                <div class="hero-card hero-card-1 animate-float">
                    <div class="card-icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="2" y1="12" x2="22" y2="12"></line>
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                        </svg>
                    </div>
                    <span>全球匯款</span>
                </div>
                <div class="hero-card hero-card-2 animate-float delay-200">
                    <div class="card-icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                        </svg>
                    </div>
                    <span>金融服務</span>
                </div>
                <div class="hero-card hero-card-3 animate-float delay-400">
                    <div class="card-icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                    </div>
                    <span>安全可靠</span>
                </div>
            </div>
        </div>

        <!-- 滾動提示 -->
        <div class="scroll-indicator">
            <span>向下滾動</span>
            <div class="scroll-line"></div>
        </div>
    </section>
```

**Step 2: Commit**

```bash
git add index.html
git commit -m "feat(html): redesign hero section with bold creative style"
```

---

### Task 7: 重新設計 Hero CSS

**Files:**
- Modify: `styles.css` (Hero section)

**Step 1: 更新 Hero CSS**

```css
/* ================================
   Hero Section - Bold Creative Style
================================ */

.hero {
    position: relative;
    min-height: 100vh;
    display: flex;
    align-items: center;
    overflow: hidden;
    background: var(--gradient-hero);
}

.hero-bg {
    position: absolute;
    inset: 0;
    overflow: hidden;
}

.hero-gradient {
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at 30% 20%, rgba(45, 189, 182, 0.15) 0%, transparent 50%),
                radial-gradient(ellipse at 70% 80%, rgba(27, 58, 87, 0.3) 0%, transparent 50%);
}

.hero-shape {
    position: absolute;
    border-radius: 50%;
    filter: blur(60px);
    opacity: 0.5;
}

.hero-shape-1 {
    width: 600px;
    height: 600px;
    background: var(--color-accent);
    top: -200px;
    right: -100px;
    opacity: 0.1;
}

.hero-shape-2 {
    width: 400px;
    height: 400px;
    background: var(--color-primary-light);
    bottom: -100px;
    left: -100px;
    opacity: 0.15;
}

.hero-grid {
    position: absolute;
    inset: 0;
    background-image:
        linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
    background-size: 60px 60px;
}

.hero-container {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
    padding: calc(var(--header-height) + var(--space-4xl)) var(--space-xl) var(--space-4xl);
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-4xl);
    align-items: center;
}

.hero-content {
    max-width: 650px;
}

.hero-badge {
    display: inline-block;
    padding: var(--space-sm) var(--space-lg);
    background: rgba(45, 189, 182, 0.15);
    border: 1px solid rgba(45, 189, 182, 0.3);
    border-radius: var(--radius-full);
    color: var(--color-accent);
    font-size: var(--text-small);
    font-weight: 500;
    letter-spacing: 2px;
    margin-bottom: var(--space-xl);
}

.hero-title {
    font-family: var(--font-display);
    font-size: var(--text-hero);
    font-weight: 900;
    line-height: 1.1;
    color: var(--color-white);
    margin-bottom: var(--space-xl);
}

.hero-title-line {
    display: block;
}

.hero-title-highlight {
    background: var(--gradient-text);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    padding-left: 1em;
}

.hero-subtitle {
    font-size: 1.25rem;
    color: var(--color-gray-400);
    line-height: 1.8;
    margin-bottom: var(--space-2xl);
    max-width: 500px;
}

.hero-cta {
    display: flex;
    gap: var(--space-md);
    flex-wrap: wrap;
}

.btn {
    display: inline-flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-md) var(--space-xl);
    border-radius: var(--radius-lg);
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: all var(--transition-base);
    text-decoration: none;
    border: none;
}

.btn-primary {
    background: var(--gradient-accent);
    color: var(--color-white);
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-glow);
}

.btn-glow {
    animation: glow 2s ease-in-out infinite;
}

.btn-outline-light {
    background: transparent;
    color: var(--color-white);
    border: 2px solid rgba(255, 255, 255, 0.3);
}

.btn-outline-light:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.5);
}

/* Hero Visual */
.hero-visual {
    position: relative;
    height: 500px;
}

.hero-card {
    position: absolute;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-lg);
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: var(--radius-xl);
    color: var(--color-white);
}

.hero-card .card-icon {
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--gradient-accent);
    border-radius: var(--radius-lg);
}

.hero-card span {
    font-size: var(--text-small);
    font-weight: 500;
}

.hero-card-1 {
    top: 10%;
    left: 20%;
}

.hero-card-2 {
    top: 40%;
    right: 10%;
}

.hero-card-3 {
    bottom: 15%;
    left: 30%;
}

/* Scroll Indicator */
.scroll-indicator {
    position: absolute;
    bottom: var(--space-xl);
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-sm);
    color: var(--color-gray-500);
    font-size: var(--text-small);
}

.scroll-line {
    width: 1px;
    height: 40px;
    background: linear-gradient(to bottom, var(--color-accent), transparent);
    animation: pulse 2s ease-in-out infinite;
}

/* Responsive */
@media (max-width: 1024px) {
    .hero-container {
        grid-template-columns: 1fr;
        text-align: center;
        padding-top: calc(var(--header-height) + var(--space-3xl));
    }

    .hero-content {
        max-width: 100%;
    }

    .hero-title-highlight {
        padding-left: 0;
    }

    .hero-subtitle {
        max-width: 100%;
    }

    .hero-cta {
        justify-content: center;
    }

    .hero-visual {
        display: none;
    }

    .hero-app-download {
        align-items: center;
    }
}
```

**Step 2: Commit**

```bash
git add styles.css
git commit -m "feat(css): add bold creative hero section styles"
```

---

## Phase 4: 導航更新

### Task 8: 更新導航列添加投資人關係

**Files:**
- Modify: `index.html` (nav section)

**Step 1: 在導航列添加投資人關係選項**

在「企業責任」和「人才招募」之間添加：

```html
                    <li class="nav-item has-dropdown">
                        <a href="investors.html" class="nav-link">
                            投資人關係
                            <svg class="dropdown-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </a>
                        <ul class="dropdown">
                            <li><a href="investors-financials.html">財務報告</a></li>
                            <li><a href="investors-announcements.html">公司公告</a></li>
                            <li><a href="investors-governance.html">公司治理</a></li>
                            <li><a href="investors-shareholders.html">股東會資訊</a></li>
                        </ul>
                    </li>
```

**Step 2: 在 Footer 添加投資人專區連結**

在 footer-links 區塊添加新區塊：

```html
                    <div class="footer-links">
                        <h4 class="footer-title">投資人專區</h4>
                        <ul>
                            <li><a href="investors-financials.html">財務報告</a></li>
                            <li><a href="investors-announcements.html">公司公告</a></li>
                            <li><a href="investors-governance.html">公司治理</a></li>
                            <li><a href="investors-shareholders.html">股東會資訊</a></li>
                        </ul>
                    </div>
```

**Step 3: Commit**

```bash
git add index.html
git commit -m "feat(nav): add investor relations navigation links"
```

---

## Phase 5: 投資人專區前台頁面

### Task 9: 建立投資人關係首頁

**Files:**
- Create: `investors.html`
- Create: `investors.css`
- Create: `investors.js`

**Step 1: 建立 investors.html**

（完整 HTML 代碼 - 包含 Hero、快速導航卡片、最新公告、重要文件下載）

**Step 2: 建立 investors.css**

（投資人專區專用樣式）

**Step 3: 建立 investors.js**

（載入文件、密碼驗證 Modal 等功能）

**Step 4: Commit**

```bash
git add investors.html investors.css investors.js
git commit -m "feat(investors): add investor relations homepage"
```

---

### Task 10-13: 建立投資人子頁面

- Task 10: `investors-financials.html` - 財務報告頁
- Task 11: `investors-announcements.html` - 公司公告頁
- Task 12: `investors-governance.html` - 公司治理頁
- Task 13: `investors-shareholders.html` - 股東會資訊頁

每個頁面獨立 commit。

---

## Phase 6: 後台管理更新

### Task 14: 後台側邊欄新增投資人管理

**Files:**
- Modify: `admin.html`

**Step 1: 在側邊欄添加投資人專區選項**

在 App 設定下方添加投資人管理菜單。

**Step 2: Commit**

```bash
git add admin.html
git commit -m "feat(admin): add investor section to sidebar"
```

---

### Task 15-17: 後台投資人管理頁面

- Task 15: 投資人文件管理區塊
- Task 16: 公司治理管理區塊
- Task 17: admin.js 添加投資人管理功能

---

## Phase 7: 其他頁面視覺更新

### Task 18-20: 首頁其他區塊改版

- Task 18: 最新消息區塊（傾斜卡片、錯位標題）
- Task 19: 關於我們區塊（斜切背景、大數字）
- Task 20: 聯絡我們區塊（底線輸入框、波紋按鈕）

---

### Task 21: 服務詳情頁改版

**Files:**
- Modify: `service-detail.html`
- Modify: `styles.css`

**Step 1: 更新服務詳情頁為大膽創意風格**

**Step 2: Commit**

```bash
git add service-detail.html styles.css
git commit -m "feat(service): redesign service detail page"
```

---

### Task 22: 管理後台視覺更新

**Files:**
- Modify: `admin.css`

**Step 1: 更新後台為輕量創意風格**

**Step 2: Commit**

```bash
git add admin.css
git commit -m "feat(admin): update admin panel to light creative style"
```

---

## Phase 8: 動態效果與響應式

### Task 23: 添加滾動動畫功能

**Files:**
- Modify: `script.js`

**Step 1: 添加 Intersection Observer 動畫**

```javascript
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
}
```

**Step 2: Commit**

```bash
git add script.js
git commit -m "feat(js): add scroll animation with Intersection Observer"
```

---

### Task 24: 響應式調整

**Files:**
- Modify: `styles.css`
- Modify: `investors.css`

**Step 1: 完善所有頁面的響應式設計**

**Step 2: Commit**

```bash
git add styles.css investors.css
git commit -m "feat(css): finalize responsive design for all pages"
```

---

### Task 25: 最終測試與合併

**Step 1: 運行本地測試**

```bash
npm run dev
```

**Step 2: 測試所有頁面功能**

- 首頁視覺效果
- 投資人專區所有頁面
- 後台管理功能
- 響應式在不同螢幕尺寸

**Step 3: 合併到主分支**

```bash
git checkout main
git merge feature/redesign-and-investor-relations
git push
```

---

## Summary

| Phase | Tasks | 預估工作量 |
|-------|-------|-----------|
| Phase 1: 基礎設施 | 3 tasks | 資料庫 + CSS 變數 + 動畫 |
| Phase 2: 投資人 API | 2 tasks | 文件 API + 治理 API |
| Phase 3: 首頁改版 | 2 tasks | Hero HTML + CSS |
| Phase 4: 導航更新 | 1 task | 頂部 + Footer |
| Phase 5: 投資人前台 | 5 tasks | 首頁 + 4 子頁面 |
| Phase 6: 後台更新 | 4 tasks | 側邊欄 + 管理頁面 |
| Phase 7: 其他頁面 | 5 tasks | 首頁區塊 + 服務頁 + 後台 |
| Phase 8: 動畫響應式 | 3 tasks | 滾動動畫 + 響應式 + 測試 |

**Total: 25 Tasks**
