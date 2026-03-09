import EventNoteRoundedIcon from '@mui/icons-material/EventNoteRounded';
import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import CrudEntityPage from '../../organization/shared/CrudEntityPage';
import { useAuth } from '../../../app/AuthContext';
import { organizationService } from '../../../services/organizationService';
import { employeeService } from '../../../services/employee_hr_management/employee/employeeService';
import { leaveTypeService } from '../../../services/employee_hr_management/leave_type/leaveTypeService';
import { leaveApplicationService } from '../../../services/employee_hr_management/leave_application/leaveApplicationService';
import { getOwnCompanyPrefill, opt, req, rowsFrom, toDecimal, toInt } from '../shared/hrCrudCommon';

export default function LeaveApplicationPage() {
  const theme = useTheme();
  const { token, auth } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [leaveStatuses, setLeaveStatuses] = useState([]);

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      try {
        const [companiesRaw, employeesRaw, leaveTypesRaw, hr] = await Promise.all([
          organizationService.listCompanies(token, { activeOnly: true }),
          employeeService.listEmployees(token, { sortBy: 'firstName', sortDir: 'asc' }),
          leaveTypeService.list(token, { sortBy: 'leaveName', sortDir: 'asc' }),
          employeeService.hrLookups(token, { activeOnly: true }),
        ]);
        setCompanies(rowsFrom(companiesRaw).map((c) => ({ id: c.companyId, code: c.companyCode, name: c.companyName })));
        setEmployees(rowsFrom(employeesRaw).map((e) => ({ id: e.employeeId, companyId: e.companyId, code: e.employeeCode, name: `${e.firstName || ''} ${e.lastName || ''}`.trim() || e.employeeCode })));
        setLeaveTypes(rowsFrom(leaveTypesRaw).map((lt) => ({ id: lt.leaveTypeId, companyId: lt.companyId, code: lt.leaveCode, name: lt.leaveName })));
        setLeaveStatuses(hr?.leaveApplicationStatuses || []);
      } catch {
        setCompanies([]); setEmployees([]); setLeaveTypes([]); setLeaveStatuses([]);
      }
    };
    load();
  }, [token]);

  const ownCompanyPrefill = useMemo(() => getOwnCompanyPrefill(auth, companies), [auth, companies]);
  const companyById = useMemo(() => Object.fromEntries(companies.map((c) => [String(c.id), c])), [companies]);
  const employeeById = useMemo(() => Object.fromEntries(employees.map((e) => [String(e.id), `${e.name}${e.code ? ` (${e.code})` : ''}`])), [employees]);
  const leaveTypeById = useMemo(() => Object.fromEntries(leaveTypes.map((lt) => [String(lt.id), `${lt.name}${lt.code ? ` (${lt.code})` : ''}`])), [leaveTypes]);
  const leaveStatusById = useMemo(() => Object.fromEntries(leaveStatuses.map((s) => [String(s.id), s.name])), [leaveStatuses]);

  const employeeOptionsByCompany = useMemo(() => { const m = {}; employees.forEach((e) => { const k = String(e.companyId || ''); if (!m[k]) m[k] = []; m[k].push({ value: String(e.id), label: `${e.name}${e.code ? ` (${e.code})` : ''}` }); }); return m; }, [employees]);
  const leaveTypeOptionsByCompany = useMemo(() => { const m = {}; leaveTypes.forEach((lt) => { const k = String(lt.companyId || ''); if (!m[k]) m[k] = []; m[k].push({ value: String(lt.id), label: `${lt.name}${lt.code ? ` (${lt.code})` : ''}` }); }); return m; }, [leaveTypes]);
  const companyOptions = useMemo(() => [{ value: '', label: 'All Companies' }, ...companies.map((c) => ({ value: String(c.id), label: `${c.name} (${c.code})` }))], [companies]);
  const companyFormOptions = useMemo(() => [{ value: '', label: 'Select Company' }, ...companies.map((c) => ({ value: String(c.id), label: `${c.name} (${c.code})` }))], [companies]);
  const leaveStatusOptions = useMemo(() => [{ value: '', label: 'All Statuses' }, ...leaveStatuses.map((s) => ({ value: String(s.id), label: s.name }))], [leaveStatuses]);
  const leaveStatusFormOptions = useMemo(() => [{ value: '', label: 'Select Status' }, ...leaveStatuses.map((s) => ({ value: String(s.id), label: s.name }))], [leaveStatuses]);

  return (
    <CrudEntityPage
      title="Leave Applications"
      icon={<EventNoteRoundedIcon sx={{ color: '#fff', fontSize: 20 }} />}
      gradient={`linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`}
      idKey="leaveId"
      prefillForm={ownCompanyPrefill}
      prefillFilters={ownCompanyPrefill ? { companyId: ownCompanyPrefill.companyId } : null}
      columns={[
        { key: 'companyId', label: 'Company', render: (r) => companyById[String(r.companyId)]?.name || r.companyCode || '-' },
        { key: 'employeeId', label: 'Employee', render: (r) => employeeById[String(r.employeeId)] || '-' },
        { key: 'leaveTypeId', label: 'Leave Type', render: (r) => leaveTypeById[String(r.leaveTypeId)] || '-' },
        { key: 'startDate', label: 'Start Date' },
        { key: 'endDate', label: 'End Date' },
        { key: 'totalDays', label: 'Total Days' },
        { key: 'statusId', label: 'Status', render: (r) => leaveStatusById[String(r.statusId)] || '-' },
      ]}
      filterFields={[
        { key: 'companyId', label: 'Company', type: 'autocomplete', options: companyOptions },
        { key: 'employeeId', label: 'Employee', type: 'autocomplete', optionsByForm: (f) => [{ value: '', label: 'All Employees' }, ...(employeeOptionsByCompany[String(f?.companyId || '')] || [])] },
        { key: 'leaveTypeId', label: 'Leave Type', type: 'autocomplete', optionsByForm: (f) => [{ value: '', label: 'All Leave Types' }, ...(leaveTypeOptionsByCompany[String(f?.companyId || '')] || [])] },
        { key: 'startDate_from', label: 'Start Date From', type: 'date' },
        { key: 'endDate_to', label: 'End Date To', type: 'date' },
        { key: 'statusId', label: 'Status', type: 'autocomplete', options: leaveStatusOptions },
      ]}
      formFields={[
        { key: 'companyId', label: 'Company', type: 'autocomplete', options: companyFormOptions, readonlyOnEdit: true },
        { key: 'companyCode', label: 'Company Code', readOnly: true },
        { key: 'employeeId', label: 'Employee', type: 'autocomplete', optionsByForm: (f) => [{ value: '', label: 'Select Employee' }, ...(employeeOptionsByCompany[String(f?.companyId || '')] || [])] },
        { key: 'leaveTypeId', label: 'Leave Type', type: 'autocomplete', optionsByForm: (f) => [{ value: '', label: 'Select Leave Type' }, ...(leaveTypeOptionsByCompany[String(f?.companyId || '')] || [])] },
        { key: 'startDate', label: 'Start Date', type: 'date' },
        { key: 'endDate', label: 'End Date', type: 'date' },
        { key: 'totalDays', label: 'Total Days', type: 'number' },
        { key: 'statusId', label: 'Status', type: 'autocomplete', options: leaveStatusFormOptions },
        { key: 'approvedBy', label: 'Approved By', type: 'autocomplete', optionsByForm: (f) => [{ value: '', label: 'Optional Approver' }, ...(employeeOptionsByCompany[String(f?.companyId || '')] || [])] },
        { key: 'approvedAt', label: 'Approved At (ISO)' },
      ]}
      defaultFilters={{ companyId: '', employeeId: '', leaveTypeId: '', startDate_from: '', endDate_to: '', statusId: '', sortBy: 'startDate', sortDir: 'desc' }}
      emptyForm={{ companyId: '', companyCode: '', employeeId: '', leaveTypeId: '', startDate: '', endDate: '', totalDays: '', statusId: '', approvedBy: '', approvedAt: '' }}
      normalizePayload={(f) => ({ companyId: opt(f.companyId), companyCode: req(f.companyCode), employeeId: opt(f.employeeId), leaveTypeId: opt(f.leaveTypeId), startDate: opt(f.startDate), endDate: opt(f.endDate), totalDays: toDecimal(f.totalDays), statusId: toInt(f.statusId), approvedBy: opt(f.approvedBy), approvedAt: opt(f.approvedAt) })}
      onFormFieldChange={(next, key, value) => {
        if (key === 'companyId') {
          const c = companyById[String(value)];
          return { ...next, companyCode: c?.code || '', employeeId: '', leaveTypeId: '', approvedBy: '' };
        }
        return next;
      }}
      listFetcher={leaveApplicationService.list}
      getByIdFetcher={leaveApplicationService.getById}
      createFetcher={leaveApplicationService.create}
      updateFetcher={leaveApplicationService.update}
      deleteFetcher={leaveApplicationService.delete}
      autoSearch
      autoSearchDebounceMs={350}
      fitViewport
      viewportOffset={190}
    />
  );
}
