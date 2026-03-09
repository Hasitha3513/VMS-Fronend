import AccountTreeRoundedIcon from '@mui/icons-material/AccountTreeRounded';
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
const toNum = (v) => {
  const s = opt(v);
  return s == null ? null : Number(s);
};
const toBool = (v) => (v === '' || v == null ? null : String(v) === 'true');
const rowsFrom = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

export default function BranchesPage() {
  const theme = useTheme();
  const { token, auth } = useAuth();
  const [ctx, setCtx] = useState(null);
  const [allCompanies, setAllCompanies] = useState([]);

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
  const companyFilterOptions = useMemo(
    () => [{ value: '', label: 'All Companies' }, ...(allCompanies.map((c) => ({ value: String(c.id), label: `${c.name} (${c.code})` })))],
    [allCompanies]
  );
  const branchFilterFields = useMemo(() => ([
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
    { key: 'companyId', label: 'Company Name', type: 'autocomplete', options: companyFilterOptions },
  ]), [companyFilterOptions]);
  const listBranchesByFilter = useCallback(async (sessionToken, filters) => {
    const params = { ...(filters || {}) };
    const status = String(params.status || 'active').toLowerCase();
    delete params.status;
    if (status === 'inactive') {
      params.activeOnly = 'false';
      params.isActive = 'false';
    } else if (status === 'all') {
      params.activeOnly = 'false';
      delete params.isActive;
    } else {
      params.activeOnly = 'true';
      delete params.isActive;
    }
    return organizationService.listBranches(sessionToken, params);
  }, []);

  const formFields = useMemo(() => ([
    { key: 'companyId', label: 'Company Name', type: 'select', options: companyOptions },
    { key: 'companyCode', label: 'Company Code', readOnly: true },
    { key: 'branchCode', label: 'Branch Code' },
    { key: 'branchName', label: 'Branch Name' },
    { key: 'address', label: 'Address', minWidth: 260 },
    { key: 'city', label: 'City' },
    { key: 'stateProvince', label: 'State/Province' },
    { key: 'country', label: 'Country' },
    { key: 'latitude', label: 'Latitude', type: 'number' },
    { key: 'longitude', label: 'Longitude', type: 'number' },
    { key: 'isMainWorkshop', label: 'Main Workshop', type: 'boolean' },
    { key: 'isActive', label: 'Is Active', type: 'boolean' },
  ]), [companyOptions]);

  return (
    <CrudEntityPage
      title="Branches"
      icon={<AccountTreeRoundedIcon sx={{ color: '#fff', fontSize: 20 }} />}
      gradient={`linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`}
      idKey="branchId"
      prefillForm={prefill}
      prefillFilters={prefill ? { companyId: String(ctx.companyId) } : null}
      columns={[
        { key: 'branchCode', label: 'Code', type: 'code' },
        { key: 'branchName', label: 'Name' },
        { key: 'companyCode', label: 'Company' },
        { key: 'city', label: 'City' },
        { key: 'country', label: 'Country' },
        { key: 'isMainWorkshop', label: 'Main Workshop', type: 'boolean' },
        { key: 'isActive', label: 'Active', type: 'boolean' },
      ]}
      filterFields={branchFilterFields}
      formFields={formFields}
      defaultFilters={{
        status: 'active',
        companyId: '',
        sortBy: 'branchName',
        sortDir: 'asc',
      }}
      emptyForm={{
        companyId: '',
        companyCode: '',
        branchCode: '',
        branchName: '',
        address: '',
        city: '',
        stateProvince: '',
        country: '',
        latitude: '',
        longitude: '',
        isMainWorkshop: 'false',
        isActive: 'true',
      }}
      normalizePayload={(form, mode) => {
        const payload = {
          branchName: req(form.branchName),
          address: opt(form.address),
          city: opt(form.city),
          stateProvince: opt(form.stateProvince),
          country: opt(form.country),
          latitude: toNum(form.latitude),
          longitude: toNum(form.longitude),
          isMainWorkshop: toBool(form.isMainWorkshop),
          isActive: toBool(form.isActive),
        };
        if (mode !== 'edit') {
          payload.companyId = opt(form.companyId);
          payload.companyCode = req(form.companyCode);
          payload.branchCode = req(form.branchCode);
        }
        return payload;
      }}
      onFormFieldChange={(nextForm, key, value) => {
        if (key !== 'companyId') return nextForm;
        const selected = companyById[String(value)];
        return {
          ...nextForm,
          companyCode: selected?.code || '',
        };
      }}
      listFetcher={listBranchesByFilter}
      getByIdFetcher={organizationService.getBranchById}
      createFetcher={organizationService.createBranch}
      updateFetcher={organizationService.updateBranch}
      deleteFetcher={organizationService.deleteBranch}
      autoSearch
      autoSearchDebounceMs={350}
      fitViewport
      viewportOffset={190}
    />
  );
}
