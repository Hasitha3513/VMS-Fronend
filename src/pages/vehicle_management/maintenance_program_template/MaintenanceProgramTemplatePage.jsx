import BuildCircleRoundedIcon from '@mui/icons-material/BuildCircleRounded';
import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import CrudEntityPage from '../../organization/shared/CrudEntityPage';
import { useAuth } from '../../../app/AuthContext';
import { maintenanceProgramTemplateService } from '../../../services/vehicle_management/maintenance_program_template/maintenanceProgramTemplateService';
import { getOwnCompanyPrefill, opt, req, rowsFrom, toBool, toDecimal, toInt } from '../../employee_hr_management/shared/hrCrudCommon';
import { organizationService } from '../../../services/organizationService';
import { vehicleTypeService } from '../../../services/vehicle_management/vehicle_type/vehicleTypeService';

export default function MaintenanceProgramTemplatePage() {
  const theme = useTheme();
  const { token, auth } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);

  useEffect(() => {
    (async () => {
      if (!token) return;
      const settled = await Promise.allSettled([organizationService.listCompanies(token, { activeOnly: true }), vehicleTypeService.list(token, { sortBy: 'typeName', sortDir: 'asc' })]);
      try {
        const getVal = (i) => (settled[i]?.status === 'fulfilled' ? settled[i].value : null);
        setCompanies(rowsFrom(getVal(0)).map((c) => ({ id: c.companyId, code: c.companyCode, name: c.companyName })));
        setVehicleTypes(rowsFrom(getVal(1)));
      } catch {
        setCompanies([]); setVehicleTypes([]);
        
        
      }
    })();
  }, [token]);

  const own = useMemo(() => getOwnCompanyPrefill(auth, companies), [auth, companies]);
  const companyById = useMemo(() => Object.fromEntries(companies.map((c) => [String(c.id), c])), [companies]);
  const companyOpts = useMemo(() => [{ value: '', label: 'All Companies' }, ...companies.map((c) => ({ value: String(c.id), label: `${c.name} (${c.code})` }))], [companies]);
  const companyFormOpts = useMemo(() => [{ value: '', label: 'Select Company' }, ...companies.map((c) => ({ value: String(c.id), label: `${c.name} (${c.code})` }))], [companies]);
  const vehicleTypeLabelById = useMemo(() => Object.fromEntries(vehicleTypes.map((x) => [String(x.typeId), x.typeName || x.typeCode || x.typeId])), [vehicleTypes]);
  const vehicleTypeOpts = useMemo(() => [{ value: '', label: 'All Vehicle Types' }, ...vehicleTypes.map((x) => ({ value: String(x.typeId), label: x.typeName || x.typeCode || x.typeId }))], [vehicleTypes]);
  const vehicleTypeFormOpts = useMemo(() => [{ value: '', label: 'Select Vehicle Type' }, ...vehicleTypes.map((x) => ({ value: String(x.typeId), label: x.typeName || x.typeCode || x.typeId }))], [vehicleTypes]);

  return (
    <CrudEntityPage
      title="Maintenance Program Templates"
      icon={<BuildCircleRoundedIcon sx={{ color: '#fff', fontSize: 20 }} />}
      gradient={`linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`}
      idKey="templateId"
      prefillForm={own}
      prefillFilters={own ? { companyId: own.companyId } : null}
      columns={[{ key: 'companyId', label: 'Company Id', render: (r) => companyById[String(r.companyId)]?.name || r.companyCode || '-' }, { key: 'programName', label: 'Program Name' }, { key: 'vehicleTypeId', label: 'Vehicle Type Id', render: (r) => vehicleTypeLabelById[String(r.vehicleTypeId)] || '-' }, { key: 'programType', label: 'Program Type' }, { key: 'intervalType', label: 'Interval Type' }, { key: 'intervalValue', label: 'Interval Value' }]}
      filterFields={[{ key: 'companyId', label: 'Company Id', type: 'autocomplete', options: companyOpts }, { key: 'vehicleTypeId', label: 'Vehicle Type Id', type: 'autocomplete', options: vehicleTypeOpts }]}
      formFields={[{ key: 'companyId', label: 'Company Id', type: 'autocomplete', options: companyFormOpts, readonlyOnEdit: true }, { key: 'companyCode', label: 'Company Code', readOnly: true }, { key: 'programName', label: 'Program Name' }, { key: 'vehicleTypeId', label: 'Vehicle Type Id', type: 'autocomplete', options: vehicleTypeFormOpts }, { key: 'programType', label: 'Program Type' }, { key: 'intervalType', label: 'Interval Type' }, { key: 'intervalValue', label: 'Interval Value', type: 'number' }, { key: 'checklistTemplate', label: 'Checklist Template (JSON)', fullWidth: true, minWidth: 320 }, { key: 'estimatedDurationHours', label: 'Estimated Duration Hours', type: 'number' }, { key: 'estimatedCost', label: 'Estimated Cost', type: 'number' }, { key: 'isActive', label: 'Is Active', type: 'boolean' }]}
      defaultFilters={{"companyId":"","vehicleTypeId":"","sortBy":"templateId","sortDir":"desc"}}
      emptyForm={{"companyId":"","companyCode":"","programName":"","vehicleTypeId":"","programType":"","intervalType":"","intervalValue":"","checklistTemplate":"","estimatedDurationHours":"","estimatedCost":"","isActive":""}}
      normalizePayload={(f) => ({ companyId: opt(f.companyId), companyCode: req(f.companyCode), programName: opt(f.programName), vehicleTypeId: opt(f.vehicleTypeId), programType: opt(f.programType), intervalType: opt(f.intervalType), intervalValue: toInt(f.intervalValue), checklistTemplate: opt(f.checklistTemplate), estimatedDurationHours: toDecimal(f.estimatedDurationHours), estimatedCost: toDecimal(f.estimatedCost), isActive: toBool(f.isActive) })}
      onFormFieldChange={(n, k, v) => (k === 'companyId' ? { ...n, companyCode: companyById[String(v)]?.code || '' } : n)}
      mapRecordToForm={(r) => ({ ...{"companyId":"","companyCode":"","programName":"","vehicleTypeId":"","programType":"","intervalType":"","intervalValue":"","checklistTemplate":"","estimatedDurationHours":"","estimatedCost":"","isActive":""}, ...(r || {}) })}
      listFetcher={maintenanceProgramTemplateService.list}
      getByIdFetcher={maintenanceProgramTemplateService.getById}
      createFetcher={maintenanceProgramTemplateService.create}
      updateFetcher={maintenanceProgramTemplateService.update}
      deleteFetcher={maintenanceProgramTemplateService.delete}
      autoSearch
      autoSearchDebounceMs={350}
      fitViewport
      viewportOffset={190}
    />
  );
}
