import StoreRoundedIcon from '@mui/icons-material/StoreRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Stack } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CrudEntityPage from '../../organization/shared/CrudEntityPage';
import { distributorService } from '../../../services/vehicle_management/distributor/distributorService';
import { vehicleManufacturerService } from '../../../services/vehicle_management/vehicle_manufacturer/vehicleManufacturerService';
import { useAuth } from '../../../app/AuthContext';
import { opt, req, rowsFrom, toBool } from '../../employee_hr_management/shared/hrCrudCommon';

export default function DistributorPage() {
  const theme = useTheme();
  const { token } = useAuth();
  const [manufacturers, setManufacturers] = useState([]);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState('');

  useEffect(() => {
    (async () => {
      if (!token) return;
      try {
        const mr = await vehicleManufacturerService.list(token, { sortBy: 'manufacturerName', sortDir: 'asc' });
        setManufacturers(rowsFrom(mr));
      } catch {
        setManufacturers([]);
      }
    })();
  }, [token]);

  const manufacturerById = useMemo(
    () => Object.fromEntries(manufacturers.map((m) => [String(m.manufacturerId), m])),
    [manufacturers]
  );
  const manufacturerFilterOptions = useMemo(
    () => [{ value: '', label: 'All Manufacturers' }, ...manufacturers.map((m) => ({ value: String(m.manufacturerId), label: `${m.manufacturerName} (${m.country || '-'})` }))],
    [manufacturers]
  );
  const manufacturerFormOptions = useMemo(
    () => [{ value: '', label: 'Select Manufacturer' }, ...manufacturers.map((m) => ({ value: String(m.manufacturerId), label: `${m.manufacturerName} (${m.country || '-'})` }))],
    [manufacturers]
  );

  const exportDistributorsExcel = async () => {
    if (!token || exporting) return;
    setExportError('');
    setExporting(true);
    try {
      const { blob, filename } = await distributorService.exportExcel(token, {
        sortBy: 'distributorName',
        sortDir: 'asc',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'distributors.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      setExportError(e?.message || 'Failed to export Distributors Excel');
    } finally {
      setExporting(false);
    }
  };

  return (
    <Stack spacing={2}>
      {exportError ? <Alert severity="error" onClose={() => setExportError('')}>{exportError}</Alert> : null}
      <CrudEntityPage
        title="Distributors"
        icon={<StoreRoundedIcon sx={{ color: '#fff', fontSize: 20 }} />}
        gradient={`linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`}
        idKey="distributorId"
        columns={[
        { key: 'manufacturerId', label: 'Manufacturer', render: (r) => manufacturerById[String(r.manufacturerId)] ? `${manufacturerById[String(r.manufacturerId)].manufacturerName} (${manufacturerById[String(r.manufacturerId)].country || '-'})` : '-' },
        { key: 'distributorName', label: 'Distributor Name' },
        { key: 'distributorCountry', label: 'Country' },
        { key: 'distributorLocation', label: 'Location' },
        { key: 'distributorPhoneNumber', label: 'Phone' },
        { key: 'distributorEmail', label: 'Email' },
        { key: 'isActive', label: 'Active', type: 'boolean' },
        ]}
        filterFields={[
        { key: 'manufacturerId', label: 'Manufacturer', type: 'autocomplete', options: manufacturerFilterOptions },
        { key: 'distributorName_like', label: 'Distributor Name' },
        { key: 'distributorCountry_like', label: 'Country' },
        { key: 'distributorLocation_like', label: 'Location' },
        { key: 'isActive', label: 'Active', type: 'boolean' },
        ]}
        formFields={[
        { key: 'manufacturerId', label: 'Manufacturer', type: 'autocomplete', options: manufacturerFormOptions },
        { key: 'distributorName', label: 'Distributor Name' },
        { key: 'distributorCountry', label: 'Distributor Country' },
        { key: 'distributorLocation', label: 'Distributor Location' },
        { key: 'distributorLogo', label: 'Distributor Logo URL' },
        { key: 'distributorPhoneNumber', label: 'Distributor Phone Number' },
        { key: 'distributorEmail', label: 'Distributor Email' },
        { key: 'isActive', label: 'Is Active', type: 'boolean' },
        { key: 'distributorDescription', label: 'Distributor Description', fullWidth: true, minWidth: 320 },
      ]}
        defaultFilters={{ manufacturerId: '', distributorName_like: '', distributorCountry_like: '', distributorLocation_like: '', isActive: '', sortBy: 'distributorName', sortDir: 'asc' }}
        emptyForm={{
        manufacturerId: '',
        distributorName: '',
        distributorCountry: '',
        distributorLocation: '',
        distributorLogo: '',
        distributorPhoneNumber: '',
        distributorEmail: '',
        distributorDescription: '',
        isActive: 'true',
        }}
        normalizePayload={(f) => ({
        manufacturerId: opt(f.manufacturerId),
        distributorName: req(f.distributorName),
        distributorCountry: req(f.distributorCountry),
        distributorLocation: opt(f.distributorLocation),
        distributorLogo: opt(f.distributorLogo),
        distributorPhoneNumber: opt(f.distributorPhoneNumber),
        distributorEmail: opt(f.distributorEmail),
          distributorDescription: opt(f.distributorDescription),
          isActive: toBool(f.isActive),
        })}
        headerActions={(
          <Button
            variant="outlined"
            size="small"
            startIcon={<DownloadRoundedIcon />}
            onClick={exportDistributorsExcel}
            disabled={!token || exporting}
            sx={{ height: 36, fontWeight: 600 }}
          >
            {exporting ? 'Exporting...' : 'Export Excel'}
          </Button>
        )}
        onFormFieldChange={(next, fieldKey, value) => {
        if (fieldKey !== 'manufacturerId') return next;
        const selected = manufacturerById[String(value || '')];
        if (!selected) return next;
        return { ...next, distributorCountry: selected.country || next.distributorCountry };
        }}
        listFetcher={distributorService.list}
        getByIdFetcher={distributorService.getById}
        createFetcher={distributorService.create}
        updateFetcher={distributorService.update}
        deleteFetcher={distributorService.delete}
        autoSearch
        autoSearchDebounceMs={350}
        fitViewport
        viewportOffset={190}
      />
    </Stack>
  );
}
