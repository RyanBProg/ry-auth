import { randomBytes, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

export class HashingService {
  async hashPassword(password: string): Promise<string> {
    if (!password) {
      throw new Error("No password received.");
    }
    const salt = randomBytes(16).toString("hex");
    const hashed = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${salt}:${hashed.toString("hex")}`;
  }

  async verifyPassword(
    password: string,
    storedPassword: string
  ): Promise<boolean> {
    if (!password) {
      throw new Error("No password received.");
    }
    if (!storedPassword) {
      throw new Error("No stored password provided.");
    }

    const [salt, key] = storedPassword.split(":", 2);
    if (!salt || !key) {
      throw new Error(
        "Received password hash format error. No salt and/or key provided."
      );
    }

    const hashed = (await scryptAsync(password, salt, 64)) as Buffer;

    const keyBuffer = Buffer.from(key, "hex");
    if (keyBuffer.length !== hashed.length) {
      return false;
    }

    return timingSafeEqual(hashed, keyBuffer);
  }
}
