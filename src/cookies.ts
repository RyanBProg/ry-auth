interface CookieOptions {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "Strict" | "Lax" | "None";
  expires?: Date;
  path?: string;
  domain?: string;
  maxAge?: number;
}

export interface Request {
  headers?: Record<string, string | string[] | undefined>;
  [key: string]: any;
}

export interface Response {
  setHeader: (name: string, value: string | string[]) => void;
  [key: string]: any;
}

export class CookieService {
  async getCookie(req: Request, cookieName: string) {
    const cookie = req.headers?.cookie;
    if (!cookie || typeof cookie !== "string") return undefined;
    const match = cookie.match(new RegExp("(^| )" + cookieName + "=([^;]+)"));
    return match ? match[2] : undefined;
  }

  async setCookie(
    res: Response,
    cookieName: string,
    cookieValue: string,
    options: CookieOptions = {}
  ) {
    let cookieStr = `${cookieName}=${cookieValue}`;
    if (options.httpOnly) cookieStr += "; HttpOnly";
    if (options.secure) cookieStr += "; Secure";
    if (options.sameSite) cookieStr += `; SameSite=${options.sameSite}`;
    if (options.expires)
      cookieStr += `; Expires=${options.expires.toUTCString()}`;
    if (options.maxAge) cookieStr += `; Max-Age=${options.maxAge}`;
    if (options.path) cookieStr += `; Path=${options.path}`;
    if (options.domain) cookieStr += `; Domain=${options.domain}`;
    if (res.setHeader) res.setHeader("Set-Cookie", cookieStr);
  }
}
