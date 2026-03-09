import ViewListRoundedIcon from '@mui/icons-material/ViewListRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Stack } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CrudEntityPage from '../../organization/shared/CrudEntityPage';
import { useAuth } from '../../../app/AuthContext';
import { organizationService } from '../../../services/organizationService';
import { vehicleTypeService } from '../../../services/vehicle_management/vehicle_type/vehicleTypeService';
import { vehicleCategoryService } from '../../../services/vehicle_management/vehicle_category/vehicleCategoryService';
import { opt, req, rowsFrom, toBool, toInt } from '../../employee_hr_management/shared/hrCrudCommon';

export default function VehicleTypePage() {
  const theme = useTheme();
  const { token } = useAuth();
  const [categories, setCategories] = useState([]);
  const [fuelTypes, setFuelTypes] = useState([]);
  const [bodyStyles, setBodyStyles] = useState([]);
  const [usageTypes, setUsageTypes] = useState([]);
  const [undercarriageTypes, setUndercarriageTypes] = useState([]);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState('');

  useEffect(() => {
    (async () => {
      if (!token) return;
      try {
        const [catr, fr, br, ur, utr] = await Promise.all([
          vehicleCategoryService.list(token, { sortBy: 'categoryName', sortDir: 'asc' }),
      organizationService.enumValues('fuel_type', { locale: 'en-US', activeOnly: true }),
          organizationService.enumValues('body_style', { locale: 'en-US', activeOnly: true }),
      organizationService.enumValues('usage_type', { locale: 'en-US', activeOnly: true }),
      organizationService.enumValues('undercarriage_type', { locale: 'en-US', activeOnly: true }),
        ]);
        setCategories(rowsFrom(catr).map((c) => ({ id: c.categoryId, companyId: c.companyId, code: c.categoryCode, name: c.categoryName })));
        setFuelTypes(rowsFrom(fr));
        setBodyStyles(rowsFrom(br));
        setUsageTypes(rowsFrom(ur));
        setUndercarriageTypes(rowsFrom(utr));
      } catch {
        setCategories([]);
        setFuelTypes([]);
        setBodyStyles([]);
        setUsageTypes([]);
        setUndercarriageTypes([]);
      }
    })();
  }, [token]);
  const categoryById = useMemo(() => Object.fromEntries(categories.map((c) => [String(c.id), c])), [categories]);
  const fuelById = useMemo(() => Object.fromEntries(fuelTypes.map((f) => [String(f.id), f.name])), [fuelTypes]);
  const bodyStyleById = useMemo(() => Object.fromEntries(bodyStyles.map((b) => [String(b.id), b.name])), [bodyStyles]);
  const usageTypeByValue = useMemo(() => Object.fromEntries(usageTypes.map((u) => [String(u.name), u.name])), [usageTypes]);
  const undercarriageById = useMemo(() => Object.fromEntries(undercarriageTypes.map((u) => [String(u.id), u.name])), [undercarriageTypes]);

  const categoriesForForm = useMemo(() => {
    const list = categories;
    return [{ value: '', label: 'Select Category' }, ...list.map((c) => ({ value: String(c.id), label: `${c.name} (${c.code})` }))];
  }, [categories]);
  const fuelOpts = useMemo(() => [{ value: '', label: 'All Fuel Types' }, ...fuelTypes.map((f) => ({ value: String(f.id), label: f.name }))], [fuelTypes]);
  const fuelFormOpts = useMemo(() => [{ value: '', label: 'Select Fuel Type' }, ...fuelTypes.map((f) => ({ value: String(f.id), label: f.name }))], [fuelTypes]);
  const bodyStyleFormOpts = useMemo(() => [{ value: '', label: 'Select Body Style' }, ...bodyStyles.map((b) => ({ value: String(b.id), label: b.name }))], [bodyStyles]);
  const undercarriageOpts = useMemo(() => [{ value: '', label: 'All Undercarriage Types' }, ...undercarriageTypes.map((u) => ({ value: String(u.id), label: u.name }))], [undercarriageTypes]);
  const undercarriageFormOpts = useMemo(() => [{ value: '', label: 'Select Undercarriage Type' }, ...undercarriageTypes.map((u) => ({ value: String(u.id), label: u.name }))], [undercarriageTypes]);
  const usageTypeOpts = useMemo(() => [{ value: '', label: 'All Usage Types' }, ...usageTypes.map((u) => ({ value: String(u.name), label: u.name }))], [usageTypes]);
  const usageTypeFormOpts = useMemo(() => [{ value: '', label: 'Select Usage Type' }, ...usageTypes.map((u) => ({ value: String(u.name), label: u.name }))], [usageTypes]);

  const exportVehicleTypesExcel = async () => {
    if (!token || exporting) return;
    setExportError('');
    setExporting(true);
    try {
      const { blob, filename } = await vehicleTypeService.exportExcel(token, {
        sortBy: 'typeName',
        sortDir: 'asc',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'vehicle-types.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      setExportError(e?.message || 'Failed to export Vehicle Types Excel');
    } finally {
      setExporting(false);
    }
  };

  return (
    <Stack spacing={2}>
      {exportError ? <Alert severity="error" onClose={() => setExportError('')}>{exportError}</Alert> : null}
      <CrudEntityPage
        title="Vehicle Types"
        icon={<ViewListRoundedIcon sx={{ color: '#fff', fontSize: 20 }} />}
        gradient={`linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`}
        idKey="typeId"
        columns={[
        { key: 'categoryId', label: 'Category', render: (r) => categoryById[String(r.categoryId)]?.name || '-' },
        { key: 'typeName', label: 'Type' },
        { key: 'bodyStyleId', label: 'Body Style', render: (r) => bodyStyleById[String(r.bodyStyleId)] || '-' },
        { key: 'fuelTypeId', label: 'Fuel Type', render: (r) => fuelById[String(r.fuelTypeId)] || '-' },
        { key: 'undercarriageTypeId', label: 'Undercarriage Type', render: (r) => undercarriageById[String(r.undercarriageTypeId)] || '-' },
        { key: 'usageType', label: 'Usage Type', render: (r) => usageTypeByValue[String(r.usageType)] || r.usageType || '-' },
        { key: 'isActive', label: 'Active', type: 'boolean' },
        ]}
        filterFields={[
        { key: 'typeName_like', label: 'Type Name' },
        { key: 'fuelTypeId', label: 'Fuel Type', type: 'autocomplete', options: fuelOpts },
        { key: 'undercarriageTypeId', label: 'Undercarriage Type', type: 'autocomplete', options: undercarriageOpts },
        { key: 'usageType', label: 'Usage Type', type: 'autocomplete', options: usageTypeOpts },
        { key: 'isActive', label: 'Active', type: 'boolean' },
        ]}
        formFields={[
        { key: 'categoryId', label: 'Category', type: 'autocomplete', options: categoriesForForm, required: true },
        { key: 'typeName', label: 'Type Name' },
        { key: 'bodyStyleId', label: 'Body Style', type: 'autocomplete', options: bodyStyleFormOpts },
        { key: 'fuelTypeId', label: 'Fuel Type', type: 'autocomplete', options: fuelFormOpts },
        { key: 'undercarriageTypeId', label: 'Undercarriage Type', type: 'autocomplete', options: undercarriageFormOpts },
        { key: 'usageType', label: 'Usage Type', type: 'autocomplete', options: usageTypeFormOpts },
        { key: 'numberOfWheels', label: 'Number Of Wheels', type: 'number' },
        { key: 'seatingCapacityMin', label: 'Seat Min', type: 'number' },
        { key: 'seatingCapacityMax', label: 'Seat Max', type: 'number' },
        { key: 'serviceIntervalKm', label: 'Service Interval KM', type: 'number' },
        { key: 'serviceIntervalMonths', label: 'Service Interval Months', type: 'number' },
        { key: 'serviceIntervalHours', label: 'Service Interval Hours', type: 'number' },
        { key: 'oilChangeIntervalKm', label: 'Oil Change Interval KM', type: 'number' },
        { key: 'isActive', label: 'Is Active', type: 'boolean' },
        { key: 'description', label: 'Description', fullWidth: true, minWidth: 320 },
      ]}
        defaultFilters={{ typeName_like: '', fuelTypeId: '', undercarriageTypeId: '', usageType: '', isActive: '', sortBy: 'typeName', sortDir: 'asc' }}
        emptyForm={{
        categoryId: '',
        typeName: '',
        bodyStyleId: '',
        fuelTypeId: '',
        undercarriageTypeId: '',
        usageType: '',
        numberOfWheels: '',
        seatingCapacityMin: '',
        seatingCapacityMax: '',
        serviceIntervalKm: '',
        serviceIntervalMonths: '',
        serviceIntervalHours: '',
        oilChangeIntervalKm: '',
        description: '',
        isActive: 'true',
        }}
        normalizePayload={(f) => {
        const categoryId = opt(f.categoryId);
        if (!categoryId) throw new Error('Category is required');
        const typeName = req(f.typeName);
        return {
          categoryId,
          typeName,
          // Backward-compatible payload for backend write path.
          typeCode: typeName,
          bodyStyleId: toInt(f.bodyStyleId),
          fuelTypeId: toInt(f.fuelTypeId),
          undercarriageTypeId: toInt(f.undercarriageTypeId),
          usageType: opt(f.usageType),
          numberOfWheels: toInt(f.numberOfWheels),
          seatingCapacityMin: toInt(f.seatingCapacityMin),
          seatingCapacityMax: toInt(f.seatingCapacityMax),
          serviceIntervalKm: toInt(f.serviceIntervalKm),
          serviceIntervalMonths: toInt(f.serviceIntervalMonths),
          serviceIntervalHours: toInt(f.serviceIntervalHours),
          oilChangeIntervalKm: toInt(f.oilChangeIntervalKm),
          description: opt(f.description),
          isActive: toBool(f.isActive),
          };
        }}
        headerActions={(
          <Button
            variant="outlined"
            size="small"
            startIcon={<DownloadRoundedIcon />}
            onClick={exportVehicleTypesExcel}
            disabled={!token || exporting}
            sx={{ height: 36, fontWeight: 600 }}
          >
            {exporting ? 'Exporting...' : 'Export Excel'}
          </Button>
        )}
        listFetcher={vehicleTypeService.list}
        getByIdFetcher={vehicleTypeService.getById}
        createFetcher={vehicleTypeService.create}
        updateFetcher={vehicleTypeService.update}
        deleteFetcher={vehicleTypeService.delete}
        autoSearch
        autoSearchDebounceMs={350}
        fitViewport
        viewportOffset={190}
        hideEditAction
      />
    </Stack>
  );
}
