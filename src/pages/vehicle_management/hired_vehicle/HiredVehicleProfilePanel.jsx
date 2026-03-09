import DirectionsCarRoundedIcon from '@mui/icons-material/DirectionsCarRounded';
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';
import BuildRoundedIcon from '@mui/icons-material/BuildRounded';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import NumbersRoundedIcon from '@mui/icons-material/NumbersRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import HandshakeRoundedIcon from '@mui/icons-material/HandshakeRounded';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
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
import { rowsFrom } from '../../employee_hr_management/shared/hrCrudCommon';
import { hiredVehicleService } from '../../../services/vehicle_management/hired_vehicle/hiredVehicleService';
import { hiredVehicleRegistrationService } from '../../../services/vehicle_management/hired_vehicle_registration/hiredVehicleRegistrationService';
import { hiredVehicleInsuranceService } from '../../../services/vehicle_management/hired_vehicle_insurance/hiredVehicleInsuranceService';
import { hiredVehicleFitnessCertificateService } from '../../../services/vehicle_management/hired_vehicle_fitness_certificate/hiredVehicleFitnessCertificateService';
import { hiredVehiclePucService } from '../../../services/vehicle_management/hired_vehicle_puc/hiredVehiclePucService';

const emptyReg = { registrationNumber: '', registrationDate: '', registrationExpiry: '', rcStatus: 'Valid', notes: '', isCurrent: true };
const emptyIns = { insuranceCompany: '', policyNumber: '', policyStartDate: '', policyExpiryDate: '', insuranceStatus: 'Active', notes: '', isCurrent: true };
const emptyFit = { certificateNumber: '', issueDate: '', expiryDate: '', fitnessStatus: 'Valid', remarks: '', isCurrent: true };
const emptyPuc = { certificateNumber: '', issueDate: '', expiryDate: '', testResult: 'Pass', pucStatus: 'Valid', isCurrent: true };

function getv(row, ...keys) {
  for (const k of keys) {
    if (row?.[k] !== undefined && row?.[k] !== null && row?.[k] !== '') return row[k];
  }
  return undefined;
}

export default function HiredVehicleProfilePanel({ token, suppliers }) {
  const theme = useTheme();
  const [innerTab, setInnerTab] = useState(0);
  const [supplierId, setSupplierId] = useState('');
  const [hiredVehicleId, setHiredVehicleId] = useState('');
  const [hiredVehicleRows, setHiredVehicleRows] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(false);

  const [registrationRows, setRegistrationRows] = useState([]);
  const [insuranceRows, setInsuranceRows] = useState([]);
  const [fitnessRows, setFitnessRows] = useState([]);
  const [pucRows, setPucRows] = useState([]);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [dialog, setDialog] = useState({ type: '', mode: '', id: '' });
  const [regForm, setRegForm] = useState(emptyReg);
  const [insForm, setInsForm] = useState(emptyIns);
  const [fitForm, setFitForm] = useState(emptyFit);
  const [pucForm, setPucForm] = useState(emptyPuc);

  const isViewMode = dialog.mode === 'view';

  useEffect(() => {
    if (!suppliers.length) return;
    if (!supplierId) setSupplierId(String(suppliers[0].supplierId || suppliers[0].id || ''));
  }, [suppliers, supplierId]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!token || !supplierId) {
        setHiredVehicleRows([]);
        setHiredVehicleId('');
        setProfileData(null);
        return;
      }
      try {
        const rows = rowsFrom(await hiredVehicleService.list(token, { supplierId }));
        if (ignore) return;
        setHiredVehicleRows(rows);
        if (!rows.length) {
          setHiredVehicleId('');
          setProfileData(null);
          return;
        }
        const hasSelected = rows.some((x) => String(x?.hiredVehicleId || x?.hiredvehicle_id || x?.id || '') === String(hiredVehicleId || ''));
        if (!hasSelected) setHiredVehicleId(String(rows[0]?.hiredVehicleId || rows[0]?.hiredvehicle_id || rows[0]?.id || ''));
      } catch {
        if (!ignore) {
          setHiredVehicleRows([]);
          setHiredVehicleId('');
          setProfileData(null);
        }
      }
    })();
    return () => { ignore = true; };
  }, [token, supplierId, hiredVehicleId]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!token || !hiredVehicleId) {
        setProfileData(null);
        return;
      }
      setLoading(true);
      try {
        const data = await hiredVehicleService.getProfileById(token, hiredVehicleId);
        if (!ignore) setProfileData(data || null);
      } catch {
        if (!ignore) setProfileData(null);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [token, hiredVehicleId]);

  const loadRows = async () => {
    if (!token || !hiredVehicleId) return;
    const [r, i, f, p] = await Promise.all([
      hiredVehicleRegistrationService.list(token, { hiredVehicleId }),
      hiredVehicleInsuranceService.list(token, { hiredVehicleId }),
      hiredVehicleFitnessCertificateService.list(token, { hiredVehicleId }),
      hiredVehiclePucService.list(token, { hiredVehicleId }),
    ]);
    setRegistrationRows(rowsFrom(r));
    setInsuranceRows(rowsFrom(i));
    setFitnessRows(rowsFrom(f));
    setPucRows(rowsFrom(p));
  };

  useEffect(() => {
    setError('');
    setSuccess('');
    void loadRows();
  }, [token, hiredVehicleId]);

  const supplierOptions = useMemo(
    () => suppliers.map((s) => ({
      id: String(s.supplierId || s.id || ''),
      label: `${s.supplierName || s.supplier_name || '-'} (${s.supplierCode || s.supplier_code || '-'})`,
    })),
    [suppliers]
  );

  const vehicleOptions = useMemo(
    () => hiredVehicleRows.map((r) => ({
      id: String(r?.hiredVehicleId || r?.hiredvehicle_id || r?.id || ''),
      label: `${r?.keyNumber || '-'} | ${r?.registrationNumber || '-'} | ${r?.hiredVehicleModelName || '-'}`,
    })),
    [hiredVehicleRows]
  );

  // Derive current record views from loaded rows (isCurrent first, else first record)
  const currentReg = useMemo(() => {
    if (!registrationRows.length) return null;
    return registrationRows.find((x) => x?.isCurrent === true || x?.is_current === true) || registrationRows[0];
  }, [registrationRows]);

  const currentIns = useMemo(() => {
    if (!insuranceRows.length) return null;
    return insuranceRows.find((x) => x?.isCurrent === true || x?.is_current === true) || insuranceRows[0];
  }, [insuranceRows]);

  const currentFit = useMemo(() => {
    if (!fitnessRows.length) return null;
    return fitnessRows.find((x) => x?.isCurrent === true || x?.is_current === true) || fitnessRows[0];
  }, [fitnessRows]);

  const currentPuc = useMemo(() => {
    if (!pucRows.length) return null;
    return pucRows.find((x) => x?.isCurrent === true || x?.is_current === true) || pucRows[0];
  }, [pucRows]);

  // Profile view computed values
  const profileView = useMemo(() => {
    if (!profileData) return null;
    return {
      keyNumber: getv(profileData, 'keyNumber', 'key_number') || '-',
      registrationNumber: getv(profileData, 'registrationNumber', 'registration_number') || '-',
      chassisNumber: getv(profileData, 'chassisNumber', 'chassis_number') || '-',
      engineNumber: getv(profileData, 'engineNumber', 'engine_number') || '-',
      supplierName: getv(profileData, 'supplierName', 'supplier_name') || '-',
      supplierCode: getv(profileData, 'supplierCode', 'supplier_code') || '-',
      vehicleType: getv(profileData, 'hiredVehicleTypeName', 'hiredVehicleType', 'hired_vehicle_type_name') || '-',
      category: getv(profileData, 'categoryName', 'category_name', 'categoryId', 'category_id') || '-',
      brand: getv(profileData, 'hiredVehicleManufactureBrand', 'hired_vehicle_manufacture_brand') || '-',
      model: getv(profileData, 'hiredVehicleModelName', 'hired_vehicle_model_name') || '-',
      manufactureYear: getv(profileData, 'manufactureYear', 'manufacture_year') || '-',
      color: getv(profileData, 'color') || '-',
      vehicleImage: getv(profileData, 'vehicleImage', 'vehicle_image') || '-',
      ownershipType: getv(profileData, 'ownershipTypeName', 'ownership_type_name', 'ownershipTypeId', 'ownership_type_id') || '-',
      currentOwnership: getv(profileData, 'currentOwnership', 'current_ownership') || '-',
      distributor: getv(profileData, 'distributorName', 'distributor_name', 'distributorId', 'distributor_id') || '-',
      previousOwners: getv(profileData, 'previousOwnersCount', 'previous_owners_count') || '0',
      vehicleCondition: getv(profileData, 'vehicleCondition', 'vehicle_condition') || '-',
      operationalStatus: getv(profileData, 'operationalStatusName', 'operational_status_name', 'operationalStatusId', 'operational_status_id') || '-',
      initialOdometer: getv(profileData, 'initialOdometerKm', 'initial_odometer_km') || '0',
      odometer: getv(profileData, 'currentOdometerKm', 'current_odometer_km') || '0',
      engineHours: getv(profileData, 'totalEngineHours', 'total_engine_hours') || '0',
      consumptionMethod: getv(profileData, 'consumptionMethodName', 'consumption_method_name', 'consumptionMethodId', 'consumption_method_id') || '-',
      ratedEfficiency: getv(profileData, 'ratedEfficiencyKmpl', 'rated_efficiency_kmpl') || '-',
      ratedConsumption: getv(profileData, 'ratedConsumptionLph', 'rated_consumption_lph') || '-',
      isActive: getv(profileData, 'isActive', 'is_active'),
      notes: getv(profileData, 'notes') || '-',
    };
  }, [profileData]);

  const regView = useMemo(() => {
    if (!currentReg) return null;
    return {
      registrationNumber: getv(currentReg, 'registrationNumber', 'registration_number') || '-',
      registrationDate: getv(currentReg, 'registrationDate', 'registration_date') || '-',
      registrationExpiry: getv(currentReg, 'registrationExpiry', 'registration_expiry') || '-',
      rcStatus: getv(currentReg, 'rcStatus', 'rc_status') || '-',
      notes: getv(currentReg, 'notes') || '-',
      isCurrent: (getv(currentReg, 'isCurrent', 'is_current') === false) ? 'No' : 'Yes',
    };
  }, [currentReg]);

  const insView = useMemo(() => {
    if (!currentIns) return null;
    return {
      insuranceCompany: getv(currentIns, 'insuranceCompany', 'insurance_company') || '-',
      policyNumber: getv(currentIns, 'policyNumber', 'policy_number') || '-',
      policyStartDate: getv(currentIns, 'policyStartDate', 'policy_start_date') || '-',
      policyExpiryDate: getv(currentIns, 'policyExpiryDate', 'policy_expiry_date') || '-',
      insuranceStatus: getv(currentIns, 'insuranceStatus', 'insurance_status') || '-',
      notes: getv(currentIns, 'notes') || '-',
      isCurrent: (getv(currentIns, 'isCurrent', 'is_current') === false) ? 'No' : 'Yes',
    };
  }, [currentIns]);

  const fitView = useMemo(() => {
    if (!currentFit) return null;
    return {
      certificateNumber: getv(currentFit, 'certificateNumber', 'certificate_number') || '-',
      issueDate: getv(currentFit, 'issueDate', 'issue_date') || '-',
      expiryDate: getv(currentFit, 'expiryDate', 'expiry_date') || '-',
      fitnessStatus: getv(currentFit, 'fitnessStatus', 'fitness_status') || '-',
      remarks: getv(currentFit, 'remarks') || '-',
      isCurrent: (getv(currentFit, 'isCurrent', 'is_current') === false) ? 'No' : 'Yes',
    };
  }, [currentFit]);

  const pucView = useMemo(() => {
    if (!currentPuc) return null;
    return {
      certificateNumber: getv(currentPuc, 'certificateNumber', 'certificate_number') || '-',
      issueDate: getv(currentPuc, 'issueDate', 'issue_date') || '-',
      expiryDate: getv(currentPuc, 'expiryDate', 'expiry_date') || '-',
      testResult: getv(currentPuc, 'testResult', 'test_result') || '-',
      pucStatus: getv(currentPuc, 'pucStatus', 'puc_status') || '-',
      isCurrent: (getv(currentPuc, 'isCurrent', 'is_current') === false) ? 'No' : 'Yes',
    };
  }, [currentPuc]);

  const openCreate = (type) => {
    setDialog({ type, mode: 'create', id: '' });
    setError('');
    setSuccess('');
    if (type === 'registration') setRegForm(emptyReg);
    if (type === 'insurance') setInsForm(emptyIns);
    if (type === 'fitness') setFitForm(emptyFit);
    if (type === 'puc') setPucForm(emptyPuc);
  };

  const openRecord = (type, row, mode = 'edit') => {
    const id = String(row?.registrationId || row?.insuranceId || row?.fitnessId || row?.pucId || row?.id || '');
    setDialog({ type, mode, id });
    if (type === 'registration') setRegForm({
      registrationNumber: row?.registrationNumber || row?.registration_number || '',
      registrationDate: row?.registrationDate || row?.registration_date || '',
      registrationExpiry: row?.registrationExpiry || row?.registration_expiry || '',
      rcStatus: row?.rcStatus || row?.rc_status || 'Valid',
      notes: row?.notes || '',
      isCurrent: (row?.isCurrent ?? row?.is_current ?? true),
    });
    if (type === 'insurance') setInsForm({
      insuranceCompany: row?.insuranceCompany || row?.insurance_company || '',
      policyNumber: row?.policyNumber || row?.policy_number || '',
      policyStartDate: row?.policyStartDate || row?.policy_start_date || '',
      policyExpiryDate: row?.policyExpiryDate || row?.policy_expiry_date || '',
      insuranceStatus: row?.insuranceStatus || row?.insurance_status || 'Active',
      notes: row?.notes || '',
      isCurrent: (row?.isCurrent ?? row?.is_current ?? true),
    });
    if (type === 'fitness') setFitForm({
      certificateNumber: row?.certificateNumber || row?.certificate_number || '',
      issueDate: row?.issueDate || row?.issue_date || '',
      expiryDate: row?.expiryDate || row?.expiry_date || '',
      fitnessStatus: row?.fitnessStatus || row?.fitness_status || 'Valid',
      remarks: row?.remarks || '',
      isCurrent: (row?.isCurrent ?? row?.is_current ?? true),
    });
    if (type === 'puc') setPucForm({
      certificateNumber: row?.certificateNumber || row?.certificate_number || '',
      issueDate: row?.issueDate || row?.issue_date || '',
      expiryDate: row?.expiryDate || row?.expiry_date || '',
      testResult: row?.testResult || row?.test_result || 'Pass',
      pucStatus: row?.pucStatus || row?.puc_status || 'Valid',
      isCurrent: (row?.isCurrent ?? row?.is_current ?? true),
    });
  };

  const closeDialog = () => setDialog({ type: '', mode: '', id: '' });

  const submitDialog = async () => {
    if (!token || !hiredVehicleId || !supplierId || !dialog.type || dialog.mode === 'view') return;
    setError('');
    setSuccess('');
    try {
      if (dialog.type === 'registration') {
        const payload = { hiredVehicleId, supplierId, ...regForm };
        if (dialog.mode === 'edit') await hiredVehicleRegistrationService.update(token, dialog.id, payload);
        else await hiredVehicleRegistrationService.create(token, payload);
        setSuccess(`Registration ${dialog.mode === 'edit' ? 'updated' : 'saved'} successfully.`);
      }
      if (dialog.type === 'insurance') {
        const payload = { hiredVehicleId, supplierId, ...insForm };
        if (dialog.mode === 'edit') await hiredVehicleInsuranceService.update(token, dialog.id, payload);
        else await hiredVehicleInsuranceService.create(token, payload);
        setSuccess(`Insurance ${dialog.mode === 'edit' ? 'updated' : 'saved'} successfully.`);
      }
      if (dialog.type === 'fitness') {
        const payload = { hiredVehicleId, supplierId, ...fitForm };
        if (dialog.mode === 'edit') await hiredVehicleFitnessCertificateService.update(token, dialog.id, payload);
        else await hiredVehicleFitnessCertificateService.create(token, payload);
        setSuccess(`Fitness certificate ${dialog.mode === 'edit' ? 'updated' : 'saved'} successfully.`);
      }
      if (dialog.type === 'puc') {
        const payload = { hiredVehicleId, supplierId, ...pucForm };
        if (dialog.mode === 'edit') await hiredVehiclePucService.update(token, dialog.id, payload);
        else await hiredVehiclePucService.create(token, payload);
        setSuccess(`Emission test ${dialog.mode === 'edit' ? 'updated' : 'saved'} successfully.`);
      }
      await loadRows();
      closeDialog();
    } catch (e) {
      setError(e?.message || 'Failed to save data');
    }
  };

  const deleteRow = async (type, row) => {
    const id = String(row?.registrationId || row?.insuranceId || row?.fitnessId || row?.pucId || row?.id || '');
    if (!id || !token) return;
    if (!window.confirm('Delete selected record?')) return;
    try {
      if (type === 'registration') await hiredVehicleRegistrationService.delete(token, id);
      if (type === 'insurance') await hiredVehicleInsuranceService.delete(token, id);
      if (type === 'fitness') await hiredVehicleFitnessCertificateService.delete(token, id);
      if (type === 'puc') await hiredVehiclePucService.delete(token, id);
      setSuccess('Record deleted successfully.');
      await loadRows();
    } catch (e) {
      setError(e?.message || 'Failed to delete data');
    }
  };

  const renderHistoryTable = (type, rows, config) => (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>{config.title}</Typography>
        <Button variant="contained" disabled={!hiredVehicleId} onClick={() => openCreate(type)}>{config.addLabel}</Button>
      </Stack>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              {config.headers.map((h) => <TableCell key={h}>{h}</TableCell>)}
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={config.headers.length + 1} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  No records found.
                </TableCell>
              </TableRow>
            ) : rows.map((r, i) => (
              <TableRow key={String(r?.id || r?.registrationId || r?.insuranceId || r?.fitnessId || r?.pucId || i)} hover>
                {config.render(r).map((v, idx) => <TableCell key={`${idx}`}>{v}</TableCell>)}
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button size="small" variant="outlined" onClick={() => openRecord(type, r, 'view')}>View</Button>
                    <Button size="small" variant="outlined" onClick={() => openRecord(type, r, 'edit')}>Edit</Button>
                    <Button size="small" color="error" variant="outlined" onClick={() => { void deleteRow(type, r); }}>Delete</Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );

  const dialogRows = dialog.type === 'registration'
    ? registrationRows
    : dialog.type === 'insurance'
      ? insuranceRows
      : dialog.type === 'fitness'
        ? fitnessRows
        : pucRows;
  const selectedDialogRow = dialogRows.find((x) => String(x?.registrationId || x?.insuranceId || x?.fitnessId || x?.pucId || x?.id || '') === String(dialog.id || ''));

  return (
    <Box>
      {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
      {success ? <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert> : null}

      {/* ── Inner Tabs ── */}
      <Paper variant="outlined" sx={{ p: 1, mb: 2, borderRadius: 2 }}>
        <Tabs value={innerTab} onChange={(_, v) => setInnerTab(v)} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile>
          <Tab label="Vehicle Profile" />
          <Tab label="Registration" />
          <Tab label="Insurance" />
          <Tab label="Fitness Certificate" />
          <Tab label="Emission Test" />
        </Tabs>
      </Paper>

      {/* ── TAB 0: Vehicle Profile ── */}
      {innerTab === 0 && (
        <>
          {/* Selector + Refresh */}
          <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={5}>
                <FormControl fullWidth>
                  <InputLabel>Supplier</InputLabel>
                  <Select value={supplierId} label="Supplier" onChange={(e) => setSupplierId(String(e.target.value || ''))}>
                    {supplierOptions.map((s) => <MenuItem key={s.id} value={s.id}>{s.label}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={7}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <FormControl fullWidth disabled={!supplierId}>
                    <InputLabel>Hired Vehicle</InputLabel>
                    <Select value={hiredVehicleId} label="Hired Vehicle" onChange={(e) => setHiredVehicleId(String(e.target.value || ''))}>
                      {vehicleOptions.map((v) => <MenuItem key={v.id} value={v.id}>{v.label}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <Button size="small" startIcon={<RefreshRoundedIcon />} onClick={() => { void loadRows(); }} sx={{ whiteSpace: 'nowrap' }}>
                    Refresh
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Paper>

          {/* Loading state */}
          {loading && (
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <CircularProgress size={20} />
                <Typography variant="body2">Loading hired vehicle profile...</Typography>
              </Stack>
            </Paper>
          )}

          {/* No vehicle selected */}
          {!loading && !hiredVehicleId && (
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Typography variant="body2" color="text.secondary">No hired vehicle selected.</Typography>
            </Paper>
          )}

          {/* Profile content */}
          {!loading && profileData && profileView && (
            <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} alignItems="flex-start">

              {/* ── LEFT PANEL ── */}
              <Box sx={{ width: { xs: '100%', lg: 300 }, minWidth: { xs: '100%', lg: 300 }, flexShrink: 0 }}>

                {/* Vehicle Avatar */}
                <Paper
                  variant="outlined"
                  sx={{
                    p: 3,
                    mb: 2,
                    borderRadius: 3,
                    background: `linear-gradient(160deg, ${theme.palette.primary.main}18, ${theme.palette.secondary.main}14)`,
                    textAlign: 'center',
                  }}
                >
                  <Avatar
                    sx={{
                      width: 96,
                      height: 96,
                      mx: 'auto',
                      mb: 2,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      boxShadow: `0 4px 20px ${theme.palette.primary.main}44`,
                    }}
                  >
                    <LocalShippingRoundedIcon sx={{ fontSize: 52, color: '#fff' }} />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                    {profileView.keyNumber}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
                    {profileView.brand}&nbsp;·&nbsp;{profileView.model}
                  </Typography>
                  <Stack spacing={0.75}>
                    <Chip
                      size="small"
                      color={profileView.isActive ? 'success' : 'default'}
                      label={profileView.isActive ? 'Active' : 'Inactive'}
                      sx={{ fontWeight: 700 }}
                    />
                    <Chip
                      size="small"
                      variant="outlined"
                      color="primary"
                      label={`Type: ${profileView.vehicleType}`}
                    />
                    <Chip
                      size="small"
                      variant="outlined"
                      label={`Supplier: ${profileView.supplierName}`}
                    />
                  </Stack>
                </Paper>

                {/* Identity */}
                <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                    <BadgeRoundedIcon fontSize="small" color="primary" />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Identity</Typography>
                  </Stack>
                  <Divider sx={{ mb: 1.5 }} />
                  {[
                    { label: 'Key Number', value: profileView.keyNumber },
                    { label: 'Register No', value: profileView.registrationNumber },
                    { label: 'Chassis No', value: profileView.chassisNumber },
                    { label: 'Engine No', value: profileView.engineNumber },
                  ].map(({ label, value }) => (
                    <Box key={label} sx={{ mb: 1.25 }}>
                      <Typography variant="caption" color="text.secondary" display="block">{label}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, wordBreak: 'break-all' }}>{value || '-'}</Typography>
                    </Box>
                  ))}
                </Paper>

                {/* Metrics */}
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                    <SpeedRoundedIcon fontSize="small" color="primary" />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Metrics</Typography>
                  </Stack>
                  <Divider sx={{ mb: 1.5 }} />
                  <Stack direction="row" spacing={1.5} sx={{ mb: 1 }}>
                    <Box sx={{ flex: 1, textAlign: 'center', p: 1.5, borderRadius: 2, bgcolor: 'action.hover' }}>
                      <Typography variant="caption" color="text.secondary" display="block">Odometer</Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{profileView.odometer}</Typography>
                      <Typography variant="caption" color="text.secondary">KM</Typography>
                    </Box>
                    <Box sx={{ flex: 1, textAlign: 'center', p: 1.5, borderRadius: 2, bgcolor: 'action.hover' }}>
                      <Typography variant="caption" color="text.secondary" display="block">Engine Hrs</Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{profileView.engineHours}</Typography>
                      <Typography variant="caption" color="text.secondary">hrs</Typography>
                    </Box>
                  </Stack>
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" color="text.secondary" display="block">Ownership</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{profileView.currentOwnership}</Typography>
                  </Box>
                </Paper>
              </Box>

              {/* ── RIGHT PANEL ── */}
              <Box sx={{ flex: 1, minWidth: 0 }}>

                {/* Supplier & Assignment */}
                <Paper variant="outlined" sx={{ p: 2.5, mb: 2, borderRadius: 2 }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                    <HandshakeRoundedIcon fontSize="small" color="primary" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Supplier & Assignment</Typography>
                  </Stack>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    {[
                      { label: 'Supplier', value: profileView.supplierName, icon: <HandshakeRoundedIcon fontSize="small" /> },
                      { label: 'Current Ownership', value: profileView.currentOwnership, icon: <BadgeRoundedIcon fontSize="small" /> },
                    ].map(({ label, value, icon }) => (
                      <Grid item xs={12} sm={6} key={label}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, p: 1.5, borderRadius: 2, bgcolor: 'action.hover' }}>
                          <Box sx={{ color: 'primary.main', mt: 0.25, flexShrink: 0 }}>{icon}</Box>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="caption" color="text.secondary" display="block">{label}</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700, wordBreak: 'break-word' }}>{value || '-'}</Typography>
                          </Box>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>

                {/* Vehicle Specifications */}
                <Paper variant="outlined" sx={{ p: 2.5, mb: 2, borderRadius: 2 }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                    <DirectionsCarRoundedIcon fontSize="small" color="primary" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Vehicle Specifications</Typography>
                  </Stack>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    {[
                      { label: 'Vehicle Type', value: profileView.vehicleType, icon: <DirectionsCarRoundedIcon fontSize="small" /> },
                      { label: 'Brand', value: profileView.brand, icon: <NumbersRoundedIcon fontSize="small" /> },
                      { label: 'Model', value: profileView.model, icon: <BuildRoundedIcon fontSize="small" /> },
                      { label: 'Manufacture Year', value: profileView.manufactureYear, icon: <CalendarMonthRoundedIcon fontSize="small" /> },
                      { label: 'Color', value: profileView.color, icon: <BadgeRoundedIcon fontSize="small" /> },
                    ].map(({ label, value, icon }) => (
                      <Grid item xs={12} sm={6} md={4} key={label}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, p: 1.5, borderRadius: 2, bgcolor: 'action.hover' }}>
                          <Box sx={{ color: 'secondary.main', mt: 0.25, flexShrink: 0 }}>{icon}</Box>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="caption" color="text.secondary" display="block">{label}</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700, wordBreak: 'break-word' }}>{value || '-'}</Typography>
                          </Box>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>

                {/* Complete Vehicle Details */}
                <Paper variant="outlined" sx={{ p: 2.5, mb: 2, borderRadius: 2 }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                    <BadgeRoundedIcon fontSize="small" color="primary" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Complete Vehicle Details</Typography>
                  </Stack>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    {[
                      { label: 'Supplier', value: profileView.supplierName },
                      { label: 'Supplier Code', value: profileView.supplierCode },
                      { label: 'Vehicle Type', value: profileView.vehicleType },
                      { label: 'Vehicle Category', value: profileView.category },
                      { label: 'Manufacture Brand', value: profileView.brand },
                      { label: 'Vehicle Model', value: profileView.model },
                      { label: 'Register Number', value: profileView.registrationNumber },
                      { label: 'Chassis Number', value: profileView.chassisNumber },
                      { label: 'Engine Number', value: profileView.engineNumber },
                      { label: 'Identification Code', value: profileView.keyNumber },
                      { label: 'Vehicle Image URL', value: profileView.vehicleImage },
                      { label: 'Manufacture Year', value: profileView.manufactureYear },
                      { label: 'Color', value: profileView.color },
                      { label: 'Ownership Type', value: profileView.ownershipType },
                      { label: 'Current Ownership', value: profileView.currentOwnership },
                      { label: 'Distributor', value: profileView.distributor },
                      { label: 'Previous Owners', value: profileView.previousOwners },
                      { label: 'Vehicle Condition', value: profileView.vehicleCondition },
                      { label: 'Operational Status', value: profileView.operationalStatus },
                      { label: 'Initial Odometer KM', value: profileView.initialOdometer },
                      { label: 'Current Odometer KM', value: profileView.odometer },
                      { label: 'Total Engine Hours', value: profileView.engineHours },
                      { label: 'Consumption Method', value: profileView.consumptionMethod },
                      { label: 'Rated Efficiency (KMPL)', value: profileView.ratedEfficiency },
                      { label: 'Rated Consumption (LPH)', value: profileView.ratedConsumption },
                      { label: 'Is Active', value: profileView.isActive ? 'true' : 'false' },
                      { label: 'Notes', value: profileView.notes },
                    ].map(({ label, value }) => (
                      <Grid item xs={12} sm={6} md={4} key={label}>
                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'action.hover' }}>
                          <Typography variant="caption" color="text.secondary" display="block">{label}</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700, wordBreak: 'break-word' }}>{value || '-'}</Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>

                {/* Vehicle Registration */}
                <Paper variant="outlined" sx={{ p: 2.5, mb: 2, borderRadius: 2 }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                    <BadgeRoundedIcon fontSize="small" color="primary" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Vehicle Registration</Typography>
                  </Stack>
                  <Divider sx={{ mb: 2 }} />
                  {!regView ? (
                    <Typography variant="body2" color="text.secondary">No registration data found.</Typography>
                  ) : (
                    <Grid container spacing={2}>
                      {[
                        { label: 'Registration Number', value: regView.registrationNumber },
                        { label: 'Registration Date', value: regView.registrationDate },
                        { label: 'Registration Expiry', value: regView.registrationExpiry },
                        { label: 'RC Status', value: regView.rcStatus },
                        { label: 'Notes', value: regView.notes },
                        { label: 'Is Current', value: regView.isCurrent },
                      ].map(({ label, value }) => (
                        <Grid item xs={12} sm={6} md={4} key={label}>
                          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'action.hover' }}>
                            <Typography variant="caption" color="text.secondary" display="block">{label}</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700, wordBreak: 'break-word' }}>{value || '-'}</Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Paper>

                {/* Vehicle Insurance */}
                <Paper variant="outlined" sx={{ p: 2.5, mb: 2, borderRadius: 2 }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                    <BadgeRoundedIcon fontSize="small" color="primary" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Vehicle Insurance</Typography>
                  </Stack>
                  <Divider sx={{ mb: 2 }} />
                  {!insView ? (
                    <Typography variant="body2" color="text.secondary">No insurance data found.</Typography>
                  ) : (
                    <Grid container spacing={2}>
                      {[
                        { label: 'Insurance Company', value: insView.insuranceCompany },
                        { label: 'Policy Number', value: insView.policyNumber },
                        { label: 'Policy Start', value: insView.policyStartDate },
                        { label: 'Policy Expiry', value: insView.policyExpiryDate },
                        { label: 'Status', value: insView.insuranceStatus },
                        { label: 'Is Current', value: insView.isCurrent },
                      ].map(({ label, value }) => (
                        <Grid item xs={12} sm={6} md={4} key={label}>
                          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'action.hover' }}>
                            <Typography variant="caption" color="text.secondary" display="block">{label}</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700, wordBreak: 'break-word' }}>{value || '-'}</Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Paper>

                {/* Vehicle Fitness Certificate */}
                <Paper variant="outlined" sx={{ p: 2.5, mb: 2, borderRadius: 2 }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                    <BadgeRoundedIcon fontSize="small" color="primary" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Vehicle Fitness Certificate</Typography>
                  </Stack>
                  <Divider sx={{ mb: 2 }} />
                  {!fitView ? (
                    <Typography variant="body2" color="text.secondary">No fitness certificate data found.</Typography>
                  ) : (
                    <Grid container spacing={2}>
                      {[
                        { label: 'Certificate Number', value: fitView.certificateNumber },
                        { label: 'Issue Date', value: fitView.issueDate },
                        { label: 'Expiry Date', value: fitView.expiryDate },
                        { label: 'Status', value: fitView.fitnessStatus },
                        { label: 'Remarks', value: fitView.remarks },
                        { label: 'Is Current', value: fitView.isCurrent },
                      ].map(({ label, value }) => (
                        <Grid item xs={12} sm={6} md={4} key={label}>
                          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'action.hover' }}>
                            <Typography variant="caption" color="text.secondary" display="block">{label}</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700, wordBreak: 'break-word' }}>{value || '-'}</Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Paper>

                {/* Vehicle Emission Test */}
                <Paper variant="outlined" sx={{ p: 2.5, mb: 2, borderRadius: 2 }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                    <BadgeRoundedIcon fontSize="small" color="primary" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Vehicle Emission Test</Typography>
                  </Stack>
                  <Divider sx={{ mb: 2 }} />
                  {!pucView ? (
                    <Typography variant="body2" color="text.secondary">No emission test data found.</Typography>
                  ) : (
                    <Grid container spacing={2}>
                      {[
                        { label: 'Certificate Number', value: pucView.certificateNumber },
                        { label: 'Issue Date', value: pucView.issueDate },
                        { label: 'Expiry Date', value: pucView.expiryDate },
                        { label: 'Test Result', value: pucView.testResult },
                        { label: 'Status', value: pucView.pucStatus },
                        { label: 'Is Current', value: pucView.isCurrent },
                      ].map(({ label, value }) => (
                        <Grid item xs={12} sm={6} md={4} key={label}>
                          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'action.hover' }}>
                            <Typography variant="caption" color="text.secondary" display="block">{label}</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700, wordBreak: 'break-word' }}>{value || '-'}</Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Paper>

                {/* Notes */}
                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                    <BadgeRoundedIcon fontSize="small" color="primary" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Notes</Typography>
                  </Stack>
                  <Divider sx={{ mb: 1.5 }} />
                  <Typography variant="body2" color={profileView.notes === '-' ? 'text.secondary' : 'text.primary'}>
                    {profileView.notes || 'No notes available.'}
                  </Typography>
                </Paper>
              </Box>
            </Stack>
          )}
        </>
      )}

      {/* ── TAB 1: Registration History ── */}
      {innerTab === 1 && renderHistoryTable('registration', registrationRows, {
        title: 'Hired Vehicle Registration History',
        addLabel: 'Add Registration',
        headers: ['Registration Number', 'Registration Date', 'Expiry Date', 'RC Status'],
        render: (r) => [r?.registrationNumber || r?.registration_number || '-', r?.registrationDate || r?.registration_date || '-', r?.registrationExpiry || r?.registration_expiry || '-', r?.rcStatus || r?.rc_status || '-'],
      })}

      {/* ── TAB 2: Insurance History ── */}
      {innerTab === 2 && renderHistoryTable('insurance', insuranceRows, {
        title: 'Hired Vehicle Insurance History',
        addLabel: 'Add Insurance',
        headers: ['Insurance Company', 'Policy Number', 'Policy Start', 'Policy Expiry', 'Status'],
        render: (r) => [r?.insuranceCompany || r?.insurance_company || '-', r?.policyNumber || r?.policy_number || '-', r?.policyStartDate || r?.policy_start_date || '-', r?.policyExpiryDate || r?.policy_expiry_date || '-', r?.insuranceStatus || r?.insurance_status || '-'],
      })}

      {/* ── TAB 3: Fitness Certificate History ── */}
      {innerTab === 3 && renderHistoryTable('fitness', fitnessRows, {
        title: 'Hired Vehicle Fitness Certificate History',
        addLabel: 'Add Fitness Certificate',
        headers: ['Certificate Number', 'Issue Date', 'Expiry Date', 'Status'],
        render: (r) => [r?.certificateNumber || r?.certificate_number || '-', r?.issueDate || r?.issue_date || '-', r?.expiryDate || r?.expiry_date || '-', r?.fitnessStatus || r?.fitness_status || '-'],
      })}

      {/* ── TAB 4: Emission Test History ── */}
      {innerTab === 4 && renderHistoryTable('puc', pucRows, {
        title: 'Hired Vehicle Emission Test History',
        addLabel: 'Add Emission Test',
        headers: ['Certificate Number', 'Issue Date', 'Expiry Date', 'Result', 'Status'],
        render: (r) => [r?.certificateNumber || r?.certificate_number || '-', r?.issueDate || r?.issue_date || '-', r?.expiryDate || r?.expiry_date || '-', r?.testResult || r?.test_result || '-', r?.pucStatus || r?.puc_status || '-'],
      })}

      {/* ── Edit / Create / View Dialog ── */}
      <Dialog open={!!dialog.type} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>{isViewMode ? 'View' : (dialog.mode === 'edit' ? 'Edit' : 'Add')} {dialog.type || ''}</DialogTitle>
        <DialogContent dividers>
          {dialog.type === 'registration' && (
            <Grid container spacing={2} sx={{ mt: 0.2 }}>
              <Grid item xs={12}><TextField disabled={isViewMode} fullWidth size="small" label="Registration Number" value={regForm.registrationNumber} onChange={(e) => setRegForm((p) => ({ ...p, registrationNumber: e.target.value }))} /></Grid>
              <Grid item xs={6}><TextField disabled={isViewMode} fullWidth size="small" type="date" label="Registration Date" InputLabelProps={{ shrink: true }} value={regForm.registrationDate} onChange={(e) => setRegForm((p) => ({ ...p, registrationDate: e.target.value }))} /></Grid>
              <Grid item xs={6}><TextField disabled={isViewMode} fullWidth size="small" type="date" label="Expiry Date" InputLabelProps={{ shrink: true }} value={regForm.registrationExpiry} onChange={(e) => setRegForm((p) => ({ ...p, registrationExpiry: e.target.value }))} /></Grid>
              <Grid item xs={12}><FormControl fullWidth size="small" disabled={isViewMode}><InputLabel>RC Status</InputLabel><Select value={regForm.rcStatus} label="RC Status" onChange={(e) => setRegForm((p) => ({ ...p, rcStatus: e.target.value }))}><MenuItem value="Valid">Valid</MenuItem><MenuItem value="Expired">Expired</MenuItem><MenuItem value="Suspended">Suspended</MenuItem></Select></FormControl></Grid>
              <Grid item xs={12}><TextField disabled={isViewMode} fullWidth size="small" label="Notes" value={regForm.notes} onChange={(e) => setRegForm((p) => ({ ...p, notes: e.target.value }))} /></Grid>
            </Grid>
          )}
          {dialog.type === 'insurance' && (
            <Grid container spacing={2} sx={{ mt: 0.2 }}>
              <Grid item xs={12}><TextField disabled={isViewMode} fullWidth size="small" label="Insurance Company" value={insForm.insuranceCompany} onChange={(e) => setInsForm((p) => ({ ...p, insuranceCompany: e.target.value }))} /></Grid>
              <Grid item xs={12}><TextField disabled={isViewMode} fullWidth size="small" label="Policy Number" value={insForm.policyNumber} onChange={(e) => setInsForm((p) => ({ ...p, policyNumber: e.target.value }))} /></Grid>
              <Grid item xs={6}><TextField disabled={isViewMode} fullWidth size="small" type="date" label="Policy Start" InputLabelProps={{ shrink: true }} value={insForm.policyStartDate} onChange={(e) => setInsForm((p) => ({ ...p, policyStartDate: e.target.value }))} /></Grid>
              <Grid item xs={6}><TextField disabled={isViewMode} fullWidth size="small" type="date" label="Policy Expiry" InputLabelProps={{ shrink: true }} value={insForm.policyExpiryDate} onChange={(e) => setInsForm((p) => ({ ...p, policyExpiryDate: e.target.value }))} /></Grid>
              <Grid item xs={12}><FormControl fullWidth size="small" disabled={isViewMode}><InputLabel>Status</InputLabel><Select value={insForm.insuranceStatus} label="Status" onChange={(e) => setInsForm((p) => ({ ...p, insuranceStatus: e.target.value }))}><MenuItem value="Active">Active</MenuItem><MenuItem value="Expired">Expired</MenuItem><MenuItem value="Cancelled">Cancelled</MenuItem></Select></FormControl></Grid>
            </Grid>
          )}
          {dialog.type === 'fitness' && (
            <Grid container spacing={2} sx={{ mt: 0.2 }}>
              <Grid item xs={12}><TextField disabled={isViewMode} fullWidth size="small" label="Certificate Number" value={fitForm.certificateNumber} onChange={(e) => setFitForm((p) => ({ ...p, certificateNumber: e.target.value }))} /></Grid>
              <Grid item xs={6}><TextField disabled={isViewMode} fullWidth size="small" type="date" label="Issue Date" InputLabelProps={{ shrink: true }} value={fitForm.issueDate} onChange={(e) => setFitForm((p) => ({ ...p, issueDate: e.target.value }))} /></Grid>
              <Grid item xs={6}><TextField disabled={isViewMode} fullWidth size="small" type="date" label="Expiry Date" InputLabelProps={{ shrink: true }} value={fitForm.expiryDate} onChange={(e) => setFitForm((p) => ({ ...p, expiryDate: e.target.value }))} /></Grid>
              <Grid item xs={12}><FormControl fullWidth size="small" disabled={isViewMode}><InputLabel>Status</InputLabel><Select value={fitForm.fitnessStatus} label="Status" onChange={(e) => setFitForm((p) => ({ ...p, fitnessStatus: e.target.value }))}><MenuItem value="Valid">Valid</MenuItem><MenuItem value="Expired">Expired</MenuItem></Select></FormControl></Grid>
            </Grid>
          )}
          {dialog.type === 'puc' && (
            <Grid container spacing={2} sx={{ mt: 0.2 }}>
              <Grid item xs={12}><TextField disabled={isViewMode} fullWidth size="small" label="Certificate Number" value={pucForm.certificateNumber} onChange={(e) => setPucForm((p) => ({ ...p, certificateNumber: e.target.value }))} /></Grid>
              <Grid item xs={6}><TextField disabled={isViewMode} fullWidth size="small" type="date" label="Issue Date" InputLabelProps={{ shrink: true }} value={pucForm.issueDate} onChange={(e) => setPucForm((p) => ({ ...p, issueDate: e.target.value }))} /></Grid>
              <Grid item xs={6}><TextField disabled={isViewMode} fullWidth size="small" type="date" label="Expiry Date" InputLabelProps={{ shrink: true }} value={pucForm.expiryDate} onChange={(e) => setPucForm((p) => ({ ...p, expiryDate: e.target.value }))} /></Grid>
              <Grid item xs={6}><FormControl fullWidth size="small" disabled={isViewMode}><InputLabel>Result</InputLabel><Select value={pucForm.testResult} label="Result" onChange={(e) => setPucForm((p) => ({ ...p, testResult: e.target.value }))}><MenuItem value="Pass">Pass</MenuItem><MenuItem value="Fail">Fail</MenuItem></Select></FormControl></Grid>
              <Grid item xs={6}><FormControl fullWidth size="small" disabled={isViewMode}><InputLabel>Status</InputLabel><Select value={pucForm.pucStatus} label="Status" onChange={(e) => setPucForm((p) => ({ ...p, pucStatus: e.target.value }))}><MenuItem value="Valid">Valid</MenuItem><MenuItem value="Expired">Expired</MenuItem></Select></FormControl></Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Close</Button>
          {isViewMode ? (
            <>
              <Button variant="outlined" onClick={() => setDialog((p) => ({ ...p, mode: 'edit' }))}>Edit</Button>
              <Button color="error" variant="outlined" onClick={() => { void deleteRow(dialog.type, selectedDialogRow); closeDialog(); }}>Delete</Button>
            </>
          ) : (
            <Button variant="contained" onClick={submitDialog}>{dialog.mode === 'edit' ? 'Update' : 'Save'}</Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
