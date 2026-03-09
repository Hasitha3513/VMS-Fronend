import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded';
import { Alert, Chip } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import CrudEntityPage from '../../organization/shared/CrudEntityPage';
import { useAuth } from '../../../app/AuthContext';
import { vehicleLocationService } from '../../../services/vehicle_management/vehicle_location/vehicleLocationService';
import { opt, req, toBool } from '../../employee_hr_management/shared/hrCrudCommon';

const EMPTY_LABEL_OPTION = { value: '', label: 'Select' };
const REQUIRED_BASE_LOCATION_OPTIONS = [
  { value: 'COMPANY', label: 'Company' },
  { value: 'BRANCH', label: 'Branch' },
  { value: 'DEPARTMENT', label: 'Department' },
  { value: 'PROJECT', label: 'Project' },
  { value: 'SUPPLIER', label: 'Supplier' },
  { value: 'WORKSHOP', label: 'Workshop' },
  { value: 'OTHER', label: 'Other' },
];

const formatVehicleLabel = (row) => {
  const display = row?.displayName || row?.display_name || '';
  const identify = row?.identifyCode || row?.identify_code || row?.keyNumber || row?.key_number || '';
  const reg = row?.registrationNumber || row?.registration_number || '';
  const chs = row?.chassisNumber || row?.chassis_number || '';
  if (display) return display;
  if (identify && reg && chs) return `${identify} | ${reg} | ${chs}`;
  if (identify && reg) return `${identify} | ${reg}`;
  if (identify && chs) return `${identify} | ${chs}`;
  if (reg && chs) return `${reg} | ${chs}`;
  if (identify) return identify;
  if (reg) return reg;
  if (chs) return chs;
  return 'Vehicle';
};

const isOtherBaseLocation = (value) => String(value || '').toUpperCase() === 'OTHER';

export default function CompanyVehicleLocationPanel({
  companyId,
  companyVehicleId,
  vehicleId,
  vehicleRows,
}) {
  const theme = useTheme();
  const { token } = useAuth();
  const scopedCompanyVehicleId = String(companyVehicleId || vehicleId || '');

  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');
  const [vehicleOptions, setVehicleOptions] = useState([]);
  const [baseLocationOptions, setBaseLocationOptions] = useState([]);
  const [locationTypeOptions, setLocationTypeOptions] = useState([]);
  const [locationNameOptions, setLocationNameOptions] = useState([]);

  const fallbackVehicleOptions = useMemo(
    () => (vehicleRows || []).map((r) => ({
      value: String(r?.companyVehicleId || r?.companyvehicleId || r?.companyvehicle_id || r?.id || ''),
      label: `${r?.keyNumber || '-'} | ${r?.registrationNumber || '-'} | ${r?.chassisNumber || '-'}`,
      vehicleId: '',
    })).filter((x) => x.value),
    [vehicleRows]
  );

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      if (!token) return;
      setLookupLoading(true);
      setLookupError('');
      try {
        const payload = scopedCompanyVehicleId
          ? await vehicleLocationService.companyVehicleLookups(token, scopedCompanyVehicleId, {})
          : await vehicleLocationService.lookups(token, { companyId: companyId || '' });

        if (ignore) return;

        const vehicles = Array.isArray(payload?.vehicleDropdown) ? payload.vehicleDropdown : [];
        const baseLocations = Array.isArray(payload?.baseLocationDropdown) ? payload.baseLocationDropdown : [];
        const types = Array.isArray(payload?.locationTypeDropdown) ? payload.locationTypeDropdown : [];
        const names = Array.isArray(payload?.locationNameDropdown) ? payload.locationNameDropdown : [];

        const vehicleDropdown = vehicles.map((x) => ({
          value: String(x?.companyVehicleId || ''),
          label: formatVehicleLabel(x),
          vehicleId: String(x?.vehicleId || ''),
        })).filter((x) => x.value);

        setVehicleOptions(vehicleDropdown);
        const fromApi = baseLocations.map((x) => ({
          value: String(x?.code || ''),
          label: x?.label || x?.code || '',
        })).filter((x) => x.value);
        const mergedBaseLocations = [...fromApi];
        REQUIRED_BASE_LOCATION_OPTIONS.forEach((req) => {
          if (!mergedBaseLocations.some((x) => String(x.value).toUpperCase() === req.value)) {
            mergedBaseLocations.push(req);
          }
        });
        setBaseLocationOptions(mergedBaseLocations);
        setLocationTypeOptions(types.map((x) => ({
          value: String(x?.code || ''),
          label: x?.label || x?.code || '',
        })).filter((x) => x.value));
        setLocationNameOptions(names.map((x) => ({
          value: String(x?.id || ''),
          label: x?.name || x?.code || '',
        })).filter((x) => x.value));
      } catch (e) {
        if (!ignore) setLookupError(e?.message || 'Failed to load vehicle location lookups');
      } finally {
        if (!ignore) setLookupLoading(false);
      }
    };
    void load();
    return () => { ignore = true; };
  }, [token, companyId, scopedCompanyVehicleId]);

  const effectiveVehicleOptions = vehicleOptions.length ? vehicleOptions : fallbackVehicleOptions;

  const vehicleOptionByCompanyVehicleId = useMemo(() => {
    const map = new Map();
    effectiveVehicleOptions.forEach((x) => map.set(String(x.value), x));
    return map;
  }, [effectiveVehicleOptions]);

  const companyVehicleIdFromProps = useMemo(() => {
    if (scopedCompanyVehicleId) return scopedCompanyVehicleId;
    return effectiveVehicleOptions[0]?.value || '';
  }, [scopedCompanyVehicleId, effectiveVehicleOptions]);

  const baseFilters = useMemo(
    () => ({
      companyId: companyId || '',
      companyVehicleId: companyVehicleIdFromProps,
      vehicleId: vehicleOptionByCompanyVehicleId.get(companyVehicleIdFromProps)?.vehicleId || '',
      baseLocationType: '',
      locationType: '',
      city: '',
      isCurrent: '',
      q: '',
      sortBy: 'recordedAt',
      sortDir: 'desc',
    }),
    [companyId, companyVehicleIdFromProps, vehicleOptionByCompanyVehicleId]
  );

  const baseForm = useMemo(
    () => ({
      companyId: companyId || '',
      companyVehicleId: companyVehicleIdFromProps,
      vehicleId: vehicleOptionByCompanyVehicleId.get(companyVehicleIdFromProps)?.vehicleId || '',
      baseLocationType: '',
      locationType: '',
      locationName: '',
      city: '',
      periodStartDate: '',
      periodEndDate: '',
      durationDays: '',
      isCurrent: 'true',
    }),
    [companyId, companyVehicleIdFromProps, vehicleOptionByCompanyVehicleId]
  );

  return (
    <>
      {lookupError ? <Alert severity="error" sx={{ mb: 2 }}>{lookupError}</Alert> : null}
      <CrudEntityPage
        title="Vehicle Location"
        icon={<PlaceRoundedIcon sx={{ color: '#fff', fontSize: 20 }} />}
        gradient={`linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`}
        idKey="locationId"
        columns={[
          { key: 'identifyCode', label: 'Identify Code', render: (r) => (r?.identifyCode || r?.identify_code || '-') },
          { key: 'registrationNumber', label: 'Register No', render: (r) => (r?.registrationNumber || r?.registration_number || '-') },
          { key: 'baseLocationType', label: 'Base Location Type' },
          { key: 'locationType', label: 'Location Type' },
          { key: 'locationName', label: 'Location Name (From Base Location)' },
          { key: 'periodStartDate', label: 'Period Start' },
          { key: 'periodEndDate', label: 'Period End' },
          { key: 'durationDays', label: 'Stay (Days)' },
          {
            key: 'recordType',
            label: 'Type',
            render: (r) => (
              <Chip
                size="small"
                label={(r?.recordType || r?.record_type || ((r?.isCurrent ?? r?.is_current) ? 'Current' : 'Previous'))}
                color={(r?.isCurrent ?? r?.is_current) ? 'primary' : 'default'}
              />
            ),
          },
          { key: 'isCurrent', label: 'Current', render: (r) => (r?.isCurrent ? 'Yes' : 'No') },
        ]}
        filterFields={[
          {
            key: 'companyVehicleId',
            label: 'Vehicle',
            type: 'autocomplete',
            options: [EMPTY_LABEL_OPTION, ...effectiveVehicleOptions],
          },
          {
            key: 'baseLocationType',
            label: 'Base Location Type',
            type: 'autocomplete',
            options: [EMPTY_LABEL_OPTION, ...baseLocationOptions],
          },
          {
            key: 'locationType',
            label: 'Location Type',
            type: 'autocomplete',
            options: [EMPTY_LABEL_OPTION, ...locationTypeOptions],
          },
          { key: 'city', label: 'City' },
          { key: 'isCurrent', label: 'Current', type: 'boolean' },
          { key: 'q', label: 'Search' },
        ]}
        formFields={[
          {
            key: 'companyVehicleId',
            label: 'Vehicle (Identify Code | Register No | Chassis No)',
            type: 'autocomplete',
            options: [EMPTY_LABEL_OPTION, ...effectiveVehicleOptions],
          },
          {
            key: 'baseLocationType',
            label: 'Base Location Type',
            type: 'autocomplete',
            options: [EMPTY_LABEL_OPTION, ...baseLocationOptions],
          },
          {
            key: 'locationType',
            label: 'Location Type',
            type: 'autocomplete',
            options: [EMPTY_LABEL_OPTION, ...locationTypeOptions],
          },
          {
            key: 'locationName',
            label: 'Location Name (From Base Location)',
            typeByForm: (form) => (isOtherBaseLocation(form?.baseLocationType) ? 'text' : 'autocomplete'),
            optionsByForm: (form) => (
              isOtherBaseLocation(form?.baseLocationType)
                ? []
                : [EMPTY_LABEL_OPTION, ...locationNameOptions]
            ),
          },
          { key: 'city', label: 'City' },
          { key: 'periodStartDate', label: 'Period Start Date', type: 'date' },
          { key: 'periodEndDate', label: 'Period End Date', type: 'date' },
          { key: 'durationDays', label: 'Stay Days', type: 'number', readOnly: true },
        ]}
        defaultFilters={baseFilters}
        emptyForm={baseForm}
        prefillFilters={{
          companyId: companyId || '',
          companyVehicleId: companyVehicleIdFromProps,
          vehicleId: vehicleOptionByCompanyVehicleId.get(companyVehicleIdFromProps)?.vehicleId || '',
        }}
        prefillForm={{
          companyId: companyId || '',
          companyVehicleId: companyVehicleIdFromProps,
          vehicleId: vehicleOptionByCompanyVehicleId.get(companyVehicleIdFromProps)?.vehicleId || '',
        }}
        mapRecordToForm={(row) => {
          const matchedVehicle = effectiveVehicleOptions.find((x) => String(x.vehicleId || '') === String(row?.vehicleId || ''));
          const isOther = isOtherBaseLocation(row?.baseLocationType);
          return {
            companyId: String(row?.companyId || companyId || ''),
            companyVehicleId: matchedVehicle?.value || companyVehicleIdFromProps || '',
            vehicleId: String(row?.vehicleId || ''),
            baseLocationType: String(row?.baseLocationType || ''),
            locationType: String(row?.locationType || ''),
            locationName: isOther ? String(row?.locationName || '') : String(row?.baseLocationId || ''),
            city: String(row?.city || ''),
            periodStartDate: String(row?.periodStartDate || ''),
            periodEndDate: String(row?.periodEndDate || ''),
            durationDays: row?.durationDays == null ? '' : String(row.durationDays),
            isCurrent: row?.isCurrent === false ? 'false' : 'true',
          };
        }}
        normalizePayload={(f) => {
          const selectedVehicle = vehicleOptionByCompanyVehicleId.get(String(f.companyVehicleId || ''));
          const baseType = opt(f.baseLocationType);
          const isOther = isOtherBaseLocation(baseType);
          return {
            companyId: req(f.companyId || companyId),
            companyVehicleId: opt(f.companyVehicleId),
            vehicleId: req(selectedVehicle?.vehicleId || f.vehicleId),
            branchId: null,
            departmentId: null,
            baseLocationType: baseType,
            baseLocationId: isOther ? null : opt(f.locationName),
            locationType: opt(f.locationType),
            locationName: isOther ? opt(f.locationName) : null,
            addressLine1: null,
            addressLine2: null,
            city: opt(f.city),
            state: null,
            country: null,
            pinCode: null,
            assignedZone: null,
            assignedRegion: null,
            periodStartDate: opt(f.periodStartDate),
            periodEndDate: opt(f.periodEndDate),
            recordedBy: null,
            isCurrent: toBool(f.isCurrent),
            notes: null,
          };
        }}
        onFormFieldChange={(next, key, value) => {
          if (key === 'companyVehicleId') {
            const selectedVehicle = vehicleOptionByCompanyVehicleId.get(String(value || ''));
            return {
              ...next,
              companyVehicleId: value,
              vehicleId: selectedVehicle?.vehicleId || '',
            };
          }

          if (key === 'baseLocationType') {
            const isOther = isOtherBaseLocation(value);
            if (isOther || !value) {
              setLocationNameOptions([]);
              return { ...next, baseLocationType: value, locationName: '' };
            }
            return vehicleLocationService.locationNameOptions(token, {
              baseLocationType: value,
              companyId: next.companyId || companyId || '',
            }).then((rows) => {
              const options = (Array.isArray(rows) ? rows : []).map((x) => ({
                value: String(x?.id || ''),
                label: x?.name || x?.code || '',
              })).filter((x) => x.value);
              setLocationNameOptions(options);
              return { ...next, baseLocationType: value, locationName: '' };
            }).catch(async () => {
              try {
                const rows = await vehicleLocationService.locationNameOptions(token, {
                  baseLocationType: value,
                });
                const options = (Array.isArray(rows) ? rows : []).map((x) => ({
                  value: String(x?.id || ''),
                  label: x?.name || x?.code || '',
                })).filter((x) => x.value);
                setLocationNameOptions(options);
              } catch {
                setLocationNameOptions([]);
              }
              return { ...next, baseLocationType: value, locationName: '' };
            });
          }

          if (key === 'periodStartDate' || key === 'periodEndDate') {
            const start = (key === 'periodStartDate' ? value : next.periodStartDate) || '';
            const end = (key === 'periodEndDate' ? value : next.periodEndDate) || '';
            let durationDays = '';
            if (start) {
              const s = new Date(start);
              const e = end ? new Date(end) : new Date();
              if (!Number.isNaN(s.getTime()) && !Number.isNaN(e.getTime())) {
                const diff = Math.floor((e.setHours(0, 0, 0, 0) - s.setHours(0, 0, 0, 0)) / 86400000) + 1;
                durationDays = String(Math.max(1, diff));
              }
            }
            return { ...next, [key]: value, durationDays };
          }
          return next;
        }}
        listFetcher={(sessionToken, params) => {
          if (params?.companyVehicleId) {
            return vehicleLocationService.companyVehicleList(sessionToken, params.companyVehicleId);
          }
          const selectedVehicle = vehicleOptionByCompanyVehicleId.get(String(params?.companyVehicleId || ''));
          return vehicleLocationService.list(sessionToken, {
            ...params,
            vehicleId: selectedVehicle?.vehicleId || params?.vehicleId || '',
          });
        }}
        getByIdFetcher={vehicleLocationService.getById}
        createFetcher={vehicleLocationService.create}
        updateFetcher={vehicleLocationService.update}
        deleteFetcher={vehicleLocationService.delete}
        autoSearch
        autoSearchDebounceMs={350}
        fitViewport
        viewportOffset={250}
        hideHeader={false}
        hideFilters
        hideFilterSearchButton
        showHeaderResetFilters={false}
      />
      {lookupLoading ? <Alert severity="info" sx={{ mt: 2 }}>Loading location lookups...</Alert> : null}
    </>
  );
}
