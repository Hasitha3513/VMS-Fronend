import DirectionsCarRoundedIcon from '@mui/icons-material/DirectionsCarRounded';
import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import CrudEntityPage from '../../organization/shared/CrudEntityPage';
import { useAuth } from '../../../app/AuthContext';
import { organizationService } from '../../../services/organizationService';
import { vehicleModelService } from '../../../services/vehicle_management/vehicle_model/vehicleModelService';
import { vehicleTypeService } from '../../../services/vehicle_management/vehicle_type/vehicleTypeService';
import { vehicleManufacturerService } from '../../../services/vehicle_management/vehicle_manufacturer/vehicleManufacturerService';
import { manufacturerCategoryService } from '../../../services/vehicle_management/manufacturer_category/manufacturerCategoryService';
import { vehicleCategoryService } from '../../../services/vehicle_management/vehicle_category/vehicleCategoryService';
import { opt, req, rowsFrom, toBool, toDecimal, toInt } from '../../employee_hr_management/shared/hrCrudCommon';

export default function VehicleModelPage() {
  const theme = useTheme();
  const { token } = useAuth();
  const [manufacturers, setManufacturers] = useState([]);
  const [manufacturerCategories, setManufacturerCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [types, setTypes] = useState([]);
  const [bodyStyles, setBodyStyles] = useState([]);
  const [fuelTypes, setFuelTypes] = useState([]);
  const [transmissions, setTransmissions] = useState([]);
  const [drivetrains, setDrivetrains] = useState([]);

  useEffect(() => {
    (async () => {
      if (!token) return;
      try {
        const [mr, mcr, cr, tr, br, fr, tx, dx] = await Promise.all([
          vehicleManufacturerService.list(token, { sortBy: 'manufacturerName', sortDir: 'asc' }),
          manufacturerCategoryService.list(token, { sortBy: 'id', sortDir: 'asc' }),
          vehicleCategoryService.list(token, { sortBy: 'categoryName', sortDir: 'asc' }),
          vehicleTypeService.list(token, { sortBy: 'typeName', sortDir: 'asc' }),
          organizationService.enumValues('body_style', { locale: 'en-US', activeOnly: true }),
          organizationService.enumValues('fuel_type', { locale: 'en-US', activeOnly: true }),
          organizationService.enumValues('transmission_type', { locale: 'en-US', activeOnly: true }),
          organizationService.enumValues('drivetrain_type', { locale: 'en-US', activeOnly: true }),
        ]);
        setManufacturers(rowsFrom(mr));
        setManufacturerCategories(rowsFrom(mcr));
        setCategories(rowsFrom(cr));
        setTypes(rowsFrom(tr));
        setBodyStyles(rowsFrom(br));
        setFuelTypes(rowsFrom(fr));
        setTransmissions(rowsFrom(tx));
        setDrivetrains(rowsFrom(dx));
      } catch {
        setManufacturers([]);
        setManufacturerCategories([]);
        setCategories([]);
        setTypes([]);
        setBodyStyles([]);
        setFuelTypes([]);
        setTransmissions([]);
        setDrivetrains([]);
      }
    })();
  }, [token]);

  const manufacturerById = useMemo(
    () => Object.fromEntries(manufacturers.map((m) => [String(m.manufacturerId), m])),
    [manufacturers]
  );
  const categoryById = useMemo(
    () => Object.fromEntries(categories.map((c) => [String(c.categoryId), c.categoryName])),
    [categories]
  );
  const manufacturerCategoryLinks = useMemo(
    () => manufacturerCategories.map((mc) => ({ id: mc.id, manufacturerId: mc.manufacturerId, categoryId: mc.categoryId })),
    [manufacturerCategories]
  );
  const typeById = useMemo(
    () => Object.fromEntries(types.map((t) => [String(t.typeId), t.typeName])),
    [types]
  );
  const bodyStyleById = useMemo(
    () => Object.fromEntries(bodyStyles.map((x) => [String(x.id), x.name])),
    [bodyStyles]
  );
  const fuelTypeById = useMemo(
    () => Object.fromEntries(fuelTypes.map((x) => [String(x.id), x.name])),
    [fuelTypes]
  );
  const transmissionById = useMemo(
    () => Object.fromEntries(transmissions.map((x) => [String(x.id), x.name])),
    [transmissions]
  );
  const drivetrainById = useMemo(
    () => Object.fromEntries(drivetrains.map((x) => [String(x.id), x.name])),
    [drivetrains]
  );

  const categoryOpts = useMemo(
    () => [{ value: '', label: 'All Vehicle Categories' }, ...categories.map((c) => ({ value: String(c.categoryId), label: c.categoryName }))],
    [categories]
  );
  const categoryFormOpts = useMemo(
    () => [{ value: '', label: 'Select Vehicle Category' }, ...categories.map((c) => ({ value: String(c.categoryId), label: c.categoryName }))],
    [categories]
  );
  const manufacturerOpts = useMemo(
    () => [{ value: '', label: 'All Manufacturers' }, ...manufacturers.map((m) => ({ value: String(m.manufacturerId), label: `${m.manufacturerName} (${m.country || '-'})` }))],
    [manufacturers]
  );
  const manufacturerFormOpts = useMemo(
    () => [{ value: '', label: 'Select Manufacturer' }, ...manufacturers.map((m) => ({ value: String(m.manufacturerId), label: `${m.manufacturerName} (${m.country || '-'})` }))],
    [manufacturers]
  );
  const typeOpts = useMemo(
    () => [{ value: '', label: 'All Vehicle Types' }, ...types.map((t) => ({ value: String(t.typeId), label: t.typeName }))],
    [types]
  );
  const typeFormOpts = useMemo(
    () => [{ value: '', label: 'Select Vehicle Type' }, ...types.map((t) => ({ value: String(t.typeId), label: t.typeName }))],
    [types]
  );
  const bodyStyleOpts = useMemo(
    () => [{ value: '', label: 'All Body Styles' }, ...bodyStyles.map((x) => ({ value: String(x.id), label: x.name }))],
    [bodyStyles]
  );
  const bodyStyleFormOpts = useMemo(
    () => [{ value: '', label: 'Select Body Style' }, ...bodyStyles.map((x) => ({ value: String(x.id), label: x.name }))],
    [bodyStyles]
  );
  const fuelTypeOpts = useMemo(
    () => [{ value: '', label: 'All Fuel Types' }, ...fuelTypes.map((x) => ({ value: String(x.id), label: x.name }))],
    [fuelTypes]
  );
  const fuelTypeFormOpts = useMemo(
    () => [{ value: '', label: 'Select Fuel Type' }, ...fuelTypes.map((x) => ({ value: String(x.id), label: x.name }))],
    [fuelTypes]
  );
  const transmissionOpts = useMemo(
    () => [{ value: '', label: 'All Transmissions' }, ...transmissions.map((x) => ({ value: String(x.id), label: x.name }))],
    [transmissions]
  );
  const transmissionFormOpts = useMemo(
    () => [{ value: '', label: 'Select Transmission' }, ...transmissions.map((x) => ({ value: String(x.id), label: x.name }))],
    [transmissions]
  );
  const drivetrainOpts = useMemo(
    () => [{ value: '', label: 'All Drivetrains' }, ...drivetrains.map((x) => ({ value: String(x.id), label: x.name }))],
    [drivetrains]
  );
  const drivetrainFormOpts = useMemo(
    () => [{ value: '', label: 'Select Drivetrain' }, ...drivetrains.map((x) => ({ value: String(x.id), label: x.name }))],
    [drivetrains]
  );

  return (
    <CrudEntityPage
      title="Vehicle Models"
      icon={<DirectionsCarRoundedIcon sx={{ color: '#fff', fontSize: 20 }} />}
      gradient={`linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`}
      idKey="modelId"
      columns={[
        { key: 'categoryId', label: 'Vehicle Category', render: (r) => categoryById[String(r.categoryId)] || '-' },
        { key: 'modelName', label: 'Model' },
        { key: 'modelCode', label: 'Code' },
        { key: 'modelYear', label: 'Year' },
        {
          key: 'manufacturerId',
          label: 'Manufacturer',
          render: (r) => {
            const m = manufacturerById[String(r.manufacturerId)];
            if (!m) return '-';
            return `${m.manufacturerName} (${m.country || r.manufacturerCountry || '-'})`;
          },
        },
        { key: 'typeId', label: 'Vehicle Type', render: (r) => typeById[String(r.typeId)] || '-' },
        { key: 'isActive', label: 'Active', type: 'boolean' },
      ]}
      filterFields={[
        { key: 'categoryId', label: 'Vehicle Category', type: 'autocomplete', options: categoryOpts },
        { key: 'manufacturerId', label: 'Manufacturer', type: 'autocomplete', options: manufacturerOpts },
        { key: 'typeId', label: 'Vehicle Type', type: 'autocomplete', options: typeOpts },
        { key: 'isActive', label: 'Active', type: 'boolean' },
      ]}
      formFields={[
        { key: 'categoryId', label: 'Vehicle Category', type: 'autocomplete', options: categoryFormOpts, required: true },
        {
          key: 'manufacturerId',
          label: 'Manufacturer',
          type: 'autocomplete',
          optionsByForm: (form) => {
            const categoryId = String(form.categoryId || '');
            if (!categoryId) return manufacturerFormOpts;
            const allowedManufacturerIds = new Set(
              manufacturerCategoryLinks
                .filter((mc) => String(mc.categoryId) === categoryId)
                .map((mc) => String(mc.manufacturerId))
            );
            return [
              { value: '', label: 'Select Manufacturer' },
              ...manufacturers
                .filter((m) => allowedManufacturerIds.has(String(m.manufacturerId)))
                .map((m) => ({ value: String(m.manufacturerId), label: `${m.manufacturerName} (${m.country || '-'})` })),
            ];
          },
          required: true,
        },
        {
          key: 'typeId',
          label: 'Vehicle Type',
          type: 'autocomplete',
          optionsByForm: (form) => {
            const categoryId = String(form.categoryId || '');
            if (!categoryId) return typeFormOpts;
            return [{ value: '', label: 'Select Vehicle Type' }, ...types
              .filter((t) => String(t.categoryId) === categoryId)
              .map((t) => ({ value: String(t.typeId), label: t.typeName }))];
          },
          required: true,
        },
        { key: 'modelName', label: 'Model Name' },
        { key: 'modelCode', label: 'Model Code' },
        { key: 'modelYear', label: 'Model Year', type: 'number' },
        { key: 'launchYear', label: 'Launch Year', type: 'number' },
        { key: 'bodyStyleId', label: 'Body Style', type: 'autocomplete', options: bodyStyleFormOpts },
        { key: 'fuelTypeId', label: 'Fuel Type', type: 'autocomplete', options: fuelTypeFormOpts },
        { key: 'engineCapacityCc', label: 'Engine Capacity (CC)', type: 'number' },
        { key: 'powerHp', label: 'Power (HP)', type: 'number' },
        { key: 'torqueNm', label: 'Torque (NM)', type: 'number' },
        { key: 'numberOfCylinders', label: 'Cylinders', type: 'number' },
        { key: 'transmissionTypeId', label: 'Transmission Type', type: 'autocomplete', options: transmissionFormOpts },
        { key: 'drivetrainTypeId', label: 'Drivetrain Type', type: 'autocomplete', options: drivetrainFormOpts },
        { key: 'seatingCapacity', label: 'Seating Capacity', type: 'number' },
        { key: 'numberOfDoors', label: 'Number Of Doors', type: 'number' },
        { key: 'kerbWeightKg', label: 'Kerb Weight (Kg)', type: 'number' },
        { key: 'gvwKg', label: 'GVW (Kg)', type: 'number' },
        { key: 'wheelbaseMm', label: 'Wheelbase (mm)', type: 'number' },
        { key: 'fuelEfficiencyKmpl', label: 'Fuel Efficiency (kmpl)', type: 'number' },
        { key: 'imageUrl', label: 'Image URL', fullWidth: true, minWidth: 320 },
        { key: 'description', label: 'Description', fullWidth: true, minWidth: 320 },
        { key: 'isActive', label: 'Is Active', type: 'boolean' },
      ]}
      defaultFilters={{
        categoryId: '',
        manufacturerId: '',
        typeId: '',
        isActive: '',
        sortBy: 'modelName',
        sortDir: 'asc',
      }}
      emptyForm={{
        categoryId: '',
        manufacturerId: '',
        typeId: '',
        modelName: '',
        modelCode: '',
        modelYear: '',
        launchYear: '',
        bodyStyleId: '',
        fuelTypeId: '',
        engineCapacityCc: '',
        powerHp: '',
        torqueNm: '',
        numberOfCylinders: '',
        transmissionTypeId: '',
        drivetrainTypeId: '',
        seatingCapacity: '',
        numberOfDoors: '',
        kerbWeightKg: '',
        gvwKg: '',
        wheelbaseMm: '',
        fuelEfficiencyKmpl: '',
        imageUrl: '',
        description: '',
        isActive: 'true',
      }}
      normalizePayload={(f) => {
        const categoryId = opt(f.categoryId);
        const manufacturerId = opt(f.manufacturerId);
        const typeId = opt(f.typeId);
        if (!categoryId) throw new Error('Vehicle Category is required');
        if (!manufacturerId) throw new Error('Manufacturer is required');
        if (!typeId) throw new Error('Vehicle Type is required');
        return {
          categoryId,
          manufacturerId,
          typeId,
          modelName: req(f.modelName),
          modelCode: opt(f.modelCode),
          modelYear: toInt(f.modelYear),
          launchYear: toInt(f.launchYear),
          bodyStyleId: toInt(f.bodyStyleId),
          fuelTypeId: toInt(f.fuelTypeId),
          engineCapacityCc: toInt(f.engineCapacityCc),
          powerHp: toInt(f.powerHp),
          torqueNm: toInt(f.torqueNm),
          numberOfCylinders: toInt(f.numberOfCylinders),
          transmissionTypeId: toInt(f.transmissionTypeId),
          drivetrainTypeId: toInt(f.drivetrainTypeId),
          seatingCapacity: toInt(f.seatingCapacity),
          numberOfDoors: toInt(f.numberOfDoors),
          kerbWeightKg: toDecimal(f.kerbWeightKg),
          gvwKg: toDecimal(f.gvwKg),
          wheelbaseMm: toInt(f.wheelbaseMm),
          fuelEfficiencyKmpl: toDecimal(f.fuelEfficiencyKmpl),
          imageUrl: opt(f.imageUrl),
          description: opt(f.description),
          isActive: toBool(f.isActive),
        };
      }}
      onFormFieldChange={(next, key, value, prev) => {
        if (key !== 'categoryId') return next;
        const filteredTypes = types.filter((t) => String(t.categoryId) === String(value || ''));
        const prevTypeValid = filteredTypes.some((t) => String(t.typeId) === String(prev?.typeId || next.typeId || ''));
        const allowedManufacturerIds = new Set(
          manufacturerCategoryLinks
            .filter((mc) => String(mc.categoryId) === String(value || ''))
            .map((mc) => String(mc.manufacturerId))
        );
        const prevManufacturerValid = allowedManufacturerIds.has(String(prev?.manufacturerId || next.manufacturerId || ''));
        return {
          ...next,
          manufacturerId: prevManufacturerValid ? next.manufacturerId : '',
          typeId: prevTypeValid ? next.typeId : '',
        };
      }}
      listFetcher={vehicleModelService.list}
      getByIdFetcher={vehicleModelService.getById}
      createFetcher={vehicleModelService.create}
      updateFetcher={vehicleModelService.update}
      deleteFetcher={vehicleModelService.delete}
      autoSearch
      autoSearchDebounceMs={350}
      fitViewport
      viewportOffset={190}
    />
  );
}
