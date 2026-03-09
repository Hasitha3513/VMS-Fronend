import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import CrudEntityPage from '../../organization/shared/CrudEntityPage';
import { useAuth } from '../../../app/AuthContext';
import { vehicleManufacturerService } from '../../../services/vehicle_management/vehicle_manufacturer/vehicleManufacturerService';
import { vehicleCategoryService } from '../../../services/vehicle_management/vehicle_category/vehicleCategoryService';
import { manufacturerCategoryService } from '../../../services/vehicle_management/manufacturer_category/manufacturerCategoryService';
import { opt, rowsFrom } from '../../employee_hr_management/shared/hrCrudCommon';

export default function ManufacturerCategoryPage() {
  const theme = useTheme();
  const { token } = useAuth();
  const [manufacturers, setManufacturers] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    (async () => {
      if (!token) return;
      try {
        const [mr, cr] = await Promise.all([
          vehicleManufacturerService.list(token, { sortBy: 'manufacturerName', sortDir: 'asc' }),
          vehicleCategoryService.list(token, { sortBy: 'categoryName', sortDir: 'asc' }),
        ]);
        setManufacturers(rowsFrom(mr));
        setCategories(rowsFrom(cr));
      } catch {
        setManufacturers([]);
        setCategories([]);
      }
    })();
  }, [token]);

  const manufacturerById = useMemo(
    () => Object.fromEntries(manufacturers.map((m) => [String(m.manufacturerId), m])),
    [manufacturers]
  );
  const categoryById = useMemo(
    () => Object.fromEntries(categories.map((c) => [String(c.categoryId), c])),
    [categories]
  );
  const manufacturerOptions = useMemo(
    () => [{ value: '', label: 'All Manufacturers' }, ...manufacturers.map((m) => ({ value: String(m.manufacturerId), label: `${m.manufacturerName} (${m.country || '-'})` }))],
    [manufacturers]
  );
  const manufacturerFormOptions = useMemo(
    () => [{ value: '', label: 'Select Manufacturer' }, ...manufacturers.map((m) => ({ value: String(m.manufacturerId), label: `${m.manufacturerName} (${m.country || '-'})` }))],
    [manufacturers]
  );
  const categoryOptions = useMemo(
    () => [{ value: '', label: 'All Categories' }, ...categories.map((c) => ({ value: String(c.categoryId), label: `${c.categoryName} (${c.categoryCode || '-'})` }))],
    [categories]
  );
  const categoryFormOptions = useMemo(
    () => [{ value: '', label: 'Select Category' }, ...categories.map((c) => ({ value: String(c.categoryId), label: `${c.categoryName} (${c.categoryCode || '-'})` }))],
    [categories]
  );

  return (
    <CrudEntityPage
      title="Manufacturer Categories"
      icon={<LinkRoundedIcon sx={{ color: '#fff', fontSize: 20 }} />}
      gradient={`linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`}
      idKey="id"
      columns={[
        {
          key: 'manufacturerId',
          label: 'Manufacturer',
          render: (r) => {
            const m = manufacturerById[String(r.manufacturerId)];
            if (!m) return '-';
            return `${m.manufacturerName} (${m.country || '-'})`;
          },
        },
        { key: 'categoryId', label: 'Category', render: (r) => categoryById[String(r.categoryId)]?.categoryName || '-' },
      ]}
      filterFields={[
        { key: 'manufacturerId', label: 'Manufacturer', type: 'autocomplete', options: manufacturerOptions },
        { key: 'categoryId', label: 'Category', type: 'autocomplete', options: categoryOptions },
      ]}
      formFields={[
        { key: 'manufacturerId', label: 'Manufacturer', type: 'autocomplete', options: manufacturerFormOptions },
        { key: 'categoryId', label: 'Category', type: 'autocomplete', options: categoryFormOptions },
      ]}
      defaultFilters={{ manufacturerId: '', categoryId: '', sortBy: 'manufacturerId', sortDir: 'asc' }}
      emptyForm={{ manufacturerId: '', categoryId: '' }}
      normalizePayload={(f) => ({ manufacturerId: opt(f.manufacturerId), categoryId: opt(f.categoryId) })}
      listFetcher={manufacturerCategoryService.list}
      getByIdFetcher={manufacturerCategoryService.getById}
      createFetcher={manufacturerCategoryService.create}
      updateFetcher={manufacturerCategoryService.update}
      deleteFetcher={manufacturerCategoryService.delete}
      autoSearch
      autoSearchDebounceMs={350}
      fitViewport
      viewportOffset={190}
    />
  );
}
