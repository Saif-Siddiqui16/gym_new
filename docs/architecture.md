# System Architecture: Gym CRM

## Technology Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: JavaScript (ES6+)
- **Database**: MySQL
- **ORM**: Prisma ORM
- **Frontend**: React (Vite-based) - *Source of Truth for Workflows*

## Multi-Tenancy (SaaS)
- **Isolation Strategy**: Logical isolation using `tenantId` (Gym ID) across all relational models.
- **Global Management**: Superadmin role manages the lifecycle of these tenants and their subscription plans.

## Authentication & Authorization
- **Method**: JWT-based authentication.
- **Storage**: **HTTP-only Cookies** (No LocalStorage for tokens).
- **Authorization**: Role-Based Access Control (RBAC) enforced at the middleware level.
- **Persistence**: Prisma handles session and user state in MySQL.

## Data Layer
- **Relational Integrity**: Foreign key constraints managed by Prisma.
- **Performance**: Indexing on `tenantId` and frequently searched fields (memberId, email).
- **Data Cleanup**: Transactional deletes for complex entities (e.g., deleting a gym removes all related staff/members).

## Security
- Password hashing using Argon2 or BCrypt.
- CORS configuration restricted to authorized frontend origins.
- Input validation using Joi or Zod before DB operations.
