import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import MainLayout from '../layout/MainLayout';
import AdminApiConsolePage from '../pages/AdminApiConsolePage';
import EnumLookupTablesPage from '../pages/EnumLookupTablesPage';
import BranchesPage from '../pages/BranchesPage';
import CompaniesPage from '../pages/CompaniesPage';
import DashboardConfigPage from '../pages/DashboardConfigPage';
import DashboardPage from '../pages/DashboardPage';
import DepartmentsPage from '../pages/DepartmentsPage';
import EmployeeGradePage from '../pages/employee_hr_management/employee_grade/EmployeeGradePage';
import EmployeeViewDetailsPage from '../pages/employee_hr_management/employee/EmployeeViewDetailsPage';
import EmployeeDetailsPage from '../pages/employee_hr_management/employee/EmployeeDetailsPage';
import EmployeeSkillPage from '../pages/employee_hr_management/employee_skill/EmployeeSkillPage';
import EmployeeTrainingPage from '../pages/employee_hr_management/employee_training/EmployeeTrainingPage';
import AttendancePage from '../pages/employee_hr_management/attendance/AttendancePage';
import OvertimeRequestPage from '../pages/employee_hr_management/overtime_request/OvertimeRequestPage';
import LeaveTypePage from '../pages/employee_hr_management/leave_type/LeaveTypePage';
import LeaveApplicationPage from '../pages/employee_hr_management/leave_application/LeaveApplicationPage';
import RationPolicyPage from '../pages/employee_hr_management/ration_policy/RationPolicyPage';
import RationDistributionPage from '../pages/employee_hr_management/ration_distribution/RationDistributionPage';
import EmployeeAdvancePage from '../pages/employee_hr_management/employee_advance/EmployeeAdvancePage';
import PayrollPage from '../pages/employee_hr_management/payroll/PayrollPage';
import PayrollDeductionPage from '../pages/employee_hr_management/payroll_deduction/PayrollDeductionPage';
import LoginPage from '../pages/LoginPage';
import ProjectsPage from '../pages/ProjectsPage';
import WorkshopsPage from '../pages/WorkshopsPage';
import ProfileSettingsPage from '../pages/ProfileSettingsPage';
import PermissionPage from '../pages/role_permission_system/permission/PermissionPage';
import RoleHierarchyPage from '../pages/role_permission_system/role_hierarchy/RoleHierarchyPage';
import RolePage from '../pages/role_permission_system/role/RolePage';
import RolePermissionPage from '../pages/role_permission_system/role_permission/RolePermissionPage';
import RoleServicePermissionPage from '../pages/role_permission_system/role_service_permission/RoleServicePermissionPage';
import SystemModulePage from '../pages/role_permission_system/system_module/SystemModulePage';
import SystemServicePage from '../pages/role_permission_system/system_service/SystemServicePage';
import UserDataScopePage from '../pages/role_permission_system/user_data_scope/UserDataScopePage';
import UserPermissionPage from '../pages/role_permission_system/user_permission/UserPermissionPage';
import UserRolePage from '../pages/role_permission_system/user_role/UserRolePage';
import UserServiceAccessPage from '../pages/role_permission_system/user_service_acces/UserServiceAccessPage';
import AppUserPage from '../pages/role_permission_system/app_user/AppUserPage';
import UserSessionPage from '../pages/role_permission_system/user_session/UserSessionPage';
import LoginHistoryPage from '../pages/role_permission_system/login_history/LoginHistoryPage';
import UserHistoryPage from '../pages/role_permission_system/user_history/UserHistoryPage';
import VehicleDetailsPage from '../pages/VehicleDetailsPage';
import VehicleCategoryPage from '../pages/vehicle_management/vehicle_category/VehicleCategoryPage';
import VehicleTypePage from '../pages/vehicle_management/vehicle_type/VehicleTypePage';
import VehicleManufacturerPage from '../pages/vehicle_management/vehicle_manufacturer/VehicleManufacturerPage';
import DistributorPage from '../pages/vehicle_management/distributor/DistributorPage';
import ManufacturerCategoryPage from '../pages/vehicle_management/manufacturer_category/ManufacturerCategoryPage';
import VehicleModelPage from '../pages/vehicle_management/vehicle_model/VehicleModelPage';
import VehicleModelVariantPage from '../pages/vehicle_management/vehicle_model_variant/VehicleModelVariantPage';
import CompanyVehiclePage from '../pages/vehicle_management/company_vehicle/CompanyVehiclePage';
import CompanyVehicleQrDetailsPage from '../pages/vehicle_management/company_vehicle/CompanyVehicleQrDetailsPage';
import HiredVehiclePage from '../pages/vehicle_management/hired_vehicle/HiredVehiclePage';
import HiredVehicleIdTypePage from '../pages/vehicle_management/hired_vehicle_id_type/HiredVehicleIdTypePage';
import CompanyVehicleIdTypePage from '../pages/vehicle_management/company_vehicle_id_type/CompanyVehicleIdTypePage';
import VehicleDailyActivityPage from '../pages/vehicle_management/vehicle_daily_activity/VehicleDailyActivityPage';
import VehicleRunningLogPage from '../pages/vehicle_management/vehicle_running_log/VehicleRunningLogPage';
import VehicleDailySummaryPage from '../pages/vehicle_management/vehicle_daily_summary/VehicleDailySummaryPage';
import VehicleOperatingCostPage from '../pages/vehicle_management/vehicle_operating_cost/VehicleOperatingCostPage';
import VehicleTransferPage from '../pages/vehicle_management/vehicle_transfer/VehicleTransferPage';
import MaintenanceManagementPage from '../pages/vehicle_management/MaintenanceManagementPage';
import BreakdownRecordPage from '../pages/vehicle_management/breakdown_record/BreakdownRecordPage';
import MaintenanceAssignmentPage from '../pages/vehicle_management/maintenance_assignment/MaintenanceAssignmentPage';
import MaintenancePlanPage from '../pages/vehicle_management/maintenance_plan/MaintenancePlanPage';
import MaintenancePlanItemPage from '../pages/vehicle_management/maintenance_plan_item/MaintenancePlanItemPage';
import MaintenanceProgramPage from '../pages/vehicle_management/maintenance_program/MaintenanceProgramPage';
import MaintenanceProgramTemplatePage from '../pages/vehicle_management/maintenance_program_template/MaintenanceProgramTemplatePage';
import MaintenanceRecordPage from '../pages/vehicle_management/maintenance_record/MaintenanceRecordPage';
import MaintenanceSchedulePage from '../pages/vehicle_management/maintenance_schedule/MaintenanceSchedulePage';
import MaintenanceStandardPage from '../pages/vehicle_management/maintenance_standard/MaintenanceStandardPage';
import MaintenanceStrategyPage from '../pages/vehicle_management/maintenance_strategy/MaintenanceStrategyPage';
import RepairJobPage from '../pages/vehicle_management/repair_job/RepairJobPage';
import VehicleMaintenanceProgramPage from '../pages/vehicle_management/vehicle_maintenance_program/VehicleMaintenanceProgramPage';
import VehicleMaintenanceProgramAssignmentPage from '../pages/vehicle_management/vehicle_maintenance_program_assignment/VehicleMaintenanceProgramAssignmentPage';
import VehicleFilterTypePage from '../pages/vehicle_management/vehicle_filter_type/VehicleFilterTypePage';
import VehicleFilterPage from '../pages/vehicle_management/vehicle_filter/VehicleFilterPage';
import SupplierManagementPage from '../pages/supplier_management/SupplierManagementPage';
import VehicleReportDashboardPage from '../pages/vehicle_reports/VehicleReportDashboardPage';
import VehicleLicenseReportPage from '../pages/vehicle_reports/VehicleLicenseReportPage';
import VehicleInsuranceReportPage from '../pages/vehicle_reports/VehicleInsuranceReportPage';
import VehicleFitnessReportPage from '../pages/vehicle_reports/VehicleFitnessReportPage';
import VehicleEmissionReportPage from '../pages/vehicle_reports/VehicleEmissionReportPage';
import CompanyWiseVehicleReportPage from '../pages/vehicle_reports/CompanyWiseVehicleReportPage';
import ProjectWiseVehicleReportPage from '../pages/vehicle_reports/ProjectWiseVehicleReportPage';
import VehicleRunningDetailReportPage from '../pages/vehicle_reports/VehicleRunningDetailReportPage';
import VehicleAbnormalDetectionReportPage from '../pages/vehicle_reports/VehicleAbnormalDetectionReportPage';
import { useAuth } from './AuthContext';

function AdminOnly({ children }) {
  const { auth } = useAuth();
  if (!(auth?.superAdmin || auth?.companyAdmin)) return <Navigate to="/" replace />;
  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="*"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/companies" element={<CompaniesPage />} />
                <Route path="/branches" element={<BranchesPage />} />
                <Route path="/departments" element={<DepartmentsPage />} />
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/workshops" element={<WorkshopsPage />} />
                <Route path="/employee-grades" element={<EmployeeGradePage />} />
                <Route path="/employee-view-details" element={<EmployeeViewDetailsPage />} />
                <Route path="/employees" element={<EmployeeDetailsPage />} />
                <Route path="/employee-skills" element={<EmployeeSkillPage />} />
                <Route path="/employee-trainings" element={<EmployeeTrainingPage />} />
                <Route path="/attendances" element={<AttendancePage />} />
                <Route path="/overtime-requests" element={<OvertimeRequestPage />} />
                <Route path="/leave-types" element={<LeaveTypePage />} />
                <Route path="/leave-applications" element={<LeaveApplicationPage />} />
                <Route path="/ration-policies" element={<RationPolicyPage />} />
                <Route path="/ration-distributions" element={<RationDistributionPage />} />
                <Route path="/employee-advances" element={<EmployeeAdvancePage />} />
                <Route path="/payrolls" element={<PayrollPage />} />
                <Route path="/payroll-deductions" element={<PayrollDeductionPage />} />
                <Route path="/system-modules" element={<AdminOnly><SystemModulePage /></AdminOnly>} />
                <Route path="/permissions" element={<AdminOnly><PermissionPage /></AdminOnly>} />
                <Route path="/roles" element={<AdminOnly><RolePage /></AdminOnly>} />
                <Route path="/role-permissions" element={<AdminOnly><RolePermissionPage /></AdminOnly>} />
                <Route path="/role-service-permissions" element={<AdminOnly><RoleServicePermissionPage /></AdminOnly>} />
                <Route path="/role-hierarchies" element={<AdminOnly><RoleHierarchyPage /></AdminOnly>} />
                <Route path="/user-roles" element={<AdminOnly><UserRolePage /></AdminOnly>} />
                <Route path="/user-permissions" element={<AdminOnly><UserPermissionPage /></AdminOnly>} />
                <Route path="/user-service-access" element={<AdminOnly><UserServiceAccessPage /></AdminOnly>} />
                <Route path="/user-data-scopes" element={<AdminOnly><UserDataScopePage /></AdminOnly>} />
                <Route path="/app-users" element={<AdminOnly><AppUserPage /></AdminOnly>} />
                <Route path="/user-sessions" element={<AdminOnly><UserSessionPage /></AdminOnly>} />
                <Route path="/login-histories" element={<AdminOnly><LoginHistoryPage /></AdminOnly>} />
                <Route path="/user-histories" element={<AdminOnly><UserHistoryPage /></AdminOnly>} />
                <Route path="/system-services" element={<AdminOnly><SystemServicePage /></AdminOnly>} />
                <Route path="/vehicles" element={<VehicleDetailsPage />} />
                <Route path="/vehicle-categories" element={<VehicleCategoryPage />} />
                <Route path="/vehicle-types" element={<VehicleTypePage />} />
                <Route path="/vehicle-manufacturers" element={<VehicleManufacturerPage />} />
                <Route path="/distributors" element={<DistributorPage />} />
                <Route path="/manufacturer-categories" element={<ManufacturerCategoryPage />} />
                <Route path="/vehicle-models" element={<VehicleModelPage />} />
                <Route path="/vehicle-model-variants" element={<VehicleModelVariantPage />} />
                <Route path="/company-vehicles" element={<CompanyVehiclePage />} />
                <Route path="/vehicle-qr-details" element={<CompanyVehicleQrDetailsPage />} />
                <Route path="/hired-vehicles" element={<HiredVehiclePage />} />
                <Route path="/hired-vehicle-types" element={<HiredVehicleIdTypePage />} />
                <Route path="/company-vehicle-types" element={<CompanyVehicleIdTypePage />} />
                <Route path="/vehicle-daily-activities" element={<VehicleDailyActivityPage />} />
                <Route path="/vehicle-running-logs" element={<VehicleRunningLogPage />} />
                <Route path="/vehicle-daily-summaries" element={<VehicleDailySummaryPage />} />
                <Route path="/vehicle-operating-costs" element={<VehicleOperatingCostPage />} />
                <Route path="/vehicle-transfers" element={<VehicleTransferPage />} />
                <Route path="/maintenance-management" element={<MaintenanceManagementPage />} />
                <Route path="/breakdown-records" element={<BreakdownRecordPage />} />
                <Route path="/maintenance-assignments" element={<MaintenanceAssignmentPage />} />
                <Route path="/maintenance-plans" element={<MaintenancePlanPage />} />
                <Route path="/maintenance-plan-items" element={<MaintenancePlanItemPage />} />
                <Route path="/maintenance-programs" element={<MaintenanceProgramPage />} />
                <Route path="/maintenance-program-templates" element={<MaintenanceProgramTemplatePage />} />
                <Route path="/maintenance-records" element={<MaintenanceRecordPage />} />
                <Route path="/maintenance-schedules" element={<MaintenanceSchedulePage />} />
                <Route path="/maintenance-standards" element={<MaintenanceStandardPage />} />
                <Route path="/maintenance-strategies" element={<MaintenanceStrategyPage />} />
                <Route path="/repair-jobs" element={<RepairJobPage />} />
                <Route path="/vehicle-maintenance-programs" element={<VehicleMaintenanceProgramPage />} />
                <Route path="/vehicle-maintenance-program-assignments" element={<VehicleMaintenanceProgramAssignmentPage />} />
                <Route path="/vehicle-filter-types" element={<VehicleFilterTypePage />} />
                <Route path="/vehicle-filters" element={<VehicleFilterPage />} />
                <Route path="/suppliers" element={<SupplierManagementPage />} />
                <Route path="/suppliers/details" element={<SupplierManagementPage />} />
                <Route path="/vehicle-reports/dashboard" element={<VehicleReportDashboardPage />} />
                <Route path="/vehicle-reports/license" element={<VehicleLicenseReportPage />} />
                <Route path="/vehicle-reports/insurance" element={<VehicleInsuranceReportPage />} />
                <Route path="/vehicle-reports/fitness" element={<VehicleFitnessReportPage />} />
                <Route path="/vehicle-reports/emission" element={<VehicleEmissionReportPage />} />
                <Route path="/vehicle-reports/company-wise" element={<CompanyWiseVehicleReportPage />} />
                <Route path="/vehicle-reports/project-wise" element={<ProjectWiseVehicleReportPage />} />
                <Route path="/vehicle-reports/location-wise" element={<ProjectWiseVehicleReportPage />} />
                <Route path="/vehicle-reports/running-details" element={<VehicleRunningDetailReportPage />} />
                <Route path="/vehicle-reports/abnormal-detections" element={<VehicleAbnormalDetectionReportPage />} />
                <Route path="/dashboard-config" element={<AdminOnly><DashboardConfigPage /></AdminOnly>} />
                <Route path="/admin-console" element={<AdminOnly><AdminApiConsolePage /></AdminOnly>} />
                <Route path="/enum-lookup-tables" element={<AdminOnly><EnumLookupTablesPage /></AdminOnly>} />
                <Route path="/profile-settings" element={<ProfileSettingsPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </MainLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
