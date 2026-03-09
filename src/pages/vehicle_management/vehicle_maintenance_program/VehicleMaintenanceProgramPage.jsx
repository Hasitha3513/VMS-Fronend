import BuildCircleRoundedIcon from '@mui/icons-material/BuildCircleRounded';
import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import CrudEntityPage from '../../organization/shared/CrudEntityPage';
import { useAuth } from '../../../app/AuthContext';
import { vehicleMaintenanceProgramService } from '../../../services/vehicle_management/vehicle_maintenance_program/vehicleMaintenanceProgramService';
import { getOwnCompanyPrefill, opt, req, rowsFrom, toBool, toDecimal, toInt } from '../../employee_hr_management/shared/hrCrudCommon';
import { organizationService } from '../../../services/organizationService';
import { vehicleService } from '../../../services/vehicle_management/vehicle/vehicleService';
import { maintenanceProgramService } from '../../../services/vehicle_management/maintenance_program/maintenanceProgramService';

export default function VehicleMaintenanceProgramPage() {
  const theme = useTheme();
  const { token, auth } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [maintenanceProgramRows, setMaintenanceProgramRows] = useState([]);

  useEffect(() => {
    (async () => {
      if (!token) return;
      const settled = await Promise.allSettled([organizationService.listCompanies(token, { activeOnly: true }), vehicleService.list(token, {}), maintenanceProgramService.list(token, {})]);
      try {
        const getVal = (i) => (settled[i]?.status === 'fulfilled' ? settled[i].value : null);
        setCompanies(rowsFrom(getVal(0)).map((c) => ({ id: c.companyId, code: c.companyCode, name: c.companyName })));
        setVehicles(rowsFrom(getVal(1)));
        setMaintenanceProgramRows(rowsFrom(getVal(2)));
      } catch {
        setCompanies([]); setVehicles([]);
        setMaintenanceProgramRows([]);
        
      }
    })();
  }, [token]);

  const own = useMemo(() => getOwnCompanyPrefill(auth, companies), [auth, companies]);
  const companyById = useMemo(() => Object.fromEntries(companies.map((c) => [String(c.id), c])), [companies]);
  const companyOpts = useMemo(() => [{ value: '', label: 'All Companies' }, ...companies.map((c) => ({ value: String(c.id), label: `${c.name} (${c.code})` }))], [companies]);
  const companyFormOpts = useMemo(() => [{ value: '', label: 'Select Company' }, ...companies.map((c) => ({ value: String(c.id), label: `${c.name} (${c.code})` }))], [companies]);
  const vehicleLabelById = useMemo(() => Object.fromEntries(vehicles.map((v) => [String(v.vehicleId), `${v.vehicleCode || '-'} | ${v.registrationNumber || '-'}`])), [vehicles]);
  const vehicleOptsByCompany = useMemo(() => { const m = {}; vehicles.forEach((v) => { const k = String(v.companyId || ''); (m[k] ??= []).push({ value: String(v.vehicleId), label: vehicleLabelById[String(v.vehicleId)] }); }); return m; }, [vehicles, vehicleLabelById]);
  const maintenanceProgramLabelById = useMemo(() => Object.fromEntries(maintenanceProgramRows.map((r) => [String(r.programId), String(r.programName || r.programId)])), [maintenanceProgramRows]);
  const maintenanceProgramOpts = useMemo(() => [{ value: '', label: 'All Maintenance Programs' }, ...maintenanceProgramRows.map((r) => ({ value: String(r.programId), label: String(r.programName || r.programId) }))], [maintenanceProgramRows]);
  const maintenanceProgramFormOpts = useMemo(() => [{ value: '', label: 'Select Maintenance Program' }, ...maintenanceProgramRows.map((r) => ({ value: String(r.programId), label: String(r.programName || r.programId) }))], [maintenanceProgramRows]);

  return (
    <CrudEntityPage
      title="Vehicle Maintenance Programs"
      icon={<BuildCircleRoundedIcon sx={{ color: '#fff', fontSize: 20 }} />}
      gradient={`linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`}
      idKey="vehicleProgramId"
      prefillForm={own}
      prefillFilters={own ? { companyId: own.companyId } : null}
      columns={[{ key: 'companyId', label: 'Company Id', render: (r) => companyById[String(r.companyId)]?.name || r.companyCode || '-' }, { key: 'vehicleId', label: 'Vehicle Id', render: (r) => vehicleLabelById[String(r.vehicleId)] || '-' }, { key: 'programId', label: 'Program Id', render: (r) => maintenanceProgramLabelById[String(r.programId)] || '-' }, { key: 'startDate', label: 'Start Date' }, { key: 'endDate', label: 'End Date' }, { key: 'isActive', label: 'Is Active' }]}
      filterFields={[{ key: 'companyId', label: 'Company Id', type: 'autocomplete', options: companyOpts }, { key: 'vehicleId', label: 'Vehicle Id', type: 'autocomplete', optionsByForm: (f) => [{ value: '', label: 'All Vehicles' }, ...(vehicleOptsByCompany[String(f?.companyId || '')] || [])] }, { key: 'programId', label: 'Program Id', type: 'autocomplete', options: maintenanceProgramOpts }, { key: 'startDate', label: 'Start Date', type: 'date' }, { key: 'endDate', label: 'End Date', type: 'date' }]}
      formFields={[{ key: 'companyId', label: 'Company Id', type: 'autocomplete', options: companyFormOpts, readonlyOnEdit: true }, { key: 'companyCode', label: 'Company Code', readOnly: true }, { key: 'vehicleId', label: 'Vehicle Id', type: 'autocomplete', optionsByForm: (f) => [{ value: '', label: 'Select Vehicle' }, ...(vehicleOptsByCompany[String(f?.companyId || '')] || [])] }, { key: 'programId', label: 'Program Id', type: 'autocomplete', options: maintenanceProgramFormOpts }, { key: 'startDate', label: 'Start Date', type: 'date' }, { key: 'endDate', label: 'End Date', type: 'date' }, { key: 'isActive', label: 'Is Active', type: 'boolean' }]}
      defaultFilters={{"companyId":"","vehicleId":"","programId":"","startDate":"","endDate":"","sortBy":"createdAt","sortDir":"desc"}}
      emptyForm={{"companyId":"","companyCode":"","vehicleId":"","programId":"","startDate":"","endDate":"","isActive":""}}
      normalizePayload={(f) => ({ companyId: opt(f.companyId), companyCode: req(f.companyCode), vehicleId: opt(f.vehicleId), programId: opt(f.programId), startDate: opt(f.startDate), endDate: opt(f.endDate), isActive: toBool(f.isActive) })}
      onFormFieldChange={(n, k, v) => (k === 'companyId' ? { ...n, companyCode: companyById[String(v)]?.code || '', vehicleId: '' } : n)}
      mapRecordToForm={(r) => ({ ...{"companyId":"","companyCode":"","vehicleId":"","programId":"","startDate":"","endDate":"","isActive":""}, ...(r || {}) })}
      listFetcher={vehicleMaintenanceProgramService.list}
      getByIdFetcher={vehicleMaintenanceProgramService.getById}
      createFetcher={vehicleMaintenanceProgramService.create}
      updateFetcher={vehicleMaintenanceProgramService.update}
      deleteFetcher={vehicleMaintenanceProgramService.delete}
      autoSearch
      autoSearchDebounceMs={350}
      fitViewport
      viewportOffset={190}
    />
  );
}
