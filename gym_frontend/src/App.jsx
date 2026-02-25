import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';

// Layout & Pages
import Login from './pages/Login';
import MainLayout from './layout/MainLayout';

// Module 2: Dashboard
import { DashboardDispatcher } from './modules/dashboard';

// Module 1: Membership
import {
  MembershipList,
  MembershipDetails,
  MembershipForm,
  Benefits,
  BenefitsConfig,
  FreezeRequests,
  MembershipPlans,
  RenewalAlertsPage
} from './modules/membership';

// Module 3: Classes
import {
  ClassesList,
  ClassDetails,
  ClassForm,
  TrainerAssignment,
  MemberEnrollment
} from './modules/classes';

// Module: Operations
import {
  OperationsLayout,
  StaffSchedule,
  EquipmentMaintenance,
  Inventory,
  Announcements,
  RewardsProgram,
  FeedbackSystem,
  WhatsAppChat,
  Devices
} from './modules/operations';

// Module: Superadmin
import PlansList from './Superadmin/PlansManagement/PlansList';
import CreatePlan from './Superadmin/PlansManagement/CreatePlan';
import FeatureToggles from './Superadmin/PlansManagement/FeatureToggles';
import AllGyms from './Superadmin/GymManagement/AllGyms';

import SuspendedGyms from './Superadmin/GymManagement/SuspendedGyms';
import ActiveSubscriptions from './Superadmin/SubscriptionManagement/ActiveSubscriptions';
import ExpiredSubscriptions from './Superadmin/SubscriptionManagement/ExpiredSubscriptions';
import ActivityLogs from './Superadmin/AuditLogs/ActivityLogs';
import WebhookLogs from './Superadmin/AuditLogs/WebhookLogs';
import GeneralSettings from './Superadmin/GeneralSettings/GeneralSettings';
import InvoiceSettings from './Superadmin/GeneralSettings/InvoiceSettings';
import HardwareSettings from './Superadmin/GeneralSettings/HardwareSettings';
import BookingSettingsPage from './Superadmin/GeneralSettings/BookingSettings';
import SuperAdminProfile from './Superadmin/Profile/MyProfile';
import WalletList from './Superadmin/WalletList';
import TrainerRequests from './Superadmin/TrainerRequests';
import TrainerChangeRequestList from './Superadmin/TrainerChangeRequestList';
import PayrollCreation from './Superadmin/payroll/PayrollCreation';
import PayrollHistory from './Superadmin/payroll/PayrollHistory';
import StoreDashboard from './Superadmin/store/StoreDashboard';
import ProductList from './Superadmin/store/ProductList';
import StoreOrders from './Superadmin/store/StoreOrders';
import StoreInventory from './Superadmin/store/StoreInventory';

// Module: Shared (Workouts, Diets, Progress)
import { DietPlans } from './modules/diet';
import { WorkoutPlans } from './modules/workout';
import { MemberProgress } from './modules/progress';

// Module: Manager (Reused for Branch Admin & Manager Role)
import MemberList from './Manager/Members/MemberList';
import BookingCalendar from './Manager/Bookings/BookingCalendar';
import TaskList from './Manager/Tasks/TaskList';
import AssignTask from './Manager/Tasks/AssignTask';
import DailyAttendanceReport from './Manager/Reports/DailyAttendanceReport';
import BookingReport from './Manager/Reports/BookingReport';
import ManagerProfile from './Manager/Profile/MyProfile';
import BranchAdminProfile from './Manager/Profile/MyProfile';
import LiveCheckInMonitor from './Manager/Attendance/LiveCheckInMonitor';
import MemberLog from './Manager/Attendance/TodayAttendance/MemberAttendanceLog';
import CommunicationPage from './Manager/Communication/CommunicationPage';
import StaffLog from './Manager/Attendance/TodayAttendance/StaffAttendanceLog';
import StaffCheckIn from './Staff/AttendanceCheckIn/MemberCheckIn';
import CheckOut from './Staff/AttendanceCheckIn/MemberCheckOut';
import TodaysCheckIns from './Staff/AttendanceCheckIn/TodaysCheckIns';
import StorePage from './Member/Store/StorePage';
import LockerManagement from './Staff/Lockers/LockerManagement';
import AssignLocker from './Staff/Lockers/AssignLocker';
import ReleaseLocker from './Staff/Lockers/ReleaseLocker';
import MyTasks from './Staff/Tasks/MyTasks';
import StaffTaskStatus from './Staff/Tasks/TaskStatus';
import StaffManagement from './Staff/StaffManagement/StaffManagement';
import StaffProfile from './Staff/Profile/MyProfile';
// Removed unused legacy payment imports

// Module: Trainer
import AssignedMembers from './Trainer/Members/AssignedMembers';
import TrainerProfile from './Trainer/Profile/MyProfile';
import TrainerEarnings from './Trainer/Earnings/TrainerEarnings';
import TrainerAttendance from './Trainer/Attendance/TrainerAttendance';
import TrainerAnnouncements from './Trainer/Announcements/TrainerAnnouncements';
import AvailabilitySettingsPage from './Trainer/Availability/AvailabilitySettingsPage';
import SessionCalendar from './Trainer/Sessions/SessionCalendar';
import UpcomingSessions from './Trainer/Sessions/UpcomingSessions';

// Module: CRM
import CrmLayout from './modules/crm/CrmLayout';
import InquiryForm from './modules/crm/pages/InquiryForm';
import LeadsPipeline from './modules/crm/pages/LeadsPipeline';
import TodayFollowUps from './modules/crm/pages/TodayFollowUps';

// Module: Member
import MemberBookings from './Member/Bookings/MemberBookings';
import MemberCheckIn from './Member/CheckIn/MemberCheckIn';
import MyMembership from './Member/Membership/MyMembership';
import MemberPayments from './Member/Payments/MemberPayments';
import MemberProfile from './Member/Profile/MyProfile';
import MemberWallet from './Member/Wallet/MemberWallet';

// Module: Settings
import {
  SettingsLayout,
  OrganizationSettings,
  BranchManagement,
  RolesPermissions,
  BillingPlans,
  Integrations,
  Notifications,
  PaymentGateway,
  SecuritySettings,
  AuditLogs,
  AmenitySettings
} from './modules/settings';

// Module: Finance
import FinancialDashboard from './modules/finance/pages/FinancialDashboard';
import POS from './modules/finance/pages/POS';
import Invoices from './modules/finance/pages/Invoices';
import Expenses from './modules/finance/pages/Expenses';
import Commissions from './modules/finance/pages/Commissions';
import CashierMode from './modules/finance/pages/CashierMode';
import TransactionsPage from './modules/finance/pages/TransactionsPage';
import PettyCashPage from './modules/finance/pages/PettyCashPage';

// Module: Facility Management
import EquipmentListPage from './modules/operations/pages/EquipmentListPage';
import MaintenanceRequestsPage from './modules/operations/pages/MaintenanceRequestsPage';
import ServiceHistoryPage from './modules/operations/pages/ServiceHistoryPage';

// Module: HR
import Payroll from './modules/hr/pages/Payroll';
import StaffForm from './modules/hr/pages/StaffForm';
import LeaveRequests from './modules/hr/pages/LeaveRequests';

// Module: Branch Admin Reports
import RevenueReport from './pages/branchadmin/reports/RevenueReport';
import MembershipReport from './pages/branchadmin/reports/MembershipReport';
import LeadConversionReport from './pages/branchadmin/reports/LeadConversionReport';
import ExpenseReport from './pages/branchadmin/reports/ExpenseReport';
import BranchPerformanceReport from './pages/branchadmin/reports/BranchPerformanceReport';

// Module: Branch Admin Branch Management
import BranchList from './pages/branchadmin/branch-management/BranchList';

// Module: Settings Expansion
import WebhookSettings from './modules/settings/pages/WebhookSettings';
import ApiKeySettings from './modules/settings/pages/ApiKeySettings';
import MessageTemplates from './modules/settings/pages/MessageTemplates';

import { ROLES } from './config/roles';
import './styles/GlobalDesign.css';

export default function App() {
  const { role: currentRole, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#363636',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            borderRadius: '12px',
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Protect routes: If no role, always redirect to /login */}
        <Route element={currentRole ? <MainLayout role={currentRole} /> : <Navigate to="/login" replace />}>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/dashboard" element={<DashboardDispatcher role={currentRole} />} />

          {/* MODULE: TRAINER (Always registered to avoid Page Not Found issues) */}
          <Route path="/trainer/members/assigned" element={<AssignedMembers />} />
          <Route path="/trainer/profile/me" element={<TrainerProfile />} />
          <Route path="/trainer/earnings" element={<TrainerEarnings />} />
          <Route path="/trainer/attendance" element={<TrainerAttendance />} />
          <Route path="/trainer/announcements" element={<TrainerAnnouncements />} />
          <Route path="/trainer/availability" element={<AvailabilitySettingsPage />} />
          <Route path="/trainer/sessions/calendar" element={<SessionCalendar />} />
          <Route path="/trainer/sessions/upcoming" element={<UpcomingSessions />} />

          {/* MODULE 1: MEMBERSHIPS (restricted) */}
          {(currentRole === ROLES.SUPER_ADMIN || currentRole === ROLES.MANAGER || currentRole === ROLES.BRANCH_ADMIN || currentRole === ROLES.STAFF) && (
            <>
              <Route path="/memberships" element={<MembershipList />} />
              <Route path="/memberships/new" element={<MembershipForm />} />
              <Route path="/memberships/benefits" element={<Benefits />} />
              <Route path="/memberships/benefits-config" element={<BenefitsConfig />} />
              <Route path="/memberships/plans" element={<MembershipPlans />} />
              <Route path="/memberships/requests" element={<FreezeRequests />} />
              <Route path="/memberships/:id" element={<MembershipDetails />} />
              <Route path="/memberships/:id/edit" element={<MembershipForm />} />
              <Route path="/members/renewal-alerts" element={<RenewalAlertsPage />} />
            </>
          )}

          {/* MODULE 3: CLASSES (restricted) */}
          {(currentRole === ROLES.SUPER_ADMIN || currentRole === ROLES.MANAGER || currentRole === ROLES.BRANCH_ADMIN || currentRole === ROLES.TRAINER) && (
            <>
              <Route path="/classes" element={<ClassesList />} />
              <Route path="/classes/new" element={<ClassForm />} />
              <Route path="/classes/:id" element={<ClassDetails />} />
              <Route path="/classes/:id/edit" element={<ClassForm />} />
              <Route path="/classes/:id/assign-trainer" element={<TrainerAssignment />} />
              <Route path="/classes/:id/enroll" element={<MemberEnrollment />} />
            </>
          )}

          {/* SHARED MODULES */}
          <Route path="/diet-plans" element={<DietPlans role={currentRole} />} />
          <Route path="/diet-plans/create" element={<DietPlans role={currentRole} />} />
          <Route path="/diet-plans/*" element={<DietPlans role={currentRole} />} />
          <Route path="/workout-plans/*" element={<WorkoutPlans role={currentRole} />} />
          <Route path="/progress/*" element={<MemberProgress />} />

          {/* MODULE: CRM & SALES */}
          {(currentRole === ROLES.SUPER_ADMIN || currentRole === ROLES.MANAGER || currentRole === ROLES.BRANCH_ADMIN || currentRole === ROLES.STAFF || currentRole === ROLES.TRAINER) && (
            <Route path="/crm" element={<CrmLayout />}>
              <Route path="inquiry" element={(currentRole !== ROLES.TRAINER) ? <InquiryForm /> : <Navigate to="/crm/my-leads" replace />} />
              <Route path="pipeline" element={(currentRole !== ROLES.TRAINER) ? <LeadsPipeline /> : <Navigate to="/crm/my-leads" replace />} />
              <Route path="followups" element={(currentRole !== ROLES.TRAINER) ? <TodayFollowUps /> : <Navigate to="/crm/my-leads" replace />} />
              <Route path="my-leads" element={<LeadsPipeline />} />
            </Route>
          )}

          {/* MODULE: SETTINGS (Isolated for Gym Admin/Manager) */}
          {(currentRole === ROLES.MANAGER || currentRole === ROLES.BRANCH_ADMIN) && (
            <Route path="/settings" element={<SettingsLayout role={currentRole} />}>
              <Route index element={<OrganizationSettings role={currentRole} />} />
              <Route path="branches" element={<BranchManagement />} />
              <Route path="roles" element={<RolesPermissions />} />
              <Route path="billing" element={<BillingPlans />} />
              <Route path="integrations" element={<Integrations />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="payment-gateway" element={<PaymentGateway />} />
              <Route path="security" element={<SecuritySettings role={currentRole} />} />
              <Route path="logs" element={<AuditLogs />} />
              <Route path="webhooks" element={<WebhookSettings />} />
              <Route path="api-keys" element={<ApiKeySettings />} />
              <Route path="templates" element={<MessageTemplates />} />
              <Route path="amenities" element={<AmenitySettings />} />
            </Route>
          )}

          {/* MODULE: OPERATIONS (Manager/Global) */}
          <Route path="/operations" element={<OperationsLayout />}>
            <Route index element={(currentRole !== ROLES.MEMBER) ? <StaffSchedule /> : <Navigate to="/dashboard" replace />} />
            <Route path="equipment" element={(currentRole !== ROLES.MEMBER) ? <EquipmentMaintenance /> : <Navigate to="/dashboard" replace />} />
            <Route path="lockers" element={(currentRole !== ROLES.MEMBER) ? <LockerManagement /> : <Navigate to="/dashboard" replace />} />
            <Route path="inventory" element={(currentRole !== ROLES.MEMBER) ? <Inventory /> : <Navigate to="/dashboard" replace />} />
            <Route path="announcements" element={(currentRole !== ROLES.MEMBER) ? <Announcements /> : <Navigate to="/dashboard" replace />} />
            <Route path="rewards" element={(currentRole !== ROLES.MEMBER) ? <RewardsProgram /> : <Navigate to="/dashboard" replace />} />
            <Route path="feedback" element={<FeedbackSystem role={currentRole} />} />
            <Route path="whatsapp" element={(currentRole !== ROLES.MEMBER) ? <WhatsAppChat /> : <Navigate to="/dashboard" replace />} />
            <Route path="devices" element={(currentRole !== ROLES.MEMBER) ? <Devices /> : <Navigate to="/dashboard" replace />} />
            <Route path="live-monitor" element={(currentRole !== ROLES.MEMBER) ? <LiveCheckInMonitor /> : <Navigate to="/dashboard" replace />} />
          </Route>

          {/* MODULE: FACILITY MANAGEMENT (UI ONLY) */}
          {(currentRole === ROLES.SUPER_ADMIN || currentRole === ROLES.MANAGER || currentRole === ROLES.BRANCH_ADMIN || currentRole === ROLES.STAFF) && (
            <>
              <Route path="/facility/equipment" element={<EquipmentListPage />} />
              <Route path="/facility/maintenance" element={<MaintenanceRequestsPage />} />
              <Route path="/facility/history" element={<ServiceHistoryPage />} />
            </>
          )}

          {/* MODULE: FINANCE (Shared) */}
          {(currentRole !== ROLES.MEMBER && currentRole !== ROLES.TRAINER) && (
            <>
              <Route path="/finance/dashboard" element={<FinancialDashboard />} />
              <Route path="/finance/pos" element={<POS />} />
              <Route path="/finance/invoices" element={<Invoices />} />
              <Route path="/finance/expenses" element={<Expenses />} />
              <Route path="/finance/commissions" element={<Commissions />} />
              <Route path="/finance/cashier" element={<CashierMode />} />
              <Route path="/finance/transactions" element={<TransactionsPage />} />
              <Route path="/finance/petty-cash" element={<PettyCashPage />} />
              <Route path="/staff/payments/collect" element={<CashierMode />} />
              <Route path="/staff/payments/history" element={<TransactionsPage />} />
            </>
          )}

          {/* MODULE: HR (Shared) */}
          <Route path="/hr/payroll" element={<Payroll />} />
          <Route path="/hr/leave-requests" element={<LeaveRequests />} />
          <Route path="/hr/staff/management" element={<StaffManagement role={currentRole} branchId={1} />} />
          <Route path="/hr/staff/create" element={<StaffForm />} />
          <Route path="/hr/staff/edit/:id" element={<StaffForm />} />

          {/* MODULE: SUPERADMIN & SHARED FINANCIALS/HR */}
          {(currentRole === ROLES.SUPER_ADMIN || currentRole === ROLES.MANAGER || currentRole === ROLES.BRANCH_ADMIN) && (
            <>
              <Route path="/superadmin/wallet" element={<WalletList role={currentRole} />} />
              <Route path="/superadmin/trainer-requests" element={<TrainerRequests role={currentRole} />} />
              <Route path="/superadmin/trainer-change-requests" element={<TrainerChangeRequestList role={currentRole} />} />
              <Route path="/superadmin/payroll/create" element={<PayrollCreation role={currentRole} />} />
              <Route path="/superadmin/payroll/history" element={<PayrollHistory role={currentRole} />} />
              <Route path="/superadmin/payroll/history/:employeeId" element={<PayrollHistory role={currentRole} />} />
            </>
          )}

          {/* Superadmin specific list pages */}
          {currentRole === ROLES.SUPER_ADMIN && (
            <>
              <Route path="/superadmin/plans/list" element={<PlansList />} />
              <Route path="/superadmin/plans" element={<Navigate to="/superadmin/plans/list" replace />} />
              <Route path="/superadmin/plans/create" element={<CreatePlan />} />
              <Route path="/superadmin/plans/features" element={<FeatureToggles />} />

              <Route path="/superadmin/gyms/all" element={<AllGyms />} />
              <Route path="/superadmin/gyms" element={<Navigate to="/superadmin/gyms/all" replace />} />
              <Route path="/superadmin/gyms/suspended" element={<SuspendedGyms />} />

              <Route path="/superadmin/subscriptions/active" element={<ActiveSubscriptions />} />
              <Route path="/superadmin/subscriptions/expired" element={<ExpiredSubscriptions />} />

              <Route path="/superadmin/audit-logs/activity" element={<ActivityLogs />} />
              <Route path="/superadmin/audit-logs/webhooks" element={<WebhookLogs />} />

              <Route path="/superadmin/general-settings/general" element={<GeneralSettings />} />
              <Route path="/superadmin/general-settings/invoice" element={<InvoiceSettings />} />
              <Route path="/superadmin/general-settings/hardware" element={<HardwareSettings />} />
              <Route path="/superadmin/general-settings/booking" element={<BookingSettingsPage />} />

              <Route path="/superadmin/profile/me" element={<SuperAdminProfile />} />

              <Route path="/superadmin/store/dashboard" element={<StoreDashboard />} />
              <Route path="/superadmin/store/products" element={<ProductList />} />
              <Route path="/superadmin/store/orders" element={<StoreOrders />} />
              <Route path="/superadmin/store/inventory" element={<StoreInventory />} />
            </>
          )}

          {/* MODULE: BRANCH ADMIN */}
          {currentRole === ROLES.BRANCH_ADMIN && (
            <>
              <Route path="/branchadmin/store/inventory" element={<StoreInventory />} />
              <Route path="/branchadmin/members/list" element={<MemberList />} />
              <Route path="/branchadmin/bookings/calendar" element={<BookingCalendar />} />
              <Route path="/branchadmin/tasks/list" element={<TaskList />} />
              <Route path="/branchadmin/tasks/assign" element={<AssignTask />} />
              <Route path="/branchadmin/reports/daily-attendance" element={<DailyAttendanceReport />} />
              <Route path="/branchadmin/reports/booking" element={<BookingReport />} />
              <Route path="/branchadmin/reports/revenue" element={<RevenueReport />} />
              <Route path="/branchadmin/reports/membership" element={<MembershipReport />} />
              <Route path="/branchadmin/reports/lead-conversion" element={<LeadConversionReport />} />
              <Route path="/branchadmin/reports/expenses" element={<ExpenseReport />} />
              <Route path="/branchadmin/reports/performance" element={<BranchPerformanceReport />} />
              <Route path="/branchadmin/branch-management/branches" element={<BranchList />} />
              <Route path="/branchadmin/trainer-requests" element={<TrainerRequests role={currentRole} />} />

              {/* Reused Settings Routes */}

              <Route element={<SettingsLayout role={currentRole} />}>
                <Route path="/branchadmin/settings/general" element={<GeneralSettings />} />
                <Route path="/branchadmin/settings/hardware" element={<HardwareSettings />} />
                <Route path="/branchadmin/settings/communication" element={<Notifications />} />
                <Route path="/branchadmin/settings/payments" element={<PaymentGateway />} />
                <Route path="/branchadmin/settings/invoice" element={<InvoiceSettings />} />
              </Route>
              <Route path="/branchadmin/profile/me" element={<BranchAdminProfile />} />
            </>
          )}

          {/* MODULE: MANAGER */}
          {currentRole === ROLES.MANAGER && (
            <>
              <Route path="/manager/attendance/live-checkin" element={<LiveCheckInMonitor />} />
              <Route path="/manager/attendance/today/member" element={<MemberLog />} />
              <Route path="/manager/attendance/today/staff" element={<StaffLog />} />
              <Route path="/manager/reports/daily-attendance" element={<DailyAttendanceReport />} />
              <Route path="/manager/reports/booking" element={<BookingReport />} />
              <Route path="/manager/bookings/calendar" element={<BookingCalendar />} />
              <Route path="/manager/tasks" element={<TaskList />} />
              <Route path="/manager/tasks/list" element={<TaskList />} />
              <Route path="/manager/tasks/assign" element={<AssignTask />} />
              <Route path="/manager/communication" element={<CommunicationPage />} />
              <Route path="/manager/requests" element={<TrainerRequests role={currentRole} />} />
              <Route path="/manager/change-requests" element={<TrainerChangeRequestList role={currentRole} />} />
              <Route path="/manager/wallet" element={<WalletList role={currentRole} />} />
              <Route path="/manager/payroll/create" element={<PayrollCreation role={currentRole} />} />
              <Route path="/manager/members/list" element={<MemberList />} />
              <Route path="/manager/profile/me" element={<ManagerProfile />} />
            </>
          )}

          {/* MODULE: STAFF */}
          {currentRole === ROLES.STAFF && (
            <>
              <Route path="/staff/attendance/check-in" element={<StaffCheckIn />} />
              <Route path="/staff/attendance/check-out" element={<CheckOut />} />
              <Route path="/staff/attendance/today" element={<TodaysCheckIns />} />
              <Route path="/staff/lockers" element={<LockerManagement />} />
              <Route path="/staff/lockers/assign" element={<AssignLocker />} />
              <Route path="/staff/lockers/release" element={<ReleaseLocker />} />
              <Route path="/staff/tasks/my-tasks" element={<MyTasks />} />
              <Route path="/staff/tasks/status" element={<StaffTaskStatus />} />
              <Route path="/staff/members/list" element={<MemberList />} />
              <Route path="/staff/profile/me" element={<StaffProfile />} />
            </>
          )}

          {/* MODULE: MEMBER */}

          {/* MODULE: MEMBER */}
          {currentRole === ROLES.MEMBER && (
            <>
              <Route path="/member/bookings" element={<MemberBookings />} />
              <Route path="/member/check-in" element={<MemberCheckIn />} />
              <Route path="/member/store" element={<StorePage />} />
              <Route path="/member/membership" element={<MyMembership />} />
              <Route path="/member/payments" element={<MemberPayments />} />
              <Route path="/member/profile/me" element={<MemberProfile />} />
              <Route path="/member/wallet" element={<MemberWallet />} />
              <Route path="/member/feedback" element={<FeedbackSystem role={currentRole} />} />
            </>
          )}

          <Route path="*" element={<div className="p-10"><h1>Page Not Found</h1></div>} />
        </Route>
      </Routes>
    </>
  );
}
