import EditRoadRoundedIcon from '@mui/icons-material/EditRoadRounded';
import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import CrudEntityPage from '../../organization/shared/CrudEntityPage';
import { useAuth } from '../../../app/AuthContext';
import { organizationService } from '../../../services/organizationService';
import { employeeService } from '../../../services/employee_hr_management/employee/employeeService';
import { vehicleService } from '../../../services/vehicle_management/vehicle/vehicleService';
import { vehicleRunningLogService } from '../../../services/vehicle_management/vehicle_running_log/vehicleRunningLogService';
import { getOwnCompanyPrefill, opt, req, rowsFrom, toDecimal, toInt } from '../../employee_hr_management/shared/hrCrudCommon';

export default function VehicleRunningLogPage() {
  const theme = useTheme();
  const { token, auth } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [workTypes, setWorkTypes] = useState([]);

  useEffect(() => {
    (async () => {
      if (!token) return;
      const settled = await Promise.allSettled([
        organizationService.listCompanies(token, { activeOnly: true }),
        vehicleService.list(token, {}),
        employeeService.listEmployees(token, { sortBy: 'firstName', sortDir: 'asc' }),
        organizationService.listProjects(token, { activeOnly: true }),
      organizationService.enumValues('work_type', { locale: 'en-US', activeOnly: true }),
      ]);
      try {
        setCompanies(rowsFrom(settled[0]?.status === 'fulfilled' ? settled[0].value : null).map((c) => ({ id: c.companyId, code: c.companyCode, name: c.companyName })));
        setVehicles(rowsFrom(settled[1]?.status === 'fulfilled' ? settled[1].value : null));
        setEmployees(rowsFrom(settled[2]?.status === 'fulfilled' ? settled[2].value : null).map((e) => ({ ...e, displayName: `${e.employeeCode || '-'} - ${`${e.firstName || ''} ${e.lastName || ''}`.trim() || e.employeeName || ''}`.trim() })));
        setProjects(rowsFrom(settled[3]?.status === 'fulfilled' ? settled[3].value : null));
        setWorkTypes(rowsFrom(settled[4]?.status === 'fulfilled' ? settled[4].value : null));
      } catch {
        setCompanies([]);
        setVehicles([]);
        setEmployees([]);
        setProjects([]);
        setWorkTypes([]);
      }
    })();
  }, [token]);

  const own = useMemo(() => getOwnCompanyPrefill(auth, companies), [auth, companies]);
  const companyById = useMemo(() => Object.fromEntries(companies.map((c) => [String(c.id), c])), [companies]);
  const vehicleLabelById = useMemo(() => Object.fromEntries(vehicles.map((v) => [String(v.vehicleId), `${v.vehicleCode || '-'} | ${v.registrationNumber || '-'}`])), [vehicles]);
  const employeeLabelById = useMemo(() => Object.fromEntries(employees.map((e) => [String(e.employeeId), e.displayName])), [employees]);
  const projectLabelById = useMemo(() => Object.fromEntries(projects.map((p) => [String(p.projectId), p.projectName || p.projectCode || p.projectId])), [projects]);
  const workTypeById = useMemo(() => Object.fromEntries(workTypes.map((x) => [String(x.id), x.name])), [workTypes]);

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
  const workTypeOpts = useMemo(() => [{ value: '', label: 'All Work Types' }, ...workTypes.map((x) => ({ value: String(x.id), label: x.name }))], [workTypes]);
  const workTypeFormOpts = useMemo(() => [{ value: '', label: 'Select Work Type' }, ...workTypes.map((x) => ({ value: String(x.id), label: x.name }))], [workTypes]);

  return (
    <CrudEntityPage
      title="Vehicle Running Logs"
      icon={<EditRoadRoundedIcon sx={{ color: '#fff', fontSize: 20 }} />}
      gradient={`linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`}
      idKey="logId"
      prefillForm={own}
      prefillFilters={own ? { companyId: own.companyId } : null}
      columns={[
        { key: 'startLogDate', label: 'Start Date' },
        { key: 'endLogDate', label: 'End Date' },
        { key: 'companyId', label: 'Company', render: (r) => companyById[String(r.companyId)]?.name || r.companyCode || '-' },
        { key: 'vehicleId', label: 'Vehicle', render: (r) => vehicleLabelById[String(r.vehicleId)] || '-' },
        { key: 'driverId', label: 'Driver', render: (r) => employeeLabelById[String(r.driverId)] || '-' },
        { key: 'workTypeId', label: 'Work Type', render: (r) => workTypeById[String(r.workTypeId)] || '-' },
        { key: 'totalDistance', label: 'Distance' },
      ]}
      filterFields={[
        { key: 'companyId', label: 'Company', type: 'autocomplete', options: companyOpts },
        { key: 'vehicleId', label: 'Vehicle', type: 'autocomplete', optionsByForm: (f) => [{ value: '', label: 'All Vehicles' }, ...(vehicleOptsByCompany[String(f?.companyId || '')] || [])] },
        { key: 'driverId', label: 'Driver', type: 'autocomplete', optionsByForm: (f) => [{ value: '', label: 'All Drivers' }, ...(employeeOptsByCompany[String(f?.companyId || '')] || [])] },
        { key: 'projectId', label: 'Project', type: 'autocomplete', optionsByForm: (f) => [{ value: '', label: 'All Projects' }, ...(projectOptsByCompany[String(f?.companyId || '')] || [])] },
        { key: 'workTypeId', label: 'Work Type', type: 'autocomplete', options: workTypeOpts },
        { key: 'startLogDate', label: 'Start Date', type: 'date' },
      ]}
      formFields={[
        { key: 'companyId', label: 'Company', type: 'autocomplete', options: companyFormOpts, readonlyOnEdit: true },
        { key: 'companyCode', label: 'Company Code', readOnly: true },
        { key: 'vehicleId', label: 'Vehicle', type: 'autocomplete', optionsByForm: (f) => [{ value: '', label: 'Select Vehicle' }, ...(vehicleOptsByCompany[String(f?.companyId || '')] || [])] },
        { key: 'driverId', label: 'Driver', type: 'autocomplete', optionsByForm: (f) => [{ value: '', label: 'Select Driver' }, ...(employeeOptsByCompany[String(f?.companyId || '')] || [])] },
        { key: 'projectId', label: 'Project', type: 'autocomplete', optionsByForm: (f) => [{ value: '', label: 'Select Project' }, ...(projectOptsByCompany[String(f?.companyId || '')] || [])] },
        { key: 'startLogDate', label: 'Start Date', type: 'date' },
        { key: 'endLogDate', label: 'End Date', type: 'date' },
        { key: 'startTime', label: 'Start Time (ISO Timestamp)' },
        { key: 'endTime', label: 'End Time (ISO Timestamp)' },
        { key: 'startOdometer', label: 'Start Odometer', type: 'number' },
        { key: 'startHourmeter', label: 'Start Hourmeter', type: 'number' },
        { key: 'endOdometer', label: 'End Odometer', type: 'number' },
        { key: 'endHourmeter', label: 'End Hourmeter', type: 'number' },
        { key: 'totalDistance', label: 'Total Distance', type: 'number', readOnly: true },
        { key: 'engineHours', label: 'Engine Hours', type: 'number' },
        { key: 'workTypeId', label: 'Work Type', type: 'autocomplete', options: workTypeFormOpts },
        { key: 'workDescription', label: 'Work Description', fullWidth: true, minWidth: 300 },
        { key: 'loadCapacityUsed', label: 'Load Capacity Used', type: 'number' },
        { key: 'tripsCount', label: 'Trips Count', type: 'number' },
        { key: 'operatorSignature', label: 'Operator Signature' },
        { key: 'supervisorApproval', label: 'Supervisor Approval', type: 'autocomplete', optionsByForm: (f) => [{ value: '', label: 'Select Supervisor' }, ...(employeeOptsByCompany[String(f?.companyId || '')] || [])] },
      ]}
      defaultFilters={{ companyId: '', vehicleId: '', driverId: '', projectId: '', workTypeId: '', startLogDate: '', sortBy: 'startLogDate', sortDir: 'desc' }}
      emptyForm={{ companyId: '', companyCode: '', vehicleId: '', driverId: '', projectId: '', startLogDate: '', endLogDate: '', startTime: '', endTime: '', startOdometer: '', startHourmeter: '', endOdometer: '', endHourmeter: '', totalDistance: '', engineHours: '', workTypeId: '', workDescription: '', loadCapacityUsed: '', tripsCount: '', operatorSignature: '', supervisorApproval: '' }}
      normalizePayload={(f) => ({
        companyId: opt(f.companyId),
        companyCode: req(f.companyCode),
        vehicleId: opt(f.vehicleId),
        driverId: opt(f.driverId),
        projectId: opt(f.projectId),
        startLogDate: opt(f.startLogDate),
        endLogDate: opt(f.endLogDate),
        startTime: opt(f.startTime),
        endTime: opt(f.endTime),
        startOdometer: toDecimal(f.startOdometer),
        startHourmeter: toDecimal(f.startHourmeter),
        endOdometer: toDecimal(f.endOdometer),
        endHourmeter: toDecimal(f.endHourmeter),
        engineHours: toDecimal(f.engineHours),
        workTypeId: toInt(f.workTypeId),
        workDescription: opt(f.workDescription),
        loadCapacityUsed: toDecimal(f.loadCapacityUsed),
        tripsCount: toInt(f.tripsCount),
        operatorSignature: opt(f.operatorSignature),
        supervisorApproval: opt(f.supervisorApproval),
      })}
      onFormFieldChange={(n, k, v) => (k === 'companyId'
        ? { ...n, companyCode: companyById[String(v)]?.code || '', vehicleId: '', driverId: '', projectId: '', supervisorApproval: '' }
        : n)}
      mapRecordToForm={(r) => ({ companyId: '', companyCode: '', vehicleId: '', driverId: '', projectId: '', startLogDate: '', endLogDate: '', startTime: '', endTime: '', startOdometer: '', startHourmeter: '', endOdometer: '', endHourmeter: '', totalDistance: '', engineHours: '', workTypeId: '', workDescription: '', loadCapacityUsed: '', tripsCount: '', operatorSignature: '', supervisorApproval: '', ...(r || {}) })}
      listFetcher={vehicleRunningLogService.list}
      getByIdFetcher={vehicleRunningLogService.getById}
      createFetcher={vehicleRunningLogService.create}
      updateFetcher={vehicleRunningLogService.update}
      deleteFetcher={vehicleRunningLogService.delete}
      autoSearch
      autoSearchDebounceMs={350}
      fitViewport
      viewportOffset={190}
    />
  );
}
