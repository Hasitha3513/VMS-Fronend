import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import CrudEntityPage from '../../organization/shared/CrudEntityPage';
import { useAuth } from '../../../app/AuthContext';
import { organizationService } from '../../../services/organizationService';
import { employeeService } from '../../../services/employee_hr_management/employee/employeeService';
import {
  getOwnCompanyPrefill,
  opt,
  req,
  rowsFrom,
  toBool,
  toInt,
} from '../shared/hrCrudCommon';

const toUuid = (v) => {
  const s = opt(v);
  return s == null ? null : s;
};

const roleLabel = (row) => {
  const tags = [];
  if (row?.isDriver) tags.push('Driver');
  if (row?.isOperator) tags.push('Operator');
  if (row?.isTechnician) tags.push('Technician');
  return tags.length ? tags.join(', ') : '-';
};

export default function EmployeeViewDetailsPage() {
  const theme = useTheme();
  const { token, auth } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [branches, setBranches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [genders, setGenders] = useState([]);
  const [employmentTypes, setEmploymentTypes] = useState([]);
  const [employmentStatuses, setEmploymentStatuses] = useState([]);

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      try {
        const [companiesRaw, branchesRaw, departmentsRaw, hr] = await Promise.all([
          organizationService.listCompanies(token, { activeOnly: true }),
          organizationService.listBranches(token, { activeOnly: true }),
          organizationService.listDepartments(token, { activeOnly: true }),
          employeeService.hrLookups(token, { activeOnly: true }),
        ]);

        setCompanies(rowsFrom(companiesRaw).map((c) => ({
          id: c.companyId,
          code: c.companyCode,
          name: c.companyName,
        })));
        setBranches(rowsFrom(branchesRaw).map((b) => ({
          id: b.branchId,
          code: b.branchCode,
          name: b.branchName,
          companyId: b.companyId,
        })));
        setDepartments(rowsFrom(departmentsRaw).map((d) => ({
          id: d.departmentId,
          code: d.departmentCode,
          name: d.departmentName,
          companyId: d.companyId,
          branchId: d.branchId,
        })));
        setGenders(hr?.genders || []);
        setEmploymentTypes(hr?.employmentTypes || []);
        setEmploymentStatuses(hr?.employmentStatuses || []);
      } catch {
        setCompanies([]);
        setBranches([]);
        setDepartments([]);
        setGenders([]);
        setEmploymentTypes([]);
        setEmploymentStatuses([]);
      }
    };
    load();
  }, [token]);

  const ownCompanyPrefill = useMemo(
    () => getOwnCompanyPrefill(auth, companies),
    [auth, companies]
  );

  const companyById = useMemo(() => {
    const map = {};
    companies.forEach((c) => { map[String(c.id)] = c; });
    return map;
  }, [companies]);

  const branchById = useMemo(() => {
    const map = {};
    branches.forEach((b) => { map[String(b.id)] = b; });
    return map;
  }, [branches]);

  const departmentById = useMemo(() => {
    const map = {};
    departments.forEach((d) => { map[String(d.id)] = d; });
    return map;
  }, [departments]);

  const genderById = useMemo(() => {
    const map = {};
    genders.forEach((g) => { map[String(g.id)] = g.name; });
    return map;
  }, [genders]);

  const employmentTypeById = useMemo(() => {
    const map = {};
    employmentTypes.forEach((t) => { map[String(t.id)] = t.name; });
    return map;
  }, [employmentTypes]);

  const employmentStatusById = useMemo(() => {
    const map = {};
    employmentStatuses.forEach((s) => { map[String(s.id)] = s.name; });
    return map;
  }, [employmentStatuses]);

  const branchOptionsByCompany = useMemo(() => {
    const map = {};
    branches.forEach((b) => {
      const key = String(b.companyId || '');
      if (!map[key]) map[key] = [];
      map[key].push({ value: String(b.id), label: `${b.code} - ${b.name}` });
    });
    return map;
  }, [branches]);

  const departmentOptionsByCompanyBranch = useMemo(() => {
    const map = {};
    departments.forEach((d) => {
      const key = `${String(d.companyId || '')}|${String(d.branchId || '')}`;
      if (!map[key]) map[key] = [];
      map[key].push({ value: String(d.id), label: `${d.code} - ${d.name}` });
    });
    return map;
  }, [departments]);

  const departmentOptionsByCompany = useMemo(() => {
    const map = {};
    departments.forEach((d) => {
      const key = String(d.companyId || '');
      if (!map[key]) map[key] = [];
      map[key].push({ value: String(d.id), label: `${d.code} - ${d.name}` });
    });
    return map;
  }, [departments]);

  const companyOptions = useMemo(
    () => [{ value: '', label: 'All Companies' }, ...companies.map((c) => ({ value: String(c.id), label: `${c.name} (${c.code})` }))],
    [companies]
  );
  const companyFormOptions = useMemo(
    () => [{ value: '', label: 'Select Company' }, ...companies.map((c) => ({ value: String(c.id), label: `${c.name} (${c.code})` }))],
    [companies]
  );
  const genderOptions = useMemo(
    () => [{ value: '', label: 'All Genders' }, ...genders.map((g) => ({ value: String(g.id), label: g.name }))],
    [genders]
  );
  const genderFormOptions = useMemo(
    () => [{ value: '', label: 'Select Gender' }, ...genders.map((g) => ({ value: String(g.id), label: g.name }))],
    [genders]
  );
  const employmentTypeOptions = useMemo(
    () => [{ value: '', label: 'All Employment Types' }, ...employmentTypes.map((t) => ({ value: String(t.id), label: t.name }))],
    [employmentTypes]
  );
  const employmentTypeFormOptions = useMemo(
    () => [{ value: '', label: 'Select Employment Type' }, ...employmentTypes.map((t) => ({ value: String(t.id), label: t.name }))],
    [employmentTypes]
  );
  const employmentStatusOptions = useMemo(
    () => [{ value: '', label: 'All Employment Statuses' }, ...employmentStatuses.map((s) => ({ value: String(s.id), label: s.name }))],
    [employmentStatuses]
  );
  const employmentStatusFormOptions = useMemo(
    () => [{ value: '', label: 'Select Employment Status' }, ...employmentStatuses.map((s) => ({ value: String(s.id), label: s.name }))],
    [employmentStatuses]
  );

  return (
    <CrudEntityPage
      title="Employee View Details"
      icon={<BadgeRoundedIcon sx={{ color: '#fff', fontSize: 20 }} />}
      gradient={`linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`}
      idKey="employeeId"
      prefillForm={ownCompanyPrefill}
      prefillFilters={ownCompanyPrefill ? { companyId: ownCompanyPrefill.companyId } : null}
      columns={[
        { key: 'employeeCode', label: 'Employee Code', type: 'code' },
        {
          key: 'employeeName',
          label: 'Employee',
          render: (row) => `${row.firstName || ''} ${row.lastName || ''}`.trim() || '-',
        },
        {
          key: 'companyName',
          label: 'Company',
          render: (row) => companyById[String(row.companyId)]?.name || row.companyCode || '-',
        },
        {
          key: 'branchName',
          label: 'Branch',
          render: (row) => branchById[String(row.branchId)]?.name || '-',
        },
        {
          key: 'departmentName',
          label: 'Department',
          render: (row) => departmentById[String(row.departmentId)]?.name || '-',
        },
        { key: 'mobilePhone', label: 'Mobile' },
        { key: 'workEmail', label: 'Work Email' },
        { key: 'roleType', label: 'Role', render: roleLabel },
      ]}
      filterFields={[
        { key: 'companyId', label: 'Company', type: 'autocomplete', options: companyOptions },
        {
          key: 'branchId',
          label: 'Branch',
          type: 'autocomplete',
          optionsByForm: (filters) => [{ value: '', label: 'All Branches' }, ...(branchOptionsByCompany[String(filters?.companyId || '')] || [])],
        },
        {
          key: 'departmentId',
          label: 'Department',
          type: 'autocomplete',
          optionsByForm: (filters) => {
            const companyId = String(filters?.companyId || '');
            const branchId = String(filters?.branchId || '');
            const exact = departmentOptionsByCompanyBranch[`${companyId}|${branchId}`] || [];
            const byCompany = departmentOptionsByCompany[companyId] || [];
            return [{ value: '', label: 'All Departments' }, ...(branchId ? exact : byCompany)];
          },
        },
        { key: 'employeeCode_like', label: 'Employee Code' },
        { key: 'name', label: 'Employee Name' },
        { key: 'genderId', label: 'Gender', type: 'autocomplete', options: genderOptions },
        { key: 'employmentTypeId', label: 'Employment Type', type: 'autocomplete', options: employmentTypeOptions },
        { key: 'employmentStatusId', label: 'Employment Status', type: 'autocomplete', options: employmentStatusOptions },
      ]}
      formFields={[
        { key: 'companyId', label: 'Company', type: 'autocomplete', options: companyFormOptions, readonlyOnEdit: true },
        { key: 'companyCode', label: 'Company Code', readOnly: true },
        {
          key: 'branchId',
          label: 'Branch',
          type: 'autocomplete',
          optionsByForm: (form) => [{ value: '', label: 'Select Branch' }, ...(branchOptionsByCompany[String(form?.companyId || '')] || [])],
        },
        {
          key: 'departmentId',
          label: 'Department',
          type: 'autocomplete',
          optionsByForm: (form) => {
            const companyId = String(form?.companyId || '');
            const branchId = String(form?.branchId || '');
            const exact = departmentOptionsByCompanyBranch[`${companyId}|${branchId}`] || [];
            const byCompany = departmentOptionsByCompany[companyId] || [];
            return [{ value: '', label: 'Select Department' }, ...(branchId ? exact : byCompany)];
          },
        },
        { key: 'employeeCode', label: 'Employee Code', readonlyOnEdit: true },
        { key: 'firstName', label: 'First Name' },
        { key: 'lastName', label: 'Last Name' },
        { key: 'dateOfBirth', label: 'Date Of Birth', type: 'date' },
        { key: 'genderId', label: 'Gender', type: 'autocomplete', options: genderFormOptions },
        { key: 'nationalId', label: 'National ID' },
        { key: 'mobilePhone', label: 'Mobile Phone' },
        { key: 'workEmail', label: 'Work Email' },
        { key: 'currentAddress', label: 'Current Address', fullWidth: true, minWidth: 320 },
        { key: 'hireDate', label: 'Hire Date', type: 'date' },
        { key: 'employmentTypeId', label: 'Employment Type', type: 'autocomplete', options: employmentTypeFormOptions },
        { key: 'jobTitle', label: 'Job Title' },
        { key: 'employmentStatusId', label: 'Employment Status', type: 'autocomplete', options: employmentStatusFormOptions },
        { key: 'isDriver', label: 'Driver', type: 'boolean' },
        { key: 'isOperator', label: 'Operator', type: 'boolean' },
        { key: 'isTechnician', label: 'Technician', type: 'boolean' },
      ]}
      defaultFilters={{
        companyId: '',
        branchId: '',
        departmentId: '',
        employeeCode_like: '',
        name: '',
        genderId: '',
        employmentTypeId: '',
        employmentStatusId: '',
        sortBy: 'firstName',
        sortDir: 'asc',
      }}
      emptyForm={{
        companyId: '',
        companyCode: '',
        branchId: '',
        departmentId: '',
        employeeCode: '',
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        genderId: '',
        nationalId: '',
        mobilePhone: '',
        workEmail: '',
        currentAddress: '',
        hireDate: '',
        employmentTypeId: '',
        jobTitle: '',
        employmentStatusId: '',
        isDriver: 'false',
        isOperator: 'false',
        isTechnician: 'false',
      }}
      normalizePayload={(form, mode) => {
        if (!opt(form.dateOfBirth)) {
          throw new Error('Date Of Birth is required');
        }
        if (!opt(form.hireDate)) {
          throw new Error('Hire Date is required');
        }
        const payload = {
          companyId: toUuid(form.companyId),
          companyCode: req(form.companyCode),
          branchId: toUuid(form.branchId),
          departmentId: toUuid(form.departmentId),
          firstName: req(form.firstName),
          lastName: req(form.lastName),
          dateOfBirth: opt(form.dateOfBirth),
          genderId: toInt(form.genderId),
          nationalId: req(form.nationalId),
          mobilePhone: req(form.mobilePhone),
          workEmail: opt(form.workEmail),
          currentAddress: opt(form.currentAddress),
          hireDate: opt(form.hireDate),
          employmentTypeId: toInt(form.employmentTypeId),
          jobTitle: opt(form.jobTitle),
          isDriver: toBool(form.isDriver),
          isOperator: toBool(form.isOperator),
          isTechnician: toBool(form.isTechnician),
          employmentStatusId: toInt(form.employmentStatusId),
        };
        if (mode !== 'edit') {
          payload.employeeCode = req(form.employeeCode);
        }
        return payload;
      }}
      onFormFieldChange={(next, key, value) => {
        if (key === 'companyId') {
          const selectedCompany = companyById[String(value)];
          return {
            ...next,
            companyCode: selectedCompany?.code || '',
            branchId: '',
            departmentId: '',
          };
        }
        if (key === 'branchId') {
          return {
            ...next,
            departmentId: '',
          };
        }
        return next;
      }}
      mapRecordToForm={(record) => ({
        ...record,
        companyId: record?.companyId ? String(record.companyId) : '',
        branchId: record?.branchId ? String(record.branchId) : '',
        departmentId: record?.departmentId ? String(record.departmentId) : '',
        genderId: record?.genderId != null ? String(record.genderId) : '',
        employmentTypeId: record?.employmentTypeId != null ? String(record.employmentTypeId) : '',
        employmentStatusId: record?.employmentStatusId != null ? String(record.employmentStatusId) : '',
        isDriver: record?.isDriver === true ? 'true' : 'false',
        isOperator: record?.isOperator === true ? 'true' : 'false',
        isTechnician: record?.isTechnician === true ? 'true' : 'false',
      })}
      listFetcher={employeeService.listEmployees}
      getByIdFetcher={employeeService.getEmployeeById}
      createFetcher={employeeService.createEmployee}
      updateFetcher={employeeService.updateEmployee}
      deleteFetcher={employeeService.deleteEmployee}
      autoSearch
      autoSearchDebounceMs={350}
      fitViewport
      viewportOffset={190}
    />
  );
}
