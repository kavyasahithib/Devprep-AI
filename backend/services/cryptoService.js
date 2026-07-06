const crypto = require("crypto");

const ALGORITHM = "aes-256-cbc";
// Derive a 32-byte encryption key from JWT_SECRET or a fallback
const KEY = crypto.scryptSync(process.env.JWT_SECRET || "default_devprep_encryption_key", "salt", 32);
const IV_LENGTH = 16;

/**
 * Encrypts a plaintext string using AES-256-CBC
 * Returns standard hex format: "IV:encryptedText"
 */
function encrypt(text) {
  if (!text) return text;
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return iv.toString("hex") + ":" + encrypted;
  } catch (err) {
    console.error("Encryption failed:", err.message);
    return text;
  }
}

/**
 * Decrypts a hex-formatted "IV:encryptedText" string
 * Falls back to returning the original string if not encrypted
 */
function decrypt(text) {
  if (!text) return text;
  if (!text.includes(":")) return text; // Handles legacy plaintext tokens
  
  try {
    const parts = text.split(":");
    const iv = Buffer.from(parts[0], "hex");
    const encryptedText = Buffer.from(parts[1], "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (err) {
    console.warn("Decryption failed, returning raw string:", err.message);
    return text;
  }
}

module.exports = { encrypt, decrypt };
