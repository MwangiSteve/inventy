# Code Review Checklist for Production Code

## Security Review

- [ ] No hardcoded secrets in code
- [ ] All inputs are validated
- [ ] All errors are sanitized
- [ ] Authentication checks present
- [ ] Rate limiting applied
- [ ] No SQL injection vulnerabilities
- [ ] No XSS vulnerabilities
- [ ] CORS properly configured
- [ ] CSRF tokens used where needed
- [ ] Sensitive data not logged

## Code Quality

- [ ] TypeScript types complete
- [ ] No `any` types without justification
- [ ] Functions under 20 lines
- [ ] Naming is clear and descriptive
- [ ] DRY principle followed
- [ ] No code duplication
- [ ] Comments explain why, not what
- [ ] JSDoc present for public APIs

## Testing

- [ ] Unit tests included
- [ ] Integration tests for APIs
- [ ] Error cases tested
- [ ] Edge cases considered
- [ ] Test coverage ≥ 80%
- [ ] Mocks used appropriately
- [ ] No skipped tests (`.skip`, `.only`)

## Performance

- [ ] No N+1 queries
- [ ] Database queries optimized
- [ ] No unnecessary renders
- [ ] Assets optimized
- [ ] Caching strategies used
- [ ] Bundle size checked

## Documentation

- [ ] Code comments present
- [ ] JSDoc completed
- [ ] README updated if needed
- [ ] API docs updated
- [ ] Environment variables documented
- [ ] Breaking changes noted

## Standards

- [ ] Follows project conventions
- [ ] Linting passes
- [ ] Type checking passes
- [ ] No console.log() in production code
- [ ] Error handling complete
- [ ] Logging appropriate
