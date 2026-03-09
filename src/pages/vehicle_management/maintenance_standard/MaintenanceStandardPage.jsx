import BuildCircleRoundedIcon from '@mui/icons-material/BuildCircleRounded';
import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import CrudEntityPage from '../../organization/shared/CrudEntityPage';
import { useAuth } from '../../../app/AuthContext';
import { maintenanceStandardService } from '../../../services/vehicle_management/maintenance_standard/maintenanceStandardService';
import { getOwnCompanyPrefill, opt, req, rowsFrom, toBool, toDecimal, toInt } from '../../employee_hr_management/shared/hrCrudCommon';
import { organizationService } from '../../../services/organizationService';
import { vehicleTypeService } from '../../../services/vehicle_management/vehicle_type/vehicleTypeService';
import { maintenanceStrategyService } from '../../../services/vehicle_management/maintenance_strategy/maintenanceStrategyService';

export default function MaintenanceStandardPage() {
  const theme = useTheme();
  const { token, auth } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [maintenanceStrategyRows, setMaintenanceStrategyRows] = useState([]);
  const [categoryEnums, setCategoryEnums] = useState([]);

  useEffect(() => {
    (async () => {
      if (!token) return;
      const settled = await Promise.allSettled([organizationService.listCompanies(token, { activeOnly: true }), vehicleTypeService.list(token, { sortBy: 'typeName', sortDir: 'asc' }), maintenanceStrategyService.list(token, {}), organizationService.enumValues('maintenance_category', { locale: 'en-US', activeOnly: true })]);
      try {
        const getVal = (i) => (settled[i]?.status === 'fulfilled' ? settled[i].value : null);
        setCompanies(rowsFrom(getVal(0)).map((c) => ({ id: c.companyId, code: c.companyCode, name: c.companyName })));
        setVehicleTypes(rowsFrom(getVal(1)));
        setMaintenanceStrategyRows(rowsFrom(getVal(2)));
        setCategoryEnums(rowsFrom(getVal(3)));
      } catch {
        setCompanies([]); setVehicleTypes([]);
        setMaintenanceStrategyRows([]);
        setCategoryEnums([]);
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
  const maintenanceStrategyLabelById = useMemo(() => Object.fromEntries(maintenanceStrategyRows.map((r) => [String(r.strategyId), String(r.strategyName || r.strategyId)])), [maintenanceStrategyRows]);
  const maintenanceStrategyOpts = useMemo(() => [{ value: '', label: 'All Maintenance Strategies' }, ...maintenanceStrategyRows.map((r) => ({ value: String(r.strategyId), label: String(r.strategyName || r.strategyId) }))], [maintenanceStrategyRows]);
  const maintenanceStrategyFormOpts = useMemo(() => [{ value: '', label: 'Select Maintenance Strategy' }, ...maintenanceStrategyRows.map((r) => ({ value: String(r.strategyId), label: String(r.strategyName || r.strategyId) }))], [maintenanceStrategyRows]);
  const categoryEnumById = useMemo(() => Object.fromEntries(categoryEnums.map((x) => [String(x.id), x.name])), [categoryEnums]);
  const categoryEnumOpts = useMemo(() => [{ value: '', label: 'All Category' }, ...categoryEnums.map((x) => ({ value: String(x.id), label: x.name }))], [categoryEnums]);
  const categoryEnumFormOpts = useMemo(() => [{ value: '', label: 'Select Category' }, ...categoryEnums.map((x) => ({ value: String(x.id), label: x.name }))], [categoryEnums]);

  return (
    <CrudEntityPage
      title="Maintenance Standards"
      icon={<BuildCircleRoundedIcon sx={{ color: '#fff', fontSize: 20 }} />}
      gradient={`linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`}
      idKey="standardId"
      prefillForm={own}
      prefillFilters={own ? { companyId: own.companyId } : null}
      columns={[{ key: 'companyId', label: 'Company Id', render: (r) => companyById[String(r.companyId)]?.name || r.companyCode || '-' }, { key: 'typeId', label: 'Type Id', render: (r) => vehicleTypeLabelById[String(r.typeId)] || '-' }, { key: 'strategyId', label: 'Strategy Id', render: (r) => maintenanceStrategyLabelById[String(r.strategyId)] || '-' }, { key: 'standardCode', label: 'Standard Code' }, { key: 'name', label: 'Name' }, { key: 'categoryId', label: 'Category Id', render: (r) => categoryEnumById[String(r.categoryId)] || '-' }]}
      filterFields={[{ key: 'companyId', label: 'Company Id', type: 'autocomplete', options: companyOpts }, { key: 'typeId', label: 'Type Id', type: 'autocomplete', options: vehicleTypeOpts }, { key: 'strategyId', label: 'Strategy Id', type: 'autocomplete', options: maintenanceStrategyOpts }, { key: 'categoryId', label: 'Category Id', type: 'autocomplete', options: categoryEnumOpts }]}
      formFields={[{ key: 'companyId', label: 'Company Id', type: 'autocomplete', options: companyFormOpts, readonlyOnEdit: true }, { key: 'companyCode', label: 'Company Code', readOnly: true }, { key: 'typeId', label: 'Type Id', type: 'autocomplete', options: vehicleTypeFormOpts }, { key: 'strategyId', label: 'Strategy Id', type: 'autocomplete', options: maintenanceStrategyFormOpts }, { key: 'standardCode', label: 'Standard Code' }, { key: 'name', label: 'Name' }, { key: 'categoryId', label: 'Category Id', type: 'autocomplete', options: categoryEnumFormOpts }, { key: 'intervalKm', label: 'Interval Km', type: 'number' }, { key: 'intervalMonths', label: 'Interval Months', type: 'number' }, { key: 'intervalEngineHours', label: 'Interval Engine Hours', type: 'number' }, { key: 'checklist', label: 'Checklist (JSON)', fullWidth: true, minWidth: 320 }, { key: 'isActive', label: 'Is Active', type: 'boolean' }]}
      defaultFilters={{"companyId":"","typeId":"","strategyId":"","categoryId":"","sortBy":"standardId","sortDir":"desc"}}
      emptyForm={{"companyId":"","companyCode":"","typeId":"","strategyId":"","standardCode":"","name":"","categoryId":"","intervalKm":"","intervalMonths":"","intervalEngineHours":"","checklist":"","isActive":""}}
      normalizePayload={(f) => ({ companyId: opt(f.companyId), companyCode: req(f.companyCode), typeId: opt(f.typeId), strategyId: opt(f.strategyId), standardCode: opt(f.standardCode), name: opt(f.name), categoryId: toInt(f.categoryId), intervalKm: toInt(f.intervalKm), intervalMonths: toInt(f.intervalMonths), intervalEngineHours: toInt(f.intervalEngineHours), checklist: opt(f.checklist), isActive: toBool(f.isActive) })}
      onFormFieldChange={(n, k, v) => (k === 'companyId' ? { ...n, companyCode: companyById[String(v)]?.code || '' } : n)}
      mapRecordToForm={(r) => ({ ...{"companyId":"","companyCode":"","typeId":"","strategyId":"","standardCode":"","name":"","categoryId":"","intervalKm":"","intervalMonths":"","intervalEngineHours":"","checklist":"","isActive":""}, ...(r || {}) })}
      listFetcher={maintenanceStandardService.list}
      getByIdFetcher={maintenanceStandardService.getById}
      createFetcher={maintenanceStandardService.create}
      updateFetcher={maintenanceStandardService.update}
      deleteFetcher={maintenanceStandardService.delete}
      autoSearch
      autoSearchDebounceMs={350}
      fitViewport
      viewportOffset={190}
    />
  );
}
