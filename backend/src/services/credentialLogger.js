import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Multi-candidate directory lookup for local and cloud container environments
export const getCredentialsDir = () => {
  const candidates = [
    path.resolve(process.cwd(), 'credentials'),
    path.resolve(__dirname, '../../credentials'),
    path.resolve(__dirname, '../../../credentials'),
    path.resolve(process.cwd(), '../credentials')
  ];

  for (const c of candidates) {
    if (fs.existsSync(c)) {
      return c;
    }
  }

  // Fallback: try local first, then root
  const localCand = path.resolve(process.cwd(), 'credentials');
  try {
    if (!fs.existsSync(localCand)) {
      fs.mkdirSync(localCand, { recursive: true });
    }
    return localCand;
  } catch (e) {
    const rootCand = path.resolve(__dirname, '../../../credentials');
    if (!fs.existsSync(rootCand)) {
      fs.mkdirSync(rootCand, { recursive: true });
    }
    return rootCand;
  }
};

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
    const credentialsDir = getCredentialsDir();

    let filename = 'Customer.json';
    if (role === 'vendor') {
      filename = 'Vendor.json';
    } else if (role === 'admin') {
      filename = 'Admin.json';
    }

    const filePath = path.join(credentialsDir, filename);

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
    console.log(`[Credentials] Saved ${role} credential for ${email} in ${filePath}`);
  } catch (err) {
    console.error('[Credentials] Failed to log credential record:', err.message);
  }
};

/**
 * Reads all credentials across Customer.json, Vendor.json, and Admin.json
 */
export const getAllCredentialUsers = () => {
  const files = ['Customer.json', 'Vendor.json', 'Admin.json'];
  const candidates = [
    path.resolve(process.cwd(), 'credentials'),
    path.resolve(__dirname, '../../credentials'),
    path.resolve(__dirname, '../../../credentials'),
    path.resolve(process.cwd(), '../credentials')
  ];

  const seenEmails = new Set();
  const allUsers = [];

  for (const dir of candidates) {
    if (!fs.existsSync(dir)) continue;
    for (const filename of files) {
      const filePath = path.join(dir, filename);
      if (fs.existsSync(filePath)) {
        try {
          const raw = fs.readFileSync(filePath, 'utf8');
          const list = JSON.parse(raw);
          if (Array.isArray(list)) {
            for (const u of list) {
              const em = u.email?.toLowerCase();
              if (em && !seenEmails.has(em)) {
                seenEmails.add(em);
                allUsers.push(u);
              }
            }
          }
        } catch (e) {
          // ignore parse error
        }
      }
    }
  }

  return allUsers;
};

/**
 * Look up a user in credentials/*.json by email
 */
export const findCredentialUserByEmail = (email) => {
  if (!email) return null;
  const users = getAllCredentialUsers();
  return users.find((u) => u.email?.toLowerCase() === email.trim().toLowerCase()) || null;
};

/**
 * Look up a user in credentials/*.json by id, email, or identifier
 */
export const findCredentialUserByIdOrEmail = (identifier) => {
  if (!identifier) return null;
  const target = String(identifier).toLowerCase();
  const users = getAllCredentialUsers();
  return users.find((u) => {
    if (u.email?.toLowerCase() === target) return true;
    if (u._id && String(u._id).toLowerCase() === target) return true;
    if (u.id && String(u.id).toLowerCase() === target) return true;
    const synthId = 'usr_' + Buffer.from(u.email || '').toString('hex').slice(0, 24);
    if (synthId.toLowerCase() === target) return true;
    return false;
  }) || null;
};

