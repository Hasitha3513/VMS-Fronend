import PaidRoundedIcon from '@mui/icons-material/PaidRounded';
import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import CrudEntityPage from '../../organization/shared/CrudEntityPage';
import { useAuth } from '../../../app/AuthContext';
import { organizationService } from '../../../services/organizationService';
import { vehicleService } from '../../../services/vehicle_management/vehicle/vehicleService';
import { vehicleOperatingCostService } from '../../../services/vehicle_management/vehicle_operating_cost/vehicleOperatingCostService';
import { fmtMoney, getOwnCompanyPrefill, opt, req, rowsFrom, toDecimal, toInt } from '../../employee_hr_management/shared/hrCrudCommon';

export default function VehicleOperatingCostPage() {
  const theme = useTheme();
  const { token, auth } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [costTypes, setCostTypes] = useState([]);

  useEffect(() => {
    (async () => {
      if (!token) return;
      const settled = await Promise.allSettled([
        organizationService.listCompanies(token, { activeOnly: true }),
        vehicleService.list(token, {}),
      organizationService.enumValues('cost_type', { locale: 'en-US', activeOnly: true }),
      ]);
      try {
        setCompanies(rowsFrom(settled[0]?.status === 'fulfilled' ? settled[0].value : null).map((c) => ({ id: c.companyId, code: c.companyCode, name: c.companyName })));
        setVehicles(rowsFrom(settled[1]?.status === 'fulfilled' ? settled[1].value : null));
        setCostTypes(rowsFrom(settled[2]?.status === 'fulfilled' ? settled[2].value : null));
      } catch {
        setCompanies([]);
        setVehicles([]);
        setCostTypes([]);
      }
    })();
  }, [token]);

  const own = useMemo(() => getOwnCompanyPrefill(auth, companies), [auth, companies]);
  const companyById = useMemo(() => Object.fromEntries(companies.map((c) => [String(c.id), c])), [companies]);
  const vehicleLabelById = useMemo(() => Object.fromEntries(vehicles.map((v) => [String(v.vehicleId), `${v.vehicleCode || '-'} | ${v.registrationNumber || '-'}`])), [vehicles]);
  const costTypeById = useMemo(() => Object.fromEntries(costTypes.map((x) => [String(x.id), x.name])), [costTypes]);

  const vehicleOptsByCompany = useMemo(() => {
    const m = {};
    vehicles.forEach((v) => {
      const k = String(v.companyId || '');
      (m[k] ??= []).push({ value: String(v.vehicleId), label: vehicleLabelById[String(v.vehicleId)] });
    });
    return m;
  }, [vehicles, vehicleLabelById]);

  const companyOpts = useMemo(() => [{ value: '', label: 'All Companies' }, ...companies.map((c) => ({ value: String(c.id), label: `${c.name} (${c.code})` }))], [companies]);
  const companyFormOpts = useMemo(() => [{ value: '', label: 'Select Company' }, ...companies.map((c) => ({ value: String(c.id), label: `${c.name} (${c.code})` }))], [companies]);
  const costTypeOpts = useMemo(() => [{ value: '', label: 'All Cost Types' }, ...costTypes.map((x) => ({ value: String(x.id), label: x.name }))], [costTypes]);
  const costTypeFormOpts = useMemo(() => [{ value: '', label: 'Select Cost Type' }, ...costTypes.map((x) => ({ value: String(x.id), label: x.name }))], [costTypes]);

  return (
    <CrudEntityPage
      title="Vehicle Operating Costs"
      icon={<PaidRoundedIcon sx={{ color: '#fff', fontSize: 20 }} />}
      gradient={`linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`}
      idKey="costId"
      prefillForm={own}
      prefillFilters={own ? { companyId: own.companyId } : null}
      columns={[
        { key: 'costDate', label: 'Cost Date' },
        { key: 'companyId', label: 'Company', render: (r) => companyById[String(r.companyId)]?.name || r.companyCode || '-' },
        { key: 'vehicleId', label: 'Vehicle', render: (r) => vehicleLabelById[String(r.vehicleId)] || '-' },
        { key: 'costTypeId', label: 'Cost Type', render: (r) => costTypeById[String(r.costTypeId)] || '-' },
        { key: 'amount', label: 'Amount', render: (r) => fmtMoney(r.amount) },
        { key: 'odometerKm', label: 'Odometer KM' },
      ]}
      filterFields={[
        { key: 'companyId', label: 'Company', type: 'autocomplete', options: companyOpts },
        { key: 'vehicleId', label: 'Vehicle', type: 'autocomplete', optionsByForm: (f) => [{ value: '', label: 'All Vehicles' }, ...(vehicleOptsByCompany[String(f?.companyId || '')] || [])] },
        { key: 'costTypeId', label: 'Cost Type', type: 'autocomplete', options: costTypeOpts },
        { key: 'costDate', label: 'Cost Date', type: 'date' },
      ]}
      formFields={[
        { key: 'companyId', label: 'Company', type: 'autocomplete', options: companyFormOpts, readonlyOnEdit: true },
        { key: 'companyCode', label: 'Company Code', readOnly: true },
        { key: 'vehicleId', label: 'Vehicle', type: 'autocomplete', optionsByForm: (f) => [{ value: '', label: 'Select Vehicle' }, ...(vehicleOptsByCompany[String(f?.companyId || '')] || [])] },
        { key: 'costDate', label: 'Cost Date', type: 'date' },
        { key: 'costTypeId', label: 'Cost Type', type: 'autocomplete', options: costTypeFormOpts },
        { key: 'description', label: 'Description', fullWidth: true, minWidth: 300 },
        { key: 'amount', label: 'Amount', type: 'number' },
        { key: 'odometerKm', label: 'Odometer KM', type: 'number' },
        { key: 'referenceType', label: 'Reference Type' },
        { key: 'referenceId', label: 'Reference ID' },
      ]}
      defaultFilters={{ companyId: '', vehicleId: '', costTypeId: '', costDate: '', sortBy: 'costDate', sortDir: 'desc' }}
      emptyForm={{ companyId: '', companyCode: '', vehicleId: '', costDate: '', costTypeId: '', description: '', amount: '', odometerKm: '', referenceType: '', referenceId: '' }}
      normalizePayload={(f) => ({
        companyId: opt(f.companyId),
        companyCode: req(f.companyCode),
        vehicleId: opt(f.vehicleId),
        costDate: opt(f.costDate),
        costTypeId: toInt(f.costTypeId),
        description: opt(f.description),
        amount: toDecimal(f.amount),
        odometerKm: toDecimal(f.odometerKm),
        referenceType: opt(f.referenceType),
        referenceId: opt(f.referenceId),
      })}
      onFormFieldChange={(n, k, v) => (k === 'companyId'
        ? { ...n, companyCode: companyById[String(v)]?.code || '', vehicleId: '' }
        : n)}
      mapRecordToForm={(r) => ({ companyId: '', companyCode: '', vehicleId: '', costDate: '', costTypeId: '', description: '', amount: '', odometerKm: '', referenceType: '', referenceId: '', ...(r || {}) })}
      listFetcher={vehicleOperatingCostService.list}
      getByIdFetcher={vehicleOperatingCostService.getById}
      createFetcher={vehicleOperatingCostService.create}
      updateFetcher={vehicleOperatingCostService.update}
      deleteFetcher={vehicleOperatingCostService.delete}
      autoSearch
      autoSearchDebounceMs={350}
      fitViewport
      viewportOffset={190}
    />
  );
}
