import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import QrCode2RoundedIcon from '@mui/icons-material/QrCode2Rounded';
import DirectionsCarRoundedIcon from '@mui/icons-material/DirectionsCarRounded';
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';
import BuildRoundedIcon from '@mui/icons-material/BuildRounded';
import ColorLensRoundedIcon from '@mui/icons-material/ColorLensRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import AccountTreeRoundedIcon from '@mui/icons-material/AccountTreeRounded';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import NumbersRoundedIcon from '@mui/icons-material/NumbersRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import HandshakeRoundedIcon from '@mui/icons-material/HandshakeRounded';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { Alert, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, Paper, Stack, Tab, Tabs, Typography, FormControl, InputLabel, Select, MenuItem, Avatar, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import CrudEntityPage from '../../organization/shared/CrudEntityPage';
import { useAuth } from '../../../app/AuthContext';
import { organizationService } from '../../../services/organizationService';
import { vehicleCategoryService } from '../../../services/vehicle_management/vehicle_category/vehicleCategoryService';
import { vehicleManufacturerService } from '../../../services/vehicle_management/vehicle_manufacturer/vehicleManufacturerService';
import { vehicleModelService } from '../../../services/vehicle_management/vehicle_model/vehicleModelService';
import { vehicleTypeService } from '../../../services/vehicle_management/vehicle_type/vehicleTypeService';
import { vehicleService } from '../../../services/vehicle_management/vehicle/vehicleService';
import { distributorService } from '../../../services/vehicle_management/distributor/distributorService';
import { companyVehicleService } from '../../../services/vehicle_management/company_vehicle/companyVehicleService';
import { vehicleRegistrationService } from '../../../services/vehicle_management/vehicle_registration/vehicleRegistrationService';
import { vehicleInsuranceService } from '../../../services/vehicle_management/vehicle_insurance/vehicleInsuranceService';
import { vehicleFitnessCertificateService } from '../../../services/vehicle_management/vehicle_fitness_certificate/vehicleFitnessCertificateService';
import { vehiclePucService } from '../../../services/vehicle_management/vehicle_puc/vehiclePucService';
import CompanyVehicleLocationPanel from './CompanyVehicleLocationPanel';
import CompanyVehicleFuelPanel from './CompanyVehicleFuelPanel';
import CompanyVehicleRunningDetailsPanel from './CompanyVehicleRunningDetailsPanel';
import { getOwnCompanyPrefill, opt, req, rowsFrom, toBool, toDecimal, toInt } from '../../employee_hr_management/shared/hrCrudCommon';

export default function CompanyVehiclePage() {
  const theme = useTheme();
  const { token, auth } = useAuth();
  const registrationFieldMaxLength = 255;
  const registrationDefaultRcStatus = 'Valid';
  const registrationDefaultIsCurrent = 'true';
  const [companies, setCompanies] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  const [vehicleModels, setVehicleModels] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [companyVehicleRows, setCompanyVehicleRows] = useState([]);
  const [distributors, setDistributors] = useState([]);
  const [ownershipTypes, setOwnershipTypes] = useState([]);
  const [currentOwnershipOptions, setCurrentOwnershipOptions] = useState([]);
  const [operationalStatuses, setOperationalStatuses] = useState([]);
  const [numberPlateTypes, setNumberPlateTypes] = useState([]);
  const [insuranceTypes, setInsuranceTypes] = useState([]);
  const [insuranceCompanyOptions, setInsuranceCompanyOptions] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [profileInnerTab, setProfileInnerTab] = useState(0);
  const [overview, setOverview] = useState({
    totalVehicles: 0,
    activeVehicles: 0,
    inactiveVehicles: 0,
    totalTypes: 0,
    totalBrands: 0,
    totalInsuranceRecords: 0,
    totalFitnessRecords: 0,
    totalEmissionRecords: 0,
    vehicleTypeCounts: [],
  });
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [profileCompanyId, setProfileCompanyId] = useState('');
  const [profileRows, setProfileRows] = useState([]);
  const [profileVehicleId, setProfileVehicleId] = useState('');
  const [profileData, setProfileData] = useState(null);
  const [profileRegistrationData, setProfileRegistrationData] = useState(null);
  const [profileRegistrationLoading, setProfileRegistrationLoading] = useState(false);
  const [profileInsuranceData, setProfileInsuranceData] = useState(null);
  const [profileInsuranceLoading, setProfileInsuranceLoading] = useState(false);
  const [profileFitnessData, setProfileFitnessData] = useState(null);
  const [profileFitnessLoading, setProfileFitnessLoading] = useState(false);
  const [profilePucData, setProfilePucData] = useState(null);
  const [profilePucLoading, setProfilePucLoading] = useState(false);
  const [profilePrintDialogOpen, setProfilePrintDialogOpen] = useState(false);
  const [profileQrDialogOpen, setProfileQrDialogOpen] = useState(false);
  const [profileQrLoading, setProfileQrLoading] = useState(false);
  const [profileQrData, setProfileQrData] = useState(null);
  const [profileQrError, setProfileQrError] = useState('');
  const [profileScanDialogOpen, setProfileScanDialogOpen] = useState(false);
  const [profileScanValue, setProfileScanValue] = useState('');
  const [profileScanLoading, setProfileScanLoading] = useState(false);
  const [profileScanError, setProfileScanError] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileReloadSeed, setProfileReloadSeed] = useState(0);
  const [registrationForm, setRegistrationForm] = useState({
    companyId: '',
    companyVehicleId: '',
    registrationNumber: '',
    registrationDate: '',
    registrationExpiry: '',
    registeringAuthority: '',
    registrationState: '',
    registrationCity: '',
    rcBookNumber: '',
    rcStatus: registrationDefaultRcStatus,
    numberPlateTypeId: '',
    renewalReminderDays: '',
    isCurrent: registrationDefaultIsCurrent,
    notes: '',
  });
  const [registrationSaving, setRegistrationSaving] = useState(false);
  const [registrationError, setRegistrationError] = useState('');
  const [registrationSuccess, setRegistrationSuccess] = useState('');
  const [registrationRecordId, setRegistrationRecordId] = useState('');
  const [registrationEditMode, setRegistrationEditMode] = useState(true);
  const [registrationRows, setRegistrationRows] = useState([]);
  const [registrationRowsLoading, setRegistrationRowsLoading] = useState(false);
  const [registrationDialogOpen, setRegistrationDialogOpen] = useState(false);
  const [registrationDialogMode, setRegistrationDialogMode] = useState('create');
  const registrationSkipAutoLoadRef = useRef(false);
  const [registrationAutoLoadBlockedVehicleId, setRegistrationAutoLoadBlockedVehicleId] = useState('');
  const [insuranceForm, setInsuranceForm] = useState({
    companyId: '',
    companyVehicleId: '',
    insuranceCompany: '',
    policyNumber: '',
    insuranceTypeId: '',
    policyStartDate: '',
    policyExpiryDate: '',
    idvAmount: '',
    premiumAmount: '',
    paymentMode: '',
    paymentDate: '',
    agentName: '',
    agentContact: '',
    agentEmail: '',
    nomineeName: '',
    addOnCovers: '',
    ncbPercent: '',
    claimCount: '',
    lastClaimDate: '',
    lastClaimAmount: '',
    renewalReminderDays: '30',
    insuranceStatus: 'Active',
    notes: '',
    isCurrent: 'true',
  });
  const [insuranceSaving, setInsuranceSaving] = useState(false);
  const [insuranceError, setInsuranceError] = useState('');
  const [insuranceSuccess, setInsuranceSuccess] = useState('');
  const [insuranceRecordId, setInsuranceRecordId] = useState('');
  const [insuranceEditMode, setInsuranceEditMode] = useState(true);
  const [insuranceRows, setInsuranceRows] = useState([]);
  const [insuranceRowsLoading, setInsuranceRowsLoading] = useState(false);
  const [insuranceDialogOpen, setInsuranceDialogOpen] = useState(false);
  const [insuranceDialogMode, setInsuranceDialogMode] = useState('create');
  const [fitnessForm, setFitnessForm] = useState({
    companyId: '',
    companyVehicleId: '',
    certificateNumber: '',
    issuingAuthority: '',
    inspectionCenter: '',
    inspectorId: '',
    inspectorName: '',
    issueDate: '',
    expiryDate: '',
    validityDurationYears: '',
    inspectionResultId: '',
    remarks: '',
    renewalReminderDays: '30',
    fitnessStatus: 'Valid',
    isCurrent: 'true',
  });
  const [fitnessSaving, setFitnessSaving] = useState(false);
  const [fitnessError, setFitnessError] = useState('');
  const [fitnessSuccess, setFitnessSuccess] = useState('');
  const [fitnessRecordId, setFitnessRecordId] = useState('');
  const [fitnessEditMode, setFitnessEditMode] = useState(true);
  const [fitnessRows, setFitnessRows] = useState([]);
  const [fitnessRowsLoading, setFitnessRowsLoading] = useState(false);
  const [fitnessDialogOpen, setFitnessDialogOpen] = useState(false);
  const [fitnessDialogMode, setFitnessDialogMode] = useState('create');
  const [pucForm, setPucForm] = useState({
    companyId: '',
    companyVehicleId: '',
    certificateNumber: '',
    issuingCenter: '',
    issueDate: '',
    expiryDate: '',
    coEmissionPercent: '',
    hcEmissionPpm: '',
    testResult: 'Pass',
    pucStatus: 'Valid',
    renewalReminderDays: '15',
    isCurrent: 'true',
  });
  const [pucSaving, setPucSaving] = useState(false);
  const [pucError, setPucError] = useState('');
  const [pucSuccess, setPucSuccess] = useState('');
  const [pucRecordId, setPucRecordId] = useState('');
  const [pucEditMode, setPucEditMode] = useState(true);
  const [pucRows, setPucRows] = useState([]);
  const [pucRowsLoading, setPucRowsLoading] = useState(false);
  const [pucDialogOpen, setPucDialogOpen] = useState(false);
  const [pucDialogMode, setPucDialogMode] = useState('create');

  useEffect(() => {
    (async () => {
      if (!token) return;
      const settled = await Promise.allSettled([
        organizationService.listCompanies(token, { activeOnly: false }),
        organizationService.listDepartments(token, { activeOnly: false }),
        vehicleCategoryService.list(token, { sortBy: 'categoryName', sortDir: 'asc' }),
        vehicleManufacturerService.list(token, { sortBy: 'manufacturerName', sortDir: 'asc' }),
        vehicleModelService.list(token, { sortBy: 'modelName', sortDir: 'asc' }),
        vehicleTypeService.list(token, { sortBy: 'typeName', sortDir: 'asc' }),
        vehicleService.list(token, {}),
        companyVehicleService.list(token, {}),
        distributorService.list(token, { sortBy: 'distributorName', sortDir: 'asc' }),
      companyVehicleService.ownershipTypeOptions(token),
      organizationService.enumValues('operational_status', { locale: 'en-US', activeOnly: true }),
      organizationService.enumValues('number_plate_type', { locale: 'en-US', activeOnly: true }),
      organizationService.enumValues('insurance_type', { locale: 'en-US', activeOnly: true }),
      ]);

      const value = (idx) => (settled[idx]?.status === 'fulfilled' ? settled[idx].value : null);

      setCompanies(rowsFrom(value(0)).map((c) => ({
        id: c.companyId || c.company_id || c.id,
        code: c.companyCode || c.company_code || c.code,
        name: c.companyName || c.company_name || c.name,
      })).filter((c) => c.id));
      setDepartments(rowsFrom(value(1)).map((d) => ({
        ...d,
        departmentId: d.departmentId || d.department_id || d.id,
        companyId: d.companyId || d.company_id,
        departmentName: d.departmentName || d.department_name || d.name,
        departmentCode: d.departmentCode || d.department_code || d.code,
      })).filter((d) => d.departmentId));
      setCategories(rowsFrom(value(2)));
      setManufacturers(rowsFrom(value(3)));
      setVehicleModels(rowsFrom(value(4)));
      setVehicleTypes(rowsFrom(value(5)));
      setVehicles(rowsFrom(value(6)));
      setCompanyVehicleRows(rowsFrom(value(7)));
      setDistributors(rowsFrom(value(8)));
      setOwnershipTypes(rowsFrom(value(9)).map((x) => ({
        id: x.id ?? x.typeId ?? x.type_id,
        code: x.code ?? x.typeCode ?? x.type_code,
        name: x.name ?? x.typeName ?? x.type_name,
      })).filter((x) => x.id != null));
      setOperationalStatuses(rowsFrom(value(10)));
      setNumberPlateTypes(rowsFrom(value(11)));
      setInsuranceTypes(rowsFrom(value(12)));
    })();
  }, [token]);

  const own = useMemo(() => getOwnCompanyPrefill(auth, companies), [auth, companies]);
  const insuranceCompanySelectOptions = useMemo(() => {
    const base = insuranceCompanyOptions.map((x) => ({
      value: x.name || '',
      label: x.code ? `${x.name} (${x.code})` : (x.name || ''),
    })).filter((x) => x.value);
    const current = String(insuranceForm.insuranceCompany || '');
    if (current && !base.some((x) => x.value === current)) {
      return [{ value: current, label: current }, ...base];
    }
    return base;
  }, [insuranceCompanyOptions, insuranceForm.insuranceCompany]);
  useEffect(() => {
    if (own?.companyId && !profileCompanyId) setProfileCompanyId(String(own.companyId));
  }, [own, profileCompanyId]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!token) return;
      try {
        const companyId = String(insuranceForm.companyId || profileCompanyId || '');
        let rows = rowsFrom(await vehicleInsuranceService.supplierOptions(
          token,
          companyId ? { companyId } : {}
        ));
        if (companyId && rows.length === 0) {
          // Fallback for mixed legacy data where suppliers may not have company_id populated.
          rows = rowsFrom(await vehicleInsuranceService.supplierOptions(token, {}));
        }
        if (ignore) return;
        setInsuranceCompanyOptions(rows.map((s) => ({
          id: s.supplierId || s.supplier_id || s.id,
          code: s.supplierCode || s.supplier_code || '',
          name: s.supplierName || s.supplier_name || '',
        })).filter((s) => s.name));
      } catch {
        if (!ignore) setInsuranceCompanyOptions([]);
      }
    })();
    return () => { ignore = true; };
  }, [token, insuranceForm.companyId, profileCompanyId]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!token || activeTab !== 2) return;
      if (profileVehicleId) return;
      try {
        let first = null;
        if (own?.companyId) {
          try {
            first = await companyVehicleService.first(token, own.companyId);
          } catch {
            first = null;
          }
        }
        if (!first) first = await companyVehicleService.first(token, null);
        if (!ignore && first) {
          const cid = String(first.companyId || first.company_id || '');
          const vid = String(first.companyVehicleId || first.companyvehicleId || first.companyvehicle_id || '');
          if (cid) setProfileCompanyId(cid);
          if (vid) setProfileVehicleId(vid);
          setProfileData(first);
          setProfileError('');
        }
      } catch {
        // keep existing empty state when no company vehicles available
      }
    })();
    return () => { ignore = true; };
  }, [token, activeTab, own?.companyId, profileVehicleId]);

  const getCompanyVehicleRecordId = (row) => String(
    row?.companyVehicleId
    || row?.companyvehicleId
    || row?.companyvehicle_id
    || row?.id
    || ''
  );

  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!token || !profileCompanyId) {
        setProfileRows([]);
        setProfileVehicleId('');
        setProfileData(null);
        return;
      }
      try {
        const rows = rowsFrom(await companyVehicleService.list(token, { companyId: profileCompanyId }));
        if (!ignore) {
          setProfileRows(rows);
          if (!rows.length) {
            setProfileVehicleId('');
            setProfileData(null);
            return;
          }
          const hasSelected = rows.some((x) => getCompanyVehicleRecordId(x) === String(profileVehicleId || ''));
          if (!hasSelected) {
            setProfileVehicleId(getCompanyVehicleRecordId(rows[0]));
            setProfileData(null);
          }
        }
      } catch {
        if (!ignore) {
          setProfileRows([]);
          setProfileVehicleId('');
          setProfileData(null);
        }
      }
    })();
    return () => { ignore = true; };
  }, [token, profileCompanyId, profileReloadSeed]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!token || !profileVehicleId) {
        setProfileData(null);
        setProfileError('');
        setProfileRegistrationData(null);
        setProfileInsuranceData(null);
        setProfileFitnessData(null);
        setProfilePucData(null);
        return;
      }
      setProfileLoading(true);
      setProfileError('');
      try {
        const data = await companyVehicleService.getById(token, profileVehicleId);
        if (!ignore) setProfileData(data || null);
      } catch (e) {
        if (!ignore) {
          setProfileData(null);
          setProfileError(e?.message || 'Failed to load company vehicle profile');
        }
      } finally {
        if (!ignore) setProfileLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [token, profileVehicleId, profileReloadSeed]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!token || !profileVehicleId) {
        setProfileRegistrationData(null);
        return;
      }
      setProfileRegistrationLoading(true);
      try {
        const rows = rowsFrom(await vehicleRegistrationService.list(token, { companyVehicleId: profileVehicleId }));
        if (!ignore) setProfileRegistrationData(rows[0] || null);
      } catch {
        if (!ignore) setProfileRegistrationData(null);
      } finally {
        if (!ignore) setProfileRegistrationLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [token, profileVehicleId, profileReloadSeed]);
  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!token || !profileVehicleId) {
        setProfileInsuranceData(null);
        return;
      }
      setProfileInsuranceLoading(true);
      try {
        const rows = rowsFrom(await vehicleInsuranceService.list(token, { companyVehicleId: profileVehicleId }));
        if (!ignore) setProfileInsuranceData(rows[0] || null);
      } catch {
        if (!ignore) setProfileInsuranceData(null);
      } finally {
        if (!ignore) setProfileInsuranceLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [token, profileVehicleId, profileReloadSeed]);
  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!token || !profileVehicleId) {
        setProfileFitnessData(null);
        return;
      }
      setProfileFitnessLoading(true);
      try {
        const rows = rowsFrom(await vehicleFitnessCertificateService.list(token, { companyVehicleId: profileVehicleId }));
        if (!ignore) setProfileFitnessData(rows[0] || null);
      } catch {
        if (!ignore) setProfileFitnessData(null);
      } finally {
        if (!ignore) setProfileFitnessLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [token, profileVehicleId, profileReloadSeed]);
  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!token || !profileVehicleId) {
        setProfilePucData(null);
        return;
      }
      setProfilePucLoading(true);
      try {
        const rows = rowsFrom(await vehiclePucService.list(token, { companyVehicleId: profileVehicleId }));
        if (!ignore) setProfilePucData(rows[0] || null);
      } catch {
        if (!ignore) setProfilePucData(null);
      } finally {
        if (!ignore) setProfilePucLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [token, profileVehicleId, profileReloadSeed]);
  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!token) return;
      setOverviewLoading(true);
      try {
        const res = await companyVehicleService.overview(token, own?.companyId || null);
        if (!ignore && res) {
          setOverview({
            totalVehicles: Number(res.totalVehicles || 0),
            activeVehicles: Number(res.activeVehicles || 0),
            inactiveVehicles: Number(res.inactiveVehicles || 0),
            totalTypes: Number(res.totalTypes || 0),
            totalBrands: Number(res.totalBrands || 0),
            totalInsuranceRecords: Number(res.totalInsuranceRecords || 0),
            totalFitnessRecords: Number(res.totalFitnessRecords || 0),
            totalEmissionRecords: Number(res.totalEmissionRecords || 0),
            vehicleTypeCounts: Array.isArray(res.vehicleTypeCounts) ? res.vehicleTypeCounts : [],
          });
        }
      } catch {
        try {
          const params = own?.companyId ? { companyId: own.companyId } : {};
          const [rows, insuranceRows, fitnessRows, pucRows] = await Promise.all([
            companyVehicleService.list(token, params),
            vehicleInsuranceService.list(token, params),
            vehicleFitnessCertificateService.list(token, params),
            vehiclePucService.list(token, params),
          ].map(async (p) => rowsFrom(await p)));
          const totalVehicles = rows.length;
          const activeVehicles = rows.filter((r) => r?.isActive === true).length;
          const inactiveVehicles = totalVehicles - activeVehicles;
          const typeCounts = new Map();
          rows.forEach((r) => {
            const typeId = String(r?.companyVehicleType || '');
            if (!typeId) return;
            typeCounts.set(typeId, (typeCounts.get(typeId) || 0) + 1);
          });
          const vehicleTypeCounts = Array.from(typeCounts.entries())
            .map(([typeId, count]) => {
              const t = vehicleTypes.find((x) => String(x.typeId) === String(typeId));
              return {
                typeId,
                typeName: t?.typeName || t?.typeCode || 'Unknown',
                vehicleCount: count,
              };
            })
            .sort((a, b) => Number(b.vehicleCount || 0) - Number(a.vehicleCount || 0));
          if (!ignore) {
            setOverview({
              totalVehicles,
              activeVehicles,
              inactiveVehicles,
              totalTypes: vehicleTypeCounts.length,
              totalBrands: new Set(rows.map((r) => String(r?.companyVehicleManufacture || '')).filter(Boolean)).size,
              totalInsuranceRecords: insuranceRows.length,
              totalFitnessRecords: fitnessRows.length,
              totalEmissionRecords: pucRows.length,
              vehicleTypeCounts,
            });
          }
        } catch {
          if (!ignore) {
            setOverview({
              totalVehicles: 0,
              activeVehicles: 0,
              inactiveVehicles: 0,
              totalTypes: 0,
              totalBrands: 0,
              totalInsuranceRecords: 0,
              totalFitnessRecords: 0,
              totalEmissionRecords: 0,
              vehicleTypeCounts: [],
            });
          }
        }
      } finally {
        if (!ignore) setOverviewLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [token, own?.companyId, vehicleTypes]);

  useEffect(() => {
    if (!own?.companyId) return;
    setRegistrationForm((prev) => ({
      ...prev,
      companyId: prev.companyId || String(own.companyId),
    }));
  }, [own?.companyId]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!token || activeTab !== 2 || profileInnerTab !== 1 || !profileVehicleId) {
        if (!ignore) setRegistrationRows([]);
        return;
      }
      setRegistrationRowsLoading(true);
      try {
        const rows = rowsFrom(await vehicleRegistrationService.list(token, { companyVehicleId: profileVehicleId }));
        if (!ignore) setRegistrationRows(rows);
      } catch {
        if (!ignore) setRegistrationRows([]);
      } finally {
        if (!ignore) setRegistrationRowsLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [token, activeTab, profileInnerTab, profileVehicleId, profileReloadSeed]);

  const companyById = useMemo(() => Object.fromEntries(companies.map((c) => [String(c.id), c])), [companies]);
  const departmentById = useMemo(() => Object.fromEntries(departments.map((d) => [String(d.departmentId), d])), [departments]);
  const categoryById = useMemo(() => Object.fromEntries(categories.map((c) => [String(c.categoryId), c])), [categories]);
  const manufacturerById = useMemo(() => Object.fromEntries(manufacturers.map((m) => [String(m.manufacturerId), m])), [manufacturers]);
  const modelById = useMemo(() => Object.fromEntries(vehicleModels.map((m) => [String(m.modelId), m])), [vehicleModels]);
  const vehicleById = useMemo(() => Object.fromEntries(vehicles.map((v) => [String(v.vehicleId), v])), [vehicles]);
  const distributorById = useMemo(() => Object.fromEntries(distributors.map((d) => [String(d.distributorId), d])), [distributors]);
  const ownershipById = useMemo(() => Object.fromEntries(ownershipTypes.map((x) => [String(x.id), x.name])), [ownershipTypes]);
  const ownershipCodeById = useMemo(() => Object.fromEntries(ownershipTypes.map((x) => [String(x.id), String(x.code || '').toUpperCase()])), [ownershipTypes]);
  const normalizeOwnershipCode = (code) => String(code || '').toUpperCase().replace(/[\s_-]+/g, '');
  const isCompanyOwnedCode = (code) => {
    const normalized = normalizeOwnershipCode(code);
    return normalized === 'OWNED' || normalized === 'COMPANYOWNED';
  };
  const isPersonalOwnedCode = (code) => normalizeOwnershipCode(code) === 'PERSONALOWNED';
  const isLeasedCode = (code) => normalizeOwnershipCode(code) === 'LEASED';
  const operationalById = useMemo(() => Object.fromEntries(operationalStatuses.map((x) => [String(x.id), x.name])), [operationalStatuses]);
  const numberPlateTypeById = useMemo(() => Object.fromEntries(numberPlateTypes.map((x) => [String(x.id), x.name])), [numberPlateTypes]);
  const companyVehicleById = useMemo(() => Object.fromEntries(companyVehicleRows.map((r) => [String(r.companyVehicleId || r.companyvehicleId || r.companyvehicle_id || r.id), r])), [companyVehicleRows]);
  const isRegistrationExpired = (expiry) => {
    if (!expiry) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(`${expiry}T00:00:00`);
    return !Number.isNaN(d.getTime()) && d < today;
  };
  const remainingDaysFromDate = (expiry) => {
    if (!expiry) return '-';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(`${expiry}T00:00:00`);
    if (Number.isNaN(d.getTime())) return '-';
    const diffMs = d.getTime() - today.getTime();
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return days < 0 ? 0 : days;
  };
  const remainingDaysColor = (days) => {
    if (days === '-' || days == null) return 'info.main';
    return Number(days) <= 30 ? 'error.main' : 'info.main';
  };
  const normalizeRegistrationRow = (row) => ({
    id: String(row?.registrationId || row?.registration_id || row?.id || ''),
    companyId: String(row?.companyId || row?.company_id || ''),
    companyVehicleId: String(row?.companyVehicleId || row?.companyvehicleId || row?.companyvehicle_id || ''),
    registrationNumber: row?.registrationNumber || row?.registration_number || '',
    registrationDate: row?.registrationDate || row?.registration_date || '',
    registrationExpiry: row?.registrationExpiry || row?.registration_expiry || '',
    registeringAuthority: row?.registeringAuthority || row?.registering_authority || '',
    registrationState: row?.registrationState || row?.registration_state || '',
    registrationCity: row?.registrationCity || row?.registration_city || '',
    rcBookNumber: row?.rcBookNumber || row?.rc_book_number || '',
    rcStatus: row?.rcStatus || row?.rc_status || registrationDefaultRcStatus,
    numberPlateTypeId: row?.numberPlateTypeId != null ? String(row.numberPlateTypeId) : (row?.number_plate_type_id != null ? String(row.number_plate_type_id) : ''),
    renewalReminderDays: row?.renewalReminderDays != null ? String(row.renewalReminderDays) : (row?.renewal_reminder_days != null ? String(row.renewal_reminder_days) : ''),
    notes: row?.notes || '',
    isCurrent: (row?.isCurrent ?? row?.is_current ?? false) ? 'true' : 'false',
  });
  const openRegistrationDialog = async (mode, row = null) => {
    setRegistrationError('');
    setRegistrationSuccess('');
    let resolvedMode = mode;
    if (mode === 'create') {
      const selected = companyVehicleById[String(profileVehicleId)] || {};
      const companyVehicleId = String(profileVehicleId || '');
      let prefill = null;
      try {
        if (companyVehicleId) prefill = await vehicleRegistrationService.prefillByCompanyVehicle(token, companyVehicleId);
      } catch {
        prefill = null;
      }
      setRegistrationRecordId('');
      setRegistrationEditMode(true);
      setRegistrationForm({
        companyId: String(prefill?.companyId || selected?.companyId || profileCompanyId || ''),
        companyVehicleId,
        registrationNumber: prefill?.registrationNumber || selected?.registrationNumber || selected?.registration_number || '',
        registrationDate: prefill?.registrationDate || '',
        registrationExpiry: prefill?.registrationExpiry || '',
        registeringAuthority: prefill?.registeringAuthority || '',
        registrationState: prefill?.registrationState || '',
        registrationCity: prefill?.registrationCity || '',
        rcBookNumber: prefill?.rcBookNumber || '',
        rcStatus: prefill?.rcStatus || registrationDefaultRcStatus,
        numberPlateTypeId: prefill?.numberPlateTypeId != null ? String(prefill.numberPlateTypeId) : (registrationDefaultNumberPlateTypeId || ''),
        renewalReminderDays: prefill?.renewalReminderDays != null ? String(prefill.renewalReminderDays) : '',
        isCurrent: prefill?.isCurrent == null ? registrationDefaultIsCurrent : (prefill.isCurrent ? 'true' : 'false'),
        notes: prefill?.notes || '',
      });
    } else if (row) {
      const mapped = normalizeRegistrationRow(row);
      const expired = isRegistrationExpired(mapped.registrationExpiry);
      if (mode === 'edit' && expired) resolvedMode = 'view';
      setRegistrationRecordId(mapped.id);
      setRegistrationEditMode(resolvedMode === 'edit');
      setRegistrationForm({
        companyId: mapped.companyId || profileCompanyId || '',
        companyVehicleId: mapped.companyVehicleId || String(profileVehicleId || ''),
        registrationNumber: mapped.registrationNumber,
        registrationDate: mapped.registrationDate,
        registrationExpiry: mapped.registrationExpiry,
        registeringAuthority: mapped.registeringAuthority,
        registrationState: mapped.registrationState,
        registrationCity: mapped.registrationCity,
        rcBookNumber: mapped.rcBookNumber,
        rcStatus: mapped.rcStatus,
        numberPlateTypeId: mapped.numberPlateTypeId,
        renewalReminderDays: mapped.renewalReminderDays,
        isCurrent: mapped.isCurrent,
        notes: mapped.notes,
      });
    }
    setRegistrationDialogMode(resolvedMode);
    setRegistrationDialogOpen(true);
  };
  const closeRegistrationDialog = () => {
    setRegistrationDialogOpen(false);
    setRegistrationDialogMode('create');
  };
  const deleteRegistrationRecord = async (row) => {
    const registrationId = String(row?.registrationId || row?.registration_id || row?.id || '');
    if (!token || !registrationId) return;
    if (isRegistrationExpired(row?.registrationExpiry || row?.registration_expiry)) {
      setRegistrationError('Expired vehicle registration is view-only.');
      return;
    }
    const ok = window.confirm(`Delete registration "${row?.registrationNumber || registrationId}"?`);
    if (!ok) return;
    try {
      await vehicleRegistrationService.delete(token, registrationId);
      setRegistrationSuccess('Vehicle registration deleted successfully.');
      const rows = rowsFrom(await vehicleRegistrationService.list(token, { companyVehicleId: profileVehicleId }));
      setRegistrationRows(rows);
      if (registrationRecordId === registrationId) closeRegistrationDialog();
    } catch (e) {
      setRegistrationError(e?.message || 'Failed to delete vehicle registration');
    }
  };
  const isExpiredDateText = (v) => isRegistrationExpired(v);
  const openInsuranceDialog = async (mode, row = null) => {
    setInsuranceError('');
    setInsuranceSuccess('');
    let resolvedMode = mode;
    if (mode === 'create') {
      const selected = companyVehicleById[String(profileVehicleId)] || {};
      const companyVehicleId = String(profileVehicleId || '');
      let prefill = null;
      try {
        if (companyVehicleId) prefill = await vehicleInsuranceService.prefillByCompanyVehicle(token, companyVehicleId);
      } catch {
        prefill = null;
      }
      setInsuranceRecordId('');
      setInsuranceEditMode(true);
      setInsuranceForm((prev) => ({
        ...prev,
        companyId: String(prefill?.companyId || selected?.companyId || profileCompanyId || prev.companyId || ''),
        companyVehicleId,
        insuranceCompany: prefill?.insuranceCompany || '',
        policyNumber: prefill?.policyNumber || '',
        insuranceTypeId: prefill?.insuranceTypeId != null ? String(prefill.insuranceTypeId) : '',
        policyStartDate: prefill?.policyStartDate || '',
        policyExpiryDate: prefill?.policyExpiryDate || '',
      }));
    } else if (row) {
      const expired = isRegistrationExpired(row?.policyExpiryDate || row?.policy_expiry_date);
      if (mode === 'edit' && expired) resolvedMode = 'view';
      setInsuranceRecordId(String(row?.insuranceId || row?.insurance_id || row?.id || ''));
      setInsuranceEditMode(resolvedMode === 'edit');
      setInsuranceForm((prev) => ({
        ...prev,
        companyId: String(row?.companyId || row?.company_id || profileCompanyId || prev.companyId || ''),
        companyVehicleId: String(row?.companyVehicleId || row?.companyvehicleId || row?.companyvehicle_id || profileVehicleId || ''),
        insuranceCompany: row?.insuranceCompany || row?.insurance_company || '',
        policyNumber: row?.policyNumber || row?.policy_number || '',
        insuranceTypeId: row?.insuranceTypeId != null ? String(row.insuranceTypeId) : (row?.insurance_type_id != null ? String(row.insurance_type_id) : ''),
        policyStartDate: row?.policyStartDate || row?.policy_start_date || '',
        policyExpiryDate: row?.policyExpiryDate || row?.policy_expiry_date || '',
        idvAmount: row?.idvAmount != null ? String(row.idvAmount) : (row?.idv_amount != null ? String(row.idv_amount) : ''),
        premiumAmount: row?.premiumAmount != null ? String(row.premiumAmount) : (row?.premium_amount != null ? String(row.premium_amount) : ''),
        paymentMode: row?.paymentMode || row?.payment_mode || '',
        paymentDate: row?.paymentDate || row?.payment_date || '',
        agentName: row?.agentName || row?.agent_name || '',
        agentContact: row?.agentContact || row?.agent_contact || '',
        agentEmail: row?.agentEmail || row?.agent_email || '',
        nomineeName: row?.nomineeName || row?.nominee_name || '',
        addOnCovers: row?.addOnCovers || row?.add_on_covers || '',
        ncbPercent: row?.ncbPercent != null ? String(row.ncbPercent) : (row?.ncb_percent != null ? String(row.ncb_percent) : ''),
        claimCount: row?.claimCount != null ? String(row.claimCount) : (row?.claim_count != null ? String(row.claim_count) : ''),
        lastClaimDate: row?.lastClaimDate || row?.last_claim_date || '',
        lastClaimAmount: row?.lastClaimAmount != null ? String(row.lastClaimAmount) : (row?.last_claim_amount != null ? String(row.last_claim_amount) : ''),
        renewalReminderDays: row?.renewalReminderDays != null ? String(row.renewalReminderDays) : (row?.renewal_reminder_days != null ? String(row.renewal_reminder_days) : '30'),
        insuranceStatus: row?.insuranceStatus || row?.insurance_status || 'Active',
        notes: row?.notes || '',
        isCurrent: (row?.isCurrent ?? row?.is_current ?? true) ? 'true' : 'false',
      }));
    }
    setInsuranceDialogMode(resolvedMode);
    setInsuranceDialogOpen(true);
  };
  const closeInsuranceDialog = () => setInsuranceDialogOpen(false);
  const deleteInsuranceRecord = async (row) => {
    const id = String(row?.insuranceId || row?.insurance_id || row?.id || '');
    if (!token || !id) return;
    if (isRegistrationExpired(row?.policyExpiryDate || row?.policy_expiry_date)) {
      setInsuranceError('Expired vehicle insurance is view-only.');
      return;
    }
    if (!window.confirm(`Delete insurance "${row?.policyNumber || id}"?`)) return;
    try {
      await vehicleInsuranceService.delete(token, id);
      setInsuranceSuccess('Vehicle insurance deleted successfully.');
      const rows = rowsFrom(await vehicleInsuranceService.list(token, { companyVehicleId: profileVehicleId }));
      setInsuranceRows(rows);
      if (insuranceRecordId === id) closeInsuranceDialog();
    } catch (e) {
      setInsuranceError(e?.message || 'Failed to delete vehicle insurance');
    }
  };

  const openFitnessDialog = async (mode, row = null) => {
    setFitnessError('');
    setFitnessSuccess('');
    if (mode === 'create') {
      const selected = companyVehicleById[String(profileVehicleId)] || {};
      const companyVehicleId = String(profileVehicleId || '');
      let prefill = null;
      try { if (companyVehicleId) prefill = await vehicleFitnessCertificateService.prefillByCompanyVehicle(token, companyVehicleId); } catch { prefill = null; }
      setFitnessRecordId('');
      setFitnessEditMode(true);
      setFitnessForm((prev) => ({
        ...prev,
        companyId: String(prefill?.companyId || selected?.companyId || profileCompanyId || prev.companyId || ''),
        companyVehicleId,
        certificateNumber: prefill?.certificateNumber || '',
        issueDate: prefill?.issueDate || '',
        expiryDate: prefill?.expiryDate || '',
      }));
    } else if (row) {
      setFitnessRecordId(String(row?.fitnessId || row?.fitness_id || row?.id || ''));
      setFitnessEditMode(mode === 'edit');
      setFitnessForm((prev) => ({
        ...prev,
        companyId: String(row?.companyId || row?.company_id || profileCompanyId || prev.companyId || ''),
        companyVehicleId: String(row?.companyVehicleId || row?.companyvehicleId || row?.companyvehicle_id || profileVehicleId || ''),
        certificateNumber: row?.certificateNumber || row?.certificate_number || '',
        issuingAuthority: row?.issuingAuthority || row?.issuing_authority || '',
        inspectionCenter: row?.inspectionCenter || row?.inspection_center || '',
        inspectorId: row?.inspectorId || row?.inspector_id || '',
        inspectorName: row?.inspectorName || row?.inspector_name || '',
        issueDate: row?.issueDate || row?.issue_date || '',
        expiryDate: row?.expiryDate || row?.expiry_date || '',
        validityDurationYears: row?.validityDurationYears != null ? String(row.validityDurationYears) : (row?.validity_duration_years != null ? String(row.validity_duration_years) : ''),
        inspectionResultId: row?.inspectionResultId != null ? String(row.inspectionResultId) : (row?.inspection_result_id != null ? String(row.inspection_result_id) : ''),
        remarks: row?.remarks || '',
        renewalReminderDays: row?.renewalReminderDays != null ? String(row.renewalReminderDays) : (row?.renewal_reminder_days != null ? String(row.renewal_reminder_days) : '30'),
        fitnessStatus: row?.fitnessStatus || row?.fitness_status || 'Valid',
        isCurrent: (row?.isCurrent ?? row?.is_current ?? true) ? 'true' : 'false',
      }));
    }
    setFitnessDialogMode(mode);
    setFitnessDialogOpen(true);
  };
  const closeFitnessDialog = () => setFitnessDialogOpen(false);
  const deleteFitnessRecord = async (row) => {
    const id = String(row?.fitnessId || row?.fitness_id || row?.id || '');
    if (!token || !id) return;
    if (!window.confirm(`Delete fitness certificate "${row?.certificateNumber || id}"?`)) return;
    try {
      await vehicleFitnessCertificateService.delete(token, id);
      setFitnessSuccess('Vehicle fitness certificate deleted successfully.');
      const rows = rowsFrom(await vehicleFitnessCertificateService.list(token, { companyVehicleId: profileVehicleId }));
      setFitnessRows(rows);
      if (fitnessRecordId === id) closeFitnessDialog();
    } catch (e) {
      setFitnessError(e?.message || 'Failed to delete vehicle fitness certificate');
    }
  };

  const openPucDialog = async (mode, row = null) => {
    setPucError('');
    setPucSuccess('');
    if (mode === 'create') {
      const selected = companyVehicleById[String(profileVehicleId)] || {};
      const companyVehicleId = String(profileVehicleId || '');
      let prefill = null;
      try { if (companyVehicleId) prefill = await vehiclePucService.prefillByCompanyVehicle(token, companyVehicleId); } catch { prefill = null; }
      setPucRecordId('');
      setPucEditMode(true);
      setPucForm((prev) => ({
        ...prev,
        companyId: String(prefill?.companyId || selected?.companyId || profileCompanyId || prev.companyId || ''),
        companyVehicleId,
        certificateNumber: prefill?.certificateNumber || '',
        issueDate: prefill?.issueDate || '',
        expiryDate: prefill?.expiryDate || '',
      }));
    } else if (row) {
      setPucRecordId(String(row?.pucId || row?.puc_id || row?.id || ''));
      setPucEditMode(mode === 'edit');
      setPucForm((prev) => ({
        ...prev,
        companyId: String(row?.companyId || row?.company_id || profileCompanyId || prev.companyId || ''),
        companyVehicleId: String(row?.companyVehicleId || row?.companyvehicleId || row?.companyvehicle_id || profileVehicleId || ''),
        certificateNumber: row?.certificateNumber || row?.certificate_number || '',
        issuingCenter: row?.issuingCenter || row?.issuing_center || '',
        issueDate: row?.issueDate || row?.issue_date || '',
        expiryDate: row?.expiryDate || row?.expiry_date || '',
        coEmissionPercent: row?.coEmissionPercent != null ? String(row.coEmissionPercent) : (row?.co_emission_percent != null ? String(row.co_emission_percent) : ''),
        hcEmissionPpm: row?.hcEmissionPpm != null ? String(row.hcEmissionPpm) : (row?.hc_emission_ppm != null ? String(row.hc_emission_ppm) : ''),
        testResult: row?.testResult || row?.test_result || 'Pass',
        pucStatus: row?.pucStatus || row?.puc_status || 'Valid',
        renewalReminderDays: row?.renewalReminderDays != null ? String(row.renewalReminderDays) : (row?.renewal_reminder_days != null ? String(row.renewal_reminder_days) : '15'),
        isCurrent: (row?.isCurrent ?? row?.is_current ?? true) ? 'true' : 'false',
      }));
    }
    setPucDialogMode(mode);
    setPucDialogOpen(true);
  };
  const closePucDialog = () => setPucDialogOpen(false);
  const deletePucRecord = async (row) => {
    const id = String(row?.pucId || row?.puc_id || row?.id || '');
    if (!token || !id) return;
    if (!window.confirm(`Delete emission test "${row?.certificateNumber || id}"?`)) return;
    try {
      await vehiclePucService.delete(token, id);
      setPucSuccess('Vehicle PUC deleted successfully.');
      const rows = rowsFrom(await vehiclePucService.list(token, { companyVehicleId: profileVehicleId }));
      setPucRows(rows);
      if (pucRecordId === id) closePucDialog();
    } catch (e) {
      setPucError(e?.message || 'Failed to delete vehicle PUC');
    }
  };

  const fetchNextIdentificationCode = async (companyId, typeId, fallback = '') => {
    if (!token || !companyId || !typeId) return fallback;
    try {
      const res = await companyVehicleService.nextIdentification(token, companyId, typeId);
      return res?.value || fallback;
    } catch {
      return fallback;
    }
  };

  const toCurrentOwnershipOptions = (rows, fallbackOwner) => {
    const options = rows.map((x) => {
      const ownerName = x.ownerName || x.owner_name || x.name || '';
      const ownerCode = x.ownerCode || x.owner_code || x.code || '';
      return {
        value: ownerName,
        label: ownerCode ? `${ownerName} (${ownerCode})` : ownerName,
      };
    }).filter((x) => x.value);
    if (fallbackOwner && !options.some((x) => x.value === fallbackOwner)) {
      return [{ value: fallbackOwner, label: fallbackOwner }, ...options];
    }
    return options;
  };

  const refreshCurrentOwnershipOptions = async (companyId, ownershipTypeId, fallbackOwner = '') => {
    if (!token || !ownershipTypeId) {
      setCurrentOwnershipOptions([]);
      return [];
    }
    try {
      const params = { ownershipTypeId };
      if (companyId) params.companyId = companyId;
      const rows = rowsFrom(await companyVehicleService.currentOwnershipOptions(token, params));
      const options = toCurrentOwnershipOptions(rows, fallbackOwner);
      setCurrentOwnershipOptions(options);
      return options;
    } catch {
      const fallback = fallbackOwner ? [{ value: fallbackOwner, label: fallbackOwner }] : [];
      setCurrentOwnershipOptions(fallback);
      return fallback;
    }
  };

  const companyOpts = useMemo(() => [{ value: '', label: 'All Companies' }, ...companies.map((c) => ({ value: String(c.id), label: c.name || c.code || c.id }))], [companies]);
  const companyFormOpts = useMemo(() => [{ value: '', label: 'Select Company' }, ...companies.map((c) => ({ value: String(c.id), label: c.name || c.code || c.id }))], [companies]);
  const departmentOptsByCompany = useMemo(() => {
    const map = {};
    departments.forEach((d) => {
      const key = String(d.companyId || '');
      (map[key] ??= []).push({ value: String(d.departmentId), label: d.departmentName || d.departmentCode || d.departmentId });
    });
    return map;
  }, [departments]);
  const categoryOpts = useMemo(() => [{ value: '', label: 'All Categories' }, ...categories.map((c) => ({ value: String(c.categoryId), label: c.categoryName || c.categoryCode || c.categoryId }))], [categories]);
  const categoryFormOpts = useMemo(() => [{ value: '', label: 'Select Category' }, ...categories.map((c) => ({ value: String(c.categoryId), label: c.categoryName || c.categoryCode || c.categoryId }))], [categories]);
  const manufacturerOpts = useMemo(
    () => [{ value: '', label: 'All Manufacture Brands' }, ...manufacturers.map((m) => ({ value: String(m.manufacturerId), label: m.manufacturerBrand || `${m.manufacturerName || '-'} (${m.country || '-'})` }))],
    [manufacturers]
  );
  const manufacturerFormOpts = useMemo(
    () => [{ value: '', label: 'Select Manufacture Brand' }, ...manufacturers.map((m) => ({ value: String(m.manufacturerId), label: m.manufacturerBrand || `${m.manufacturerName || '-'} (${m.country || '-'})` }))],
    [manufacturers]
  );
  const typeFormOpts = useMemo(() => [{ value: '', label: 'Select Type' }, ...vehicleTypes.map((t) => ({ value: String(t.typeId), label: t.typeName || t.typeCode || t.typeId }))], [vehicleTypes]);
  const vehicleModelDropdownOptsByCompany = useMemo(() => {
    const map = {};
    vehicles.forEach((v) => {
      const companyId = String(v.companyId || v.company_id || '');
      if (!companyId) return;
      const model = modelById[String(v.modelId)];
      const modelLabel = model?.modelName || model?.modelCode || v.modelId || '-';
      (map[companyId] ??= []).push({
        value: String(v.vehicleId),
        label: `${modelLabel} | ${v.chassisNumber || '-'} | ${v.registrationNumber || '-'}`,
      });
    });
    return map;
  }, [vehicles, modelById]);
  const distributorOpts = useMemo(() => [{ value: '', label: 'Select Distributor' }, ...distributors.map((d) => ({ value: String(d.distributorId), label: d.distributorName || d.distributorCode || d.distributorId }))], [distributors]);
  const ownershipOpts = useMemo(() => [{ value: '', label: 'Select Ownership' }, ...ownershipTypes.map((x) => ({ value: String(x.id), label: x.name }))], [ownershipTypes]);
  const currentOwnershipOpts = useMemo(() => [{ value: '', label: 'Select Current Ownership' }, ...currentOwnershipOptions], [currentOwnershipOptions]);
  const operationalOpts = useMemo(() => [{ value: '', label: 'Select Operational Status' }, ...operationalStatuses.map((x) => ({ value: String(x.id), label: x.name }))], [operationalStatuses]);
  const numberPlateTypeOpts = useMemo(() => [{ value: '', label: 'Select Number Plate Type' }, ...numberPlateTypes.map((x) => ({ value: String(x.id), label: x.name }))], [numberPlateTypes]);
  const insuranceTypeOpts = useMemo(() => [{ value: '', label: 'Select Insurance Type' }, ...insuranceTypes.map((x) => ({ value: String(x.id), label: x.name }))], [insuranceTypes]);
  const registrationDefaultNumberPlateTypeId = useMemo(() => {
    const normalized = (s) => String(s || '').trim().toLowerCase();
    const exact = numberPlateTypes.find((x) => normalized(x.name) === 'current standard');
    if (exact?.id != null) return String(exact.id);
    const contains = numberPlateTypes.find((x) => normalized(x.name).includes('current standard'));
    return contains?.id != null ? String(contains.id) : '';
  }, [numberPlateTypes]);
  useEffect(() => {
    if (!registrationDefaultNumberPlateTypeId) return;
    setRegistrationForm((prev) => (
      prev.numberPlateTypeId
        ? prev
        : { ...prev, numberPlateTypeId: registrationDefaultNumberPlateTypeId }
    ));
  }, [registrationDefaultNumberPlateTypeId]);
  const companyVehicleOptionsByCompany = useMemo(() => {
    const map = {};
    companyVehicleRows.forEach((r) => {
      const cid = String(r.companyId || r.company_id || '');
      const id = String(r.companyVehicleId || r.companyvehicleId || r.companyvehicle_id || r.id || '');
      if (!cid || !id) return;
      const label = `${r.keyNumber || r.key_number || '-'} | ${r.registrationNumber || r.registration_number || '-'} | ${r.chassisNumber || r.chassis_number || '-'}`;
      (map[cid] ??= []).push({ value: id, label });
    });
    return map;
  }, [companyVehicleRows]);
  const registrationVehicleOptions = useMemo(
    () => companyVehicleOptionsByCompany[String(registrationForm.companyId || '')] || [],
    [companyVehicleOptionsByCompany, registrationForm.companyId]
  );
  const profileDropdownMenuProps = useMemo(() => ({
    PaperProps: {
      sx: {
        maxHeight: 460,
        minWidth: 460,
      }
    }
  }), []);
  const handleRegistrationChange = async (key, value) => {
    setRegistrationError('');
    setRegistrationSuccess('');
    if (key === 'companyId') {
      setRegistrationAutoLoadBlockedVehicleId('');
      setRegistrationRecordId('');
      setRegistrationEditMode(true);
      setRegistrationForm((prev) => ({
        ...prev,
        companyId: String(value || ''),
        companyVehicleId: '',
        registrationNumber: '',
        registrationDate: '',
        registrationExpiry: '',
        registeringAuthority: '',
        registrationState: '',
        registrationCity: '',
        rcBookNumber: '',
        rcStatus: registrationDefaultRcStatus,
        numberPlateTypeId: registrationDefaultNumberPlateTypeId || '',
        renewalReminderDays: '',
        isCurrent: registrationDefaultIsCurrent,
        notes: '',
      }));
      return;
    }
    if (key === 'companyVehicleId') {
      setRegistrationAutoLoadBlockedVehicleId('');
      const selected = companyVehicleById[String(value || '')];
      const selectedVehicleId = String(value || '');
      if (!selectedVehicleId) {
        setRegistrationRecordId('');
        setRegistrationEditMode(true);
        setRegistrationForm((prev) => ({
          ...prev,
          companyVehicleId: '',
          registrationNumber: '',
          registrationDate: '',
          registrationExpiry: '',
          registeringAuthority: '',
          registrationState: '',
          registrationCity: '',
          rcBookNumber: '',
          rcStatus: registrationDefaultRcStatus,
          numberPlateTypeId: registrationDefaultNumberPlateTypeId || '',
          renewalReminderDays: '',
          isCurrent: registrationDefaultIsCurrent,
          notes: '',
        }));
        return;
      }
      try {
        const rows = rowsFrom(await vehicleRegistrationService.list(token, { companyVehicleId: selectedVehicleId }));
        const latest = rows[0] || null;
        if (latest) {
          setRegistrationRecordId(String(latest?.registrationId || latest?.registration_id || latest?.id || ''));
          setRegistrationEditMode(false);
          setRegistrationForm((prev) => ({
            ...prev,
            companyId: String(latest?.companyId || latest?.company_id || selected?.companyId || prev.companyId || ''),
            companyVehicleId: selectedVehicleId,
            registrationNumber: latest?.registrationNumber || latest?.registration_number || selected?.registrationNumber || selected?.registration_number || prev.registrationNumber || '',
            registrationDate: latest?.registrationDate || latest?.registration_date || '',
            registrationExpiry: latest?.registrationExpiry || latest?.registration_expiry || '',
            registeringAuthority: latest?.registeringAuthority || latest?.registering_authority || '',
            registrationState: latest?.registrationState || latest?.registration_state || '',
            registrationCity: latest?.registrationCity || latest?.registration_city || '',
            rcBookNumber: latest?.rcBookNumber || latest?.rc_book_number || '',
            rcStatus: latest?.rcStatus || latest?.rc_status || 'Valid',
            numberPlateTypeId: latest?.numberPlateTypeId != null
              ? String(latest.numberPlateTypeId)
              : (latest?.number_plate_type_id != null ? String(latest.number_plate_type_id) : ''),
            renewalReminderDays: latest?.renewalReminderDays != null
              ? String(latest.renewalReminderDays)
              : (latest?.renewal_reminder_days != null ? String(latest.renewal_reminder_days) : '30'),
            isCurrent: (latest?.isCurrent ?? latest?.is_current ?? true) ? 'true' : 'false',
            notes: latest?.notes || '',
          }));
          return;
        }
        setRegistrationRecordId('');
        setRegistrationEditMode(true);
        const prefill = await vehicleRegistrationService.prefillByCompanyVehicle(token, selectedVehicleId);
        setRegistrationForm((prev) => ({
          ...prev,
          companyId: String(prefill?.companyId || selected?.companyId || prev.companyId || ''),
          companyVehicleId: selectedVehicleId,
          registrationNumber: prefill?.registrationNumber || selected?.registrationNumber || selected?.registration_number || '',
          registrationDate: prefill?.registrationDate || '',
          registrationExpiry: prefill?.registrationExpiry || '',
          registeringAuthority: prefill?.registeringAuthority || '',
          registrationState: prefill?.registrationState || '',
          registrationCity: prefill?.registrationCity || '',
          rcBookNumber: prefill?.rcBookNumber || '',
          rcStatus: prefill?.rcStatus || registrationDefaultRcStatus,
          numberPlateTypeId: prefill?.numberPlateTypeId != null ? String(prefill.numberPlateTypeId) : (registrationDefaultNumberPlateTypeId || ''),
          renewalReminderDays: prefill?.renewalReminderDays != null ? String(prefill.renewalReminderDays) : '',
          isCurrent: prefill?.isCurrent == null ? registrationDefaultIsCurrent : (prefill.isCurrent ? 'true' : 'false'),
          notes: prefill?.notes || '',
        }));
      } catch {
        setRegistrationRecordId('');
        setRegistrationEditMode(true);
        setRegistrationForm((prev) => ({
          ...prev,
          companyVehicleId: selectedVehicleId,
          registrationNumber: selected?.registrationNumber || selected?.registration_number || '',
          registrationDate: '',
          registrationExpiry: '',
          registeringAuthority: '',
          registrationState: '',
          registrationCity: '',
          rcBookNumber: '',
          rcStatus: registrationDefaultRcStatus,
          numberPlateTypeId: registrationDefaultNumberPlateTypeId || '',
          renewalReminderDays: '',
          isCurrent: registrationDefaultIsCurrent,
          notes: '',
        }));
      }
      return;
    }
    setRegistrationForm((prev) => ({ ...prev, [key]: value }));
  };
  const submitRegistrationForm = async () => {
    if (!token) return;
    setRegistrationError('');
    setRegistrationSuccess('');
    if (registrationRecordId && isRegistrationExpired(registrationForm.registrationExpiry)) {
      setRegistrationError('Expired vehicle registration is view-only.');
      return;
    }
    try {
      setRegistrationSaving(true);
      const payload = {
        companyId: req(registrationForm.companyId),
        companyVehicleId: req(registrationForm.companyVehicleId),
        registrationNumber: req(registrationForm.registrationNumber),
        registrationDate: opt(registrationForm.registrationDate),
        registrationExpiry: opt(registrationForm.registrationExpiry),
        registeringAuthority: opt(registrationForm.registeringAuthority),
        registrationState: opt(registrationForm.registrationState),
        registrationCity: opt(registrationForm.registrationCity),
        rcBookNumber: opt(registrationForm.rcBookNumber),
        rcStatus: opt(registrationForm.rcStatus) || 'Valid',
        numberPlateTypeId: toInt(registrationForm.numberPlateTypeId),
        renewalReminderDays: toInt(registrationForm.renewalReminderDays) ?? 30,
        isCurrent: toBool(registrationForm.isCurrent),
        notes: opt(registrationForm.notes),
      };
      const saved = registrationRecordId
        ? await vehicleRegistrationService.update(token, registrationRecordId, payload)
        : await vehicleRegistrationService.create(token, payload);
      setRegistrationSuccess(registrationRecordId ? 'Vehicle registration updated successfully.' : 'Vehicle registration saved successfully.');
      setRegistrationRecordId(String(saved?.registrationId || saved?.registration_id || saved?.id || registrationRecordId || ''));
      setRegistrationEditMode(false);
      const updatedCompanyVehicleId = String(saved?.companyVehicleId || saved?.companyvehicleId || saved?.companyvehicle_id || registrationForm.companyVehicleId || '');
      if (updatedCompanyVehicleId) {
        const rows = rowsFrom(await vehicleRegistrationService.list(token, { companyVehicleId: updatedCompanyVehicleId }));
        setRegistrationRows(rows);
      }
      closeRegistrationDialog();
      const savedCompanyVehicleId = String(saved?.companyVehicleId || saved?.companyvehicleId || saved?.companyvehicle_id || registrationForm.companyVehicleId || '');
      const savedRegistrationNumber = saved?.registrationNumber || saved?.registration_number || registrationForm.registrationNumber || '';
      if (savedCompanyVehicleId) {
        setCompanyVehicleRows((prev) => prev.map((row) => {
          const rowId = String(getCompanyVehicleRecordId(row));
          if (rowId !== savedCompanyVehicleId) return row;
          return {
            ...row,
            registrationNumber: savedRegistrationNumber,
            registration_number: savedRegistrationNumber,
          };
        }));
      }
    } catch (e) {
      setRegistrationError(e?.message || 'Failed to save vehicle registration');
    } finally {
      setRegistrationSaving(false);
    }
  };
  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!token || activeTab !== 2 || profileInnerTab !== 2 || !profileVehicleId) {
        if (!ignore) setInsuranceRows([]);
        return;
      }
      setInsuranceRowsLoading(true);
      try {
        const rows = rowsFrom(await vehicleInsuranceService.list(token, { companyVehicleId: profileVehicleId }));
        if (!ignore) setInsuranceRows(rows);
      } catch {
        if (!ignore) setInsuranceRows([]);
      } finally {
        if (!ignore) setInsuranceRowsLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [token, activeTab, profileInnerTab, profileVehicleId, profileReloadSeed]);

  const handleInsuranceChange = async (key, value) => {
    setInsuranceError('');
    setInsuranceSuccess('');
    if (key === 'companyId') {
      setInsuranceRecordId('');
      setInsuranceEditMode(true);
      setInsuranceForm((prev) => ({
        ...prev,
        companyId: String(value || ''),
        companyVehicleId: '',
        insuranceCompany: '',
        policyNumber: '',
        insuranceTypeId: '',
        policyStartDate: '',
        policyExpiryDate: '',
        idvAmount: '',
        premiumAmount: '',
        paymentMode: '',
        paymentDate: '',
        agentName: '',
        agentContact: '',
        agentEmail: '',
        nomineeName: '',
        addOnCovers: '',
        ncbPercent: '',
        claimCount: '',
        lastClaimDate: '',
        lastClaimAmount: '',
        renewalReminderDays: '30',
        insuranceStatus: 'Active',
        notes: '',
        isCurrent: 'true',
      }));
      return;
    }
    if (key === 'companyVehicleId') {
      const selectedVehicleId = String(value || '');
      if (!selectedVehicleId) {
        setInsuranceRecordId('');
        setInsuranceEditMode(true);
        setInsuranceForm((prev) => ({
          ...prev,
          companyVehicleId: '',
          insuranceCompany: '',
          policyNumber: '',
          insuranceTypeId: '',
          policyStartDate: '',
          policyExpiryDate: '',
          idvAmount: '',
          premiumAmount: '',
          paymentMode: '',
          paymentDate: '',
          agentName: '',
          agentContact: '',
          agentEmail: '',
          nomineeName: '',
          addOnCovers: '',
          ncbPercent: '',
          claimCount: '',
          lastClaimDate: '',
          lastClaimAmount: '',
          renewalReminderDays: '30',
          insuranceStatus: 'Active',
          notes: '',
          isCurrent: 'true',
        }));
        return;
      }
      try {
        const rows = rowsFrom(await vehicleInsuranceService.list(token, { companyVehicleId: selectedVehicleId }));
        const latest = rows[0] || null;
        if (latest) {
          setInsuranceRecordId(String(latest?.insuranceId || latest?.insurance_id || latest?.id || ''));
          setInsuranceEditMode(false);
          setInsuranceForm((prev) => ({
            ...prev,
            companyVehicleId: selectedVehicleId,
            insuranceCompany: latest?.insuranceCompany || latest?.insurance_company || '',
            policyNumber: latest?.policyNumber || latest?.policy_number || '',
            insuranceTypeId: latest?.insuranceTypeId != null ? String(latest.insuranceTypeId) : (latest?.insurance_type_id != null ? String(latest.insurance_type_id) : ''),
            policyStartDate: latest?.policyStartDate || latest?.policy_start_date || '',
            policyExpiryDate: latest?.policyExpiryDate || latest?.policy_expiry_date || '',
            idvAmount: latest?.idvAmount != null ? String(latest.idvAmount) : (latest?.idv_amount != null ? String(latest.idv_amount) : ''),
            premiumAmount: latest?.premiumAmount != null ? String(latest.premiumAmount) : (latest?.premium_amount != null ? String(latest.premium_amount) : ''),
            paymentMode: latest?.paymentMode || latest?.payment_mode || '',
            paymentDate: latest?.paymentDate || latest?.payment_date || '',
            agentName: latest?.agentName || latest?.agent_name || '',
            agentContact: latest?.agentContact || latest?.agent_contact || '',
            agentEmail: latest?.agentEmail || latest?.agent_email || '',
            nomineeName: latest?.nomineeName || latest?.nominee_name || '',
            addOnCovers: latest?.addOnCovers || latest?.add_on_covers || '',
            ncbPercent: latest?.ncbPercent != null ? String(latest.ncbPercent) : (latest?.ncb_percent != null ? String(latest.ncb_percent) : ''),
            claimCount: latest?.claimCount != null ? String(latest.claimCount) : (latest?.claim_count != null ? String(latest.claim_count) : ''),
            lastClaimDate: latest?.lastClaimDate || latest?.last_claim_date || '',
            lastClaimAmount: latest?.lastClaimAmount != null ? String(latest.lastClaimAmount) : (latest?.last_claim_amount != null ? String(latest.last_claim_amount) : ''),
            renewalReminderDays: latest?.renewalReminderDays != null ? String(latest.renewalReminderDays) : (latest?.renewal_reminder_days != null ? String(latest.renewal_reminder_days) : '30'),
            insuranceStatus: latest?.insuranceStatus || latest?.insurance_status || 'Active',
            notes: latest?.notes || '',
            isCurrent: (latest?.isCurrent ?? latest?.is_current ?? true) ? 'true' : 'false',
          }));
          return;
        }
        const prefill = await vehicleInsuranceService.prefillByCompanyVehicle(token, selectedVehicleId);
        setInsuranceRecordId('');
        setInsuranceEditMode(true);
        setInsuranceForm((prev) => ({
          ...prev,
          companyVehicleId: selectedVehicleId,
          insuranceCompany: prefill?.insuranceCompany || '',
          policyNumber: prefill?.policyNumber || '',
          insuranceTypeId: prefill?.insuranceTypeId != null ? String(prefill.insuranceTypeId) : '',
          policyStartDate: prefill?.policyStartDate || '',
          policyExpiryDate: prefill?.policyExpiryDate || '',
          idvAmount: prefill?.idvAmount != null ? String(prefill.idvAmount) : '',
          premiumAmount: prefill?.premiumAmount != null ? String(prefill.premiumAmount) : '',
          paymentMode: prefill?.paymentMode || '',
          paymentDate: prefill?.paymentDate || '',
          agentName: prefill?.agentName || '',
          agentContact: prefill?.agentContact || '',
          agentEmail: prefill?.agentEmail || '',
          nomineeName: prefill?.nomineeName || '',
          addOnCovers: prefill?.addOnCovers || '',
          ncbPercent: prefill?.ncbPercent != null ? String(prefill.ncbPercent) : '',
          claimCount: prefill?.claimCount != null ? String(prefill.claimCount) : '',
          lastClaimDate: prefill?.lastClaimDate || '',
          lastClaimAmount: prefill?.lastClaimAmount != null ? String(prefill.lastClaimAmount) : '',
          renewalReminderDays: prefill?.renewalReminderDays != null ? String(prefill.renewalReminderDays) : '30',
          insuranceStatus: prefill?.insuranceStatus || 'Active',
          notes: prefill?.notes || '',
          isCurrent: prefill?.isCurrent == null ? 'true' : (prefill.isCurrent ? 'true' : 'false'),
        }));
      } catch {
        setInsuranceRecordId('');
        setInsuranceEditMode(true);
      }
      return;
    }
    setInsuranceForm((prev) => ({ ...prev, [key]: value }));
  };

  const submitInsuranceForm = async () => {
    if (!token) return;
    setInsuranceError('');
    setInsuranceSuccess('');
    if (insuranceRecordId && isRegistrationExpired(insuranceForm.policyExpiryDate)) {
      setInsuranceError('Expired vehicle insurance is view-only.');
      return;
    }
    try {
      setInsuranceSaving(true);
      const payload = {
        companyId: req(insuranceForm.companyId),
        companyVehicleId: req(insuranceForm.companyVehicleId),
        insuranceCompany: req(insuranceForm.insuranceCompany),
        policyNumber: req(insuranceForm.policyNumber),
        insuranceTypeId: toInt(insuranceForm.insuranceTypeId),
        policyStartDate: req(insuranceForm.policyStartDate),
        policyExpiryDate: req(insuranceForm.policyExpiryDate),
        idvAmount: toDecimal(insuranceForm.idvAmount),
        premiumAmount: toDecimal(insuranceForm.premiumAmount),
        paymentMode: opt(insuranceForm.paymentMode),
        paymentDate: opt(insuranceForm.paymentDate),
        agentName: opt(insuranceForm.agentName),
        agentContact: opt(insuranceForm.agentContact),
        agentEmail: opt(insuranceForm.agentEmail),
        nomineeName: opt(insuranceForm.nomineeName),
        addOnCovers: opt(insuranceForm.addOnCovers),
        ncbPercent: toDecimal(insuranceForm.ncbPercent),
        claimCount: toInt(insuranceForm.claimCount),
        lastClaimDate: opt(insuranceForm.lastClaimDate),
        lastClaimAmount: toDecimal(insuranceForm.lastClaimAmount),
        renewalReminderDays: toInt(insuranceForm.renewalReminderDays) ?? 30,
        insuranceStatus: opt(insuranceForm.insuranceStatus) || 'Active',
        notes: opt(insuranceForm.notes),
        isCurrent: toBool(insuranceForm.isCurrent),
      };
      const saved = insuranceRecordId
        ? await vehicleInsuranceService.update(token, insuranceRecordId, payload)
        : await vehicleInsuranceService.create(token, payload);
      setInsuranceSuccess(insuranceRecordId ? 'Vehicle insurance updated successfully.' : 'Vehicle insurance saved successfully.');
      setInsuranceRecordId(String(saved?.insuranceId || saved?.insurance_id || saved?.id || insuranceRecordId || ''));
      setInsuranceEditMode(false);
      const vehicleId = String(saved?.companyVehicleId || saved?.companyvehicleId || saved?.companyvehicle_id || insuranceForm.companyVehicleId || '');
      if (vehicleId) {
        const rows = rowsFrom(await vehicleInsuranceService.list(token, { companyVehicleId: vehicleId }));
        setInsuranceRows(rows);
      }
      closeInsuranceDialog();
    } catch (e) {
      setInsuranceError(e?.message || 'Failed to save vehicle insurance');
    } finally {
      setInsuranceSaving(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!token || activeTab !== 2 || profileInnerTab !== 3 || !profileVehicleId) {
        if (!ignore) setFitnessRows([]);
        return;
      }
      setFitnessRowsLoading(true);
      try {
        const rows = rowsFrom(await vehicleFitnessCertificateService.list(token, { companyVehicleId: profileVehicleId }));
        if (!ignore) setFitnessRows(rows);
      } catch {
        if (!ignore) setFitnessRows([]);
      } finally {
        if (!ignore) setFitnessRowsLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [token, activeTab, profileInnerTab, profileVehicleId, profileReloadSeed]);

  const handleFitnessChange = (key, value) => {
    setFitnessError('');
    setFitnessSuccess('');
    if (key === 'companyId') {
      setFitnessRecordId('');
      setFitnessEditMode(true);
      setFitnessForm((prev) => ({
        ...prev,
        companyId: String(value || ''),
        companyVehicleId: '',
      }));
      return;
    }
    if (key === 'companyVehicleId') {
      setFitnessRecordId('');
      setFitnessEditMode(true);
      setFitnessForm((prev) => ({
        ...prev,
        companyVehicleId: String(value || ''),
      }));
      return;
    }
    setFitnessForm((prev) => ({ ...prev, [key]: value }));
  };

  const submitFitnessForm = async () => {
    if (!token) return;
    setFitnessError('');
    setFitnessSuccess('');
    try {
      setFitnessSaving(true);
      const payload = {
        companyId: req(fitnessForm.companyId),
        companyVehicleId: req(fitnessForm.companyVehicleId),
        certificateNumber: req(fitnessForm.certificateNumber),
        issuingAuthority: opt(fitnessForm.issuingAuthority),
        inspectionCenter: opt(fitnessForm.inspectionCenter),
        inspectorId: opt(fitnessForm.inspectorId),
        inspectorName: opt(fitnessForm.inspectorName),
        issueDate: req(fitnessForm.issueDate),
        expiryDate: req(fitnessForm.expiryDate),
        validityDurationYears: toInt(fitnessForm.validityDurationYears),
        inspectionResultId: toInt(fitnessForm.inspectionResultId),
        remarks: opt(fitnessForm.remarks),
        renewalReminderDays: toInt(fitnessForm.renewalReminderDays) ?? 30,
        fitnessStatus: opt(fitnessForm.fitnessStatus) || 'Valid',
        isCurrent: toBool(fitnessForm.isCurrent),
      };
      const saved = fitnessRecordId
        ? await vehicleFitnessCertificateService.update(token, fitnessRecordId, payload)
        : await vehicleFitnessCertificateService.create(token, payload);
      setFitnessSuccess(fitnessRecordId ? 'Vehicle fitness certificate updated successfully.' : 'Vehicle fitness certificate saved successfully.');
      setFitnessRecordId(String(saved?.fitnessId || saved?.fitness_id || saved?.id || fitnessRecordId || ''));
      setFitnessEditMode(false);
      const vehicleId = String(saved?.companyVehicleId || saved?.companyvehicleId || saved?.companyvehicle_id || fitnessForm.companyVehicleId || '');
      if (vehicleId) {
        const rows = rowsFrom(await vehicleFitnessCertificateService.list(token, { companyVehicleId: vehicleId }));
        setFitnessRows(rows);
      }
      closeFitnessDialog();
    } catch (e) {
      setFitnessError(e?.message || 'Failed to save vehicle fitness certificate');
    } finally {
      setFitnessSaving(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!token || activeTab !== 2 || profileInnerTab !== 4 || !profileVehicleId) {
        if (!ignore) setPucRows([]);
        return;
      }
      setPucRowsLoading(true);
      try {
        const rows = rowsFrom(await vehiclePucService.list(token, { companyVehicleId: profileVehicleId }));
        if (!ignore) setPucRows(rows);
      } catch {
        if (!ignore) setPucRows([]);
      } finally {
        if (!ignore) setPucRowsLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [token, activeTab, profileInnerTab, profileVehicleId, profileReloadSeed]);

  const handlePucChange = (key, value) => {
    setPucError('');
    setPucSuccess('');
    if (key === 'companyId') {
      setPucRecordId('');
      setPucEditMode(true);
      setPucForm((prev) => ({
        ...prev,
        companyId: String(value || ''),
        companyVehicleId: '',
      }));
      return;
    }
    if (key === 'companyVehicleId') {
      setPucRecordId('');
      setPucEditMode(true);
      setPucForm((prev) => ({
        ...prev,
        companyVehicleId: String(value || ''),
      }));
      return;
    }
    setPucForm((prev) => ({ ...prev, [key]: value }));
  };

  const submitPucForm = async () => {
    if (!token) return;
    setPucError('');
    setPucSuccess('');
    try {
      setPucSaving(true);
      const payload = {
        companyId: req(pucForm.companyId),
        companyVehicleId: req(pucForm.companyVehicleId),
        certificateNumber: req(pucForm.certificateNumber),
        issuingCenter: opt(pucForm.issuingCenter),
        issueDate: req(pucForm.issueDate),
        expiryDate: req(pucForm.expiryDate),
        coEmissionPercent: toDecimal(pucForm.coEmissionPercent),
        hcEmissionPpm: toDecimal(pucForm.hcEmissionPpm),
        testResult: opt(pucForm.testResult) || 'Pass',
        pucStatus: opt(pucForm.pucStatus) || 'Valid',
        renewalReminderDays: toInt(pucForm.renewalReminderDays) ?? 15,
        isCurrent: toBool(pucForm.isCurrent),
      };
      const saved = pucRecordId
        ? await vehiclePucService.update(token, pucRecordId, payload)
        : await vehiclePucService.create(token, payload);
      setPucSuccess(pucRecordId ? 'Vehicle PUC updated successfully.' : 'Vehicle PUC saved successfully.');
      setPucRecordId(String(saved?.pucId || saved?.puc_id || saved?.id || pucRecordId || ''));
      setPucEditMode(false);
      const vehicleId = String(saved?.companyVehicleId || saved?.companyvehicleId || saved?.companyvehicle_id || pucForm.companyVehicleId || '');
      if (vehicleId) {
        const rows = rowsFrom(await vehiclePucService.list(token, { companyVehicleId: vehicleId }));
        setPucRows(rows);
      }
      closePucDialog();
    } catch (e) {
      setPucError(e?.message || 'Failed to save vehicle PUC');
    } finally {
      setPucSaving(false);
    }
  };

  const vehiclesByCompany = useMemo(() => {
    const map = {};
    vehicles.forEach((v) => {
      const cid = String(v.companyId || v.company_id || '');
      if (!cid) return;
      (map[cid] ??= []).push(v);
    });
    return map;
  }, [vehicles]);
  const firstVehicleFormPrefill = useMemo(() => {
    const ownCompanyId = String(own?.companyId || '');
    const firstVehicle = (ownCompanyId ? (vehiclesByCompany[ownCompanyId]?.[0] || null) : null) || vehicles?.[0];
    if (!firstVehicle) return own || {};

    const selectedModel = modelById[String(firstVehicle.modelId)];
    const selectedTypeId = String(firstVehicle.typeId || selectedModel?.typeId || '');
    const selectedCategory = categoryById[String(firstVehicle.categoryId || selectedModel?.categoryId)];
    const selectedManufacturer = manufacturerById[String(firstVehicle.manufacturerId || selectedModel?.manufacturerId)];
    const companyId = firstVehicle.companyId || firstVehicle.company_id || own?.companyId || '';
    const companyCode = firstVehicle.companyCode || firstVehicle.company_code || companyById[String(companyId)]?.code || own?.companyCode || '';

    return {
      ...(own || {}),
      companyId: companyId ? String(companyId) : '',
      companyCode: companyCode || '',
      vehicleModelRef: firstVehicle.vehicleId ? String(firstVehicle.vehicleId) : '',
      companyVehicleModel: firstVehicle.modelId ? String(firstVehicle.modelId) : '',
      companyVehicleType: selectedTypeId || '',
      categoryId: selectedCategory?.categoryId ? String(selectedCategory.categoryId) : '',
      companyVehicleManufactureBrand: selectedManufacturer?.manufacturerId ? String(selectedManufacturer.manufacturerId) : '',
      distributorId: firstVehicle.distributorId ? String(firstVehicle.distributorId) : '',
      registrationNumber: firstVehicle.registrationNumber || '',
      chassisNumber: firstVehicle.chassisNumber || '',
      engineNumber: firstVehicle.engineNumber || '',
      keyNumber: firstVehicle.keyNumber || '',
    };
  }, [vehicles, vehiclesByCompany, own, modelById, categoryById, manufacturerById, companyById]);
  const getRecordValue = (rec, ...keys) => {
    for (const key of keys) {
      if (rec?.[key] !== undefined && rec?.[key] !== null && String(rec[key]).trim() !== '') return rec[key];
    }
    return null;
  };
  const profileView = useMemo(() => {
    if (!profileData) return null;
    const companyId = String(getRecordValue(profileData, 'companyId', 'company_id') || '');
    const departmentId = String(getRecordValue(profileData, 'companyDepartment', 'company_department') || '');
    const typeId = String(getRecordValue(profileData, 'companyVehicleType', 'companyvehicle_type') || '');
    const modelId = String(getRecordValue(profileData, 'companyVehicleModel', 'companyvehicle_model') || '');
    const manufactureId = String(getRecordValue(profileData, 'companyVehicleManufacture', 'companyvehicle_manufacture') || '');
    const categoryId = String(getRecordValue(profileData, 'categoryId', 'companyVehicleCategory', 'companyvehicle_category') || '');
    const distributorId = String(getRecordValue(profileData, 'distributorId', 'distributor_id') || '');
    const ownershipTypeId = String(getRecordValue(profileData, 'ownershipTypeId', 'ownership_type_id') || '');
    const operationalStatusId = String(getRecordValue(profileData, 'operationalStatusId', 'operational_status_id') || '');
    return {
      identifyCode: getRecordValue(profileData, 'keyNumber', 'key_number') || '-',
      registrationNumber: getRecordValue(profileData, 'registrationNumber', 'registration_number') || '-',
      chassisNumber: getRecordValue(profileData, 'chassisNumber', 'chassis_number') || '-',
      engineNumber: getRecordValue(profileData, 'engineNumber', 'engine_number') || '-',
      company: companyById[companyId]?.name || getRecordValue(profileData, 'companyCode', 'company_code') || '-',
      department: departmentById[departmentId]?.departmentName || '-',
      vehicleType: vehicleTypes.find((x) => String(x.typeId) === typeId)?.typeName || '-',
      model: getRecordValue(profileData, 'companyVehicleModelName', 'companyvehicle_model_name') || modelById[modelId]?.modelName || '-',
      brand: getRecordValue(profileData, 'companyVehicleManufactureBrand', 'companyvehicle_manufacture_brand') || manufacturerById[manufactureId]?.manufacturerBrand || '-',
      category: categoryById[categoryId]?.categoryName || '-',
      distributor: distributorById[distributorId]?.distributorName || '-',
      ownership: ownershipById[ownershipTypeId] || '-',
      currentOwnership: getRecordValue(profileData, 'currentOwnership', 'current_ownership') || '-',
      operational: operationalById[operationalStatusId] || '-',
      status: getRecordValue(profileData, 'isActive', 'is_active') ? 'Active' : 'Inactive',
      year: getRecordValue(profileData, 'manufactureYear', 'manufacture_year') || '-',
      color: getRecordValue(profileData, 'color') || '-',
      condition: getRecordValue(profileData, 'vehicleCondition', 'vehicle_condition') || '-',
      odometer: getRecordValue(profileData, 'currentOdometerKm', 'current_odometer_km') || '0',
      engineHours: getRecordValue(profileData, 'totalEngineHours', 'total_engine_hours') || '0',
      notes: getRecordValue(profileData, 'notes') || '-',
    };
  }, [profileData, companyById, departmentById, vehicleTypes, modelById, manufacturerById, categoryById, distributorById, ownershipById, operationalById]);
  const profileRegistrationView = useMemo(() => {
    if (!profileRegistrationData) return null;
    return {
      registrationNumber: getRecordValue(profileRegistrationData, 'registrationNumber', 'registration_number') || '-',
      registrationDate: getRecordValue(profileRegistrationData, 'registrationDate', 'registration_date') || '-',
      registrationExpiry: getRecordValue(profileRegistrationData, 'registrationExpiry', 'registration_expiry') || '-',
      rcStatus: getRecordValue(profileRegistrationData, 'rcStatus', 'rc_status') || '-',
      registeringAuthority: getRecordValue(profileRegistrationData, 'registeringAuthority', 'registering_authority') || '-',
      registrationCity: getRecordValue(profileRegistrationData, 'registrationCity', 'registration_city') || '-',
      registrationState: getRecordValue(profileRegistrationData, 'registrationState', 'registration_state') || '-',
      rcBookNumber: getRecordValue(profileRegistrationData, 'rcBookNumber', 'rc_book_number') || '-',
      renewalReminderDays: getRecordValue(profileRegistrationData, 'renewalReminderDays', 'renewal_reminder_days') || '-',
      isCurrent: getRecordValue(profileRegistrationData, 'isCurrent', 'is_current') === false ? 'No' : 'Yes',
    };
  }, [profileRegistrationData]);
  const profileInsuranceView = useMemo(() => {
    if (!profileInsuranceData) return null;
    return {
      insuranceCompany: getRecordValue(profileInsuranceData, 'insuranceCompany', 'insurance_company') || '-',
      policyNumber: getRecordValue(profileInsuranceData, 'policyNumber', 'policy_number') || '-',
      policyStartDate: getRecordValue(profileInsuranceData, 'policyStartDate', 'policy_start_date') || '-',
      policyExpiryDate: getRecordValue(profileInsuranceData, 'policyExpiryDate', 'policy_expiry_date') || '-',
      insuranceStatus: getRecordValue(profileInsuranceData, 'insuranceStatus', 'insurance_status') || '-',
      premiumAmount: getRecordValue(profileInsuranceData, 'premiumAmount', 'premium_amount') || '-',
      insuranceType: insuranceTypes.find((x) => String(x.id) === String(getRecordValue(profileInsuranceData, 'insuranceTypeId', 'insurance_type_id') || ''))?.name || '-',
      isCurrent: getRecordValue(profileInsuranceData, 'isCurrent', 'is_current') === false ? 'No' : 'Yes',
    };
  }, [profileInsuranceData, insuranceTypes]);
  const profileFitnessView = useMemo(() => {
    if (!profileFitnessData) return null;
    return {
      certificateNumber: getRecordValue(profileFitnessData, 'certificateNumber', 'certificate_number') || '-',
      issuingAuthority: getRecordValue(profileFitnessData, 'issuingAuthority', 'issuing_authority') || '-',
      issueDate: getRecordValue(profileFitnessData, 'issueDate', 'issue_date') || '-',
      expiryDate: getRecordValue(profileFitnessData, 'expiryDate', 'expiry_date') || '-',
      fitnessStatus: getRecordValue(profileFitnessData, 'fitnessStatus', 'fitness_status') || '-',
      inspectionCenter: getRecordValue(profileFitnessData, 'inspectionCenter', 'inspection_center') || '-',
      isCurrent: getRecordValue(profileFitnessData, 'isCurrent', 'is_current') === false ? 'No' : 'Yes',
    };
  }, [profileFitnessData]);
  const profilePucView = useMemo(() => {
    if (!profilePucData) return null;
    return {
      certificateNumber: getRecordValue(profilePucData, 'certificateNumber', 'certificate_number') || '-',
      issuingCenter: getRecordValue(profilePucData, 'issuingCenter', 'issuing_center') || '-',
      issueDate: getRecordValue(profilePucData, 'issueDate', 'issue_date') || '-',
      expiryDate: getRecordValue(profilePucData, 'expiryDate', 'expiry_date') || '-',
      testResult: getRecordValue(profilePucData, 'testResult') || '-',
      pucStatus: getRecordValue(profilePucData, 'pucStatus', 'puc_status') || '-',
      isCurrent: getRecordValue(profilePucData, 'isCurrent', 'is_current') === false ? 'No' : 'Yes',
    };
  }, [profilePucData]);
  const profilePrintSections = useMemo(() => ([
    {
      title: 'Vehicle Profile',
      rows: [
        ['Identify Code', profileView?.identifyCode || '-'],
        ['Register Number', profileView?.registrationNumber || '-'],
        ['Chassis Number', profileView?.chassisNumber || '-'],
        ['Engine Number', profileView?.engineNumber || '-'],
        ['Company', profileView?.company || '-'],
        ['Department', profileView?.department || '-'],
        ['Vehicle Type', profileView?.vehicleType || '-'],
        ['Category', profileView?.category || '-'],
        ['Brand', profileView?.brand || '-'],
        ['Model', profileView?.model || '-'],
        ['Ownership', profileView?.ownership || '-'],
        ['Current Ownership', profileView?.currentOwnership || '-'],
        ['Distributor', profileView?.distributor || '-'],
        ['Operational', profileView?.operational || '-'],
        ['Status', profileView?.status || '-'],
        ['Manufacture Year', profileView?.year || '-'],
        ['Color', profileView?.color || '-'],
        ['Condition', profileView?.condition || '-'],
        ['Odometer KM', profileView?.odometer || '-'],
        ['Engine Hours', profileView?.engineHours || '-'],
        ['Notes', profileView?.notes || '-'],
      ],
    },
    {
      title: 'Vehicle Registration',
      rows: [
        ['Registration Number', profileRegistrationView?.registrationNumber || '-'],
        ['Registration Date', profileRegistrationView?.registrationDate || '-'],
        ['Registration Expiry', profileRegistrationView?.registrationExpiry || '-'],
        ['RC Status', profileRegistrationView?.rcStatus || '-'],
        ['Authority', profileRegistrationView?.registeringAuthority || '-'],
        ['City', profileRegistrationView?.registrationCity || '-'],
        ['State', profileRegistrationView?.registrationState || '-'],
        ['RC Book Number', profileRegistrationView?.rcBookNumber || '-'],
        ['Reminder Days', profileRegistrationView?.renewalReminderDays || '-'],
        ['Is Current', profileRegistrationView?.isCurrent || '-'],
      ],
    },
    {
      title: 'Vehicle Insurance',
      rows: [
        ['Insurance Company', profileInsuranceView?.insuranceCompany || '-'],
        ['Policy Number', profileInsuranceView?.policyNumber || '-'],
        ['Policy Start Date', profileInsuranceView?.policyStartDate || '-'],
        ['Policy Expiry Date', profileInsuranceView?.policyExpiryDate || '-'],
        ['Insurance Type', profileInsuranceView?.insuranceType || '-'],
        ['Premium Amount', profileInsuranceView?.premiumAmount || '-'],
        ['Status', profileInsuranceView?.insuranceStatus || '-'],
        ['Is Current', profileInsuranceView?.isCurrent || '-'],
      ],
    },
    {
      title: 'Vehicle Fitness Certificate',
      rows: [
        ['Certificate Number', profileFitnessView?.certificateNumber || '-'],
        ['Issuing Authority', profileFitnessView?.issuingAuthority || '-'],
        ['Inspection Center', profileFitnessView?.inspectionCenter || '-'],
        ['Issue Date', profileFitnessView?.issueDate || '-'],
        ['Expiry Date', profileFitnessView?.expiryDate || '-'],
        ['Status', profileFitnessView?.fitnessStatus || '-'],
        ['Is Current', profileFitnessView?.isCurrent || '-'],
      ],
    },
    {
      title: 'Vehicle Emission Test',
      rows: [
        ['Certificate Number', profilePucView?.certificateNumber || '-'],
        ['Issuing Center', profilePucView?.issuingCenter || '-'],
        ['Issue Date', profilePucView?.issueDate || '-'],
        ['Expiry Date', profilePucView?.expiryDate || '-'],
        ['Test Result', profilePucView?.testResult || '-'],
        ['Status', profilePucView?.pucStatus || '-'],
        ['Is Current', profilePucView?.isCurrent || '-'],
      ],
    },
  ]), [profileView, profileRegistrationView, profileInsuranceView, profileFitnessView, profilePucView]);
  const openProfilePrintView = () => {
    if (!profileData) return;
    setProfilePrintDialogOpen(true);
  };
  const openProfileQrView = async (companyVehicleId = profileVehicleId) => {
    if (!companyVehicleId || !token) return;
    setProfileQrLoading(true);
    setProfileQrError('');
    try {
      const qr = await companyVehicleService.qrById(token, companyVehicleId);
      setProfileQrData(qr || null);
      setProfileQrDialogOpen(true);
    } catch (e) {
      setProfileQrError(e?.message || 'Failed to load QR data');
      setProfileQrDialogOpen(true);
    } finally {
      setProfileQrLoading(false);
    }
  };
  const printProfileQr = () => {
    if (!profileQrData?.payload) return;
    const payload = encodeURIComponent(profileQrData.payload);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${payload}`;
    const reg = profileQrData?.registrationNumber || '-';
    const identify = profileQrData?.identifyCode || '-';
    const vehicleId = profileQrData?.companyVehicleId || '-';
    const w = window.open('', '_blank', 'width=900,height=900');
    if (!w) return;
    w.document.write(`
      <html>
      <head><title>Vehicle QR - ${vehicleId}</title></head>
      <body style="font-family:Arial,sans-serif;padding:24px;">
        <h2 style="margin:0 0 8px;">Company Vehicle QR</h2>
        <div style="margin:0 0 16px;">Vehicle ID: ${vehicleId}<br/>Identify Code: ${identify}<br/>Register No: ${reg}</div>
        <img src="${qrUrl}" alt="Vehicle QR" style="border:1px solid #ddd;padding:8px;border-radius:8px;" />
      </body>
      </html>
    `);
    w.document.close();
    w.focus();
    w.print();
  };
  const openScanQrDialog = () => {
    setProfileScanValue('');
    setProfileScanError('');
    setProfileScanDialogOpen(true);
  };
  const resolveScannedQr = async () => {
    if (!token || !profileScanValue.trim()) return;
    setProfileScanLoading(true);
    setProfileScanError('');
    try {
      const raw = profileScanValue.trim();
      let resolvedId = '';
      const kvMatch = raw.match(/companyVehicleId=([0-9a-fA-F-]{36})/i);
      if (kvMatch?.[1]) {
        resolvedId = kvMatch[1];
      } else {
        const uuidMatch = raw.match(/([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})/);
        if (uuidMatch?.[1]) resolvedId = uuidMatch[1];
      }

      let row = null;
      if (resolvedId) {
        row = await companyVehicleService.getById(token, resolvedId);
      } else {
        try {
          row = await companyVehicleService.resolveQrPost(token, raw);
        } catch {
          row = await companyVehicleService.resolveQr(token, raw);
        }
      }

      const cid = String(row?.companyId || row?.company_id || '');
      const cvid = String(row?.companyVehicleId || row?.companyvehicleId || row?.companyvehicle_id || '');
      if (cid) setProfileCompanyId(cid);
      if (cvid) setProfileVehicleId(cvid);
      setActiveTab(2);
      setProfileInnerTab(0);
      setProfileScanDialogOpen(false);
      if (cvid) {
        const url = `${window.location.origin}/vehicle-qr-details?companyVehicleId=${encodeURIComponent(cvid)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    } catch (e) {
      setProfileScanError(e?.message || 'Invalid QR or vehicle not found');
    } finally {
      setProfileScanLoading(false);
    }
  };
  const printProfileDocument = () => {
    // ── Parse a date string to JS Date or null ───────────────────────────────
    const parseExpiryDate = (value) => {
      if (!value || value === '-') return null;
      const s = String(value).trim();
      if (/^\d{4}-\d{2}-\d{2}/.test(s)) { const d = new Date(s); return isNaN(d.getTime()) ? null : d; }
      const parts = s.split(/[/\-]/);
      if (parts.length === 3 && parts[0].length <= 2) {
        const d = new Date(`${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`);
        return isNaN(d.getTime()) ? null : d;
      }
      const d = new Date(s); return isNaN(d.getTime()) ? null : d;
    };

    // ── Expiry status badge ──────────────────────────────────────────────────
    const EXPIRY_LABELS = new Set(['Registration Expiry', 'Policy Expiry Date', 'Expiry Date']);
    const getExpiryBadge = (label, value) => {
      if (!EXPIRY_LABELS.has(label)) return '';
      const date = parseExpiryDate(value);
      if (!date) return '';
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil((date - today) / 86400000);
      if (diffDays < 0) return '<span class="vms-badge vms-badge-expired">Expired</span>';
      if (diffDays <= 30) return `<span class="vms-badge vms-badge-expiring">Expiring Soon (${diffDays}d)</span>`;
      return '<span class="vms-badge vms-badge-valid">Valid</span>';
    };

    // ── Section accent colour and header background ──────────────────────────
    const getSectionMeta = (title) => {
      const map = {
        'Vehicle Profile':             { icon: '&#x1F697;', accent: '#2563eb', headerBg: '#eef3fd' },
        'Vehicle Registration':        { icon: '&#x1F4CB;', accent: '#7c3aed', headerBg: '#f3effe' },
        'Vehicle Insurance':           { icon: '&#x1F6E1;', accent: '#0891b2', headerBg: '#ecf8fc' },
        'Vehicle Fitness Certificate': { icon: '&#x2705;',  accent: '#059669', headerBg: '#ecfdf5' },
        'Vehicle Emission Test':       { icon: '&#x1F32B;', accent: '#d97706', headerBg: '#fffbeb' },
      };
      return map[title] || { icon: '&#x1F4C4;', accent: '#2563eb', headerBg: '#eef3fd' };
    };

    // ── Metadata ─────────────────────────────────────────────────────────────
    const docId = `VMS-${Date.now().toString(36).toUpperCase()}`;
    const nowDisplay = new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });

    // ── Identity values from Vehicle Profile section ─────────────────────────
    const profileSec = profilePrintSections[0];
    const getRow = (lbl) => (profileSec?.rows.find(([l]) => l === lbl) || [])[1] || '-';
    const regNumber  = getRow('Register Number');
    const identCode  = getRow('Identify Code');
    const compName   = getRow('Company');
    const dept       = getRow('Department');
    const brand      = getRow('Brand');
    const model      = getRow('Model');
    const vType      = getRow('Vehicle Type');
    const category   = getRow('Category');
    const mfgYear    = getRow('Manufacture Year');
    const vColor     = getRow('Color');
    const statusVal  = getRow('Status');
    const operational = getRow('Operational');
    const condition  = getRow('Condition');
    const odometer   = getRow('Odometer KM');
    const engHours   = getRow('Engine Hours');

    // ── Document heading: "<Company> Vehicle Profile · <IdentifyCode>" ────────
    const esc = (v) => String(v == null ? '-' : v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
    const headingCompany = compName !== '-' ? compName : 'Vehicle';
    const docHeading = `${esc(headingCompany)} Vehicle Profile`;
    const docSubCode = identCode !== '-' ? esc(identCode) : '';

    // ── Status pill colour ────────────────────────────────────────────────────
    const statusColor = statusVal === 'Active' ? '#059669' : statusVal === 'Inactive' ? '#dc2626' : '#64748b';
    const statusBg    = statusVal === 'Active' ? '#dcfce7' : statusVal === 'Inactive' ? '#fee2e2' : '#f1f5f9';

    // ── CSS ───────────────────────────────────────────────────────────────────
    const css = `
#vms-print-root{display:none}
@media print{
  body>*:not(#vms-print-root){display:none!important}
  #vms-print-root{display:block!important}
  @page{size:A4 portrait;margin:8mm 10mm 10mm 10mm}
}
#vms-print-root *,#vms-print-root *::before,#vms-print-root *::after{box-sizing:border-box;margin:0;padding:0}
#vms-print-root{font-family:"Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;font-size:11.5px;line-height:1.55;color:#0f172a;background:#fff}

/* ── PAGE WRAPPER ── */
.vms-page{max-width:780px;margin:0 auto;background:#fff}

/* ── TOP BAR: company name strip ── */
.vms-topbar{background:#0f172a;color:#fff;padding:7px 24px;display:flex;align-items:center;justify-content:space-between;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.vms-topbar-name{font-size:11px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;opacity:.9}
.vms-topbar-doc{font-size:10px;opacity:.55;letter-spacing:.03em}

/* ── MAIN HEADER ── */
.vms-hdr{position:relative;overflow:hidden;background:linear-gradient(120deg,#1e3a8a 0%,#1d4ed8 50%,#0369a1 100%);color:#fff;padding:20px 24px 16px;-webkit-print-color-adjust:exact;print-color-adjust:exact;color-adjust:exact}
.vms-hdr::after{content:'';position:absolute;top:-30px;right:-30px;width:200px;height:200px;background:rgba(255,255,255,.04);border-radius:50%;pointer-events:none}
.vms-hdr::before{content:'';position:absolute;bottom:-40px;right:60px;width:140px;height:140px;background:rgba(255,255,255,.03);border-radius:50%;pointer-events:none}
.vms-hdr-top{display:flex;align-items:flex-start;gap:16px;margin-bottom:14px;position:relative;z-index:1}
.vms-icon-wrap{flex-shrink:0;display:flex;flex-direction:column;align-items:center;gap:6px}
.vms-car-circle{width:58px;height:58px;background:rgba(255,255,255,.15);border-radius:50%;border:2.5px solid rgba(255,255,255,.35);display:flex;align-items:center;justify-content:center;font-size:26px}
.vms-id-chip{background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.3);border-radius:4px;padding:2px 8px;font-size:9.5px;font-weight:800;letter-spacing:.06em;white-space:nowrap}
.vms-ttl-block{flex:1;min-width:0}
.vms-company{font-size:10px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;opacity:.75;margin-bottom:3px}
.vms-ttl{font-size:20px;font-weight:900;letter-spacing:-.03em;line-height:1.1;margin-bottom:4px}
.vms-sub{font-size:11px;opacity:.78;font-weight:500;margin-bottom:10px}
.vms-pills{display:flex;gap:6px;flex-wrap:wrap}
.vms-pill{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:20px;font-size:9.5px;font-weight:700;letter-spacing:.03em;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.vms-pill-status{background:rgba(255,255,255,.2);color:#fff;border:1px solid rgba(255,255,255,.35)}
.vms-reg-box{flex-shrink:0;display:flex;flex-direction:column;gap:8px;align-items:flex-end}
.vms-reg-card{background:rgba(255,255,255,.15);border:1.5px solid rgba(255,255,255,.35);border-radius:8px;padding:8px 14px;text-align:center;min-width:110px}
.vms-reg-lbl{font-size:8px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;opacity:.7;display:block;margin-bottom:2px}
.vms-reg-val{font-size:14px;font-weight:900;letter-spacing:.04em;display:block}
.vms-odo-row{display:flex;gap:6px}
.vms-odo-card{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);border-radius:6px;padding:5px 10px;text-align:center;flex:1}
.vms-odo-val{font-size:13px;font-weight:800;display:block}
.vms-odo-lbl{font-size:8px;opacity:.65;letter-spacing:.05em;text-transform:uppercase}

/* ── META STRIP ── */
.vms-hdr-meta{position:relative;z-index:1;display:flex;gap:0;border-top:1px solid rgba(255,255,255,.18);padding-top:10px;flex-wrap:wrap}
.vms-meta-pill{padding:3px 12px;border-right:1px solid rgba(255,255,255,.15);font-size:10px;opacity:.88}
.vms-meta-pill:last-child{border-right:none}
.vms-meta-pill b{font-weight:700;opacity:1}

/* ── BODY ── */
.vms-body{padding:14px 18px;background:#f8fafc;-webkit-print-color-adjust:exact;print-color-adjust:exact}

/* ── SECTION CARDS ── */
.vms-section{margin-bottom:10px;background:#fff;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.05);-webkit-print-color-adjust:exact;print-color-adjust:exact;break-inside:avoid;page-break-inside:avoid}
.vms-sec-hdr{display:flex;align-items:center;gap:8px;padding:7px 14px;border-left:4px solid var(--acc,#2563eb);border-bottom:1px solid #f1f5f9;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.vms-sec-num{width:20px;height:20px;border-radius:50%;background:var(--acc,#2563eb);color:#fff;font-size:9px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.vms-sec-icon{font-size:13px;line-height:1}
.vms-sec-title{font-size:11px;font-weight:700;color:#0f172a;letter-spacing:.01em;flex:1}
.vms-sec-count{font-size:9px;color:#94a3b8;font-weight:600}

/* ── DATA GRID ── */
.vms-grid{display:grid;grid-template-columns:1fr 1fr}
.vms-cell{padding:6px 14px;border-bottom:1px solid #f8fafc;border-right:1px solid #f8fafc;min-width:0;background:#fff}
.vms-cell:nth-child(even){border-right:none}
.vms-cell:nth-last-child(-n+2){border-bottom:none}
.vms-lbl{font-size:9px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.06em;margin-bottom:2px}
.vms-val{font-size:11.5px;font-weight:600;color:#1e293b;word-break:break-word;display:flex;align-items:center;gap:5px;flex-wrap:wrap}

/* ── BADGES ── */
.vms-badge{display:inline-block;padding:1px 6px;border-radius:20px;font-size:8.5px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;vertical-align:middle;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.vms-badge-valid{background:#dcfce7;color:#166534;border:1px solid #86efac}
.vms-badge-expiring{background:#fef9c3;color:#854d0e;border:1px solid #fde047}
.vms-badge-expired{background:#fee2e2;color:#991b1b;border:1px solid #fca5a5}

/* ── FOOTER ── */
.vms-footer{display:flex;justify-content:space-between;align-items:center;padding:8px 18px;border-top:2px solid #e2e8f0;font-size:9.5px;color:#94a3b8;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.vms-footer-left{display:flex;align-items:center;gap:8px}
.vms-footer-brand{font-weight:800;color:#1d4ed8;font-size:11px;letter-spacing:-.01em}
.vms-footer-sep{color:#cbd5e1}
.vms-footer-right{text-align:right;line-height:1.4}
    `;

    // ── Inject style tag once ─────────────────────────────────────────────────
    let styleEl = document.getElementById('vms-print-style');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'vms-print-style';
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = css;

    // ── Inject / replace print div ────────────────────────────────────────────
    let printDiv = document.getElementById('vms-print-root');
    if (!printDiv) {
      printDiv = document.createElement('div');
      printDiv.id = 'vms-print-root';
      document.body.appendChild(printDiv);
    }
    printDiv.innerHTML = `
<div class="vms-page">

  <!-- TOP BAR -->
  <div class="vms-topbar">
    <span class="vms-topbar-name">${esc(headingCompany)}</span>
    <span class="vms-topbar-doc">Vehicle Management System &nbsp;&middot;&nbsp; ${esc(docId)}</span>
  </div>

  <!-- MAIN HEADER -->
  <div class="vms-hdr">
    <div class="vms-hdr-top">
      <div class="vms-icon-wrap">
        <div class="vms-car-circle">&#x1F697;</div>
        ${docSubCode ? `<div class="vms-id-chip">${docSubCode}</div>` : ''}
      </div>
      <div class="vms-ttl-block">
        <div class="vms-company">${esc(headingCompany)}</div>
        <div class="vms-ttl">${docHeading}</div>
        <div class="vms-sub">${esc(brand)} ${esc(model)} &nbsp;&middot;&nbsp; ${esc(vType)} &nbsp;&middot;&nbsp; ${esc(category)} &nbsp;&middot;&nbsp; ${esc(mfgYear)}</div>
        <div class="vms-pills">
          <span class="vms-pill vms-pill-status" style="background:${statusBg};color:${statusColor};border:1px solid ${statusColor}44">&#x2B24; ${esc(statusVal)}</span>
          <span class="vms-pill vms-pill-status">&#x1F3CE; ${esc(operational)}</span>
          <span class="vms-pill vms-pill-status">&#x1F3F7; ${esc(vColor)}</span>
          <span class="vms-pill vms-pill-status">&#x1F527; ${esc(condition)}</span>
        </div>
      </div>
      <div class="vms-reg-box">
        <div class="vms-reg-card">
          <span class="vms-reg-lbl">Reg. Number</span>
          <span class="vms-reg-val">${esc(regNumber)}</span>
        </div>
        <div class="vms-odo-row">
          <div class="vms-odo-card">
            <span class="vms-odo-val">${esc(odometer)}</span>
            <span class="vms-odo-lbl">KM</span>
          </div>
          <div class="vms-odo-card">
            <span class="vms-odo-val">${esc(engHours)}</span>
            <span class="vms-odo-lbl">Eng Hrs</span>
          </div>
        </div>
      </div>
    </div>
    <div class="vms-hdr-meta">
      <span class="vms-meta-pill"><b>Department:</b> ${esc(dept)}</span>
      <span class="vms-meta-pill"><b>Generated:</b> ${esc(nowDisplay)}</span>
      <span class="vms-meta-pill"><b>Doc ID:</b> ${esc(docId)}</span>
    </div>
  </div>

  <!-- SECTIONS -->
  <div class="vms-body">
    ${profilePrintSections.map((section, si) => {
      const { icon, accent, headerBg } = getSectionMeta(section.title);
      const cells = section.rows.map(([label, value]) =>
        `<div class="vms-cell"><div class="vms-lbl">${esc(label)}</div><div class="vms-val">${esc(value)}${getExpiryBadge(label, value)}</div></div>`
      ).join('');
      return `<div class="vms-section" style="--acc:${accent}"><div class="vms-sec-hdr" style="background:${headerBg}"><span class="vms-sec-num">${si + 1}</span><span class="vms-sec-icon">${icon}</span><span class="vms-sec-title">${esc(section.title)}</span><span class="vms-sec-count">${section.rows.length} fields</span></div><div class="vms-grid">${cells}</div></div>`;
    }).join('')}
  </div>

  <!-- FOOTER -->
  <div class="vms-footer">
    <div class="vms-footer-left">
      <span class="vms-footer-brand">VMS</span>
      <span class="vms-footer-sep">&middot;</span>
      <span>${esc(headingCompany)}</span>
    </div>
    <div class="vms-footer-right">
      ${esc(nowDisplay)}<br/>${esc(docId)}
    </div>
  </div>
</div>`;

    // ── Print then clean up ───────────────────────────────────────────────────
    setTimeout(() => {
      window.print();
      setTimeout(() => {
        printDiv.innerHTML = '';
        styleEl.textContent = '';
      }, 1000);
    }, 120);
  };

  return (
    <Box>
      <Tabs
        value={activeTab}
        onChange={(_, v) => setActiveTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{ mb: 2 }}
      >
        <Tab label="Overview" />
        <Tab label="Company Vehicle Details" />
        <Tab label="Company Vehicle Profile" />
      </Tabs>

      {activeTab === 0 && (
        <Box>
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Company Vehicle Overview</Typography>
              {overviewLoading ? <CircularProgress size={20} /> : null}
            </Stack>
          </Paper>
          <Grid container spacing={2}>
            {[
              { label: 'Total Vehicles', value: overview.totalVehicles },
              { label: 'Active Vehicles', value: overview.activeVehicles },
              { label: 'Inactive Vehicles', value: overview.inactiveVehicles },
              { label: 'Vehicle Types', value: overview.totalTypes },
              { label: 'Brands', value: overview.totalBrands },
              { label: 'Insurance Records', value: overview.totalInsuranceRecords },
              { label: 'Fitness Records', value: overview.totalFitnessRecords },
              { label: 'Emission Records', value: overview.totalEmissionRecords },
            ].map((item) => (
              <Grid key={item.label} item xs={12} sm={6} md={4}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="body2" color="text.secondary">{item.label}</Typography>
                  <Typography variant="h4" sx={{ mt: 1, fontWeight: 800 }}>{item.value}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
          <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Vehicle Count By Type</Typography>
            {(overview.vehicleTypeCounts || []).length === 0 ? (
              <Typography variant="body2" color="text.secondary">No vehicle type data.</Typography>
            ) : (
              <Grid container spacing={2}>
                {overview.vehicleTypeCounts.map((x, idx) => (
                  <Grid key={`${x.typeId || x.typeName || 'type'}-${idx}`} item xs={12} sm={6} md={4}>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                      <Typography variant="body2" color="text.secondary">{x.typeName || 'Unknown'}</Typography>
                      <Typography variant="h5" sx={{ mt: 1, fontWeight: 800 }}>{Number(x.vehicleCount || 0)}</Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        </Box>
      )}

      {activeTab === 1 && (
        <CrudEntityPage
          title="Company Vehicle Details"
          icon={<ApartmentRoundedIcon sx={{ color: '#fff', fontSize: 20 }} />}
          gradient={`linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`}
          idKey="companyVehicleId"
          prefillForm={firstVehicleFormPrefill}
          prefillFilters={own ? { companyId: own.companyId } : null}
          columns={[
            { key: 'keyNumber', label: 'Identify Code' },
            { key: 'companyVehicleManufactureBrand', label: 'Manufacture Brand', render: (r) => {
              const m = manufacturerById[String(r.companyVehicleManufacture)];
              return r.companyVehicleManufactureBrand || m?.manufacturerBrand || (m ? `${m.manufacturerName || '-'} (${m.country || '-'})` : '-');
            } },
            { key: 'companyVehicleModelName', label: 'Model', render: (r) => r.companyVehicleModelName || modelById[String(r.companyVehicleModel)]?.modelName || '-' },
            { key: 'registrationNumber', label: 'Register No' },
            { key: 'chassisNumber', label: 'Chassis No' },
            { key: 'ownershipTypeId', label: 'Ownership', render: (r) => ownershipById[String(r.ownershipTypeId)] || '-' },
            { key: 'currentOwnership', label: 'Current Ownership', render: (r) => r.currentOwnership || '-' },
            { key: 'operationalStatusId', label: 'Operational', render: (r) => operationalById[String(r.operationalStatusId)] || '-' },
            {
              key: 'ratedEfficiencyKmpl',
              label: 'Rated Efficiency (KMPL)',
              render: (r) => {
                const value = r?.ratedEfficiencyKmpl ?? r?.relatedEfficiency ?? r?.rated_efficiency_kmpl;
                return value == null || value === '' ? '-' : String(value);
              },
            },
            {
              key: 'ratedConsumptionLph',
              label: 'Rated Consumption (LPH)',
              render: (r) => {
                const value = r?.ratedConsumptionLph ?? r?.ratedConsumption ?? r?.rated_consumption_lph;
                return value == null || value === '' ? '-' : String(value);
              },
            },
            {
              key: 'qr',
              label: 'QR',
              render: (r) => (
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<QrCode2RoundedIcon fontSize="small" />}
                  onClick={(e) => {
                    e.stopPropagation();
                    void openProfileQrView(String(r?.companyVehicleId || r?.companyvehicleId || r?.companyvehicle_id || ''));
                  }}
                >
                  QR
                </Button>
              ),
            },
            { key: 'isActive', label: 'Status', render: (r) => (r.isActive ? 'Active' : 'Inactive') },
          ]}
          filterFields={[
            { key: 'keyNumber_like', label: 'Identify Code' },
            { key: 'operationalStatusId', label: 'Operational', type: 'autocomplete', options: operationalOpts },
            { key: 'isActive', label: 'Status', type: 'boolean' },
            { key: 'q', label: 'Search' },
          ]}
          formFields={[
            { key: 'companyId', label: 'Company', type: 'autocomplete', options: companyFormOpts },
            { key: 'companyCode', label: 'Company Code', readOnly: true },
            {
              key: 'companyDepartment',
              label: 'Department',
              type: 'autocomplete',
              optionsByForm: (f) => [{ value: '', label: 'Select Department' }, ...(departmentOptsByCompany[String(f?.companyId || '')] || [])],
            },
            {
              key: 'vehicleModelRef',
              label: 'Vehicle Model',
              type: 'autocomplete',
              optionsByForm: (f) => {
                const companyId = String(f?.companyId || '');
                if (!companyId) {
                  return [{ value: '', label: 'Select Company First' }];
                }
                return [{ value: '', label: 'Select Vehicle Model' }, ...(vehicleModelDropdownOptsByCompany[companyId] || [])];
              },
            },
            { key: 'companyVehicleType', label: 'Vehicle Type', type: 'autocomplete', options: typeFormOpts },
            { key: 'categoryId', label: 'Vehicle Category', type: 'autocomplete', options: categoryFormOpts },
            { key: 'companyVehicleManufactureBrand', label: 'Manufacture Brand', type: 'autocomplete', options: manufacturerFormOpts },
            { key: 'registrationNumber', label: 'Register Number' },
            { key: 'chassisNumber', label: 'Chassis Number' },
            { key: 'engineNumber', label: 'Engine Number' },
            { key: 'keyNumber', label: 'Identification Code' },
            { key: 'vehicleImage', label: 'Vehicle Image URL' },
            { key: 'manufactureYear', label: 'Manufacture Year', type: 'number' },
            { key: 'color', label: 'Color' },
            { key: 'ownership-section', type: 'section', label: 'Ownership Details' },
            { key: 'ownershipTypeId', label: 'Ownership Type', type: 'autocomplete', options: ownershipOpts },
            {
              key: 'ownership',
              labelByForm: (f) => {
                const code = ownershipCodeById[String(f?.ownershipTypeId || '')] || '';
                if (isCompanyOwnedCode(code)) return 'Ownership (Company)';
                if (isPersonalOwnedCode(code)) return 'Ownership (Owner Name)';
                return 'Ownership';
              },
              typeByForm: (f) => {
                const code = ownershipCodeById[String(f?.ownershipTypeId || '')] || '';
                if (isPersonalOwnedCode(code)) return 'text';
                return 'autocomplete';
              },
              optionsByForm: (f) => {
                const code = ownershipCodeById[String(f?.ownershipTypeId || '')] || '';
                if (isPersonalOwnedCode(code)) return [];
                const existing = String(f?.ownership || '');
                const options = currentOwnershipOpts;
                if (existing && !options.some((x) => x.value === existing)) {
                  return [{ value: existing, label: existing }, ...options];
                }
                return options;
              },
            },
            { key: 'distributorId', label: 'Distributor', type: 'autocomplete', options: distributorOpts },
            { key: 'previousOwnersCount', label: 'Previous Owners', type: 'number' },
            { key: 'vehicleCondition', label: 'Vehicle Condition' },
            { key: 'operationalStatusId', label: 'Operational Status', type: 'autocomplete', options: operationalOpts },
            { key: 'initialOdometerKm', label: 'Initial Odometer KM', type: 'number' },
            { key: 'currentOdometerKm', label: 'Current Odometer KM', type: 'number' },
            { key: 'totalEngineHours', label: 'Total Engine Hours', type: 'number' },
            { key: 'ratedEfficiencyKmpl', label: 'Rated Efficiency (KMPL)', type: 'number' },
            { key: 'ratedConsumptionLph', label: 'Rated Consumption (LPH)', type: 'number' },
            { key: 'isActive', label: 'Is Active', type: 'boolean' },
            { key: 'notes', label: 'Notes', fullWidth: true, minWidth: 320 },
          ]}
          defaultFilters={{
            keyNumber_like: '',
            operationalStatusId: '',
            isActive: '',
            q: '',
            sortBy: 'updatedAt',
            sortDir: 'desc'
          }}
          emptyForm={{
            companyId: '', companyCode: '', companyDepartment: '',
            vehicleModelRef: '', companyVehicleType: '', companyVehicleModel: '',
            categoryId: '', companyVehicleManufactureBrand: '', registrationNumber: '', chassisNumber: '', engineNumber: '', keyNumber: '',
            vehicleImage: '', manufactureYear: String(new Date().getFullYear()), color: '', ownershipTypeId: '', ownership: '', currentOwnership: '', distributorId: '', previousOwnersCount: '',
            vehicleCondition: 'New', operationalStatusId: '', initialOdometerKm: '0', currentOdometerKm: '0',
            totalEngineHours: '0', ratedEfficiencyKmpl: '', ratedConsumptionLph: '', notes: '', isActive: 'true',
          }}
          normalizePayload={(f) => {
            const ownershipTypeId = toInt(f.ownershipTypeId);
            const hasKnownOwnershipType = !!ownershipCodeById[String(f.ownershipTypeId || '')];
            if (ownershipTypeId == null && hasKnownOwnershipType) throw new Error('Ownership Type is required');
            return {
              companyId: req(f.companyId),
              companyCode: req(f.companyCode),
              companyProject: null,
              companyBranch: null,
              companyDepartment: opt(f.companyDepartment),
              companyVehicleType: opt(f.companyVehicleType),
              companyVehicleModel: opt(f.companyVehicleModel),
              categoryId: req(f.categoryId),
              companyVehicleManufacture: req(f.companyVehicleManufactureBrand),
              registrationNumber: opt(f.registrationNumber),
              chassisNumber: req(f.chassisNumber),
              engineNumber: req(f.engineNumber),
              keyNumber: opt(f.keyNumber),
              vehicleImage: opt(f.vehicleImage),
              manufactureYear: toInt(f.manufactureYear) || new Date().getFullYear(),
              color: opt(f.color),
              ownershipTypeId: hasKnownOwnershipType ? ownershipTypeId : null,
              currentOwnership: hasKnownOwnershipType ? opt(f.ownership ?? f.currentOwnership) : null,
              distributorId: opt(f.distributorId),
              previousOwnersCount: toInt(f.previousOwnersCount),
              vehicleCondition: opt(f.vehicleCondition),
              operationalStatusId: toInt(f.operationalStatusId),
              vehicleStatusId: null,
              initialOdometerKm: toDecimal(f.initialOdometerKm),
              currentOdometerKm: toDecimal(f.currentOdometerKm),
              totalEngineHours: toDecimal(f.totalEngineHours),
              consumptionMethodId: toInt(f.consumptionMethodId),
              ratedEfficiencyKmpl: toDecimal(f.ratedEfficiencyKmpl),
              ratedConsumptionLph: toDecimal(f.ratedConsumptionLph),
              relatedEfficiency: toDecimal(f.ratedEfficiencyKmpl),
              ratedConsumption: toDecimal(f.ratedConsumptionLph),
              notes: opt(f.notes),
              isActive: toBool(f.isActive),
            };
          }}
          onFormFieldChange={async (next, key, value) => {
            const withCurrentOwnership = async (formState, fallbackOwner = '') => {
              const ownershipTypeId = String(formState?.ownershipTypeId || '');
              const companyId = String(formState?.companyId || '');
              if (!ownershipTypeId) {
                setCurrentOwnershipOptions([]);
                return { ...formState, ownership: '', currentOwnership: '' };
              }
              const ownershipCode = ownershipCodeById[ownershipTypeId] || '';
              if (isPersonalOwnedCode(ownershipCode)) {
                setCurrentOwnershipOptions([]);
                const owner = fallbackOwner || formState?.ownership || formState?.currentOwnership || '';
                return { ...formState, ownership: owner, currentOwnership: owner };
              }
              const options = await refreshCurrentOwnershipOptions(companyId, ownershipTypeId, fallbackOwner || formState?.ownership || formState?.currentOwnership || '');
              if (isCompanyOwnedCode(ownershipCode)) {
                const owner = options[0]?.value || '';
                return { ...formState, ownership: owner, currentOwnership: owner };
              }
              if (!isLeasedCode(ownershipCode)) {
                return formState;
              }
              const existing = String(formState?.ownership || formState?.currentOwnership || '');
              if (existing && options.some((x) => x.value === existing)) {
                return { ...formState, ownership: existing, currentOwnership: existing };
              }
              return { ...formState, ownership: '', currentOwnership: '' };
            };

            if (key === 'companyId') {
              const firstForCompany = (vehiclesByCompany[String(value || '')] || [])[0] || null;
              if (firstForCompany) {
                const selectedModel = modelById[String(firstForCompany.modelId)];
                const selectedTypeId = String(firstForCompany.typeId || selectedModel?.typeId || '');
                const selectedCategory = categoryById[String(firstForCompany.categoryId || selectedModel?.categoryId)];
                const selectedManufacturer = manufacturerById[String(firstForCompany.manufacturerId || selectedModel?.manufacturerId)];
                const selectedOwnershipTypeId = firstForCompany.ownershipTypeId != null ? String(firstForCompany.ownershipTypeId) : '';
                const selectedOwnership = firstForCompany.currentOwnership || firstForCompany.current_ownership || '';
                const nextCode = await fetchNextIdentificationCode(value, selectedTypeId, firstForCompany.keyNumber || '');
                return withCurrentOwnership({
                  ...next,
                  companyId: String(value || ''),
                  companyCode: companyById[String(value)]?.code || '',
                  companyDepartment: '',
                  vehicleModelRef: firstForCompany.vehicleId ? String(firstForCompany.vehicleId) : '',
                  companyVehicleModel: firstForCompany.modelId ? String(firstForCompany.modelId) : '',
                  companyVehicleType: selectedTypeId,
                  categoryId: selectedCategory?.categoryId ? String(selectedCategory.categoryId) : '',
                  companyVehicleManufactureBrand: selectedManufacturer?.manufacturerId ? String(selectedManufacturer.manufacturerId) : '',
                  distributorId: firstForCompany.distributorId ? String(firstForCompany.distributorId) : '',
                  registrationNumber: firstForCompany.registrationNumber || '',
                  chassisNumber: firstForCompany.chassisNumber || '',
                  engineNumber: firstForCompany.engineNumber || '',
                  ownershipTypeId: selectedOwnershipTypeId,
                  ownership: selectedOwnership,
                  currentOwnership: selectedOwnership,
                  operationalStatusId: firstForCompany.operationalStatusId != null ? String(firstForCompany.operationalStatusId) : '',
                  initialOdometerKm: firstForCompany.initialOdometerKm != null ? String(firstForCompany.initialOdometerKm) : (next.initialOdometerKm || '0'),
                  currentOdometerKm: firstForCompany.currentOdometerKm != null ? String(firstForCompany.currentOdometerKm) : (next.currentOdometerKm || '0'),
                  totalEngineHours: firstForCompany.totalEngineHours != null ? String(firstForCompany.totalEngineHours) : (next.totalEngineHours || '0'),
                  ratedEfficiencyKmpl: firstForCompany.ratedEfficiencyKmpl != null ? String(firstForCompany.ratedEfficiencyKmpl) : (next.ratedEfficiencyKmpl || ''),
                  ratedConsumptionLph: firstForCompany.ratedConsumptionLph != null ? String(firstForCompany.ratedConsumptionLph) : (next.ratedConsumptionLph || ''),
                  keyNumber: nextCode || '',
                }, selectedOwnership);
              }
              const nextCode = await fetchNextIdentificationCode(value, next.companyVehicleType, '');
              return withCurrentOwnership({
                ...next,
                companyId: String(value || ''),
                companyCode: companyById[String(value)]?.code || '',
                companyDepartment: '',
                vehicleModelRef: '',
                companyVehicleModel: '',
                companyVehicleType: '',
                categoryId: '',
                companyVehicleManufactureBrand: '',
                operationalStatusId: '',
                initialOdometerKm: '0',
                currentOdometerKm: '0',
                totalEngineHours: '0',
                ratedEfficiencyKmpl: '',
                ratedConsumptionLph: '',
                keyNumber: nextCode || '',
              });
            }
            if (key === 'vehicleModelRef') {
              const selectedVehicle = vehicleById[String(value)];
              if (!selectedVehicle) return next;
              const selectedModel = modelById[String(selectedVehicle.modelId)];
              const selectedTypeId = String(selectedVehicle.typeId || selectedModel?.typeId || '');
              const selectedCategory = categoryById[String(selectedVehicle.categoryId || selectedModel?.categoryId)];
              const selectedManufacturer = manufacturerById[String(selectedVehicle.manufacturerId || selectedModel?.manufacturerId)];
              const selectedOwnershipTypeId = selectedVehicle.ownershipTypeId != null ? String(selectedVehicle.ownershipTypeId) : '';
              const selectedOwnership = selectedVehicle.currentOwnership || selectedVehicle.current_ownership || '';
              const selectedCompanyId = selectedVehicle.companyId || selectedVehicle.company_id || next.companyId;
              const selectedCompanyCode = selectedVehicle.companyCode || selectedVehicle.company_code || companyById[String(selectedCompanyId)]?.code || next.companyCode;
              const nextCode = await fetchNextIdentificationCode(
                selectedCompanyId,
                selectedTypeId,
                selectedVehicle.keyNumber || ''
              );
              return withCurrentOwnership({
                ...next,
                companyId: selectedCompanyId ? String(selectedCompanyId) : '',
                companyCode: selectedCompanyCode || '',
                companyDepartment: '',
                companyVehicleModel: selectedVehicle.modelId ? String(selectedVehicle.modelId) : '',
                companyVehicleType: selectedTypeId,
                categoryId: selectedCategory?.categoryId ? String(selectedCategory.categoryId) : '',
                companyVehicleManufactureBrand: selectedManufacturer?.manufacturerId ? String(selectedManufacturer.manufacturerId) : '',
                distributorId: selectedVehicle.distributorId ? String(selectedVehicle.distributorId) : (next.distributorId || ''),
                registrationNumber: selectedVehicle.registrationNumber || '',
                keyNumber: nextCode || '',
                chassisNumber: selectedVehicle.chassisNumber || '',
                engineNumber: selectedVehicle.engineNumber || '',
                ownershipTypeId: selectedOwnershipTypeId,
                ownership: selectedOwnership,
                currentOwnership: selectedOwnership,
                operationalStatusId: selectedVehicle.operationalStatusId != null ? String(selectedVehicle.operationalStatusId) : '',
                initialOdometerKm: selectedVehicle.initialOdometerKm != null ? String(selectedVehicle.initialOdometerKm) : (next.initialOdometerKm || '0'),
                currentOdometerKm: selectedVehicle.currentOdometerKm != null ? String(selectedVehicle.currentOdometerKm) : (next.currentOdometerKm || '0'),
                totalEngineHours: selectedVehicle.totalEngineHours != null ? String(selectedVehicle.totalEngineHours) : (next.totalEngineHours || '0'),
                ratedEfficiencyKmpl: selectedVehicle.ratedEfficiencyKmpl != null ? String(selectedVehicle.ratedEfficiencyKmpl) : (next.ratedEfficiencyKmpl || ''),
                ratedConsumptionLph: selectedVehicle.ratedConsumptionLph != null ? String(selectedVehicle.ratedConsumptionLph) : (next.ratedConsumptionLph || ''),
              }, selectedOwnership);
            }
            if (key === 'companyVehicleType') {
              const code = await fetchNextIdentificationCode(next.companyId, value, next.keyNumber || '');
              return { ...next, keyNumber: code || next.keyNumber || '' };
            }
            if (key === 'ownershipTypeId') {
              return withCurrentOwnership({
                ...next,
                ownershipTypeId: String(value || ''),
              });
            }
            if (key === 'ownership') {
              return { ...next, ownership: String(value || ''), currentOwnership: String(value || '') };
            }
            return next;
          }}
          mapRecordToForm={(r) => {
            const normalizedRatedEfficiency =
              r?.ratedEfficiencyKmpl ?? r?.relatedEfficiency ?? r?.rated_efficiency_kmpl ?? '';
            const normalizedRatedConsumption =
              r?.ratedConsumptionLph ?? r?.ratedConsumption ?? r?.rated_consumption_lph ?? '';
            const mapped = {
              ...r,
              vehicleModelRef: '',
              companyVehicleManufactureBrand: r?.companyVehicleManufacture ? String(r.companyVehicleManufacture) : '',
              companyCode: r?.companyCode || companyById[String(r?.companyId)]?.code || '',
              consumptionMethodId: r?.consumptionMethodId != null ? String(r.consumptionMethodId) : '',
              ratedEfficiencyKmpl: normalizedRatedEfficiency !== '' ? String(normalizedRatedEfficiency) : '',
              ratedConsumptionLph: normalizedRatedConsumption !== '' ? String(normalizedRatedConsumption) : '',
              ownershipTypeId: r?.ownershipTypeId != null ? String(r.ownershipTypeId) : '',
              ownership: r?.currentOwnership || '',
              currentOwnership: r?.currentOwnership || '',
              isActive: (r?.isActive ?? true) ? 'true' : 'false',
            };
            if (mapped.ownershipTypeId) {
              const code = ownershipCodeById[mapped.ownershipTypeId] || '';
              if (isPersonalOwnedCode(code)) {
                setCurrentOwnershipOptions([]);
              } else {
                void refreshCurrentOwnershipOptions(mapped.companyId, mapped.ownershipTypeId, mapped.currentOwnership);
              }
            } else {
              setCurrentOwnershipOptions([]);
            }
            return mapped;
          }}
          listFetcher={companyVehicleService.list}
          getByIdFetcher={companyVehicleService.getById}
          createFetcher={companyVehicleService.create}
          updateFetcher={companyVehicleService.update}
          deleteFetcher={companyVehicleService.delete}
          autoSearch
          autoSearchDebounceMs={350}
          fitViewport
          viewportOffset={190}
        />
      )}

      {activeTab === 2 && (
        <Box>
          <Paper variant="outlined" sx={{ p: 1, mb: 2, borderRadius: 2 }}>
            <Tabs
              value={profileInnerTab}
              onChange={(_, v) => setProfileInnerTab(v)}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
            >
              <Tab label="Vehicle Profile" />
              <Tab label="Vehicle Registration" />
              <Tab label="Vehicle Insurance" />
              <Tab label="Vehicle Fitness Certificate" />
              <Tab label="Emission Test Details" />
              <Tab label="Vehicle Location" />
              <Tab label="Fuel Details" />
              <Tab label="Running Details" />
            </Tabs>
          </Paper>

          {profileInnerTab === 0 && (
            <>
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={5}>
                <FormControl fullWidth sx={{ minWidth: { xs: '100%', md: 320 } }}>
                  <InputLabel>Company</InputLabel>
                  <Select
                    value={profileCompanyId}
                    label="Company"
                    MenuProps={profileDropdownMenuProps}
                    onChange={(e) => setProfileCompanyId(String(e.target.value || ''))}
                  >
                    <MenuItem value=""><em>Select Company</em></MenuItem>
                    {companies.map((c) => (
                      <MenuItem key={String(c.id)} value={String(c.id)} sx={{ whiteSpace: 'normal', lineHeight: 1.25, py: 1 }}>
                        {c.name || c.code || c.id}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={7}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <FormControl fullWidth disabled={!profileCompanyId} sx={{ minWidth: { xs: '100%', md: 390 } }}>
                    <InputLabel>Company Vehicle</InputLabel>
                    <Select
                      value={profileVehicleId}
                      label="Company Vehicle"
                      MenuProps={profileDropdownMenuProps}
                      onChange={(e) => setProfileVehicleId(String(e.target.value || ''))}
                    >
                      <MenuItem value=""><em>Select Vehicle</em></MenuItem>
                      {profileRows.map((r) => (
                        <MenuItem key={getCompanyVehicleRecordId(r)} value={getCompanyVehicleRecordId(r)} sx={{ whiteSpace: 'normal', lineHeight: 1.25, py: 1 }}>
                          {`${getRecordValue(r, 'keyNumber', 'key_number') || '-'} | ${getRecordValue(r, 'registrationNumber', 'registration_number') || '-'} | ${getRecordValue(r, 'chassisNumber', 'chassis_number') || '-'}`}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Button size="small" startIcon={<RefreshRoundedIcon />} onClick={() => setProfileReloadSeed((x) => x + 1)} sx={{ whiteSpace: 'nowrap' }}>
                    Refresh
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<PrintRoundedIcon />}
                    disabled={!profileVehicleId || !!profileLoading || !profileData}
                    onClick={openProfilePrintView}
                    sx={{ whiteSpace: 'nowrap' }}
                  >
                    Print View
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<QrCode2RoundedIcon />}
                    disabled={!profileVehicleId || !!profileLoading}
                    onClick={() => { void openProfileQrView(); }}
                    sx={{ whiteSpace: 'nowrap' }}
                  >
                    QR
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Paper>

          {!profileLoading && !profileError && profileCompanyId && profileRows.length === 0 && (
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Typography variant="body2" color="text.secondary">No company vehicles found for the selected company.</Typography>
            </Paper>
          )}

          {profileLoading && (
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <CircularProgress size={20} />
                <Typography variant="body2">Loading company vehicle profile...</Typography>
              </Stack>
            </Paper>
          )}

          {!profileLoading && profileError && (
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Typography color="error">{profileError}</Typography>
            </Paper>
          )}

          {!profileLoading && !profileError && profileData && (
            <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} alignItems="flex-start">

              {/* ── LEFT PANEL ── */}
              <Box sx={{ width: { xs: '100%', lg: 300 }, minWidth: { xs: '100%', lg: 300 }, flexShrink: 0 }}>

                {/* Vehicle Avatar / Image */}
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
                    <DirectionsCarRoundedIcon sx={{ fontSize: 52, color: '#fff' }} />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                    {profileView?.identifyCode || '—'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
                    {profileView?.brand || '-'}&nbsp;·&nbsp;{profileView?.model || '-'}
                  </Typography>
                  <Stack spacing={0.75}>
                    <Chip
                      size="small"
                      color={profileView?.status === 'Active' ? 'success' : 'default'}
                      label={profileView?.status || '-'}
                      sx={{ fontWeight: 700 }}
                    />
                    <Chip
                      size="small"
                      variant="outlined"
                      label={`Operational: ${profileView?.operational || '-'}`}
                    />
                    <Chip
                      size="small"
                      variant="outlined"
                      color="primary"
                      label={`Type: ${profileView?.vehicleType || '-'}`}
                    />
                  </Stack>
                </Paper>

                {/* Registration & Identity */}
                <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                    <BadgeRoundedIcon fontSize="small" color="primary" />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Identity</Typography>
                  </Stack>
                  <Divider sx={{ mb: 1.5 }} />
                  {[
                    { label: 'Identify Code', value: profileView?.identifyCode },
                    { label: 'Register No', value: profileView?.registrationNumber },
                    { label: 'Chassis No', value: profileView?.chassisNumber },
                    { label: 'Engine No', value: profileView?.engineNumber },
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
                      <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{profileView?.odometer || '0'}</Typography>
                      <Typography variant="caption" color="text.secondary">KM</Typography>
                    </Box>
                    <Box sx={{ flex: 1, textAlign: 'center', p: 1.5, borderRadius: 2, bgcolor: 'action.hover' }}>
                      <Typography variant="caption" color="text.secondary" display="block">Engine Hrs</Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{profileView?.engineHours || '0'}</Typography>
                      <Typography variant="caption" color="text.secondary">hrs</Typography>
                    </Box>
                  </Stack>
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" color="text.secondary" display="block">Condition</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{profileView?.condition || '-'}</Typography>
                  </Box>
                </Paper>
              </Box>

              {/* ── RIGHT PANEL ── */}
              <Box sx={{ flex: 1, minWidth: 0 }}>

                {/* Company & Assignment */}
                <Paper variant="outlined" sx={{ p: 2.5, mb: 2, borderRadius: 2 }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                    <BusinessRoundedIcon fontSize="small" color="primary" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Company & Assignment</Typography>
                  </Stack>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    {[
                      { label: 'Company', value: profileView?.company, icon: <BusinessRoundedIcon fontSize="small" /> },
                      { label: 'Department', value: profileView?.department, icon: <AccountTreeRoundedIcon fontSize="small" /> },
                      { label: 'Ownership', value: profileView?.ownership, icon: <HandshakeRoundedIcon fontSize="small" /> },
                      { label: 'Distributor', value: profileView?.distributor, icon: <LocalShippingRoundedIcon fontSize="small" /> },
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
                      { label: 'Vehicle Type', value: profileView?.vehicleType, icon: <DirectionsCarRoundedIcon fontSize="small" /> },
                      { label: 'Category', value: profileView?.category, icon: <CategoryRoundedIcon fontSize="small" /> },
                      { label: 'Brand', value: profileView?.brand, icon: <NumbersRoundedIcon fontSize="small" /> },
                      { label: 'Model', value: profileView?.model, icon: <BuildRoundedIcon fontSize="small" /> },
                      { label: 'Manufacture Year', value: profileView?.year, icon: <CalendarMonthRoundedIcon fontSize="small" /> },
                      { label: 'Color', value: profileView?.color, icon: <ColorLensRoundedIcon fontSize="small" /> },
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

                {/* Notes */}
                <Paper variant="outlined" sx={{ p: 2.5, mb: 2, borderRadius: 2 }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                    <BadgeRoundedIcon fontSize="small" color="primary" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Vehicle Registration</Typography>
                  </Stack>
                  <Divider sx={{ mb: 2 }} />
                  {profileRegistrationLoading ? (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CircularProgress size={18} />
                      <Typography variant="body2">Loading registration details...</Typography>
                    </Stack>
                  ) : !profileRegistrationView ? (
                    <Typography variant="body2" color="text.secondary">No registration data found.</Typography>
                  ) : (
                    <Grid container spacing={2}>
                      {[
                        { label: 'Registration Number', value: profileRegistrationView.registrationNumber },
                        { label: 'Registration Date', value: profileRegistrationView.registrationDate },
                        { label: 'Registration Expiry', value: profileRegistrationView.registrationExpiry },
                        { label: 'RC Status', value: profileRegistrationView.rcStatus },
                        { label: 'Authority', value: profileRegistrationView.registeringAuthority },
                        { label: 'City', value: profileRegistrationView.registrationCity },
                        { label: 'State', value: profileRegistrationView.registrationState },
                        { label: 'RC Book Number', value: profileRegistrationView.rcBookNumber },
                        { label: 'Reminder Days', value: profileRegistrationView.renewalReminderDays },
                        { label: 'Is Current', value: profileRegistrationView.isCurrent },
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

                <Paper variant="outlined" sx={{ p: 2.5, mb: 2, borderRadius: 2 }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                    <BadgeRoundedIcon fontSize="small" color="primary" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Vehicle Insurance</Typography>
                  </Stack>
                  <Divider sx={{ mb: 2 }} />
                  {profileInsuranceLoading ? (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CircularProgress size={18} />
                      <Typography variant="body2">Loading insurance details...</Typography>
                    </Stack>
                  ) : !profileInsuranceView ? (
                    <Typography variant="body2" color="text.secondary">No insurance data found.</Typography>
                  ) : (
                    <Grid container spacing={2}>
                      {[
                        { label: 'Insurance Company', value: profileInsuranceView.insuranceCompany },
                        { label: 'Policy Number', value: profileInsuranceView.policyNumber },
                        { label: 'Policy Start', value: profileInsuranceView.policyStartDate },
                        { label: 'Policy Expiry', value: profileInsuranceView.policyExpiryDate },
                        { label: 'Insurance Type', value: profileInsuranceView.insuranceType },
                        { label: 'Premium Amount', value: profileInsuranceView.premiumAmount },
                        { label: 'Status', value: profileInsuranceView.insuranceStatus },
                        { label: 'Is Current', value: profileInsuranceView.isCurrent },
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

                <Paper variant="outlined" sx={{ p: 2.5, mb: 2, borderRadius: 2 }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                    <BadgeRoundedIcon fontSize="small" color="primary" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Vehicle Fitness Certificate</Typography>
                  </Stack>
                  <Divider sx={{ mb: 2 }} />
                  {profileFitnessLoading ? (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CircularProgress size={18} />
                      <Typography variant="body2">Loading fitness details...</Typography>
                    </Stack>
                  ) : !profileFitnessView ? (
                    <Typography variant="body2" color="text.secondary">No fitness certificate data found.</Typography>
                  ) : (
                    <Grid container spacing={2}>
                      {[
                        { label: 'Certificate Number', value: profileFitnessView.certificateNumber },
                        { label: 'Issuing Authority', value: profileFitnessView.issuingAuthority },
                        { label: 'Inspection Center', value: profileFitnessView.inspectionCenter },
                        { label: 'Issue Date', value: profileFitnessView.issueDate },
                        { label: 'Expiry Date', value: profileFitnessView.expiryDate },
                        { label: 'Status', value: profileFitnessView.fitnessStatus },
                        { label: 'Is Current', value: profileFitnessView.isCurrent },
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

                <Paper variant="outlined" sx={{ p: 2.5, mb: 2, borderRadius: 2 }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                    <BadgeRoundedIcon fontSize="small" color="primary" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Vehicle Emission Test</Typography>
                  </Stack>
                  <Divider sx={{ mb: 2 }} />
                  {profilePucLoading ? (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CircularProgress size={18} />
                      <Typography variant="body2">Loading emission details...</Typography>
                    </Stack>
                  ) : !profilePucView ? (
                    <Typography variant="body2" color="text.secondary">No emission test data found.</Typography>
                  ) : (
                    <Grid container spacing={2}>
                      {[
                        { label: 'Certificate Number', value: profilePucView.certificateNumber },
                        { label: 'Issuing Center', value: profilePucView.issuingCenter },
                        { label: 'Issue Date', value: profilePucView.issueDate },
                        { label: 'Expiry Date', value: profilePucView.expiryDate },
                        { label: 'Test Result', value: profilePucView.testResult },
                        { label: 'Status', value: profilePucView.pucStatus },
                        { label: 'Is Current', value: profilePucView.isCurrent },
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
                  <Typography variant="body2" color={profileView?.notes === '-' ? 'text.secondary' : 'text.primary'}>
                    {profileView?.notes || 'No notes available.'}
                  </Typography>
                </Paper>
              </Box>
            </Stack>
          )}
            </>
          )}
        </Box>
      )}

      <Dialog open={profilePrintDialogOpen} onClose={() => setProfilePrintDialogOpen(false)} fullWidth maxWidth="md">
        {(() => {
          const p0 = profilePrintSections[0];
          const gr = (lbl) => p0?.rows.find(([l]) => l === lbl)?.[1] || '-';
          const dCompany   = gr('Company');
          const dIdentCode = gr('Identify Code');
          const dRegNum    = gr('Register Number');
          const dBrand     = gr('Brand');
          const dModel     = gr('Model');
          const dVType     = gr('Vehicle Type');
          const dYear      = gr('Manufacture Year');
          const dStatus    = gr('Status');
          const dOdo       = gr('Odometer KM');
          const dEngHrs    = gr('Engine Hours');
          const dDept      = gr('Department');
          const dOper      = gr('Operational');
          const dColor     = gr('Color');
          const dCond      = gr('Condition');
          const dHeading   = dCompany !== '-' ? dCompany : 'Vehicle';
          const stColor    = dStatus === 'Active' ? 'success' : dStatus === 'Inactive' ? 'error' : 'default';
          const EXPIRY_SET = new Set(['Registration Expiry', 'Policy Expiry Date', 'Expiry Date']);
          const calcBadge  = (label, value) => {
            if (!EXPIRY_SET.has(label) || !value || value === '-') return null;
            const s = String(value).trim();
            let date = null;
            if (/^\d{4}-\d{2}-\d{2}/.test(s)) { date = new Date(s); }
            else { const p = s.split(/[/\-]/); if (p.length === 3 && p[0].length <= 2) date = new Date(`${p[2]}-${p[1].padStart(2,'0')}-${p[0].padStart(2,'0')}`); else date = new Date(s); }
            if (!date || isNaN(date.getTime())) return null;
            const today = new Date(); today.setHours(0,0,0,0);
            const diff = Math.ceil((date - today) / 86400000);
            if (diff < 0) return { color: 'error', text: 'Expired' };
            if (diff <= 30) return { color: 'warning', text: `Expiring Soon (${diff}d)` };
            return { color: 'success', text: 'Valid' };
          };
          const sectionMeta = {
            'Vehicle Profile':             { accent: theme.palette.primary.main, headerBg: '#eef3fd' },
            'Vehicle Registration':        { accent: '#7c3aed', headerBg: '#f3effe' },
            'Vehicle Insurance':           { accent: '#0891b2', headerBg: '#ecf8fc' },
            'Vehicle Fitness Certificate': { accent: '#059669', headerBg: '#ecfdf5' },
            'Vehicle Emission Test':       { accent: '#d97706', headerBg: '#fffbeb' },
          };
          return (
            <>
              {/* ── Dialog title bar ── */}
              <Box sx={{ bgcolor: '#0f172a', px: 2.5, py: 1.25, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Stack direction="row" alignItems="center" spacing={1.25}>
                  <Box sx={{ width: 30, height: 30, borderRadius: 1.5, background: `linear-gradient(135deg,${theme.palette.primary.main},${theme.palette.secondary.main})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <PrintRoundedIcon sx={{ color: '#fff', fontSize: 16 }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: 13, color: '#f1f5f9', lineHeight: 1.2 }}>Print Preview</Typography>
                    <Typography sx={{ fontSize: 10, color: '#94a3b8' }}>Vehicle Management System</Typography>
                  </Box>
                </Stack>
                <Button size="small" onClick={() => setProfilePrintDialogOpen(false)} sx={{ color: '#64748b', minWidth: 0, px: 1 }}>✕</Button>
              </Box>

              <DialogContent sx={{ p: 0, bgcolor: '#f8fafc' }}>
                {/* ── Header preview ── */}
                <Box sx={{ bgcolor: '#0f172a', px: 3, py: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.06em' }}>{dHeading}</Typography>
                  <Typography sx={{ fontSize: 10, color: '#475569' }}>Vehicle Management System</Typography>
                </Box>
                <Box sx={{ background: 'linear-gradient(120deg,#1e3a8a 0%,#1d4ed8 50%,#0369a1 100%)', color: '#fff', px: 3, pt: 2.5, pb: 2 }}>
                  <Stack direction="row" alignItems="flex-start" spacing={2} sx={{ mb: 1.5 }}>
                    {/* icon + id chip */}
                    <Stack alignItems="center" spacing={0.75} sx={{ flexShrink: 0 }}>
                      <Box sx={{ width: 54, height: 54, borderRadius: '50%', background: 'rgba(255,255,255,.15)', border: '2.5px solid rgba(255,255,255,.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                        &#x1F697;
                      </Box>
                      {dIdentCode !== '-' && (
                        <Box sx={{ background: 'rgba(255,255,255,.18)', border: '1px solid rgba(255,255,255,.3)', borderRadius: 0.75, px: 1, py: 0.25 }}>
                          <Typography sx={{ fontSize: 9, fontWeight: 800, letterSpacing: '.06em', color: '#fff' }}>{dIdentCode}</Typography>
                        </Box>
                      )}
                    </Stack>
                    {/* title block */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: 10, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', opacity: .72, color: '#fff', mb: 0.25 }}>{dHeading}</Typography>
                      <Typography sx={{ fontSize: 19, fontWeight: 900, letterSpacing: '-.03em', color: '#fff', lineHeight: 1.1, mb: 0.5 }}>{dHeading} Vehicle Profile</Typography>
                      <Typography sx={{ fontSize: 11, opacity: .78, color: '#fff', mb: 1 }}>{dBrand} {dModel} &middot; {dVType} &middot; {dYear}</Typography>
                      <Stack direction="row" spacing={0.75} flexWrap="wrap">
                        <Chip size="small" label={dStatus} color={stColor} sx={{ height: 20, fontSize: '9px', fontWeight: 700, '& .MuiChip-label': { px: 1 } }} />
                        {[dOper, dColor, dCond].filter(v => v && v !== '-').map((v) => (
                          <Box key={v} sx={{ background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.25)', borderRadius: 10, px: 1, py: 0.25 }}>
                            <Typography sx={{ fontSize: 9, fontWeight: 600, color: '#fff' }}>{v}</Typography>
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                    {/* reg + odometer */}
                    <Stack spacing={0.75} sx={{ flexShrink: 0, alignItems: 'flex-end' }}>
                      <Box sx={{ background: 'rgba(255,255,255,.15)', border: '1.5px solid rgba(255,255,255,.35)', borderRadius: 1.5, px: 2, py: 1, textAlign: 'center', minWidth: 100 }}>
                        <Typography sx={{ fontSize: 8, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', opacity: .7, color: '#fff', display: 'block', mb: 0.25 }}>Reg. Number</Typography>
                        <Typography sx={{ fontSize: 14, fontWeight: 900, letterSpacing: '.04em', color: '#fff' }}>{dRegNum}</Typography>
                      </Box>
                      <Stack direction="row" spacing={0.75}>
                        {[['KM', dOdo], ['Eng Hrs', dEngHrs]].map(([lbl, val]) => (
                          <Box key={lbl} sx={{ background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.2)', borderRadius: 1, px: 1.25, py: 0.5, textAlign: 'center', flex: 1 }}>
                            <Typography sx={{ fontSize: 12, fontWeight: 800, color: '#fff', display: 'block' }}>{val}</Typography>
                            <Typography sx={{ fontSize: 8, opacity: .65, color: '#fff', textTransform: 'uppercase', letterSpacing: '.05em' }}>{lbl}</Typography>
                          </Box>
                        ))}
                      </Stack>
                    </Stack>
                  </Stack>
                  <Stack direction="row" flexWrap="wrap" sx={{ borderTop: '1px solid rgba(255,255,255,.18)', pt: 1 }}>
                    {[['Department', dDept], ['Generated', new Date().toLocaleString('en-IN', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit', hour12:true })]].map(([lbl, val]) => (
                      <Typography key={lbl} sx={{ fontSize: 10, color: '#fff', opacity: .85, pr: 2, mr: 2, borderRight: '1px solid rgba(255,255,255,.15)', '&:last-child': { borderRight: 'none' } }}>
                        <Box component="span" sx={{ fontWeight: 700 }}>{lbl}:</Box> {val}
                      </Typography>
                    ))}
                  </Stack>
                </Box>

                {/* ── Sections ── */}
                <Box sx={{ p: 1.5, bgcolor: '#f8fafc' }}>
                  {profilePrintSections.map((section, si) => {
                    const meta = sectionMeta[section.title] || { accent: theme.palette.primary.main, headerBg: '#eef3fd' };
                    return (
                      <Paper key={section.title} variant="outlined" sx={{ borderRadius: 1.5, mb: 1.25, overflow: 'hidden', borderColor: '#e2e8f0', bgcolor: '#fff' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.875, bgcolor: meta.headerBg, borderBottom: '1px solid #f1f5f9', borderLeft: `4px solid ${meta.accent}` }}>
                          <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: meta.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Typography sx={{ fontSize: 8, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{si + 1}</Typography>
                          </Box>
                          <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#0f172a', flex: 1, letterSpacing: '.01em' }}>{section.title}</Typography>
                          <Typography sx={{ fontSize: 9, color: '#94a3b8', fontWeight: 600 }}>{section.rows.length} fields</Typography>
                        </Box>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                          {section.rows.map(([label, value], idx) => {
                            const badge = calcBadge(label, value);
                            return (
                              <Box key={`${section.title}-${label}`} sx={{ px: 1.5, py: 0.875, borderBottom: '1px solid #f8fafc', borderRight: idx % 2 === 0 ? '1px solid #f8fafc' : 'none', minWidth: 0 }}>
                                <Typography sx={{ fontSize: '9px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', mb: 0.25 }}>{label}</Typography>
                                <Stack direction="row" alignItems="center" spacing={0.5} flexWrap="wrap">
                                  <Typography sx={{ fontWeight: 600, fontSize: '11.5px', wordBreak: 'break-word', color: '#1e293b' }}>{value || '-'}</Typography>
                                  {badge && <Chip size="small" label={badge.text} color={badge.color} sx={{ height: 16, fontSize: '8.5px', fontWeight: 700, '& .MuiChip-label': { px: 0.75 } }} />}
                                </Stack>
                              </Box>
                            );
                          })}
                        </Box>
                      </Paper>
                    );
                  })}
                </Box>

                {/* ── Footer preview ── */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2.5, py: 1, borderTop: '2px solid #e2e8f0', bgcolor: '#fff' }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography sx={{ fontWeight: 800, fontSize: 12, color: theme.palette.primary.main }}>VMS</Typography>
                    <Typography sx={{ fontSize: 10, color: '#64748b' }}>&middot; {dHeading}</Typography>
                  </Stack>
                  <Typography sx={{ fontSize: 10, color: '#94a3b8' }}>{new Date().toLocaleDateString()}</Typography>
                </Box>
              </DialogContent>

              <DialogActions sx={{ px: 2.5, py: 1.5, borderTop: 1, borderColor: 'divider' }}>
                <Button onClick={() => setProfilePrintDialogOpen(false)}>Close</Button>
                <Button variant="contained" startIcon={<PrintRoundedIcon />} onClick={printProfileDocument}>Print / Save PDF</Button>
              </DialogActions>
            </>
          );
        })()}
      </Dialog>

      <Dialog open={profileQrDialogOpen} onClose={() => setProfileQrDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Company Vehicle QR</DialogTitle>
        <DialogContent dividers>
          {profileQrLoading ? (
            <Stack direction="row" spacing={1} alignItems="center">
              <CircularProgress size={18} />
              <Typography variant="body2">Loading QR...</Typography>
            </Stack>
          ) : profileQrError ? (
            <Alert severity="error">{profileQrError}</Alert>
          ) : (
            <Stack spacing={2} alignItems="center">
              <Typography variant="body2" color="text.secondary">
                Vehicle ID: {String(profileQrData?.companyVehicleId || '-')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Identify Code: {profileQrData?.identifyCode || '-'} | Register No: {profileQrData?.registrationNumber || '-'}
              </Typography>
              {profileQrData?.payload ? (
                <Box
                  component="img"
                  alt="Vehicle QR"
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(profileQrData.payload)}`}
                  sx={{ width: 280, height: 280, border: '1px solid', borderColor: 'divider', borderRadius: 1.5, p: 1, bgcolor: '#fff' }}
                />
              ) : (
                <Typography variant="body2" color="text.secondary">QR payload unavailable.</Typography>
              )}
              {profileQrData?.webLink ? (
                <Typography variant="caption" sx={{ wordBreak: 'break-all' }} color="text.secondary">
                  Link: {profileQrData.webLink}
                </Typography>
              ) : null}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProfileQrDialogOpen(false)}>Close</Button>
          <Button
            variant="outlined"
            onClick={() => {
              const id = String(profileQrData?.companyVehicleId || '');
              if (!id) return;
              const url = `${window.location.origin}/vehicle-qr-details?companyVehicleId=${encodeURIComponent(id)}`;
              window.open(url, '_blank', 'noopener,noreferrer');
            }}
            disabled={!profileQrData?.companyVehicleId}
          >
            Open Details
          </Button>
          <Button
            variant="contained"
            startIcon={<PrintRoundedIcon />}
            onClick={printProfileQr}
            disabled={!profileQrData?.payload}
          >
            Print QR
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={profileScanDialogOpen} onClose={() => setProfileScanDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Scan QR</DialogTitle>
        <DialogContent dividers>
          {profileScanError ? <Alert severity="error" sx={{ mb: 2 }}>{profileScanError}</Alert> : null}
          <TextField
            fullWidth
            multiline
            minRows={3}
            label="Scanned QR Value"
            placeholder="Paste scanned QR text (companyVehicleId=...;...)"
            value={profileScanValue}
            onChange={(e) => setProfileScanValue(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProfileScanDialogOpen(false)}>Close</Button>
          <Button variant="contained" onClick={() => { void resolveScannedQr(); }} disabled={profileScanLoading || !profileScanValue.trim()}>
            {profileScanLoading ? 'Finding...' : 'View Vehicle'}
          </Button>
        </DialogActions>
      </Dialog>

      {activeTab === 2 && profileInnerTab === 1 && (
        <Box>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Vehicle Registration History</Typography>
              <Button
                variant="contained"
                disabled={!profileVehicleId}
                onClick={() => { void openRegistrationDialog('create'); }}
              >
                Add Registration
              </Button>
            </Stack>

            {registrationError ? <Alert severity="error" sx={{ mb: 2 }}>{registrationError}</Alert> : null}
            {registrationSuccess ? <Alert severity="success" sx={{ mb: 2 }}>{registrationSuccess}</Alert> : null}

            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Registration Number</TableCell>
                    <TableCell>Registration Date</TableCell>
                    <TableCell>Expiry Date</TableCell>
                    <TableCell>Remaining Days</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>RC Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {registrationRowsLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" sx={{ py: 2 }}>
                          <CircularProgress size={18} />
                          <Typography variant="body2">Loading registration records...</Typography>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ) : registrationRows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                        No registration records found.
                      </TableCell>
                    </TableRow>
                  ) : registrationRows.map((row, idx) => {
                    const isExpired = isRegistrationExpired(row?.registrationExpiry || row?.registration_expiry);
                    const recordType = (row?.isCurrent ?? row?.is_current ?? false) ? 'Current' : 'Previous';
                    return (
                      <TableRow key={String(row?.registrationId || row?.registration_id || row?.id || idx)} hover sx={{ opacity: isExpired ? 0.55 : 1 }}>
                        <TableCell sx={{ fontWeight: 600 }}>{row?.registrationNumber || row?.registration_number || '-'}</TableCell>
                        <TableCell>{row?.registrationDate || row?.registration_date || '-'}</TableCell>
                        <TableCell>
                          <Typography sx={{ color: isExpired ? 'error.main' : 'success.main', fontWeight: 700 }}>
                            {row?.registrationExpiry || row?.registration_expiry || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ color: remainingDaysColor(remainingDaysFromDate(row?.registrationExpiry || row?.registration_expiry)), fontWeight: 700 }}>
                            {remainingDaysFromDate(row?.registrationExpiry || row?.registration_expiry)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip size="small" color={recordType === 'Current' ? 'primary' : 'default'} label={recordType} />
                        </TableCell>
                        <TableCell>{row?.rcStatus || row?.rc_status || '-'}</TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Button size="small" variant="outlined" onClick={() => { void openRegistrationDialog('view', row); }}>View</Button>
                            <Button size="small" variant="outlined" disabled={isExpired} onClick={() => { void openRegistrationDialog('edit', row); }}>Edit</Button>
                            <Button size="small" color="error" variant="outlined" disabled={isExpired} onClick={() => { void deleteRegistrationRecord(row); }}>Delete</Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          <Dialog open={registrationDialogOpen} onClose={closeRegistrationDialog} fullWidth maxWidth="lg">
            <DialogTitle>
              {registrationDialogMode === 'create' ? 'Add Registration' : (registrationDialogMode === 'edit' ? 'Edit Registration' : 'View Registration')}
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2} sx={{ mt: 0.2 }}>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small" disabled={!registrationEditMode}>
                    <InputLabel>Company</InputLabel>
                    <Select value={registrationForm.companyId} label="Company" onChange={(e) => { void handleRegistrationChange('companyId', e.target.value); }}>
                      <MenuItem value=""><em>Select Company</em></MenuItem>
                      {companies.map((c) => <MenuItem key={String(c.id)} value={String(c.id)}>{c.name || c.code || c.id}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small" disabled={!registrationEditMode || !registrationForm.companyId}>
                    <InputLabel>Company Vehicle</InputLabel>
                    <Select value={registrationForm.companyVehicleId} label="Company Vehicle" onChange={(e) => { void handleRegistrationChange('companyVehicleId', e.target.value); }}>
                      <MenuItem value=""><em>Select Company Vehicle</em></MenuItem>
                      {registrationVehicleOptions.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={4}><TextField fullWidth size="small" label="Registration Number" disabled={!registrationEditMode} inputProps={{ maxLength: registrationFieldMaxLength }} value={registrationForm.registrationNumber} onChange={(e) => { void handleRegistrationChange('registrationNumber', e.target.value); }} /></Grid>
                <Grid item xs={12} md={4}><TextField fullWidth size="small" label="Registration Date" type="date" disabled={!registrationEditMode} InputLabelProps={{ shrink: true }} value={registrationForm.registrationDate} onChange={(e) => { void handleRegistrationChange('registrationDate', e.target.value); }} /></Grid>
                <Grid item xs={12} md={4}><TextField fullWidth size="small" label="Registration Expiry" type="date" disabled={!registrationEditMode} InputLabelProps={{ shrink: true }} value={registrationForm.registrationExpiry} onChange={(e) => { void handleRegistrationChange('registrationExpiry', e.target.value); }} /></Grid>
                <Grid item xs={12} md={4}><TextField fullWidth size="small" label="Registering Authority" disabled={!registrationEditMode} inputProps={{ maxLength: registrationFieldMaxLength }} value={registrationForm.registeringAuthority} onChange={(e) => { void handleRegistrationChange('registeringAuthority', e.target.value); }} /></Grid>
                <Grid item xs={12} md={4}><TextField fullWidth size="small" label="Registration State" disabled={!registrationEditMode} inputProps={{ maxLength: registrationFieldMaxLength }} value={registrationForm.registrationState} onChange={(e) => { void handleRegistrationChange('registrationState', e.target.value); }} /></Grid>
                <Grid item xs={12} md={4}><TextField fullWidth size="small" label="Registration City" disabled={!registrationEditMode} inputProps={{ maxLength: registrationFieldMaxLength }} value={registrationForm.registrationCity} onChange={(e) => { void handleRegistrationChange('registrationCity', e.target.value); }} /></Grid>
                <Grid item xs={12} md={4}><TextField fullWidth size="small" label="RC Book Number" disabled={!registrationEditMode} inputProps={{ maxLength: registrationFieldMaxLength }} value={registrationForm.rcBookNumber} onChange={(e) => { void handleRegistrationChange('rcBookNumber', e.target.value); }} /></Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small" disabled={!registrationEditMode}>
                    <InputLabel>RC Status</InputLabel>
                    <Select value={registrationForm.rcStatus} label="RC Status" onChange={(e) => { void handleRegistrationChange('rcStatus', e.target.value); }}>
                      <MenuItem value=""><em>Select RC Status</em></MenuItem>
                      <MenuItem value="Valid">Valid</MenuItem>
                      <MenuItem value="Expired">Expired</MenuItem>
                      <MenuItem value="Suspended">Suspended</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small" disabled={!registrationEditMode}>
                    <InputLabel>Number Plate Type</InputLabel>
                    <Select value={registrationForm.numberPlateTypeId} label="Number Plate Type" onChange={(e) => { void handleRegistrationChange('numberPlateTypeId', e.target.value); }}>
                      <MenuItem value=""><em>Select Number Plate Type</em></MenuItem>
                      {numberPlateTypes.map((x) => <MenuItem key={String(x.id)} value={String(x.id)}>{x.name}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}><TextField fullWidth size="small" label="Renewal Reminder Days" type="number" disabled={!registrationEditMode} value={registrationForm.renewalReminderDays} onChange={(e) => { void handleRegistrationChange('renewalReminderDays', e.target.value); }} /></Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small" disabled={!registrationEditMode}>
                    <InputLabel>Is Current</InputLabel>
                    <Select value={registrationForm.isCurrent} label="Is Current" onChange={(e) => { void handleRegistrationChange('isCurrent', e.target.value); }}>
                      <MenuItem value=""><em>Select Current Status</em></MenuItem>
                      <MenuItem value="true">Yes</MenuItem>
                      <MenuItem value="false">No</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth size="small" label="Notes" disabled={!registrationEditMode} multiline minRows={3} inputProps={{ maxLength: registrationFieldMaxLength }} value={registrationForm.notes} onChange={(e) => { void handleRegistrationChange('notes', e.target.value); }} />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={closeRegistrationDialog}>Close</Button>
              {registrationDialogMode === 'view' ? (
                <>
                  <Button onClick={() => { setRegistrationDialogMode('edit'); setRegistrationEditMode(true); }} variant="outlined" disabled={isRegistrationExpired(registrationForm.registrationExpiry)}>Edit</Button>
                  <Button color="error" variant="outlined" disabled={isRegistrationExpired(registrationForm.registrationExpiry)} onClick={() => {
                    const row = registrationRows.find((x) => String(x?.registrationId || x?.registration_id || x?.id || '') === String(registrationRecordId || ''));
                    void deleteRegistrationRecord(row);
                  }}>Delete</Button>
                </>
              ) : (
                <Button variant="contained" onClick={submitRegistrationForm} disabled={registrationSaving || isRegistrationExpired(registrationForm.registrationExpiry)}>
                  {registrationSaving ? 'Saving...' : (registrationRecordId ? 'Update Registration' : 'Save Registration')}
                </Button>
              )}
            </DialogActions>
          </Dialog>
        </Box>
      )}

      {activeTab === 2 && profileInnerTab === 2 && (
        <Box>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Vehicle Insurance History</Typography>
              <Button variant="contained" disabled={!profileVehicleId} onClick={() => { void openInsuranceDialog('create'); }}>
                Add Insurance
              </Button>
            </Stack>

            {insuranceError ? <Alert severity="error" sx={{ mb: 2 }}>{insuranceError}</Alert> : null}
            {insuranceSuccess ? <Alert severity="success" sx={{ mb: 2 }}>{insuranceSuccess}</Alert> : null}

            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Insurance Company</TableCell>
                    <TableCell>Policy Number</TableCell>
                    <TableCell>Policy Expiry</TableCell>
                    <TableCell>Remaining Days</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {insuranceRowsLoading ? (
                    <TableRow><TableCell colSpan={7} align="center"><CircularProgress size={18} /></TableCell></TableRow>
                  ) : insuranceRows.length === 0 ? (
                    <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>No insurance records found.</TableCell></TableRow>
                  ) : insuranceRows.map((row, idx) => {
                    const isExpired = isRegistrationExpired(row?.policyExpiryDate || row?.policy_expiry_date);
                    return (
                    <TableRow key={String(row?.insuranceId || row?.insurance_id || row?.id || idx)} hover sx={{ opacity: isExpired ? 0.55 : 1 }}>
                      <TableCell>{row?.insuranceCompany || row?.insurance_company || '-'}</TableCell>
                      <TableCell>{row?.policyNumber || row?.policy_number || '-'}</TableCell>
                      <TableCell>
                        <Typography sx={{ color: isExpiredDateText(row?.policyExpiryDate || row?.policy_expiry_date) ? 'error.main' : 'success.main', fontWeight: 700 }}>
                          {row?.policyExpiryDate || row?.policy_expiry_date || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ color: remainingDaysColor(remainingDaysFromDate(row?.policyExpiryDate || row?.policy_expiry_date)), fontWeight: 700 }}>
                          {remainingDaysFromDate(row?.policyExpiryDate || row?.policy_expiry_date)}
                        </Typography>
                      </TableCell>
                      <TableCell><Chip size="small" label={(row?.isCurrent ?? row?.is_current ?? false) ? 'Current' : 'Previous'} color={(row?.isCurrent ?? row?.is_current ?? false) ? 'primary' : 'default'} /></TableCell>
                      <TableCell>{row?.insuranceStatus || row?.insurance_status || '-'}</TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Button size="small" variant="outlined" onClick={() => { void openInsuranceDialog('view', row); }}>View</Button>
                          <Button size="small" variant="outlined" disabled={isExpired} onClick={() => { void openInsuranceDialog('edit', row); }}>Edit</Button>
                          <Button size="small" color="error" variant="outlined" disabled={isExpired} onClick={() => { void deleteInsuranceRecord(row); }}>Delete</Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
          <Dialog open={insuranceDialogOpen} onClose={closeInsuranceDialog} fullWidth maxWidth="lg">
            <DialogTitle>{insuranceDialogMode === 'create' ? 'Add Insurance' : (insuranceDialogMode === 'edit' ? 'Edit Insurance' : 'View Insurance')}</DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2} sx={{ mt: 0.2 }}>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small" disabled={!insuranceEditMode}>
                    <InputLabel>Company</InputLabel>
                    <Select value={insuranceForm.companyId} label="Company" onChange={(e) => handleInsuranceChange('companyId', e.target.value)}>
                      <MenuItem value=""><em>Select Company</em></MenuItem>
                      {companies.map((c) => <MenuItem key={String(c.id)} value={String(c.id)}>{c.name || c.code || c.id}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small" disabled={!insuranceEditMode || !insuranceForm.companyId}>
                    <InputLabel>Company Vehicle</InputLabel>
                    <Select value={insuranceForm.companyVehicleId} label="Company Vehicle" onChange={(e) => handleInsuranceChange('companyVehicleId', e.target.value)}>
                      <MenuItem value=""><em>Select Company Vehicle</em></MenuItem>
                      {registrationVehicleOptions.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}><FormControl fullWidth size="small" disabled={!insuranceEditMode}><InputLabel>Insurance Company</InputLabel><Select value={insuranceForm.insuranceCompany} label="Insurance Company" onChange={(e) => handleInsuranceChange('insuranceCompany', e.target.value)}><MenuItem value=""><em>Select Supplier</em></MenuItem>{insuranceCompanySelectOptions.map((o) => (<MenuItem key={`${o.value}`} value={o.value}>{o.label}</MenuItem>))}</Select></FormControl></Grid>
                <Grid item xs={12} md={4}><TextField fullWidth size="small" label="Policy Number" disabled={!insuranceEditMode} value={insuranceForm.policyNumber} onChange={(e) => handleInsuranceChange('policyNumber', e.target.value)} /></Grid>
                <Grid item xs={12} md={4}><TextField fullWidth size="small" label="Policy Start Date" type="date" disabled={!insuranceEditMode} InputLabelProps={{ shrink: true }} value={insuranceForm.policyStartDate} onChange={(e) => handleInsuranceChange('policyStartDate', e.target.value)} /></Grid>
                <Grid item xs={12} md={4}><TextField fullWidth size="small" label="Policy Expiry Date" type="date" disabled={!insuranceEditMode} InputLabelProps={{ shrink: true }} value={insuranceForm.policyExpiryDate} onChange={(e) => handleInsuranceChange('policyExpiryDate', e.target.value)} /></Grid>
                <Grid item xs={12} md={4}><TextField fullWidth size="small" label="Premium Amount" type="number" disabled={!insuranceEditMode} value={insuranceForm.premiumAmount} onChange={(e) => handleInsuranceChange('premiumAmount', e.target.value)} /></Grid>
                <Grid item xs={12} md={4}><FormControl fullWidth size="small" disabled={!insuranceEditMode}><InputLabel>Insurance Status</InputLabel><Select value={insuranceForm.insuranceStatus} label="Insurance Status" onChange={(e) => handleInsuranceChange('insuranceStatus', e.target.value)}><MenuItem value="Active">Active</MenuItem><MenuItem value="Expired">Expired</MenuItem><MenuItem value="Cancelled">Cancelled</MenuItem></Select></FormControl></Grid>
                <Grid item xs={12} md={4}><FormControl fullWidth size="small" disabled={!insuranceEditMode}><InputLabel>Is Current</InputLabel><Select value={insuranceForm.isCurrent} label="Is Current" onChange={(e) => handleInsuranceChange('isCurrent', e.target.value)}><MenuItem value="true">Yes</MenuItem><MenuItem value="false">No</MenuItem></Select></FormControl></Grid>
                <Grid item xs={12}><TextField fullWidth size="small" label="Notes" disabled={!insuranceEditMode} multiline minRows={2} value={insuranceForm.notes} onChange={(e) => handleInsuranceChange('notes', e.target.value)} /></Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={closeInsuranceDialog}>Close</Button>
              {insuranceDialogMode === 'view' ? (
                <>
                  <Button variant="outlined" disabled={isRegistrationExpired(insuranceForm.policyExpiryDate)} onClick={() => { setInsuranceDialogMode('edit'); setInsuranceEditMode(true); }}>Edit</Button>
                  <Button color="error" variant="outlined" disabled={isRegistrationExpired(insuranceForm.policyExpiryDate)} onClick={() => { const r = insuranceRows.find((x) => String(x?.insuranceId || x?.insurance_id || x?.id || '') === String(insuranceRecordId || '')); void deleteInsuranceRecord(r); }}>Delete</Button>
                </>
              ) : (
                <Button variant="contained" onClick={submitInsuranceForm} disabled={insuranceSaving || isRegistrationExpired(insuranceForm.policyExpiryDate)}>{insuranceSaving ? 'Saving...' : (insuranceRecordId ? 'Update Insurance' : 'Save Insurance')}</Button>
              )}
            </DialogActions>
          </Dialog>
        </Box>
      )}

      {activeTab === 2 && profileInnerTab === 3 && (
        <Box>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Vehicle Fitness Certificate History</Typography>
              <Button variant="contained" disabled={!profileVehicleId} onClick={() => { void openFitnessDialog('create'); }}>
                Add Fitness Certificate
              </Button>
            </Stack>

            {fitnessError ? <Alert severity="error" sx={{ mb: 2 }}>{fitnessError}</Alert> : null}
            {fitnessSuccess ? <Alert severity="success" sx={{ mb: 2 }}>{fitnessSuccess}</Alert> : null}

            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead><TableRow><TableCell>Certificate Number</TableCell><TableCell>Issue Date</TableCell><TableCell>Expiry Date</TableCell><TableCell>Type</TableCell><TableCell>Status</TableCell><TableCell align="right">Actions</TableCell></TableRow></TableHead>
                <TableBody>
                  {fitnessRowsLoading ? <TableRow><TableCell colSpan={6} align="center"><CircularProgress size={18} /></TableCell></TableRow> : fitnessRows.length === 0 ? <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>No fitness records found.</TableCell></TableRow> : fitnessRows.map((row, idx) => (
                    <TableRow key={String(row?.fitnessId || row?.fitness_id || row?.id || idx)} hover>
                      <TableCell>{row?.certificateNumber || row?.certificate_number || '-'}</TableCell>
                      <TableCell>{row?.issueDate || row?.issue_date || '-'}</TableCell>
                      <TableCell><Typography sx={{ color: isExpiredDateText(row?.expiryDate || row?.expiry_date) ? 'error.main' : 'success.main', fontWeight: 700 }}>{row?.expiryDate || row?.expiry_date || '-'}</Typography></TableCell>
                      <TableCell><Chip size="small" label={(row?.isCurrent ?? row?.is_current ?? false) ? 'Current' : 'Previous'} color={(row?.isCurrent ?? row?.is_current ?? false) ? 'primary' : 'default'} /></TableCell>
                      <TableCell>{row?.fitnessStatus || row?.fitness_status || '-'}</TableCell>
                      <TableCell align="right"><Stack direction="row" spacing={1} justifyContent="flex-end"><Button size="small" variant="outlined" onClick={() => { void openFitnessDialog('view', row); }}>View</Button><Button size="small" variant="outlined" onClick={() => { void openFitnessDialog('edit', row); }}>Edit</Button><Button size="small" color="error" variant="outlined" onClick={() => { void deleteFitnessRecord(row); }}>Delete</Button></Stack></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
          <Dialog open={fitnessDialogOpen} onClose={closeFitnessDialog} fullWidth maxWidth="lg">
            <DialogTitle>{fitnessDialogMode === 'create' ? 'Add Fitness Certificate' : (fitnessDialogMode === 'edit' ? 'Edit Fitness Certificate' : 'View Fitness Certificate')}</DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2} sx={{ mt: 0.2 }}>
                <Grid item xs={12} md={4}><FormControl fullWidth size="small" disabled={!fitnessEditMode}><InputLabel>Company</InputLabel><Select value={fitnessForm.companyId} label="Company" onChange={(e) => handleFitnessChange('companyId', e.target.value)}><MenuItem value=""><em>Select Company</em></MenuItem>{companies.map((c) => <MenuItem key={String(c.id)} value={String(c.id)}>{c.name || c.code || c.id}</MenuItem>)}</Select></FormControl></Grid>
                <Grid item xs={12} md={4}><FormControl fullWidth size="small" disabled={!fitnessEditMode || !fitnessForm.companyId}><InputLabel>Company Vehicle</InputLabel><Select value={fitnessForm.companyVehicleId} label="Company Vehicle" onChange={(e) => handleFitnessChange('companyVehicleId', e.target.value)}><MenuItem value=""><em>Select Company Vehicle</em></MenuItem>{registrationVehicleOptions.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}</Select></FormControl></Grid>
                <Grid item xs={12} md={4}><TextField fullWidth size="small" label="Certificate Number" disabled={!fitnessEditMode} value={fitnessForm.certificateNumber} onChange={(e) => handleFitnessChange('certificateNumber', e.target.value)} /></Grid>
                <Grid item xs={12} md={4}><TextField fullWidth size="small" label="Issue Date" type="date" disabled={!fitnessEditMode} InputLabelProps={{ shrink: true }} value={fitnessForm.issueDate} onChange={(e) => handleFitnessChange('issueDate', e.target.value)} /></Grid>
                <Grid item xs={12} md={4}><TextField fullWidth size="small" label="Expiry Date" type="date" disabled={!fitnessEditMode} InputLabelProps={{ shrink: true }} value={fitnessForm.expiryDate} onChange={(e) => handleFitnessChange('expiryDate', e.target.value)} /></Grid>
                <Grid item xs={12} md={4}><TextField fullWidth size="small" label="Issuing Authority" disabled={!fitnessEditMode} value={fitnessForm.issuingAuthority} onChange={(e) => handleFitnessChange('issuingAuthority', e.target.value)} /></Grid>
                <Grid item xs={12} md={4}><FormControl fullWidth size="small" disabled={!fitnessEditMode}><InputLabel>Fitness Status</InputLabel><Select value={fitnessForm.fitnessStatus} label="Fitness Status" onChange={(e) => handleFitnessChange('fitnessStatus', e.target.value)}><MenuItem value="Valid">Valid</MenuItem><MenuItem value="Expired">Expired</MenuItem><MenuItem value="Suspended">Suspended</MenuItem></Select></FormControl></Grid>
                <Grid item xs={12} md={4}><FormControl fullWidth size="small" disabled={!fitnessEditMode}><InputLabel>Is Current</InputLabel><Select value={fitnessForm.isCurrent} label="Is Current" onChange={(e) => handleFitnessChange('isCurrent', e.target.value)}><MenuItem value="true">Yes</MenuItem><MenuItem value="false">No</MenuItem></Select></FormControl></Grid>
                <Grid item xs={12}><TextField fullWidth size="small" label="Remarks" disabled={!fitnessEditMode} multiline minRows={2} value={fitnessForm.remarks} onChange={(e) => handleFitnessChange('remarks', e.target.value)} /></Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={closeFitnessDialog}>Close</Button>
              {fitnessDialogMode === 'view' ? (
                <>
                  <Button variant="outlined" onClick={() => { setFitnessDialogMode('edit'); setFitnessEditMode(true); }}>Edit</Button>
                  <Button color="error" variant="outlined" onClick={() => { const r = fitnessRows.find((x) => String(x?.fitnessId || x?.fitness_id || x?.id || '') === String(fitnessRecordId || '')); void deleteFitnessRecord(r); }}>Delete</Button>
                </>
              ) : <Button variant="contained" onClick={submitFitnessForm} disabled={fitnessSaving}>{fitnessSaving ? 'Saving...' : (fitnessRecordId ? 'Update Fitness Certificate' : 'Save Fitness Certificate')}</Button>}
            </DialogActions>
          </Dialog>
        </Box>
      )}

      {activeTab === 2 && profileInnerTab === 4 && (
        <Box>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Emission Test History</Typography>
              <Button variant="contained" disabled={!profileVehicleId} onClick={() => { void openPucDialog('create'); }}>
                Add Emission Test
              </Button>
            </Stack>

            {pucError ? <Alert severity="error" sx={{ mb: 2 }}>{pucError}</Alert> : null}
            {pucSuccess ? <Alert severity="success" sx={{ mb: 2 }}>{pucSuccess}</Alert> : null}

            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead><TableRow><TableCell>Certificate Number</TableCell><TableCell>Issue Date</TableCell><TableCell>Expiry Date</TableCell><TableCell>Type</TableCell><TableCell>Status</TableCell><TableCell align="right">Actions</TableCell></TableRow></TableHead>
                <TableBody>
                  {pucRowsLoading ? <TableRow><TableCell colSpan={6} align="center"><CircularProgress size={18} /></TableCell></TableRow> : pucRows.length === 0 ? <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>No emission test records found.</TableCell></TableRow> : pucRows.map((row, idx) => (
                    <TableRow key={String(row?.pucId || row?.puc_id || row?.id || idx)} hover>
                      <TableCell>{row?.certificateNumber || row?.certificate_number || '-'}</TableCell>
                      <TableCell>{row?.issueDate || row?.issue_date || '-'}</TableCell>
                      <TableCell><Typography sx={{ color: isExpiredDateText(row?.expiryDate || row?.expiry_date) ? 'error.main' : 'success.main', fontWeight: 700 }}>{row?.expiryDate || row?.expiry_date || '-'}</Typography></TableCell>
                      <TableCell><Chip size="small" label={(row?.isCurrent ?? row?.is_current ?? false) ? 'Current' : 'Previous'} color={(row?.isCurrent ?? row?.is_current ?? false) ? 'primary' : 'default'} /></TableCell>
                      <TableCell>{row?.pucStatus || row?.puc_status || '-'}</TableCell>
                      <TableCell align="right"><Stack direction="row" spacing={1} justifyContent="flex-end"><Button size="small" variant="outlined" onClick={() => { void openPucDialog('view', row); }}>View</Button><Button size="small" variant="outlined" onClick={() => { void openPucDialog('edit', row); }}>Edit</Button><Button size="small" color="error" variant="outlined" onClick={() => { void deletePucRecord(row); }}>Delete</Button></Stack></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
          <Dialog open={pucDialogOpen} onClose={closePucDialog} fullWidth maxWidth="lg">
            <DialogTitle>{pucDialogMode === 'create' ? 'Add Emission Test' : (pucDialogMode === 'edit' ? 'Edit Emission Test' : 'View Emission Test')}</DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2} sx={{ mt: 0.2 }}>
                <Grid item xs={12} md={4}><FormControl fullWidth size="small" disabled={!pucEditMode}><InputLabel>Company</InputLabel><Select value={pucForm.companyId} label="Company" onChange={(e) => handlePucChange('companyId', e.target.value)}><MenuItem value=""><em>Select Company</em></MenuItem>{companies.map((c) => <MenuItem key={String(c.id)} value={String(c.id)}>{c.name || c.code || c.id}</MenuItem>)}</Select></FormControl></Grid>
                <Grid item xs={12} md={4}><FormControl fullWidth size="small" disabled={!pucEditMode || !pucForm.companyId}><InputLabel>Company Vehicle</InputLabel><Select value={pucForm.companyVehicleId} label="Company Vehicle" onChange={(e) => handlePucChange('companyVehicleId', e.target.value)}><MenuItem value=""><em>Select Company Vehicle</em></MenuItem>{registrationVehicleOptions.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}</Select></FormControl></Grid>
                <Grid item xs={12} md={4}><TextField fullWidth size="small" label="Certificate Number" disabled={!pucEditMode} value={pucForm.certificateNumber} onChange={(e) => handlePucChange('certificateNumber', e.target.value)} /></Grid>
                <Grid item xs={12} md={4}><TextField fullWidth size="small" label="Issue Date" type="date" disabled={!pucEditMode} InputLabelProps={{ shrink: true }} value={pucForm.issueDate} onChange={(e) => handlePucChange('issueDate', e.target.value)} /></Grid>
                <Grid item xs={12} md={4}><TextField fullWidth size="small" label="Expiry Date" type="date" disabled={!pucEditMode} InputLabelProps={{ shrink: true }} value={pucForm.expiryDate} onChange={(e) => handlePucChange('expiryDate', e.target.value)} /></Grid>
                <Grid item xs={12} md={4}><FormControl fullWidth size="small" disabled={!pucEditMode}><InputLabel>PUC Status</InputLabel><Select value={pucForm.pucStatus} label="PUC Status" onChange={(e) => handlePucChange('pucStatus', e.target.value)}><MenuItem value="Valid">Valid</MenuItem><MenuItem value="Expired">Expired</MenuItem></Select></FormControl></Grid>
                <Grid item xs={12} md={4}><FormControl fullWidth size="small" disabled={!pucEditMode}><InputLabel>Is Current</InputLabel><Select value={pucForm.isCurrent} label="Is Current" onChange={(e) => handlePucChange('isCurrent', e.target.value)}><MenuItem value="true">Yes</MenuItem><MenuItem value="false">No</MenuItem></Select></FormControl></Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={closePucDialog}>Close</Button>
              {pucDialogMode === 'view' ? (
                <>
                  <Button variant="outlined" onClick={() => { setPucDialogMode('edit'); setPucEditMode(true); }}>Edit</Button>
                  <Button color="error" variant="outlined" onClick={() => { const r = pucRows.find((x) => String(x?.pucId || x?.puc_id || x?.id || '') === String(pucRecordId || '')); void deletePucRecord(r); }}>Delete</Button>
                </>
              ) : <Button variant="contained" onClick={submitPucForm} disabled={pucSaving}>{pucSaving ? 'Saving...' : (pucRecordId ? 'Update Emission Test' : 'Save Emission Test')}</Button>}
            </DialogActions>
          </Dialog>
        </Box>
      )}

      {activeTab === 2 && profileInnerTab === 5 && (
        <Box>
          <CompanyVehicleLocationPanel
            companyId={profileCompanyId}
            companyVehicleId={profileVehicleId}
            vehicleRows={profileRows}
          />
        </Box>
      )}

      {activeTab === 2 && profileInnerTab === 6 && (
        <Box>
          <CompanyVehicleFuelPanel
            companyId={profileCompanyId}
            companyVehicleId={profileVehicleId}
            vehicleRows={profileRows}
          />
        </Box>
      )}

      {activeTab === 2 && profileInnerTab === 7 && (
        <Box>
          <CompanyVehicleRunningDetailsPanel
            companyId={profileCompanyId}
            companyVehicleId={profileVehicleId}
            vehicleRows={profileRows}
          />
        </Box>
      )}

    </Box>
  );
}
