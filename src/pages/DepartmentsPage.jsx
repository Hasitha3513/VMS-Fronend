import CorporateFareRoundedIcon from '@mui/icons-material/CorporateFareRounded';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '../app/AuthContext';
import CrudEntityPage from './organization/shared/CrudEntityPage';
import { organizationService } from '../services/organizationService';

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

export default function DepartmentsPage() {
  const theme = useTheme();
  const { token, auth } = useAuth();
  const [ctx, setCtx] = useState(null);
  const [allCompanies, setAllCompanies] = useState([]);
  const [allBranches, setAllBranches] = useState([]);
  const [allDepartments, setAllDepartments] = useState([]);

  useEffect(() => {
    const loadCompanies = async () => {
      if (!token) return;
      try {
        const lookup = await organizationService.organizationLookups(token, { activeOnly: true });
        let companies = (lookup?.companies || []).map((c) => ({
          id: c.id,
          code: c.code,
          name: c.name,
        }));
        if (!companies.length) {
          companies = rowsFrom(await organizationService.listCompanies(token, { activeOnly: true }))
            .map((c) => ({ id: c.companyId, code: c.companyCode, name: c.companyName }));
        }
        setAllCompanies(companies);
      } catch {
        try {
          const companies = rowsFrom(await organizationService.listCompanies(token, { activeOnly: true }))
            .map((c) => ({ id: c.companyId, code: c.companyCode, name: c.companyName }));
          setAllCompanies(companies);
        } catch {
          setAllCompanies([]);
        }
      }
    };
    loadCompanies();
  }, [token]);

  useEffect(() => {
    const loadDepartments = async () => {
      if (!token) return;
      try {
        const departments = rowsFrom(await organizationService.listDepartments(token, { activeOnly: false }))
          .map((d) => ({
            id: d.departmentId,
            code: d.departmentCode,
            name: d.departmentName,
            companyId: d.companyId,
            branchId: d.branchId,
            active: d.isActive,
          }));
        setAllDepartments(departments);
      } catch {
        setAllDepartments([]);
      }
    };
    loadDepartments();
  }, [token]);

  useEffect(() => {
    const loadBranches = async () => {
      if (!token) return;
      try {
        const branches = rowsFrom(await organizationService.listBranches(token, { activeOnly: true }))
          .map((b) => ({
            id: b.branchId,
            code: b.branchCode,
            name: b.branchName,
            companyId: b.companyId,
          }));
        setAllBranches(branches);
      } catch {
        setAllBranches([]);
      }
    };
    loadBranches();
  }, [token]);

  useEffect(() => {
    const loadContext = async () => {
      try {
        let data = await organizationService.organizationUserContextLookups(token, { activeOnly: true });
        if (!data?.companyId && auth?.companyCode) {
          const companies = await organizationService.listCompanies(token, { activeOnly: false, companyCode_like: auth.companyCode });
          const own = (companies || []).find((c) => String(c.companyCode).toLowerCase() === String(auth.companyCode).toLowerCase()) || companies?.[0];
          if (own) {
            const [branches, departments, projects, companyTypes, projectTypes] = await Promise.all([
              organizationService.listBranches(token, { companyId: own.companyId, activeOnly: true }),
              organizationService.listDepartments(token, { companyId: own.companyId, activeOnly: true }),
              organizationService.listProjects(token, { companyId: own.companyId }),
              organizationService.enumValues('company_type', { activeOnly: true }),
              organizationService.enumValues('project_type', { activeOnly: true }),
            ]);
            data = {
              companyId: own.companyId,
              companyCode: own.companyCode,
              companyName: own.companyName,
              branches: (branches || []).map((b) => ({ id: b.branchId, code: b.branchCode, name: b.branchName })),
              departments: (departments || []).map((d) => ({ id: d.departmentId, code: d.departmentCode, name: d.departmentName })),
              projects: (projects || []).map((p) => ({ id: p.projectId, code: p.projectCode, name: p.projectName })),
              companyTypes: companyTypes || [],
              projectTypes: projectTypes || [],
            };
          }
        }
        setCtx(data || null);
      } catch {
        setCtx(null);
      }
    };
    loadContext();
  }, [token, auth]);

  const branchOptionsByCompany = useMemo(() => {
    const map = {};
    allBranches.forEach((b) => {
      const key = String(b.companyId || '');
      if (!map[key]) map[key] = [];
      map[key].push({ value: String(b.id), label: `${b.code} - ${b.name}` });
    });
    return map;
  }, [allBranches]);
  const departmentOptionsByCompanyBranch = useMemo(() => {
    const map = {};
    allDepartments.forEach((d) => {
      const key = `${String(d.companyId || '')}|${String(d.branchId || '')}`;
      if (!map[key]) map[key] = [];
      map[key].push({ value: d.name, label: `${d.code} - ${d.name}` });
    });
    return map;
  }, [allDepartments]);
  const departmentOptionsByCompany = useMemo(() => {
    const map = {};
    allDepartments.forEach((d) => {
      const key = String(d.companyId || '');
      if (!map[key]) map[key] = [];
      map[key].push({ value: d.name, label: `${d.code} - ${d.name}` });
    });
    return map;
  }, [allDepartments]);
  const parentDeptOptions = useMemo(
    () => [{ value: '', label: 'Root Department' }, ...((ctx?.departments || []).map((d) => ({ value: String(d.id), label: `${d.code} - ${d.name}` })))],
    [ctx]
  );

  const prefill = useMemo(() => {
    if (!ctx?.companyId) return null;
    return {
      companyId: String(ctx.companyId),
      companyCode: ctx.companyCode || '',
    };
  }, [ctx]);

  const companyOptions = useMemo(
    () => [{ value: '', label: 'Select Company' }, ...(allCompanies.map((c) => ({ value: String(c.id), label: `${c.name} (${c.code})` })))],
    [allCompanies]
  );
  const companyById = useMemo(() => {
    const m = {};
    allCompanies.forEach((c) => { m[String(c.id)] = c; });
    return m;
  }, [allCompanies]);
  const departmentById = useMemo(() => {
    const m = {};
    (ctx?.departments || []).forEach((d) => { m[String(d.id)] = d; });
    return m;
  }, [ctx]);
  const branchById = useMemo(() => {
    const m = {};
    allBranches.forEach((b) => { m[String(b.id)] = b; });
    return m;
  }, [allBranches]);
  const filterFields = useMemo(() => ([
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
    { key: 'companyId', label: 'Company Name', type: 'autocomplete', options: companyOptions },
    {
      key: 'branchId',
      label: 'Branch',
      type: 'autocomplete',
      optionsByForm: (filters) => [{ value: '', label: 'All Branches' }, ...(branchOptionsByCompany[String(filters?.companyId || '')] || [])],
    },
    {
      key: 'departmentName_like',
      label: 'Department',
      type: 'autocomplete',
      optionsByForm: (filters) => {
        const companyId = String(filters?.companyId || '');
        const branchId = String(filters?.branchId || '');
        const exact = departmentOptionsByCompanyBranch[`${companyId}|${branchId}`] || [];
        const byCompany = departmentOptionsByCompany[companyId] || [];
        const options = branchId ? exact : byCompany;
        return [{ value: '', label: 'All Departments' }, ...options];
      },
    },
  ]), [companyOptions, branchOptionsByCompany, departmentOptionsByCompanyBranch, departmentOptionsByCompany]);
  const listDepartmentsByFilter = useCallback(async (sessionToken, filters) => {
    const params = { ...(filters || {}) };
    const status = String(params.status || 'active').toLowerCase();
    delete params.status;
    if (status === 'inactive') {
      params.activeOnly = 'false';
      params.active = 'false';
    } else if (status === 'all') {
      params.activeOnly = 'false';
      delete params.active;
    } else {
      params.activeOnly = 'true';
      delete params.active;
    }
    return organizationService.listDepartments(sessionToken, params);
  }, []);

  const formFields = useMemo(() => ([
    { key: 'companyId', label: 'Company Name', type: 'autocomplete', options: companyOptions },
    { key: 'companyCode', label: 'Company Code', readOnly: true },
    {
      key: 'branchId',
      label: 'Branch',
      type: 'select',
      optionsByForm: (form) => {
        const byCompany = branchOptionsByCompany[String(form?.companyId || '')] || [];
        return [{ value: '', label: 'No Branch' }, ...byCompany];
      },
    },
    { key: 'departmentCode', label: 'Department Code' },
    { key: 'departmentName', label: 'Department Name' },
    { key: 'parentDepartmentId', label: 'Parent Department', type: 'select', options: parentDeptOptions },
    { key: 'isActive', label: 'Is Active', type: 'boolean' },
  ]), [parentDeptOptions, companyOptions, branchOptionsByCompany]);

  return (
    <CrudEntityPage
      title="Departments"
      icon={<CorporateFareRoundedIcon sx={{ color: '#fff', fontSize: 20 }} />}
      gradient={`linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`}
      idKey="departmentId"
      prefillForm={prefill}
      prefillFilters={prefill ? { companyId: String(ctx.companyId) } : null}
      columns={[
        { key: 'departmentCode', label: 'Department Code', type: 'code' },
        { key: 'departmentName', label: 'Department Name' },
        {
          key: 'branchName',
          label: 'Branch Name',
          render: (row) => {
            if (!row.branchId) return '—';
            const branch = branchById[String(row.branchId)];
            return branch ? `${branch.code} - ${branch.name}` : row.branchId;
          },
        },
        {
          key: 'companyName',
          label: 'Company Name',
          render: (row) => companyById[String(row.companyId)]?.name || row.companyCode || '—',
        },
        {
          key: 'parentDepartmentName',
          label: 'Parent Department Name',
          render: (row) => {
            if (!row.parentDepartmentId) return '—';
            return departmentById[String(row.parentDepartmentId)]?.name || row.parentDepartmentId;
          },
        },
        { key: 'isActive', label: 'Active', type: 'boolean' },
      ]}
      filterFields={filterFields}
      formFields={formFields}
      defaultFilters={{
        status: 'active',
        companyId: '',
        branchId: '',
        departmentName_like: '',
        sortBy: 'departmentName',
        sortDir: 'asc',
      }}
      emptyForm={{
        companyId: '',
        companyCode: '',
        branchId: '',
        departmentCode: '',
        departmentName: '',
        parentDepartmentId: '',
        isActive: 'true',
      }}
      normalizePayload={(form, mode) => {
        const payload = {
          branchId: opt(form.branchId),
          departmentName: req(form.departmentName),
          parentDepartmentId: opt(form.parentDepartmentId),
          isActive: toBool(form.isActive),
        };
        if (mode !== 'edit') {
          payload.companyId = opt(form.companyId);
          payload.companyCode = req(form.companyCode);
          payload.departmentCode = req(form.departmentCode);
        }
        return payload;
      }}
      onFormFieldChange={(nextForm, key, value) => {
        if (key !== 'companyId') return nextForm;
        const selected = companyById[String(value)];
        return {
          ...nextForm,
          companyCode: selected?.code || '',
          branchId: '',
        };
      }}
      listFetcher={listDepartmentsByFilter}
      getByIdFetcher={organizationService.getDepartmentById}
      createFetcher={organizationService.createDepartment}
      updateFetcher={organizationService.updateDepartment}
      deleteFetcher={organizationService.deleteDepartment}
      autoSearch
      autoSearchDebounceMs={350}
      fitViewport
      viewportOffset={190}
    />
  );
}
