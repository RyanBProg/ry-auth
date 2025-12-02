import type { UserAdapter } from "../adapter";
import type { NodeEnv } from "./cookies";

export interface CreateAuthConfig {
  config: {
    nodeEnv: NodeEnv;
  };
  cookies: {
    accessTokenExpiry: number;
    refreshTokenExpiry: number;
    domain?: string;
  };
  jwt: {
    jwtAccessTokenSecret: string;
    jwtRefreshTokenSecret: string;
  };
  adapters: {
    userAdapters: UserAdapter;
  };
}
