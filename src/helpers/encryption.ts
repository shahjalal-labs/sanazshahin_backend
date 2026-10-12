import crypto, { BinaryLike, CipherGCMTypes, CipherKey } from "crypto";

const algorithm = "aes-256-gcm" as CipherGCMTypes;
const key = Buffer.from(process.env.ENCRYPTION_KEY!, "hex") as CipherKey; // 32 bytes
const ivLength = 12;

export const encrypt = (text: string) => {
  const iv: Buffer = crypto.randomBytes(ivLength);
  const cipher = crypto.createCipheriv(algorithm, key, iv as BinaryLike);

  const encrypted = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final(),
  ] as any);

  return {
    iv: iv.toString("hex"),
    content: encrypted.toString("hex"),
    tag: cipher.getAuthTag().toString("hex"),
  };
};

export const decrypt = (data: {
  iv: string;
  tag: string;
  content: string;
}): string => {
  const decipher = crypto.createDecipheriv(
    algorithm,
    key,
    Buffer.from(data.iv, "hex") as BinaryLike
  );

  decipher.setAuthTag(Buffer.from(data.tag, "hex") as any);

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(data.content, "hex") as any),
    decipher.final(),
  ] as any);

  return decrypted.toString("utf8");
};
