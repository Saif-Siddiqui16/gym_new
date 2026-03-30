# Smart AIoT System — Full Flow Documentation

## Overview

Smart AIoT (Artificial Intelligence of Things) ek hardware-based access control system hai jo gym mein face recognition devices ke zariye members, staff aur visitors ki entry track karta hai. Yeh system real-time mein device data fetch karta hai, face records store karta hai aur dashboard par live stats dikhata hai.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                     │
│                                                         │
│  Smart AIoT Menu                                        │
│  ├── Overview          (/operations/smart-aiot)         │
│  ├── Devices List      (/operations/devices)            │
│  ├── Face Records      (/operations/face-records)       │
│  └── Live Monitor      (/operations/live-monitor)       │
│                                                         │
│  Hardware Settings     (/superadmin/general-settings)   │
│  Hardware Logs         (/superadmin/audit-logs)         │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP Requests (apiClient)
┌────────────────────────▼────────────────────────────────┐
│                  BACKEND API (REST)                     │
│                                                         │
│  GET  /gym-device/dashboard       → Stats + Records     │
│  GET  /gym-device/devices         → Device List         │
│  GET  /gym-device/records         → Face Logs           │
│  GET  /gym-device/departments     → Departments         │
│  GET  /gym-device/attendance-summary → Attendance       │
│                                                         │
│  POST   /devices        → Add Device                    │
│  PUT    /devices/:id    → Update Device                 │
│  DELETE /devices/:id    → Delete Device                 │
└────────────────────────┬────────────────────────────────┘
                         │ SDK Communication
┌────────────────────────▼────────────────────────────────┐
│             PHYSICAL HARDWARE DEVICES                   │
│                                                         │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  Face ID    │  │  Turnstile   │  │  RFID Reader  │  │
│  │  (AIoT Cam) │  │  (Gate Lock) │  │  (Card Scan)  │  │
│  └─────────────┘  └──────────────┘  └───────────────┘  │
│                                                         │
│  Connection: IP Address + Port (HTTP/HTTPS/TCP)         │
│  Auth: SDK API Key + API Secret                         │
└─────────────────────────────────────────────────────────┘
```

---

## API Layer — `gymDeviceApi.js`

Yeh file frontend aur backend ke beech ka bridge hai.

| Function | Method | Endpoint | Kya karta hai |
|---|---|---|---|
| `fetchGymDeviceDashboard()` | GET | `/gym-device/dashboard` | Stats + recent face records |
| `fetchGymDevices()` | GET | `/gym-device/devices` | Connected SmartAIoT devices |
| `fetchFaceAccessRecords()` | GET | `/gym-device/records` | Saare face entry logs |
| `fetchGymDepartments()` | GET | `/gym-device/departments` | Department/category list |
| `fetchGymAttendanceSummary(page, limit)` | GET | `/gym-device/attendance-summary` | Paginated attendance |

---

## Dashboard API Response Structure

`fetchGymDeviceDashboard()` se yeh data aata hai:

```json
{
  "onlineCount": 3,
  "offlineCount": 1,
  "totalCountToday": 145,
  "totalCountAll": 12480,
  "employeeCountToday": 12,
  "employeeCountAll": 890,
  "visitorCountToday": 8,
  "visitorCountAll": 340,
  "records": [
    {
      "id": 1,
      "personName": "Rahul Sharma",
      "personSn": "MEM-001",
      "imageUrl": "https://...",
      "createTime": "2026-03-30 09:45:12",
      "deviceName": "Main Gate Cam",
      "deviceKey": "DEV-XYZ",
      "passType": "MEMBER_PASS"
    }
  ]
}
```

---

## Module 1 — Device Add Karna (`AddDeviceDrawer.jsx`)

### Kab use hota hai
Admin ya SuperAdmin jab naya hardware device system mein register karna chahta hai.

### Form Fields

```
Device Identity
├── Device Name         → "Main Gate Camera"
├── Hardware Type       → Turnstile / Face ID / RFID Reader / Biometric
└── Status              → Online / Offline / Maintenance

Network Configuration
└── IP Address          → 192.168.1.100

Advanced Configuration (optional)
├── Port                → 80 (default)
└── Protocol            → HTTP / HTTPS / TCP

SDK Configuration
├── SDK Type            → SmartAIoT / Custom / Other
├── API Key             → (hidden field)
├── API Secret          → (hidden field)
└── Device Token        → (optional)

SuperAdmin Only
├── Company Selector    → Multi-gym select
└── Branch Selector     → Branch assign karo
```

### Submit Flow

```
User fills form
       ↓
Frontend maps fields:
  apiKey → sdkApiKey
  apiSecret → sdkApiSecret
       ↓
POST /devices (backend)
       ↓
Backend registers device in DB
       ↓
Device starts syncing via SDK
       ↓
Success toast → Drawer close → Device list refresh
```

---

## Module 2 — SmartAIoT Overview Page (`SmartAIoTOverview.jsx`)

**Route:** `/operations/smart-aiot`

**Yeh page kya dikhata hai:**

### Section 1 — KPI Stats (8 cards)

| Card | Data Field | Color |
|---|---|---|
| Online Devices | `onlineCount` | Emerald |
| Offline Devices | `offlineCount` | Red |
| Members Today | `totalCountToday` | Violet |
| Members Total | `totalCountAll` | Blue |
| Staff Today | `employeeCountToday` | Amber |
| Staff Total | `employeeCountAll` | Orange |
| Visitors Today | `visitorCountToday` | Cyan |
| Visitors Total | `visitorCountAll` | Teal |

### Section 2 — Recent Face Access Logs Table (last 10)

| Column | Data |
|---|---|
| Person | Photo + Name |
| ID / SN | `personSn` |
| Type | `passType` (MEMBER_PASS, STAFF_PASS, etc.) |
| Device | `deviceName` |
| Time | `createTime` (formatted) |
| Status | "Verified" |

### Auto-Refresh
- Har **30 seconds** mein data automatically refresh hota hai
- Manual "Refresh" button bhi available hai

---

## Module 3 — Device Dashboard (`Devices.jsx`)

**Route:** `/operations/devices`

**Yeh page kya karta hai:**
- Saare registered devices ki list card view mein dikhata hai
- Har device card mein:
  - Device Name & Type
  - Online / Offline status badge
  - Entries Today count
  - Last Sync time
  - SmartAIoT devices ke liye: Connection Type + Last Detected Person
- Device delete karna (confirmation modal ke saath)
- Live Monitor pe navigate karna

### Summary Cards (top)
- Total Devices
- Online Devices (X/Y Active)
- Total Entries Today

### Data Sources
```
fetchDevices()      → Regular devices (Turnstile, etc.)
fetchGymDevices()   → SmartAIoT Face ID devices
```
Dono combine hokar ek list banti hai.

---

## Module 4 — Face Access Records (`FaceAccessRecords.jsx`)

**Route:** `/operations/face-records`

**Yeh page kya karta hai:**
- Saare face recognition entry records dikhata hai

### Filters Available
| Filter | Type | Description |
|---|---|---|
| Search | Text | Name ya ID se dhundho |
| Department | Dropdown | Department/category filter |
| Date | Date picker | Specific date ke records |

### Table Columns
| Column | Source |
|---|---|
| Photo | `imageUrl` (fallback icon) |
| Member Name | `personName` |
| Member ID | `personSn` |
| Device | `deviceName` + `deviceKey` |
| Entry Time | `createTime` (formatted) |
| Pass Type | `passType` |
| Status | "Access Granted" (always) |

### Features
- Export CSV button
- Clear filters button
- Loading skeleton (5 rows)
- Refresh button

---

## Module 5 — Hardware Settings (`HardwareSettings.jsx`)

**Route:** `/superadmin/general-settings/hardware`

**Access:** SuperAdmin only

**Kya karta hai:**
- Saare devices ki table list
- Add / Edit / Delete operations
- IP address validation
- Status badge: Active (green) / Offline (red)

### Status Mapping (Backend → Frontend)
```
'connected' → 'active'  (green)
'active'    → 'active'  (green)
'Online'    → 'active'  (green)
anything else → 'offline' (red)
```

---

## Module 6 — Hardware Logs (`HardwareLogs.jsx`)

**Route:** `/superadmin/audit-logs/hardware`

**Access:** SuperAdmin only

**Yeh page kya dikhata hai:**
- Hardware devices ke audit logs
- Har log entry mein:
  - Device Name + Type
  - Status (connected / disconnected / error)
  - Log Message
  - Date & Time

### Filters
- Search (device name ya message)
- Device Type (Biometric, Card Reader, Turnstile, etc.)
- Status (Connected, Disconnected, Error)

### Pagination
- 5 items per page
- Previous / Next buttons
- Page number navigation

---

## Complete User Journey — Flow Diagram

```
SETUP PHASE
───────────
SuperAdmin
    │
    ├─ Hardware Settings page khole
    │       ↓
    ├─ "Add Device" click kare
    │       ↓
    ├─ Form bhare (Name, IP, Type, SDK Key/Secret)
    │       ↓
    └─ Device register ho jaye → Backend SDK se connect kare


DAILY OPERATION PHASE
─────────────────────
Member/Staff gym aata hai
    │
    ├─ Face recognition camera scan kare
    │       ↓
    ├─ SmartAIoT SDK backend ko notify kare
    │       ↓
    ├─ Backend entry record create kare
    │       ↓
    └─ Dashboard real-time update ho jaye


MONITORING PHASE
────────────────
Admin dashboard open kare
    │
    ├─ Smart AIoT > Overview
    │       ↓
    │   [Online/Offline count, Face stats, Recent logs]
    │
    ├─ Smart AIoT > Devices List
    │       ↓
    │   [Har device ka status, entries, last sync]
    │
    ├─ Smart AIoT > Face Records
    │       ↓
    │   [Full log history with filters]
    │
    └─ Smart AIoT > Live Monitor
            ↓
        [Real-time check-in feed]
```

---

## Menu Access by Role

| Page | SuperAdmin | Branch Admin | Manager | Staff | Member |
|---|---|---|---|---|---|
| Overview | ✅ | ✅ | ✅ | ❌ | ❌ |
| Devices List | ✅ | ✅ | ✅ | ❌ | ❌ |
| Face Records | ✅ | ✅ | ✅ | ❌ | ❌ |
| Live Monitor | ✅ | ✅ | ✅ | ❌ | ❌ |
| Hardware Settings | ✅ | ❌ | ❌ | ❌ | ❌ |
| Hardware Logs | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## Key Files Reference

| File | Path |
|---|---|
| API Functions | `src/api/gymDeviceApi.js` |
| AIoT Overview Page | `src/modules/operations/pages/SmartAIoTOverview.jsx` |
| Devices Page | `src/modules/operations/pages/Devices.jsx` |
| Face Records Page | `src/modules/operations/pages/FaceAccessRecords.jsx` |
| Add Device Form | `src/modules/operations/pages/AddDeviceDrawer.jsx` |
| Hardware Settings | `src/Superadmin/GeneralSettings/HardwareSettings.jsx` |
| Hardware Logs | `src/Superadmin/AuditLogs/HardwareLogs.jsx` |
| Dashboard Widget | `src/modules/dashboard/components/SmartAIoTSummary.jsx` |
| Menu Config | `src/config/menuConfig.js` |
| Routes | `src/App.jsx` |

---

## Auto-Refresh Intervals

| Component | Interval |
|---|---|
| SmartAIoT Overview | 30 seconds |
| SmartAIoTSummary (widget) | 30 seconds |
| LiveAccessControl | 60 seconds |

---

*Last updated: 2026-03-30*
