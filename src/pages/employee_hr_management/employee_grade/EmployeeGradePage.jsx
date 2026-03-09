import GradeRoundedIcon from '@mui/icons-material/GradeRounded';
import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import CrudEntityPage from '../../organization/shared/CrudEntityPage';
import { useAuth } from '../../../app/AuthContext';
import { organizationService } from '../../../services/organizationService';
import { employeeService } from '../../../services/employee_hr_management/employee/employeeService';
import { employeeGradeService } from '../../../services/employee_hr_management/employee_grade/employeeGradeService';

const req = (v) => (v ?? '').toString().trim();
const opt = (v) => {
  const s = (v ?? '').toString().trim();
  return s === '' ? null : s;
};
const toInt = (v) => {
  const s = opt(v);
  return s == null ? null : Number.parseInt(s, 10);
};
const toDecimal = (v) => {
  const s = opt(v);
  if (s == null) return null;
  const n = Number.parseFloat(s);
  return Number.isFinite(n) ? n : null;
};
const rowsFrom = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const money = (v) => {
  if (v == null || v === '') return '-';
  const n = Number(v);
  if (!Number.isFinite(n)) return String(v);
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export default function EmployeeGradePage() {
  const theme = useTheme();
  const { token, auth } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      try {
        const [companiesRaw, hr] = await Promise.all([
          organizationService.listCompanies(token, { activeOnly: true }),
          employeeService.hrLookups(token, { activeOnly: true }),
        ]);
        setCompanies(rowsFrom(companiesRaw).map((c) => ({
          id: c.companyId,
          code: c.companyCode,
          name: c.companyName,
        })));
        setCategories((hr?.employeeCategories || []).map((c) => ({
          id: c.id,
          code: c.code,
          name: c.name,
        })));
      } catch {
        setCompanies([]);
        setCategories([]);
      }
    };
    load();
  }, [token]);

  const companyById = useMemo(() => {
    const m = {};
    companies.forEach((c) => { m[String(c.id)] = c; });
    return m;
  }, [companies]);

  const categoryById = useMemo(() => {
    const m = {};
    categories.forEach((c) => { m[String(c.id)] = c; });
    return m;
  }, [categories]);

  const companyOptions = useMemo(
    () => [{ value: '', label: 'All Companies' }, ...companies.map((c) => ({ value: String(c.id), label: `${c.name} (${c.code})` }))],
    [companies]
  );
  const companyFormOptions = useMemo(
    () => [{ value: '', label: 'Select Company' }, ...companies.map((c) => ({ value: String(c.id), label: `${c.name} (${c.code})` }))],
    [companies]
  );
  const categoryOptions = useMemo(
    () => [{ value: '', label: 'All Categories' }, ...categories.map((c) => ({ value: String(c.id), label: c.name }))],
    [categories]
  );
  const categoryFormOptions = useMemo(
    () => [{ value: '', label: 'Select Category' }, ...categories.map((c) => ({ value: String(c.id), label: c.name }))],
    [categories]
  );

  const ownCompanyPrefill = useMemo(() => {
    if (!auth?.companyCode) return null;
    const own = companies.find((c) => String(c.code).toLowerCase() === String(auth.companyCode).toLowerCase());
    if (!own) return null;
    return { companyId: String(own.id), companyCode: own.code };
  }, [auth, companies]);

  return (
    <CrudEntityPage
      title="Employee Grades"
      icon={<GradeRoundedIcon sx={{ color: '#fff', fontSize: 20 }} />}
      gradient={`linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`}
      idKey="gradeId"
      prefillForm={ownCompanyPrefill}
      prefillFilters={ownCompanyPrefill ? { companyId: ownCompanyPrefill.companyId } : null}
      columns={[
        { key: 'gradeCode', label: 'Grade Code', type: 'code' },
        { key: 'gradeName', label: 'Grade Name' },
        {
          key: 'companyName',
          label: 'Company',
          render: (row) => companyById[String(row.companyId)]?.name || row.companyCode || '-',
        },
        {
          key: 'categoryName',
          label: 'Category',
          render: (row) => categoryById[String(row.categoryId)]?.name || '-',
        },
        {
          key: 'baseSalary',
          label: 'Base Salary',
          render: (row) => money(row.baseSalary),
        },
        {
          key: 'baseAllowance',
          label: 'Base Allowance',
          render: (row) => money(row.baseAllowance),
        },
        {
          key: 'dailyAllowance',
          label: 'Daily Allowance',
          render: (row) => money(row.dailyAllowance),
        },
        {
          key: 'overtimeRatePerHour',
          label: 'OT / Hour',
          render: (row) => money(row.overtimeRatePerHour),
        },
      ]}
      filterFields={[
        { key: 'companyId', label: 'Company', type: 'autocomplete', options: companyOptions },
        { key: 'categoryId', label: 'Category', type: 'autocomplete', options: categoryOptions },
        { key: 'gradeCode_like', label: 'Grade Code' },
        { key: 'gradeName_like', label: 'Grade Name' },
      ]}
      formFields={[
        { key: 'companyId', label: 'Company', type: 'autocomplete', options: companyFormOptions, readonlyOnEdit: true },
        { key: 'companyCode', label: 'Company Code', readOnly: true },
        { key: 'gradeCode', label: 'Grade Code', readonlyOnEdit: true },
        { key: 'gradeName', label: 'Grade Name' },
        { key: 'categoryId', label: 'Category', type: 'autocomplete', options: categoryFormOptions },
        { key: 'baseSalary', label: 'Base Salary', type: 'number' },
        { key: 'baseAllowance', label: 'Base Allowance', type: 'number' },
        { key: 'dailyAllowance', label: 'Daily Allowance', type: 'number' },
        { key: 'overtimeRatePerHour', label: 'Overtime Rate / Hour', type: 'number' },
        { key: 'notes', label: 'Notes', fullWidth: true, minWidth: 320 },
      ]}
      defaultFilters={{
        companyId: '',
        categoryId: '',
        gradeCode_like: '',
        gradeName_like: '',
        sortBy: 'gradeCode',
        sortDir: 'asc',
      }}
      emptyForm={{
        companyId: '',
        companyCode: '',
        gradeCode: '',
        gradeName: '',
        categoryId: '',
        baseSalary: '',
        baseAllowance: '',
        dailyAllowance: '',
        overtimeRatePerHour: '',
        notes: '',
      }}
      normalizePayload={(form) => ({
        companyId: opt(form.companyId),
        companyCode: req(form.companyCode),
        gradeCode: req(form.gradeCode),
        gradeName: req(form.gradeName),
        categoryId: toInt(form.categoryId),
        baseSalary: toDecimal(form.baseSalary),
        baseAllowance: toDecimal(form.baseAllowance),
        dailyAllowance: toDecimal(form.dailyAllowance),
        overtimeRatePerHour: toDecimal(form.overtimeRatePerHour),
        notes: opt(form.notes),
      })}
      onFormFieldChange={(next, key, value) => {
        if (key === 'companyId') {
          const c = companyById[String(value)];
          return { ...next, companyCode: c?.code || '' };
        }
        return next;
      }}
      listFetcher={employeeGradeService.list}
      getByIdFetcher={employeeGradeService.getById}
      createFetcher={employeeGradeService.create}
      updateFetcher={employeeGradeService.update}
      deleteFetcher={employeeGradeService.delete}
      autoSearch
      autoSearchDebounceMs={350}
      fitViewport
      viewportOffset={190}
    />
  );
}
