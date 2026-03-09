import BuildCircleRoundedIcon from '@mui/icons-material/BuildCircleRounded';
import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import CrudEntityPage from '../../organization/shared/CrudEntityPage';
import { useAuth } from '../../../app/AuthContext';
import { maintenanceAssignmentService } from '../../../services/vehicle_management/maintenance_assignment/maintenanceAssignmentService';
import { getOwnCompanyPrefill, opt, req, rowsFrom, toBool, toDecimal, toInt } from '../../employee_hr_management/shared/hrCrudCommon';
import { organizationService } from '../../../services/organizationService';
import { employeeService } from '../../../services/employee_hr_management/employee/employeeService';
import { breakdownRecordService } from '../../../services/vehicle_management/breakdown_record/breakdownRecordService';
import { maintenanceRecordService } from '../../../services/vehicle_management/maintenance_record/maintenanceRecordService';

export default function MaintenanceAssignmentPage() {
  const theme = useTheme();
  const { token, auth } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [breakdownRecordRows, setBreakdownRecordRows] = useState([]);
  const [maintenanceRecordRows, setMaintenanceRecordRows] = useState([]);
  const [statusEnums, setStatusEnums] = useState([]);

  useEffect(() => {
    (async () => {
      if (!token) return;
      const settled = await Promise.allSettled([organizationService.listCompanies(token, { activeOnly: true }), employeeService.listEmployees(token, { sortBy: 'firstName', sortDir: 'asc' }), breakdownRecordService.list(token, {}), maintenanceRecordService.list(token, {}), organizationService.enumValues('maintenance_assignment_status', { locale: 'en-US', activeOnly: true })]);
      try {
        const getVal = (i) => (settled[i]?.status === 'fulfilled' ? settled[i].value : null);
        setCompanies(rowsFrom(getVal(0)).map((c) => ({ id: c.companyId, code: c.companyCode, name: c.companyName })));
        setEmployees(rowsFrom(getVal(1)).map((e) => ({ ...e, displayName: [e.employeeCode || '-', [e.firstName || '', e.lastName || ''].join(' ').trim() || e.employeeName || e.employeeId].join(' - ') })));
        setBreakdownRecordRows(rowsFrom(getVal(2)));
        setMaintenanceRecordRows(rowsFrom(getVal(3)));
        setStatusEnums(rowsFrom(getVal(4)));
      } catch {
        setCompanies([]); setEmployees([]);
        setBreakdownRecordRows([]); setMaintenanceRecordRows([]);
        setStatusEnums([]);
      }
    })();
  }, [token]);

  const own = useMemo(() => getOwnCompanyPrefill(auth, companies), [auth, companies]);
  const companyById = useMemo(() => Object.fromEntries(companies.map((c) => [String(c.id), c])), [companies]);
  const companyOpts = useMemo(() => [{ value: '', label: 'All Companies' }, ...companies.map((c) => ({ value: String(c.id), label: `${c.name} (${c.code})` }))], [companies]);
  const companyFormOpts = useMemo(() => [{ value: '', label: 'Select Company' }, ...companies.map((c) => ({ value: String(c.id), label: `${c.name} (${c.code})` }))], [companies]);
  const employeeLabelById = useMemo(() => Object.fromEntries(employees.map((e) => [String(e.employeeId), e.displayName])), [employees]);
  const employeeOptsByCompany = useMemo(() => { const m = {}; employees.forEach((e) => { const k = String(e.companyId || ''); (m[k] ??= []).push({ value: String(e.employeeId), label: e.displayName }); }); return m; }, [employees]);
  const breakdownRecordLabelById = useMemo(() => Object.fromEntries(breakdownRecordRows.map((r) => [String(r.breakdownId), String(r.breakdownId || r.breakdownId)])), [breakdownRecordRows]);
  const breakdownRecordOpts = useMemo(() => [{ value: '', label: 'All Breakdown Records' }, ...breakdownRecordRows.map((r) => ({ value: String(r.breakdownId), label: String(r.breakdownId || r.breakdownId) }))], [breakdownRecordRows]);
  const breakdownRecordFormOpts = useMemo(() => [{ value: '', label: 'Select Breakdown Record' }, ...breakdownRecordRows.map((r) => ({ value: String(r.breakdownId), label: String(r.breakdownId || r.breakdownId) }))], [breakdownRecordRows]);
  const maintenanceRecordLabelById = useMemo(() => Object.fromEntries(maintenanceRecordRows.map((r) => [String(r.maintenanceId), String(r.scheduleId || r.maintenanceId)])), [maintenanceRecordRows]);
  const maintenanceRecordOpts = useMemo(() => [{ value: '', label: 'All Maintenance Records' }, ...maintenanceRecordRows.map((r) => ({ value: String(r.maintenanceId), label: String(r.scheduleId || r.maintenanceId) }))], [maintenanceRecordRows]);
  const maintenanceRecordFormOpts = useMemo(() => [{ value: '', label: 'Select Maintenance Record' }, ...maintenanceRecordRows.map((r) => ({ value: String(r.maintenanceId), label: String(r.scheduleId || r.maintenanceId) }))], [maintenanceRecordRows]);
  const statusEnumById = useMemo(() => Object.fromEntries(statusEnums.map((x) => [String(x.id), x.name])), [statusEnums]);
  const statusEnumOpts = useMemo(() => [{ value: '', label: 'All Status' }, ...statusEnums.map((x) => ({ value: String(x.id), label: x.name }))], [statusEnums]);
  const statusEnumFormOpts = useMemo(() => [{ value: '', label: 'Select Status' }, ...statusEnums.map((x) => ({ value: String(x.id), label: x.name }))], [statusEnums]);

  return (
    <CrudEntityPage
      title="Maintenance Assignments"
      icon={<BuildCircleRoundedIcon sx={{ color: '#fff', fontSize: 20 }} />}
      gradient={`linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`}
      idKey="assignmentId"
      prefillForm={own}
      prefillFilters={own ? { companyId: own.companyId } : null}
      columns={[{ key: 'companyId', label: 'Company Id', render: (r) => companyById[String(r.companyId)]?.name || r.companyCode || '-' }, { key: 'breakdownId', label: 'Breakdown Id', render: (r) => breakdownRecordLabelById[String(r.breakdownId)] || '-' }, { key: 'maintenanceId', label: 'Maintenance Id', render: (r) => maintenanceRecordLabelById[String(r.maintenanceId)] || '-' }, { key: 'technicianId', label: 'Technician Id', render: (r) => employeeLabelById[String(r.technicianId)] || '-' }, { key: 'assignedAt', label: 'Assigned At' }, { key: 'startedAt', label: 'Started At' }]}
      filterFields={[{ key: 'companyId', label: 'Company Id', type: 'autocomplete', options: companyOpts }, { key: 'breakdownId', label: 'Breakdown Id', type: 'autocomplete', options: breakdownRecordOpts }, { key: 'maintenanceId', label: 'Maintenance Id', type: 'autocomplete', options: maintenanceRecordOpts }, { key: 'technicianId', label: 'Technician Id', type: 'autocomplete', optionsByForm: (f) => [{ value: '', label: 'All Employees' }, ...(employeeOptsByCompany[String(f?.companyId || '')] || [])] }, { key: 'statusId', label: 'Status Id', type: 'autocomplete', options: statusEnumOpts }]}
      formFields={[{ key: 'companyId', label: 'Company Id', type: 'autocomplete', options: companyFormOpts, readonlyOnEdit: true }, { key: 'companyCode', label: 'Company Code', readOnly: true }, { key: 'breakdownId', label: 'Breakdown Id', type: 'autocomplete', options: breakdownRecordFormOpts }, { key: 'maintenanceId', label: 'Maintenance Id', type: 'autocomplete', options: maintenanceRecordFormOpts }, { key: 'technicianId', label: 'Technician Id', type: 'autocomplete', optionsByForm: (f) => [{ value: '', label: 'Select Employee' }, ...(employeeOptsByCompany[String(f?.companyId || '')] || [])] }, { key: 'assignedAt', label: 'Assigned At (ISO Timestamp)' }, { key: 'startedAt', label: 'Started At (ISO Timestamp)' }, { key: 'completedAt', label: 'Completed At (ISO Timestamp)' }, { key: 'statusId', label: 'Status Id', type: 'autocomplete', options: statusEnumFormOpts }, { key: 'notes', label: 'Notes', fullWidth: true, minWidth: 320 }]}
      defaultFilters={{"companyId":"","breakdownId":"","maintenanceId":"","technicianId":"","statusId":"","sortBy":"assignedAt","sortDir":"desc"}}
      emptyForm={{"companyId":"","companyCode":"","breakdownId":"","maintenanceId":"","technicianId":"","assignedAt":"","startedAt":"","completedAt":"","statusId":"","notes":""}}
      normalizePayload={(f) => ({ companyId: opt(f.companyId), companyCode: req(f.companyCode), breakdownId: opt(f.breakdownId), maintenanceId: opt(f.maintenanceId), technicianId: opt(f.technicianId), assignedAt: opt(f.assignedAt), startedAt: opt(f.startedAt), completedAt: opt(f.completedAt), statusId: toInt(f.statusId), notes: opt(f.notes) })}
      onFormFieldChange={(n, k, v) => (k === 'companyId' ? { ...n, companyCode: companyById[String(v)]?.code || '', technicianId: '' } : n)}
      mapRecordToForm={(r) => ({ ...{"companyId":"","companyCode":"","breakdownId":"","maintenanceId":"","technicianId":"","assignedAt":"","startedAt":"","completedAt":"","statusId":"","notes":""}, ...(r || {}) })}
      listFetcher={maintenanceAssignmentService.list}
      getByIdFetcher={maintenanceAssignmentService.getById}
      createFetcher={maintenanceAssignmentService.create}
      updateFetcher={maintenanceAssignmentService.update}
      deleteFetcher={maintenanceAssignmentService.delete}
      autoSearch
      autoSearchDebounceMs={350}
      fitViewport
      viewportOffset={190}
    />
  );
}
