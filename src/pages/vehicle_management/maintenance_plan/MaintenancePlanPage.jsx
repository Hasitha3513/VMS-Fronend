import BuildCircleRoundedIcon from '@mui/icons-material/BuildCircleRounded';
import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import CrudEntityPage from '../../organization/shared/CrudEntityPage';
import { useAuth } from '../../../app/AuthContext';
import { maintenancePlanService } from '../../../services/vehicle_management/maintenance_plan/maintenancePlanService';
import { getOwnCompanyPrefill, opt, req, rowsFrom, toBool, toDecimal, toInt } from '../../employee_hr_management/shared/hrCrudCommon';
import { organizationService } from '../../../services/organizationService';
import { vehicleService } from '../../../services/vehicle_management/vehicle/vehicleService';
import { employeeService } from '../../../services/employee_hr_management/employee/employeeService';

export default function MaintenancePlanPage() {
  const theme = useTheme();
  const { token, auth } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [planTypeEnums, setPlanTypeEnums] = useState([]);
  const [statusEnums, setStatusEnums] = useState([]);

  useEffect(() => {
    (async () => {
      if (!token) return;
      const settled = await Promise.allSettled([organizationService.listCompanies(token, { activeOnly: true }), vehicleService.list(token, {}), employeeService.listEmployees(token, { sortBy: 'firstName', sortDir: 'asc' }), organizationService.enumValues('maintenance_plan_type', { locale: 'en-US', activeOnly: true }), organizationService.enumValues('maintenance_plan_status', { locale: 'en-US', activeOnly: true })]);
      try {
        const getVal = (i) => (settled[i]?.status === 'fulfilled' ? settled[i].value : null);
        setCompanies(rowsFrom(getVal(0)).map((c) => ({ id: c.companyId, code: c.companyCode, name: c.companyName })));
        setVehicles(rowsFrom(getVal(1)));
        setEmployees(rowsFrom(getVal(2)).map((e) => ({ ...e, displayName: [e.employeeCode || '-', [e.firstName || '', e.lastName || ''].join(' ').trim() || e.employeeName || e.employeeId].join(' - ') })));
        setPlanTypeEnums(rowsFrom(getVal(3)));
        setStatusEnums(rowsFrom(getVal(4)));
      } catch {
        setCompanies([]); setVehicles([]); setEmployees([]);
        
        setPlanTypeEnums([]); setStatusEnums([]);
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
  const planTypeEnumById = useMemo(() => Object.fromEntries(planTypeEnums.map((x) => [String(x.id), x.name])), [planTypeEnums]);
  const planTypeEnumOpts = useMemo(() => [{ value: '', label: 'All Plan Type' }, ...planTypeEnums.map((x) => ({ value: String(x.id), label: x.name }))], [planTypeEnums]);
  const planTypeEnumFormOpts = useMemo(() => [{ value: '', label: 'Select Plan Type' }, ...planTypeEnums.map((x) => ({ value: String(x.id), label: x.name }))], [planTypeEnums]);
  const statusEnumById = useMemo(() => Object.fromEntries(statusEnums.map((x) => [String(x.id), x.name])), [statusEnums]);
  const statusEnumOpts = useMemo(() => [{ value: '', label: 'All Status' }, ...statusEnums.map((x) => ({ value: String(x.id), label: x.name }))], [statusEnums]);
  const statusEnumFormOpts = useMemo(() => [{ value: '', label: 'Select Status' }, ...statusEnums.map((x) => ({ value: String(x.id), label: x.name }))], [statusEnums]);

  return (
    <CrudEntityPage
      title="Maintenance Plans"
      icon={<BuildCircleRoundedIcon sx={{ color: '#fff', fontSize: 20 }} />}
      gradient={`linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`}
      idKey="planId"
      prefillForm={own}
      prefillFilters={own ? { companyId: own.companyId } : null}
      columns={[{ key: 'companyId', label: 'Company Id', render: (r) => companyById[String(r.companyId)]?.name || r.companyCode || '-' }, { key: 'vehicleId', label: 'Vehicle Id', render: (r) => vehicleLabelById[String(r.vehicleId)] || '-' }, { key: 'planName', label: 'Plan Name' }, { key: 'planTypeId', label: 'Plan Type Id', render: (r) => planTypeEnumById[String(r.planTypeId)] || '-' }, { key: 'startDate', label: 'Start Date' }, { key: 'endDate', label: 'End Date' }]}
      filterFields={[{ key: 'companyId', label: 'Company Id', type: 'autocomplete', options: companyOpts }, { key: 'vehicleId', label: 'Vehicle Id', type: 'autocomplete', optionsByForm: (f) => [{ value: '', label: 'All Vehicles' }, ...(vehicleOptsByCompany[String(f?.companyId || '')] || [])] }, { key: 'planTypeId', label: 'Plan Type Id', type: 'autocomplete', options: planTypeEnumOpts }, { key: 'startDate', label: 'Start Date', type: 'date' }, { key: 'endDate', label: 'End Date', type: 'date' }, { key: 'statusId', label: 'Status Id', type: 'autocomplete', options: statusEnumOpts }]}
      formFields={[{ key: 'companyId', label: 'Company Id', type: 'autocomplete', options: companyFormOpts, readonlyOnEdit: true }, { key: 'companyCode', label: 'Company Code', readOnly: true }, { key: 'vehicleId', label: 'Vehicle Id', type: 'autocomplete', optionsByForm: (f) => [{ value: '', label: 'Select Vehicle' }, ...(vehicleOptsByCompany[String(f?.companyId || '')] || [])] }, { key: 'planName', label: 'Plan Name' }, { key: 'planTypeId', label: 'Plan Type Id', type: 'autocomplete', options: planTypeEnumFormOpts }, { key: 'startDate', label: 'Start Date', type: 'date' }, { key: 'endDate', label: 'End Date', type: 'date' }, { key: 'totalEstimatedCost', label: 'Total Estimated Cost', type: 'number' }, { key: 'statusId', label: 'Status Id', type: 'autocomplete', options: statusEnumFormOpts }, { key: 'createdBy', label: 'Created By', type: 'autocomplete', optionsByForm: (f) => [{ value: '', label: 'Select Employee' }, ...(employeeOptsByCompany[String(f?.companyId || '')] || [])] }]}
      defaultFilters={{"companyId":"","vehicleId":"","planTypeId":"","startDate":"","endDate":"","statusId":"","sortBy":"createdAt","sortDir":"desc"}}
      emptyForm={{"companyId":"","companyCode":"","vehicleId":"","planName":"","planTypeId":"","startDate":"","endDate":"","totalEstimatedCost":"","statusId":"","createdBy":""}}
      normalizePayload={(f) => ({ companyId: opt(f.companyId), companyCode: req(f.companyCode), vehicleId: opt(f.vehicleId), planName: opt(f.planName), planTypeId: toInt(f.planTypeId), startDate: opt(f.startDate), endDate: opt(f.endDate), totalEstimatedCost: toDecimal(f.totalEstimatedCost), statusId: toInt(f.statusId), createdBy: opt(f.createdBy) })}
      onFormFieldChange={(n, k, v) => (k === 'companyId' ? { ...n, companyCode: companyById[String(v)]?.code || '', vehicleId: '', createdBy: '' } : n)}
      mapRecordToForm={(r) => ({ ...{"companyId":"","companyCode":"","vehicleId":"","planName":"","planTypeId":"","startDate":"","endDate":"","totalEstimatedCost":"","statusId":"","createdBy":""}, ...(r || {}) })}
      listFetcher={maintenancePlanService.list}
      getByIdFetcher={maintenancePlanService.getById}
      createFetcher={maintenancePlanService.create}
      updateFetcher={maintenancePlanService.update}
      deleteFetcher={maintenancePlanService.delete}
      autoSearch
      autoSearchDebounceMs={350}
      fitViewport
      viewportOffset={190}
    />
  );
}
