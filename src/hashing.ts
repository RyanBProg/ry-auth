import { randomBytes, scrypt, timingSafeEqual } from "crypto";
import bcrypt from "bcrypt";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

export class HashingService {
  private readonly saltRounds = 12;

  async hashPassword(password: string): Promise<string> {
    if (!password) {
      throw new Error("No password received.");
    }
    return await bcrypt.hash(password, this.saltRounds);
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

    return bcrypt.compare(password, storedPassword);
  }
}
