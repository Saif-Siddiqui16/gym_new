# Business Rules: Gym CRM

## 1. Role-Based Access Control (RBAC)
- **Superadmin**: Full access to global system settings and gym list. Cannot be modified by other roles.
- **Admin/Manager**: Restricted to their assigned `tenantId` (Gym). Can manage staff and members within their branch.
- **Staff**: Limited to operational tasks (Check-in/Checkout, Lockers). No access to financial dashboards or payroll creation.
- **Trainer**: Can only view members assigned to them. Shared access to diet/workout modules.
- **Member**: Read-only access to their own data. Can perform actions like "Book Class" or "Pay Invoice".

## 2. Membership Lifecycle
- **Joining**: New members start as 'Active' upon payment.
- **Freezing**: Members can request a freeze; approval leads to temporary suspension of validity.
- **Expiration**: Backend service must automatically mark memberships as 'Expired' when validity ends.
- **Renewal**: Renewal alerts trigger 7 days before expiry.

## 3. Financial Rules
- **Invoice Generation**: Created automatically upon membership signup or POS sale.
- **Commission**: Trainers earn commissions based on personal training sessions (config in branch settings).
- **Petty Cash**: Requires manager approval for expenditures above a defined threshold.

## 4. Operational Constraints
- **Multi-Tenant Check**: Every request must validate that the requested resource belongs to the user's `tenantId`.
- **Attendance**: Member check-in is blocked if membership is 'Expired' or 'Frozen'.
- **Concurrency**: Prevent multiple trainers from being assigned to the same class slot in the same room.
