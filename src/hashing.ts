export class HashingService {
  async hashPassword(password: string): Promise<string> {
    const enc = new TextEncoder();
    const salt = crypto.randomUUID();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(password),
      "PBKDF2",
      false,
      ["deriveBits"]
    );

    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: enc.encode(salt),
        iterations: 310000,
        hash: "SHA-256",
      },
      key,
      256
    );

    const hash = Buffer.from(derivedBits).toString("base64");

    return `${salt}:${hash}`;
  }

  async verifyPassword(password: string, stored: string): Promise<boolean> {
    const [salt, originalHash] = stored.split(":");
    const enc = new TextEncoder();

    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(password),
      "PBKDF2",
      false,
      ["deriveBits"]
    );

    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: enc.encode(salt),
        iterations: 310000,
        hash: "SHA-256",
      },
      key,
      256
    );

    const newHash = Buffer.from(derivedBits).toString("base64");

    return newHash === originalHash;
  }
}
