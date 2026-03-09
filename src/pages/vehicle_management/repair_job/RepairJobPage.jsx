import BuildCircleRoundedIcon from '@mui/icons-material/BuildCircleRounded';
import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import CrudEntityPage from '../../organization/shared/CrudEntityPage';
import { useAuth } from '../../../app/AuthContext';
import { repairJobService } from '../../../services/vehicle_management/repair_job/repairJobService';
import { getOwnCompanyPrefill, opt, req, rowsFrom, toBool, toDecimal, toInt } from '../../employee_hr_management/shared/hrCrudCommon';
import { organizationService } from '../../../services/organizationService';
import { employeeService } from '../../../services/employee_hr_management/employee/employeeService';
import { breakdownRecordService } from '../../../services/vehicle_management/breakdown_record/breakdownRecordService';

export default function RepairJobPage() {
  const theme = useTheme();
  const { token, auth } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [breakdownRecordRows, setBreakdownRecordRows] = useState([]);
  const [repairTypeEnums, setRepairTypeEnums] = useState([]);
  const [statusEnums, setStatusEnums] = useState([]);

  useEffect(() => {
    (async () => {
      if (!token) return;
      const settled = await Promise.allSettled([organizationService.listCompanies(token, { activeOnly: true }), employeeService.listEmployees(token, { sortBy: 'firstName', sortDir: 'asc' }), breakdownRecordService.list(token, {}), organizationService.enumValues('repair_type', { locale: 'en-US', activeOnly: true }), organizationService.enumValues('repair_job_status', { locale: 'en-US', activeOnly: true })]);
      try {
        const getVal = (i) => (settled[i]?.status === 'fulfilled' ? settled[i].value : null);
        setCompanies(rowsFrom(getVal(0)).map((c) => ({ id: c.companyId, code: c.companyCode, name: c.companyName })));
        setEmployees(rowsFrom(getVal(1)).map((e) => ({ ...e, displayName: [e.employeeCode || '-', [e.firstName || '', e.lastName || ''].join(' ').trim() || e.employeeName || e.employeeId].join(' - ') })));
        setBreakdownRecordRows(rowsFrom(getVal(2)));
        setRepairTypeEnums(rowsFrom(getVal(3)));
        setStatusEnums(rowsFrom(getVal(4)));
      } catch {
        setCompanies([]); setEmployees([]);
        setBreakdownRecordRows([]);
        setRepairTypeEnums([]); setStatusEnums([]);
      }
    })();
  }, [token]);

  const own = useMemo(() => getOwnCompanyPrefill(auth, companies), [auth, companies]);
  const companyById = useMemo(() => Object.fromEntries(companies.map((c) => [String(c.id), c])), [companies]);
  const companyOpts = useMemo(() => [{ value: '', label: 'All Companies' }, ...companies.map((c) => ({ value: String(c.id), label: `${c.name} (${c.code})` }))], [companies]);
  const companyFormOpts = useMemo(() => [{ value: '', label: 'Select Company' }, ...companies.map((c) => ({ value: String(c.id), label: `${c.name} (${c.code})` }))], [companies]);
  const employeeLabelById = useMemo(() => Object.fromEntries(employees.map((e) => [String(e.employeeId), e.displayName])), [employees]);
  const employeeOptsByCompany = useMemo(() => { const m = {}; employees.forEach((e) => { const k = String(e.companyId || ''); (m[k] ??= []).push({ value: String(e.employeeId), label: e.displayName }); }); return m; }, [employees]);
  const breakdownRecordLabelById = useMemo(() => Object.fromEntries(breakdownRecordRows.map((r) => [String(r.breakdownId), String(r.breakdownId || r.breakdownId)])), [breakdownRecordRows]);
  const breakdownRecordOpts = useMemo(() => [{ value: '', label: 'All Breakdown Records' }, ...breakdownRecordRows.map((r) => ({ value: String(r.breakdownId), label: String(r.breakdownId || r.breakdownId) }))], [breakdownRecordRows]);
  const breakdownRecordFormOpts = useMemo(() => [{ value: '', label: 'Select Breakdown Record' }, ...breakdownRecordRows.map((r) => ({ value: String(r.breakdownId), label: String(r.breakdownId || r.breakdownId) }))], [breakdownRecordRows]);
  const repairTypeEnumById = useMemo(() => Object.fromEntries(repairTypeEnums.map((x) => [String(x.id), x.name])), [repairTypeEnums]);
  const repairTypeEnumOpts = useMemo(() => [{ value: '', label: 'All Repair Type' }, ...repairTypeEnums.map((x) => ({ value: String(x.id), label: x.name }))], [repairTypeEnums]);
  const repairTypeEnumFormOpts = useMemo(() => [{ value: '', label: 'Select Repair Type' }, ...repairTypeEnums.map((x) => ({ value: String(x.id), label: x.name }))], [repairTypeEnums]);
  const statusEnumById = useMemo(() => Object.fromEntries(statusEnums.map((x) => [String(x.id), x.name])), [statusEnums]);
  const statusEnumOpts = useMemo(() => [{ value: '', label: 'All Status' }, ...statusEnums.map((x) => ({ value: String(x.id), label: x.name }))], [statusEnums]);
  const statusEnumFormOpts = useMemo(() => [{ value: '', label: 'Select Status' }, ...statusEnums.map((x) => ({ value: String(x.id), label: x.name }))], [statusEnums]);

  return (
    <CrudEntityPage
      title="Repair Jobs"
      icon={<BuildCircleRoundedIcon sx={{ color: '#fff', fontSize: 20 }} />}
      gradient={`linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`}
      idKey="repairJobId"
      prefillForm={own}
      prefillFilters={own ? { companyId: own.companyId } : null}
      columns={[{ key: 'companyId', label: 'Company Id', render: (r) => companyById[String(r.companyId)]?.name || r.companyCode || '-' }, { key: 'breakdownId', label: 'Breakdown Id', render: (r) => breakdownRecordLabelById[String(r.breakdownId)] || '-' }, { key: 'repairTypeId', label: 'Repair Type Id', render: (r) => repairTypeEnumById[String(r.repairTypeId)] || '-' }, { key: 'diagnosisNotes', label: 'Diagnosis Notes' }, { key: 'decidedSolution', label: 'Decided Solution' }, { key: 'estimatedCost', label: 'Estimated Cost' }]}
      filterFields={[{ key: 'companyId', label: 'Company Id', type: 'autocomplete', options: companyOpts }, { key: 'breakdownId', label: 'Breakdown Id', type: 'autocomplete', options: breakdownRecordOpts }, { key: 'repairTypeId', label: 'Repair Type Id', type: 'autocomplete', options: repairTypeEnumOpts }, { key: 'startDate', label: 'Start Date', type: 'date' }, { key: 'completionDate', label: 'Completion Date', type: 'date' }, { key: 'statusId', label: 'Status Id', type: 'autocomplete', options: statusEnumOpts }]}
      formFields={[{ key: 'companyId', label: 'Company Id', type: 'autocomplete', options: companyFormOpts, readonlyOnEdit: true }, { key: 'companyCode', label: 'Company Code', readOnly: true }, { key: 'breakdownId', label: 'Breakdown Id', type: 'autocomplete', options: breakdownRecordFormOpts }, { key: 'repairTypeId', label: 'Repair Type Id', type: 'autocomplete', options: repairTypeEnumFormOpts }, { key: 'diagnosisNotes', label: 'Diagnosis Notes', fullWidth: true, minWidth: 320 }, { key: 'decidedSolution', label: 'Decided Solution', fullWidth: true, minWidth: 320 }, { key: 'estimatedCost', label: 'Estimated Cost', type: 'number' }, { key: 'actualCost', label: 'Actual Cost', type: 'number' }, { key: 'startDate', label: 'Start Date', type: 'date' }, { key: 'completionDate', label: 'Completion Date', type: 'date' }, { key: 'statusId', label: 'Status Id', type: 'autocomplete', options: statusEnumFormOpts }, { key: 'createdBy', label: 'Created By', type: 'autocomplete', optionsByForm: (f) => [{ value: '', label: 'Select Employee' }, ...(employeeOptsByCompany[String(f?.companyId || '')] || [])] }]}
      defaultFilters={{"companyId":"","breakdownId":"","repairTypeId":"","startDate":"","completionDate":"","statusId":"","sortBy":"updatedAt","sortDir":"desc"}}
      emptyForm={{"companyId":"","companyCode":"","breakdownId":"","repairTypeId":"","diagnosisNotes":"","decidedSolution":"","estimatedCost":"","actualCost":"","startDate":"","completionDate":"","statusId":"","createdBy":""}}
      normalizePayload={(f) => ({ companyId: opt(f.companyId), companyCode: req(f.companyCode), breakdownId: opt(f.breakdownId), repairTypeId: toInt(f.repairTypeId), diagnosisNotes: opt(f.diagnosisNotes), decidedSolution: opt(f.decidedSolution), estimatedCost: toDecimal(f.estimatedCost), actualCost: toDecimal(f.actualCost), startDate: opt(f.startDate), completionDate: opt(f.completionDate), statusId: toInt(f.statusId), createdBy: opt(f.createdBy) })}
      onFormFieldChange={(n, k, v) => (k === 'companyId' ? { ...n, companyCode: companyById[String(v)]?.code || '', createdBy: '' } : n)}
      mapRecordToForm={(r) => ({ ...{"companyId":"","companyCode":"","breakdownId":"","repairTypeId":"","diagnosisNotes":"","decidedSolution":"","estimatedCost":"","actualCost":"","startDate":"","completionDate":"","statusId":"","createdBy":""}, ...(r || {}) })}
      listFetcher={repairJobService.list}
      getByIdFetcher={repairJobService.getById}
      createFetcher={repairJobService.create}
      updateFetcher={repairJobService.update}
      deleteFetcher={repairJobService.delete}
      autoSearch
      autoSearchDebounceMs={350}
      fitViewport
      viewportOffset={190}
    />
  );
}
