import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import DirectionsCarRoundedIcon from '@mui/icons-material/DirectionsCarRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../app/AuthContext';
import { companyVehicleService } from '../../../services/vehicle_management/company_vehicle/companyVehicleService';
import { organizationService } from '../../../services/organizationService';
import { employeeService } from '../../../services/employee_hr_management/employee/employeeService';
import { vehicleFuelRecordService } from '../../../services/vehicle_management/vehicle_fuel_record/vehicleFuelRecordService';
import { vehicleLocationService } from '../../../services/vehicle_management/vehicle_location/vehicleLocationService';
import { vehicleTransferService } from '../../../services/vehicle_management/vehicle_transfer/vehicleTransferService';
import { vehicleRunningLogService } from '../../../services/vehicle_management/vehicle_running_log/vehicleRunningLogService';

function TabPanel({ value, index, children }) {
  if (value !== index) return null;
  return <Box sx={{ pt: 2 }}>{children}</Box>;
}

const isOtherType = (value) => String(value || '').toUpperCase() === 'OTHER';
const isUuid = (value) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || '').trim());
const datePart = (value) => {
  const d = value ? new Date(value) : new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export default function CompanyVehicleQrDetailsPage() {
  const { token, auth } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const companyVehicleId = useMemo(() => String(params.get('companyVehicleId') || ''), [params]);

  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [row, setRow] = useState(null);
  const [vehicleId, setVehicleId] = useState('');
  const [locationRows, setLocationRows] = useState([]);
  const [locationError, setLocationError] = useState('');

  const [baseLocationOptions, setBaseLocationOptions] = useState([]);
  const [locationNameOptions, setLocationNameOptions] = useState([]);
  const [transferForm, setTransferForm] = useState({
    requestedBaseLocationType: '',
    requestedBaseLocationId: '',
    requestedLocationType: '',
    requestedLocationName: '',
  });
  const [transferSaving, setTransferSaving] = useState(false);
  const [transferError, setTransferError] = useState('');
  const [transferSuccess, setTransferSuccess] = useState('');

  const [fuelLoading, setFuelLoading] = useState(false);
  const [fuelError, setFuelError] = useState('');
  const [fuelSaving, setFuelSaving] = useState(false);
  const [fuelSuccess, setFuelSuccess] = useState('');
  const [fuelForm, setFuelForm] = useState({
    fuelDate: '',
    fuelQty: '',
    currentKm: '',
    currentHr: '',
    fuelTypeId: '',
    operatorId: '',
    preparedBy: '',
    refillLocation: '',
    notes: '',
  });
  const [fuelRefillOptions, setFuelRefillOptions] = useState([]);
  const [fuelTypeOptions, setFuelTypeOptions] = useState([]);
  const [previousFuel, setPreviousFuel] = useState(null);
  const [workTypeOptions, setWorkTypeOptions] = useState([]);
  const [projectOptions, setProjectOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);

  const [runningNow, setRunningNow] = useState(new Date());
  const [runningLoading, setRunningLoading] = useState(false);
  const [runningSaving, setRunningSaving] = useState(false);
  const [runningError, setRunningError] = useState('');
  const [runningSuccess, setRunningSuccess] = useState('');
  const [runningState, setRunningState] = useState(null);
  const [runningForm, setRunningForm] = useState({
    projectId: '',
    startOdometer: '',
    startHourmeter: '',
    endOdometer: '',
    endHourmeter: '',
    workTypeId: '',
    workDescription: '',
    supervisorApproval: '',
  });

  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!token || !companyVehicleId) return;
      setLoading(true);
      setError('');
      try {
        const data = await companyVehicleService.getById(token, companyVehicleId);
        if (!ignore) setRow(data || null);
      } catch (e) {
        if (!ignore) setError(e?.message || 'Failed to load vehicle details');
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [token, companyVehicleId]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!token || !companyVehicleId) return;
      setLocationError('');
      try {
        const [listPayload, lookupPayload] = await Promise.all([
          vehicleLocationService.companyVehicleList(token, companyVehicleId),
          vehicleLocationService.companyVehicleLookups(token, companyVehicleId, {}),
        ]);
        const listRows = Array.isArray(listPayload) ? listPayload : (Array.isArray(listPayload?.data) ? listPayload.data : []);
        const vehicleDropdown = Array.isArray(lookupPayload?.vehicleDropdown) ? lookupPayload.vehicleDropdown : [];
        const vehicleOption = vehicleDropdown.find((x) => String(x?.companyVehicleId || '') === companyVehicleId) || vehicleDropdown[0] || null;
        const baseOptions = Array.isArray(lookupPayload?.baseLocationDropdown) ? lookupPayload.baseLocationDropdown : [];
        if (!ignore) {
          setLocationRows(listRows);
          setVehicleId(String(vehicleOption?.vehicleId || ''));
          setBaseLocationOptions(baseOptions.map((x) => ({
            value: String(x?.code || ''),
            label: x?.label || x?.code || '',
          })).filter((x) => x.value));
        }
      } catch (e) {
        if (!ignore) setLocationError(e?.message || 'Failed to load vehicle location');
      }
    })();
    return () => { ignore = true; };
  }, [token, companyVehicleId]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!token || !transferForm.requestedBaseLocationType || isOtherType(transferForm.requestedBaseLocationType)) {
        setLocationNameOptions([]);
        return;
      }
      try {
        const payload = await vehicleLocationService.locationNameOptions(token, {
          baseLocationType: transferForm.requestedBaseLocationType,
          companyId: row?.companyId || '',
        });
        const rows = Array.isArray(payload) ? payload : (Array.isArray(payload?.data) ? payload.data : []);
        if (!ignore) {
          setLocationNameOptions(rows.map((x) => ({
            value: String(x?.id || ''),
            label: x?.name || x?.code || '',
          })).filter((x) => x.value));
        }
      } catch {
        if (!ignore) setLocationNameOptions([]);
      }
    })();
    return () => { ignore = true; };
  }, [token, transferForm.requestedBaseLocationType, row?.companyId]);

  useEffect(() => {
    if (isOtherType(transferForm.requestedBaseLocationType)) return;
    if (!transferForm.requestedBaseLocationId) return;
    const exists = locationNameOptions.some((x) => x.value === transferForm.requestedBaseLocationId);
    if (!exists) {
      setTransferForm((prev) => ({ ...prev, requestedBaseLocationId: '' }));
    }
  }, [locationNameOptions, transferForm.requestedBaseLocationType, transferForm.requestedBaseLocationId]);

  useEffect(() => {
    setFuelForm({
      fuelDate: '',
      fuelQty: '',
      currentKm: '',
      currentHr: '',
      fuelTypeId: '',
      operatorId: '',
      preparedBy: '',
      refillLocation: '',
      notes: '',
    });
  }, [companyVehicleId]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!token || !companyVehicleId) {
        setFuelRefillOptions([]);
        return;
      }
      try {
        const payload = await vehicleFuelRecordService.refillLocationOptions(token, {
          companyId: row?.companyId || undefined,
          companyVehicleId,
        });
        const rows = Array.isArray(payload) ? payload : (Array.isArray(payload?.data) ? payload.data : []);
        if (!ignore) {
          setFuelRefillOptions(
            rows
              .map((x) => ({ value: String(x?.label || x?.name || ''), label: String(x?.label || x?.name || '') }))
              .filter((x) => x.value)
          );
        }
      } catch {
        if (!ignore) setFuelRefillOptions([]);
      }
    })();
    return () => { ignore = true; };
  }, [token, row?.companyId, companyVehicleId]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!token) return;
      try {
        const rows = await organizationService.enumValues('fuel_type', { activeOnly: true });
        if (!ignore) {
          setFuelTypeOptions(
            (Array.isArray(rows) ? rows : [])
              .map((x) => ({
                value: String(x?.type_id || x?.typeId || x?.id || ''),
                label: String(x?.type_name || x?.typeName || x?.name || ''),
              }))
              .filter((x) => x.value)
          );
        }
      } catch {
        if (!ignore) setFuelTypeOptions([]);
      }
    })();
    return () => { ignore = true; };
  }, [token]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!token) return;
      try {
        const params = { activeOnly: true };
        if (row?.companyId) params.companyId = row.companyId;
        const payload = await organizationService.listProjects(token, params);
        const rows = Array.isArray(payload) ? payload : (Array.isArray(payload?.data) ? payload.data : []);
        if (!ignore) {
          setProjectOptions(
            rows
              .map((x) => ({
                value: String(x?.projectId || x?.project_id || x?.id || ''),
                label: String(x?.projectName || x?.project_name || x?.projectCode || x?.project_code || ''),
              }))
              .filter((x) => x.value)
          );
        }
      } catch {
        if (!ignore) setProjectOptions([]);
      }
    })();
    return () => { ignore = true; };
  }, [token, row?.companyId]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!token) return;
      try {
        const rows = await organizationService.enumValues('work_type', { activeOnly: true, locale: 'en-US' });
        if (!ignore) {
          setWorkTypeOptions(
            (Array.isArray(rows) ? rows : [])
              .map((x) => ({
                value: String(x?.type_id || x?.typeId || x?.id || ''),
                label: String(x?.type_name || x?.typeName || x?.name || ''),
              }))
              .filter((x) => x.value)
          );
        }
      } catch {
        if (!ignore) setWorkTypeOptions([]);
      }
    })();
    return () => { ignore = true; };
  }, [token]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!token) return;
      try {
        const params = {};
        if (row?.companyId) params.companyId = row.companyId;
        const payload = await employeeService.listEmployees(token, params);
        const rows = Array.isArray(payload) ? payload : (Array.isArray(payload?.data) ? payload.data : []);
        if (!ignore) {
          setEmployeeOptions(
            rows
              .map((x) => ({
                value: String(x?.employeeId || x?.employee_id || x?.id || ''),
                label: [x?.employeeCode || x?.employee_code, x?.firstName || x?.first_name, x?.lastName || x?.last_name]
                  .filter(Boolean).join(' - '),
              }))
              .filter((x) => x.value)
          );
        }
      } catch {
        if (!ignore) setEmployeeOptions([]);
      }
    })();
    return () => { ignore = true; };
  }, [token, row?.companyId]);

  const currentLocationName = useMemo(() => {
    const current = locationRows.find((x) => (x?.isCurrent ?? x?.is_current) === true);
    if (current?.locationName || current?.location_name) return current.locationName || current.location_name;
    return '-';
  }, [locationRows]);

  const effectiveVehicleId = useMemo(
    () => String(vehicleId || row?.vehicleId || row?.vehicle_id || ''),
    [vehicleId, row?.vehicleId, row?.vehicle_id]
  );

  const refreshPreviousFuel = async () => {
    if (!token || !companyVehicleId) {
      setPreviousFuel(null);
      return;
    }
    try {
      const latest = await vehicleFuelRecordService.latestByCompanyVehicle(token, companyVehicleId);
      setPreviousFuel(latest || null);
    } catch {
      setPreviousFuel(null);
    }
  };

  useEffect(() => {
    refreshPreviousFuel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, companyVehicleId]);

  const liveKmDifference = useMemo(() => {
    const prev = Number(previousFuel?.currentKm);
    const curr = Number(fuelForm.currentKm);
    if (!Number.isFinite(prev) || !Number.isFinite(curr)) return null;
    return curr - prev;
  }, [previousFuel?.currentKm, fuelForm.currentKm]);

  const liveHrDifference = useMemo(() => {
    const prev = Number(previousFuel?.currentHr);
    const curr = Number(fuelForm.currentHr);
    if (!Number.isFinite(prev) || !Number.isFinite(curr)) return null;
    return curr - prev;
  }, [previousFuel?.currentHr, fuelForm.currentHr]);
  const invalidFuelKm = liveKmDifference != null && liveKmDifference < 0;
  const invalidFuelHr = liveHrDifference != null && liveHrDifference < 0;

  const refreshRunningState = async () => {
    if (!token || !row?.companyId || !effectiveVehicleId) {
      setRunningState(null);
      return;
    }
    setRunningLoading(true);
    setRunningError('');
    try {
      const payload = await vehicleRunningLogService.qrState(token, {
        companyId: row.companyId,
        vehicleId: effectiveVehicleId,
      });
      setRunningState(payload || null);
    } catch (e) {
      setRunningError(e?.message || 'Failed to load running details state');
      setRunningState(null);
    } finally {
      setRunningLoading(false);
    }
  };

  useEffect(() => {
    refreshRunningState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, row?.companyId, effectiveVehicleId]);

  useEffect(() => {
    const id = setInterval(() => setRunningNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (runningState?.suggestedProjectId) {
      setRunningForm((prev) => ({ ...prev, projectId: String(runningState.suggestedProjectId) }));
    }
  }, [runningState?.suggestedProjectId]);

  const onTransferFormChange = (key, value) => {
    setTransferForm((prev) => {
      if (key === 'requestedBaseLocationType') {
        return {
          ...prev,
          requestedBaseLocationType: value,
          requestedBaseLocationId: '',
          requestedLocationName: '',
        };
      }
      return { ...prev, [key]: value };
    });
    setTransferError('');
    setTransferSuccess('');
  };

  const submitTransferRequest = async () => {
    if (!token || !companyVehicleId) return;
    if (!transferForm.requestedBaseLocationType) {
      setTransferError('Please select Base Location Type');
      return;
    }
    if (isOtherType(transferForm.requestedBaseLocationType) && !transferForm.requestedLocationName.trim()) {
      setTransferError('Please enter Location Name');
      return;
    }
    if (!isOtherType(transferForm.requestedBaseLocationType) && !transferForm.requestedBaseLocationId) {
      setTransferError('Please select Location Name');
      return;
    }

    const selectedLocation = locationNameOptions.find((x) => x.value === transferForm.requestedBaseLocationId);
    setTransferSaving(true);
    setTransferError('');
    setTransferSuccess('');
    try {
      await vehicleTransferService.create(token, {
        companyVehicleId,
        requestedBaseLocationType: transferForm.requestedBaseLocationType,
        requestedBaseLocationId: isOtherType(transferForm.requestedBaseLocationType)
          ? null
          : (isUuid(transferForm.requestedBaseLocationId) ? transferForm.requestedBaseLocationId : null),
        requestedLocationType: transferForm.requestedLocationType || null,
        requestedLocationName: isOtherType(transferForm.requestedBaseLocationType)
          ? transferForm.requestedLocationName
          : (selectedLocation?.label || null),
        requestedBy: auth?.userId || null,
      });
      setTransferSuccess('Transfer request sent to Vehicle & Transport Department Manager for approval.');
      setTransferForm({
        requestedBaseLocationType: '',
        requestedBaseLocationId: '',
        requestedLocationType: '',
        requestedLocationName: '',
      });
    } catch (e) {
      setTransferError(e?.message || 'Failed to submit transfer request');
    } finally {
      setTransferSaving(false);
    }
  };

  const submitFuelRecord = async () => {
    if (!token || !companyVehicleId) return;
    if (!fuelForm.fuelDate) {
      setFuelError('Fuel date is required');
      return;
    }
    if (!fuelForm.fuelQty || Number(fuelForm.fuelQty) <= 0) {
      setFuelError('Fuel quantity must be greater than zero');
      return;
    }
    if (invalidFuelKm) {
      setFuelError('Current KM cannot be less than previous KM');
      return;
    }
    if (invalidFuelHr) {
      setFuelError('Current HR cannot be less than previous HR');
      return;
    }

    setFuelSaving(true);
    setFuelError('');
    setFuelSuccess('');
    try {
      const payload = {
        companyId: row?.companyId || null,
        companyCode: row?.companyCode || null,
        companyVehicleId,
        vehicleId: vehicleId || null,
        fuelDate: fuelForm.fuelDate,
        fuelQty: Number(fuelForm.fuelQty),
        currentKm: fuelForm.currentKm === '' ? null : Number(fuelForm.currentKm),
        currentHr: fuelForm.currentHr === '' ? null : Number(fuelForm.currentHr),
        fuelTypeId: fuelForm.fuelTypeId === '' ? null : Number(fuelForm.fuelTypeId),
        operatorId: fuelForm.operatorId || null,
        preparedBy: fuelForm.preparedBy || null,
        refillLocation: fuelForm.refillLocation || null,
        notes: fuelForm.notes || null,
      };

      await vehicleFuelRecordService.create(token, payload);
      setFuelSuccess('Fuel record saved successfully.');
      setFuelForm({
        fuelDate: '',
        fuelQty: '',
        currentKm: '',
        currentHr: '',
        fuelTypeId: '',
        operatorId: '',
        preparedBy: '',
        refillLocation: '',
        notes: '',
      });
      await refreshPreviousFuel();
    } catch (e) {
      setFuelError(e?.message || 'Failed to save fuel record');
    } finally {
      setFuelSaving(false);
    }
  };

  const submitRunningStart = async () => {
    if (!token || !row?.companyId || !effectiveVehicleId) return;
    setRunningSaving(true);
    setRunningError('');
    setRunningSuccess('');
    try {
      await vehicleRunningLogService.qrDayStart(token, {
        companyId: row.companyId,
        companyCode: row?.companyCode || '',
        vehicleId: effectiveVehicleId,
        projectId: runningForm.projectId || null,
        startOdometer: runningForm.startOdometer === '' ? null : Number(runningForm.startOdometer),
        startHourmeter: runningForm.startHourmeter === '' ? null : Number(runningForm.startHourmeter),
      });
      setRunningSuccess('Day start saved.');
      setRunningForm((prev) => ({ ...prev, projectId: '', startOdometer: '', startHourmeter: '' }));
      await refreshRunningState();
    } catch (e) {
      setRunningError(e?.message || 'Failed to save day start');
    } finally {
      setRunningSaving(false);
    }
  };

  const submitRunningEnd = async () => {
    if (!token || !row?.companyId || !effectiveVehicleId) return;
    setRunningSaving(true);
    setRunningError('');
    setRunningSuccess('');
    try {
      await vehicleRunningLogService.qrDayEnd(token, {
        companyId: row.companyId,
        vehicleId: effectiveVehicleId,
        endOdometer: runningForm.endOdometer === '' ? null : Number(runningForm.endOdometer),
        endHourmeter: runningForm.endHourmeter === '' ? null : Number(runningForm.endHourmeter),
        workTypeId: runningForm.workTypeId === '' ? null : Number(runningForm.workTypeId),
        workDescription: runningForm.workDescription || null,
        supervisorApproval: runningForm.supervisorApproval || null,
      });
      setRunningSuccess('Day end saved.');
      setRunningForm((prev) => ({ ...prev, endOdometer: '', endHourmeter: '', workTypeId: '', workDescription: '', supervisorApproval: '' }));
      await refreshRunningState();
    } catch (e) {
      setRunningError(e?.message || 'Failed to save day end');
    } finally {
      setRunningSaving(false);
    }
  };

  const calculatedDayDistance = useMemo(() => {
    const start = Number(runningState?.record?.startOdometer);
    const end = Number(runningForm.endOdometer);
    if (!Number.isFinite(start) || !Number.isFinite(end)) return '';
    return Math.max(end - start, 0).toFixed(2);
  }, [runningState?.record?.startOdometer, runningForm.endOdometer]);

  const calculatedDayHours = useMemo(() => {
    const start = Number(runningState?.record?.startHourmeter);
    const end = Number(runningForm.endHourmeter);
    if (!Number.isFinite(start) || !Number.isFinite(end)) return '';
    return Math.max(end - start, 0).toFixed(2);
  }, [runningState?.record?.startHourmeter, runningForm.endHourmeter]);

  const projectLabelById = useMemo(
    () => Object.fromEntries(projectOptions.map((x) => [String(x.value), x.label])),
    [projectOptions]
  );

  const supervisorLabelById = useMemo(
    () => Object.fromEntries(employeeOptions.map((x) => [String(x.value), x.label])),
    [employeeOptions]
  );

  const dayTripRows = useMemo(
    () => ([...(runningState?.dayRecords || [])].reverse().map((item, idx) => ({
      trip: `Trip ${idx + 1}`,
      date: item.startLogDate || '-',
      start: `${item.startOdometer ?? '-'} / ${item.startHourmeter ?? '-'}`,
      end: `${item.endOdometer ?? '-'} / ${item.endHourmeter ?? '-'}`,
      total: `${item.totalDistance ?? '-'} / ${item.engineHours ?? '-'}`,
      project: projectLabelById[String(item.projectId || '')] || item.projectId || '-',
      supervisor: supervisorLabelById[String(item.supervisorApproval || '')] || item.supervisorApproval || '-',
    }))),
    [runningState?.dayRecords, projectLabelById, supervisorLabelById]
  );

  const invalidEndOdometer = useMemo(() => {
    const start = Number(runningState?.record?.startOdometer);
    const end = Number(runningForm.endOdometer);
    if (!Number.isFinite(start) || !Number.isFinite(end)) return false;
    return end < start;
  }, [runningState?.record?.startOdometer, runningForm.endOdometer]);

  const invalidEndHourmeter = useMemo(() => {
    const start = Number(runningState?.record?.startHourmeter);
    const end = Number(runningForm.endHourmeter);
    if (!Number.isFinite(start) || !Number.isFinite(end)) return false;
    return end < start;
  }, [runningState?.record?.startHourmeter, runningForm.endHourmeter]);

  return (
    <Box sx={{ p: 2 }}>
      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, maxWidth: 980, mx: 'auto' }}>
        <Stack direction="row" spacing={1.2} alignItems="center" sx={{ mb: 2 }}>
          <DirectionsCarRoundedIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Vehicle QR Details</Typography>
        </Stack>
        {!companyVehicleId ? <Alert severity="warning" sx={{ mb: 2 }}>Missing companyVehicleId in QR link.</Alert> : null}
        {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
        {locationError ? <Alert severity="warning" sx={{ mb: 2 }}>{locationError}</Alert> : null}
        {loading ? (
          <Stack direction="row" spacing={1} alignItems="center"><CircularProgress size={18} /><Typography>Loading...</Typography></Stack>
        ) : null}
        {row ? (
          <>
            <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} variant="scrollable" allowScrollButtonsMobile>
              <Tab label="Vehicle Details" />
              <Tab label="Vehicle Transfer" />
              <Tab label="Fuel" />
              <Tab label="Running Details" />
            </Tabs>

            <TabPanel value={activeTab} index={0}>
              <Stack spacing={1.25}>
                <Typography><b>Identify Code:</b> {row?.keyNumber || '-'}</Typography>
                <Typography><b>Register No:</b> {row?.registrationNumber || '-'}</Typography>
                <Typography><b>Manufacture:</b> {row?.companyVehicleManufactureBrand || '-'}</Typography>
                <Typography><b>Model:</b> {row?.companyVehicleModelName || '-'}</Typography>
                <Typography><b>Chassis No:</b> {row?.chassisNumber || '-'}</Typography>
                <Typography><b>Engine No:</b> {row?.engineNumber || '-'}</Typography>
                <Typography><b>Status:</b> {row?.isActive ? 'Active' : 'Inactive'}</Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Button variant="contained" startIcon={<OpenInNewRoundedIcon />} onClick={() => navigate('/company-vehicles')}>
                    Open Company Vehicle Page
                  </Button>
                </Stack>
              </Stack>
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
              <Stack spacing={2} sx={{ maxWidth: 560 }}>
                <Typography><b>Current Location Name:</b> {currentLocationName}</Typography>

                <FormControl fullWidth size="small">
                  <InputLabel>Base Location Type</InputLabel>
                  <Select
                    label="Base Location Type"
                    value={transferForm.requestedBaseLocationType}
                    onChange={(e) => onTransferFormChange('requestedBaseLocationType', e.target.value)}
                  >
                    <MenuItem value="">Select</MenuItem>
                    {baseLocationOptions.map((x) => (
                      <MenuItem key={x.value} value={x.value}>{x.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  size="small"
                  label="Location Type"
                  value={transferForm.requestedLocationType}
                  onChange={(e) => onTransferFormChange('requestedLocationType', e.target.value)}
                />

                {isOtherType(transferForm.requestedBaseLocationType) ? (
                  <TextField
                    fullWidth
                    size="small"
                    label="Location Name"
                    value={transferForm.requestedLocationName}
                    onChange={(e) => onTransferFormChange('requestedLocationName', e.target.value)}
                  />
                ) : (
                  <FormControl fullWidth size="small" disabled={!transferForm.requestedBaseLocationType}>
                    <InputLabel>Location Name</InputLabel>
                    <Select
                      label="Location Name"
                      value={transferForm.requestedBaseLocationId}
                      onChange={(e) => onTransferFormChange('requestedBaseLocationId', e.target.value)}
                    >
                      <MenuItem value="">Select</MenuItem>
                      {locationNameOptions.map((x) => (
                        <MenuItem key={x.value} value={x.value}>{x.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}

                {transferError ? <Alert severity="error">{transferError}</Alert> : null}
                {transferSuccess ? <Alert severity="success">{transferSuccess}</Alert> : null}

                <Button
                  variant="contained"
                  onClick={submitTransferRequest}
                  disabled={transferSaving}
                >
                  {transferSaving ? 'Submitting...' : 'Send For Manager Approval'}
                </Button>
              </Stack>
            </TabPanel>

            <TabPanel value={activeTab} index={2}>
              {fuelError ? <Alert severity="error" sx={{ mb: 2 }}>{fuelError}</Alert> : null}
              {fuelSuccess ? <Alert severity="success" sx={{ mb: 2 }}>{fuelSuccess}</Alert> : null}
              {fuelLoading ? (
                <Stack direction="row" spacing={1} alignItems="center">
                  <CircularProgress size={18} />
                  <Typography>Loading fuel...</Typography>
                </Stack>
              ) : null}
              <Stack spacing={2} sx={{ maxWidth: 560 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Fuel Date"
                  type="date"
                  value={fuelForm.fuelDate}
                  InputLabelProps={{ shrink: true }}
                  onChange={(e) => setFuelForm((prev) => ({ ...prev, fuelDate: e.target.value }))}
                />
                <TextField
                  fullWidth
                  size="small"
                  label="Fuel Qty"
                  type="number"
                  value={fuelForm.fuelQty}
                  onChange={(e) => setFuelForm((prev) => ({ ...prev, fuelQty: e.target.value }))}
                />
                <TextField
                  fullWidth
                  size="small"
                  label="Current KM"
                  type="number"
                  value={fuelForm.currentKm}
                  error={invalidFuelKm}
                  helperText={invalidFuelKm ? 'Current KM cannot be less than previous KM' : ''}
                  onChange={(e) => setFuelForm((prev) => ({ ...prev, currentKm: e.target.value }))}
                />
                <Typography variant="body2" color="text.secondary">
                  Previous KM: {previousFuel?.currentKm ?? '-'} | Difference: {liveKmDifference == null ? '-' : liveKmDifference}
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  label="Current HR"
                  type="number"
                  value={fuelForm.currentHr}
                  error={invalidFuelHr}
                  helperText={invalidFuelHr ? 'Current HR cannot be less than previous HR' : ''}
                  onChange={(e) => setFuelForm((prev) => ({ ...prev, currentHr: e.target.value }))}
                />
                <Typography variant="body2" color="text.secondary">
                  Previous HR: {previousFuel?.currentHr ?? '-'} | Difference: {liveHrDifference == null ? '-' : liveHrDifference}
                </Typography>
                <FormControl fullWidth size="small">
                  <InputLabel>Fuel Type</InputLabel>
                  <Select
                    label="Fuel Type"
                    value={fuelForm.fuelTypeId}
                    onChange={(e) => setFuelForm((prev) => ({ ...prev, fuelTypeId: e.target.value }))}
                  >
                    <MenuItem value="">Select</MenuItem>
                    {fuelTypeOptions.map((x) => (
                      <MenuItem key={x.value} value={x.value}>{x.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth size="small">
                  <InputLabel>Operator (Employee)</InputLabel>
                  <Select
                    label="Operator (Employee)"
                    value={fuelForm.operatorId}
                    onChange={(e) => setFuelForm((prev) => ({ ...prev, operatorId: e.target.value }))}
                  >
                    <MenuItem value="">Select</MenuItem>
                    {employeeOptions.map((x) => (
                      <MenuItem key={x.value} value={x.value}>{x.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth size="small">
                  <InputLabel>Prepared By (Employee)</InputLabel>
                  <Select
                    label="Prepared By (Employee)"
                    value={fuelForm.preparedBy}
                    onChange={(e) => setFuelForm((prev) => ({ ...prev, preparedBy: e.target.value }))}
                  >
                    <MenuItem value="">Select</MenuItem>
                    {employeeOptions.map((x) => (
                      <MenuItem key={x.value} value={x.value}>{x.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth size="small">
                  <InputLabel>Refill Location</InputLabel>
                  <Select
                    label="Refill Location"
                    value={fuelForm.refillLocation}
                    onChange={(e) => setFuelForm((prev) => ({ ...prev, refillLocation: e.target.value }))}
                  >
                    <MenuItem value="">Select</MenuItem>
                    {fuelRefillOptions.map((x) => (
                      <MenuItem key={x.value} value={x.value}>{x.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  size="small"
                  label="Notes"
                  multiline
                  minRows={2}
                  value={fuelForm.notes}
                  onChange={(e) => setFuelForm((prev) => ({ ...prev, notes: e.target.value }))}
                />

                <Button
                  variant="contained"
                  onClick={submitFuelRecord}
                  disabled={fuelSaving || fuelLoading || invalidFuelKm || invalidFuelHr}
                >
                  {fuelSaving ? 'Saving...' : 'Save Fuel Record'}
                </Button>
              </Stack>
            </TabPanel>

            <TabPanel value={activeTab} index={3}>
              {runningError ? <Alert severity="error" sx={{ mb: 2 }}>{runningError}</Alert> : null}
              {runningSuccess ? <Alert severity="success" sx={{ mb: 2 }}>{runningSuccess}</Alert> : null}
              {runningLoading ? (
                <Stack direction="row" spacing={1} alignItems="center">
                  <CircularProgress size={18} />
                  <Typography>Loading running details...</Typography>
                </Stack>
              ) : null}
              {!runningLoading ? (
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Stack spacing={2}>
                      <TextField
                        fullWidth
                        size="small"
                        label={runningState?.mode === 'END_REQUIRED' ? 'End Date' : 'Start Date'}
                        value={datePart(runningState?.today)}
                        InputProps={{ readOnly: true }}
                      />
                      <TextField
                        fullWidth
                        size="small"
                        label={runningState?.mode === 'END_REQUIRED' ? 'End Time' : 'Start Time'}
                        value={runningNow.toLocaleString()}
                        InputProps={{ readOnly: true }}
                      />

                      {runningState?.mode === 'END_REQUIRED' ? (
                        <>
                          <Typography variant="body2" color="text.secondary">
                            Start Location: {runningState?.record?.startLocationName || '-'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Day started at: {runningState?.record?.startTime ? new Date(runningState.record.startTime).toLocaleString() : '-'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Start Odometer: {runningState?.record?.startOdometer ?? '-'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Start Hour meter: {runningState?.record?.startHourmeter ?? '-'}
                          </Typography>
                          <TextField
                            fullWidth
                            size="small"
                            label="End Odometer"
                            type="number"
                            value={runningForm.endOdometer}
                            error={invalidEndOdometer}
                            helperText={invalidEndOdometer ? 'End odometer cannot be less than start odometer' : ''}
                            onChange={(e) => setRunningForm((prev) => ({ ...prev, endOdometer: e.target.value }))}
                          />
                          <TextField
                            fullWidth
                            size="small"
                            label="End Hour meter"
                            type="number"
                            value={runningForm.endHourmeter}
                            error={invalidEndHourmeter}
                            helperText={invalidEndHourmeter ? 'End hour meter cannot be less than start hour meter' : ''}
                            onChange={(e) => setRunningForm((prev) => ({ ...prev, endHourmeter: e.target.value }))}
                          />
                          <FormControl fullWidth size="small">
                            <InputLabel>Work Type</InputLabel>
                            <Select
                              label="Work Type"
                              value={runningForm.workTypeId}
                              onChange={(e) => setRunningForm((prev) => ({ ...prev, workTypeId: e.target.value }))}
                            >
                              <MenuItem value="">Select</MenuItem>
                              {workTypeOptions.map((x) => (
                                <MenuItem key={x.value} value={x.value}>{x.label}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          <TextField
                            fullWidth
                            size="small"
                            label="Work Description"
                            multiline
                            minRows={2}
                            value={runningForm.workDescription}
                            onChange={(e) => setRunningForm((prev) => ({ ...prev, workDescription: e.target.value }))}
                          />
                          <FormControl fullWidth size="small">
                            <InputLabel>Supervisor Approval</InputLabel>
                            <Select
                              label="Supervisor Approval"
                              value={runningForm.supervisorApproval}
                              onChange={(e) => setRunningForm((prev) => ({ ...prev, supervisorApproval: e.target.value }))}
                            >
                              <MenuItem value="">Select</MenuItem>
                              {employeeOptions.map((x) => (
                                <MenuItem key={x.value} value={x.value}>{x.label}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          <Typography variant="body2" color="text.secondary">
                            Calculated Day Total Odometers: {calculatedDayDistance || '-'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Calculated Day Total Vehicle Hour: {calculatedDayHours || '-'}
                          </Typography>
                          <Button variant="contained" onClick={submitRunningEnd} disabled={runningSaving || invalidEndOdometer || invalidEndHourmeter}>
                            {runningSaving ? 'Saving...' : 'Save Day End'}
                          </Button>
                        </>
                      ) : null}

                      {runningState?.mode === 'START_REQUIRED' ? (
                        <>
                          <Typography variant="body2" color="text.secondary">
                            Current Location: {runningState?.currentLocationName || '-'}
                          </Typography>
                          <FormControl fullWidth size="small">
                            <InputLabel>Project</InputLabel>
                            <Select
                              label="Project"
                              value={runningForm.projectId}
                              disabled
                              onChange={(e) => setRunningForm((prev) => ({ ...prev, projectId: e.target.value }))}
                            >
                              <MenuItem value="">Select</MenuItem>
                              {projectOptions.map((x) => (
                                <MenuItem key={x.value} value={x.value}>{x.label}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          <TextField
                            fullWidth
                            size="small"
                            label="Start Odometer"
                            type="number"
                            value={runningForm.startOdometer}
                            onChange={(e) => setRunningForm((prev) => ({ ...prev, startOdometer: e.target.value }))}
                          />
                          <TextField
                            fullWidth
                            size="small"
                            label="Start Hour meter"
                            type="number"
                            value={runningForm.startHourmeter}
                            onChange={(e) => setRunningForm((prev) => ({ ...prev, startHourmeter: e.target.value }))}
                          />
                          <Button variant="contained" onClick={submitRunningStart} disabled={runningSaving}>
                            {runningSaving ? 'Saving...' : 'Save Day Start'}
                          </Button>
                        </>
                      ) : null}

                      <Alert severity="info">
                        Day Trips: {runningState?.dayTripCount ?? 0}.
                        {' '}Day Total Distance: {runningState?.dayTotalDistance ?? 0}.
                        {' '}Day Total Vehicle Hour: {runningState?.dayTotalEngineHours ?? 0}.
                      </Alert>
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Trip</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Start</TableCell>
                            <TableCell>End</TableCell>
                            <TableCell>Total</TableCell>
                            <TableCell>Project</TableCell>
                            <TableCell>Supervisor</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {dayTripRows.map((row) => (
                            <TableRow key={row.trip}>
                              <TableCell>{row.trip}</TableCell>
                              <TableCell>{row.date}</TableCell>
                              <TableCell>{row.start}</TableCell>
                              <TableCell>{row.end}</TableCell>
                              <TableCell>{row.total}</TableCell>
                              <TableCell>{row.project}</TableCell>
                              <TableCell>{row.supervisor}</TableCell>
                            </TableRow>
                          ))}
                          {dayTripRows.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={7} align="center">No trips for today</TableCell>
                            </TableRow>
                          ) : null}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                </Grid>
              ) : null}
            </TabPanel>
          </>
        ) : null}
      </Paper>
    </Box>
  );
}
