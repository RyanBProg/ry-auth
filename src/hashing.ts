import bcrypt from "bcrypt";

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

    return bcrypt.compare(password, storedPassword);
  }
}
