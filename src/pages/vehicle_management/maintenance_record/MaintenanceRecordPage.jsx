import BuildCircleRoundedIcon from '@mui/icons-material/BuildCircleRounded';
import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import CrudEntityPage from '../../organization/shared/CrudEntityPage';
import { useAuth } from '../../../app/AuthContext';
import { maintenanceRecordService } from '../../../services/vehicle_management/maintenance_record/maintenanceRecordService';
import { getOwnCompanyPrefill, opt, req, rowsFrom, toBool, toDecimal, toInt } from '../../employee_hr_management/shared/hrCrudCommon';
import { organizationService } from '../../../services/organizationService';
import { vehicleService } from '../../../services/vehicle_management/vehicle/vehicleService';
import { employeeService } from '../../../services/employee_hr_management/employee/employeeService';
import { maintenanceScheduleService } from '../../../services/vehicle_management/maintenance_schedule/maintenanceScheduleService';
import { breakdownRecordService } from '../../../services/vehicle_management/breakdown_record/breakdownRecordService';
import { maintenanceStandardService } from '../../../services/vehicle_management/maintenance_standard/maintenanceStandardService';

export default function MaintenanceRecordPage() {
  const theme = useTheme();
  const { token, auth } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [maintenanceScheduleRows, setMaintenanceScheduleRows] = useState([]);
  const [breakdownRecordRows, setBreakdownRecordRows] = useState([]);
  const [maintenanceStandardRows, setMaintenanceStandardRows] = useState([]);
  const [statusEnums, setStatusEnums] = useState([]);

  useEffect(() => {
    (async () => {
      if (!token) return;
      const settled = await Promise.allSettled([organizationService.listCompanies(token, { activeOnly: true }), vehicleService.list(token, {}), employeeService.listEmployees(token, { sortBy: 'firstName', sortDir: 'asc' }), maintenanceScheduleService.list(token, {}), breakdownRecordService.list(token, {}), maintenanceStandardService.list(token, {}), organizationService.enumValues('maintenance_record_status', { locale: 'en-US', activeOnly: true })]);
      try {
        const getVal = (i) => (settled[i]?.status === 'fulfilled' ? settled[i].value : null);
        setCompanies(rowsFrom(getVal(0)).map((c) => ({ id: c.companyId, code: c.companyCode, name: c.companyName })));
        setVehicles(rowsFrom(getVal(1)));
        setEmployees(rowsFrom(getVal(2)).map((e) => ({ ...e, displayName: [e.employeeCode || '-', [e.firstName || '', e.lastName || ''].join(' ').trim() || e.employeeName || e.employeeId].join(' - ') })));
        setMaintenanceScheduleRows(rowsFrom(getVal(3)));
        setBreakdownRecordRows(rowsFrom(getVal(4)));
        setMaintenanceStandardRows(rowsFrom(getVal(5)));
        setStatusEnums(rowsFrom(getVal(6)));
      } catch {
        setCompanies([]); setVehicles([]); setEmployees([]);
        setMaintenanceScheduleRows([]); setBreakdownRecordRows([]); setMaintenanceStandardRows([]);
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
  const maintenanceScheduleLabelById = useMemo(() => Object.fromEntries(maintenanceScheduleRows.map((r) => [String(r.scheduleId), String(r.scheduleId || r.scheduleId)])), [maintenanceScheduleRows]);
  const maintenanceScheduleOpts = useMemo(() => [{ value: '', label: 'All Maintenance Schedules' }, ...maintenanceScheduleRows.map((r) => ({ value: String(r.scheduleId), label: String(r.scheduleId || r.scheduleId) }))], [maintenanceScheduleRows]);
  const maintenanceScheduleFormOpts = useMemo(() => [{ value: '', label: 'Select Maintenance Schedule' }, ...maintenanceScheduleRows.map((r) => ({ value: String(r.scheduleId), label: String(r.scheduleId || r.scheduleId) }))], [maintenanceScheduleRows]);
  const breakdownRecordLabelById = useMemo(() => Object.fromEntries(breakdownRecordRows.map((r) => [String(r.breakdownId), String(r.breakdownId || r.breakdownId)])), [breakdownRecordRows]);
  const breakdownRecordOpts = useMemo(() => [{ value: '', label: 'All Breakdown Records' }, ...breakdownRecordRows.map((r) => ({ value: String(r.breakdownId), label: String(r.breakdownId || r.breakdownId) }))], [breakdownRecordRows]);
  const breakdownRecordFormOpts = useMemo(() => [{ value: '', label: 'Select Breakdown Record' }, ...breakdownRecordRows.map((r) => ({ value: String(r.breakdownId), label: String(r.breakdownId || r.breakdownId) }))], [breakdownRecordRows]);
  const maintenanceStandardLabelById = useMemo(() => Object.fromEntries(maintenanceStandardRows.map((r) => [String(r.standardId), String(r.name || r.standardId)])), [maintenanceStandardRows]);
  const maintenanceStandardOpts = useMemo(() => [{ value: '', label: 'All Maintenance Standards' }, ...maintenanceStandardRows.map((r) => ({ value: String(r.standardId), label: String(r.name || r.standardId) }))], [maintenanceStandardRows]);
  const maintenanceStandardFormOpts = useMemo(() => [{ value: '', label: 'Select Maintenance Standard' }, ...maintenanceStandardRows.map((r) => ({ value: String(r.standardId), label: String(r.name || r.standardId) }))], [maintenanceStandardRows]);
  const statusEnumById = useMemo(() => Object.fromEntries(statusEnums.map((x) => [String(x.id), x.name])), [statusEnums]);
  const statusEnumOpts = useMemo(() => [{ value: '', label: 'All Status' }, ...statusEnums.map((x) => ({ value: String(x.id), label: x.name }))], [statusEnums]);
  const statusEnumFormOpts = useMemo(() => [{ value: '', label: 'Select Status' }, ...statusEnums.map((x) => ({ value: String(x.id), label: x.name }))], [statusEnums]);

  return (
    <CrudEntityPage
      title="Maintenance Records"
      icon={<BuildCircleRoundedIcon sx={{ color: '#fff', fontSize: 20 }} />}
      gradient={`linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`}
      idKey="maintenanceId"
      prefillForm={own}
      prefillFilters={own ? { companyId: own.companyId } : null}
      columns={[{ key: 'companyId', label: 'Company Id', render: (r) => companyById[String(r.companyId)]?.name || r.companyCode || '-' }, { key: 'vehicleId', label: 'Vehicle Id', render: (r) => vehicleLabelById[String(r.vehicleId)] || '-' }, { key: 'scheduleId', label: 'Schedule Id', render: (r) => maintenanceScheduleLabelById[String(r.scheduleId)] || '-' }, { key: 'breakdownId', label: 'Breakdown Id', render: (r) => breakdownRecordLabelById[String(r.breakdownId)] || '-' }, { key: 'standardId', label: 'Standard Id', render: (r) => maintenanceStandardLabelById[String(r.standardId)] || '-' }, { key: 'startTime', label: 'Start Time' }]}
      filterFields={[{ key: 'companyId', label: 'Company Id', type: 'autocomplete', options: companyOpts }, { key: 'vehicleId', label: 'Vehicle Id', type: 'autocomplete', optionsByForm: (f) => [{ value: '', label: 'All Vehicles' }, ...(vehicleOptsByCompany[String(f?.companyId || '')] || [])] }, { key: 'scheduleId', label: 'Schedule Id', type: 'autocomplete', options: maintenanceScheduleOpts }, { key: 'breakdownId', label: 'Breakdown Id', type: 'autocomplete', options: breakdownRecordOpts }, { key: 'standardId', label: 'Standard Id', type: 'autocomplete', options: maintenanceStandardOpts }, { key: 'nextServiceDate', label: 'Next Service Date', type: 'date' }]}
      formFields={[{ key: 'companyId', label: 'Company Id', type: 'autocomplete', options: companyFormOpts, readonlyOnEdit: true }, { key: 'companyCode', label: 'Company Code', readOnly: true }, { key: 'vehicleId', label: 'Vehicle Id', type: 'autocomplete', optionsByForm: (f) => [{ value: '', label: 'Select Vehicle' }, ...(vehicleOptsByCompany[String(f?.companyId || '')] || [])] }, { key: 'scheduleId', label: 'Schedule Id', type: 'autocomplete', options: maintenanceScheduleFormOpts }, { key: 'breakdownId', label: 'Breakdown Id', type: 'autocomplete', options: breakdownRecordFormOpts }, { key: 'standardId', label: 'Standard Id', type: 'autocomplete', options: maintenanceStandardFormOpts }, { key: 'startTime', label: 'Start Time (ISO Timestamp)' }, { key: 'endTime', label: 'End Time (ISO Timestamp)' }, { key: 'odometerKm', label: 'Odometer Km', type: 'number' }, { key: 'engineHours', label: 'Engine Hours', type: 'number' }, { key: 'workPerformed', label: 'Work Performed', fullWidth: true, minWidth: 320 }, { key: 'partsUsed', label: 'Parts Used (JSON)', fullWidth: true, minWidth: 320 }, { key: 'lubricantsUsed', label: 'Lubricants Used (JSON)', fullWidth: true, minWidth: 320 }, { key: 'laborCost', label: 'Labor Cost', type: 'number' }, { key: 'partsCost', label: 'Parts Cost', type: 'number' }, { key: 'lubricantsCost', label: 'Lubricants Cost', type: 'number' }, { key: 'otherCost', label: 'Other Cost', type: 'number' }, { key: 'totalCost', label: 'Total Cost', type: 'number' }, { key: 'nextServiceDate', label: 'Next Service Date', type: 'date' }, { key: 'nextServiceOdometerKm', label: 'Next Service Odometer Km', type: 'number' }, { key: 'statusId', label: 'Status Id', type: 'autocomplete', options: statusEnumFormOpts }, { key: 'createdBy', label: 'Created By', type: 'autocomplete', optionsByForm: (f) => [{ value: '', label: 'Select Employee' }, ...(employeeOptsByCompany[String(f?.companyId || '')] || [])] }, { key: 'approvedBy', label: 'Approved By', type: 'autocomplete', optionsByForm: (f) => [{ value: '', label: 'Select Employee' }, ...(employeeOptsByCompany[String(f?.companyId || '')] || [])] }, { key: 'approvedAt', label: 'Approved At (ISO Timestamp)' }]}
      defaultFilters={{"companyId":"","vehicleId":"","scheduleId":"","breakdownId":"","standardId":"","nextServiceDate":"","sortBy":"createdAt","sortDir":"desc"}}
      emptyForm={{"companyId":"","companyCode":"","vehicleId":"","scheduleId":"","breakdownId":"","standardId":"","startTime":"","endTime":"","odometerKm":"","engineHours":"","workPerformed":"","partsUsed":"","lubricantsUsed":"","laborCost":"","partsCost":"","lubricantsCost":"","otherCost":"","totalCost":"","nextServiceDate":"","nextServiceOdometerKm":"","statusId":"","createdBy":"","approvedBy":"","approvedAt":""}}
      normalizePayload={(f) => ({ companyId: opt(f.companyId), companyCode: req(f.companyCode), vehicleId: opt(f.vehicleId), scheduleId: opt(f.scheduleId), breakdownId: opt(f.breakdownId), standardId: opt(f.standardId), startTime: opt(f.startTime), endTime: opt(f.endTime), odometerKm: toDecimal(f.odometerKm), engineHours: toDecimal(f.engineHours), workPerformed: opt(f.workPerformed), partsUsed: opt(f.partsUsed), lubricantsUsed: opt(f.lubricantsUsed), laborCost: toDecimal(f.laborCost), partsCost: toDecimal(f.partsCost), lubricantsCost: toDecimal(f.lubricantsCost), otherCost: toDecimal(f.otherCost), totalCost: toDecimal(f.totalCost), nextServiceDate: opt(f.nextServiceDate), nextServiceOdometerKm: toDecimal(f.nextServiceOdometerKm), statusId: toInt(f.statusId), createdBy: opt(f.createdBy), approvedBy: opt(f.approvedBy), approvedAt: opt(f.approvedAt) })}
      onFormFieldChange={(n, k, v) => (k === 'companyId' ? { ...n, companyCode: companyById[String(v)]?.code || '', vehicleId: '', createdBy: '', approvedBy: '' } : n)}
      mapRecordToForm={(r) => ({ ...{"companyId":"","companyCode":"","vehicleId":"","scheduleId":"","breakdownId":"","standardId":"","startTime":"","endTime":"","odometerKm":"","engineHours":"","workPerformed":"","partsUsed":"","lubricantsUsed":"","laborCost":"","partsCost":"","lubricantsCost":"","otherCost":"","totalCost":"","nextServiceDate":"","nextServiceOdometerKm":"","statusId":"","createdBy":"","approvedBy":"","approvedAt":""}, ...(r || {}) })}
      listFetcher={maintenanceRecordService.list}
      getByIdFetcher={maintenanceRecordService.getById}
      createFetcher={maintenanceRecordService.create}
      updateFetcher={maintenanceRecordService.update}
      deleteFetcher={maintenanceRecordService.delete}
      autoSearch
      autoSearchDebounceMs={350}
      fitViewport
      viewportOffset={190}
    />
  );
}
