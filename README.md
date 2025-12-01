# ry-auth

A lightweight, framework-agnostic authentication module for Node.js applications. Built for quick and easy email/password-based JWT authentication with secure cookie handling.

## Features

- 🔐 **JWT-based Authentication** - Secure token-based authentication using HS256
- 🍪 **Secure Cookie Management** - Built-in httpOnly, Secure, and SameSite cookie support
- 📧 **Email/Password Auth** - Simple registration and login flows
- 🔄 **Token Refresh** - Automatic access token refresh using refresh tokens
- 🛡️ **Password Hashing** - Industry-standard bcrypt password hashing
- 🚀 **Framework Agnostic** - Works with Express, Fastify, Hono, or any Node.js framework
- 📦 **Lightweight** - Minimal dependencies (only uses `jose` for JWT)
- ✅ **Fully Typed** - Complete TypeScript support with strict type safety

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
  jwtSecret: process.env.JWT_SECRET || "your-secret-key",
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
const { isValid, userId } = await auth.isAuth(accessToken);

if (isValid) {
  console.log(`User authenticated: ${userId}`);
}
```

### Refresh Token

```typescript
const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
  await auth.refreshToken(req, res);
```

### Logout

```typescript
await auth.logout(res);
```

## API Reference

### `createAuth(options)`

Factory function to create an AuthService instance.

**Options:**

- `jwtSecret` (required): Secret key for JWT signing
- `userAdapter` (optional): Custom user adapter (defaults to in-memory storage)

**Returns:** `AuthService` instance

### `AuthService` Methods

#### `register(email, password, res?)`

Registers a new user with email and password.

- **Parameters:**
  - `email` (string): User email address
  - `password` (string): User password
  - `res` (Response, optional): Response object to set refresh token cookie
- **Returns:** `{ accessToken: string, refreshToken: string }`
- **Throws:** Error if email already exists

#### `login(email, password, res?)`

Authenticates user with email and password.

- **Parameters:**
  - `email` (string): User email address
  - `password` (string): User password
  - `res` (Response, optional): Response object to set refresh token cookie
- **Returns:** `{ accessToken: string, refreshToken: string }`
- **Throws:** Error if user not found or password incorrect

#### `isAuth(token)`

Verifies JWT token validity.

- **Parameters:**
  - `token` (string): JWT access token
- **Returns:** `{ isValid: boolean, userId: string | null }`

#### `refreshToken(req, res)`

Generates new access and refresh tokens.

- **Parameters:**
  - `req` (Request): Request object containing cookies
  - `res` (Response): Response object to set new refresh token cookie
- **Returns:** `{ accessToken: string, refreshToken: string }`
- **Throws:** Error if refresh token is invalid or expired

#### `logout(res)`

Clears the refresh token cookie and logs out the user.

- **Parameters:**
  - `res` (Response): Response object
- **Returns:** Promise<void>

## Framework Integration Examples

### Express.js

```typescript
import express, { Request, Response } from "express";
import { createAuth } from "ry-auth";

const app = express();
const auth = createAuth({ jwtSecret: process.env.JWT_SECRET! });

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
const auth = createAuth({ jwtSecret: process.env.JWT_SECRET! });

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
```

## Architecture

### Core Modules

- **AuthService** - Main authentication orchestrator
- **CookieService** - Secure cookie handling
- **TokenService** - JWT creation and verification
- **HashingService** - Password hashing with bcrypt
- **UserAdapter** - Extensible user storage interface

### Design Pattern

The module uses a factory pattern (`createAuth`) to provide a clean, dependency-injected API while remaining framework-agnostic. You can pass `req` and `res` objects from any Node.js framework.

## Security Features

✅ **httpOnly Cookies** - Prevents XSS attacks from accessing tokens
✅ **Secure Cookies** - Only sent over HTTPS in production
✅ **SameSite Protection** - CSRF protection with SameSite=Strict
✅ **Bcrypt Hashing** - Password hashing with salt rounds
✅ **JWT Expiration** - Configurable token expiration times
✅ **Refresh Token Rotation** - New refresh tokens on each refresh

## Token Expiration

- **Access Token:** 1 hour
- **Refresh Token:** 7 days

Customize by modifying the `auth.ts` file or extending the `TokenService`.

## Custom User Adapter

Implement the `UserAdapter` interface to use your own database:

```typescript
import { UserAdapter } from "ry-auth";

class DatabaseUserAdapter implements UserAdapter {
  async findByEmail(email: string) {
    // Query your database
  }

  async createUser(user: { email: string; hashedPassword: string }) {
    // Create user in your database
  }
}

const auth = createAuth({
  jwtSecret: process.env.JWT_SECRET!,
  userAdapter: new DatabaseUserAdapter(),
});
```

## License

ISC
