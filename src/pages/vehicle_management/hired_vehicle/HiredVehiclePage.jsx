import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { Alert, Box, CircularProgress, Grid, Paper, Tab, Tabs, Typography } from '@mui/material';
import CrudEntityPage from '../../organization/shared/CrudEntityPage';
import { useAuth } from '../../../app/AuthContext';
import { hiredVehicleService } from '../../../services/vehicle_management/hired_vehicle/hiredVehicleService';
import { vehicleCategoryService } from '../../../services/vehicle_management/vehicle_category/vehicleCategoryService';
import { vehicleManufacturerService } from '../../../services/vehicle_management/vehicle_manufacturer/vehicleManufacturerService';
import { vehicleModelService } from '../../../services/vehicle_management/vehicle_model/vehicleModelService';
import { vehicleTypeService } from '../../../services/vehicle_management/vehicle_type/vehicleTypeService';
import { vehicleService } from '../../../services/vehicle_management/vehicle/vehicleService';
import { distributorService } from '../../../services/vehicle_management/distributor/distributorService';
import { organizationService } from '../../../services/organizationService';
import { opt, req, rowsFrom, toBool, toDecimal, toInt } from '../../employee_hr_management/shared/hrCrudCommon';
import HiredVehicleProfilePanel from './HiredVehicleProfilePanel';

export default function HiredVehiclePage() {
  const theme = useTheme();
  const { token } = useAuth();
  const [tab, setTab] = useState(0);
  const [suppliers, setSuppliers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  const [vehicleModels, setVehicleModels] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [distributors, setDistributors] = useState([]);
  const [ownershipTypes, setOwnershipTypes] = useState([]);
  const [currentOwnershipOptions, setCurrentOwnershipOptions] = useState([]);
  const [operationalStatuses, setOperationalStatuses] = useState([]);
  const [consumptionMethods, setConsumptionMethods] = useState([]);
  const [registrationLookupRows, setRegistrationLookupRows] = useState([]);
  const [identificationCodeError, setIdentificationCodeError] = useState('');
  const [overview, setOverview] = useState({ totalVehicles: 0, activeVehicles: 0, inactiveVehicles: 0, totalTypes: 0, totalBrands: 0, vehicleTypeCounts: [] });
  const [overviewLoading, setOverviewLoading] = useState(false);

  useEffect(() => {
    (async () => {
      if (!token) return;
      const settled = await Promise.allSettled([
        hiredVehicleService.supplierOptions(token),
        vehicleCategoryService.list(token, { sortBy: 'categoryName', sortDir: 'asc' }),
        vehicleManufacturerService.list(token, { sortBy: 'manufacturerName', sortDir: 'asc' }),
        vehicleModelService.list(token, { sortBy: 'modelName', sortDir: 'asc' }),
        vehicleTypeService.list(token, { sortBy: 'typeName', sortDir: 'asc' }),
        distributorService.list(token, { sortBy: 'distributorName', sortDir: 'asc' }),
        hiredVehicleService.ownershipTypeOptions(token),
        vehicleService.list(token, { sortBy: 'updatedAt', sortDir: 'desc' }),
        organizationService.enumValues('operational_status', { locale: 'en-US', activeOnly: true }),
        organizationService.enumValues('consumption_method', { locale: 'en-US', activeOnly: true }),
      ]);
      const value = (idx) => (settled[idx]?.status === 'fulfilled' ? settled[idx].value : null);
      setSuppliers(rowsFrom(value(0)).map((s) => ({
        supplierId: s.supplierId || s.supplier_id || s.id,
        supplierCode: s.supplierCode || s.supplier_code || '',
        supplierName: s.supplierName || s.supplier_name || '',
        isActive: s.isActive ?? s.is_active ?? true,
      })).filter((s) => s.supplierId));
      setCategories(rowsFrom(value(1)));
      setManufacturers(rowsFrom(value(2)));
      setVehicleModels(rowsFrom(value(3)));
      setVehicleTypes(rowsFrom(value(4)));
      setDistributors(rowsFrom(value(5)));
      setOwnershipTypes(rowsFrom(value(6)).map((x) => ({
        id: x.id ?? x.typeId ?? x.type_id,
        code: x.code ?? x.typeCode ?? x.type_code,
        name: x.name ?? x.typeName ?? x.type_name,
      })).filter((x) => x.id != null));
      setRegistrationLookupRows(rowsFrom(value(7)));
      setOperationalStatuses(rowsFrom(value(8)));
      setConsumptionMethods(rowsFrom(value(9)));
    })();
  }, [token]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!token) return;
      setOverviewLoading(true);
      try {
        const res = await hiredVehicleService.overview(token, null);
        if (!ignore && res) {
          setOverview({
            totalVehicles: Number(res.totalVehicles || 0),
            activeVehicles: Number(res.activeVehicles || 0),
            inactiveVehicles: Number(res.inactiveVehicles || 0),
            totalTypes: Number(res.totalTypes || 0),
            totalBrands: Number(res.totalBrands || 0),
            vehicleTypeCounts: Array.isArray(res.vehicleTypeCounts) ? res.vehicleTypeCounts : [],
          });
        }
      } catch {
        if (!ignore) setOverview({ totalVehicles: 0, activeVehicles: 0, inactiveVehicles: 0, totalTypes: 0, totalBrands: 0, vehicleTypeCounts: [] });
      } finally {
        if (!ignore) setOverviewLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [token]);

  const supplierById = useMemo(() => Object.fromEntries(suppliers.map((s) => [String(s.supplierId), s])), [suppliers]);
  const ownershipCodeById = useMemo(
    () => Object.fromEntries(
      ownershipTypes.map((x) => [
        String(x.id),
        String(x.code || '')
          .toUpperCase()
          .replace(/[\s_-]+/g, ''),
      ])
    ),
    [ownershipTypes]
  );
  const ownershipNameById = useMemo(
    () => Object.fromEntries(ownershipTypes.map((x) => [String(x.id), String(x.name || x.code || x.id)])),
    [ownershipTypes]
  );
  const categoryById = useMemo(() => Object.fromEntries(categories.map((c) => [String(c.categoryId), c])), [categories]);
  const manufacturerById = useMemo(() => Object.fromEntries(manufacturers.map((m) => [String(m.manufacturerId), m])), [manufacturers]);
  const modelById = useMemo(() => Object.fromEntries(vehicleModels.map((m) => [String(m.modelId), m])), [vehicleModels]);
  const typeById = useMemo(() => Object.fromEntries(vehicleTypes.map((t) => [String(t.typeId), t])), [vehicleTypes]);
  const distributorById = useMemo(() => Object.fromEntries(distributors.map((d) => [String(d.distributorId), d])), [distributors]);
  const registrationLookupById = useMemo(
    () => Object.fromEntries(
      registrationLookupRows.map((r) => [String(r.vehicleId || ''), r]).filter(([k]) => k)
    ),
    [registrationLookupRows]
  );
  const latestVehicleByModelId = useMemo(() => {
    const map = {};
    registrationLookupRows.forEach((r) => {
      const mid = String(r?.modelId || '');
      if (!mid || map[mid]) return;
      map[mid] = r;
    });
    return map;
  }, [registrationLookupRows]);

  const supplierFilterOpts = useMemo(() => [{ value: '', label: 'All Suppliers' }, ...suppliers.map((s) => ({ value: String(s.supplierId), label: `${s.supplierName || '-'} (${s.supplierCode || '-'})` }))], [suppliers]);
  const supplierFormOpts = useMemo(() => [{ value: '', label: 'Select Supplier' }, ...suppliers.map((s) => ({ value: String(s.supplierId), label: `${s.supplierName || '-'} (${s.supplierCode || '-'})` }))], [suppliers]);
  const typeOpts = useMemo(() => [{ value: '', label: 'Select Vehicle Type' }, ...vehicleTypes.map((x) => ({ value: String(x.typeId), label: x.typeName || x.typeCode || x.typeId }))], [vehicleTypes]);
  const categoryOpts = useMemo(() => [{ value: '', label: 'Select Category' }, ...categories.map((x) => ({ value: String(x.categoryId), label: x.categoryName || x.categoryCode || x.categoryId }))], [categories]);
  const manufacturerOpts = useMemo(
    () => [
      { value: '', label: 'Select Manufacturer' },
      ...manufacturers.map((x) => {
        const brand = x.manufacturerBrand || x.manufacturerName || x.manufacturerId || '-';
        const country = x.country || '-';
        return { value: String(x.manufacturerId), label: `${brand} (${country})` };
      }),
    ],
    [manufacturers]
  );
  const modelOpts = useMemo(() => [{ value: '', label: 'Select Model' }, ...vehicleModels.map((x) => ({ value: String(x.modelId), label: x.modelName || x.modelCode || x.modelId }))], [vehicleModels]);
  const registrationSearchOpts = useMemo(
    () => [
      { value: '', label: 'Search Register Number' },
      ...registrationLookupRows
        .filter((r) => r?.registrationNumber)
        .map((r) => {
          const id = String(r.vehicleId || '');
          const modelName = modelById[String(r.modelId)]?.modelName || '-';
          const chassis = r.chassisNumber || '-';
          const registration = r.registrationNumber || '-';
          const engine = r.engineNumber || '-';
          return {
            value: id,
            label: `${registration} | ${modelName} | ${chassis} | ${engine}`,
          };
        })
        .filter((x) => x.value),
    ],
    [registrationLookupRows, modelById]
  );
  const distributorOpts = useMemo(() => [{ value: '', label: 'Select Distributor' }, ...distributors.map((x) => ({ value: String(x.distributorId), label: x.distributorName || x.distributorCode || x.distributorId }))], [distributors]);
  const ownershipOpts = useMemo(() => [{ value: '', label: 'Select Ownership Type' }, ...ownershipTypes.map((x) => ({ value: String(x.id), label: x.name }))], [ownershipTypes]);
  const currentOwnershipOpts = useMemo(() => [{ value: '', label: 'Select Current Ownership' }, ...currentOwnershipOptions], [currentOwnershipOptions]);
  const operationalOpts = useMemo(() => [{ value: '', label: 'Select Operational Status' }, ...operationalStatuses.map((x) => ({ value: String(x.id), label: x.name }))], [operationalStatuses]);
  const consumptionMethodOpts = useMemo(() => [{ value: '', label: 'Select Consumption Method' }, ...consumptionMethods.map((x) => ({ value: String(x.id), label: x.name }))], [consumptionMethods]);

  const refreshCurrentOwnershipOptions = async (supplierId, ownershipTypeId, fallbackCurrentOwnership = '') => {
    if (!token || !ownershipTypeId) {
      setCurrentOwnershipOptions([]);
      return [];
    }
    try {
      const params = { ownershipTypeId };
      if (supplierId) params.supplierId = supplierId;
      const rows = rowsFrom(await hiredVehicleService.currentOwnershipOptions(token, params));
      const options = rows.map((x) => {
        const supplierName = x.supplierName || x.supplier_name || x.name || '';
        const supplierCode = x.supplierCode || x.supplier_code || x.code || '';
        return {
          value: supplierName,
          label: supplierCode ? `${supplierName} (${supplierCode})` : supplierName,
        };
      }).filter((x) => x.value);
      if (fallbackCurrentOwnership && !options.some((x) => x.value === fallbackCurrentOwnership)) {
        options.unshift({ value: fallbackCurrentOwnership, label: fallbackCurrentOwnership });
      }
      setCurrentOwnershipOptions(options);
      return options;
    } catch {
      const fallback = fallbackCurrentOwnership ? [{ value: fallbackCurrentOwnership, label: fallbackCurrentOwnership }] : [];
      setCurrentOwnershipOptions(fallback);
      return fallback;
    }
  };

  const loadNextIdentificationCode = async (supplierId, typeId, fallback = '') => {
    if (!typeId) {
      return fallback;
    }
    try {
      const res = await hiredVehicleService.nextIdentification(token, supplierId, typeId);
      setIdentificationCodeError('');
      return String(res?.value || fallback || '');
    } catch (e) {
      setIdentificationCodeError(e?.message || 'Failed to generate Identification Code.');
      return fallback;
    }
  };

  return (
    <Box>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Overview" />
        <Tab label="Hired Vehicle Details" />
        <Tab label="Hired Vehicle Profile" />
      </Tabs>

      {tab === 0 && (
        <Box>
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Hired Vehicle Overview</Typography>
            {overviewLoading ? <CircularProgress size={20} sx={{ mt: 1 }} /> : null}
          </Paper>
          <Grid container spacing={2}>
            {[
              { label: 'Total Vehicles', value: overview.totalVehicles },
              { label: 'Active Vehicles', value: overview.activeVehicles },
              { label: 'Inactive Vehicles', value: overview.inactiveVehicles },
              { label: 'Vehicle Types', value: overview.totalTypes },
              { label: 'Brands', value: overview.totalBrands },
            ].map((item) => (
              <Grid key={item.label} item xs={12} sm={6} md={4}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="body2" color="text.secondary">{item.label}</Typography>
                  <Typography variant="h4" sx={{ mt: 1, fontWeight: 800 }}>{item.value}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
          <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Vehicle Count By Type</Typography>
            {(overview.vehicleTypeCounts || []).length === 0 ? (
              <Typography variant="body2" color="text.secondary">No vehicle type data.</Typography>
            ) : (
              <Grid container spacing={2}>
                {overview.vehicleTypeCounts.map((x, idx) => (
                  <Grid key={`${x.typeId || x.typeName || 'type'}-${idx}`} item xs={12} sm={6} md={4}>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                      <Typography variant="body2" color="text.secondary">{x.typeName || 'Unknown'}</Typography>
                      <Typography variant="h5" sx={{ mt: 1, fontWeight: 800 }}>{Number(x.vehicleCount || 0)}</Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        </Box>
      )}

      {tab === 1 && (
        <Box>
          {identificationCodeError ? (
            <Alert severity="warning" sx={{ mb: 1.5 }} onClose={() => setIdentificationCodeError('')}>
              {identificationCodeError}
            </Alert>
          ) : null}
        <CrudEntityPage
          title="Hired Vehicle Details"
          icon={<ApartmentRoundedIcon sx={{ color: '#fff', fontSize: 20 }} />}
          gradient={`linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`}
          idKey="hiredVehicleId"
          columns={[
            { key: 'supplierId', label: 'Supplier Name', render: (r) => supplierById[String(r.supplierId)]?.supplierName || '-' },
            { key: 'keyNumber', label: 'Identify Code' },
            { key: 'hiredVehicleManufactureBrand', label: 'Manufacture Brand', render: (r) => r.hiredVehicleManufactureBrand || manufacturerById[String(r.hiredVehicleManufacture)]?.manufacturerBrand || '-' },
            { key: 'hiredVehicleModelName', label: 'Vehicle Model', render: (r) => r.hiredVehicleModelName || modelById[String(r.hiredVehicleModel)]?.modelName || '-' },
            { key: 'registrationNumber', label: 'Register No' },
            { key: 'operationalStatusId', label: 'Operational Status', render: (r) => operationalOpts.find((x) => String(x.value) === String(r.operationalStatusId))?.label || '-' },
            { key: 'isActive', label: 'Active Status', render: (r) => (r.isActive ? 'Active' : 'Inactive') },
          ]}
          filterFields={[
            { key: 'supplierId', label: 'Supplier', type: 'autocomplete', options: supplierFilterOpts },
            { key: 'keyNumber_like', label: 'Identify Code' },
            { key: 'operationalStatusId', label: 'Operational', type: 'autocomplete', options: operationalOpts },
            { key: 'isActive', label: 'Status', type: 'boolean' },
            { key: 'q', label: 'Search' },
          ]}
          formFields={[
            { key: 'registrationLookupId', label: 'Search Register Number', type: 'autocomplete', options: registrationSearchOpts },
            { key: 'supplierId', label: 'Supplier', type: 'autocomplete', options: supplierFormOpts },
            { key: 'supplierCode', label: 'Supplier Code', readOnly: true },
            { key: 'hiredVehicleType', label: 'Vehicle Type', type: 'autocomplete', options: typeOpts },
            { key: 'categoryId', label: 'Vehicle Category', type: 'autocomplete', options: categoryOpts },
            { key: 'hiredVehicleManufacture', label: 'Manufacture Brand', type: 'autocomplete', options: manufacturerOpts },
            { key: 'hiredVehicleModel', label: 'Vehicle Model', type: 'autocomplete', options: modelOpts },
            { key: 'registrationNumber', label: 'Register Number' },
            { key: 'chassisNumber', label: 'Chassis Number' },
            { key: 'engineNumber', label: 'Engine Number' },
            { key: 'keyNumber', label: 'Identification Code' },
            { key: 'vehicleImage', label: 'Vehicle Image URL' },
            { key: 'manufactureYear', label: 'Manufacture Year', type: 'number' },
            { key: 'color', label: 'Color' },
            {
              key: 'ownershipTypeId',
              label: 'Ownership Type',
              type: 'autocomplete',
              optionsByForm: (f) => {
                const selected = String(f?.ownershipTypeId || '');
                if (!selected) return ownershipOpts;
                if (ownershipOpts.some((x) => String(x.value) === selected)) return ownershipOpts;
                return [
                  { value: selected, label: ownershipNameById[selected] || `Ownership ${selected}` },
                  ...ownershipOpts,
                ];
              },
            },
            {
              key: 'currentOwnership',
              label: 'Current Ownership',
              type: 'autocomplete',
              optionsByForm: (f) => {
                const existing = String(f?.currentOwnership || '');
                if (existing && !currentOwnershipOpts.some((x) => x.value === existing)) {
                  return [{ value: existing, label: existing }, ...currentOwnershipOpts];
                }
                return currentOwnershipOpts;
              },
            },
            { key: 'distributorId', label: 'Distributor', type: 'autocomplete', options: distributorOpts },
            { key: 'previousOwnersCount', label: 'Previous Owners', type: 'number' },
            { key: 'vehicleCondition', label: 'Vehicle Condition' },
            { key: 'operationalStatusId', label: 'Operational Status', type: 'autocomplete', options: operationalOpts },
            { key: 'initialOdometerKm', label: 'Initial Odometer KM', type: 'number' },
            { key: 'currentOdometerKm', label: 'Current Odometer KM', type: 'number' },
            { key: 'totalEngineHours', label: 'Total Engine Hours', type: 'number' },
            { key: 'consumptionMethodId', label: 'Consumption Method', type: 'autocomplete', options: consumptionMethodOpts },
            { key: 'ratedEfficiencyKmpl', label: 'Rated Efficiency (KMPL)', type: 'number' },
            { key: 'ratedConsumptionLph', label: 'Rated Consumption (LPH)', type: 'number' },
            { key: 'isActive', label: 'Is Active', type: 'boolean' },
            { key: 'notes', label: 'Notes', fullWidth: true, minWidth: 320 },
          ]}
          defaultFilters={{ supplierId: '', keyNumber_like: '', operationalStatusId: '', isActive: '', q: '', sortBy: 'updatedAt', sortDir: 'desc' }}
          emptyForm={{
            registrationLookupId: '',
            supplierId: '', supplierCode: '',
            hiredVehicleType: '', hiredVehicleModel: '', categoryId: '', hiredVehicleManufacture: '',
            registrationNumber: '', chassisNumber: '', engineNumber: '', keyNumber: '',
            vehicleImage: '', manufactureYear: String(new Date().getFullYear()), color: '', ownershipTypeId: '', currentOwnership: '', distributorId: '', previousOwnersCount: '',
            vehicleCondition: 'New', operationalStatusId: '', initialOdometerKm: '0', currentOdometerKm: '0',
            totalEngineHours: '0', consumptionMethodId: '', ratedEfficiencyKmpl: '', ratedConsumptionLph: '', notes: '', isActive: 'true',
          }}
          normalizePayload={(f) => {
            const ownershipTypeId = toInt(f.ownershipTypeId);
            if (ownershipTypeId == null) throw new Error('Ownership Type is required');
            return {
              supplierId: req(f.supplierId),
              supplierCode: req(f.supplierCode),
              hiredVehicleType: opt(f.hiredVehicleType),
              hiredVehicleModel: opt(f.hiredVehicleModel),
              categoryId: req(f.categoryId),
              hiredVehicleManufacture: req(f.hiredVehicleManufacture),
              registrationNumber: opt(f.registrationNumber),
              chassisNumber: req(f.chassisNumber),
              engineNumber: req(f.engineNumber),
              keyNumber: opt(f.keyNumber),
              vehicleImage: opt(f.vehicleImage),
              manufactureYear: toInt(f.manufactureYear) || new Date().getFullYear(),
              color: opt(f.color),
              ownershipTypeId,
              currentOwnership: opt(f.currentOwnership),
              distributorId: opt(f.distributorId),
              previousOwnersCount: toInt(f.previousOwnersCount),
              vehicleCondition: opt(f.vehicleCondition),
              operationalStatusId: toInt(f.operationalStatusId),
              vehicleStatusId: null,
              initialOdometerKm: toDecimal(f.initialOdometerKm),
              currentOdometerKm: toDecimal(f.currentOdometerKm),
              totalEngineHours: toDecimal(f.totalEngineHours),
              consumptionMethodId: toInt(f.consumptionMethodId),
              ratedEfficiencyKmpl: toDecimal(f.ratedEfficiencyKmpl),
              ratedConsumptionLph: toDecimal(f.ratedConsumptionLph),
              notes: opt(f.notes),
              isActive: toBool(f.isActive),
            };
          }}
          onFormFieldChange={async (next, key, value) => {
            if (key === 'registrationLookupId') {
              const selected = registrationLookupById[String(value || '')];
              if (!selected) return { ...next, registrationLookupId: '' };
              const nextTypeId = selected.typeId ? String(selected.typeId) : (selected.type_id ? String(selected.type_id) : '');
              const generatedKeyNumber = await loadNextIdentificationCode(next.supplierId, nextTypeId, next.keyNumber || '');
              const selectedOwnershipTypeId = selected.ownershipTypeId != null
                ? String(selected.ownershipTypeId)
                : (selected.ownership_type_id != null ? String(selected.ownership_type_id) : '');
              let selectedCurrentOwnership = String(selected.currentOwnership || selected.current_ownership || '');
              if (selectedOwnershipTypeId) {
                await refreshCurrentOwnershipOptions(next.supplierId, selectedOwnershipTypeId, selectedCurrentOwnership);
              }
              return {
                ...next,
                registrationLookupId: String(value || ''),
                hiredVehicleType: nextTypeId,
                categoryId: selected.categoryId ? String(selected.categoryId) : '',
                hiredVehicleManufacture: selected.manufacturerId ? String(selected.manufacturerId) : '',
                hiredVehicleModel: selected.modelId ? String(selected.modelId) : '',
                ownershipTypeId: selectedOwnershipTypeId,
                currentOwnership: selectedCurrentOwnership,
                registrationNumber: selected.registrationNumber || '',
                chassisNumber: selected.chassisNumber || '',
                engineNumber: selected.engineNumber || '',
                keyNumber: generatedKeyNumber,
                manufactureYear: selected.manufactureYear != null ? String(selected.manufactureYear) : (next.manufactureYear || ''),
                color: selected.color || '',
                distributorId: selected.distributorId ? String(selected.distributorId) : '',
                vehicleCondition: selected.vehicleCondition || next.vehicleCondition || '',
                operationalStatusId: selected.operationalStatusId != null ? String(selected.operationalStatusId) : '',
                vehicleImage: selected.vehicleImage || next.vehicleImage || '',
                initialOdometerKm: selected.initialOdometerKm != null ? String(selected.initialOdometerKm) : (next.initialOdometerKm || ''),
                currentOdometerKm: selected.currentOdometerKm != null ? String(selected.currentOdometerKm) : (next.currentOdometerKm || ''),
                totalEngineHours: selected.totalEngineHours != null ? String(selected.totalEngineHours) : (next.totalEngineHours || ''),
                consumptionMethodId: selected.consumptionMethodId != null ? String(selected.consumptionMethodId) : (next.consumptionMethodId || ''),
                ratedEfficiencyKmpl: selected.ratedEfficiencyKmpl != null ? String(selected.ratedEfficiencyKmpl) : (next.ratedEfficiencyKmpl || ''),
                ratedConsumptionLph: selected.ratedConsumptionLph != null ? String(selected.ratedConsumptionLph) : (next.ratedConsumptionLph || ''),
              };
            }
            if (key === 'supplierId') {
              const supplier = supplierById[String(value || '')];
              const nextCode = await loadNextIdentificationCode(value, next.hiredVehicleType, next.keyNumber || '');
              if (next.ownershipTypeId) {
                await refreshCurrentOwnershipOptions(String(value || ''), next.ownershipTypeId, '');
              } else {
                setCurrentOwnershipOptions([]);
              }
              return {
                ...next,
                registrationLookupId: '',
                supplierId: String(value || ''),
                supplierCode: supplier?.supplierCode || '',
                keyNumber: nextCode,
                currentOwnership: '',
              };
            }
            if (key === 'ownershipTypeId') {
              const nextOwnershipTypeId = String(value || '');
              const options = await refreshCurrentOwnershipOptions(next.supplierId, nextOwnershipTypeId, next.currentOwnership || '');
              const keepCurrent = options.some((x) => x.value === String(next.currentOwnership || ''));
              return {
                ...next,
                ownershipTypeId: nextOwnershipTypeId,
                currentOwnership: keepCurrent ? next.currentOwnership : '',
              };
            }
            if (key === 'hiredVehicleType') {
              const nextCode = await loadNextIdentificationCode(next.supplierId, value, next.keyNumber || '');
              return { ...next, hiredVehicleType: String(value || ''), keyNumber: nextCode };
            }
            if (key === 'hiredVehicleModel') {
              const selectedModel = modelById[String(value || '')];
              const latestVehicle = latestVehicleByModelId[String(value || '')];
              let modelPrefill = null;
              try {
                modelPrefill = await hiredVehicleService.modelPrefill(token, value, next.supplierId || '');
              } catch {
                modelPrefill = null;
              }
              const derivedTypeId = modelPrefill?.typeId ? String(modelPrefill.typeId) : (selectedModel?.typeId ? String(selectedModel.typeId) : (selectedModel?.type_id ? String(selectedModel.type_id) : String(next.hiredVehicleType || '')));
              const derivedCategoryId = modelPrefill?.categoryId ? String(modelPrefill.categoryId) : (selectedModel?.categoryId ? String(selectedModel.categoryId) : (selectedModel?.category_id ? String(selectedModel.category_id) : String(next.categoryId || '')));
              const derivedManufacturerId = modelPrefill?.manufacturerId ? String(modelPrefill.manufacturerId) : (selectedModel?.manufacturerId ? String(selectedModel.manufacturerId) : (selectedModel?.manufacturer_id ? String(selectedModel.manufacturer_id) : String(next.hiredVehicleManufacture || '')));
              const rawOwnershipTypeId = modelPrefill?.ownershipTypeId != null
                ? String(modelPrefill.ownershipTypeId)
                : (
                  latestVehicle?.ownershipTypeId != null
                    ? String(latestVehicle.ownershipTypeId)
                    : (latestVehicle?.ownership_type_id != null ? String(latestVehicle.ownership_type_id) : String(next.ownershipTypeId || ''))
                );
              const derivedOwnershipTypeId = rawOwnershipTypeId || String(next.ownershipTypeId || '');
              let derivedCurrentOwnership = modelPrefill?.currentOwnership != null
                ? String(modelPrefill.currentOwnership || '')
                : (
                  latestVehicle?.currentOwnership != null
                    ? String(latestVehicle.currentOwnership || '')
                    : (latestVehicle?.current_ownership != null ? String(latestVehicle.current_ownership || '') : String(next.currentOwnership || ''))
                );
              if (derivedOwnershipTypeId) {
                await refreshCurrentOwnershipOptions(next.supplierId, derivedOwnershipTypeId, derivedCurrentOwnership);
              }
              const nextCode = await loadNextIdentificationCode(next.supplierId, derivedTypeId, next.keyNumber || '');
              return {
                ...next,
                hiredVehicleModel: String(value || ''),
                hiredVehicleType: derivedTypeId,
                categoryId: derivedCategoryId,
                hiredVehicleManufacture: derivedManufacturerId,
                ownershipTypeId: derivedOwnershipTypeId,
                currentOwnership: derivedCurrentOwnership,
                initialOdometerKm: modelPrefill?.initialOdometerKm != null ? String(modelPrefill.initialOdometerKm) : String(next.initialOdometerKm || ''),
                currentOdometerKm: modelPrefill?.currentOdometerKm != null ? String(modelPrefill.currentOdometerKm) : String(next.currentOdometerKm || ''),
                totalEngineHours: modelPrefill?.totalEngineHours != null ? String(modelPrefill.totalEngineHours) : String(next.totalEngineHours || ''),
                consumptionMethodId: modelPrefill?.consumptionMethodId != null ? String(modelPrefill.consumptionMethodId) : String(next.consumptionMethodId || ''),
                ratedEfficiencyKmpl: modelPrefill?.ratedEfficiencyKmpl != null ? String(modelPrefill.ratedEfficiencyKmpl) : String(next.ratedEfficiencyKmpl || ''),
                ratedConsumptionLph: modelPrefill?.ratedConsumptionLph != null ? String(modelPrefill.ratedConsumptionLph) : String(next.ratedConsumptionLph || ''),
                keyNumber: nextCode,
              };
            }
            return next;
          }}
          mapRecordToForm={(r) => {
            const mapped = {
              ...r,
              registrationLookupId: String(r?.hiredVehicleId || ''),
              ownershipTypeId: r?.ownershipTypeId != null ? String(r.ownershipTypeId) : '',
              currentOwnership: r?.currentOwnership || '',
              isActive: (r?.isActive ?? true) ? 'true' : 'false',
            };
            if (mapped.ownershipTypeId) {
              void refreshCurrentOwnershipOptions(mapped.supplierId, mapped.ownershipTypeId, mapped.currentOwnership);
            } else {
              setCurrentOwnershipOptions([]);
            }
            return mapped;
          }}
          listFetcher={hiredVehicleService.list}
          getByIdFetcher={hiredVehicleService.getById}
          createFetcher={hiredVehicleService.create}
          updateFetcher={hiredVehicleService.update}
          deleteFetcher={hiredVehicleService.delete}
          autoSearch
          autoSearchDebounceMs={350}
          fitViewport
          viewportOffset={190}
        />
        </Box>
      )}

      {tab === 2 && (
        <HiredVehicleProfilePanel token={token} suppliers={suppliers} />
      )}
    </Box>
  );
}
