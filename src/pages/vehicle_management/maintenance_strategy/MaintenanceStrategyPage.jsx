import BuildCircleRoundedIcon from '@mui/icons-material/BuildCircleRounded';
import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import CrudEntityPage from '../../organization/shared/CrudEntityPage';
import { useAuth } from '../../../app/AuthContext';
import { maintenanceStrategyService } from '../../../services/vehicle_management/maintenance_strategy/maintenanceStrategyService';
import { getOwnCompanyPrefill, opt, req, rowsFrom, toBool, toDecimal, toInt } from '../../employee_hr_management/shared/hrCrudCommon';
import { organizationService } from '../../../services/organizationService';

export default function MaintenanceStrategyPage() {
  const theme = useTheme();
  const { token, auth } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [strategyTypeEnums, setStrategyTypeEnums] = useState([]);

  useEffect(() => {
    (async () => {
      if (!token) return;
      const settled = await Promise.allSettled([organizationService.listCompanies(token, { activeOnly: true }), organizationService.enumValues('maintenance_strategy_type', { locale: 'en-US', activeOnly: true })]);
      try {
        const getVal = (i) => (settled[i]?.status === 'fulfilled' ? settled[i].value : null);
        setCompanies(rowsFrom(getVal(0)).map((c) => ({ id: c.companyId, code: c.companyCode, name: c.companyName })));
        setStrategyTypeEnums(rowsFrom(getVal(1)));
      } catch {
        setCompanies([]);
        
        setStrategyTypeEnums([]);
      }
    })();
  }, [token]);

  const own = useMemo(() => getOwnCompanyPrefill(auth, companies), [auth, companies]);
  const companyById = useMemo(() => Object.fromEntries(companies.map((c) => [String(c.id), c])), [companies]);
  const companyOpts = useMemo(() => [{ value: '', label: 'All Companies' }, ...companies.map((c) => ({ value: String(c.id), label: `${c.name} (${c.code})` }))], [companies]);
  const companyFormOpts = useMemo(() => [{ value: '', label: 'Select Company' }, ...companies.map((c) => ({ value: String(c.id), label: `${c.name} (${c.code})` }))], [companies]);
  const strategyTypeEnumById = useMemo(() => Object.fromEntries(strategyTypeEnums.map((x) => [String(x.id), x.name])), [strategyTypeEnums]);
  const strategyTypeEnumOpts = useMemo(() => [{ value: '', label: 'All Strategy Type' }, ...strategyTypeEnums.map((x) => ({ value: String(x.id), label: x.name }))], [strategyTypeEnums]);
  const strategyTypeEnumFormOpts = useMemo(() => [{ value: '', label: 'Select Strategy Type' }, ...strategyTypeEnums.map((x) => ({ value: String(x.id), label: x.name }))], [strategyTypeEnums]);

  return (
    <CrudEntityPage
      title="Maintenance Strategies"
      icon={<BuildCircleRoundedIcon sx={{ color: '#fff', fontSize: 20 }} />}
      gradient={`linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`}
      idKey="strategyId"
      prefillForm={own}
      prefillFilters={own ? { companyId: own.companyId } : null}
      columns={[{ key: 'companyId', label: 'Company Id', render: (r) => companyById[String(r.companyId)]?.name || r.companyCode || '-' }, { key: 'strategyName', label: 'Strategy Name' }, { key: 'strategyTypeId', label: 'Strategy Type Id', render: (r) => strategyTypeEnumById[String(r.strategyTypeId)] || '-' }, { key: 'description', label: 'Description' }]}
      filterFields={[{ key: 'companyId', label: 'Company Id', type: 'autocomplete', options: companyOpts }, { key: 'strategyTypeId', label: 'Strategy Type Id', type: 'autocomplete', options: strategyTypeEnumOpts }]}
      formFields={[{ key: 'companyId', label: 'Company Id', type: 'autocomplete', options: companyFormOpts, readonlyOnEdit: true }, { key: 'companyCode', label: 'Company Code', readOnly: true }, { key: 'strategyName', label: 'Strategy Name' }, { key: 'strategyTypeId', label: 'Strategy Type Id', type: 'autocomplete', options: strategyTypeEnumFormOpts }, { key: 'description', label: 'Description', fullWidth: true, minWidth: 320 }]}
      defaultFilters={{"companyId":"","strategyTypeId":"","sortBy":"strategyId","sortDir":"desc"}}
      emptyForm={{"companyId":"","companyCode":"","strategyName":"","strategyTypeId":"","description":""}}
      normalizePayload={(f) => ({ companyId: opt(f.companyId), companyCode: req(f.companyCode), strategyName: opt(f.strategyName), strategyTypeId: toInt(f.strategyTypeId), description: opt(f.description) })}
      onFormFieldChange={(n, k, v) => (k === 'companyId' ? { ...n, companyCode: companyById[String(v)]?.code || '' } : n)}
      mapRecordToForm={(r) => ({ ...{"companyId":"","companyCode":"","strategyName":"","strategyTypeId":"","description":""}, ...(r || {}) })}
      listFetcher={maintenanceStrategyService.list}
      getByIdFetcher={maintenanceStrategyService.getById}
      createFetcher={maintenanceStrategyService.create}
      updateFetcher={maintenanceStrategyService.update}
      deleteFetcher={maintenanceStrategyService.delete}
      autoSearch
      autoSearchDebounceMs={350}
      fitViewport
      viewportOffset={190}
    />
  );
}
