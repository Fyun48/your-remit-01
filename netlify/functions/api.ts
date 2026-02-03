import { Handler } from '@netlify/functions';
import postgres from 'postgres';

// Database connection with better settings for serverless
const sql = postgres(process.env.DATABASE_URL!, {
  ssl: { rejectUnauthorized: false },
  max: 1,
  idle_timeout: 20,
  connect_timeout: 10,
});

// CORS headers
const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

// Helper: Parse request body
function parseBody(body: string | null) {
  if (!body) return {};
  try {
    return JSON.parse(body);
  } catch {
    return {};
  }
}

// Helper: Success response
function success(data: any, statusCode = 200) {
  return { statusCode, headers, body: JSON.stringify({ success: true, data }) };
}

// Helper: Error response
function error(message: string, statusCode = 500) {
  return { statusCode, headers, body: JSON.stringify({ success: false, error: message }) };
}

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

export const handler: Handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  // Extract path after /api or /.netlify/functions/api
  let path = event.path;
  if (path.startsWith('/.netlify/functions/api')) {
    path = path.replace('/.netlify/functions/api', '');
  } else if (path.startsWith('/api')) {
    path = path.replace('/api', '');
  }
  path = path || '/';
  const method = event.httpMethod;
  const body = parseBody(event.body);
  const params = event.queryStringParameters || {};

  try {
    // ==================== NEWS ====================
    if (path === '/news' || path.startsWith('/news/')) {
      const id = path.split('/')[2];

      if (method === 'GET') {
        if (id) {
          const result = await sql`SELECT * FROM news WHERE id = ${id}`;
          return result.length ? success(result[0]) : error('Not found', 404);
        }
        const result = await sql`SELECT * FROM news ORDER BY "order" ASC, date DESC`;
        return success(result);
      }

      if (method === 'POST') {
        const result = await sql`
          INSERT INTO news (title, category, date, end_date, content, "order")
          VALUES (${body.title}, ${body.category}, ${body.date}, ${body.end_date || null}, ${body.content}, ${body.order || 0})
          RETURNING *
        `;
        return success(result[0], 201);
      }

      if (method === 'PUT' && id) {
        const result = await sql`
          UPDATE news SET
            title = ${body.title},
            category = ${body.category},
            date = ${body.date},
            end_date = ${body.end_date || null},
            content = ${body.content},
            "order" = ${body.order || 0},
            updated_at = NOW()
          WHERE id = ${id}
          RETURNING *
        `;
        return result.length ? success(result[0]) : error('Not found', 404);
      }

      if (method === 'DELETE' && id) {
        await sql`DELETE FROM news WHERE id = ${id}`;
        return success({ deleted: true });
      }
    }

    // ==================== BANNERS ====================
    if (path === '/banners' || path.startsWith('/banners/')) {
      const id = path.split('/')[2];

      if (method === 'GET') {
        if (id) {
          const result = await sql`SELECT * FROM banners WHERE id = ${id}`;
          return result.length ? success(result[0]) : error('Not found', 404);
        }
        const result = await sql`SELECT * FROM banners ORDER BY "order" ASC`;
        return success(result);
      }

      if (method === 'POST') {
        const result = await sql`
          INSERT INTO banners (image_url, link_url, "order")
          VALUES (${body.image_url}, ${body.link_url || null}, ${body.order || 0})
          RETURNING *
        `;
        return success(result[0], 201);
      }

      if (method === 'PUT' && id) {
        const result = await sql`
          UPDATE banners SET
            image_url = ${body.image_url},
            link_url = ${body.link_url || null},
            "order" = ${body.order || 0},
            updated_at = NOW()
          WHERE id = ${id}
          RETURNING *
        `;
        return result.length ? success(result[0]) : error('Not found', 404);
      }

      if (method === 'DELETE' && id) {
        await sql`DELETE FROM banners WHERE id = ${id}`;
        return success({ deleted: true });
      }
    }

    // ==================== BANNER SETTINGS ====================
    if (path === '/banner-settings') {
      if (method === 'GET') {
        const result = await sql`SELECT * FROM banner_settings LIMIT 1`;
        return success(result[0] || { interval: 2 });
      }

      if (method === 'PUT') {
        // Upsert banner settings
        const existing = await sql`SELECT id FROM banner_settings LIMIT 1`;
        if (existing.length) {
          const result = await sql`
            UPDATE banner_settings SET interval = ${body.interval}, updated_at = NOW()
            WHERE id = ${existing[0].id}
            RETURNING *
          `;
          return success(result[0]);
        } else {
          const result = await sql`
            INSERT INTO banner_settings (interval) VALUES (${body.interval})
            RETURNING *
          `;
          return success(result[0]);
        }
      }
    }

    // ==================== IMAGES ====================
    if (path === '/images' || path.startsWith('/images/')) {
      const id = path.split('/')[2];

      if (method === 'GET') {
        if (id) {
          const result = await sql`SELECT * FROM images WHERE id = ${id}`;
          return result.length ? success(result[0]) : error('Not found', 404);
        }
        const result = await sql`SELECT * FROM images ORDER BY created_at DESC`;
        return success(result);
      }

      if (method === 'POST') {
        const result = await sql`
          INSERT INTO images (name, file_path, file_url, file_size, mime_type, width, height, "group", description, show_in_banner)
          VALUES (${body.name}, ${body.file_path}, ${body.file_url}, ${body.file_size || null}, ${body.mime_type || null},
                  ${body.width || null}, ${body.height || null}, ${body.group || 'default'}, ${body.description || null}, ${body.show_in_banner || false})
          RETURNING *
        `;
        return success(result[0], 201);
      }

      if (method === 'PUT' && id) {
        const result = await sql`
          UPDATE images SET
            name = ${body.name},
            file_path = ${body.file_path},
            file_url = ${body.file_url},
            "group" = ${body.group || 'default'},
            description = ${body.description || null},
            show_in_banner = ${body.show_in_banner || false},
            updated_at = NOW()
          WHERE id = ${id}
          RETURNING *
        `;
        return result.length ? success(result[0]) : error('Not found', 404);
      }

      if (method === 'DELETE' && id) {
        await sql`DELETE FROM images WHERE id = ${id}`;
        return success({ deleted: true });
      }
    }

    // ==================== CONTENT SETTINGS ====================
    if (path === '/content-settings') {
      if (method === 'GET') {
        const result = await sql`SELECT * FROM content_settings LIMIT 1`;
        return success(result[0]?.settings || {});
      }

      if (method === 'PUT') {
        const existing = await sql`SELECT id FROM content_settings LIMIT 1`;
        if (existing.length) {
          const result = await sql`
            UPDATE content_settings SET settings = ${JSON.stringify(body)}, updated_at = NOW()
            WHERE id = ${existing[0].id}
            RETURNING *
          `;
          return success(result[0].settings);
        } else {
          const result = await sql`
            INSERT INTO content_settings (settings) VALUES (${JSON.stringify(body)})
            RETURNING *
          `;
          return success(result[0].settings);
        }
      }
    }

    // ==================== SERVICE DETAILS ====================
    if (path === '/services' || path.startsWith('/services/')) {
      const serviceId = path.split('/')[2];

      if (method === 'GET') {
        if (serviceId) {
          const result = await sql`SELECT * FROM service_details WHERE service_id = ${serviceId}`;
          return result.length ? success(result[0]) : error('Not found', 404);
        }
        const result = await sql`SELECT * FROM service_details ORDER BY service_id`;
        return success(result);
      }

      if (method === 'POST') {
        const result = await sql`
          INSERT INTO service_details (service_id, title, tag, description, sections)
          VALUES (${body.service_id}, ${body.title}, ${body.tag}, ${body.description}, ${JSON.stringify(body.sections || [])})
          ON CONFLICT (service_id) DO UPDATE SET
            title = ${body.title},
            tag = ${body.tag},
            description = ${body.description},
            sections = ${JSON.stringify(body.sections || [])},
            updated_at = NOW()
          RETURNING *
        `;
        return success(result[0], 201);
      }

      if (method === 'PUT' && serviceId) {
        const result = await sql`
          UPDATE service_details SET
            title = ${body.title},
            tag = ${body.tag},
            description = ${body.description},
            sections = ${JSON.stringify(body.sections || [])},
            updated_at = NOW()
          WHERE service_id = ${serviceId}
          RETURNING *
        `;
        return result.length ? success(result[0]) : error('Not found', 404);
      }

      if (method === 'DELETE' && serviceId) {
        await sql`DELETE FROM service_details WHERE service_id = ${serviceId}`;
        return success({ deleted: true });
      }
    }

    // ==================== CONTACT MESSAGES ====================
    if (path === '/contact' || path.startsWith('/contact/')) {
      const id = path.split('/')[2];

      if (method === 'GET') {
        if (id) {
          const result = await sql`SELECT * FROM contact_messages WHERE id = ${id}`;
          return result.length ? success(result[0]) : error('Not found', 404);
        }
        const result = await sql`SELECT * FROM contact_messages ORDER BY created_at DESC`;
        return success(result);
      }

      if (method === 'POST') {
        const result = await sql`
          INSERT INTO contact_messages (name, email, phone, subject, message)
          VALUES (${body.name}, ${body.email}, ${body.phone || null}, ${body.subject || null}, ${body.message})
          RETURNING *
        `;
        return success(result[0], 201);
      }

      if (method === 'PUT' && id) {
        const result = await sql`
          UPDATE contact_messages SET read = ${body.read || false}
          WHERE id = ${id}
          RETURNING *
        `;
        return result.length ? success(result[0]) : error('Not found', 404);
      }

      if (method === 'DELETE' && id) {
        await sql`DELETE FROM contact_messages WHERE id = ${id}`;
        return success({ deleted: true });
      }
    }

    // ==================== APP SETTINGS (QR Code) ====================
    if (path === '/app-settings' || path.startsWith('/app-settings/')) {
      const platform = path.split('/')[2]; // 'android' or 'ios'

      if (method === 'GET') {
        if (platform) {
          const result = await sql`SELECT * FROM app_settings WHERE platform = ${platform}`;
          return result.length ? success(result[0]) : error('Not found', 404);
        }
        const result = await sql`SELECT * FROM app_settings ORDER BY platform`;
        return success(result);
      }

      if (method === 'PUT' && platform) {
        const result = await sql`
          UPDATE app_settings SET
            app_name = ${body.app_name || 'YourRemit App'},
            store_url = ${body.store_url || null},
            custom_qr_image = ${body.custom_qr_image || null},
            use_custom_image = ${body.use_custom_image || false},
            updated_at = NOW()
          WHERE platform = ${platform}
          RETURNING *
        `;
        return result.length ? success(result[0]) : error('Not found', 404);
      }
    }

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

    // ==================== VISITOR LOGS ====================
    if (path === '/visitors' || path.startsWith('/visitors/')) {
      if (method === 'GET') {
        const { period } = params;
        let result;

        if (period === 'daily') {
          result = await sql`
            SELECT date, COUNT(*) as count
            FROM visitor_logs
            WHERE date >= CURRENT_DATE - INTERVAL '30 days'
            GROUP BY date ORDER BY date DESC
          `;
        } else if (period === 'monthly') {
          result = await sql`
            SELECT DATE_TRUNC('month', date) as month, COUNT(*) as count
            FROM visitor_logs
            WHERE date >= CURRENT_DATE - INTERVAL '12 months'
            GROUP BY DATE_TRUNC('month', date) ORDER BY month DESC
          `;
        } else {
          result = await sql`SELECT * FROM visitor_logs ORDER BY created_at DESC LIMIT 100`;
        }
        return success(result);
      }

      if (method === 'POST') {
        const result = await sql`
          INSERT INTO visitor_logs (date, time, referrer, page, user_agent, screen_size, language)
          VALUES (${body.date || new Date().toISOString().split('T')[0]},
                  ${body.time || new Date().toTimeString().split(' ')[0]},
                  ${body.referrer || null}, ${body.page || null}, ${body.user_agent || null},
                  ${body.screen_size || null}, ${body.language || null})
          RETURNING *
        `;
        return success(result[0], 201);
      }
    }

    // Route not found
    return error(`Route not found: ${method} ${path}`, 404);

  } catch (err) {
    console.error('Database error:', err);
    return error(err instanceof Error ? err.message : 'Internal server error');
  }
};
