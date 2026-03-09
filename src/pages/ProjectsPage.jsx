import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '../app/AuthContext';
import CrudEntityPage from './organization/shared/CrudEntityPage';
import { organizationService } from '../services/organizationService';
import { employeeService } from '../services/employee_hr_management/employee/employeeService';

const req = (v) => (v ?? '').toString().trim();
const opt = (v) => {
  const s = (v ?? '').toString().trim();
  return s === '' ? null : s;
};
const toInt = (v) => {
  const s = opt(v);
  return s == null ? null : Number.parseInt(s, 10);
};
const toNum = (v) => {
  const s = opt(v);
  return s == null ? null : Number(s);
};
const rowsFrom = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

export default function ProjectsPage() {
  const theme = useTheme();
  const { token, auth } = useAuth();
  const [ctx, setCtx] = useState(null);
  const [allCompanies, setAllCompanies] = useState([]);
  const [allBranches, setAllBranches] = useState([]);
  const [allDepartments, setAllDepartments] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [allProjectManagers, setAllProjectManagers] = useState([]);
  const [projectTypes, setProjectTypes] = useState([]);
  const [projectStatuses, setProjectStatuses] = useState([]);

  useEffect(() => {
    const loadContext = async () => {
      try {
        const [core, me, companiesRaw, branchesRaw, departmentsRaw, projectsRaw, managersRaw] = await Promise.all([
          organizationService.organizationLookups(token, { activeOnly: true }).catch(() => null),
          organizationService.organizationUserContextLookups(token, { activeOnly: true }).catch(() => null),
          organizationService.listCompanies(token, { activeOnly: true }).catch(() => []),
          organizationService.listBranches(token, { activeOnly: true }).catch(() => []),
          organizationService.listDepartments(token, { activeOnly: true }).catch(() => []),
          organizationService.listProjects(token, {}).catch(() => []),
          organizationService.projectManagerOptions(token, {}).catch(() => []),
        ]);

        const companyRows = rowsFrom(companiesRaw);
        const branchRows = rowsFrom(branchesRaw);
        const departmentRows = rowsFrom(departmentsRaw);
        const projectRows = rowsFrom(projectsRaw);

        const companies = (core?.companies?.length
          ? core.companies.map((c) => ({ id: c.id, code: c.code, name: c.name }))
          : companyRows.map((c) => ({ id: c.companyId, code: c.companyCode, name: c.companyName })))
          .filter((c) => c.id && c.code && c.name);
        setAllCompanies(companies);
        setAllBranches(branchRows.map((b) => ({
          id: b.branchId,
          code: b.branchCode,
          name: b.branchName,
          companyId: b.companyId,
        })));
        setAllDepartments(departmentRows.map((d) => ({
          id: d.departmentId,
          code: d.departmentCode,
          name: d.departmentName,
          branchId: d.branchId,
          companyId: d.companyId,
        })));
        setAllProjects(projectRows.map((p) => ({
          id: p.projectId,
          code: p.projectCode,
          name: p.projectName,
          companyId: p.companyId,
          branchId: p.branchId,
          statusId: p.statusId,
        })));
        let managerRows = rowsFrom(managersRaw);
        if (!managerRows.length) {
          const employeeRows = rowsFrom(await employeeService.listEmployees(token, {}).catch(() => []));
          managerRows = employeeRows.map((e) => {
            const employeeName = `${e.firstName || ''} ${e.lastName || ''}`.trim() || e.employeeCode || 'Employee';
            return {
              employeeId: e.employeeId,
              companyId: e.companyId,
              employeeCode: e.employeeCode,
              employeeName,
              displayName: `${employeeName}${e.employeeCode ? ` (${e.employeeCode})` : ''}`.trim(),
            };
          });
        }
        setAllProjectManagers(managerRows.map((m) => ({
          employeeId: m.employeeId,
          companyId: m.companyId,
          employeeCode: m.employeeCode,
          employeeName: m.employeeName,
          displayName: m.displayName,
        })));
        setProjectTypes(core?.projectTypes || me?.projectTypes || []);
        setProjectStatuses(core?.projectStatuses || []);

        let data = me;
        if (!data?.companyId && auth?.companyCode) {
          const own = companyRows.find((c) => String(c.companyCode).toLowerCase() === String(auth.companyCode).toLowerCase()) || companyRows[0];
          if (own) {
            const [branches, departments, projects, companyTypes, scopedProjectTypes] = await Promise.all([
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
              projectTypes: scopedProjectTypes || [],
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

  const companyOptions = useMemo(
    () => [{ value: '', label: 'Select Company' }, ...allCompanies.map((c) => ({ value: String(c.id), label: `${c.name} (${c.code})` }))],
    [allCompanies]
  );
  const companyById = useMemo(() => {
    const map = {};
    allCompanies.forEach((c) => { map[String(c.id)] = c; });
    return map;
  }, [allCompanies]);
  const branchOptionsByCompany = useMemo(() => {
    const map = {};
    allBranches.forEach((b) => {
      const key = String(b.companyId || '');
      if (!map[key]) map[key] = [];
      map[key].push({ value: String(b.id), label: `${b.code} - ${b.name}` });
    });
    return map;
  }, [allBranches]);
  const departmentOptionsByBranch = useMemo(() => {
    const map = {};
    allDepartments.forEach((d) => {
      const key = String(d.branchId || '');
      if (!map[key]) map[key] = [];
      map[key].push({ value: String(d.id), label: `${d.code} - ${d.name}` });
    });
    return map;
  }, [allDepartments]);
  const departmentById = useMemo(() => {
    const map = {};
    allDepartments.forEach((d) => { map[String(d.id)] = d; });
    return map;
  }, [allDepartments]);
  const projectOptionsByCompanyBranch = useMemo(() => {
    const map = {};
    allProjects.forEach((p) => {
      const key = `${String(p.companyId || '')}|${String(p.branchId || '')}`;
      if (!map[key]) map[key] = [];
      map[key].push({ value: p.name, label: `${p.code} - ${p.name}` });
    });
    return map;
  }, [allProjects]);
  const managerOptionsByCompany = useMemo(() => {
    const map = {};
    allProjectManagers.forEach((m) => {
      const key = String(m.companyId || '');
      if (!map[key]) map[key] = [];
      const value = (m.employeeName || '').trim();
      if (!value) return;
      map[key].push({
        value,
        label: m.displayName || `${value}${m.employeeCode ? ` (${m.employeeCode})` : ''}`.trim(),
      });
    });
    Object.keys(map).forEach((key) => {
      map[key] = map[key].sort((a, b) => a.label.localeCompare(b.label));
    });
    return map;
  }, [allProjectManagers]);
  const managerOptionsAll = useMemo(() => {
    const unique = new Map();
    allProjectManagers.forEach((m) => {
      const value = String(m.employeeName || '').trim();
      if (!value) return;
      const label = m.displayName || `${value}${m.employeeCode ? ` (${m.employeeCode})` : ''}`.trim();
      if (!unique.has(value)) {
        unique.set(value, { value, label });
      }
    });
    return Array.from(unique.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [allProjectManagers]);
  const managerFilterOptions = useMemo(
    () => [{ value: '', label: 'Any Manager' }, ...managerOptionsAll],
    [managerOptionsAll]
  );
  const projectTypeOptions = useMemo(
    () => [{ value: '', label: 'Select Project Type' }, ...((projectTypes || []).map((p) => ({ value: String(p.id), label: p.name })))],
    [projectTypes]
  );
  const statusOptions = useMemo(
    () => [{ value: '', label: 'Select Status' }, ...((projectStatuses || []).map((s) => ({ value: String(s.id), label: s.name })))],
    [projectStatuses]
  );
  const projectNameFilterOptions = useMemo(
    () => [{ value: '', label: 'Any Project' }, ...((ctx?.projects || []).map((p) => ({ value: p.name, label: `${p.code} - ${p.name}` })))],
    [ctx]
  );

  const prefill = useMemo(() => {
    if (!ctx?.companyId) return null;
    return {
      companyId: String(ctx.companyId),
      companyCode: ctx.companyCode || '',
      companyName: ctx.companyName || '',
    };
  }, [ctx]);

  const formFields = useMemo(() => ([
    { key: 'companyId', label: 'Company Name', type: 'autocomplete', options: companyOptions },
    { key: 'companyCode', label: 'Company Code', readOnly: true },
    {
      key: 'branchId',
      label: 'Branch Name',
      type: 'autocomplete',
      optionsByForm: (form) => [{ value: '', label: 'Select Branch' }, ...(branchOptionsByCompany[String(form?.companyId || '')] || [])],
    },
    {
      key: 'departmentId',
      label: 'Department Name',
      type: 'autocomplete',
      optionsByForm: (form) => [{ value: '', label: 'Select Department' }, ...(departmentOptionsByBranch[String(form?.branchId || '')] || [])],
    },
    { key: 'projectCode', label: 'Project Code' },
    { key: 'projectName', label: 'Project Name' },
    { key: 'projectTypeId', label: 'Project Type', type: 'select', options: projectTypeOptions },
    {
      key: 'projectManager',
      label: 'Project Manager',
      type: 'autocomplete',
      optionsByForm: (form) => {
        const selectedCompany = String(form?.companyId || '');
        const options = selectedCompany
          ? (managerOptionsByCompany[selectedCompany] || [])
          : managerOptionsAll;
        const currentValue = String(form?.projectManager || '').trim();
        const hasCurrent = currentValue && options.some((opt) => String(opt.value) === currentValue);
        return [
          { value: '', label: 'Select Project Manager' },
          ...options,
          ...(hasCurrent ? [] : currentValue ? [{ value: currentValue, label: currentValue }] : []),
        ];
      },
    },
    { key: 'statusId', label: 'Status', type: 'select', options: statusOptions },
    { key: 'startDate', label: 'Start Date', type: 'date' },
    { key: 'plannedEndDate', label: 'Planned End Date', type: 'date' },
    { key: 'actualEndDate', label: 'Actual End Date', type: 'date' },
    { key: 'budgetAmount', label: 'Budget Amount', type: 'number' },
    { key: 'actualCost', label: 'Actual Cost', type: 'number' },
    { key: 'siteAddress', label: 'Site Address', minWidth: 260 },
    { key: 'siteLatitude', label: 'Site Latitude', type: 'number' },
    { key: 'siteLongitude', label: 'Site Longitude', type: 'number' },
    {
      key: 'openMap',
      label: 'Google Map',
      type: 'select',
      options: [
        { value: '', label: 'Map Action' },
        { value: 'open', label: 'Open in Google Maps' },
      ],
    },
  ]), [companyOptions, branchOptionsByCompany, departmentOptionsByBranch, managerOptionsAll, managerOptionsByCompany, projectTypeOptions, statusOptions]);

  const listProjectsByFilter = useCallback(async (sessionToken, filters) => {
    const params = { ...(filters || {}) };
    const selectedDepartment = departmentById[String(params.departmentId || '')];
    if (!params.branchId && selectedDepartment?.branchId) {
      params.branchId = String(selectedDepartment.branchId);
    }
    delete params.departmentId;
    return organizationService.listProjects(sessionToken, params);
  }, [departmentById]);

  return (
    <CrudEntityPage
      title="Projects"
      icon={<FolderRoundedIcon sx={{ color: '#fff', fontSize: 20 }} />}
      gradient={`linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`}
      idKey="projectId"
      prefillForm={prefill}
      prefillFilters={prefill ? { companyId: String(ctx.companyId) } : null}
      columns={[
        { key: 'projectCode', label: 'Code', type: 'code' },
        { key: 'projectName', label: 'Name' },
        {
          key: 'companyName',
          label: 'Company',
          render: (row) => companyById[String(row.companyId)]?.name || row.companyCode || '—',
        },
        {
          key: 'branchName',
          label: 'Branch',
          render: (row) => {
            const branch = allBranches.find((b) => String(b.id) === String(row.branchId));
            return branch ? `${branch.code} - ${branch.name}` : '—';
          },
        },
        { key: 'projectManager', label: 'Manager' },
        {
          key: 'statusId',
          label: 'Status',
          render: (row) => projectStatuses.find((s) => String(s.id) === String(row.statusId))?.name || row.statusId || '—',
        },
        { key: 'budgetAmount', label: 'Budget' },
      ]}
      filterFields={[
        { key: 'companyId', label: 'Company Name', type: 'autocomplete', options: companyOptions },
        {
          key: 'branchId',
          label: 'Branch Name',
          type: 'autocomplete',
          optionsByForm: (filters) => [{ value: '', label: 'Any Branch' }, ...(branchOptionsByCompany[String(filters?.companyId || '')] || [])],
        },
        {
          key: 'departmentId',
          label: 'Department',
          type: 'autocomplete',
          optionsByForm: (filters) => [{ value: '', label: 'Any Department' }, ...(departmentOptionsByBranch[String(filters?.branchId || '')] || [])],
        },
        { key: 'projectCode_like', label: 'Project Code' },
        {
          key: 'projectName_like',
          label: 'Project Name',
          type: 'autocomplete',
          optionsByForm: (filters) => {
            const companyId = String(filters?.companyId || '');
            const branchId = String(filters?.branchId || departmentById[String(filters?.departmentId || '')]?.branchId || '');
            const byContext = projectNameFilterOptions.slice(1);
            const byBranch = projectOptionsByCompanyBranch[`${companyId}|${branchId}`] || [];
            const options = branchId ? byBranch : byContext;
            return [{ value: '', label: 'Any Project' }, ...options];
          },
        },
        {
          key: 'projectManager_like',
          label: 'Project Manager',
          type: 'autocomplete',
          optionsByForm: (filters) => {
            const selectedCompany = String(filters?.companyId || '');
            const scoped = selectedCompany
              ? (managerOptionsByCompany[selectedCompany] || [])
              : managerFilterOptions.slice(1);
            const currentValue = String(filters?.projectManager_like || '').trim();
            const hasCurrent = currentValue && scoped.some((opt) => String(opt.value) === currentValue);
            return [
              { value: '', label: 'Any Manager' },
              ...scoped,
              ...(hasCurrent ? [] : currentValue ? [{ value: currentValue, label: currentValue }] : []),
            ];
          },
        },
        { key: 'statusId', label: 'Status', type: 'select', options: [{ value: '', label: 'Any Status' }, ...statusOptions.filter((x) => x.value !== '')] },
      ]}
      formFields={formFields}
      defaultFilters={{
        companyId: '',
        branchId: '',
        departmentId: '',
        projectCode_like: '',
        projectName_like: '',
        projectManager_like: '',
        statusId: '',
        sortBy: 'projectName',
        sortDir: 'asc',
      }}
      emptyForm={{
        companyId: '',
        companyCode: '',
        companyName: '',
        branchId: '',
        departmentId: '',
        projectCode: '',
        projectName: '',
        projectTypeId: '',
        projectManager: '',
        statusId: '',
        startDate: '',
        plannedEndDate: '',
        actualEndDate: '',
        budgetAmount: '',
        actualCost: '',
        siteAddress: '',
        siteLatitude: '',
        siteLongitude: '',
        openMap: '',
      }}
      normalizePayload={(form, mode) => {
        const payload = {
          branchId: opt(form.branchId),
          projectName: req(form.projectName),
          projectTypeId: toInt(form.projectTypeId),
          siteAddress: opt(form.siteAddress),
          siteLatitude: toNum(form.siteLatitude),
          siteLongitude: toNum(form.siteLongitude),
          startDate: opt(form.startDate),
          plannedEndDate: opt(form.plannedEndDate),
          actualEndDate: opt(form.actualEndDate),
          budgetAmount: toNum(form.budgetAmount),
          actualCost: toNum(form.actualCost),
          projectManager: opt(form.projectManager),
          statusId: toInt(form.statusId),
        };
        if (mode !== 'edit') {
          payload.companyId = opt(form.companyId);
          payload.companyCode = req(form.companyCode);
          payload.projectCode = req(form.projectCode);
        }
        return payload;
      }}
      onFormFieldChange={(nextForm, key, value) => {
        if (key === 'companyId') {
          const company = companyById[String(value)];
          return {
            ...nextForm,
            companyCode: company?.code || '',
            companyName: company?.name || '',
            branchId: '',
            departmentId: '',
          };
        }
        if (key === 'branchId') {
          return { ...nextForm, departmentId: '' };
        }
        if (key === 'openMap' && value === 'open') {
          const lat = opt(nextForm.siteLatitude);
          const lng = opt(nextForm.siteLongitude);
          const addr = opt(nextForm.siteAddress);
          const url = lat && lng
            ? `https://www.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}`
            : addr
              ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`
              : 'https://www.google.com/maps';
          if (typeof window !== 'undefined') {
            window.open(url, '_blank', 'noopener,noreferrer');
          }
          return { ...nextForm, openMap: '' };
        }
        return nextForm;
      }}
      listFetcher={listProjectsByFilter}
      getByIdFetcher={organizationService.getProjectById}
      createFetcher={organizationService.createProject}
      updateFetcher={organizationService.updateProject}
      deleteFetcher={organizationService.deleteProject}
      autoSearch
      autoSearchDebounceMs={350}
      fitViewport
      viewportOffset={190}
    />
  );
}
