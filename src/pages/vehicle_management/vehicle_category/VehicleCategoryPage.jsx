import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Stack } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CrudEntityPage from '../../organization/shared/CrudEntityPage';
import { useAuth } from '../../../app/AuthContext';
import { organizationService } from '../../../services/organizationService';
import { vehicleCategoryService } from '../../../services/vehicle_management/vehicle_category/vehicleCategoryService';
import { opt, req, rowsFrom, toBool, toInt } from '../../employee_hr_management/shared/hrCrudCommon';

export default function VehicleCategoryPage() {
  const theme = useTheme();
  const { token } = useAuth();
  const [types, setTypes] = useState([]);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState('');

  useEffect(() => {
    (async () => {
      if (!token) return;
      try {
        const [tr] = await Promise.all([
      organizationService.enumValues('vehicle_category_type', { locale: 'en-US', activeOnly: true }),
        ]);
        setTypes(rowsFrom(tr));
      } catch {
        setTypes([]);
      }
    })();
  }, [token]);

  const typeById = useMemo(() => Object.fromEntries(types.map((t) => [String(t.id), t.name])), [types]);
  const typeOpts = useMemo(() => [{ value: '', label: 'All Category Types' }, ...types.map((t) => ({ value: String(t.id), label: t.name }))], [types]);
  const typeFormOpts = useMemo(() => [{ value: '', label: 'Select Category Type' }, ...types.map((t) => ({ value: String(t.id), label: t.name }))], [types]);

  const exportVehicleCategoriesExcel = async () => {
    if (!token || exporting) return;
    setExportError('');
    setExporting(true);
    try {
      const { blob, filename } = await vehicleCategoryService.exportExcel(token, {
        sortBy: 'categoryName',
        sortDir: 'asc',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'vehicle-categories.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      setExportError(e?.message || 'Failed to export Vehicle Categories Excel');
    } finally {
      setExporting(false);
    }
  };

  return (
    <Stack spacing={2}>
      {exportError ? <Alert severity="error" onClose={() => setExportError('')}>{exportError}</Alert> : null}
      <CrudEntityPage
        title="Vehicle Categories"
        icon={<CategoryRoundedIcon sx={{ color: '#fff', fontSize: 20 }} />}
        gradient={`linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`}
        idKey="categoryId"
        columns={[
        { key: 'categoryCode', label: 'Code' },
        { key: 'categoryName', label: 'Category' },
        { key: 'categoryTypeId', label: 'Category Type', render: (r) => typeById[String(r.categoryTypeId)] || '-' },
        { key: 'isActive', label: 'Active', type: 'boolean' },
        { key: 'description', label: 'Description' },
        ]}
        filterFields={[
        { key: 'categoryCode_like', label: 'Category Code' },
        { key: 'categoryName_like', label: 'Category Name' },
        { key: 'categoryTypeId', label: 'Category Type', type: 'autocomplete', options: typeOpts },
        { key: 'isActive', label: 'Active', type: 'boolean' },
        ]}
        formFields={[
        { key: 'categoryCode', label: 'Category Code' },
        { key: 'categoryName', label: 'Category Name' },
        { key: 'categoryTypeId', label: 'Category Type', type: 'autocomplete', options: typeFormOpts },
        { key: 'iconUrl', label: 'Icon URL' },
        { key: 'isActive', label: 'Is Active', type: 'boolean' },
        { key: 'description', label: 'Description', fullWidth: true, minWidth: 320 },
      ]}
        defaultFilters={{ categoryCode_like: '', categoryName_like: '', categoryTypeId: '', isActive: '', sortBy: 'categoryName', sortDir: 'asc' }}
        emptyForm={{ categoryCode: '', categoryName: '', categoryTypeId: '', iconUrl: '', isActive: 'true', description: '' }}
        normalizePayload={(f) => ({
          categoryCode: req(f.categoryCode),
          categoryName: req(f.categoryName),
          categoryTypeId: toInt(f.categoryTypeId),
          iconUrl: opt(f.iconUrl),
          isActive: toBool(f.isActive),
          description: opt(f.description),
        })}
        headerActions={(
          <Button
            variant="outlined"
            size="small"
            startIcon={<DownloadRoundedIcon />}
            onClick={exportVehicleCategoriesExcel}
            disabled={!token || exporting}
            sx={{ height: 36, fontWeight: 600 }}
          >
            {exporting ? 'Exporting...' : 'Export Excel'}
          </Button>
        )}
        listFetcher={vehicleCategoryService.list}
        getByIdFetcher={vehicleCategoryService.getById}
        createFetcher={vehicleCategoryService.create}
        updateFetcher={vehicleCategoryService.update}
        deleteFetcher={vehicleCategoryService.delete}
        autoSearch
        autoSearchDebounceMs={350}
        fitViewport
        viewportOffset={190}
      />
    </Stack>
  );
}
