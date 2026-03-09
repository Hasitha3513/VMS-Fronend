import BuildCircleRoundedIcon from '@mui/icons-material/BuildCircleRounded';
import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import CrudEntityPage from '../../organization/shared/CrudEntityPage';
import { useAuth } from '../../../app/AuthContext';
import { breakdownRecordService } from '../../../services/vehicle_management/breakdown_record/breakdownRecordService';
import { getOwnCompanyPrefill, opt, req, rowsFrom, toBool, toDecimal, toInt } from '../../employee_hr_management/shared/hrCrudCommon';
import { organizationService } from '../../../services/organizationService';
import { vehicleService } from '../../../services/vehicle_management/vehicle/vehicleService';
import { employeeService } from '../../../services/employee_hr_management/employee/employeeService';

export default function BreakdownRecordPage() {
  const theme = useTheme();
  const { token, auth } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [breakdownTypeEnums, setBreakdownTypeEnums] = useState([]);
  const [severityEnums, setSeverityEnums] = useState([]);
  const [repairCategoryEnums, setRepairCategoryEnums] = useState([]);
  const [repairLocationEnums, setRepairLocationEnums] = useState([]);
  const [statusEnums, setStatusEnums] = useState([]);

  useEffect(() => {
    (async () => {
      if (!token) return;
      const settled = await Promise.allSettled([organizationService.listCompanies(token, { activeOnly: true }), vehicleService.list(token, {}), employeeService.listEmployees(token, { sortBy: 'firstName', sortDir: 'asc' }), organizationService.listProjects(token, { activeOnly: true }), organizationService.enumValues('breakdown_type', { locale: 'en-US', activeOnly: true }), organizationService.enumValues('breakdown_severity', { locale: 'en-US', activeOnly: true }), organizationService.enumValues('repair_category', { locale: 'en-US', activeOnly: true }), organizationService.enumValues('repair_location', { locale: 'en-US', activeOnly: true }), organizationService.enumValues('breakdown_status', { locale: 'en-US', activeOnly: true })]);
      try {
        const getVal = (i) => (settled[i]?.status === 'fulfilled' ? settled[i].value : null);
        setCompanies(rowsFrom(getVal(0)).map((c) => ({ id: c.companyId, code: c.companyCode, name: c.companyName })));
        setVehicles(rowsFrom(getVal(1)));
        setEmployees(rowsFrom(getVal(2)).map((e) => ({ ...e, displayName: [e.employeeCode || '-', [e.firstName || '', e.lastName || ''].join(' ').trim() || e.employeeName || e.employeeId].join(' - ') })));
        setProjects(rowsFrom(getVal(3)));
        setBreakdownTypeEnums(rowsFrom(getVal(4)));
        setSeverityEnums(rowsFrom(getVal(5)));
        setRepairCategoryEnums(rowsFrom(getVal(6)));
        setRepairLocationEnums(rowsFrom(getVal(7)));
        setStatusEnums(rowsFrom(getVal(8)));
      } catch {
        setCompanies([]); setVehicles([]); setEmployees([]); setProjects([]);
        
        setBreakdownTypeEnums([]); setSeverityEnums([]); setRepairCategoryEnums([]); setRepairLocationEnums([]); setStatusEnums([]);
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
  const projectLabelById = useMemo(() => Object.fromEntries(projects.map((p) => [String(p.projectId), p.projectName || p.projectCode || p.projectId])), [projects]);
  const projectOptsByCompany = useMemo(() => { const m = {}; projects.forEach((p) => { const k = String(p.companyId || ''); (m[k] ??= []).push({ value: String(p.projectId), label: p.projectName || p.projectCode || p.projectId }); }); return m; }, [projects]);
  const breakdownTypeEnumById = useMemo(() => Object.fromEntries(breakdownTypeEnums.map((x) => [String(x.id), x.name])), [breakdownTypeEnums]);
  const breakdownTypeEnumOpts = useMemo(() => [{ value: '', label: 'All Breakdown Type' }, ...breakdownTypeEnums.map((x) => ({ value: String(x.id), label: x.name }))], [breakdownTypeEnums]);
  const breakdownTypeEnumFormOpts = useMemo(() => [{ value: '', label: 'Select Breakdown Type' }, ...breakdownTypeEnums.map((x) => ({ value: String(x.id), label: x.name }))], [breakdownTypeEnums]);
  const severityEnumById = useMemo(() => Object.fromEntries(severityEnums.map((x) => [String(x.id), x.name])), [severityEnums]);
  const severityEnumOpts = useMemo(() => [{ value: '', label: 'All Severity' }, ...severityEnums.map((x) => ({ value: String(x.id), label: x.name }))], [severityEnums]);
  const severityEnumFormOpts = useMemo(() => [{ value: '', label: 'Select Severity' }, ...severityEnums.map((x) => ({ value: String(x.id), label: x.name }))], [severityEnums]);
  const repairCategoryEnumById = useMemo(() => Object.fromEntries(repairCategoryEnums.map((x) => [String(x.id), x.name])), [repairCategoryEnums]);
  const repairCategoryEnumOpts = useMemo(() => [{ value: '', label: 'All Repair Category' }, ...repairCategoryEnums.map((x) => ({ value: String(x.id), label: x.name }))], [repairCategoryEnums]);
  const repairCategoryEnumFormOpts = useMemo(() => [{ value: '', label: 'Select Repair Category' }, ...repairCategoryEnums.map((x) => ({ value: String(x.id), label: x.name }))], [repairCategoryEnums]);
  const repairLocationEnumById = useMemo(() => Object.fromEntries(repairLocationEnums.map((x) => [String(x.id), x.name])), [repairLocationEnums]);
  const repairLocationEnumOpts = useMemo(() => [{ value: '', label: 'All Repair Location' }, ...repairLocationEnums.map((x) => ({ value: String(x.id), label: x.name }))], [repairLocationEnums]);
  const repairLocationEnumFormOpts = useMemo(() => [{ value: '', label: 'Select Repair Location' }, ...repairLocationEnums.map((x) => ({ value: String(x.id), label: x.name }))], [repairLocationEnums]);
  const statusEnumById = useMemo(() => Object.fromEntries(statusEnums.map((x) => [String(x.id), x.name])), [statusEnums]);
  const statusEnumOpts = useMemo(() => [{ value: '', label: 'All Status' }, ...statusEnums.map((x) => ({ value: String(x.id), label: x.name }))], [statusEnums]);
  const statusEnumFormOpts = useMemo(() => [{ value: '', label: 'Select Status' }, ...statusEnums.map((x) => ({ value: String(x.id), label: x.name }))], [statusEnums]);

  return (
    <CrudEntityPage
      title="Breakdown Records"
      icon={<BuildCircleRoundedIcon sx={{ color: '#fff', fontSize: 20 }} />}
      gradient={`linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`}
      idKey="breakdownId"
      prefillForm={own}
      prefillFilters={own ? { companyId: own.companyId } : null}
      columns={[{ key: 'companyId', label: 'Company Id', render: (r) => companyById[String(r.companyId)]?.name || r.companyCode || '-' }, { key: 'vehicleId', label: 'Vehicle Id', render: (r) => vehicleLabelById[String(r.vehicleId)] || '-' }, { key: 'driverId', label: 'Driver Id', render: (r) => employeeLabelById[String(r.driverId)] || '-' }, { key: 'projectId', label: 'Project Id', render: (r) => projectLabelById[String(r.projectId)] || '-' }, { key: 'breakdownAt', label: 'Breakdown At' }, { key: 'location', label: 'Location' }]}
      filterFields={[{ key: 'companyId', label: 'Company Id', type: 'autocomplete', options: companyOpts }, { key: 'vehicleId', label: 'Vehicle Id', type: 'autocomplete', optionsByForm: (f) => [{ value: '', label: 'All Vehicles' }, ...(vehicleOptsByCompany[String(f?.companyId || '')] || [])] }, { key: 'driverId', label: 'Driver Id', type: 'autocomplete', optionsByForm: (f) => [{ value: '', label: 'All Employees' }, ...(employeeOptsByCompany[String(f?.companyId || '')] || [])] }, { key: 'projectId', label: 'Project Id', type: 'autocomplete', optionsByForm: (f) => [{ value: '', label: 'All Projects' }, ...(projectOptsByCompany[String(f?.companyId || '')] || [])] }, { key: 'breakdownTypeId', label: 'Breakdown Type Id', type: 'autocomplete', options: breakdownTypeEnumOpts }, { key: 'severityId', label: 'Severity Id', type: 'autocomplete', options: severityEnumOpts }]}
      formFields={[{ key: 'companyId', label: 'Company Id', type: 'autocomplete', options: companyFormOpts, readonlyOnEdit: true }, { key: 'companyCode', label: 'Company Code', readOnly: true }, { key: 'vehicleId', label: 'Vehicle Id', type: 'autocomplete', optionsByForm: (f) => [{ value: '', label: 'Select Vehicle' }, ...(vehicleOptsByCompany[String(f?.companyId || '')] || [])] }, { key: 'driverId', label: 'Driver Id', type: 'autocomplete', optionsByForm: (f) => [{ value: '', label: 'Select Employee' }, ...(employeeOptsByCompany[String(f?.companyId || '')] || [])] }, { key: 'projectId', label: 'Project Id', type: 'autocomplete', optionsByForm: (f) => [{ value: '', label: 'Select Project' }, ...(projectOptsByCompany[String(f?.companyId || '')] || [])] }, { key: 'breakdownAt', label: 'Breakdown At (ISO Timestamp)' }, { key: 'location', label: 'Location (Point x,y)' }, { key: 'odometerKm', label: 'Odometer Km', type: 'number' }, { key: 'breakdownTypeId', label: 'Breakdown Type Id', type: 'autocomplete', options: breakdownTypeEnumFormOpts }, { key: 'severityId', label: 'Severity Id', type: 'autocomplete', options: severityEnumFormOpts }, { key: 'description', label: 'Description', fullWidth: true, minWidth: 320 }, { key: 'repairCategoryId', label: 'Repair Category Id', type: 'autocomplete', options: repairCategoryEnumFormOpts }, { key: 'repairLocationId', label: 'Repair Location Id', type: 'autocomplete', options: repairLocationEnumFormOpts }, { key: 'statusId', label: 'Status Id', type: 'autocomplete', options: statusEnumFormOpts }]}
      defaultFilters={{"companyId":"","vehicleId":"","driverId":"","projectId":"","breakdownTypeId":"","severityId":"","sortBy":"createdAt","sortDir":"desc"}}
      emptyForm={{"companyId":"","companyCode":"","vehicleId":"","driverId":"","projectId":"","breakdownAt":"","location":"","odometerKm":"","breakdownTypeId":"","severityId":"","description":"","repairCategoryId":"","repairLocationId":"","statusId":""}}
      normalizePayload={(f) => ({ companyId: opt(f.companyId), companyCode: req(f.companyCode), vehicleId: opt(f.vehicleId), driverId: opt(f.driverId), projectId: opt(f.projectId), breakdownAt: opt(f.breakdownAt), location: opt(f.location), odometerKm: toDecimal(f.odometerKm), breakdownTypeId: toInt(f.breakdownTypeId), severityId: toInt(f.severityId), description: opt(f.description), repairCategoryId: toInt(f.repairCategoryId), repairLocationId: toInt(f.repairLocationId), statusId: toInt(f.statusId) })}
      onFormFieldChange={(n, k, v) => (k === 'companyId' ? { ...n, companyCode: companyById[String(v)]?.code || '', vehicleId: '', driverId: '', projectId: '' } : n)}
      mapRecordToForm={(r) => ({ ...{"companyId":"","companyCode":"","vehicleId":"","driverId":"","projectId":"","breakdownAt":"","location":"","odometerKm":"","breakdownTypeId":"","severityId":"","description":"","repairCategoryId":"","repairLocationId":"","statusId":""}, ...(r || {}) })}
      listFetcher={breakdownRecordService.list}
      getByIdFetcher={breakdownRecordService.getById}
      createFetcher={breakdownRecordService.create}
      updateFetcher={breakdownRecordService.update}
      deleteFetcher={breakdownRecordService.delete}
      autoSearch
      autoSearchDebounceMs={350}
      fitViewport
      viewportOffset={190}
    />
  );
}
