import { useMemo, useState } from 'react';
import FactoryRoundedIcon from '@mui/icons-material/FactoryRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import { Alert, Button, Stack } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CrudEntityPage from '../../organization/shared/CrudEntityPage';
import { vehicleManufacturerService } from '../../../services/vehicle_management/vehicle_manufacturer/vehicleManufacturerService';
import { useAuth } from '../../../app/AuthContext';
import { opt, req, toBool } from '../../employee_hr_management/shared/hrCrudCommon';

const maxLen = (label, value, n) => {
  const normalized = value == null ? '' : String(value).trim();
  if (normalized.length > n) throw new Error(`${label} must be at most ${n} characters`);
  return normalized;
};

const extractRows = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const COUNTRY_CODES = [
  'AF', 'AL', 'DZ', 'AD', 'AO', 'AG', 'AR', 'AM', 'AU', 'AT', 'AZ', 'BS', 'BH', 'BD', 'BB', 'BY', 'BE', 'BZ', 'BJ', 'BT', 'BO', 'BA', 'BW', 'BR', 'BN', 'BG', 'BF', 'BI',
  'CV', 'KH', 'CM', 'CA', 'CF', 'TD', 'CL', 'CN', 'CO', 'KM', 'CG', 'CD', 'CR', 'CI', 'HR', 'CU', 'CY', 'CZ',
  'DK', 'DJ', 'DM', 'DO',
  'EC', 'EG', 'SV', 'GQ', 'ER', 'EE', 'SZ', 'ET',
  'FJ', 'FI', 'FR',
  'GA', 'GM', 'GE', 'DE', 'GH', 'GR', 'GD', 'GT', 'GN', 'GW', 'GY',
  'HT', 'HN', 'HU',
  'IS', 'IN', 'ID', 'IR', 'IQ', 'IE', 'IL', 'IT',
  'JM', 'JP', 'JO',
  'KZ', 'KE', 'KI', 'KP', 'KR', 'KW', 'KG',
  'LA', 'LV', 'LB', 'LS', 'LR', 'LY', 'LI', 'LT', 'LU',
  'MG', 'MW', 'MY', 'MV', 'ML', 'MT', 'MH', 'MR', 'MU', 'MX', 'FM', 'MD', 'MC', 'MN', 'ME', 'MA', 'MZ', 'MM',
  'NA', 'NR', 'NP', 'NL', 'NZ', 'NI', 'NE', 'NG', 'MK', 'NO',
  'OM',
  'PK', 'PW', 'PA', 'PG', 'PY', 'PE', 'PH', 'PL', 'PT',
  'QA',
  'RO', 'RU', 'RW',
  'KN', 'LC', 'VC', 'WS', 'SM', 'ST', 'SA', 'SN', 'RS', 'SC', 'SL', 'SG', 'SK', 'SI', 'SB', 'SO', 'ZA', 'SS', 'ES', 'LK', 'SD', 'SR', 'SE', 'CH', 'SY',
  'TJ', 'TZ', 'TH', 'TL', 'TG', 'TO', 'TT', 'TN', 'TR', 'TM', 'TV',
  'UG', 'UA', 'AE', 'GB', 'US', 'UY', 'UZ',
  'VU', 'VA', 'VE', 'VN',
  'YE',
  'ZM', 'ZW',
];

export default function VehicleManufacturerPage() {
  const theme = useTheme();
  const { token } = useAuth();
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState('');

  const countryFormOptions = useMemo(() => {
    const display = typeof Intl !== 'undefined' && Intl.DisplayNames
      ? new Intl.DisplayNames(['en'], { type: 'region' })
      : null;
    const names = COUNTRY_CODES
      .map((code) => display?.of(code) || code)
      .filter(Boolean)
      .filter((name) => !/^\w{2}$/.test(name))
      .sort((a, b) => String(a).localeCompare(String(b)));
    return [{ value: '', label: 'Select Country' }, ...names.map((name) => ({ value: name, label: name }))];
  }, []);

  const createManufacturer = async (authToken, payload) => {
    const existing = await vehicleManufacturerService.list(authToken, {
      manufacturerName_like: payload.manufacturerName,
      country_like: payload.country,
      sortBy: 'manufacturerName',
      sortDir: 'asc',
    });
    const dup = extractRows(existing).some(
      (x) => String(x?.manufacturerName || '').trim().toLowerCase() === payload.manufacturerName.toLowerCase()
        && String(x?.country || '').trim().toLowerCase() === payload.country.toLowerCase()
    );
    if (dup) throw new Error('Manufacturer name already exists for selected country');
    return vehicleManufacturerService.create(authToken, payload);
  };

  const exportManufacturersExcel = async () => {
    if (!token || exporting) return;
    setExportError('');
    setExporting(true);
    try {
      const { blob, filename } = await vehicleManufacturerService.exportExcel(token, {
        sortBy: 'manufacturerName',
        sortDir: 'asc',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'vehicle-manufacturers.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      setExportError(e?.message || 'Failed to export Vehicle Manufacturers Excel');
    } finally {
      setExporting(false);
    }
  };

  return (
    <Stack spacing={2}>
      {exportError ? <Alert severity="error" onClose={() => setExportError('')}>{exportError}</Alert> : null}
      <CrudEntityPage
        title="Vehicle Manufacturers"
        icon={<FactoryRoundedIcon sx={{ color: '#fff', fontSize: 20 }} />}
        gradient={`linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`}
        idKey="manufacturerId"
        columns={[
          { key: 'manufacturerCode', label: 'Code' },
          { key: 'manufacturerName', label: 'Manufacturer' },
          { key: 'manufacturerBrand', label: 'Brand' },
          { key: 'country', label: 'Country' },
          { key: 'website', label: 'Website' },
          { key: 'isActive', label: 'Active', type: 'boolean' },
          { key: 'supportPhone', label: 'Support Phone' },
          { key: 'supportEmail', label: 'Support Email' },
        ]}
        filterFields={[
          { key: 'manufacturerCode_like', label: 'Manufacturer Code' },
          { key: 'manufacturerName_like', label: 'Manufacturer Name' },
          { key: 'manufacturerBrand_like', label: 'Manufacturer Brand' },
          { key: 'country_like', label: 'Country' },
          { key: 'isActive', label: 'Active', type: 'boolean' },
        ]}
        formFields={[
          { key: 'manufacturerCode', label: 'Manufacturer Code' },
          { key: 'manufacturerName', label: 'Manufacturer Name' },
          { key: 'manufacturerBrand', label: 'Manufacturer Brand' },
          { key: 'country', label: 'Country', type: 'autocomplete', options: countryFormOptions },
          { key: 'logoUrl', label: 'Logo URL' },
          { key: 'website', label: 'Website' },
          { key: 'supportPhone', label: 'Support Phone' },
          { key: 'supportEmail', label: 'Support Email' },
          { key: 'isActive', label: 'Is Active', type: 'boolean' },
          { key: 'description', label: 'Description', fullWidth: true, minWidth: 320 },
        ]}
        defaultFilters={{
          manufacturerCode_like: '',
          manufacturerName_like: '',
          manufacturerBrand_like: '',
          country_like: '',
          isActive: '',
          sortBy: 'manufacturerName',
          sortDir: 'asc',
        }}
        emptyForm={{
          manufacturerCode: '',
          manufacturerName: '',
          manufacturerBrand: '',
          country: '',
          logoUrl: '',
          website: '',
          supportPhone: '',
          supportEmail: '',
          description: '',
          isActive: 'true',
        }}
        normalizePayload={(f) => {
          const manufacturerCode = maxLen('Manufacturer Code', req(f.manufacturerCode).toUpperCase(), 50);
          const manufacturerName = maxLen('Manufacturer Name', req(f.manufacturerName), 100);
          const manufacturerBrand = opt(maxLen('Manufacturer Brand', f.manufacturerBrand, 100));
          const country = maxLen('Country', req(f.country), 100);
          const website = opt(maxLen('Website', f.website, 200));
          const supportPhone = opt(maxLen('Support Phone', f.supportPhone, 20));
          const supportEmail = opt(maxLen('Support Email', f.supportEmail, 100));
          return {
            manufacturerCode,
            manufacturerName,
            manufacturerBrand,
            country,
            logoUrl: opt(f.logoUrl),
            website,
            supportPhone,
            supportEmail,
            description: opt(f.description),
            isActive: toBool(f.isActive),
          };
        }}
        headerActions={(
          <Button
            variant="outlined"
            size="small"
            startIcon={<DownloadRoundedIcon />}
            onClick={exportManufacturersExcel}
            disabled={!token || exporting}
            sx={{ height: 36, fontWeight: 600 }}
          >
            {exporting ? 'Exporting...' : 'Export Excel'}
          </Button>
        )}
        listFetcher={vehicleManufacturerService.list}
        getByIdFetcher={vehicleManufacturerService.getById}
        createFetcher={createManufacturer}
        updateFetcher={vehicleManufacturerService.update}
        deleteFetcher={vehicleManufacturerService.delete}
        autoSearch
        autoSearchDebounceMs={350}
        fitViewport
        viewportOffset={190}
      />
    </Stack>
  );
}
