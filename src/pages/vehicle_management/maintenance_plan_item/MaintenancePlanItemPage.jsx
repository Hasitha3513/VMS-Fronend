import BuildCircleRoundedIcon from '@mui/icons-material/BuildCircleRounded';
import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import CrudEntityPage from '../../organization/shared/CrudEntityPage';
import { useAuth } from '../../../app/AuthContext';
import { maintenancePlanItemService } from '../../../services/vehicle_management/maintenance_plan_item/maintenancePlanItemService';
import { getOwnCompanyPrefill, opt, req, rowsFrom, toBool, toDecimal, toInt } from '../../employee_hr_management/shared/hrCrudCommon';
import { organizationService } from '../../../services/organizationService';
import { maintenancePlanService } from '../../../services/vehicle_management/maintenance_plan/maintenancePlanService';
import { maintenanceStandardService } from '../../../services/vehicle_management/maintenance_standard/maintenanceStandardService';

export default function MaintenancePlanItemPage() {
  const theme = useTheme();
  const { token, auth } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [maintenancePlanRows, setMaintenancePlanRows] = useState([]);
  const [maintenanceStandardRows, setMaintenanceStandardRows] = useState([]);
  const [statusEnums, setStatusEnums] = useState([]);

  useEffect(() => {
    (async () => {
      if (!token) return;
      const settled = await Promise.allSettled([organizationService.listCompanies(token, { activeOnly: true }), maintenancePlanService.list(token, {}), maintenanceStandardService.list(token, {}), organizationService.enumValues('maintenance_plan_item_status', { locale: 'en-US', activeOnly: true })]);
      try {
        const getVal = (i) => (settled[i]?.status === 'fulfilled' ? settled[i].value : null);
        setCompanies(rowsFrom(getVal(0)).map((c) => ({ id: c.companyId, code: c.companyCode, name: c.companyName })));
        setMaintenancePlanRows(rowsFrom(getVal(1)));
        setMaintenanceStandardRows(rowsFrom(getVal(2)));
        setStatusEnums(rowsFrom(getVal(3)));
      } catch {
        setCompanies([]);
        setMaintenancePlanRows([]); setMaintenanceStandardRows([]);
        setStatusEnums([]);
      }
    })();
  }, [token]);

  const own = useMemo(() => getOwnCompanyPrefill(auth, companies), [auth, companies]);
  const companyById = useMemo(() => Object.fromEntries(companies.map((c) => [String(c.id), c])), [companies]);
  const companyOpts = useMemo(() => [{ value: '', label: 'All Companies' }, ...companies.map((c) => ({ value: String(c.id), label: `${c.name} (${c.code})` }))], [companies]);
  const companyFormOpts = useMemo(() => [{ value: '', label: 'Select Company' }, ...companies.map((c) => ({ value: String(c.id), label: `${c.name} (${c.code})` }))], [companies]);
  const maintenancePlanLabelById = useMemo(() => Object.fromEntries(maintenancePlanRows.map((r) => [String(r.planId), String(r.planName || r.planId)])), [maintenancePlanRows]);
  const maintenancePlanOpts = useMemo(() => [{ value: '', label: 'All Maintenance Plans' }, ...maintenancePlanRows.map((r) => ({ value: String(r.planId), label: String(r.planName || r.planId) }))], [maintenancePlanRows]);
  const maintenancePlanFormOpts = useMemo(() => [{ value: '', label: 'Select Maintenance Plan' }, ...maintenancePlanRows.map((r) => ({ value: String(r.planId), label: String(r.planName || r.planId) }))], [maintenancePlanRows]);
  const maintenanceStandardLabelById = useMemo(() => Object.fromEntries(maintenanceStandardRows.map((r) => [String(r.standardId), String(r.name || r.standardId)])), [maintenanceStandardRows]);
  const maintenanceStandardOpts = useMemo(() => [{ value: '', label: 'All Maintenance Standards' }, ...maintenanceStandardRows.map((r) => ({ value: String(r.standardId), label: String(r.name || r.standardId) }))], [maintenanceStandardRows]);
  const maintenanceStandardFormOpts = useMemo(() => [{ value: '', label: 'Select Maintenance Standard' }, ...maintenanceStandardRows.map((r) => ({ value: String(r.standardId), label: String(r.name || r.standardId) }))], [maintenanceStandardRows]);
  const statusEnumById = useMemo(() => Object.fromEntries(statusEnums.map((x) => [String(x.id), x.name])), [statusEnums]);
  const statusEnumOpts = useMemo(() => [{ value: '', label: 'All Status' }, ...statusEnums.map((x) => ({ value: String(x.id), label: x.name }))], [statusEnums]);
  const statusEnumFormOpts = useMemo(() => [{ value: '', label: 'Select Status' }, ...statusEnums.map((x) => ({ value: String(x.id), label: x.name }))], [statusEnums]);

  return (
    <CrudEntityPage
      title="Maintenance Plan Items"
      icon={<BuildCircleRoundedIcon sx={{ color: '#fff', fontSize: 20 }} />}
      gradient={`linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`}
      idKey="planItemId"
      prefillForm={own}
      prefillFilters={own ? { companyId: own.companyId } : null}
      columns={[{ key: 'companyId', label: 'Company Id', render: (r) => companyById[String(r.companyId)]?.name || r.companyCode || '-' }, { key: 'planId', label: 'Plan Id', render: (r) => maintenancePlanLabelById[String(r.planId)] || '-' }, { key: 'standardId', label: 'Standard Id', render: (r) => maintenanceStandardLabelById[String(r.standardId)] || '-' }, { key: 'itemDescription', label: 'Item Description' }, { key: 'scheduledDate', label: 'Scheduled Date' }, { key: 'estimatedCost', label: 'Estimated Cost' }]}
      filterFields={[{ key: 'companyId', label: 'Company Id', type: 'autocomplete', options: companyOpts }, { key: 'planId', label: 'Plan Id', type: 'autocomplete', options: maintenancePlanOpts }, { key: 'standardId', label: 'Standard Id', type: 'autocomplete', options: maintenanceStandardOpts }, { key: 'scheduledDate', label: 'Scheduled Date', type: 'date' }, { key: 'statusId', label: 'Status Id', type: 'autocomplete', options: statusEnumOpts }, { key: 'completedDate', label: 'Completed Date', type: 'date' }]}
      formFields={[{ key: 'companyId', label: 'Company Id', type: 'autocomplete', options: companyFormOpts, readonlyOnEdit: true }, { key: 'companyCode', label: 'Company Code', readOnly: true }, { key: 'planId', label: 'Plan Id', type: 'autocomplete', options: maintenancePlanFormOpts }, { key: 'standardId', label: 'Standard Id', type: 'autocomplete', options: maintenanceStandardFormOpts }, { key: 'itemDescription', label: 'Item Description', fullWidth: true, minWidth: 320 }, { key: 'scheduledDate', label: 'Scheduled Date', type: 'date' }, { key: 'estimatedCost', label: 'Estimated Cost', type: 'number' }, { key: 'actualCost', label: 'Actual Cost', type: 'number' }, { key: 'statusId', label: 'Status Id', type: 'autocomplete', options: statusEnumFormOpts }, { key: 'completedDate', label: 'Completed Date', type: 'date' }, { key: 'notes', label: 'Notes', fullWidth: true, minWidth: 320 }]}
      defaultFilters={{"companyId":"","planId":"","standardId":"","scheduledDate":"","statusId":"","completedDate":"","sortBy":"createdAt","sortDir":"desc"}}
      emptyForm={{"companyId":"","companyCode":"","planId":"","standardId":"","itemDescription":"","scheduledDate":"","estimatedCost":"","actualCost":"","statusId":"","completedDate":"","notes":""}}
      normalizePayload={(f) => ({ companyId: opt(f.companyId), companyCode: req(f.companyCode), planId: opt(f.planId), standardId: opt(f.standardId), itemDescription: opt(f.itemDescription), scheduledDate: opt(f.scheduledDate), estimatedCost: toDecimal(f.estimatedCost), actualCost: toDecimal(f.actualCost), statusId: toInt(f.statusId), completedDate: opt(f.completedDate), notes: opt(f.notes) })}
      onFormFieldChange={(n, k, v) => (k === 'companyId' ? { ...n, companyCode: companyById[String(v)]?.code || '' } : n)}
      mapRecordToForm={(r) => ({ ...{"companyId":"","companyCode":"","planId":"","standardId":"","itemDescription":"","scheduledDate":"","estimatedCost":"","actualCost":"","statusId":"","completedDate":"","notes":""}, ...(r || {}) })}
      listFetcher={maintenancePlanItemService.list}
      getByIdFetcher={maintenancePlanItemService.getById}
      createFetcher={maintenancePlanItemService.create}
      updateFetcher={maintenancePlanItemService.update}
      deleteFetcher={maintenancePlanItemService.delete}
      autoSearch
      autoSearchDebounceMs={350}
      fitViewport
      viewportOffset={190}
    />
  );
}
