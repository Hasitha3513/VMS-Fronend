import EngineeringRoundedIcon from '@mui/icons-material/EngineeringRounded';
import { useEffect, useMemo, useState } from 'react';
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

export default function WorkshopsPage() {
  const theme = useTheme();
  const { token, auth } = useAuth();
  const [ctx, setCtx] = useState(null);
  const [allCompanies, setAllCompanies] = useState([]);
  const [allBranches, setAllBranches] = useState([]);
  const [allDepartments, setAllDepartments] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [allWorkshops, setAllWorkshops] = useState([]);

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      try {
        const [companiesRaw, branchesRaw, departmentsRaw, projectsRaw, workshopsRaw] = await Promise.all([
          organizationService.listCompanies(token, { activeOnly: true }),
          organizationService.listBranches(token, { activeOnly: true }),
          organizationService.listDepartments(token, { activeOnly: false }),
          organizationService.listProjects(token, {}),
          organizationService.listWorkshops(token, { activeOnly: false }),
        ]);

        setAllCompanies(rowsFrom(companiesRaw).map((c) => ({ id: c.companyId, code: c.companyCode, name: c.companyName })));
        setAllBranches(rowsFrom(branchesRaw).map((b) => ({ id: b.branchId, code: b.branchCode, name: b.branchName, companyId: b.companyId })));
        setAllDepartments(rowsFrom(departmentsRaw).map((d) => ({
          id: d.departmentId, code: d.departmentCode, name: d.departmentName, companyId: d.companyId, branchId: d.branchId,
        })));
        setAllProjects(rowsFrom(projectsRaw).map((p) => ({
          id: p.projectId, code: p.projectCode, name: p.projectName, companyId: p.companyId, branchId: p.branchId,
        })));
        setAllWorkshops(rowsFrom(workshopsRaw).map((w) => ({
          id: w.workshopId,
          name: w.workshopName,
          location: w.workshopLocation,
          companyId: w.companyId,
          branchId: w.branchId,
          isActive: w.isActive,
        })));
      } catch {
        setAllCompanies([]);
        setAllBranches([]);
        setAllDepartments([]);
        setAllProjects([]);
        setAllWorkshops([]);
      }
    };
    void load();
  }, [token]);

  useEffect(() => {
    const loadContext = async () => {
      if (!token) return;
      try {
        let data = await organizationService.organizationUserContextLookups(token, { activeOnly: true });
        if (!data?.companyId && auth?.companyCode) {
          const own = allCompanies.find((c) => String(c.code).toLowerCase() === String(auth.companyCode).toLowerCase());
          if (own) {
            data = { companyId: own.id, companyCode: own.code, companyName: own.name };
          }
        }
        setCtx(data || null);
      } catch {
        setCtx(null);
      }
    };
    void loadContext();
  }, [token, auth, allCompanies]);

  const companyOptions = useMemo(
    () => [{ value: '', label: 'Select Company' }, ...allCompanies.map((c) => ({ value: String(c.id), label: `${c.name} (${c.code})` }))],
    [allCompanies]
  );

  const companyById = useMemo(() => {
    const map = {};
    allCompanies.forEach((c) => { map[String(c.id)] = c; });
    return map;
  }, [allCompanies]);

  const branchById = useMemo(() => {
    const map = {};
    allBranches.forEach((b) => { map[String(b.id)] = b; });
    return map;
  }, [allBranches]);

  const departmentById = useMemo(() => {
    const map = {};
    allDepartments.forEach((d) => { map[String(d.id)] = d; });
    return map;
  }, [allDepartments]);

  const projectById = useMemo(() => {
    const map = {};
    allProjects.forEach((p) => { map[String(p.id)] = p; });
    return map;
  }, [allProjects]);

  const branchOptionsByCompany = useMemo(() => {
    const map = {};
    allBranches.forEach((b) => {
      const key = String(b.companyId || '');
      (map[key] ??= []).push({ value: String(b.id), label: `${b.code} - ${b.name}` });
    });
    return map;
  }, [allBranches]);

  const departmentOptionsByBranch = useMemo(() => {
    const map = {};
    allDepartments.forEach((d) => {
      const key = String(d.branchId || '');
      (map[key] ??= []).push({ value: String(d.id), label: `${d.code} - ${d.name}` });
    });
    return map;
  }, [allDepartments]);

  const projectOptionsByCompanyBranch = useMemo(() => {
    const map = {};
    allProjects.forEach((p) => {
      const key = `${String(p.companyId || '')}|${String(p.branchId || '')}`;
      (map[key] ??= []).push({ value: String(p.id), label: `${p.code} - ${p.name}` });
    });
    return map;
  }, [allProjects]);

  const projectOptionsByCompany = useMemo(() => {
    const map = {};
    allProjects.forEach((p) => {
      const key = String(p.companyId || '');
      (map[key] ??= []).push({ value: String(p.id), label: `${p.code} - ${p.name}` });
    });
    return map;
  }, [allProjects]);

  const workshopOptions = useMemo(
    () => allWorkshops.map((w) => ({
      value: String(w.id),
      label: w.location ? `${w.name || String(w.id)} - ${w.location}` : (w.name || String(w.id)),
    })),
    [allWorkshops]
  );

  const prefill = useMemo(() => {
    if (!ctx?.companyId) return null;
    return { companyId: String(ctx.companyId), companyCode: ctx.companyCode || '' };
  }, [ctx]);

  return (
    <CrudEntityPage
      title="Workshops"
      icon={<EngineeringRoundedIcon sx={{ color: '#fff', fontSize: 20 }} />}
      gradient={`linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`}
      idKey="workshopId"
      prefillForm={prefill}
      prefillFilters={prefill ? { companyId: String(ctx.companyId) } : null}
      columns={[
        { key: 'workshopName', label: 'Workshop Name' },
        {
          key: 'companyName',
          label: 'Company',
          render: (row) => companyById[String(row.companyId)]?.name || row.companyId || '—',
        },
        {
          key: 'branchName',
          label: 'Branch',
          render: (row) => {
            const branch = branchById[String(row.branchId)];
            return branch ? `${branch.code} - ${branch.name}` : '—';
          },
        },
        {
          key: 'departmentName',
          label: 'Department',
          render: (row) => {
            const department = departmentById[String(row.departmentId)];
            return department ? `${department.code} - ${department.name}` : '—';
          },
        },
        {
          key: 'projectName',
          label: 'Project',
          render: (row) => {
            const project = projectById[String(row.projectId)];
            return project ? `${project.code} - ${project.name}` : '—';
          },
        },
        { key: 'workshopLocation', label: 'Location' },
        { key: 'mainWorkshop', label: 'Main', type: 'boolean' },
        { key: 'isActive', label: 'Active', type: 'boolean' },
      ]}
      filterFields={[
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
          optionsByForm: (filters) => [{ value: '', label: 'All Departments' }, ...(departmentOptionsByBranch[String(filters?.branchId || '')] || [])],
        },
        {
          key: 'projectId',
          label: 'Project',
          type: 'autocomplete',
          optionsByForm: (filters) => {
            const companyId = String(filters?.companyId || '');
            const branchId = String(filters?.branchId || '');
            const byBranch = projectOptionsByCompanyBranch[`${companyId}|${branchId}`] || [];
            const byCompany = projectOptionsByCompany[companyId] || [];
            const options = byBranch.length ? byBranch : byCompany;
            return [{ value: '', label: 'All Projects' }, ...options];
          },
        },
        { key: 'workshopName_like', label: 'Workshop Name' },
      ]}
      formFields={[
        { key: 'companyId', label: 'Company', type: 'autocomplete', options: companyOptions },
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
          optionsByForm: (form) => [{ value: '', label: 'Select Department' }, ...(departmentOptionsByBranch[String(form?.branchId || '')] || [])],
        },
        {
          key: 'projectId',
          label: 'Project',
          type: 'autocomplete',
          optionsByForm: (form) => {
            const companyId = String(form?.companyId || '');
            const branchId = String(form?.branchId || '');
            const byBranch = projectOptionsByCompanyBranch[`${companyId}|${branchId}`] || [];
            const byCompany = projectOptionsByCompany[companyId] || [];
            const options = byBranch.length ? byBranch : byCompany;
            return [{ value: '', label: 'Select Project' }, ...options];
          },
        },
        { key: 'workshopName', label: 'Workshop Name' },
        { key: 'workshopLocation', label: 'Workshop Location' },
        {
          key: 'parentWorkshop',
          label: 'Parent Workshop',
          type: 'autocomplete',
          options: [{ value: '', label: 'No Parent' }, ...workshopOptions],
        },
        { key: 'mainWorkshop', label: 'Main Workshop', type: 'boolean' },
        { key: 'isActive', label: 'Is Active', type: 'boolean' },
        { key: 'note', label: 'Note', fullWidth: true, minWidth: 300 },
      ]}
      defaultFilters={{
        status: 'active',
        companyId: '',
        branchId: '',
        departmentId: '',
        projectId: '',
        workshopName_like: '',
        sortBy: 'workshopName',
        sortDir: 'asc',
      }}
      emptyForm={{
        companyId: '',
        companyCode: '',
        branchId: '',
        departmentId: '',
        projectId: '',
        workshopName: '',
        workshopLocation: '',
        parentWorkshop: '',
        mainWorkshop: 'false',
        isActive: 'true',
        note: '',
      }}
      normalizePayload={(form, mode) => {
        const resolvedCompanyId = opt(form.companyId) || opt(ctx?.companyId);
        const resolvedDepartment = departmentById[String(form.departmentId || '')];
        const resolvedProject = projectById[String(form.projectId || '')];
        const resolvedBranchId = opt(form.branchId)
          || (resolvedDepartment?.branchId ? String(resolvedDepartment.branchId) : null)
          || (resolvedProject?.branchId ? String(resolvedProject.branchId) : null);
        const payload = {
          branchId: resolvedBranchId,
          departmentId: opt(form.departmentId),
          projectId: opt(form.projectId),
          workshopName: req(form.workshopName),
          workshopLocation: opt(form.workshopLocation),
          mainWorkshop: toBool(form.mainWorkshop),
          parentWorkshop: opt(form.parentWorkshop),
          note: opt(form.note),
          isActive: toBool(form.isActive),
        };
        if (mode !== 'edit') payload.companyId = resolvedCompanyId;
        return payload;
      }}
      onFormFieldChange={(nextForm, key, value) => {
        if (key === 'companyId') {
          const selected = companyById[String(value)];
          return { ...nextForm, companyCode: selected?.code || '', branchId: '', departmentId: '', projectId: '', parentWorkshop: '' };
        }
        if (key === 'branchId') {
          return { ...nextForm, departmentId: '', projectId: '' };
        }
        return nextForm;
      }}
      listFetcher={async (sessionToken, filters) => {
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
        return organizationService.listWorkshops(sessionToken, params);
      }}
      getByIdFetcher={organizationService.getWorkshopById}
      createFetcher={organizationService.createWorkshop}
      updateFetcher={organizationService.updateWorkshop}
      deleteFetcher={organizationService.deleteWorkshop}
      autoSearch
      autoSearchDebounceMs={350}
      fitViewport
      viewportOffset={190}
    />
  );
}
