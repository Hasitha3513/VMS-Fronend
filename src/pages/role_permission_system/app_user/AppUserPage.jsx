import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Alert } from '@mui/material';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import CrudEntityPage from '../../organization/shared/CrudEntityPage';
import { appUserService } from '../../../services/role_permission_system/app_user/appUserService';
import { organizationService } from '../../../services/organizationService';
import { employeeService } from '../../../services/employee_hr_management/employee/employeeService';
import { useAuth } from '../../../app/AuthContext';

const req = (v) => (v ?? '').toString().trim();
const opt = (v) => {
  const s = (v ?? '').toString().trim();
  return s === '' ? null : s;
};
const toBool = (v) => (v === '' || v == null ? null : String(v) === 'true');
const rowsFrom = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};
const maskHash = (hash) => {
  const s = (hash ?? '').toString();
  if (!s) return '—';
  if (s.length <= 18) return s;
  return `${s.slice(0, 12)}...${s.slice(-6)}`;
};

export default function AppUserPage() {
  const theme = useTheme();
  const { token, auth } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [existingAppUsers, setExistingAppUsers] = useState([]);
  const loadedEmployeeCompanyCodesRef = useRef(new Set());
  const loadingEmployeeCompanyCodesRef = useRef(new Set());

  useEffect(() => {
    const loadLookups = async () => {
      if (!token) return;
      const [companyResult] = await Promise.allSettled([
        organizationService.listCompanies(token, { activeOnly: 'false' }),
      ]);

      if (companyResult.status === 'fulfilled') {
        setCompanies(rowsFrom(companyResult.value));
      } else {
        setCompanies([]);
      }
      setEmployees([]);
      loadedEmployeeCompanyCodesRef.current = new Set();
      loadingEmployeeCompanyCodesRef.current = new Set();
    };
    loadLookups();
  }, [token]);

  const mergeEmployees = useCallback((incoming) => {
    const rows = rowsFrom(incoming);
    setEmployees((prev) => {
      const byId = new Map(prev.map((e) => [String(e.employeeId || ''), e]));
      rows.forEach((e) => {
        const key = String(e.employeeId || '');
        if (key) byId.set(key, e);
      });
      return Array.from(byId.values());
    });
  }, []);

  const ensureEmployeesForCompany = useCallback(async (companyCode) => {
    const code = req(companyCode);
    if (!token || !code) return;
    if (loadedEmployeeCompanyCodesRef.current.has(code) || loadingEmployeeCompanyCodesRef.current.has(code)) return;

    loadingEmployeeCompanyCodesRef.current.add(code);
    setLoadingEmployees(true);
    try {
      const employeeRows = await employeeService.listEmployees(token, { companyCode: code });
      mergeEmployees(employeeRows);
      loadedEmployeeCompanyCodesRef.current.add(code);
    } catch {
      // Keep existing employee cache; user can still retry by reselecting company.
    } finally {
      loadingEmployeeCompanyCodesRef.current.delete(code);
      if (loadingEmployeeCompanyCodesRef.current.size === 0) setLoadingEmployees(false);
    }
  }, [mergeEmployees, token]);

  const companyOptions = useMemo(
    () => companies
      .map((c) => ({
        value: c.companyCode || '',
        label: `${c.companyName || c.companyCode} (${c.companyCode || 'N/A'})`,
        companyId: c.companyId || null,
      }))
      .filter((x) => x.value),
    [companies]
  );

  const ownCompanyPrefill = useMemo(() => {
    if (!auth?.companyCode) return null;
    const own = companies.find((c) => String(c.companyCode || '').toLowerCase() === String(auth.companyCode).toLowerCase());
    if (!own) return null;
    return {
      company_id: own.companyId || '',
      company_name: own.companyCode || '',
      company_code: own.companyCode || '',
    };
  }, [auth, companies]);

  const employeeOptions = useMemo(
    () => employees.map((e) => ({
      value: e.employeeId || '',
      label: `${e.employeeCode || 'EMP'} - ${e.firstName || ''} ${e.lastName || ''}`.trim(),
      companyCode: e.companyCode || '',
    })).filter((x) => x.value),
    [employees]
  );

  useEffect(() => {
    if (ownCompanyPrefill?.company_code) {
      ensureEmployeesForCompany(ownCompanyPrefill.company_code);
    }
  }, [ownCompanyPrefill, ensureEmployeesForCompany]);

  const usedEmployeeIds = useMemo(
    () => new Set(existingAppUsers.map((u) => u.employee_id).filter(Boolean)),
    [existingAppUsers]
  );

  const columns = useMemo(() => ([
    { key: 'username', label: 'Username' },
    { key: 'email', label: 'Email' },
    { key: 'company_code', label: 'Company Code', type: 'code' },
    { key: 'password_hash', label: 'Password Hash', render: (row) => maskHash(row.password_hash) },
    { key: 'is_super_admin', label: 'Super Admin', type: 'boolean' },
    { key: 'is_company_admin', label: 'Company Super Admin', type: 'boolean' },
    { key: 'is_active', label: 'Active', type: 'boolean' },
    { key: 'is_locked', label: 'Locked', type: 'boolean' },
  ]), []);

  const filterFields = useMemo(() => ([
    { key: 'username_like', label: 'Username' },
    { key: 'email_like', label: 'Email' },
    {
      key: 'company_code',
      label: 'Company',
      type: 'select',
      options: [{ value: '', label: 'All Companies' }, ...companyOptions.map((x) => ({ value: x.value, label: x.label }))],
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'all', label: 'All' },
      ],
    },
  ]), [companyOptions]);

  const formFields = useMemo(() => ([
    { key: 'first-section', label: 'Organization Mapping', type: 'section' },
    {
      key: 'company_name',
      label: 'Company Name',
      type: 'autocomplete',
      options: companyOptions.map((x) => ({ value: x.value, label: x.label })),
    },
    { key: 'company_code', label: 'Company Code', readOnly: true },
    {
      key: 'employee_id',
      label: 'Employee',
      type: 'autocomplete',
      optionsByForm: (form) => {
        const selectedCompanyCode = (form.company_code ?? '').toString();
        if (!selectedCompanyCode) return [];
        const currentEmployeeId = String(form.employee_id || '');
        const filtered = employeeOptions.filter((x) => (
          x.companyCode === selectedCompanyCode &&
          (!usedEmployeeIds.has(x.value) || x.value === currentEmployeeId)
        ));
        return filtered.map((x) => ({ value: x.value, label: x.label }));
      },
    },
    { key: 'account-section', label: 'Account Credentials', type: 'section' },
    { key: 'username', label: 'Username' },
    { key: 'email', label: 'Email' },
    { key: 'password_hash', label: 'Current Password Hash', readOnly: true },
    { key: 'password_plain', label: 'Password (set/change)' },
    { key: 'access-section', label: 'Role & Access Flags', type: 'section' },
    { key: 'is_super_admin', label: 'Is Super Admin', type: 'boolean' },
    { key: 'is_company_admin', label: 'Is Company Super Admin', type: 'boolean' },
    { key: 'is_active', label: 'Is Active', type: 'boolean' },
    { key: 'is_locked', label: 'Is Locked', type: 'boolean' },
    { key: 'email_verified', label: 'Email Verified', type: 'boolean' },
    { key: 'audit-section', label: 'Security / Audit (Read Only)', type: 'section' },
    { key: 'failed_login_attempts', label: 'Failed Login Attempts', readOnly: true },
    { key: 'last_login_at', label: 'Last Login At', readOnly: true },
    { key: 'password_changed_at', label: 'Password Changed At', readOnly: true },
    { key: 'email_verified_at', label: 'Email Verified At', readOnly: true },
    { key: 'created_at', label: 'Created At', readOnly: true },
    { key: 'updated_at', label: 'Updated At', readOnly: true },
  ]), [companyOptions, employeeOptions, usedEmployeeIds]);

  const onFormFieldChange = useCallback((next, key, value) => {
    if (key === 'company_name') {
      const found = companyOptions.find((c) => c.value === String(value));
      const companyCode = found?.value || '';
      if (companyCode) ensureEmployeesForCompany(companyCode);
      return {
        ...next,
        company_name: companyCode,
        company_id: found?.companyId || '',
        company_code: companyCode,
        employee_id: '',
      };
    }
    return next;
  }, [companyOptions, ensureEmployeesForCompany]);

  const listUsersByFilter = useCallback(async (sessionToken, filters) => {
    const all = rowsFrom(await appUserService.list(sessionToken));
    setExistingAppUsers(all);
    Array.from(new Set(all.map((u) => req(u.company_code)).filter(Boolean)))
      .forEach((code) => { ensureEmployeesForCompany(code); });
    const usernameLike = req(filters?.username_like).toLowerCase();
    const emailLike = req(filters?.email_like).toLowerCase();
    const companyCode = req(filters?.company_code);
    const status = req(filters?.status || 'active').toLowerCase();

    return all.filter((u) => {
      const usernameOk = !usernameLike || String(u.username || '').toLowerCase().includes(usernameLike);
      const emailOk = !emailLike || String(u.email || '').toLowerCase().includes(emailLike);
      const companyOk = !companyCode || String(u.company_code || '') === companyCode;
      const statusOk = status === 'all'
        ? true
        : status === 'inactive'
          ? u.is_active === false
          : u.is_active === true;
      return usernameOk && emailOk && companyOk && statusOk;
    });
  }, [ensureEmployeesForCompany]);

  return (
    <>
      <Alert
        severity="info"
        icon={<InfoOutlinedIcon fontSize="inherit" />}
        sx={{ mb: 2, borderRadius: 1.5 }}
      >
        Password hashes are one-way encrypted values and cannot be decrypted. Use "Password (set/change)" to update credentials.
      </Alert>
      <Alert severity="info" sx={{ mb: 2, borderRadius: 1.5 }}>
                  Super Admin: full access across all companies and can create/grant permissions to any account. Company Super Admin: full access only inside own company, can manage user accounts in that company, and can grant/revoke Super Admin access for those users.
      </Alert>
      {loadingEmployees && (
        <Alert severity="info" sx={{ mb: 2, borderRadius: 1.5 }}>
          Loading employees for selected company...
        </Alert>
      )}
      <CrudEntityPage
        title="App Users"
        icon={<AdminPanelSettingsRoundedIcon sx={{ color: '#fff', fontSize: 20 }} />}
        gradient={`linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`}
        idKey="user_id"
        prefillForm={ownCompanyPrefill}
        columns={columns}
        filterFields={filterFields}
        formFields={formFields}
        defaultFilters={{
          username_like: '',
          email_like: '',
          company_code: '',
          status: 'active',
        }}
        emptyForm={{
          company_id: '',
          company_name: '',
          company_code: '',
          employee_id: '',
          username: '',
          email: '',
          password_hash: '',
          password_plain: '',
          is_super_admin: 'false',
          is_company_admin: 'false',
          is_active: 'true',
          is_locked: 'false',
          failed_login_attempts: '',
          last_login_at: '',
          password_changed_at: '',
          email_verified: 'false',
          email_verified_at: '',
          created_at: '',
          updated_at: '',
        }}
        normalizePayload={(form, mode) => {
          const passwordPlain = req(form.password_plain);
          const passwordPayload = passwordPlain || null;
          const username = req(form.username);
          const email = req(form.email);
          if (!username) {
            throw new Error('Username is required');
          }
          if (!email) {
            throw new Error('Email is required');
          }
          if (mode === 'create' && !passwordPayload) {
            throw new Error('Password is required for new user');
          }
          return {
            company_id: opt(form.company_id),
            company_code: opt(form.company_code),
            employee_id: opt(form.employee_id),
            username,
            email,
            password_hash: mode === 'create' ? passwordPayload : (passwordPayload || null),
            is_super_admin: toBool(form.is_super_admin),
            is_company_admin: toBool(form.is_company_admin),
            is_active: toBool(form.is_active),
            is_locked: toBool(form.is_locked),
            failed_login_attempts: null,
            last_login_at: null,
            password_changed_at: null,
            email_verified: toBool(form.email_verified),
            email_verified_at: null,
          };
        }}
        listFetcher={listUsersByFilter}
        getByIdFetcher={appUserService.getById}
        createFetcher={appUserService.create}
        updateFetcher={appUserService.update}
        deleteFetcher={appUserService.remove}
        mapRecordToForm={(record) => {
          ensureEmployeesForCompany(record?.company_code);
          return {
            ...record,
            company_name: record?.company_code || '',
          };
        }}
        onFormFieldChange={onFormFieldChange}
        autoSearch
        autoSearchDebounceMs={250}
        fitViewport
        viewportOffset={190}
      />
    </>
  );
}
