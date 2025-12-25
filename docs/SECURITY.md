# Security Implementation Guide

## Overview

This document outlines the security measures implemented in the Pokedex application and best practices for maintaining security.

## Authentication & Authorization

### Password Security
- **Hashing**: All passwords are hashed using bcrypt with 10 salt rounds
- **Storage**: Password hashes are stored in SQLite, never plain text
- **Default Credentials**: Admin user (username: admin, password: admin) - **MUST be changed in production**

### Session Management
- **JWT Tokens**: Sessions use JWT tokens for stateless authentication
- **HTTP-Only Cookies**: Session tokens stored in HTTP-only cookies to prevent XSS attacks
- **Token Expiration**: Configurable session duration (default: 7 days)
- **Session Cleanup**: Automatic cleanup of expired sessions runs every hour
- **Database Validation**: Sessions are validated against the database for revocation support

### JWT Secret
- **Minimum Length**: 32 characters enforced via Zod validation
- **Production Check**: Application will fail to start if default secret is used in production
- **Generation**: Use `openssl rand -base64 32` to generate a secure secret

## Rate Limiting

### Implementation
- In-memory rate limiter for simplicity (consider Redis for production at scale)
- Automatic cleanup of expired rate limit entries

### Limits
- **Login Attempts**: 5 attempts per 15 minutes per IP
- **API Calls**: 100 requests per minute per IP
- **Search**: 30 requests per minute per IP

### Usage in API Routes
```typescript
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const identifier = getClientIdentifier(request);
  const rateLimit = checkRateLimit(identifier, RATE_LIMITS.LOGIN);

  if (!rateLimit.success) {
    return errorResponse(
      "Too many requests. Please try again later.",
      HTTP_STATUS.TOO_MANY_REQUESTS
    );
  }

  // ... rest of the logic
}
```

## Database Security

### SQLite Configuration
- **Foreign Keys**: Enabled to ensure referential integrity
- **WAL Mode**: Write-Ahead Logging for better concurrency and crash recovery
- **Parameterized Queries**: better-sqlite3 automatically prevents SQL injection

### Data Protection
- **User Passwords**: Bcrypt hashed (never stored in plain text)
- **Session Tokens**: Cryptographically signed JWTs
- **Database File**: Located in `/data/` directory (excluded from git)

## Input Validation

### Zod Schemas
All user inputs are validated using Zod schemas:
- Environment variables validated at startup
- API request bodies validated before processing
- Form inputs validated on client and server

### Sanitization
- Error messages sanitized in production (no stack traces exposed)
- User-generated content (if added) should be sanitized to prevent XSS

## Middleware Security

### Route Protection
- All routes except `/login` and `/api/auth/login` require authentication
- Middleware validates JWT on every request
- Invalid tokens automatically redirect to login page

### Proxy Configuration (Next.js 16)
- Uses new `proxy.ts` convention
- Runs on all routes except static files and images
- Validates session before allowing access to protected routes

## API Security

### Response Standardization
- Consistent error response format
- Status codes follow HTTP standards
- Detailed errors only in development mode

### Error Handling
- Centralized error handler catches all errors
- Sensitive information hidden in production
- Validation errors include field-specific messages

## Best Practices

### Environment Variables
1. **Never commit** `.env.local` to version control
2. **Always change** default secrets in production
3. **Validate** all environment variables at startup
4. **Document** required variables in `.env.example`

### Password Requirements
For future user registration (if implemented):
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- Optional: special character

### Session Management
1. **Logout**: Always delete session from database
2. **Token Refresh**: Consider implementing token refresh for long-lived sessions
3. **Concurrent Sessions**: Monitor and limit active sessions per user
4. **Session Revocation**: Database-backed sessions allow immediate revocation

### HTTPS in Production
- **Always use HTTPS** in production
- **Secure cookies**: Set `secure: true` flag on cookies in production
- **HSTS headers**: Consider adding HTTP Strict Transport Security headers

## Security Checklist for Production

- [ ] Change JWT_SECRET from default value
- [ ] Change admin password from default (admin/admin)
- [ ] Enable HTTPS
- [ ] Set secure flag on cookies
- [ ] Review and adjust rate limits based on traffic
- [ ] Set up monitoring and alerting
- [ ] Regular database backups
- [ ] Update dependencies regularly
- [ ] Enable CORS only for trusted origins
- [ ] Add CSP (Content Security Policy) headers
- [ ] Configure proper logging (without sensitive data)

## Known Limitations

### Current Implementation
1. **In-Memory Rate Limiting**: Won't work across multiple server instances
   - **Solution**: Use Redis or similar for distributed rate limiting

2. **SQLite Database**: Not ideal for high-concurrency scenarios
   - **Solution**: Consider PostgreSQL for production at scale

3. **No CSRF Protection**: Currently not implemented
   - **Solution**: Implement CSRF tokens for state-changing operations

4. **No 2FA**: Two-factor authentication not implemented
   - **Solution**: Add 2FA using TOTP or similar

## Incident Response

If a security vulnerability is discovered:
1. **Assess** the impact and severity
2. **Patch** the vulnerability immediately
3. **Invalidate** all active sessions if authentication is compromised
4. **Notify** users if their data was potentially accessed
5. **Document** the incident and preventive measures taken

## Security Updates

This application uses:
- Next.js 16 (keep updated for security patches)
- React 19 (keep updated)
- bcryptjs (stable, well-maintained)
- jose (JWT library, keep updated)
- better-sqlite3 (keep updated)

Regularly check for security advisories:
```bash
pnpm audit
```

Fix vulnerabilities:
```bash
pnpm audit fix
```

## Contact

For security concerns or to report vulnerabilities, please contact the development team.

---

Last Updated: 2025-12-24
Version: 1.0
