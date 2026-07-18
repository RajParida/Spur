# Security Policy

## Reporting Security Vulnerabilities

**Do not** open public issues for security vulnerabilities. Instead, please report security issues to: **security@spur.app** (or contact repository owner privately).

Include:
- Description of vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if available)

## Supported Versions

| Version | Status |
|---------|--------|
| Latest | ✅ Supported |
| Previous | ⚠️ Security fixes only |
| Older | ❌ Not supported |

## Security Best Practices

### For Developers
- Never commit `.env` or `.env.local` files
- Use strong, unique secrets in production
- Keep dependencies updated (Dependabot enabled)
- Review third-party dependencies before adding
- Use parameterized queries (prevents SQL injection)

### For Deployment
- Enable HTTPS/SSL certificates
- Use AWS Secrets Manager for sensitive data
- Implement rate limiting
- Enable audit logging
- Regular security scans

## Known Security Measures

✅ JWT token authentication
✅ Row-Level Security (RLS) on database
✅ CORS configuration
✅ Security headers (X-Content-Type-Options, X-Frame-Options)
✅ XSS protection
✅ SQL injection prevention
✅ Automated dependency updates

## Version History

All security updates are documented in release notes.
