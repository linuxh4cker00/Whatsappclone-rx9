const crypto = require("crypto");

const algorithm = "aes-256-ctr";
const secretKey = process.env.SECRET_KEY || "supersecretkey";
const iv = crypto.randomBytes(16);

function encrypt(text) {
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey, "utf8"), iv);
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
    return { iv: iv.toString("hex"), content: encrypted.toString("hex") };
}

function decrypt(hash) {
    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secretKey, "utf8"), Buffer.from(hash.iv, "hex"));
    const decrypted = Buffer.concat([decipher.update(Buffer.from(hash.content, "hex")), decipher.final()]);
    return decrypted.toString();
}

module.exports = { encrypt, decrypt };
