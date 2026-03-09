import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import CrudEntityPage from '../../organization/shared/CrudEntityPage';
import { useAuth } from '../../../app/AuthContext';
import { organizationService } from '../../../services/organizationService';
import { employeeService } from '../../../services/employee_hr_management/employee/employeeService';
import { vehicleService } from '../../../services/vehicle_management/vehicle/vehicleService';
import { vehicleDailyActivityService } from '../../../services/vehicle_management/vehicle_daily_activity/vehicleDailyActivityService';
import { getOwnCompanyPrefill, opt, req, rowsFrom, toDecimal } from '../../employee_hr_management/shared/hrCrudCommon';

export default function VehicleDailyActivityPage() {
  const theme = useTheme();
  const { token, auth } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    (async () => {
      if (!token) return;
      try {
        const [cr, vr, er, pr] = await Promise.all([
          organizationService.listCompanies(token, { activeOnly: true }),
          vehicleService.list(token, {}),
          employeeService.listEmployees(token, { sortBy: 'firstName', sortDir: 'asc' }),
          organizationService.listProjects(token, { activeOnly: true }),
        ]);
        setCompanies(rowsFrom(cr).map((c) => ({ id: c.companyId, code: c.companyCode, name: c.companyName })));
        setVehicles(rowsFrom(vr));
        setEmployees(rowsFrom(er).map((e) => ({ ...e, displayName: `${e.employeeCode || '-'} - ${`${e.firstName || ''} ${e.lastName || ''}`.trim() || e.employeeName || ''}`.trim() })));
        setProjects(rowsFrom(pr));
      } catch {
        setCompanies([]);
        setVehicles([]);
        setEmployees([]);
        setProjects([]);
      }
    })();
  }, [token]);

  const own = useMemo(() => getOwnCompanyPrefill(auth, companies), [auth, companies]);
  const companyById = useMemo(() => Object.fromEntries(companies.map((c) => [String(c.id), c])), [companies]);
  const vehicleLabelById = useMemo(() => Object.fromEntries(vehicles.map((v) => [String(v.vehicleId), `${v.vehicleCode || '-'} | ${v.registrationNumber || '-'}`])), [vehicles]);
  const employeeLabelById = useMemo(() => Object.fromEntries(employees.map((e) => [String(e.employeeId), e.displayName])), [employees]);
  const projectLabelById = useMemo(() => Object.fromEntries(projects.map((p) => [String(p.projectId), p.projectName || p.projectCode || p.projectId])), [projects]);

  const vehicleOptsByCompany = useMemo(() => {
    const m = {};
    vehicles.forEach((v) => {
      const k = String(v.companyId || '');
      (m[k] ??= []).push({ value: String(v.vehicleId), label: vehicleLabelById[String(v.vehicleId)] });
    });
    return m;
  }, [vehicles, vehicleLabelById]);
  const employeeOptsByCompany = useMemo(() => {
    const m = {};
    employees.forEach((e) => {
      const k = String(e.companyId || '');
      (m[k] ??= []).push({ value: String(e.employeeId), label: e.displayName });
    });
    return m;
  }, [employees]);
  const projectOptsByCompany = useMemo(() => {
    const m = {};
    projects.forEach((p) => {
      const k = String(p.companyId || '');
      (m[k] ??= []).push({ value: String(p.projectId), label: p.projectName || p.projectCode || p.projectId });
    });
    return m;
  }, [projects]);

  const companyOpts = useMemo(() => [{ value: '', label: 'All Companies' }, ...companies.map((c) => ({ value: String(c.id), label: `${c.name} (${c.code})` }))], [companies]);
  const companyFormOpts = useMemo(() => [{ value: '', label: 'Select Company' }, ...companies.map((c) => ({ value: String(c.id), label: `${c.name} (${c.code})` }))], [companies]);

  return (
    <CrudEntityPage
      title="Vehicle Daily Activities"
      icon={<CalendarMonthRoundedIcon sx={{ color: '#fff', fontSize: 20 }} />}
      gradient={`linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`}
      idKey="activityId"
      prefillForm={own}
      prefillFilters={own ? { companyId: own.companyId } : null}
      columns={[
        { key: 'activityDate', label: 'Date' },
        { key: 'companyId', label: 'Company', render: (r) => companyById[String(r.companyId)]?.name || r.companyCode || '-' },
        { key: 'vehicleId', label: 'Vehicle', render: (r) => vehicleLabelById[String(r.vehicleId)] || '-' },
        { key: 'driverId', label: 'Driver', render: (r) => employeeLabelById[String(r.driverId)] || '-' },
        { key: 'distanceKm', label: 'Distance KM' },
        { key: 'engineHours', label: 'Engine Hours' },
      ]}
      filterFields={[
        { key: 'companyId', label: 'Company', type: 'autocomplete', options: companyOpts },
        { key: 'vehicleId', label: 'Vehicle', type: 'autocomplete', optionsByForm: (f) => [{ value: '', label: 'All Vehicles' }, ...(vehicleOptsByCompany[String(f?.companyId || '')] || [])] },
        { key: 'driverId', label: 'Driver', type: 'autocomplete', optionsByForm: (f) => [{ value: '', label: 'All Drivers' }, ...(employeeOptsByCompany[String(f?.companyId || '')] || [])] },
        { key: 'projectId', label: 'Project', type: 'autocomplete', optionsByForm: (f) => [{ value: '', label: 'All Projects' }, ...(projectOptsByCompany[String(f?.companyId || '')] || [])] },
        { key: 'activityDate', label: 'Activity Date', type: 'date' },
      ]}
      formFields={[
        { key: 'companyId', label: 'Company', type: 'autocomplete', options: companyFormOpts, readonlyOnEdit: true },
        { key: 'companyCode', label: 'Company Code', readOnly: true },
        { key: 'vehicleId', label: 'Vehicle', type: 'autocomplete', optionsByForm: (f) => [{ value: '', label: 'Select Vehicle' }, ...(vehicleOptsByCompany[String(f?.companyId || '')] || [])] },
        { key: 'driverId', label: 'Driver', type: 'autocomplete', optionsByForm: (f) => [{ value: '', label: 'Select Driver' }, ...(employeeOptsByCompany[String(f?.companyId || '')] || [])] },
        { key: 'projectId', label: 'Project', type: 'autocomplete', optionsByForm: (f) => [{ value: '', label: 'Select Project' }, ...(projectOptsByCompany[String(f?.companyId || '')] || [])] },
        { key: 'activityDate', label: 'Activity Date', type: 'date' },
        { key: 'startTime', label: 'Start Time (ISO Timestamp)' },
        { key: 'endTime', label: 'End Time (ISO Timestamp)' },
        { key: 'startOdometerKm', label: 'Start Odometer KM', type: 'number' },
        { key: 'endOdometerKm', label: 'End Odometer KM', type: 'number' },
        { key: 'engineHours', label: 'Engine Hours', type: 'number' },
        { key: 'distanceKm', label: 'Distance KM', type: 'number' },
        { key: 'workDescription', label: 'Work Description', fullWidth: true, minWidth: 300 },
        { key: 'remarks', label: 'Remarks', fullWidth: true, minWidth: 300 },
      ]}
      defaultFilters={{ companyId: '', vehicleId: '', driverId: '', projectId: '', activityDate: '', sortBy: 'activityDate', sortDir: 'desc' }}
      emptyForm={{ companyId: '', companyCode: '', vehicleId: '', driverId: '', projectId: '', activityDate: '', startTime: '', endTime: '', startOdometerKm: '', endOdometerKm: '', engineHours: '', distanceKm: '', workDescription: '', remarks: '' }}
      normalizePayload={(f) => ({
        companyId: opt(f.companyId),
        companyCode: req(f.companyCode),
        vehicleId: opt(f.vehicleId),
        driverId: opt(f.driverId),
        projectId: opt(f.projectId),
        activityDate: opt(f.activityDate),
        startTime: opt(f.startTime),
        endTime: opt(f.endTime),
        startOdometerKm: toDecimal(f.startOdometerKm),
        endOdometerKm: toDecimal(f.endOdometerKm),
        engineHours: toDecimal(f.engineHours),
        distanceKm: toDecimal(f.distanceKm),
        workDescription: opt(f.workDescription),
        remarks: opt(f.remarks),
      })}
      onFormFieldChange={(n, k, v) => (k === 'companyId'
        ? { ...n, companyCode: companyById[String(v)]?.code || '', vehicleId: '', driverId: '', projectId: '' }
        : n)}
      mapRecordToForm={(r) => ({ companyId: '', companyCode: '', vehicleId: '', driverId: '', projectId: '', activityDate: '', startTime: '', endTime: '', startOdometerKm: '', endOdometerKm: '', engineHours: '', distanceKm: '', workDescription: '', remarks: '', ...(r || {}) })}
      listFetcher={vehicleDailyActivityService.list}
      getByIdFetcher={vehicleDailyActivityService.getById}
      createFetcher={vehicleDailyActivityService.create}
      updateFetcher={vehicleDailyActivityService.update}
      deleteFetcher={vehicleDailyActivityService.delete}
      autoSearch
      autoSearchDebounceMs={350}
      fitViewport
      viewportOffset={190}
    />
  );
}
