import BuildCircleRoundedIcon from '@mui/icons-material/BuildCircleRounded';
import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import CrudEntityPage from '../../organization/shared/CrudEntityPage';
import { useAuth } from '../../../app/AuthContext';
import { maintenanceScheduleService } from '../../../services/vehicle_management/maintenance_schedule/maintenanceScheduleService';
import { getOwnCompanyPrefill, opt, req, rowsFrom, toBool, toDecimal, toInt } from '../../employee_hr_management/shared/hrCrudCommon';
import { organizationService } from '../../../services/organizationService';
import { vehicleService } from '../../../services/vehicle_management/vehicle/vehicleService';
import { employeeService } from '../../../services/employee_hr_management/employee/employeeService';
import { maintenanceStandardService } from '../../../services/vehicle_management/maintenance_standard/maintenanceStandardService';

export default function MaintenanceSchedulePage() {
  const theme = useTheme();
  const { token, auth } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [maintenanceStandardRows, setMaintenanceStandardRows] = useState([]);
  const [statusEnums, setStatusEnums] = useState([]);

  useEffect(() => {
    (async () => {
      if (!token) return;
      const settled = await Promise.allSettled([organizationService.listCompanies(token, { activeOnly: true }), vehicleService.list(token, {}), employeeService.listEmployees(token, { sortBy: 'firstName', sortDir: 'asc' }), maintenanceStandardService.list(token, {}), organizationService.enumValues('maintenance_schedule_status', { locale: 'en-US', activeOnly: true })]);
      try {
        const getVal = (i) => (settled[i]?.status === 'fulfilled' ? settled[i].value : null);
        setCompanies(rowsFrom(getVal(0)).map((c) => ({ id: c.companyId, code: c.companyCode, name: c.companyName })));
        setVehicles(rowsFrom(getVal(1)));
        setEmployees(rowsFrom(getVal(2)).map((e) => ({ ...e, displayName: [e.employeeCode || '-', [e.firstName || '', e.lastName || ''].join(' ').trim() || e.employeeName || e.employeeId].join(' - ') })));
        setMaintenanceStandardRows(rowsFrom(getVal(3)));
        setStatusEnums(rowsFrom(getVal(4)));
      } catch {
        setCompanies([]); setVehicles([]); setEmployees([]);
        setMaintenanceStandardRows([]);
        setStatusEnums([]);
      }
    })();
  }, [token]);

  const own = useMemo(() => getOwnCompanyPrefill(auth, companies), [auth, companies]);
  const companyById = useMemo(() => Object.fromEntries(companies.map((c) => [String(c.id), c])), [companies]);
  const companyOpts = useMemo(() => [{ value: '', label: 'All Companies' }, ...companies.map((c) => ({ value: String(c.id), label: `${c.name} (${c.code})` }))], [companies]);
  const companyFormOpts = useMemo(() => [{ value: '', label: 'Select Company' }, ...companies.map((c) => ({ value: String(c.id), label: `${c.name} (${c.code})` }))], [companies]);
  const vehicleLabelById = useMemo(() => Object.fromEntries(vehicles.map((v) => [String(v.vehicleId), `${v.vehicleCode || '-'} | ${v.registrationNumber || '-'}`])), [vehicles]);
  const vehicleOptsByCompany = useMemo(() => { const m = {}; vehicles.forEach((v) => { const k = String(v.companyId || ''); (m[k] ??= []).push({ value: String(v.vehicleId), label: vehicleLabelById[String(v.vehicleId)] }); }); return m; }, [vehicles, vehicleLabelById]);
  const employeeLabelById = useMemo(() => Object.fromEntries(employees.map((e) => [String(e.employeeId), e.displayName])), [employees]);
  const employeeOptsByCompany = useMemo(() => { const m = {}; employees.forEach((e) => { const k = String(e.companyId || ''); (m[k] ??= []).push({ value: String(e.employeeId), label: e.displayName }); }); return m; }, [employees]);
  const maintenanceStandardLabelById = useMemo(() => Object.fromEntries(maintenanceStandardRows.map((r) => [String(r.standardId), String(r.name || r.standardId)])), [maintenanceStandardRows]);
  const maintenanceStandardOpts = useMemo(() => [{ value: '', label: 'All Maintenance Standards' }, ...maintenanceStandardRows.map((r) => ({ value: String(r.standardId), label: String(r.name || r.standardId) }))], [maintenanceStandardRows]);
  const maintenanceStandardFormOpts = useMemo(() => [{ value: '', label: 'Select Maintenance Standard' }, ...maintenanceStandardRows.map((r) => ({ value: String(r.standardId), label: String(r.name || r.standardId) }))], [maintenanceStandardRows]);
  const statusEnumById = useMemo(() => Object.fromEntries(statusEnums.map((x) => [String(x.id), x.name])), [statusEnums]);
  const statusEnumOpts = useMemo(() => [{ value: '', label: 'All Status' }, ...statusEnums.map((x) => ({ value: String(x.id), label: x.name }))], [statusEnums]);
  const statusEnumFormOpts = useMemo(() => [{ value: '', label: 'Select Status' }, ...statusEnums.map((x) => ({ value: String(x.id), label: x.name }))], [statusEnums]);

  return (
    <CrudEntityPage
      title="Maintenance Schedules"
      icon={<BuildCircleRoundedIcon sx={{ color: '#fff', fontSize: 20 }} />}
      gradient={`linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`}
      idKey="scheduleId"
      prefillForm={own}
      prefillFilters={own ? { companyId: own.companyId } : null}
      columns={[{ key: 'companyId', label: 'Company Id', render: (r) => companyById[String(r.companyId)]?.name || r.companyCode || '-' }, { key: 'vehicleId', label: 'Vehicle Id', render: (r) => vehicleLabelById[String(r.vehicleId)] || '-' }, { key: 'standardId', label: 'Standard Id', render: (r) => maintenanceStandardLabelById[String(r.standardId)] || '-' }, { key: 'scheduledDate', label: 'Scheduled Date' }, { key: 'scheduledOdometerKm', label: 'Scheduled Odometer Km' }, { key: 'scheduledEngineHours', label: 'Scheduled Engine Hours' }]}
      filterFields={[{ key: 'companyId', label: 'Company Id', type: 'autocomplete', options: companyOpts }, { key: 'vehicleId', label: 'Vehicle Id', type: 'autocomplete', optionsByForm: (f) => [{ value: '', label: 'All Vehicles' }, ...(vehicleOptsByCompany[String(f?.companyId || '')] || [])] }, { key: 'standardId', label: 'Standard Id', type: 'autocomplete', options: maintenanceStandardOpts }, { key: 'scheduledDate', label: 'Scheduled Date', type: 'date' }, { key: 'aiPredictedDate', label: 'Ai Predicted Date', type: 'date' }, { key: 'statusId', label: 'Status Id', type: 'autocomplete', options: statusEnumOpts }]}
      formFields={[{ key: 'companyId', label: 'Company Id', type: 'autocomplete', options: companyFormOpts, readonlyOnEdit: true }, { key: 'companyCode', label: 'Company Code', readOnly: true }, { key: 'vehicleId', label: 'Vehicle Id', type: 'autocomplete', optionsByForm: (f) => [{ value: '', label: 'Select Vehicle' }, ...(vehicleOptsByCompany[String(f?.companyId || '')] || [])] }, { key: 'standardId', label: 'Standard Id', type: 'autocomplete', options: maintenanceStandardFormOpts }, { key: 'scheduledDate', label: 'Scheduled Date', type: 'date' }, { key: 'scheduledOdometerKm', label: 'Scheduled Odometer Km', type: 'number' }, { key: 'scheduledEngineHours', label: 'Scheduled Engine Hours', type: 'number' }, { key: 'aiPredictedDate', label: 'Ai Predicted Date', type: 'date' }, { key: 'predictionConfidence', label: 'Prediction Confidence', type: 'number' }, { key: 'statusId', label: 'Status Id', type: 'autocomplete', options: statusEnumFormOpts }, { key: 'notificationSent', label: 'Notification Sent', type: 'boolean' }, { key: 'notificationSentDate', label: 'Notification Sent Date (ISO Timestamp)' }, { key: 'reminderCount', label: 'Reminder Count', type: 'number' }, { key: 'createdBy', label: 'Created By', type: 'autocomplete', optionsByForm: (f) => [{ value: '', label: 'Select Employee' }, ...(employeeOptsByCompany[String(f?.companyId || '')] || [])] }]}
      defaultFilters={{"companyId":"","vehicleId":"","standardId":"","scheduledDate":"","aiPredictedDate":"","statusId":"","sortBy":"createdAt","sortDir":"desc"}}
      emptyForm={{"companyId":"","companyCode":"","vehicleId":"","standardId":"","scheduledDate":"","scheduledOdometerKm":"","scheduledEngineHours":"","aiPredictedDate":"","predictionConfidence":"","statusId":"","notificationSent":"","notificationSentDate":"","reminderCount":"","createdBy":""}}
      normalizePayload={(f) => ({ companyId: opt(f.companyId), companyCode: req(f.companyCode), vehicleId: opt(f.vehicleId), standardId: opt(f.standardId), scheduledDate: opt(f.scheduledDate), scheduledOdometerKm: toDecimal(f.scheduledOdometerKm), scheduledEngineHours: toDecimal(f.scheduledEngineHours), aiPredictedDate: opt(f.aiPredictedDate), predictionConfidence: toDecimal(f.predictionConfidence), statusId: toInt(f.statusId), notificationSent: toBool(f.notificationSent), notificationSentDate: opt(f.notificationSentDate), reminderCount: toInt(f.reminderCount), createdBy: opt(f.createdBy) })}
      onFormFieldChange={(n, k, v) => (k === 'companyId' ? { ...n, companyCode: companyById[String(v)]?.code || '', vehicleId: '', createdBy: '' } : n)}
      mapRecordToForm={(r) => ({ ...{"companyId":"","companyCode":"","vehicleId":"","standardId":"","scheduledDate":"","scheduledOdometerKm":"","scheduledEngineHours":"","aiPredictedDate":"","predictionConfidence":"","statusId":"","notificationSent":"","notificationSentDate":"","reminderCount":"","createdBy":""}, ...(r || {}) })}
      listFetcher={maintenanceScheduleService.list}
      getByIdFetcher={maintenanceScheduleService.getById}
      createFetcher={maintenanceScheduleService.create}
      updateFetcher={maintenanceScheduleService.update}
      deleteFetcher={maintenanceScheduleService.delete}
      autoSearch
      autoSearchDebounceMs={350}
      fitViewport
      viewportOffset={190}
    />
  );
}
