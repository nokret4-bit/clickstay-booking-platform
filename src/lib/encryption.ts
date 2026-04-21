import crypto from 'crypto';

// Use a fixed encryption key from environment or generate a consistent key
// In production, this should be stored securely in environment variables
const getEncryptionKey = (): Buffer => {
  const keyString = process.env.GUEST_ENCRYPTION_KEY || 'manuel-resort-default-key-2024';
  const hash = crypto.createHash('sha256').update(keyString).digest();
  // Ensure we have exactly 32 bytes for AES-256
  return hash.slice(0, 32);
};

const ENCRYPTION_KEY = getEncryptionKey();
const ALGORITHM = 'aes-256-cbc';

/**
 * Encrypt sensitive guest information
 * @param plaintext - The text to encrypt (email, phone, address, etc.)
 * @returns Encrypted string in format: iv:encrypted
 */
export function encryptGuestData(plaintext: string): string {
  try {
    if (!plaintext) return plaintext;
    
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Return IV + encrypted data in hex format
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    return plaintext; // Fallback to plaintext if encryption fails
  }
}

/**
 * Decrypt sensitive guest information
 * @param encryptedData - The encrypted string in format: iv:encrypted
 * @returns Decrypted plaintext
 */
export function decryptGuestData(encryptedData: string): string {
  try {
    if (!encryptedData || !encryptedData.includes(':')) return encryptedData;
    
    const parts = encryptedData.split(':');
    if (parts.length !== 2 || !parts[0] || !parts[1]) return encryptedData;
    
    const [iv, encrypted] = parts as [string, string];
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      ENCRYPTION_KEY,
      Buffer.from(iv, 'hex')
    );
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return encryptedData; // Return as-is if decryption fails
  }
}

/**
 * Mask sensitive information for partial visibility
 * Useful for displaying in UI without full decryption
 * @param data - The data to mask
 * @param type - Type of data (email, phone, etc.)
 * @returns Masked string
 */
export function maskSensitiveData(
  data: string | null | undefined, 
  type: 'email' | 'phone' | 'address' = 'email'
): string {
  if (!data) return data || '';
  
  switch (type) {
    case 'email': {
      const parts = data.split('@');
      const local = parts[0];
      const domain = parts[1];
      
      if (!local || !domain || local.length < 2) return data;
      
      const maskedLocal = local.charAt(0) + '*'.repeat(Math.max(1, local.length - 2)) + local.charAt(local.length - 1);
      return `${maskedLocal}@${domain}`;
    }
    case 'phone': {
      if (data.length < 8) return data;
      return '*'.repeat(data.length - 4) + data.slice(-4);
    }
    case 'address': {
      if (data.length < 10) return data;
      return data.slice(0, 5) + '*'.repeat(Math.max(data.length - 10, 3)) + data.slice(-5);
    }
    default:
      return data;
  }
}
