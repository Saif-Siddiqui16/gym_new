# QR Scan Check-In Implementation Plan

Add a "Scan QR" feature to Member, Staff, and Manager dashboards for automatic attendance check-in.

## Proposed Changes

### 🛠️ Shared Components

#### [NEW] [QRScannerModal.jsx](file:///c:/Users/kiaan/Desktop/aman%20kiaan%20technlogy/gym/gym_new/src/components/common/QRScannerModal.jsx)
- Create a reusable modal using `html5-qrcode`.
- Handles camera permissions and provides scan status.
- Calls a callback function on successful scan.

### 📁 Member & Trainer Module

#### [MODIFY] [MemberDashboard.jsx](file:///c:/Users/kiaan/Desktop/aman%20kiaan%20technlogy/gym/gym_new/src/modules/dashboard/roles/MemberDashboard.jsx)
- Add "Scan QR" to the `QuickAction` grid.
- Integrate `QRScannerModal`.
- On successful scan, call `/member/attendance/scan-checkin` (or equivalent).

#### [MODIFY] [TrainerDashboard.jsx](file:///c:/Users/kiaan/Desktop/aman%20kiaan%20technlogy/gym/gym_new/src/modules/dashboard/roles/TrainerDashboard.jsx)
- Add "Scan QR" for personal attendance.
- Integrate `QRScannerModal`.
### 📁 Staff Module

#### [MODIFY] [StaffDashboard.jsx](file:///c:/Users/kiaan/Desktop/aman%20kiaan%20technlogy/gym/gym_new/src/modules/dashboard/roles/StaffDashboard.jsx)
- Add "Scan Attendance" to `quickActions` array.
- Integrate `QRScannerModal`.

### 📁 Manager Module

#### [MODIFY] [ManagerDashboard.jsx](file:///c:/Users/kiaan/Desktop/aman%20kiaan%20technlogy/gym/gym_new/src/modules/dashboard/roles/ManagerDashboard.jsx)
- Add a "Quick Actions" section or button for scanning.
- Integrate `QRScannerModal`.

### 🔌 API Integration

#### [NEW] [attendanceApi.js](file:///c:/Users/kiaan/Desktop/aman%20kiaan%20technlogy/gym/gym_new/src/api/member/attendanceApi.js) (if not exists)
- Define `selfCheckIn(qrData)` which calls `POST /attendance/scan-checkin`.

## Verification Plan

### Automated Tests
- N/A (UI focused)

### Manual Verification
- Login as Member → Click "Scan QR" → Verify camera opens → Scan simulated admin QR → Verify success toast and check-in record.
- Repeat for Staff and Manager accounts.
