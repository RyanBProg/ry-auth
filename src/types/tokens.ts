import type { JWTPayload } from "jose";

export interface AuthTokenPayload extends JWTPayload {
  id: string;
}
