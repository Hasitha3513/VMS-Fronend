import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import CrudEntityPage from '../../organization/shared/CrudEntityPage';
import { useAuth } from '../../../app/AuthContext';
import { vehicleModelService } from '../../../services/vehicle_management/vehicle_model/vehicleModelService';
import { vehicleModelVariantService } from '../../../services/vehicle_management/vehicle_model_variant/vehicleModelVariantService';
import { opt, req, rowsFrom, toBool, toDecimal } from '../../employee_hr_management/shared/hrCrudCommon';

export default function VehicleModelVariantPage() {
  const theme = useTheme();
  const { token } = useAuth();
  const [models, setModels] = useState([]);

  useEffect(() => {
    (async () => {
      if (!token) return;
      try {
        const res = await vehicleModelService.list(token, { sortBy: 'modelName', sortDir: 'asc' });
        setModels(rowsFrom(res));
      } catch {
        setModels([]);
      }
    })();
  }, [token]);

  const modelById = useMemo(
    () => Object.fromEntries(models.map((m) => [String(m.modelId), m])),
    [models]
  );
  const modelOptions = useMemo(
    () => [
      { value: '', label: 'All Models' },
      ...models.map((m) => ({
        value: String(m.modelId),
        label: `${m.modelName}${m.modelCode ? ` (${m.modelCode})` : ''}${m.modelYear ? ` - ${m.modelYear}` : ''}`,
      })),
    ],
    [models]
  );
  const modelFormOptions = useMemo(
    () => [
      { value: '', label: 'Select Model' },
      ...models.map((m) => ({
        value: String(m.modelId),
        label: `${m.modelName}${m.modelCode ? ` (${m.modelCode})` : ''}${m.modelYear ? ` - ${m.modelYear}` : ''}`,
      })),
    ],
    [models]
  );

  return (
    <CrudEntityPage
      title="Vehicle Model Variants"
      icon={<TuneRoundedIcon sx={{ color: '#fff', fontSize: 20 }} />}
      gradient={`linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`}
      idKey="variantId"
      columns={[
        { key: 'variantName', label: 'Variant' },
        { key: 'variantCode', label: 'Code' },
        { key: 'modelId', label: 'Model', render: (r) => modelById[String(r.modelId)]?.modelName || '-' },
        { key: 'priceExShowroom', label: 'Ex-showroom Price' },
        { key: 'isActive', label: 'Active', type: 'boolean' },
      ]}
      filterFields={[
        { key: 'variantName_like', label: 'Variant Name' },
        { key: 'variantCode_like', label: 'Variant Code' },
        { key: 'modelId', label: 'Model', type: 'autocomplete', options: modelOptions },
        { key: 'isActive', label: 'Active', type: 'boolean' },
      ]}
      formFields={[
        { key: 'modelId', label: 'Model', type: 'autocomplete', options: modelFormOptions },
        { key: 'variantName', label: 'Variant Name' },
        { key: 'variantCode', label: 'Variant Code' },
        { key: 'priceExShowroom', label: 'Price Ex-showroom', type: 'number' },
        { key: 'additionalFeatures', label: 'Additional Features', fullWidth: true, minWidth: 320 },
        { key: 'isActive', label: 'Is Active', type: 'boolean' },
      ]}
      defaultFilters={{ variantName_like: '', variantCode_like: '', modelId: '', isActive: '', sortBy: 'variantName', sortDir: 'asc' }}
      emptyForm={{ modelId: '', variantName: '', variantCode: '', priceExShowroom: '', additionalFeatures: '', isActive: 'true' }}
      normalizePayload={(f) => ({
        modelId: opt(f.modelId),
        variantName: req(f.variantName),
        variantCode: opt(f.variantCode),
        priceExShowroom: toDecimal(f.priceExShowroom),
        additionalFeatures: opt(f.additionalFeatures),
        isActive: toBool(f.isActive),
      })}
      listFetcher={vehicleModelVariantService.list}
      getByIdFetcher={vehicleModelVariantService.getById}
      createFetcher={vehicleModelVariantService.create}
      updateFetcher={vehicleModelVariantService.update}
      deleteFetcher={vehicleModelVariantService.delete}
      autoSearch
      autoSearchDebounceMs={350}
      fitViewport
      viewportOffset={190}
    />
  );
}
