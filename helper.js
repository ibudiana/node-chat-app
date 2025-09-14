const crypto = require("crypto");

// Helper functions for hashing
function generateHash(message) {
  // hash menggunakan algoritma SHA-256 dan ubah ke format heksadesimal
  return crypto.createHash("sha256").update(message).digest("hex");
}

function verifyHash(message, hash) {
  const expectedHash = generateHash(message);
  // Bandingkan dengan hash yang diberikan
  return expectedHash === hash;
}

// Helper functions for digital signatures
function generateKeyPair() {
  return crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });
}

function signMessage(message, privateKey) {
  const data = Buffer.from(message, "utf8"); // Ubah pesan menjadi buffer
  const signature = crypto.sign("sha256", data, privateKey); // Tanda tangani dengan kunci privat pengirim
  return signature.toString("hex"); // Kembalikan tanda tangan dalam format heksadesimal
}

function verifySignature(message, signature, publicKey) {
  const data = Buffer.from(message, "utf8"); // Ubah pesan menjadi buffer
  const sigBuffer = Buffer.from(signature, "hex"); // Ubah tanda tangan dari format heksadesimal ke buffer
  return crypto.verify("sha256", data, publicKey, sigBuffer); // Verifikasi tanda tangan dengan kunci publik pengirim
}

// Helper functions for encryption/decryption
function encryptMessage(message, publicKey) {
  return crypto.publicEncrypt(
    publicKey, // Gunakan kunci publik penerima
    Buffer.from(message) // Ubah pesan menjadi buffer
  ).toString("hex"); // Kembalikan dalam format heksadesimal
}

function decryptMessage(ciphertext, privateKey) {
  try {
    return crypto.privateDecrypt(
      privateKey, // Gunakan kunci privat penerima
      Buffer.from(ciphertext, "hex")
    ).toString("utf8"); // Kembalikan pesan asli dalam format string utf8
  } catch (err) {
    // Jika dekripsi gagal kembalikan null
    return null;
  }
}

module.exports = { generateHash, verifyHash, generateKeyPair, signMessage, verifySignature, encryptMessage, decryptMessage };
