import BuildCircleRoundedIcon from '@mui/icons-material/BuildCircleRounded';
import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import CrudEntityPage from '../../organization/shared/CrudEntityPage';
import { useAuth } from '../../../app/AuthContext';
import { maintenanceProgramService } from '../../../services/vehicle_management/maintenance_program/maintenanceProgramService';
import { getOwnCompanyPrefill, opt, req, rowsFrom, toBool, toDecimal, toInt } from '../../employee_hr_management/shared/hrCrudCommon';
import { organizationService } from '../../../services/organizationService';

export default function MaintenanceProgramPage() {
  const theme = useTheme();
  const { token, auth } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [programTypeEnums, setProgramTypeEnums] = useState([]);

  useEffect(() => {
    (async () => {
      if (!token) return;
      const settled = await Promise.allSettled([organizationService.listCompanies(token, { activeOnly: true }), organizationService.enumValues('maintenance_program_type', { locale: 'en-US', activeOnly: true })]);
      try {
        const getVal = (i) => (settled[i]?.status === 'fulfilled' ? settled[i].value : null);
        setCompanies(rowsFrom(getVal(0)).map((c) => ({ id: c.companyId, code: c.companyCode, name: c.companyName })));
        setProgramTypeEnums(rowsFrom(getVal(1)));
      } catch {
        setCompanies([]);
        
        setProgramTypeEnums([]);
      }
    })();
  }, [token]);

  const own = useMemo(() => getOwnCompanyPrefill(auth, companies), [auth, companies]);
  const companyById = useMemo(() => Object.fromEntries(companies.map((c) => [String(c.id), c])), [companies]);
  const companyOpts = useMemo(() => [{ value: '', label: 'All Companies' }, ...companies.map((c) => ({ value: String(c.id), label: `${c.name} (${c.code})` }))], [companies]);
  const companyFormOpts = useMemo(() => [{ value: '', label: 'Select Company' }, ...companies.map((c) => ({ value: String(c.id), label: `${c.name} (${c.code})` }))], [companies]);
  const programTypeEnumById = useMemo(() => Object.fromEntries(programTypeEnums.map((x) => [String(x.id), x.name])), [programTypeEnums]);
  const programTypeEnumOpts = useMemo(() => [{ value: '', label: 'All Program Type' }, ...programTypeEnums.map((x) => ({ value: String(x.id), label: x.name }))], [programTypeEnums]);
  const programTypeEnumFormOpts = useMemo(() => [{ value: '', label: 'Select Program Type' }, ...programTypeEnums.map((x) => ({ value: String(x.id), label: x.name }))], [programTypeEnums]);

  return (
    <CrudEntityPage
      title="Maintenance Programs"
      icon={<BuildCircleRoundedIcon sx={{ color: '#fff', fontSize: 20 }} />}
      gradient={`linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`}
      idKey="programId"
      prefillForm={own}
      prefillFilters={own ? { companyId: own.companyId } : null}
      columns={[{ key: 'companyId', label: 'Company Id', render: (r) => companyById[String(r.companyId)]?.name || r.companyCode || '-' }, { key: 'programName', label: 'Program Name' }, { key: 'programTypeId', label: 'Program Type Id', render: (r) => programTypeEnumById[String(r.programTypeId)] || '-' }, { key: 'description', label: 'Description' }, { key: 'isActive', label: 'Is Active' }]}
      filterFields={[{ key: 'companyId', label: 'Company Id', type: 'autocomplete', options: companyOpts }, { key: 'programTypeId', label: 'Program Type Id', type: 'autocomplete', options: programTypeEnumOpts }]}
      formFields={[{ key: 'companyId', label: 'Company Id', type: 'autocomplete', options: companyFormOpts, readonlyOnEdit: true }, { key: 'companyCode', label: 'Company Code', readOnly: true }, { key: 'programName', label: 'Program Name' }, { key: 'programTypeId', label: 'Program Type Id', type: 'autocomplete', options: programTypeEnumFormOpts }, { key: 'description', label: 'Description', fullWidth: true, minWidth: 320 }, { key: 'isActive', label: 'Is Active', type: 'boolean' }]}
      defaultFilters={{"companyId":"","programTypeId":"","sortBy":"createdAt","sortDir":"desc"}}
      emptyForm={{"companyId":"","companyCode":"","programName":"","programTypeId":"","description":"","isActive":""}}
      normalizePayload={(f) => ({ companyId: opt(f.companyId), companyCode: req(f.companyCode), programName: opt(f.programName), programTypeId: toInt(f.programTypeId), description: opt(f.description), isActive: toBool(f.isActive) })}
      onFormFieldChange={(n, k, v) => (k === 'companyId' ? { ...n, companyCode: companyById[String(v)]?.code || '' } : n)}
      mapRecordToForm={(r) => ({ ...{"companyId":"","companyCode":"","programName":"","programTypeId":"","description":"","isActive":""}, ...(r || {}) })}
      listFetcher={maintenanceProgramService.list}
      getByIdFetcher={maintenanceProgramService.getById}
      createFetcher={maintenanceProgramService.create}
      updateFetcher={maintenanceProgramService.update}
      deleteFetcher={maintenanceProgramService.delete}
      autoSearch
      autoSearchDebounceMs={350}
      fitViewport
      viewportOffset={190}
    />
  );
}
