# API Contract: Gym CRM

## Base Standards
- **Version**: `/api/v1`
- **Format**: JSON
- **Authentication**: `Set-Cookie` header for login; `Cookie` header for requests.
- **Status Codes**:
  - `200 OK`: Success
  - `201 Created`: Resource created
  - `400 Bad Request`: Validation error
  - `401 Unauthorized`: Authentication missing/failed
  - `403 Forbidden`: Insufficient permissions (Role mismatch)
  - `404 Not Found`: Resource doesn't exist

## Key Endpoint Groups

### 1. Auth (`/auth`)
- `POST /login`: Authenticates user, sets HTTP-only cookie.
- `POST /logout`: Clears cookie.
- `GET /me`: Returns current user profile and role based on cookie.

### 2. Members (`/members`)
- `GET /`: List members (with search/filter/pagination).
- `POST /`: Register new member.
- `GET /:id`: Detailed member profile.
- `PATCH /:id`: Update member details/status.

### 3. Finance (`/finance`)
- `GET /invoices`: List all generated invoices.
- `POST /pos/transaction`: Process a new sale.
- `GET /expenses`: Tracking gym payouts.

### 4. Classes (`/classes`)
- `GET /`: Fetch class schedule.
- `POST /enroll`: Member enrollment in a class.
- `PATCH /assign-trainer`: Linking a trainer to a specific session.

### 5. HR & Payroll (`/hr`)
- `GET /staff`: Staff directory.
- `POST /payroll/generate`: Monthly payroll calculation for a branch.

## Response Structure Example
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```
