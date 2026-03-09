import BuildCircleRoundedIcon from '@mui/icons-material/BuildCircleRounded';
import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import CrudEntityPage from '../../organization/shared/CrudEntityPage';
import { useAuth } from '../../../app/AuthContext';
import { organizationService } from '../../../services/organizationService';
import { vehicleService } from '../../../services/vehicle_management/vehicle/vehicleService';
import { vehicleFilterTypeService } from '../../../services/vehicle_management/vehicle_filter_type/vehicleFilterTypeService';
import { vehicleFilterService } from '../../../services/vehicle_management/vehicle_filter/vehicleFilterService';
import { getOwnCompanyPrefill, opt, req, rowsFrom, toDecimal, toInt } from '../../employee_hr_management/shared/hrCrudCommon';

export default function VehicleFilterPage() {
  const theme = useTheme();
  const { token, auth } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [filterTypes, setFilterTypes] = useState([]);
  const [statusEnums, setStatusEnums] = useState([]);

  useEffect(() => {
    (async () => {
      if (!token) return;
      const settled = await Promise.allSettled([
        organizationService.listCompanies(token, { activeOnly: true }),
        vehicleService.list(token, {}),
        vehicleFilterTypeService.list(token, {}),
        organizationService.enumValues('filter_status', { locale: 'en-US', activeOnly: true }),
      ]);
      try {
        const getVal = (i) => (settled[i]?.status === 'fulfilled' ? settled[i].value : null);
        setCompanies(rowsFrom(getVal(0)).map((c) => ({ id: c.companyId, code: c.companyCode, name: c.companyName })));
        setVehicles(rowsFrom(getVal(1)));
        setFilterTypes(rowsFrom(getVal(2)));
        setStatusEnums(rowsFrom(getVal(3)));
      } catch {
        setCompanies([]);
        setVehicles([]);
        setFilterTypes([]);
        setStatusEnums([]);
      }
    })();
  }, [token]);

  const own = useMemo(() => getOwnCompanyPrefill(auth, companies), [auth, companies]);
  const companyById = useMemo(() => Object.fromEntries(companies.map((c) => [String(c.id), c])), [companies]);
  const vehicleLabelById = useMemo(() => Object.fromEntries(vehicles.map((v) => [String(v.vehicleId), `${v.vehicleCode || '-'} | ${v.registrationNumber || '-'}`])), [vehicles]);
  const filterTypeLabelById = useMemo(() => Object.fromEntries(filterTypes.map((f) => [String(f.filterTypeId), `${f.filterCode || '-'} - ${f.filterName || '-'}`])), [filterTypes]);
  const statusById = useMemo(() => Object.fromEntries(statusEnums.map((x) => [String(x.id), x.name])), [statusEnums]);

  const companyOpts = useMemo(() => [{ value: '', label: 'All Companies' }, ...companies.map((c) => ({ value: String(c.id), label: `${c.name} (${c.code})` }))], [companies]);
  const companyFormOpts = useMemo(() => [{ value: '', label: 'Select Company' }, ...companies.map((c) => ({ value: String(c.id), label: `${c.name} (${c.code})` }))], [companies]);
  const vehicleOptsByCompany = useMemo(() => {
    const m = {};
    vehicles.forEach((v) => { const k = String(v.companyId || ''); (m[k] ??= []).push({ value: String(v.vehicleId), label: vehicleLabelById[String(v.vehicleId)] }); });
    return m;
  }, [vehicles, vehicleLabelById]);
  const filterTypeOptsByCompany = useMemo(() => {
    const m = {};
    filterTypes.forEach((f) => { const k = String(f.companyId || ''); (m[k] ??= []).push({ value: String(f.filterTypeId), label: filterTypeLabelById[String(f.filterTypeId)] }); });
    return m;
  }, [filterTypes, filterTypeLabelById]);
  const statusOpts = useMemo(() => [{ value: '', label: 'All Statuses' }, ...statusEnums.map((x) => ({ value: String(x.id), label: x.name }))], [statusEnums]);
  const statusFormOpts = useMemo(() => [{ value: '', label: 'Select Status' }, ...statusEnums.map((x) => ({ value: String(x.id), label: x.name }))], [statusEnums]);

  return (
    <CrudEntityPage
      title="Vehicle Filters"
      icon={<BuildCircleRoundedIcon sx={{ color: '#fff', fontSize: 20 }} />}
      gradient={`linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`}
      idKey="filterId"
      prefillForm={own}
      prefillFilters={own ? { companyId: own.companyId } : null}
      columns={[
        { key: 'companyId', label: 'Company', render: (r) => companyById[String(r.companyId)]?.name || r.companyCode || '-' },
        { key: 'vehicleId', label: 'Vehicle', render: (r) => vehicleLabelById[String(r.vehicleId)] || '-' },
        { key: 'filterTypeId', label: 'Filter Type', render: (r) => filterTypeLabelById[String(r.filterTypeId)] || '-' },
        { key: 'serialNumber', label: 'Serial No' },
        { key: 'installedDate', label: 'Installed Date' },
        { key: 'statusId', label: 'Status', render: (r) => statusById[String(r.statusId)] || '-' },
      ]}
      filterFields={[
        { key: 'companyId', label: 'Company', type: 'autocomplete', options: companyOpts },
        { key: 'vehicleId', label: 'Vehicle', type: 'autocomplete', optionsByForm: (f) => [{ value: '', label: 'All Vehicles' }, ...(vehicleOptsByCompany[String(f?.companyId || '')] || [])] },
        { key: 'filterTypeId', label: 'Filter Type', type: 'autocomplete', optionsByForm: (f) => [{ value: '', label: 'All Filter Types' }, ...(filterTypeOptsByCompany[String(f?.companyId || '')] || [])] },
        { key: 'statusId', label: 'Status', type: 'autocomplete', options: statusOpts },
        { key: 'installedDate', label: 'Installed Date', type: 'date' },
      ]}
      formFields={[
        { key: 'companyId', label: 'Company', type: 'autocomplete', options: companyFormOpts, readonlyOnEdit: true },
        { key: 'companyCode', label: 'Company Code', readOnly: true },
        { key: 'vehicleId', label: 'Vehicle', type: 'autocomplete', optionsByForm: (f) => [{ value: '', label: 'Select Vehicle' }, ...(vehicleOptsByCompany[String(f?.companyId || '')] || [])] },
        { key: 'filterTypeId', label: 'Filter Type', type: 'autocomplete', optionsByForm: (f) => [{ value: '', label: 'Select Filter Type' }, ...(filterTypeOptsByCompany[String(f?.companyId || '')] || [])] },
        { key: 'serialNumber', label: 'Serial Number' },
        { key: 'installedDate', label: 'Installed Date', type: 'date' },
        { key: 'installedOdometerKm', label: 'Installed Odometer KM', type: 'number' },
        { key: 'installedEngineHours', label: 'Installed Engine Hours', type: 'number' },
        { key: 'recommendedReplacementKm', label: 'Recommended Replacement KM', type: 'number' },
        { key: 'recommendedReplacementHours', label: 'Recommended Replacement Hours', type: 'number' },
        { key: 'actualReplacementDate', label: 'Actual Replacement Date', type: 'date' },
        { key: 'actualReplacementKm', label: 'Actual Replacement KM', type: 'number' },
        { key: 'actualReplacementHours', label: 'Actual Replacement Hours', type: 'number' },
        { key: 'replacementReason', label: 'Replacement Reason' },
        { key: 'statusId', label: 'Status', type: 'autocomplete', options: statusFormOpts },
      ]}
      defaultFilters={{ companyId: '', vehicleId: '', filterTypeId: '', statusId: '', installedDate: '', sortBy: 'installedDate', sortDir: 'desc' }}
      emptyForm={{ companyId: '', companyCode: '', vehicleId: '', filterTypeId: '', serialNumber: '', installedDate: '', installedOdometerKm: '', installedEngineHours: '', recommendedReplacementKm: '', recommendedReplacementHours: '', actualReplacementDate: '', actualReplacementKm: '', actualReplacementHours: '', replacementReason: '', statusId: '' }}
      normalizePayload={(f) => ({
        companyId: opt(f.companyId),
        companyCode: req(f.companyCode),
        vehicleId: opt(f.vehicleId),
        filterTypeId: opt(f.filterTypeId),
        serialNumber: opt(f.serialNumber),
        installedDate: opt(f.installedDate),
        installedOdometerKm: toDecimal(f.installedOdometerKm),
        installedEngineHours: toDecimal(f.installedEngineHours),
        recommendedReplacementKm: toDecimal(f.recommendedReplacementKm),
        recommendedReplacementHours: toDecimal(f.recommendedReplacementHours),
        actualReplacementDate: opt(f.actualReplacementDate),
        actualReplacementKm: toDecimal(f.actualReplacementKm),
        actualReplacementHours: toDecimal(f.actualReplacementHours),
        replacementReason: opt(f.replacementReason),
        statusId: toInt(f.statusId),
      })}
      onFormFieldChange={(n, k, v) => (k === 'companyId' ? { ...n, companyCode: companyById[String(v)]?.code || '', vehicleId: '', filterTypeId: '' } : n)}
      mapRecordToForm={(r) => ({ companyId: '', companyCode: '', vehicleId: '', filterTypeId: '', serialNumber: '', installedDate: '', installedOdometerKm: '', installedEngineHours: '', recommendedReplacementKm: '', recommendedReplacementHours: '', actualReplacementDate: '', actualReplacementKm: '', actualReplacementHours: '', replacementReason: '', statusId: '', ...(r || {}) })}
      listFetcher={vehicleFilterService.list}
      getByIdFetcher={vehicleFilterService.getById}
      createFetcher={vehicleFilterService.create}
      updateFetcher={vehicleFilterService.update}
      deleteFetcher={vehicleFilterService.delete}
      autoSearch
      autoSearchDebounceMs={350}
      fitViewport
      viewportOffset={190}
    />
  );
}
