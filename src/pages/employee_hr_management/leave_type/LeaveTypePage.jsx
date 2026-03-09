import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import CrudEntityPage from '../../organization/shared/CrudEntityPage';
import { useAuth } from '../../../app/AuthContext';
import { organizationService } from '../../../services/organizationService';
import { leaveTypeService } from '../../../services/employee_hr_management/leave_type/leaveTypeService';
import { getOwnCompanyPrefill, opt, req, rowsFrom, toDecimal } from '../shared/hrCrudCommon';

export default function LeaveTypePage() {
  const theme = useTheme();
  const { token, auth } = useAuth();
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      try {
        const companiesRaw = await organizationService.listCompanies(token, { activeOnly: true });
        setCompanies(rowsFrom(companiesRaw).map((c) => ({ id: c.companyId, code: c.companyCode, name: c.companyName })));
      } catch {
        setCompanies([]);
      }
    };
    load();
  }, [token]);

  const ownCompanyPrefill = useMemo(() => getOwnCompanyPrefill(auth, companies), [auth, companies]);
  const companyById = useMemo(() => Object.fromEntries(companies.map((c) => [String(c.id), c])), [companies]);
  const companyOptions = useMemo(() => [{ value: '', label: 'All Companies' }, ...companies.map((c) => ({ value: String(c.id), label: `${c.name} (${c.code})` }))], [companies]);
  const companyFormOptions = useMemo(() => [{ value: '', label: 'Select Company' }, ...companies.map((c) => ({ value: String(c.id), label: `${c.name} (${c.code})` }))], [companies]);

  return (
    <CrudEntityPage
      title="Leave Types"
      icon={<EventAvailableRoundedIcon sx={{ color: '#fff', fontSize: 20 }} />}
      gradient={`linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`}
      idKey="leaveTypeId"
      prefillForm={ownCompanyPrefill}
      prefillFilters={ownCompanyPrefill ? { companyId: ownCompanyPrefill.companyId } : null}
      columns={[
        { key: 'companyId', label: 'Company', render: (r) => companyById[String(r.companyId)]?.name || r.companyCode || '-' },
        { key: 'leaveCode', label: 'Leave Code', type: 'code' },
        { key: 'leaveName', label: 'Leave Name' },
        { key: 'daysPerYear', label: 'Days / Year' },
      ]}
      filterFields={[
        { key: 'companyId', label: 'Company', type: 'autocomplete', options: companyOptions },
        { key: 'leaveCode_like', label: 'Leave Code' },
        { key: 'leaveName_like', label: 'Leave Name' },
      ]}
      formFields={[
        { key: 'companyId', label: 'Company', type: 'autocomplete', options: companyFormOptions, readonlyOnEdit: true },
        { key: 'companyCode', label: 'Company Code', readOnly: true },
        { key: 'leaveCode', label: 'Leave Code' },
        { key: 'leaveName', label: 'Leave Name' },
        { key: 'daysPerYear', label: 'Days Per Year', type: 'number' },
      ]}
      defaultFilters={{ companyId: '', leaveCode_like: '', leaveName_like: '', sortBy: 'leaveName', sortDir: 'asc' }}
      emptyForm={{ companyId: '', companyCode: '', leaveCode: '', leaveName: '', daysPerYear: '' }}
      normalizePayload={(f) => ({ companyId: opt(f.companyId), companyCode: req(f.companyCode), leaveCode: req(f.leaveCode), leaveName: req(f.leaveName), daysPerYear: toDecimal(f.daysPerYear) })}
      onFormFieldChange={(next, key, value) => {
        if (key === 'companyId') {
          const c = companyById[String(value)];
          return { ...next, companyCode: c?.code || '' };
        }
        return next;
      }}
      listFetcher={leaveTypeService.list}
      getByIdFetcher={leaveTypeService.getById}
      createFetcher={leaveTypeService.create}
      updateFetcher={leaveTypeService.update}
      deleteFetcher={leaveTypeService.delete}
      autoSearch
      autoSearchDebounceMs={350}
      fitViewport
      viewportOffset={190}
    />
  );
}
