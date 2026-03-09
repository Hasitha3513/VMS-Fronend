import { useEffect, useMemo, useState } from 'react';
import { alpha, useTheme } from '@mui/material/styles';
import {
  Alert, Autocomplete, Box, Button, Card, CardContent, Chip, Grid, Stack, Tab, Tabs, TextField, Typography,
} from '@mui/material';
import DirectionsCarRoundedIcon from '@mui/icons-material/DirectionsCarRounded';
import AssignmentIndRoundedIcon from '@mui/icons-material/AssignmentIndRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import EditRoadRoundedIcon from '@mui/icons-material/EditRoadRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import LocalGasStationRoundedIcon from '@mui/icons-material/LocalGasStationRounded';

import { useAuth } from '../app/AuthContext';
import CrudEntityPage from './organization/shared/CrudEntityPage';
import { organizationService } from '../services/organizationService';
import { employeeService } from '../services/employee_hr_management/employee/employeeService';
import { vehicleService } from '../services/vehicle_management/vehicle/vehicleService';
import { vehicleAssignmentService } from '../services/vehicle_management/vehicle_assignment/vehicleAssignmentService';
import { vehicleModelService } from '../services/vehicle_management/vehicle_model/vehicleModelService';
import { vehicleModelVariantService } from '../services/vehicle_management/vehicle_model_variant/vehicleModelVariantService';
import { vehicleTypeService } from '../services/vehicle_management/vehicle_type/vehicleTypeService';
import { vehicleManufacturerService } from '../services/vehicle_management/vehicle_manufacturer/vehicleManufacturerService';
import { vehicleCategoryService } from '../services/vehicle_management/vehicle_category/vehicleCategoryService';
import { distributorService } from '../services/vehicle_management/distributor/distributorService';
import { fmtMoney, getOwnCompanyPrefill, opt, req, rowsFrom, toBool, toDecimal, toInt } from './employee_hr_management/shared/hrCrudCommon';

function TabPanel({ value, index, children }) { if (value !== index) return null; return <Box sx={{ mt: 2 }}>{children}</Box>; }


function VehicleOverviewCard({ vehicle, companyById, branchById, projectById, employeeById, modelById, typeById, categoryById, manufacturerById, ownershipById, operationalById, consumptionById }) {
  const theme = useTheme();
  if (!vehicle) return <Card sx={{ borderRadius: 2 }}><CardContent sx={{ py: 8, textAlign: 'center' }}><DirectionsCarRoundedIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 1 }} /><Typography variant="h6" color="text.secondary">Select a vehicle to view details</Typography></CardContent></Card>;
  const company = companyById[String(vehicle.companyId)];
  const branch = branchById[String(vehicle.branchId)];
  const project = projectById[String(vehicle.currentProjectId)];
  const driver = employeeById[String(vehicle.currentDriverId)];
  const model = modelById[String(vehicle.modelId)];
  const type = typeById[String(model?.typeId)];
  const manufacturer = manufacturerById[String(model?.manufacturerId)];
  const categoryName = categoryById[String(model?.categoryId)]?.categoryName || categoryById[String(type?.categoryId)]?.categoryName || null;
  const tiles = [
    { label: 'Vehicle Type', value: type?.typeName || '-', icon: <DirectionsCarRoundedIcon sx={{ fontSize: 18 }} /> },
    { label: 'Vehicle Category', value: categoryName || '-', icon: <BadgeRoundedIcon sx={{ fontSize: 18 }} /> },
    { label: 'Register Number', value: vehicle.registrationNumber || '-', icon: <BadgeRoundedIcon sx={{ fontSize: 18 }} /> },
    { label: 'Chassis Number', value: vehicle.chassisNumber || '-', icon: <BadgeRoundedIcon sx={{ fontSize: 18 }} /> },
    { label: 'Engine Number', value: vehicle.engineNumber || '-', icon: <SettingsRoundedIcon sx={{ fontSize: 18 }} /> },
    { label: 'Odometer KM', value: fmtMoney(vehicle.currentOdometerKm), icon: <SpeedRoundedIcon sx={{ fontSize: 18 }} /> },
    { label: 'Engine Hours', value: fmtMoney(vehicle.totalEngineHours), icon: <SettingsRoundedIcon sx={{ fontSize: 18 }} /> },
    { label: 'Consumption Method', value: consumptionById[String(vehicle.consumptionMethodId)] || '-', icon: <LocalGasStationRoundedIcon sx={{ fontSize: 18 }} /> },
    { label: 'Company', value: company?.name || vehicle.companyCode || '-', icon: <BusinessRoundedIcon sx={{ fontSize: 18 }} /> },
    { label: 'Branch', value: branch?.branchName || '-', icon: <BusinessRoundedIcon sx={{ fontSize: 18 }} /> },
    { label: 'Driver', value: driver?.name || '-', icon: <AssignmentIndRoundedIcon sx={{ fontSize: 18 }} /> },
    { label: 'Project', value: project?.projectName || '-', icon: <BadgeRoundedIcon sx={{ fontSize: 18 }} /> },
  ];
  return (
    <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: alpha(theme.palette.primary.main, 0.16), background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.05)}, transparent)` }}>
      <CardContent sx={{ p: 3 }}>
        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3}>
          <Box sx={{ width: { xs: '100%', lg: 320 }, minWidth: { xs: '100%', lg: 320 }, p: 2.5, borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: alpha(theme.palette.background.paper, 0.6) }}>
            <Stack spacing={1.5} alignItems="center">
              <Box sx={{ width: 88, height: 88, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})` }}><DirectionsCarRoundedIcon sx={{ color: '#fff', fontSize: 44 }} /></Box>
              <Box textAlign="center">
                <Typography variant="h6" sx={{ fontWeight: 800 }}>{manufacturer?.manufacturerName || 'Vehicle Manufacturer'}</Typography>
                <Typography variant="body1" sx={{ fontWeight: 700 }}>{model?.modelName || 'Vehicle Model'}</Typography>
                <Typography variant="body2" color="text.secondary">{vehicle.registrationNumber || vehicle.chassisNumber || '-'}</Typography>
              </Box>
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" justifyContent="center"><Chip size="small" label={operationalById[String(vehicle.operationalStatusId)] || 'No Status'} /><Chip size="small" label={ownershipById[String(vehicle.ownershipTypeId)] || 'No Ownership'} variant="outlined" /><Chip size="small" label={vehicle.isActive ? 'Active' : 'Inactive'} color={vehicle.isActive ? 'success' : 'default'} /></Stack>
              <Box sx={{ width: '100%', mt: 1 }}>
                <Typography variant="caption" color="text.secondary">Type / Category</Typography><Typography variant="body2">{type?.typeName || '-'} / {categoryName || '-'}</Typography>
                <Typography variant="caption" color="text.secondary">Year / Color / Country</Typography><Typography variant="body2">{vehicle.manufactureYear || '-'} / {vehicle.color || '-'} / {vehicle.country || '-'}</Typography>
                <Typography variant="caption" color="text.secondary">Registration / Chassis / Engine</Typography><Typography variant="body2" sx={{ wordBreak: 'break-word' }}>{vehicle.registrationNumber || '-'} / {vehicle.chassisNumber || '-'} / {vehicle.engineNumber || '-'}</Typography>
              </Box>
            </Stack>
          </Box>
          <Box sx={{ flex: 1 }}><Grid container spacing={1.5}>
            {tiles.map((tile) => <Grid key={tile.label} size={{ xs: 12, md: 6 }}><Box sx={{ p: 1.5, borderRadius: 1.5, border: '1px solid', borderColor: 'divider', bgcolor: alpha(theme.palette.background.paper, 0.5), minHeight: 74 }}><Stack direction="row" spacing={1.25}><Box sx={{ width: 34, height: 34, borderRadius: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.12), color: theme.palette.primary.main, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{tile.icon}</Box><Box sx={{ minWidth: 0 }}><Typography variant="caption" color="text.secondary">{tile.label}</Typography><Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>{tile.value || '-'}</Typography></Box></Stack></Box></Grid>)}
            <Grid size={{ xs: 12 }}><Box sx={{ p: 1.5, borderRadius: 1.5, border: '1px solid', borderColor: 'divider' }}><Typography variant="caption" color="text.secondary">Notes / Decommission</Typography><Typography variant="body2" sx={{ mt: 0.5 }}>{vehicle.notes || 'No notes'}</Typography>{vehicle.decommissionDate && <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>Decommission: {vehicle.decommissionDate} {vehicle.decommissionReason ? `(${vehicle.decommissionReason})` : ''}</Typography>}</Box></Grid>
          </Grid></Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function VehicleDetailsPage() {
  const theme = useTheme();
  const { token, auth } = useAuth();
  const [tab, setTab] = useState(0);
  const [error, setError] = useState('');
  const [loadingLookups, setLoadingLookups] = useState(false);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [companies, setCompanies] = useState([]); const [branches, setBranches] = useState([]); const [projects, setProjects] = useState([]); const [employees, setEmployees] = useState([]);
  const [vehicleRows, setVehicleRows] = useState([]); const [vehicleModels, setVehicleModels] = useState([]); const [vehicleTypes, setVehicleTypes] = useState([]); const [vehicleManufacturers, setVehicleManufacturers] = useState([]); const [vehicleCategories, setVehicleCategories] = useState([]);
  const [distributors, setDistributors] = useState([]);
  const [vehicleModelVariants, setVehicleModelVariants] = useState([]);
  const [ownershipTypes, setOwnershipTypes] = useState([]); const [operationalStatuses, setOperationalStatuses] = useState([]); const [consumptionMethods, setConsumptionMethods] = useState([]); const [assignmentTypes, setAssignmentTypes] = useState([]); const [assignmentStatuses, setAssignmentStatuses] = useState([]);
  const [fuelTypes, setFuelTypes] = useState([]); const [transmissionTypes, setTransmissionTypes] = useState([]); const [numberPlateTypes, setNumberPlateTypes] = useState([]); const [bodyStyles, setBodyStyles] = useState([]);
  const [undercarriageTypes, setUndercarriageTypes] = useState([]); const [engineTypes, setEngineTypes] = useState([]); const [engineManufactures, setEngineManufactures] = useState([]); const [vehicleStatuses, setVehicleStatuses] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState(''); const [selectedVehicleId, setSelectedVehicleId] = useState('');
  useEffect(() => { (async () => {
    if (!token) return; setLoadingLookups(true); setError('');
    const settled = await Promise.allSettled([
      organizationService.listCompanies(token, { activeOnly: true }),
      organizationService.listBranches(token, { activeOnly: true }),
      organizationService.listProjects(token, { activeOnly: true }),
      employeeService.listEmployees(token, { sortBy: 'firstName', sortDir: 'asc' }),
      vehicleModelService.list(token, { sortBy: 'modelName', sortDir: 'asc' }),
      vehicleModelVariantService.list(token, { sortBy: 'variantName', sortDir: 'asc' }),
      vehicleCategoryService.list(token, { sortBy: 'categoryName', sortDir: 'asc' }),
      vehicleTypeService.list(token, { sortBy: 'typeName', sortDir: 'asc' }),
      vehicleManufacturerService.list(token, { sortBy: 'manufacturerName', sortDir: 'asc' }),
      distributorService.list(token, { sortBy: 'distributorName', sortDir: 'asc' }),
      organizationService.enumValues('ownership_type', { locale: 'en-US', activeOnly: true }),
      organizationService.enumValues('operational_status', { locale: 'en-US', activeOnly: true }),
      organizationService.enumValues('consumption_method', { locale: 'en-US', activeOnly: true }),
      organizationService.enumValues('assignment_type', { locale: 'en-US', activeOnly: true }),
      organizationService.enumValues('assignment_status', { locale: 'en-US', activeOnly: true }),
      organizationService.enumValues('fuel_type', { locale: 'en-US', activeOnly: true }),
      organizationService.enumValues('transmission_type', { locale: 'en-US', activeOnly: true }),
      organizationService.enumValues('number_plate_type', { locale: 'en-US', activeOnly: true }),
      organizationService.enumValues('body_style', { locale: 'en-US', activeOnly: true }),
      organizationService.enumValues('undercarriage_type', { locale: 'en-US', activeOnly: true }),
      organizationService.enumValues('engine_type', { locale: 'en-US', activeOnly: true }),
      organizationService.enumValues('engine_manufacture', { locale: 'en-US', activeOnly: true }),
      organizationService.enumValues('vehicle_status', { locale: 'en-US', activeOnly: true }),
    ]);

    const getVal = (idx) => (settled[idx]?.status === 'fulfilled' ? settled[idx].value : null);
    const getErr = (idx) => (settled[idx]?.status === 'rejected' ? settled[idx].reason : null);

    try {
      const companiesRes = getVal(0);
      const branchesRes = getVal(1);
      const projectsRes = getVal(2);
      const employeesRes = getVal(3);
      const modelsRes = getVal(4);
      const modelVariantsRes = getVal(5);
      const categoriesRes = getVal(6);
      const typesRes = getVal(7);
      const manufacturersRes = getVal(8);
      const distributorsRes = getVal(9);
      const ownershipRes = getVal(10);
      const operationalRes = getVal(11);
      const consumptionRes = getVal(12);
      const assignmentTypeRes = getVal(13);
      const assignmentStatusRes = getVal(14);
      const fuelTypesRes = getVal(15);
      const transmissionTypesRes = getVal(16);
      const numberPlateTypesRes = getVal(17);
      const bodyStylesRes = getVal(18);
      const undercarriageTypesRes = getVal(19);
      const engineTypesRes = getVal(20);
      const engineManufacturesRes = getVal(21);
      const vehicleStatusesRes = getVal(22);

      setCompanies(rowsFrom(companiesRes).map((c) => ({ id: c.companyId, code: c.companyCode, name: c.companyName })));
      setBranches(rowsFrom(branchesRes));
      setProjects(rowsFrom(projectsRes));
      setEmployees(rowsFrom(employeesRes).map((e) => ({ ...e, name: `${e.firstName || ''} ${e.lastName || ''}`.trim() || e.employeeCode || e.employeeId })));
      setVehicleModels(rowsFrom(modelsRes));
      setVehicleModelVariants(rowsFrom(modelVariantsRes));
      setVehicleCategories(rowsFrom(categoriesRes));
      setVehicleTypes(rowsFrom(typesRes));
      setVehicleManufacturers(rowsFrom(manufacturersRes));
      setDistributors(rowsFrom(distributorsRes));
      setOwnershipTypes(rowsFrom(ownershipRes));
      setOperationalStatuses(rowsFrom(operationalRes));
      setConsumptionMethods(rowsFrom(consumptionRes));
      setAssignmentTypes(rowsFrom(assignmentTypeRes));
      setAssignmentStatuses(rowsFrom(assignmentStatusRes));
      setFuelTypes(rowsFrom(fuelTypesRes));
      setTransmissionTypes(rowsFrom(transmissionTypesRes));
      setNumberPlateTypes(rowsFrom(numberPlateTypesRes));
      setBodyStyles(rowsFrom(bodyStylesRes));
      setUndercarriageTypes(rowsFrom(undercarriageTypesRes));
      setEngineTypes(rowsFrom(engineTypesRes));
      setEngineManufactures(rowsFrom(engineManufacturesRes));
      setVehicleStatuses(rowsFrom(vehicleStatusesRes));

      const criticalFailed = [0, 4, 5, 6, 7, 10, 11].some((idx) => settled[idx]?.status === 'rejected');
      if (criticalFailed) {
        const firstCriticalError = [0, 4, 5, 6, 7, 10, 11].map(getErr).find(Boolean);
        setError(firstCriticalError?.message || 'Some required dropdowns failed to load');
      }
    } finally { setLoadingLookups(false); }
  })(); }, [token]);

  const loadVehicles = async () => {
    if (!token) return; setLoadingVehicles(true); setError('');
    try { const res = await vehicleService.list(token, {}); setVehicleRows(rowsFrom(res)); }
    catch (e) { setVehicleRows([]); setError(e.message || 'Failed to load vehicles'); }
    finally { setLoadingVehicles(false); }
  };
  useEffect(() => { loadVehicles(); }, [token]);
  useEffect(() => { if (!vehicleRows.length) { if (selectedVehicleId) setSelectedVehicleId(''); return; } if (!vehicleRows.some((v) => String(v.vehicleId) === String(selectedVehicleId))) setSelectedVehicleId(String(vehicleRows[0].vehicleId)); }, [vehicleRows, selectedVehicleId]);

  const companyById = useMemo(() => Object.fromEntries(companies.map((c) => [String(c.id), c])), [companies]);
  const branchById = useMemo(() => Object.fromEntries(branches.map((b) => [String(b.branchId), b])), [branches]);
  const projectById = useMemo(() => Object.fromEntries(projects.map((p) => [String(p.projectId), p])), [projects]);
  const employeeById = useMemo(() => Object.fromEntries(employees.map((e) => [String(e.employeeId), e])), [employees]);
  const modelById = useMemo(() => Object.fromEntries(vehicleModels.map((m) => [String(m.modelId), m])), [vehicleModels]);
  const modelVariantById = useMemo(() => Object.fromEntries(vehicleModelVariants.map((v) => [String(v.variantId), v])), [vehicleModelVariants]);
  const categoryById = useMemo(() => Object.fromEntries(vehicleCategories.map((c) => [String(c.categoryId), c])), [vehicleCategories]);
  const typeById = useMemo(() => Object.fromEntries(vehicleTypes.map((t) => [String(t.typeId), t])), [vehicleTypes]);
  const manufacturerById = useMemo(() => Object.fromEntries(vehicleManufacturers.map((m) => [String(m.manufacturerId), m])), [vehicleManufacturers]);
  const distributorById = useMemo(() => Object.fromEntries(distributors.map((d) => [String(d.distributorId), d])), [distributors]);
  const ownershipById = useMemo(() => Object.fromEntries(ownershipTypes.map((x) => [String(x.id), x.name])), [ownershipTypes]);
  const ownershipCodeById = useMemo(() => Object.fromEntries(ownershipTypes.map((x) => [String(x.id), String(x.code || '').toUpperCase()])), [ownershipTypes]);
  const normalizeOwnershipCode = (code) => String(code || '').toUpperCase().replace(/[\s_-]+/g, '');
  const isCompanyOwnedCode = (code) => {
    const normalized = normalizeOwnershipCode(code);
    return normalized === 'OWNED' || normalized === 'COMPANYOWNED';
  };
  const isPersonalOwnedCode = (code) => normalizeOwnershipCode(code) === 'PERSONALOWNED';
  const operationalById = useMemo(() => Object.fromEntries(operationalStatuses.map((x) => [String(x.id), x.name])), [operationalStatuses]);
  const consumptionById = useMemo(() => Object.fromEntries(consumptionMethods.map((x) => [String(x.id), x.name])), [consumptionMethods]);
  const fuelTypeById = useMemo(() => Object.fromEntries(fuelTypes.map((x) => [String(x.id), x.name])), [fuelTypes]);
  const transmissionTypeById = useMemo(() => Object.fromEntries(transmissionTypes.map((x) => [String(x.id), x.name])), [transmissionTypes]);
  const numberPlateTypeById = useMemo(() => Object.fromEntries(numberPlateTypes.map((x) => [String(x.id), x.name])), [numberPlateTypes]);
  const bodyStyleById = useMemo(() => Object.fromEntries(bodyStyles.map((x) => [String(x.id), x.name])), [bodyStyles]);
  const undercarriageTypeById = useMemo(() => Object.fromEntries(undercarriageTypes.map((x) => [String(x.id), x.name])), [undercarriageTypes]);
  const engineTypeById = useMemo(() => Object.fromEntries(engineTypes.map((x) => [String(x.id), x.name])), [engineTypes]);
  const engineManufactureById = useMemo(() => Object.fromEntries(engineManufactures.map((x) => [String(x.id), x.name])), [engineManufactures]);
  const vehicleStatusById = useMemo(() => Object.fromEntries(vehicleStatuses.map((x) => [String(x.id), x.name])), [vehicleStatuses]);
  const assignmentTypeById = useMemo(() => Object.fromEntries(assignmentTypes.map((x) => [String(x.id), x.name])), [assignmentTypes]);
  const assignmentStatusById = useMemo(() => Object.fromEntries(assignmentStatuses.map((x) => [String(x.id), x.name])), [assignmentStatuses]);

  const companyOptions = useMemo(() => companies.map((c) => ({ value: String(c.id), label: `${c.name} (${c.code})` })), [companies]);
  const vehicleOptions = useMemo(() => vehicleRows.map((v) => {
    const model = modelById[String(v.modelId)];
    const manufacturer = manufacturerById[String(model?.manufacturerId)];
    const manufacturerName = manufacturer?.manufacturerName || '-';
    const modelName = model?.modelName || '-';
    return {
      value: String(v.vehicleId),
      label: `${manufacturerName} | ${modelName} | ${v.chassisNumber || '-'} | ${v.registrationNumber || '-'}`,
    };
  }), [vehicleRows, modelById, manufacturerById]);
  const selectedVehicle = useMemo(() => vehicleRows.find((v) => String(v.vehicleId) === String(selectedVehicleId)) || null, [vehicleRows, selectedVehicleId]);
  const selectedCompanyCode = useMemo(() => companyById[String(selectedCompanyId)]?.code || selectedVehicle?.companyCode || '', [companyById, selectedCompanyId, selectedVehicle]);
  useEffect(() => {
    if (!selectedVehicle?.companyId) return;
    setSelectedCompanyId(String(selectedVehicle.companyId));
  }, [selectedVehicle?.companyId]);

  const branchOptions = useMemo(() => [{ value: '', label: 'Select Branch' }, ...branches.filter((b) => !selectedCompanyId || String(b.companyId) === String(selectedCompanyId)).map((b) => ({ value: String(b.branchId), label: b.branchName || b.name || b.branchCode || b.branchId }))], [branches, selectedCompanyId]);
  const manufacturerOptions = useMemo(
    () => [
      { value: '', label: 'Select Manufacturer' },
      ...vehicleManufacturers.map((m) => ({
        value: String(m.manufacturerId),
        label: `${m.manufacturerName || m.manufacturerCode || m.manufacturerId} (${m.country || '-'})`,
      })),
    ],
    [vehicleManufacturers]
  );
  const distributorOptions = useMemo(() => {
    const seen = new Set();
    const unique = [];
    distributors.forEach((d) => {
      const name = (d.distributorName || '').trim();
      const key = name ? name.toLowerCase() : `__id__${String(d.distributorId)}`;
      if (seen.has(key)) return;
      seen.add(key);
      unique.push({ value: String(d.distributorId), label: name || d.distributorId });
    });
    return [{ value: '', label: 'Select Distributor' }, ...unique];
  }, [distributors]);
  const modelOptions = useMemo(() => [{ value: '', label: 'Select Model' }, ...vehicleModels.map((m) => ({ value: String(m.modelId), label: m.modelName || m.modelId }))], [vehicleModels]);
  const modelOptionsByManufacturer = useMemo(() => {
    const map = {};
    vehicleModels.forEach((m) => {
      const key = String(m.manufacturerId || '');
      (map[key] ??= []).push({ value: String(m.modelId), label: m.modelName || m.modelCode || m.modelId });
    });
    Object.values(map).forEach((arr) => arr.sort((a, b) => a.label.localeCompare(b.label)));
    return map;
  }, [vehicleModels]);
  const variantOptionsByModel = useMemo(() => {
    const map = {};
    vehicleModelVariants.forEach((v) => {
      const key = String(v.modelId || '');
      const model = modelById[String(v.modelId)];
      const year = model?.modelYear ? ` - ${model.modelYear}` : '';
      const label = `${v.variantName || v.variantCode || v.variantId}${year}${v.variantCode ? ` (${v.variantCode})` : ''}`;
      (map[key] ??= []).push({ value: String(v.variantId), label });
    });
    Object.values(map).forEach((arr) => arr.sort((a, b) => a.label.localeCompare(b.label)));
    return map;
  }, [vehicleModelVariants, modelById]);
  const projectOptions = useMemo(() => [{ value: '', label: 'Select Project' }, ...projects.filter((p) => !selectedCompanyId || String(p.companyId) === String(selectedCompanyId)).map((p) => ({ value: String(p.projectId), label: p.projectName || p.projectCode || p.projectId }))], [projects, selectedCompanyId]);
  const employeeOptions = useMemo(() => [{ value: '', label: 'Select Employee' }, ...employees.filter((e) => !selectedCompanyId || String(e.companyId) === String(selectedCompanyId)).map((e) => ({ value: String(e.employeeId), label: `${e.name}${e.employeeCode ? ` (${e.employeeCode})` : ''}` }))], [employees, selectedCompanyId]);
  const ownershipOptions = useMemo(() => [{ value: '', label: 'Select Ownership' }, ...ownershipTypes.map((x) => ({ value: String(x.id), label: x.name }))], [ownershipTypes]);
  const ownershipCompanyOptions = useMemo(
    () => [{ value: '', label: 'Select Company Ownership' }, ...companies.map((c) => ({ value: String(c.name || ''), label: c.code ? `${c.name} (${c.code})` : c.name }))],
    [companies]
  );
  const operationalOptions = useMemo(() => [{ value: '', label: 'Select Status' }, ...operationalStatuses.map((x) => ({ value: String(x.id), label: x.name }))], [operationalStatuses]);
  const consumptionOptions = useMemo(() => [{ value: '', label: 'Select Method' }, ...consumptionMethods.map((x) => ({ value: String(x.id), label: x.name }))], [consumptionMethods]);
  const fuelTypeOptions = useMemo(() => [{ value: '', label: 'Select Fuel Type' }, ...fuelTypes.map((x) => ({ value: String(x.id), label: x.name }))], [fuelTypes]);
  const transmissionTypeOptions = useMemo(() => [{ value: '', label: 'Select Transmission Type' }, ...transmissionTypes.map((x) => ({ value: String(x.id), label: x.name }))], [transmissionTypes]);
  const numberPlateTypeOptions = useMemo(() => [{ value: '', label: 'Select Number Plate Type' }, ...numberPlateTypes.map((x) => ({ value: String(x.id), label: x.name }))], [numberPlateTypes]);
  const bodyStyleOptions = useMemo(() => [{ value: '', label: 'Select Body Style' }, ...bodyStyles.map((x) => ({ value: String(x.id), label: x.name }))], [bodyStyles]);
  const undercarriageTypeOptions = useMemo(() => [{ value: '', label: 'Select Undercarriage Type' }, ...undercarriageTypes.map((x) => ({ value: String(x.id), label: x.name }))], [undercarriageTypes]);
  const engineTypeOptions = useMemo(() => [{ value: '', label: 'Select Engine Type' }, ...engineTypes.map((x) => ({ value: String(x.id), label: x.name }))], [engineTypes]);
  const engineManufactureOptions = useMemo(() => [{ value: '', label: 'Select Engine Manufacture' }, ...engineManufactures.map((x) => ({ value: String(x.id), label: x.name }))], [engineManufactures]);
  const vehicleStatusOptions = useMemo(() => [{ value: '', label: 'Select Vehicle Status' }, ...vehicleStatuses.map((x) => ({ value: String(x.id), label: x.name }))], [vehicleStatuses]);
  const categoryFilterOptions = useMemo(() => [{ value: '', label: 'All Categories' }, ...vehicleCategories.map((c) => ({ value: String(c.categoryId), label: c.categoryName || c.categoryCode || c.categoryId }))], [vehicleCategories]);
  const typeFilterOptions = useMemo(() => [{ value: '', label: 'All Vehicle Types' }, ...vehicleTypes.map((t) => ({ value: String(t.typeId), label: t.typeName || t.typeCode || t.typeId }))], [vehicleTypes]);
  const variantFilterOptions = useMemo(() => [{ value: '', label: 'All Variants' }, ...vehicleModelVariants.map((v) => ({ value: String(v.variantId), label: v.variantName || v.variantCode || v.variantId }))], [vehicleModelVariants]);
  const vehicleConditionOptions = useMemo(() => [
    { value: '', label: 'Select Condition' },
    { value: 'New', label: 'New' },
    { value: 'Used', label: 'Used' },
    { value: 'Damaged', label: 'Damaged' },
  ], []);
  const assignmentTypeOptions = useMemo(() => [{ value: '', label: 'Select Type' }, ...assignmentTypes.map((x) => ({ value: String(x.id), label: x.name }))], [assignmentTypes]);
  const assignmentStatusOptions = useMemo(() => [{ value: '', label: 'Select Status' }, ...assignmentStatuses.map((x) => ({ value: String(x.id), label: x.name }))], [assignmentStatuses]);
  const selectedVehicleOnlyOptions = useMemo(() => selectedVehicle ? [{ value: String(selectedVehicle.vehicleId), label: `${selectedVehicle.vehicleCode} | ${selectedVehicle.registrationNumber}` }] : [{ value: '', label: 'Select Vehicle' }], [selectedVehicle]);
  const vehicleRecordEmptyForm = useMemo(() => ({
    vehicleManufacturerId: '',
    manufacturerId: '',
    distributorId: '',
    modelId: '',
    variantId: '',
    typeId: '',
    categoryId: '',
    vehicleCategoryView: '',
    vehicleTypeView: '',
    registrationNumber: '',
    chassisNumber: '',
    engineNumber: '',
    keyNumber: '',
    vehicleImage: '',
    manufactureYear: '',
    color: '',
    fuelTypeId: '',
    transmissionTypeId: '',
    numberPlateTypeId: '',
    bodyStyleId: '',
    seatingCapacity: '',
    undercarriageTypeId: '',
    engineTypeId: '',
    engineManufactureId: '',
    initialOdometerKm: '0',
    currentOdometerKm: '0',
    totalEngineHours: '0',
    consumptionMethodId: '',
    ratedEfficiencyKmpl: '',
    ratedConsumptionLph: '',
    ownershipTypeId: '',
    ownership: '',
    currentOwnership: '',
    previousOwnersCount: '',
    vehicleCondition: 'New',
    operationalStatusId: '',
    vehicleStatusId: '',
    notes: '',
    isActive: 'true',
  }), []);
  const assignmentEmptyForm = useMemo(() => ({ companyId: selectedCompanyId || '', companyCode: selectedCompanyCode || '', vehicleId: selectedVehicleId || '', assignmentTypeId: '', assignedToEmployeeId: '', assignedToProjectId: '', assignedAt: '', expectedReturnAt: '', returnedAt: '', startOdometerKm: '', endOdometerKm: '', startFuelLevelPercent: '', endFuelLevelPercent: '', statusId: '' }), [selectedCompanyCode, selectedCompanyId, selectedVehicleId]);

  const onMainTabChange = (_, v) => setTab(v);
  return (
    <Box><Stack spacing={2.5}>
      {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}
      <CrudEntityPage key={`vehicle-record-${selectedCompanyId}`} title="Vehicle Details" icon={<DirectionsCarRoundedIcon sx={{ color: '#fff', fontSize: 20 }} />} gradient={`linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`} idKey="vehicleId"
          columns={[
            {
              key: 'manufacturerId',
              label: 'Manufacture',
              render: (r) => {
                const m = manufacturerById[String(r.manufacturerId || modelById[String(r.modelId)]?.manufacturerId)];
                if (!m) return '-';
                return `${m.manufacturerName || '-'} (${m.country || '-'})`;
              },
            },
            { key: 'modelId', label: 'Model', render: (r) => modelById[String(r.modelId)]?.modelName || '-' },
            { key: 'variantId', label: 'Variant', render: (r) => modelVariantById[String(r.variantId)]?.variantName || '-' },
            { key: 'typeId', label: 'Vehicle Type', render: (r) => typeById[String(r.typeId || modelById[String(r.modelId)]?.typeId)]?.typeName || '-' },
            { key: 'chassisNumber', label: 'Chassis No' },
            { key: 'registrationNumber', label: 'Register No' },
            { key: 'isActive', label: 'Status', type: 'boolean' },
          ]}
          filterFields={[
            { key: 'categoryId', label: 'Vehicle Category', type: 'autocomplete', options: categoryFilterOptions },
            { key: 'typeId', label: 'Vehicle Type', type: 'autocomplete', options: typeFilterOptions },
            { key: 'variantId', label: 'Vehicle Variant', type: 'autocomplete', options: variantFilterOptions },
            { key: 'manufacturerId', label: 'Manufacture', type: 'autocomplete', options: manufacturerOptions },
            { key: 'q', label: 'Search (Chassis / Engine / Register)' },
            { key: 'isActive', label: 'Active Status', type: 'boolean' },
          ]}
          formFields={[
            { key: 'vehicleManufacturerId', label: 'Vehicle Manufacturer', type: 'autocomplete', options: manufacturerOptions },
            { key: 'modelId', label: 'Vehicle Model', type: 'autocomplete', optionsByForm: (f) => [{ value: '', label: f?.vehicleManufacturerId ? 'Select Model' : 'Select Manufacturer First' }, ...((modelOptionsByManufacturer[String(f?.vehicleManufacturerId || '')] || []))] },
            { key: 'variantId', label: 'Vehicle Model Variant', type: 'autocomplete', optionsByForm: (f) => [{ value: '', label: f?.modelId ? 'Select Variant' : 'Select Model First' }, ...((variantOptionsByModel[String(f?.modelId || '')] || []))] },
            { key: 'vehicleCategoryView', label: 'Vehicle Category', readOnly: true },
            { key: 'vehicleTypeView', label: 'Vehicle Type', readOnly: true },
            { key: 'distributorId', label: 'Distributor', type: 'autocomplete', options: distributorOptions },
            { key: 'registrationNumber', label: 'Vehicle Register Number' },
            { key: 'chassisNumber', label: 'Chassis Number' },
            { key: 'engineNumber', label: 'Engine Number' },
            { key: 'keyNumber', label: 'Key Number' },
            { key: 'vehicleImage', label: 'Vehicle Image URL' },
            { key: 'manufactureYear', label: 'Manufacture Year', type: 'number' },
            { key: 'color', label: 'Color' },
            { key: 'fuelTypeId', label: 'Fuel Type', type: 'autocomplete', options: fuelTypeOptions },
            { key: 'transmissionTypeId', label: 'Transmission Type', type: 'autocomplete', options: transmissionTypeOptions },
            { key: 'numberPlateTypeId', label: 'Number Plate Type', type: 'autocomplete', options: numberPlateTypeOptions },
            { key: 'bodyStyleId', label: 'Body Style', type: 'autocomplete', options: bodyStyleOptions },
            { key: 'seatingCapacity', label: 'Seating Capacity', type: 'number' },
            { key: 'undercarriageTypeId', label: 'Undercarriage Type', type: 'autocomplete', options: undercarriageTypeOptions },
            { key: 'engineTypeId', label: 'Engine Type', type: 'autocomplete', options: engineTypeOptions },
            { key: 'engineManufactureId', label: 'Engine Manufacture', type: 'autocomplete', options: engineManufactureOptions },
            { key: 'initialOdometerKm', label: 'Initial Odometer KM', type: 'number' },
            { key: 'currentOdometerKm', label: 'Current Odometer KM', type: 'number' },
            { key: 'totalEngineHours', label: 'Total Engine Hours', type: 'number' },
            { key: 'consumptionMethodId', label: 'Consumption Method', type: 'autocomplete', options: consumptionOptions },
            { key: 'ratedEfficiencyKmpl', label: 'Rated Efficiency (KMPL)', type: 'number' },
            { key: 'ratedConsumptionLph', label: 'Rated Consumption (LPH)', type: 'number' },
            { key: 'ownershipTypeId', label: 'Ownership Type', type: 'autocomplete', options: ownershipOptions },
            {
              key: 'ownership',
              labelByForm: (f) => {
                const code = ownershipCodeById[String(f?.ownershipTypeId || '')] || '';
                if (isCompanyOwnedCode(code)) return 'Ownership (Company)';
                if (isPersonalOwnedCode(code)) return 'Ownership (Owner Name)';
                return 'Ownership';
              },
              typeByForm: (f) => {
                const code = ownershipCodeById[String(f?.ownershipTypeId || '')] || '';
                if (isPersonalOwnedCode(code)) return 'text';
                return 'autocomplete';
              },
              optionsByForm: (f) => {
                const code = ownershipCodeById[String(f?.ownershipTypeId || '')] || '';
                if (isCompanyOwnedCode(code)) return ownershipCompanyOptions;
                return [];
              },
            },
            { key: 'previousOwnersCount', label: 'Previous Owners Count', type: 'number' },
            { key: 'vehicleCondition', label: 'Vehicle Condition', type: 'autocomplete', options: vehicleConditionOptions },
            { key: 'operationalStatusId', label: 'Operational Status', type: 'autocomplete', options: operationalOptions },
            { key: 'vehicleStatusId', label: 'Vehicle Status', type: 'autocomplete', options: vehicleStatusOptions },
            { key: 'isActive', label: 'Is Active', type: 'boolean' },
            { key: 'notes', label: 'Notes', fullWidth: true, minWidth: 320 },
          ]}
          defaultFilters={{ companyId: selectedCompanyId || '', categoryId: '', typeId: '', variantId: '', manufacturerId: '', q: '', isActive: '', sortBy: 'updatedAt', sortDir: 'desc' }} emptyForm={vehicleRecordEmptyForm}
          normalizePayload={(f) => ({
            modelId: req(f.modelId),
            variantId: req(f.variantId),
            typeId: req(f.typeId),
            categoryId: req(f.categoryId),
            manufacturerId: opt(f.manufacturerId || f.vehicleManufacturerId),
            distributorId: opt(f.distributorId),
            registrationNumber: opt(f.registrationNumber),
            chassisNumber: req(f.chassisNumber),
            engineNumber: req(f.engineNumber),
            keyNumber: opt(f.keyNumber),
            vehicleImage: opt(f.vehicleImage),
            manufactureYear: toInt(req(f.manufactureYear)),
            color: opt(f.color),
            fuelTypeId: toInt(f.fuelTypeId),
            transmissionTypeId: toInt(f.transmissionTypeId),
            numberPlateTypeId: toInt(f.numberPlateTypeId),
            bodyStyleId: toInt(f.bodyStyleId),
            seatingCapacity: toInt(f.seatingCapacity),
            undercarriageTypeId: toInt(f.undercarriageTypeId),
            engineTypeId: toInt(f.engineTypeId),
            engineManufactureId: toInt(f.engineManufactureId),
            initialOdometerKm: toDecimal(f.initialOdometerKm),
            currentOdometerKm: toDecimal(f.currentOdometerKm),
            totalEngineHours: toDecimal(f.totalEngineHours),
            consumptionMethodId: toInt(f.consumptionMethodId),
            ratedEfficiencyKmpl: toDecimal(f.ratedEfficiencyKmpl),
            ratedConsumptionLph: toDecimal(f.ratedConsumptionLph),
            relatedEfficiency: toDecimal(f.ratedEfficiencyKmpl),
            ratedConsumption: toDecimal(f.ratedConsumptionLph),
            ownershipTypeId: toInt(f.ownershipTypeId),
            currentOwnership: opt(f.ownership ?? f.currentOwnership),
            previousOwnersCount: toInt(f.previousOwnersCount),
            vehicleCondition: opt(f.vehicleCondition),
            operationalStatusId: toInt(f.operationalStatusId),
            vehicleStatusId: toInt(f.vehicleStatusId),
            notes: opt(f.notes),
            isActive: toBool(f.isActive),
          })}
          onFormFieldChange={(next, key, value) => {
            if (key === 'ownership') {
              return { ...next, ownership: String(value || ''), currentOwnership: String(value || '') };
            }
            if (key === 'ownershipTypeId') {
              const code = ownershipCodeById[String(value || '')] || '';
              if (isCompanyOwnedCode(code)) {
                const ownCompanyName = companyById[String(selectedCompanyId || '')]?.name || '';
                const fallback = ownCompanyName || next.ownership || '';
                return { ...next, ownershipTypeId: String(value || ''), ownership: fallback, currentOwnership: fallback };
              }
              if (isPersonalOwnedCode(code)) {
                return { ...next, ownershipTypeId: String(value || ''), ownership: '', currentOwnership: '' };
              }
              return { ...next, ownershipTypeId: String(value || ''), ownership: '', currentOwnership: '' };
            }
            if (key === 'vehicleManufacturerId') {
              const keepModel = vehicleModels.find((m) => String(m.modelId) === String(next.modelId || ''));
              const manufacturerStillMatches = keepModel && String(keepModel.manufacturerId) === String(value || '');
              if (manufacturerStillMatches) return next;
              return { ...next, manufacturerId: value || '', modelId: '', variantId: '', typeId: '', categoryId: '', manufactureYear: '', vehicleCategoryView: '', vehicleTypeView: '' };
            }
            if (key === 'modelId') {
              const selectedModel = modelById[String(value)];
              const autoYear = selectedModel?.modelYear ?? selectedModel?.launchYear ?? '';
              const selectedType = typeById[String(selectedModel?.typeId)];
              const selectedCategory = categoryById[String(selectedModel?.categoryId)] || categoryById[String(selectedType?.categoryId)];
              const selectedManufacturer = manufacturerById[String(selectedModel?.manufacturerId)];
              const firstConsumptionMethod = (consumptionOptions.find((o) => o.value) || {}).value || '';
              return {
                ...next,
                vehicleManufacturerId: selectedModel?.manufacturerId ? String(selectedModel.manufacturerId) : (next.vehicleManufacturerId || ''),
                manufacturerId: selectedModel?.manufacturerId ? String(selectedModel.manufacturerId) : (next.manufacturerId || ''),
                typeId: selectedType?.typeId ? String(selectedType.typeId) : '',
                categoryId: selectedCategory?.categoryId ? String(selectedCategory.categoryId) : '',
                variantId: '',
                manufactureYear: autoYear === '' ? '' : String(autoYear),
                currentOdometerKm: next.currentOdometerKm || '0',
                initialOdometerKm: next.initialOdometerKm || '0',
                totalEngineHours: next.totalEngineHours || '0',
                consumptionMethodId: next.consumptionMethodId || firstConsumptionMethod,
                color: next.color || '',
                fuelTypeId: selectedModel?.fuelTypeId ? String(selectedModel.fuelTypeId) : (next.fuelTypeId || ''),
                transmissionTypeId: selectedModel?.transmissionTypeId ? String(selectedModel.transmissionTypeId) : (next.transmissionTypeId || ''),
                bodyStyleId: selectedModel?.bodyStyleId ? String(selectedModel.bodyStyleId) : (next.bodyStyleId || ''),
                seatingCapacity: selectedModel?.seatingCapacity ? String(selectedModel.seatingCapacity) : (next.seatingCapacity || ''),
                vehicleTypeView: selectedType?.typeName || '',
                vehicleCategoryView: selectedCategory?.categoryName || '',
              };
            }
            return next;
          }}
          mapRecordToForm={(r) => {
            const next = { ...vehicleRecordEmptyForm, ...(r || {}) };
            next.ratedEfficiencyKmpl = next.ratedEfficiencyKmpl ?? next.relatedEfficiency ?? next.rated_efficiency_kmpl ?? '';
            next.ratedConsumptionLph = next.ratedConsumptionLph ?? next.ratedConsumption ?? next.rated_consumption_lph ?? '';
            next.ownership = next.currentOwnership || '';
            const selectedModel = modelById[String(next.modelId || '')];
            const selectedType = typeById[String(selectedModel?.typeId)];
            const selectedCategory = categoryById[String(selectedModel?.categoryId)] || categoryById[String(selectedType?.categoryId)];
            next.vehicleManufacturerId = selectedModel?.manufacturerId ? String(selectedModel.manufacturerId) : '';
            next.manufacturerId = next.manufacturerId || next.vehicleManufacturerId || '';
            next.typeId = next.typeId ? String(next.typeId) : (selectedType?.typeId ? String(selectedType.typeId) : '');
            next.categoryId = next.categoryId ? String(next.categoryId) : (selectedCategory?.categoryId ? String(selectedCategory.categoryId) : '');
            next.vehicleTypeView = selectedType?.typeName || '';
            next.vehicleCategoryView = selectedCategory?.categoryName || '';
            ['variantId','distributorId','fuelTypeId','transmissionTypeId','numberPlateTypeId','bodyStyleId','undercarriageTypeId','engineTypeId','engineManufactureId','consumptionMethodId','ownershipTypeId','operationalStatusId','vehicleStatusId'].forEach((k) => {
              if (next[k] != null && next[k] !== '') next[k] = String(next[k]);
            });
            return next;
          }}
          listFetcher={(t, params) => vehicleService.list(t, { ...params, companyId: selectedCompanyId || params?.companyId })}
          getByIdFetcher={vehicleService.getById} createFetcher={vehicleService.create} updateFetcher={vehicleService.update} deleteFetcher={vehicleService.delete}
          prefillFilters={{ companyId: selectedCompanyId || '' }}
          hideFilterSearchButton
          hideFilterResetButton
          showHeaderResetFilters
          autoSearch
          autoSearchDebounceMs={350}
          fitViewport
          viewportOffset={200} />
    </Stack></Box>
  );
}
