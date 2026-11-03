import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Root credentials directory: <project_root>/credentials
const CREDENTIALS_DIR = path.resolve(__dirname, '../../../credentials');

/**
 * Automatically persists user credentials in root credentials/*.json
 * for easy viewing and quick login.
 */
export const saveCredentialRecord = ({
  name,
  email,
  password,
  role = 'customer',
  phone = '',
  storeName
}) => {
  try {
    if (!fs.existsSync(CREDENTIALS_DIR)) {
      fs.mkdirSync(CREDENTIALS_DIR, { recursive: true });
    }

    let filename = 'Customer.json';
    if (role === 'vendor') {
      filename = 'Vendor.json';
    } else if (role === 'admin') {
      filename = 'Admin.json';
    }

    const filePath = path.join(CREDENTIALS_DIR, filename);

    let list = [];
    if (fs.existsSync(filePath)) {
      try {
        const raw = fs.readFileSync(filePath, 'utf8');
        list = JSON.parse(raw);
        if (!Array.isArray(list)) list = [];
      } catch (parseErr) {
        list = [];
      }
    }

    const existingIndex = list.findIndex(
      (u) => u.email?.toLowerCase() === email?.toLowerCase()
    );

    const record = {
      name,
      email,
      password,
      role,
      phone: phone || '',
      ...(storeName ? { storeName } : {}),
      registeredAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      list[existingIndex] = { ...list[existingIndex], ...record };
    } else {
      list.push(record);
    }

    fs.writeFileSync(filePath, JSON.stringify(list, null, 2), 'utf8');
    console.log(`[Credentials] Saved ${role} credential for ${email} in credentials/${filename}`);
  } catch (err) {
    console.error('[Credentials] Failed to log credential record:', err.message);
  }
};
