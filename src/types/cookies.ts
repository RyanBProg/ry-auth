export type NodeEnv = "prod" | "dev";

export interface CookieOptions {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "strict" | "lax" | "none";
  expires?: Date;
  path?: string;
  domain?: string | undefined;
  maxAge?: number;
}

export interface Request {
  headers?: Record<string, string | string[] | undefined>;
}

export interface Response {
  setHeader: (name: string, value: string | string[] | number) => void;
  getHeader?: (name: string) => string | string[] | number | undefined;
}
