# ry-auth

A lightweight, framework-agnostic authentication module for Node.js applications. Built for quick and easy email/password-based JWT authentication with secure cookie handling.

## Features

- 🔐 **JWT-based Authentication** - Secure token-based authentication using HS256
- 🍪 **Secure Cookie Management** - Built-in httpOnly, Secure, and SameSite cookie support
- 📧 **Email/Password Auth** - Simple registration and login flows
- 🔄 **Token Refresh** - Automatic access token refresh using refresh tokens
- 🛡️ **Password Hashing** - Industry-standard bcrypt password hashing
- 🚀 **Framework Agnostic** - Works with Express, Fastify, Hono, or any Node.js framework
- 📦 **Lightweight** - Minimal dependencies (only uses `jose` and `bcrypt`)
- ✅ **Fully Typed** - Complete TypeScript support with strict type safety
- 🔌 **Pluggable User Adapter** - Easy to swap between in-memory and database adapters

## Installation

```bash
npm install ry-auth
# or
pnpm add ry-auth
# or
yarn add ry-auth
```

## Quick Start

### Basic Setup

```typescript
import { createAuth } from "ry-auth";

const auth = createAuth({
  jwtAccessTokenSecret: process.env.JWT_ACCESS_SECRET || "your-access-secret",
  jwtRefreshTokenSecret:
    process.env.JWT_REFRESH_SECRET || "your-refresh-secret",
  nodeEnv: "dev",
  userAdapter: new MemoryUserAdapter(), // optional, uses in-memory by default
});
```

### Registration

```typescript
const { accessToken, refreshToken } = await auth.register(
  "user@example.com",
  "password123",
  res // optional response object for setting cookies
);
```

### Login

```typescript
const { accessToken, refreshToken } = await auth.login(
  "user@example.com",
  "password123",
  res // optional response object for setting cookies
);
```

### Check Authentication

```typescript
const { isValid, userId } = await auth.isAuth(req);

if (isValid) {
  console.log(`User authenticated: ${userId}`);
}
```

### Refresh Token

```typescript
const { accessToken: newAccessToken } = await auth.refreshAccessToken(req, res);
```

### Logout

```typescript
await auth.logout(res);
```

## API Reference

### `createAuth(options)`

Factory function to create an AuthService instance.

**Options:**

- `jwtAccessTokenSecret` (required): Secret key for JWT access token signing
- `jwtRefreshTokenSecret` (required): Secret key for JWT refresh token signing
- `nodeEnv` (required): Environment - `"production"` or `"dev"`
- `userAdapter` (optional): Custom user adapter (defaults to `MemoryUserAdapter`)
- `domain` (required if `nodeEnv` is `"production"`): Domain for secure cookies

**Returns:** `AuthService` instance

### `AuthService` Methods

#### `register(email, password, res?)`

Registers a new user with email and password.

- **Parameters:**
  - `email` (string): User email address
  - `password` (string): User password
  - `res` (Response, optional): Response object to set cookies
- **Returns:** `{ accessToken: string, refreshToken: string }`
- **Throws:** Error if email already exists

#### `login(email, password, res?)`

Authenticates user with email and password.

- **Parameters:**
  - `email` (string): User email address
  - `password` (string): User password
  - `res` (Response, optional): Response object to set cookies
- **Returns:** `{ accessToken: string, refreshToken: string }`
- **Throws:** Error if user not found or password incorrect

#### `isAuth(req)`

Verifies access token validity from request cookies.

- **Parameters:**
  - `req` (Request): Request object containing cookies
- **Returns:** `{ isValid: boolean, userId: string | null }`

#### `refreshAccessToken(req, res)`

Generates a new access token using the refresh token.

- **Parameters:**
  - `req` (Request): Request object containing cookies
  - `res` (Response): Response object to set new access token cookie
- **Returns:** `{ accessToken: string }`
- **Throws:** Error if refresh token is invalid or expired

#### `logout(res)`

Clears both access and refresh token cookies.

- **Parameters:**
  - `res` (Response): Response object
- **Returns:** Promise<void>

## Framework Integration Examples

### Express.js

```typescript
import express, { Request, Response } from "express";
import { createAuth } from "ry-auth";

const app = express();
const auth = createAuth({
  jwtAccessTokenSecret: process.env.JWT_ACCESS_SECRET!,
  jwtRefreshTokenSecret: process.env.JWT_REFRESH_SECRET!,
  nodeEnv: "dev",
});

app.post("/register", async (req: Request, res: Response) => {
  try {
    const { accessToken } = await auth.register(
      req.body.email,
      req.body.password,
      res
    );
    res.json({ accessToken });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

app.post("/login", async (req: Request, res: Response) => {
  try {
    const { accessToken } = await auth.login(
      req.body.email,
      req.body.password,
      res
    );
    res.json({ accessToken });
  } catch (error) {
    res.status(401).json({ error: (error as Error).message });
  }
});

app.get("/check-auth", async (req: Request, res: Response) => {
  const { isValid, userId } = await auth.isAuth(req);
  res.json({ isValid, userId });
});

app.post("/refresh", async (req: Request, res: Response) => {
  try {
    const { accessToken } = await auth.refreshAccessToken(req, res);
    res.json({ accessToken });
  } catch (error) {
    res.status(401).json({ error: (error as Error).message });
  }
});

app.post("/logout", (req: Request, res: Response) => {
  auth.logout(res);
  res.json({ message: "Logged out successfully" });
});
```

### Fastify

```typescript
import fastify from "fastify";
import { createAuth } from "ry-auth";

const app = fastify();
const auth = createAuth({
  jwtAccessTokenSecret: process.env.JWT_ACCESS_SECRET!,
  jwtRefreshTokenSecret: process.env.JWT_REFRESH_SECRET!,
  nodeEnv: "dev",
});

app.post("/register", async (request, reply) => {
  try {
    const { accessToken } = await auth.register(
      request.body.email,
      request.body.password,
      reply
    );
    reply.send({ accessToken });
  } catch (error) {
    reply.status(400).send({ error: (error as Error).message });
  }
});

app.post("/login", async (request, reply) => {
  try {
    const { accessToken } = await auth.login(
      request.body.email,
      request.body.password,
      reply
    );
    reply.send({ accessToken });
  } catch (error) {
    reply.status(401).send({ error: (error as Error).message });
  }
});
```

## Architecture

### Core Modules

- **AuthService** - Main authentication orchestrator
- **CookieService** - Secure cookie handling
- **TokenService** - JWT creation and verification with separate access/refresh secrets
- **HashingService** - Password hashing with bcrypt (12 salt rounds)
- **UserAdapter** - Extensible user storage interface

### Design Pattern

The module uses a factory pattern (`createAuth`) to provide a clean, dependency-injected API while remaining framework-agnostic. You can pass `req` and `res` objects from any Node.js framework.

## Security Features

✅ **httpOnly Cookies** - Prevents XSS attacks from accessing tokens
✅ **Secure Cookies** - Only sent over HTTPS in production
✅ **SameSite Protection** - CSRF protection (Strict in production, Lax in dev)
✅ **Bcrypt Hashing** - Password hashing with 12 salt rounds
✅ **JWT Expiration** - Configurable token expiration times
✅ **Separate Token Secrets** - Different secrets for access and refresh tokens
✅ **Environment-aware** - Automatic secure cookie configuration based on environment

## Token Expiration

- **Access Token:** 15 minutes
- **Refresh Token:** 3 days

These are hardcoded in the service but can be customized by extending the `TokenService` class.

## Cookie Configuration

Cookies are automatically configured based on the `nodeEnv` setting:

**Production (`production`):**

- `Secure`: true (HTTPS only)
- `SameSite`: none
- `HttpOnly`: true
- `Domain`: custom domain required

**Development (`dev`):**

- `Secure`: false (HTTP allowed)
- `SameSite`: lax
- `HttpOnly`: true

## Custom User Adapter

Implement the `UserAdapter` interface to use your own database:

```typescript
import { UserAdapter } from "ry-auth";
import type { User } from "ry-auth";

class DatabaseUserAdapter implements UserAdapter {
  async findByEmail(email: string): Promise<User | null> {
    // Query your database
    return db.users.findOne({ email });
  }

  async createUser(user: Omit<User, "id">): Promise<User> {
    // Create user in your database
    return db.users.create(user);
  }
}

const auth = createAuth({
  jwtAccessTokenSecret: process.env.JWT_ACCESS_SECRET!,
  jwtRefreshTokenSecret: process.env.JWT_REFRESH_SECRET!,
  nodeEnv: "production",
  domain: "example.com",
  userAdapter: new DatabaseUserAdapter(),
});
```

## License

ISC
