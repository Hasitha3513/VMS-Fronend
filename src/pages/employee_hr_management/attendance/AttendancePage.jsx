import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import CrudEntityPage from '../../organization/shared/CrudEntityPage';
import { useAuth } from '../../../app/AuthContext';
import { organizationService } from '../../../services/organizationService';
import { employeeService } from '../../../services/employee_hr_management/employee/employeeService';
import { attendanceService } from '../../../services/employee_hr_management/attendance/attendanceService';
import { getOwnCompanyPrefill, opt, req, rowsFrom, toDecimal, toInt } from '../shared/hrCrudCommon';

export default function AttendancePage() {
  const theme = useTheme();
  const { token, auth } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [attendanceStatuses, setAttendanceStatuses] = useState([]);

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
        setAttendanceStatuses(hr?.attendanceStatuses || []);
      } catch {
        setCompanies([]); setEmployees([]); setProjects([]); setAttendanceStatuses([]);
      }
    };
    load();
  }, [token]);

  const ownCompanyPrefill = useMemo(() => getOwnCompanyPrefill(auth, companies), [auth, companies]);
  const companyById = useMemo(() => Object.fromEntries(companies.map((c) => [String(c.id), c])), [companies]);
  const employeeById = useMemo(() => Object.fromEntries(employees.map((e) => [String(e.id), `${e.name}${e.code ? ` (${e.code})` : ''}`])), [employees]);
  const projectById = useMemo(() => Object.fromEntries(projects.map((p) => [String(p.id), `${p.name}${p.code ? ` (${p.code})` : ''}`])), [projects]);
  const statusById = useMemo(() => Object.fromEntries(attendanceStatuses.map((s) => [String(s.id), s.name])), [attendanceStatuses]);

  const employeeOptionsByCompany = useMemo(() => {
    const m = {};
    employees.forEach((e) => {
      const k = String(e.companyId || ''); if (!m[k]) m[k] = [];
      m[k].push({ value: String(e.id), label: `${e.name}${e.code ? ` (${e.code})` : ''}` });
    });
    return m;
  }, [employees]);
  const projectOptionsByCompany = useMemo(() => {
    const m = {};
    projects.forEach((p) => {
      const k = String(p.companyId || ''); if (!m[k]) m[k] = [];
      m[k].push({ value: String(p.id), label: `${p.name}${p.code ? ` (${p.code})` : ''}` });
    });
    return m;
  }, [projects]);

  const companyOptions = useMemo(() => [{ value: '', label: 'All Companies' }, ...companies.map((c) => ({ value: String(c.id), label: `${c.name} (${c.code})` }))], [companies]);
  const companyFormOptions = useMemo(() => [{ value: '', label: 'Select Company' }, ...companies.map((c) => ({ value: String(c.id), label: `${c.name} (${c.code})` }))], [companies]);
  const statusOptions = useMemo(() => [{ value: '', label: 'All Statuses' }, ...attendanceStatuses.map((s) => ({ value: String(s.id), label: s.name }))], [attendanceStatuses]);
  const statusFormOptions = useMemo(() => [{ value: '', label: 'Select Status' }, ...attendanceStatuses.map((s) => ({ value: String(s.id), label: s.name }))], [attendanceStatuses]);

  return (
    <CrudEntityPage
      title="Attendance"
      icon={<CalendarMonthRoundedIcon sx={{ color: '#fff', fontSize: 20 }} />}
      gradient={`linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`}
      idKey="attendanceId"
      prefillForm={ownCompanyPrefill}
      prefillFilters={ownCompanyPrefill ? { companyId: ownCompanyPrefill.companyId } : null}
      columns={[
        { key: 'companyId', label: 'Company', render: (r) => companyById[String(r.companyId)]?.name || r.companyCode || '-' },
        { key: 'employeeId', label: 'Employee', render: (r) => employeeById[String(r.employeeId)] || '-' },
        { key: 'attendanceDate', label: 'Date' },
        { key: 'projectId', label: 'Project', render: (r) => projectById[String(r.projectId)] || '-' },
        { key: 'statusId', label: 'Status', render: (r) => statusById[String(r.statusId)] || '-' },
        { key: 'scheduledHours', label: 'Scheduled Hrs' },
        { key: 'actualHours', label: 'Actual Hrs' },
        { key: 'overtimeHours', label: 'OT Hrs' },
      ]}
      filterFields={[
        { key: 'companyId', label: 'Company', type: 'autocomplete', options: companyOptions },
        { key: 'employeeId', label: 'Employee', type: 'autocomplete', optionsByForm: (f) => [{ value: '', label: 'All Employees' }, ...(employeeOptionsByCompany[String(f?.companyId || '')] || [])] },
        { key: 'projectId', label: 'Project', type: 'autocomplete', optionsByForm: (f) => [{ value: '', label: 'All Projects' }, ...(projectOptionsByCompany[String(f?.companyId || '')] || [])] },
        { key: 'attendanceDate_from', label: 'Date From', type: 'date' },
        { key: 'attendanceDate_to', label: 'Date To', type: 'date' },
        { key: 'statusId', label: 'Status', type: 'autocomplete', options: statusOptions },
      ]}
      formFields={[
        { key: 'companyId', label: 'Company', type: 'autocomplete', options: companyFormOptions, readonlyOnEdit: true },
        { key: 'companyCode', label: 'Company Code', readOnly: true },
        { key: 'employeeId', label: 'Employee', type: 'autocomplete', optionsByForm: (f) => [{ value: '', label: 'Select Employee' }, ...(employeeOptionsByCompany[String(f?.companyId || '')] || [])] },
        { key: 'projectId', label: 'Project', type: 'autocomplete', optionsByForm: (f) => [{ value: '', label: 'Optional Project' }, ...(projectOptionsByCompany[String(f?.companyId || '')] || [])] },
        { key: 'attendanceDate', label: 'Attendance Date', type: 'date' },
        { key: 'statusId', label: 'Status', type: 'autocomplete', options: statusFormOptions },
        { key: 'checkInTime', label: 'Check In Time (ISO)' },
        { key: 'checkOutTime', label: 'Check Out Time (ISO)' },
        { key: 'scheduledHours', label: 'Scheduled Hours', type: 'number' },
        { key: 'actualHours', label: 'Actual Hours', type: 'number' },
        { key: 'overtimeHours', label: 'Overtime Hours', type: 'number' },
        { key: 'latitudeIn', label: 'Latitude In', type: 'number' },
        { key: 'longitudeIn', label: 'Longitude In', type: 'number' },
        { key: 'latitudeOut', label: 'Latitude Out', type: 'number' },
        { key: 'longitudeOut', label: 'Longitude Out', type: 'number' },
      ]}
      defaultFilters={{ companyId: '', employeeId: '', projectId: '', attendanceDate_from: '', attendanceDate_to: '', statusId: '', sortBy: 'attendanceDate', sortDir: 'desc' }}
      emptyForm={{ companyId: '', companyCode: '', employeeId: '', projectId: '', attendanceDate: '', statusId: '', checkInTime: '', checkOutTime: '', scheduledHours: '', actualHours: '', overtimeHours: '', latitudeIn: '', longitudeIn: '', latitudeOut: '', longitudeOut: '' }}
      normalizePayload={(f) => ({
        companyId: opt(f.companyId), companyCode: req(f.companyCode), employeeId: opt(f.employeeId), projectId: opt(f.projectId), attendanceDate: opt(f.attendanceDate),
        statusId: toInt(f.statusId), checkInTime: opt(f.checkInTime), checkOutTime: opt(f.checkOutTime),
        scheduledHours: toDecimal(f.scheduledHours), actualHours: toDecimal(f.actualHours), overtimeHours: toDecimal(f.overtimeHours),
        latitudeIn: toDecimal(f.latitudeIn), longitudeIn: toDecimal(f.longitudeIn), latitudeOut: toDecimal(f.latitudeOut), longitudeOut: toDecimal(f.longitudeOut),
      })}
      onFormFieldChange={(next, key, value) => {
        if (key === 'companyId') {
          const c = companyById[String(value)];
          return { ...next, companyCode: c?.code || '', employeeId: '', projectId: '' };
        }
        return next;
      }}
      listFetcher={attendanceService.list}
      getByIdFetcher={attendanceService.getById}
      createFetcher={attendanceService.create}
      updateFetcher={attendanceService.update}
      deleteFetcher={attendanceService.delete}
      autoSearch
      autoSearchDebounceMs={350}
      fitViewport
      viewportOffset={190}
    />
  );
}
