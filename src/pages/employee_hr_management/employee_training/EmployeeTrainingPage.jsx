import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import CrudEntityPage from '../../organization/shared/CrudEntityPage';
import { useAuth } from '../../../app/AuthContext';
import { organizationService } from '../../../services/organizationService';
import { employeeService } from '../../../services/employee_hr_management/employee/employeeService';
import { employeeTrainingService } from '../../../services/employee_hr_management/employee_training/employeeTrainingService';
import {
  getOwnCompanyPrefill, opt, req, rowsFrom, toInt,
} from '../shared/hrCrudCommon';

export default function EmployeeTrainingPage() {
  const theme = useTheme();
  const { token, auth } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [trainingTypes, setTrainingTypes] = useState([]);

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      try {
        const [companiesRaw, hr] = await Promise.all([
          organizationService.listCompanies(token, { activeOnly: true }),
          employeeService.hrLookups(token, { activeOnly: true }),
        ]);
        setCompanies(rowsFrom(companiesRaw).map((c) => ({
          id: c.companyId, code: c.companyCode, name: c.companyName,
        })));
        setTrainingTypes(hr?.trainingTypes || []);
      } catch {
        setCompanies([]);
        setTrainingTypes([]);
      }
    };
    load();
  }, [token]);

  const companyById = useMemo(() => {
    const map = {};
    companies.forEach((c) => { map[String(c.id)] = c; });
    return map;
  }, [companies]);
  const trainingTypeById = useMemo(() => {
    const map = {};
    trainingTypes.forEach((t) => { map[String(t.id)] = t.name; });
    return map;
  }, [trainingTypes]);
  const ownCompanyPrefill = useMemo(() => getOwnCompanyPrefill(auth, companies), [auth, companies]);

  const companyOptions = useMemo(
    () => [{ value: '', label: 'All Companies' }, ...companies.map((c) => ({ value: String(c.id), label: `${c.name} (${c.code})` }))],
    [companies]
  );
  const companyFormOptions = useMemo(
    () => [{ value: '', label: 'Select Company' }, ...companies.map((c) => ({ value: String(c.id), label: `${c.name} (${c.code})` }))],
    [companies]
  );
  const trainingTypeOptions = useMemo(
    () => [{ value: '', label: 'All Types' }, ...trainingTypes.map((t) => ({ value: String(t.id), label: t.name }))],
    [trainingTypes]
  );
  const trainingTypeFormOptions = useMemo(
    () => [{ value: '', label: 'Select Type' }, ...trainingTypes.map((t) => ({ value: String(t.id), label: t.name }))],
    [trainingTypes]
  );

  return (
    <CrudEntityPage
      title="Employee Trainings"
      icon={<SchoolRoundedIcon sx={{ color: '#fff', fontSize: 20 }} />}
      gradient={`linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`}
      idKey="trainingId"
      prefillForm={ownCompanyPrefill}
      prefillFilters={ownCompanyPrefill ? { companyId: ownCompanyPrefill.companyId } : null}
      columns={[
        { key: 'trainingName', label: 'Training Name' },
        {
          key: 'companyName',
          label: 'Company',
          render: (row) => companyById[String(row.companyId)]?.name || row.companyCode || '-',
        },
        { key: 'trainingTypeId', label: 'Training Type', render: (row) => trainingTypeById[String(row.trainingTypeId)] || '-' },
        { key: 'durationHours', label: 'Duration (Hours)' },
        { key: 'provider', label: 'Provider' },
        { key: 'description', label: 'Description' },
      ]}
      filterFields={[
        { key: 'companyId', label: 'Company', type: 'autocomplete', options: companyOptions },
        { key: 'trainingName_like', label: 'Training Name' },
        { key: 'trainingTypeId', label: 'Training Type', type: 'autocomplete', options: trainingTypeOptions },
        { key: 'provider_like', label: 'Provider' },
      ]}
      formFields={[
        { key: 'companyId', label: 'Company', type: 'autocomplete', options: companyFormOptions, readonlyOnEdit: true },
        { key: 'companyCode', label: 'Company Code', readOnly: true },
        { key: 'trainingName', label: 'Training Name' },
        { key: 'trainingTypeId', label: 'Training Type', type: 'autocomplete', options: trainingTypeFormOptions },
        { key: 'durationHours', label: 'Duration (Hours)', type: 'number' },
        { key: 'provider', label: 'Provider' },
        { key: 'description', label: 'Description', fullWidth: true, minWidth: 320 },
      ]}
      defaultFilters={{
        companyId: '',
        trainingName_like: '',
        trainingTypeId: '',
        provider_like: '',
        sortBy: 'trainingName',
        sortDir: 'asc',
      }}
      emptyForm={{
        companyId: '',
        companyCode: '',
        trainingName: '',
        trainingTypeId: '',
        durationHours: '',
        provider: '',
        description: '',
      }}
      normalizePayload={(form) => ({
        companyId: opt(form.companyId),
        companyCode: req(form.companyCode),
        trainingName: req(form.trainingName),
        trainingTypeId: toInt(form.trainingTypeId),
        description: opt(form.description),
        durationHours: toInt(form.durationHours),
        provider: opt(form.provider),
      })}
      onFormFieldChange={(next, key, value) => {
        if (key === 'companyId') {
          const c = companyById[String(value)];
          return { ...next, companyCode: c?.code || '' };
        }
        return next;
      }}
      listFetcher={employeeTrainingService.list}
      getByIdFetcher={employeeTrainingService.getById}
      createFetcher={employeeTrainingService.create}
      updateFetcher={employeeTrainingService.update}
      deleteFetcher={employeeTrainingService.delete}
      autoSearch
      autoSearchDebounceMs={350}
      fitViewport
      viewportOffset={190}
    />
  );
}
