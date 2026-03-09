import BuildCircleRoundedIcon from '@mui/icons-material/BuildCircleRounded';
import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import CrudEntityPage from '../../organization/shared/CrudEntityPage';
import { useAuth } from '../../../app/AuthContext';
import { vehicleMaintenanceProgramAssignmentService } from '../../../services/vehicle_management/vehicle_maintenance_program_assignment/vehicleMaintenanceProgramAssignmentService';
import { getOwnCompanyPrefill, opt, req, rowsFrom, toBool, toDecimal, toInt } from '../../employee_hr_management/shared/hrCrudCommon';
import { organizationService } from '../../../services/organizationService';
import { vehicleService } from '../../../services/vehicle_management/vehicle/vehicleService';
import { maintenanceProgramTemplateService } from '../../../services/vehicle_management/maintenance_program_template/maintenanceProgramTemplateService';

export default function VehicleMaintenanceProgramAssignmentPage() {
  const theme = useTheme();
  const { token, auth } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [maintenanceProgramTemplateRows, setMaintenanceProgramTemplateRows] = useState([]);

  useEffect(() => {
    (async () => {
      if (!token) return;
      const settled = await Promise.allSettled([organizationService.listCompanies(token, { activeOnly: true }), vehicleService.list(token, {}), maintenanceProgramTemplateService.list(token, {})]);
      try {
        const getVal = (i) => (settled[i]?.status === 'fulfilled' ? settled[i].value : null);
        setCompanies(rowsFrom(getVal(0)).map((c) => ({ id: c.companyId, code: c.companyCode, name: c.companyName })));
        setVehicles(rowsFrom(getVal(1)));
        setMaintenanceProgramTemplateRows(rowsFrom(getVal(2)));
      } catch {
        setCompanies([]); setVehicles([]);
        setMaintenanceProgramTemplateRows([]);
        
      }
    })();
  }, [token]);

  const own = useMemo(() => getOwnCompanyPrefill(auth, companies), [auth, companies]);
  const companyById = useMemo(() => Object.fromEntries(companies.map((c) => [String(c.id), c])), [companies]);
  const companyOpts = useMemo(() => [{ value: '', label: 'All Companies' }, ...companies.map((c) => ({ value: String(c.id), label: `${c.name} (${c.code})` }))], [companies]);
  const companyFormOpts = useMemo(() => [{ value: '', label: 'Select Company' }, ...companies.map((c) => ({ value: String(c.id), label: `${c.name} (${c.code})` }))], [companies]);
  const vehicleLabelById = useMemo(() => Object.fromEntries(vehicles.map((v) => [String(v.vehicleId), `${v.vehicleCode || '-'} | ${v.registrationNumber || '-'}`])), [vehicles]);
  const vehicleOptsByCompany = useMemo(() => { const m = {}; vehicles.forEach((v) => { const k = String(v.companyId || ''); (m[k] ??= []).push({ value: String(v.vehicleId), label: vehicleLabelById[String(v.vehicleId)] }); }); return m; }, [vehicles, vehicleLabelById]);
  const maintenanceProgramTemplateLabelById = useMemo(() => Object.fromEntries(maintenanceProgramTemplateRows.map((r) => [String(r.templateId), String(r.programName || r.templateId)])), [maintenanceProgramTemplateRows]);
  const maintenanceProgramTemplateOpts = useMemo(() => [{ value: '', label: 'All Maintenance Program Templates' }, ...maintenanceProgramTemplateRows.map((r) => ({ value: String(r.templateId), label: String(r.programName || r.templateId) }))], [maintenanceProgramTemplateRows]);
  const maintenanceProgramTemplateFormOpts = useMemo(() => [{ value: '', label: 'Select Maintenance Program Template' }, ...maintenanceProgramTemplateRows.map((r) => ({ value: String(r.templateId), label: String(r.programName || r.templateId) }))], [maintenanceProgramTemplateRows]);

  return (
    <CrudEntityPage
      title="Vehicle Maintenance Program Assignments"
      icon={<BuildCircleRoundedIcon sx={{ color: '#fff', fontSize: 20 }} />}
      gradient={`linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`}
      idKey="assignmentId"
      prefillForm={own}
      prefillFilters={own ? { companyId: own.companyId } : null}
      columns={[{ key: 'companyId', label: 'Company Id', render: (r) => companyById[String(r.companyId)]?.name || r.companyCode || '-' }, { key: 'vehicleId', label: 'Vehicle Id', render: (r) => vehicleLabelById[String(r.vehicleId)] || '-' }, { key: 'templateId', label: 'Template Id', render: (r) => maintenanceProgramTemplateLabelById[String(r.templateId)] || '-' }, { key: 'startDate', label: 'Start Date' }, { key: 'endDate', label: 'End Date' }, { key: 'currentOdometer', label: 'Current Odometer' }]}
      filterFields={[{ key: 'companyId', label: 'Company Id', type: 'autocomplete', options: companyOpts }, { key: 'vehicleId', label: 'Vehicle Id', type: 'autocomplete', optionsByForm: (f) => [{ value: '', label: 'All Vehicles' }, ...(vehicleOptsByCompany[String(f?.companyId || '')] || [])] }, { key: 'templateId', label: 'Template Id', type: 'autocomplete', options: maintenanceProgramTemplateOpts }, { key: 'startDate', label: 'Start Date', type: 'date' }, { key: 'endDate', label: 'End Date', type: 'date' }, { key: 'nextServiceDate', label: 'Next Service Date', type: 'date' }]}
      formFields={[{ key: 'companyId', label: 'Company Id', type: 'autocomplete', options: companyFormOpts, readonlyOnEdit: true }, { key: 'companyCode', label: 'Company Code', readOnly: true }, { key: 'vehicleId', label: 'Vehicle Id', type: 'autocomplete', optionsByForm: (f) => [{ value: '', label: 'Select Vehicle' }, ...(vehicleOptsByCompany[String(f?.companyId || '')] || [])] }, { key: 'templateId', label: 'Template Id', type: 'autocomplete', options: maintenanceProgramTemplateFormOpts }, { key: 'startDate', label: 'Start Date', type: 'date' }, { key: 'endDate', label: 'End Date', type: 'date' }, { key: 'currentOdometer', label: 'Current Odometer', type: 'number' }, { key: 'currentEngineHours', label: 'Current Engine Hours', type: 'number' }, { key: 'nextServiceDate', label: 'Next Service Date', type: 'date' }, { key: 'nextServiceOdometer', label: 'Next Service Odometer', type: 'number' }, { key: 'nextServiceHours', label: 'Next Service Hours', type: 'number' }, { key: 'isActive', label: 'Is Active', type: 'boolean' }]}
      defaultFilters={{"companyId":"","vehicleId":"","templateId":"","startDate":"","endDate":"","nextServiceDate":"","sortBy":"createdAt","sortDir":"desc"}}
      emptyForm={{"companyId":"","companyCode":"","vehicleId":"","templateId":"","startDate":"","endDate":"","currentOdometer":"","currentEngineHours":"","nextServiceDate":"","nextServiceOdometer":"","nextServiceHours":"","isActive":""}}
      normalizePayload={(f) => ({ companyId: opt(f.companyId), companyCode: req(f.companyCode), vehicleId: opt(f.vehicleId), templateId: opt(f.templateId), startDate: opt(f.startDate), endDate: opt(f.endDate), currentOdometer: toDecimal(f.currentOdometer), currentEngineHours: toDecimal(f.currentEngineHours), nextServiceDate: opt(f.nextServiceDate), nextServiceOdometer: toDecimal(f.nextServiceOdometer), nextServiceHours: toDecimal(f.nextServiceHours), isActive: toBool(f.isActive) })}
      onFormFieldChange={(n, k, v) => (k === 'companyId' ? { ...n, companyCode: companyById[String(v)]?.code || '', vehicleId: '' } : n)}
      mapRecordToForm={(r) => ({ ...{"companyId":"","companyCode":"","vehicleId":"","templateId":"","startDate":"","endDate":"","currentOdometer":"","currentEngineHours":"","nextServiceDate":"","nextServiceOdometer":"","nextServiceHours":"","isActive":""}, ...(r || {}) })}
      listFetcher={vehicleMaintenanceProgramAssignmentService.list}
      getByIdFetcher={vehicleMaintenanceProgramAssignmentService.getById}
      createFetcher={vehicleMaintenanceProgramAssignmentService.create}
      updateFetcher={vehicleMaintenanceProgramAssignmentService.update}
      deleteFetcher={vehicleMaintenanceProgramAssignmentService.delete}
      autoSearch
      autoSearchDebounceMs={350}
      fitViewport
      viewportOffset={190}
    />
  );
}
