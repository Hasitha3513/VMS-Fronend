import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import CrudEntityPage from '../../organization/shared/CrudEntityPage';
import { useAuth } from '../../../app/AuthContext';
import { organizationService } from '../../../services/organizationService';
import { employeeService } from '../../../services/employee_hr_management/employee/employeeService';
import { overtimeRequestService } from '../../../services/employee_hr_management/overtime_request/overtimeRequestService';
import { getOwnCompanyPrefill, opt, req, rowsFrom, toBool, toDecimal, toInt } from '../shared/hrCrudCommon';

export default function OvertimeRequestPage() {
  const theme = useTheme();
  const { token, auth } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [overtimeTypes, setOvertimeTypes] = useState([]);

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      try {
        const [companiesRaw, employeesRaw, projectsRaw, hr] = await Promise.all([
          organizationService.listCompanies(token, { activeOnly: true }),
          employeeService.listEmployees(token, { sortBy: 'firstName', sortDir: 'asc' }),
          organizationService.listProjects(token, { activeOnly: true }),
          employeeService.hrLookups(token, { activeOnly: true }),
        ]);
        setCompanies(rowsFrom(companiesRaw).map((c) => ({ id: c.companyId, code: c.companyCode, name: c.companyName })));
        setEmployees(rowsFrom(employeesRaw).map((e) => ({ id: e.employeeId, companyId: e.companyId, code: e.employeeCode, name: `${e.firstName || ''} ${e.lastName || ''}`.trim() || e.employeeCode })));
        setProjects(rowsFrom(projectsRaw).map((p) => ({ id: p.projectId, companyId: p.companyId, code: p.projectCode, name: p.projectName })));
        setOvertimeTypes(hr?.overtimeTypes || []);
      } catch {
        setCompanies([]); setEmployees([]); setProjects([]); setOvertimeTypes([]);
      }
    };
    load();
  }, [token]);

  const ownCompanyPrefill = useMemo(() => getOwnCompanyPrefill(auth, companies), [auth, companies]);
  const companyById = useMemo(() => Object.fromEntries(companies.map((c) => [String(c.id), c])), [companies]);
  const employeeById = useMemo(() => Object.fromEntries(employees.map((e) => [String(e.id), `${e.name}${e.code ? ` (${e.code})` : ''}`])), [employees]);
  const projectById = useMemo(() => Object.fromEntries(projects.map((p) => [String(p.id), `${p.name}${p.code ? ` (${p.code})` : ''}`])), [projects]);
  const overtimeTypeById = useMemo(() => Object.fromEntries(overtimeTypes.map((t) => [String(t.id), t.name])), [overtimeTypes]);

  const employeeOptionsByCompany = useMemo(() => { const m = {}; employees.forEach((e) => { const k = String(e.companyId || ''); if (!m[k]) m[k] = []; m[k].push({ value: String(e.id), label: `${e.name}${e.code ? ` (${e.code})` : ''}` }); }); return m; }, [employees]);
  const projectOptionsByCompany = useMemo(() => { const m = {}; projects.forEach((p) => { const k = String(p.companyId || ''); if (!m[k]) m[k] = []; m[k].push({ value: String(p.id), label: `${p.name}${p.code ? ` (${p.code})` : ''}` }); }); return m; }, [projects]);
  const companyOptions = useMemo(() => [{ value: '', label: 'All Companies' }, ...companies.map((c) => ({ value: String(c.id), label: `${c.name} (${c.code})` }))], [companies]);
  const companyFormOptions = useMemo(() => [{ value: '', label: 'Select Company' }, ...companies.map((c) => ({ value: String(c.id), label: `${c.name} (${c.code})` }))], [companies]);
  const overtimeTypeOptions = useMemo(() => [{ value: '', label: 'All OT Types' }, ...overtimeTypes.map((t) => ({ value: String(t.id), label: t.name }))], [overtimeTypes]);
  const overtimeTypeFormOptions = useMemo(() => [{ value: '', label: 'Select OT Type' }, ...overtimeTypes.map((t) => ({ value: String(t.id), label: t.name }))], [overtimeTypes]);

  return (
    <CrudEntityPage
      title="Overtime Requests"
      icon={<ScheduleRoundedIcon sx={{ color: '#fff', fontSize: 20 }} />}
      gradient={`linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`}
      idKey="overtimeId"
      prefillForm={ownCompanyPrefill}
      prefillFilters={ownCompanyPrefill ? { companyId: ownCompanyPrefill.companyId } : null}
      columns={[
        { key: 'companyId', label: 'Company', render: (r) => companyById[String(r.companyId)]?.name || r.companyCode || '-' },
        { key: 'employeeId', label: 'Employee', render: (r) => employeeById[String(r.employeeId)] || '-' },
        { key: 'otDate', label: 'OT Date' },
        { key: 'hours', label: 'Hours' },
        { key: 'otTypeId', label: 'OT Type', render: (r) => overtimeTypeById[String(r.otTypeId)] || '-' },
        { key: 'approved', label: 'Approved', type: 'boolean' },
        { key: 'approvedBy', label: 'Approved By', render: (r) => employeeById[String(r.approvedBy)] || '-' },
      ]}
      filterFields={[
        { key: 'companyId', label: 'Company', type: 'autocomplete', options: companyOptions },
        { key: 'employeeId', label: 'Employee', type: 'autocomplete', optionsByForm: (f) => [{ value: '', label: 'All Employees' }, ...(employeeOptionsByCompany[String(f?.companyId || '')] || [])] },
        { key: 'otDate_from', label: 'Date From', type: 'date' },
        { key: 'otDate_to', label: 'Date To', type: 'date' },
        { key: 'otTypeId', label: 'OT Type', type: 'autocomplete', options: overtimeTypeOptions },
        { key: 'approved', label: 'Approved', type: 'boolean' },
      ]}
      formFields={[
        { key: 'companyId', label: 'Company', type: 'autocomplete', options: companyFormOptions, readonlyOnEdit: true },
        { key: 'companyCode', label: 'Company Code', readOnly: true },
        { key: 'employeeId', label: 'Employee', type: 'autocomplete', optionsByForm: (f) => [{ value: '', label: 'Select Employee' }, ...(employeeOptionsByCompany[String(f?.companyId || '')] || [])] },
        { key: 'projectId', label: 'Project', type: 'autocomplete', optionsByForm: (f) => [{ value: '', label: 'Optional Project' }, ...(projectOptionsByCompany[String(f?.companyId || '')] || [])] },
        { key: 'otDate', label: 'OT Date', type: 'date' },
        { key: 'hours', label: 'Hours', type: 'number' },
        { key: 'otTypeId', label: 'OT Type', type: 'autocomplete', options: overtimeTypeFormOptions },
        { key: 'approved', label: 'Approved', type: 'boolean' },
        { key: 'approvedBy', label: 'Approved By', type: 'autocomplete', optionsByForm: (f) => [{ value: '', label: 'Optional Approver' }, ...(employeeOptionsByCompany[String(f?.companyId || '')] || [])] },
        { key: 'approvedAt', label: 'Approved At (ISO)' },
      ]}
      defaultFilters={{ companyId: '', employeeId: '', otDate_from: '', otDate_to: '', otTypeId: '', approved: '', sortBy: 'otDate', sortDir: 'desc' }}
      emptyForm={{ companyId: '', companyCode: '', employeeId: '', projectId: '', otDate: '', hours: '', otTypeId: '', approved: 'false', approvedBy: '', approvedAt: '' }}
      normalizePayload={(f) => ({ companyId: opt(f.companyId), companyCode: req(f.companyCode), employeeId: opt(f.employeeId), projectId: opt(f.projectId), otDate: opt(f.otDate), hours: toDecimal(f.hours), otTypeId: toInt(f.otTypeId), approved: toBool(f.approved), approvedBy: opt(f.approvedBy), approvedAt: opt(f.approvedAt) })}
      onFormFieldChange={(next, key, value) => {
        if (key === 'companyId') {
          const c = companyById[String(value)];
          return { ...next, companyCode: c?.code || '', employeeId: '', projectId: '', approvedBy: '' };
        }
        return next;
      }}
      listFetcher={overtimeRequestService.list}
      getByIdFetcher={overtimeRequestService.getById}
      createFetcher={overtimeRequestService.create}
      updateFetcher={overtimeRequestService.update}
      deleteFetcher={overtimeRequestService.delete}
      autoSearch
      autoSearchDebounceMs={350}
      fitViewport
      viewportOffset={190}
    />
  );
}
