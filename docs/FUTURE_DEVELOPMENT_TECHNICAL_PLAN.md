# Loan App API – Future Development & Technology Implementation Plan

**Audience:** Engineering / DevOps

**Goal:** Provide a practical, low-cost, self-host-friendly roadmap to evolve the MVP into a secure,
high-performance, production system under heavy load.

**Scope:** Backend API + data layer + security + operations. This plan assumes the existing stack
(NestJS + TypeScript + PostgreSQL + Drizzle ORM + JWT + CSRF).

---

## Guiding Principles

1. **Measure before changing:** performance and scaling decisions are driven by metrics, not
   assumptions.
2. **Scale the bottleneck:** most bottlenecks are database, network, or I/O—not framework.
3. **Keep architecture simple:** remain a modular monolith until there is a proven need to split
   services.
4. **Security as a system:** prevent abuse (rate limiting), reduce blast radius (secrets & network
   isolation), and detect issues (audit logs + alerts).
5. **Self-host + low cost:** prefer open-source and minimal moving parts; adopt managed services
   only when they reduce risk/cost significantly.

---

## Target Outcomes

### Performance

- Predictable latency (p95/p99) under peak load
- Fast reads for frequent endpoints (profile, contacts, transaction list)
- Stable database under high concurrency

### Security

- Strong auth/session hygiene
- CSRF protections remain effective
- Abuse resistance (rate limits, request controls)
- Traceable actions (audit logs)

### Operations

- Repeatable deploys
- Safe migrations
- Observability (logs/metrics/traces)
- Disaster recovery basics

---

## Phased Roadmap

### Phase 0 — MVP Hardening (Now)

**Objective:** Make the current app stable and safe without major architectural changes.

**Implementation Checklist**

- **Request/Response correctness**
  - Standardize error codes and messages (already using global filter/interceptor)
  - Add request IDs (correlation) to responses and logs

- **Security basics**
  - Add **rate limiting** (per IP + per user + per route)
  - Enforce request size limits (body, headers)
  - Harden cookies: HttpOnly, Secure in prod, SameSite policy verified
  - Expand authentication logging (login, logout, token refresh, failed login)

- **Database stability**
  - Confirm indexes for frequent filters/sorts (transactions list, status/type, dueDate)
  - Add safe pagination rules (limit cap)

- **Deployment sanity**
  - Environment validation remains strict (Zod)
  - Separate configs for dev/staging/prod

**Recommended Technologies (self-host friendly)**

- Reverse proxy: **Nginx** or **Caddy**
- Rate limiting store: in-memory initially; plan Redis upgrade in Phase 1

**Exit Criteria**

- p95 latency baseline captured
- Rate limiting enabled
- Structured logs and request IDs in place

---

### Phase 1 — Performance & Concurrency (Early Growth)

**Objective:** Improve throughput and DB stability with low-risk, high-impact changes.

**Key Upgrades**

1. **Switch NestJS HTTP adapter to Fastify**
   - Gains throughput and reduces overhead under load

2. **Add PostgreSQL connection pooling via PgBouncer**
   - Prevents DB connection storms when scaling app instances

3. **Introduce Redis**
   - Shared cache, rate-limit counters, and later queues

**Caching Strategy (practical rules)**

- Cache only:
  - Highly repeated reads
  - Data that can be slightly stale (TTL)

- Keep TTL short (30–300s) unless proven safe.
- Use cache keys with versioning to avoid stale format issues.

**Exit Criteria**

- DB connections remain stable under load tests
- p95 improved vs baseline
- Redis in place for rate limiting + basic cache

---

### Phase 2 — Reliability via Async Processing (Growth)

**Objective:** Keep API responses fast by moving slow tasks out of the request path.

**Add Background Jobs**

- **BullMQ + Redis** for:
  - email/notification dispatch
  - image processing or Cloudinary metadata sync
  - periodic cleanup jobs (expired sessions, old CSRF tokens)
  - audit/event streaming into a log store

**Implementation Guidelines**

- Make jobs **idempotent** (safe to retry)
- Use exponential backoff retry policy
- Record job outcomes for debugging

**Exit Criteria**

- Non-critical work moved off the API request lifecycle
- Queue depth and job failure rates monitored

---

### Phase 3 — Observability & Incident Readiness (Scaling)

**Objective:** Detect problems quickly and troubleshoot with confidence.

**Observability Stack (self-host choices)**

- Metrics: **Prometheus + Grafana**
- Logs: **Loki** (Grafana) or **OpenSearch/ELK**
- Tracing: **OpenTelemetry + Jaeger/Tempo**

**What to Measure**

- API latency (p50/p95/p99)
- Error rates by endpoint
- DB query timings; slow query log
- Redis latency and hit rate
- Queue depth and job failures

**Alerting**

- high error rate spikes
- p95/p99 latency spikes
- DB connection saturation
- queue backlog growth

**Exit Criteria**

- Dashboard exists for key SLOs
- Alerts configured for major regressions

---

### Phase 4 — Database Scaling (Heavy Load)

**Objective:** Keep Postgres performant as data grows.

**Steps (in order)**

1. **Tune indexes** based on real query patterns (EXPLAIN ANALYZE)
2. Add **read replica(s)** if reads dominate
3. Consider **partitioning** transactions/payments by time or owner key
4. Apply stricter query patterns:
   - avoid SELECT \*
   - narrow columns
   - eliminate N+1 patterns

**Data Lifecycle**

- Archive old records (optional) to reduce hot table size
- Create maintenance windows for vacuum/analyze

**Exit Criteria**

- Stable query performance as data volume grows
- Clear strategy for archiving/partitioning

---

### Phase 5 — Selective Service Extraction (Only if needed)

**Objective:** Keep the core simple; split only proven bottlenecks.

**Candidates for Extraction**

- Notifications / messaging
- Analytics / reporting
- File/media processing
- Search

**How to Split Safely**

- Introduce an internal API layer (gateway) or direct internal routing
- Use message bus/events for cross-service workflows

**Self-host message options**

- **NATS** (fast, simple)
- **RabbitMQ** (robust)
- Keep BullMQ for job queues where appropriate

**Exit Criteria**

- Clear domain boundary and ownership
- No premature microservice split

---

## Security Roadmap

### Authentication & Session Hygiene

- Prefer short-lived access tokens + refresh flow (rotation)
- Device/session management UI and endpoints
- Session revocation and anomaly detection (too many sessions, new device)

### Abuse Resistance

- Rate limit by endpoint sensitivity (login stricter)
- IP reputation / denylist where needed
- Request validation remains strict (Zod)

### Audit Logs

Record security-critical events:

- login success/failure
- password changes
- 2FA enable/disable
- transaction creation/accept/reject/repay

### Secrets & Key Management

- Store secrets outside the codebase
- Rotate secrets periodically
- Separate secrets per environment

### Network Isolation

- Private networking between API, DB, Redis
- Restrict DB/Redis exposure to internal network only

---

## Deployment & Operations

### Minimal Self-Hosted Setup (cost-effective)

- 1–2 VPS nodes initially
- Docker Compose for:
  - API
  - Postgres
  - PgBouncer
  - Redis
  - Observability stack (optional early)

### Scale-Out Setup (later)

- Multiple API instances behind Nginx/Caddy
- Postgres primary + replica
- Redis dedicated instance
- Optional Kubernetes only when necessary (team maturity + complexity)

### Migrations

- Always run migrations as a controlled step during deploy
- Make migrations backward compatible when possible
- Add rollback plan for critical migrations

---

## Technology Recommendations Summary

### Best “Speed per Effort” (Recommended)

- **NestJS + Fastify adapter**
- **PostgreSQL + PgBouncer**
- **Redis** (cache + rate limiting)
- **BullMQ** (jobs)
- **Prometheus/Grafana + OpenTelemetry** (when scaling)

### When to Consider Go/Rust

- Only for isolated hot paths after measurement
- Keep the primary API in NestJS for velocity and maintainability

---

## Implementation Backlog (Prioritized)

### P0

- Request IDs + structured logging
- Rate limiting
- Request size limits
- Pagination caps

### P1

- PgBouncer
- Redis (rate limiting + cache)
- Fastify adapter

### P2

- BullMQ jobs + idempotency
- Audit logs for sensitive actions

### P3

- Prometheus/Grafana dashboards
- OpenTelemetry tracing

### P4

- Read replicas
- Partitioning/archiving strategy

---

## Definition of Done (Production Readiness)

- Monitoring covers latency, errors, DB, Redis, queues
- Alerts for major regressions
- Documented deploy and rollback
- Rate limiting + audit logging in place
- DB stable under peak concurrency (pooling)
- Background jobs for non-critical work

---

## Notes

This roadmap is intentionally conservative: it prioritizes low-risk optimizations (DB pooling,
caching, queues, observability) before structural changes (microservices). It is designed to keep
costs low while enabling steady growth.
