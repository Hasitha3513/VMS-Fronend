import AssignmentIndRoundedIcon from '@mui/icons-material/AssignmentIndRounded';
import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import CrudEntityPage from '../../organization/shared/CrudEntityPage';
import { useAuth } from '../../../app/AuthContext';
import { organizationService } from '../../../services/organizationService';
import { employeeService } from '../../../services/employee_hr_management/employee/employeeService';
import { employeeSkillService } from '../../../services/employee_hr_management/employee_skill/employeeSkillService';
import {
  getOwnCompanyPrefill, opt, req, rowsFrom, toInt,
} from '../shared/hrCrudCommon';

export default function EmployeeSkillPage() {
  const theme = useTheme();
  const { token, auth } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [skillCategories, setSkillCategories] = useState([]);

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
        setSkillCategories(hr?.skillCategories || []);
      } catch {
        setCompanies([]);
        setSkillCategories([]);
      }
    };
    load();
  }, [token]);

  const companyById = useMemo(() => {
    const map = {};
    companies.forEach((c) => { map[String(c.id)] = c; });
    return map;
  }, [companies]);
  const categoryById = useMemo(() => {
    const map = {};
    skillCategories.forEach((c) => { map[String(c.id)] = c.name; });
    return map;
  }, [skillCategories]);

  const ownCompanyPrefill = useMemo(
    () => getOwnCompanyPrefill(auth, companies),
    [auth, companies]
  );

  const companyOptions = useMemo(
    () => [{ value: '', label: 'All Companies' }, ...companies.map((c) => ({ value: String(c.id), label: `${c.name} (${c.code})` }))],
    [companies]
  );
  const companyFormOptions = useMemo(
    () => [{ value: '', label: 'Select Company' }, ...companies.map((c) => ({ value: String(c.id), label: `${c.name} (${c.code})` }))],
    [companies]
  );
  const categoryOptions = useMemo(
    () => [{ value: '', label: 'All Categories' }, ...skillCategories.map((x) => ({ value: String(x.id), label: x.name }))],
    [skillCategories]
  );
  const categoryFormOptions = useMemo(
    () => [{ value: '', label: 'Select Category' }, ...skillCategories.map((x) => ({ value: String(x.id), label: x.name }))],
    [skillCategories]
  );

  return (
    <CrudEntityPage
      title="Employee Skills"
      icon={<AssignmentIndRoundedIcon sx={{ color: '#fff', fontSize: 20 }} />}
      gradient={`linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`}
      idKey="skillId"
      prefillForm={ownCompanyPrefill}
      prefillFilters={ownCompanyPrefill ? { companyId: ownCompanyPrefill.companyId } : null}
      columns={[
        { key: 'skillName', label: 'Skill Name' },
        {
          key: 'companyName',
          label: 'Company',
          render: (row) => companyById[String(row.companyId)]?.name || row.companyCode || '-',
        },
        {
          key: 'skillCategoryId',
          label: 'Category',
          render: (row) => categoryById[String(row.skillCategoryId)] || '-',
        },
        { key: 'description', label: 'Description' },
      ]}
      filterFields={[
        { key: 'companyId', label: 'Company', type: 'autocomplete', options: companyOptions },
        { key: 'skillName_like', label: 'Skill Name' },
        { key: 'skillCategoryId', label: 'Category', type: 'autocomplete', options: categoryOptions },
      ]}
      formFields={[
        { key: 'companyId', label: 'Company', type: 'autocomplete', options: companyFormOptions, readonlyOnEdit: true },
        { key: 'companyCode', label: 'Company Code', readOnly: true },
        { key: 'skillName', label: 'Skill Name' },
        { key: 'skillCategoryId', label: 'Skill Category', type: 'autocomplete', options: categoryFormOptions },
        { key: 'description', label: 'Description', fullWidth: true, minWidth: 300 },
      ]}
      defaultFilters={{
        companyId: '',
        skillName_like: '',
        skillCategoryId: '',
        sortBy: 'skillName',
        sortDir: 'asc',
      }}
      emptyForm={{
        companyId: '',
        companyCode: '',
        skillName: '',
        skillCategoryId: '',
        description: '',
      }}
      normalizePayload={(form) => ({
        companyId: opt(form.companyId),
        companyCode: req(form.companyCode),
        skillName: req(form.skillName),
        skillCategoryId: toInt(form.skillCategoryId),
        description: opt(form.description),
      })}
      onFormFieldChange={(next, key, value) => {
        if (key === 'companyId') {
          const c = companyById[String(value)];
          return { ...next, companyCode: c?.code || '' };
        }
        return next;
      }}
      listFetcher={employeeSkillService.list}
      getByIdFetcher={employeeSkillService.getById}
      createFetcher={employeeSkillService.create}
      updateFetcher={employeeSkillService.update}
      deleteFetcher={employeeSkillService.delete}
      autoSearch
      autoSearchDebounceMs={350}
      fitViewport
      viewportOffset={190}
    />
  );
}
