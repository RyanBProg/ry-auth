import type { CookieOptions, Request, Response } from "./types/cookies";

export class CookieService {
  async getCookie(req: Request, cookieName: string) {
    const cookieHeader = req.headers?.cookie;
    if (!cookieHeader) return undefined;
    const header = Array.isArray(cookieHeader)
      ? cookieHeader.join(";")
      : cookieHeader;
    const cookies = header.split(";").map((c) => c.trim());
    const found = cookies.find((c) => c.startsWith(cookieName + "="));
    if (!found) return undefined;
    const raw = found.substring(cookieName.length + 1);
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  }

  async setCookie(
    res: Response,
    cookieName: string,
    cookieValue: string,
    options: CookieOptions = {}
  ) {
    const value = encodeURIComponent(cookieValue);
    let cookieStr = `${cookieName}=${value}`;
    if (options.httpOnly ?? true) cookieStr += "; HttpOnly";
    if (options.secure) cookieStr += "; Secure";
    if (options.sameSite) cookieStr += `; SameSite=${options.sameSite}`;
    if (options.expires)
      cookieStr += `; Expires=${options.expires.toUTCString()}`;
    if (typeof options.maxAge === "number")
      cookieStr += `; Max-Age=${options.maxAge}`;
    if (options.path) cookieStr += `; Path=${options.path}`;
    if (options.domain) cookieStr += `; Domain=${options.domain}`;

    const prev =
      typeof res.getHeader === "function"
        ? res.getHeader("Set-Cookie")
        : undefined;
    if (!prev) {
      res.setHeader("Set-Cookie", cookieStr);
      return;
    }

    if (Array.isArray(prev)) {
      res.setHeader("Set-Cookie", [...prev, cookieStr]);
    } else {
      res.setHeader("Set-Cookie", [String(prev), cookieStr]);
    }
  }
}
