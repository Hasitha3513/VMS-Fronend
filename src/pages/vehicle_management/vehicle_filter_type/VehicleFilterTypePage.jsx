import BuildCircleRoundedIcon from '@mui/icons-material/BuildCircleRounded';
import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import CrudEntityPage from '../../organization/shared/CrudEntityPage';
import { useAuth } from '../../../app/AuthContext';
import { organizationService } from '../../../services/organizationService';
import { vehicleFilterTypeService } from '../../../services/vehicle_management/vehicle_filter_type/vehicleFilterTypeService';
import { getOwnCompanyPrefill, opt, req, rowsFrom, toInt } from '../../employee_hr_management/shared/hrCrudCommon';

export default function VehicleFilterTypePage() {
  const theme = useTheme();
  const { token, auth } = useAuth();
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    (async () => {
      if (!token) return;
      try {
        const res = await organizationService.listCompanies(token, { activeOnly: true });
        setCompanies(rowsFrom(res).map((c) => ({ id: c.companyId, code: c.companyCode, name: c.companyName })));
      } catch {
        setCompanies([]);
      }
    })();
  }, [token]);

  const own = useMemo(() => getOwnCompanyPrefill(auth, companies), [auth, companies]);
  const companyById = useMemo(() => Object.fromEntries(companies.map((c) => [String(c.id), c])), [companies]);
  const companyOpts = useMemo(() => [{ value: '', label: 'All Companies' }, ...companies.map((c) => ({ value: String(c.id), label: `${c.name} (${c.code})` }))], [companies]);
  const companyFormOpts = useMemo(() => [{ value: '', label: 'Select Company' }, ...companies.map((c) => ({ value: String(c.id), label: `${c.name} (${c.code})` }))], [companies]);

  return (
    <CrudEntityPage
      title="Vehicle Filter Types"
      icon={<BuildCircleRoundedIcon sx={{ color: '#fff', fontSize: 20 }} />}
      gradient={`linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`}
      idKey="filterTypeId"
      prefillForm={own}
      prefillFilters={own ? { companyId: own.companyId } : null}
      columns={[
        { key: 'companyId', label: 'Company', render: (r) => companyById[String(r.companyId)]?.name || r.companyCode || '-' },
        { key: 'filterCode', label: 'Filter Code' },
        { key: 'filterName', label: 'Filter Name' },
        { key: 'typicalLifeKm', label: 'Typical Life KM' },
        { key: 'typicalLifeHours', label: 'Typical Life Hours' },
        { key: 'typicalLifeMonths', label: 'Typical Life Months' },
      ]}
      filterFields={[
        { key: 'companyId', label: 'Company', type: 'autocomplete', options: companyOpts },
        { key: 'filterCode_like', label: 'Filter Code' },
        { key: 'filterName_like', label: 'Filter Name' },
      ]}
      formFields={[
        { key: 'companyId', label: 'Company', type: 'autocomplete', options: companyFormOpts, readonlyOnEdit: true },
        { key: 'companyCode', label: 'Company Code', readOnly: true },
        { key: 'filterCode', label: 'Filter Code' },
        { key: 'filterName', label: 'Filter Name' },
        { key: 'description', label: 'Description', fullWidth: true, minWidth: 320 },
        { key: 'typicalLifeKm', label: 'Typical Life KM', type: 'number' },
        { key: 'typicalLifeHours', label: 'Typical Life Hours', type: 'number' },
        { key: 'typicalLifeMonths', label: 'Typical Life Months', type: 'number' },
      ]}
      defaultFilters={{ companyId: '', filterCode_like: '', filterName_like: '', sortBy: 'filterName', sortDir: 'asc' }}
      emptyForm={{ companyId: '', companyCode: '', filterCode: '', filterName: '', description: '', typicalLifeKm: '', typicalLifeHours: '', typicalLifeMonths: '' }}
      normalizePayload={(f) => ({
        companyId: opt(f.companyId),
        companyCode: req(f.companyCode),
        filterCode: req(f.filterCode),
        filterName: req(f.filterName),
        description: opt(f.description),
        typicalLifeKm: toInt(f.typicalLifeKm),
        typicalLifeHours: toInt(f.typicalLifeHours),
        typicalLifeMonths: toInt(f.typicalLifeMonths),
      })}
      onFormFieldChange={(n, k, v) => (k === 'companyId' ? { ...n, companyCode: companyById[String(v)]?.code || '' } : n)}
      mapRecordToForm={(r) => ({ companyId: '', companyCode: '', filterCode: '', filterName: '', description: '', typicalLifeKm: '', typicalLifeHours: '', typicalLifeMonths: '', ...(r || {}) })}
      listFetcher={vehicleFilterTypeService.list}
      getByIdFetcher={vehicleFilterTypeService.getById}
      createFetcher={vehicleFilterTypeService.create}
      updateFetcher={vehicleFilterTypeService.update}
      deleteFetcher={vehicleFilterTypeService.delete}
      autoSearch
      autoSearchDebounceMs={350}
      fitViewport
      viewportOffset={190}
    />
  );
}
