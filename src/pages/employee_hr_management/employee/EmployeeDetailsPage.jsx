import ManageAccountsRoundedIcon from '@mui/icons-material/ManageAccountsRounded';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import ContactPhoneRoundedIcon from '@mui/icons-material/ContactPhoneRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import WorkRoundedIcon from '@mui/icons-material/WorkRounded';
import {
  Alert,
  Autocomplete,
  Avatar,
  Divider,
  Box,
  Chip,
  Grid,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import CrudEntityPage from '../../organization/shared/CrudEntityPage';
import { useAuth } from '../../../app/AuthContext';
import { organizationService } from '../../../services/organizationService';
import { employeeService } from '../../../services/employee_hr_management/employee/employeeService';
import { employeeSkillService } from '../../../services/employee_hr_management/employee_skill/employeeSkillService';
import { employeeTrainingService } from '../../../services/employee_hr_management/employee_training/employeeTrainingService';
import { employeeDetailsService } from '../../../services/employee_hr_management/employee_details/employeeDetailsService';
import { opt, req, rowsFrom, toBool, toDecimal, toInt } from '../shared/hrCrudCommon';

const toUuid = (v) => {
  const s = opt(v);
  return s == null ? null : s;
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const asUuidOrEmpty = (v) => {
  const s = String(v ?? '').trim();
  if (!s || s.toLowerCase() === 'undefined' || s.toLowerCase() === 'null') return '';
  return UUID_RE.test(s) ? s : '';
};

const lookupOptions = (rows = [], withAny = false, anyLabel = 'All') => {
  const mapped = rows.map((x) => ({ value: String(x.id), label: x.name || x.label || x.code || String(x.id) }));
  return withAny ? [{ value: '', label: anyLabel }, ...mapped] : mapped;
};

// Converts a snake_case key to camelCase: "level_id" → "levelId"
function snakeToCamel(s) {
  return s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

// Normalizes a single row: copies every snake_case key as a camelCase alias.
// Existing camelCase keys are preserved unchanged.
function normalizeRow(row) {
  if (!row || typeof row !== 'object') return row;
  const out = { ...row };
  Object.keys(row).forEach((k) => {
    if (k.includes('_')) {
      const camel = snakeToCamel(k);
      if (out[camel] === undefined) out[camel] = row[k];
    }
  });
  return out;
}

// Wraps a list fetcher so every row in the response is normalized (snake → camelCase).
function normalizingFetcher(fetcher) {
  return async (token, params) => {
    const raw = await fetcher(token, params);
    if (Array.isArray(raw)) return raw.map(normalizeRow);
    if (Array.isArray(raw?.content)) return { ...raw, content: raw.content.map(normalizeRow) };
    if (Array.isArray(raw?.items)) return { ...raw, items: raw.items.map(normalizeRow) };
    if (Array.isArray(raw?.data)) return { ...raw, data: raw.data.map(normalizeRow) };
    return raw;
  };
}

// Wraps a getById fetcher so the single record is normalized (snake → camelCase).
function normalizingGetById(fetcher) {
  return async (token, id) => {
    const raw = await fetcher(token, id);
    return normalizeRow(raw);
  };
}

function tabPanel(active, value, node) {
  return active === value ? <Box sx={{ mt: 2 }}>{node}</Box> : null;
}

function normalizeEmployeeRow(row) {
  return {
    ...row,
    employeeId: row?.employeeId ?? row?.employee_id ?? null,
    companyId: row?.companyId ?? row?.company_id ?? null,
    companyCode: row?.companyCode ?? row?.company_code ?? '',
    branchId: row?.branchId ?? row?.branch_id ?? null,
    branchName: row?.branchName ?? row?.branch_name ?? '',
    departmentId: row?.departmentId ?? row?.department_id ?? null,
    departmentName: row?.departmentName ?? row?.department_name ?? '',
    firstName: row?.firstName ?? row?.first_name ?? '',
    lastName: row?.lastName ?? row?.last_name ?? '',
    dateOfBirth: row?.dateOfBirth ?? row?.date_of_birth ?? '',
    genderId: row?.genderId ?? row?.gender_id ?? null,
    nationalId: row?.nationalId ?? row?.national_id ?? '',
    mobilePhone: row?.mobilePhone ?? row?.mobile_phone ?? '',
    workEmail: row?.workEmail ?? row?.work_email ?? '',
    currentAddress: row?.currentAddress ?? row?.current_address ?? '',
    hireDate: row?.hireDate ?? row?.hire_date ?? '',
    employmentTypeId: row?.employmentTypeId ?? row?.employment_type_id ?? null,
    jobTitle: row?.jobTitle ?? row?.job_title ?? '',
    isDriver: row?.isDriver ?? row?.is_driver ?? false,
    isOperator: row?.isOperator ?? row?.is_operator ?? false,
    isTechnician: row?.isTechnician ?? row?.is_technician ?? false,
    employmentStatusId: row?.employmentStatusId ?? row?.employment_status_id ?? null,
  };
}

export default function EmployeeDetailsPage() {
  const theme = useTheme();
  const { token, auth } = useAuth();
  const [loadingError, setLoadingError] = useState('');
  const [tab, setTab] = useState('overview');
  const [q, setQ] = useState('');
  const [companies, setCompanies] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [branches, setBranches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [lookups, setLookups] = useState({});
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      setLoadingError('');
      try {
        const companiesRaw = await organizationService.listCompanies(token, { activeOnly: true });
        const companyRows = rowsFrom(companiesRaw)
          .map((c) => ({
            id: c.companyId ?? c.company_id,
            code: c.companyCode ?? c.company_code,
            name: c.companyName ?? c.company_name,
          }))
          .filter((c) => !!asUuidOrEmpty(c.id));
        setCompanies(companyRows);
        if (!selectedCompanyId && companyRows.length === 1) {
          setSelectedCompanyId(asUuidOrEmpty(companyRows[0].id));
        }
        if (auth?.companyCode) {
          const own = companyRows.find((c) => String(c.code).toLowerCase() === String(auth.companyCode).toLowerCase());
          if (own) setSelectedCompanyId(asUuidOrEmpty(own.id));
        }

        const [hrResult, trainingsResult, branchesResult, departmentsResult] = await Promise.allSettled([
          employeeService.hrLookups(token, { activeOnly: true }),
          employeeTrainingService.list(token, { activeOnly: true }),
          organizationService.listBranches(token, { activeOnly: true }),
          organizationService.listDepartments(token, { activeOnly: true }),
        ]);

        if (hrResult.status === 'fulfilled') setLookups(hrResult.value || {});
        else setLookups({});

        if (trainingsResult.status === 'fulfilled') setTrainings(rowsFrom(trainingsResult.value));
        else setTrainings([]);

        if (branchesResult.status === 'fulfilled') {
          setBranches(
            rowsFrom(branchesResult.value).map((b) => ({
              id: b.branchId,
              name: b.branchName,
            }))
          );
        } else setBranches([]);

        if (departmentsResult.status === 'fulfilled') {
          setDepartments(
            rowsFrom(departmentsResult.value).map((d) => ({
              id: d.departmentId,
              name: d.departmentName,
            }))
          );
        } else setDepartments([]);
      } catch (e) {
        setLoadingError(e?.message || 'Failed to load employee detail lookups');
        setCompanies([]);
      }
    };
    load();
  }, [token, auth?.companyCode]);

  useEffect(() => {
    const loadProjects = async () => {
      if (!token) return;
      try {
        const companyId = asUuidOrEmpty(selectedCompanyId);
        const rows = rowsFrom(await organizationService.listProjects(token, { companyId: companyId || undefined }));
        setProjects(rows);
      } catch {
        setProjects([]);
      }
    };
    loadProjects();
  }, [token, selectedCompanyId]);

  useEffect(() => {
    const loadSkills = async () => {
      if (!token) return;
      try {
        const companyId = asUuidOrEmpty(selectedCompanyId);
        const rows = rowsFrom(await employeeSkillService.list(token, { companyId: companyId || undefined, limit: 200 }));
        setSkills(rows);
      } catch {
        setSkills([]);
      }
    };
    loadSkills();
  }, [token, selectedCompanyId]);

  useEffect(() => {
    const loadEmployees = async () => {
      if (!token) return;
      try {
        const rows = rowsFrom(await employeeService.listEmployees(token, { companyId: asUuidOrEmpty(selectedCompanyId) || null }))
          .map(normalizeEmployeeRow)
          .filter((e) => !!asUuidOrEmpty(e.employeeId));
        setEmployees(rows);
      } catch {
        setEmployees([]);
      }
    };
    loadEmployees();
  }, [token, selectedCompanyId]);

  const companyMap = useMemo(() => {
    const out = {};
    companies.forEach((c) => { out[String(c.id)] = c; });
    return out;
  }, [companies]);
  const branchNameById = useMemo(
    () => Object.fromEntries(branches.map((b) => [String(b.id), b.name || '-'])),
    [branches]
  );
  const departmentNameById = useMemo(
    () => Object.fromEntries(departments.map((d) => [String(d.id), d.name || '-'])),
    [departments]
  );

  const employeeOptions = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return employees
      .filter((e) => {
        if (!needle) return true;
        const name = `${e.firstName || ''} ${e.lastName || ''}`.trim().toLowerCase();
        return String(e.employeeCode || '').toLowerCase().includes(needle) || name.includes(needle);
      })
      .map((e) => ({
        value: asUuidOrEmpty(e.employeeId),
        label: `${e.employeeCode || '-'} - ${`${e.firstName || ''} ${e.lastName || ''}`.trim() || 'Employee'}`,
      }))
      .filter((e) => !!e.value);
  }, [employees, q]);

  const selectedEmployee = useMemo(
    () => employees.find((e) => String(e.employeeId) === String(selectedEmployeeId)) || null,
    [employees, selectedEmployeeId]
  );

  const companyOptions = useMemo(
    () => companies.map((c) => ({ value: String(c.id), label: `${c.name} (${c.code})` })),
    [companies]
  );
  const selectedCompanyOption = useMemo(
    () => companyOptions.find((x) => x.value === selectedCompanyId) || null,
    [companyOptions, selectedCompanyId]
  );

  const baseContext = useMemo(() => {
    if (!selectedEmployee) return null;
    const companyId = asUuidOrEmpty(selectedEmployee.companyId) || asUuidOrEmpty(selectedCompanyId) || '';
    const employeeId = asUuidOrEmpty(selectedEmployee.employeeId);
    if (!employeeId) return null;
    return {
      companyId,
      companyCode: selectedEmployee.companyCode || companyMap[companyId]?.code || '',
      employeeId,
    };
  }, [selectedEmployee, selectedCompanyId, companyMap]);
  const selectedEmployeeUuid = baseContext?.employeeId || '';

  const employeeSelectOptions = useMemo(
    () => employeeOptions.map((x) => ({ value: x.value, label: x.label })),
    [employeeOptions]
  );
  const projectOptions = useMemo(
    () => projects.map((p) => ({ value: String(p.projectId), label: `${p.projectCode || '-'} - ${p.projectName || 'Project'}` })),
    [projects]
  );
  const skillOptions = useMemo(
    () => skills
      .map((s) => ({
        value: String(s.skillId ?? s.skill_id ?? ''),
        label: s.skillName ?? s.skill_name ?? 'Skill',
      }))
      .filter((x) => !!x.value),
    [skills]
  );
  const trainingOptions = useMemo(
    () => trainings.map((t) => ({ value: String(t.trainingId), label: `${t.trainingCode || '-'} - ${t.trainingName || 'Training'}` })),
    [trainings]
  );
  const educationLevelOptions = useMemo(() => lookupOptions(lookups.educationLevels || []), [lookups.educationLevels]);
  const skillLevelOptions = useMemo(() => lookupOptions(lookups.skillLevels || []), [lookups.skillLevels]);
  const documentTypeOptions = useMemo(
    () => (lookups.documentTypes || []).map((x) => ({ value: x.name || x.code || String(x.id), label: x.name || x.code || String(x.id) })),
    [lookups.documentTypes]
  );
  const projectRoleOptions = useMemo(() => lookupOptions(lookups.projectMemberRoles || []), [lookups.projectMemberRoles]);
  const trainingStatusOptions = useMemo(() => lookupOptions(lookups.trainingStatuses || []), [lookups.trainingStatuses]);
  const complaintTypeOptions = useMemo(() => lookupOptions(lookups.complaintTypes || []), [lookups.complaintTypes]);
  const complaintPriorityOptions = useMemo(() => lookupOptions(lookups.complaintPriorities || []), [lookups.complaintPriorities]);
  const complaintStatusOptions = useMemo(() => lookupOptions(lookups.complaintStatuses || []), [lookups.complaintStatuses]);
  const performanceRatingOptions = useMemo(() => lookupOptions(lookups.performanceRatings || []), [lookups.performanceRatings]);
  const educationLevelNameById = useMemo(
    () => Object.fromEntries((lookups.educationLevels || []).map((x) => [String(x.id), x.name || x.label || String(x.id)])),
    [lookups.educationLevels]
  );
  const genderNameById = useMemo(
    () => Object.fromEntries((lookups.genders || []).map((x) => [String(x.id), x.name || x.label || String(x.id)])),
    [lookups.genders]
  );
  const employmentTypeNameById = useMemo(
    () => Object.fromEntries((lookups.employmentTypes || []).map((x) => [String(x.id), x.name || x.label || String(x.id)])),
    [lookups.employmentTypes]
  );
  const employmentStatusNameById = useMemo(
    () => Object.fromEntries((lookups.employmentStatuses || []).map((x) => [String(x.id), x.name || x.label || String(x.id)])),
    [lookups.employmentStatuses]
  );

  const entityFields = [
    { key: 'companyId', label: 'Company', type: 'autocomplete', options: companyOptions, readOnly: true },
    { key: 'companyCode', label: 'Company Code', readOnly: true },
    { key: 'employeeId', label: 'Employee', type: 'autocomplete', options: employeeSelectOptions, readOnly: true },
  ];
  const entityDefaults = baseContext || { companyId: '', companyCode: '', employeeId: '' };
  const prefillFilters = baseContext ? { companyId: baseContext.companyId, employeeId: baseContext.employeeId } : null;

  const resolvePayload = (form, buildExtra) => {
    if (!baseContext) throw new Error('Select an employee first');
    return {
      companyId: baseContext.companyId,
      companyCode: req(baseContext.companyCode),
      employeeId: baseContext.employeeId,
      ...buildExtra(form),
    };
  };

  const tabs = {
    education: (
      <CrudEntityPage
        title="Employee Education"
        icon={<ManageAccountsRoundedIcon sx={{ color: '#fff', fontSize: 20 }} />}
        gradient={`linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`}
        idKey="educationId"
        columns={[
          {
            key: 'levelId',
            label: 'Education Level',
            render: (r) => educationLevelNameById[String(r?.levelId)] || '-',
          },
          { key: 'institutionName', label: 'Institute Name' },
          { key: 'fieldOfStudy', label: 'Field Of Study' },
          { key: 'degreeName', label: 'Degree Name' },
          { key: 'startDate', label: 'Start Date' },
          { key: 'endDate', label: 'End Date' },
          {
            key: 'status',
            label: 'Status',
            render: (r) => (r?.isCompleted ? 'Completed' : 'In Progress'),
          },
        ]}
        filterFields={[]}
        formFields={[...entityFields, { key: 'levelId', label: 'Education Level', type: 'autocomplete', options: educationLevelOptions }, { key: 'institutionName', label: 'Institution Name' }, { key: 'fieldOfStudy', label: 'Field Of Study' }, { key: 'degreeName', label: 'Degree Name' }, { key: 'startDate', label: 'Start Date', type: 'date' }, { key: 'endDate', label: 'End Date', type: 'date' }, { key: 'isCompleted', label: 'Completed', type: 'boolean' }, { key: 'gradeGpa', label: 'Grade / GPA' }, { key: 'notes', label: 'Notes', fullWidth: true }]}
        defaultFilters={{ companyId: entityDefaults.companyId, employeeId: entityDefaults.employeeId }}
        emptyForm={{ ...entityDefaults, levelId: '', institutionName: '', fieldOfStudy: '', degreeName: '', startDate: '', endDate: '', isCompleted: 'false', gradeGpa: '', notes: '' }}
        normalizePayload={(f) => resolvePayload(f, (x) => ({ levelId: toInt(x.levelId), institutionName: req(x.institutionName), fieldOfStudy: opt(x.fieldOfStudy), degreeName: opt(x.degreeName), startDate: opt(x.startDate), endDate: opt(x.endDate), isCompleted: toBool(x.isCompleted), gradeGpa: opt(x.gradeGpa), notes: opt(x.notes) }))}
        mapRecordToForm={(r) => ({ ...r, ...entityDefaults, levelId: r?.levelId != null ? String(r.levelId) : '', isCompleted: r?.isCompleted === true ? 'true' : 'false' })}
        listFetcher={normalizingFetcher(employeeDetailsService.listEmployeeEducations)}
        getByIdFetcher={normalizingGetById(employeeDetailsService.getEmployeeEducationById)}
        createFetcher={employeeDetailsService.createEmployeeEducation}
        updateFetcher={employeeDetailsService.updateEmployeeEducation}
        deleteFetcher={employeeDetailsService.deleteEmployeeEducation}
        prefillForm={entityDefaults}
        prefillFilters={prefillFilters}
        autoSearch
        autoSearchDebounceMs={50}
        hideHeader
        hideFilters
        showCreateButtonWhenHeaderHidden
      />
    ),
    skill: (
      <CrudEntityPage
        title="Employee Skill Assessment"
        icon={<ManageAccountsRoundedIcon sx={{ color: '#fff', fontSize: 20 }} />}
        gradient={`linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`}
        idKey="assessmentId"
        columns={[
          { key: 'skillName', label: 'Skill Name' },
          { key: 'assessmentDate', label: 'Assessment Date' },
          { key: 'skillLevelName', label: 'Skill Level' },
          { key: 'proficiency', label: 'Proficiency' },
        ]}
        filterFields={[]}
        formFields={[...entityFields, { key: 'skillId', label: 'Skill', type: 'autocomplete', options: skillOptions }, { key: 'assessmentDate', label: 'Assessment Date', type: 'date' }, { key: 'skillLevelId', label: 'Skill Level', type: 'autocomplete', options: skillLevelOptions }, { key: 'proficiency', label: 'Proficiency' }, { key: 'assessedBy', label: 'Assessed By', type: 'autocomplete', options: employeeSelectOptions }, { key: 'notes', label: 'Notes', fullWidth: true }]}
        defaultFilters={{ companyId: entityDefaults.companyId, employeeId: entityDefaults.employeeId }}
        emptyForm={{ ...entityDefaults, skillId: '', assessmentDate: '', skillLevelId: '', proficiency: '', assessedBy: '', notes: '' }}
        normalizePayload={(f) => resolvePayload(f, (x) => ({ skillId: toUuid(x.skillId), assessmentDate: req(x.assessmentDate), skillLevelId: toInt(x.skillLevelId), proficiency: toInt(x.proficiency), assessedBy: toUuid(x.assessedBy), notes: opt(x.notes) }))}
        mapRecordToForm={(r) => ({ ...r, ...entityDefaults, skillId: r?.skillId ? String(r.skillId) : '', skillLevelId: r?.skillLevelId != null ? String(r.skillLevelId) : '', proficiency: r?.proficiency != null ? String(r.proficiency) : '', assessedBy: r?.assessedBy ? String(r.assessedBy) : '' })}
        listFetcher={normalizingFetcher(employeeDetailsService.listEmployeeSkillAssessments)}
        getByIdFetcher={normalizingGetById(employeeDetailsService.getEmployeeSkillAssessmentById)}
        createFetcher={employeeDetailsService.createEmployeeSkillAssessment}
        updateFetcher={employeeDetailsService.updateEmployeeSkillAssessment}
        deleteFetcher={employeeDetailsService.deleteEmployeeSkillAssessment}
        prefillForm={entityDefaults}
        prefillFilters={prefillFilters}
        autoSearch
        autoSearchDebounceMs={50}
        hideHeader
        hideFilters
        showCreateButtonWhenHeaderHidden
      />
    ),
    document: (
      <CrudEntityPage
        title="Employee Document"
        icon={<ManageAccountsRoundedIcon sx={{ color: '#fff', fontSize: 20 }} />}
        gradient={`linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`}
        idKey="documentId"
        columns={[{ key: 'documentType', label: 'Type' }, { key: 'documentName', label: 'Document Name' }, { key: 'documentNumber', label: 'Number' }, { key: 'expiryDate', label: 'Expiry Date' }, { key: 'isVerified', label: 'Verified', type: 'boolean' }]}
        filterFields={[]}
        formFields={[...entityFields, { key: 'documentType', label: 'Document Type', type: 'autocomplete', options: documentTypeOptions }, { key: 'documentName', label: 'Document Name' }, { key: 'documentNumber', label: 'Document Number' }, { key: 'filePath', label: 'File Path' }, { key: 'mimeType', label: 'MIME Type' }, { key: 'fileSizeBytes', label: 'File Size Bytes' }, { key: 'issueDate', label: 'Issue Date', type: 'date' }, { key: 'expiryDate', label: 'Expiry Date', type: 'date' }, { key: 'isVerified', label: 'Verified', type: 'boolean' }, { key: 'verifiedBy', label: 'Verified By', type: 'autocomplete', options: employeeSelectOptions }, { key: 'notes', label: 'Notes', fullWidth: true }]}
        defaultFilters={{ companyId: entityDefaults.companyId, employeeId: entityDefaults.employeeId }}
        emptyForm={{ ...entityDefaults, documentType: '', documentName: '', documentNumber: '', filePath: '', mimeType: '', fileSizeBytes: '', issueDate: '', expiryDate: '', isVerified: 'false', verifiedBy: '', notes: '' }}
        normalizePayload={(f) => resolvePayload(f, (x) => ({ documentType: req(x.documentType), documentName: req(x.documentName), documentNumber: opt(x.documentNumber), filePath: req(x.filePath), mimeType: opt(x.mimeType), fileSizeBytes: opt(x.fileSizeBytes), issueDate: opt(x.issueDate), expiryDate: opt(x.expiryDate), isVerified: toBool(x.isVerified), verifiedBy: toUuid(x.verifiedBy), notes: opt(x.notes) }))}
        mapRecordToForm={(r) => ({ ...r, ...entityDefaults, isVerified: r?.isVerified === true ? 'true' : 'false', verifiedBy: r?.verifiedBy ? String(r.verifiedBy) : '' })}
        listFetcher={normalizingFetcher(employeeDetailsService.listEmployeeDocuments)}
        getByIdFetcher={normalizingGetById(employeeDetailsService.getEmployeeDocumentById)}
        createFetcher={employeeDetailsService.createEmployeeDocument}
        updateFetcher={employeeDetailsService.updateEmployeeDocument}
        deleteFetcher={employeeDetailsService.deleteEmployeeDocument}
        prefillForm={entityDefaults}
        prefillFilters={prefillFilters}
        autoSearch
        autoSearchDebounceMs={50}
        hideHeader
        hideFilters
        showCreateButtonWhenHeaderHidden
      />
    ),
    project: (
      <CrudEntityPage
        title="Project Member"
        icon={<ManageAccountsRoundedIcon sx={{ color: '#fff', fontSize: 20 }} />}
        gradient={`linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`}
        idKey="memberId"
        columns={[{ key: 'projectId', label: 'Project' }, { key: 'roleId', label: 'Role' }, { key: 'joinedDate', label: 'Joined Date' }, { key: 'leftDate', label: 'Left Date' }, { key: 'isActive', label: 'Active', type: 'boolean' }]}
        filterFields={[]}
        formFields={[...entityFields, { key: 'projectId', label: 'Project', type: 'autocomplete', options: projectOptions }, { key: 'roleId', label: 'Project Role', type: 'autocomplete', options: projectRoleOptions }, { key: 'joinedDate', label: 'Joined Date', type: 'date' }, { key: 'leftDate', label: 'Left Date', type: 'date' }, { key: 'isActive', label: 'Active', type: 'boolean' }]}
        defaultFilters={{ companyId: entityDefaults.companyId, employeeId: entityDefaults.employeeId }}
        emptyForm={{ ...entityDefaults, projectId: '', roleId: '', joinedDate: '', leftDate: '', isActive: 'true' }}
        normalizePayload={(f) => resolvePayload(f, (x) => ({ projectId: toUuid(x.projectId), roleId: toInt(x.roleId), joinedDate: opt(x.joinedDate), leftDate: opt(x.leftDate), isActive: toBool(x.isActive) }))}
        mapRecordToForm={(r) => ({ ...r, ...entityDefaults, projectId: r?.projectId ? String(r.projectId) : '', roleId: r?.roleId != null ? String(r.roleId) : '', isActive: r?.isActive === false ? 'false' : 'true' })}
        listFetcher={normalizingFetcher(employeeDetailsService.listProjectMembers)}
        getByIdFetcher={normalizingGetById(employeeDetailsService.getProjectMemberById)}
        createFetcher={employeeDetailsService.createProjectMember}
        updateFetcher={employeeDetailsService.updateProjectMember}
        deleteFetcher={employeeDetailsService.deleteProjectMember}
        prefillForm={entityDefaults}
        prefillFilters={prefillFilters}
        autoSearch
        autoSearchDebounceMs={50}
        hideHeader
        hideFilters
        showCreateButtonWhenHeaderHidden
      />
    ),
    training: (
      <CrudEntityPage
        title="Employee Training Record"
        icon={<ManageAccountsRoundedIcon sx={{ color: '#fff', fontSize: 20 }} />}
        gradient={`linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`}
        idKey="trainingRecordId"
        columns={[{ key: 'trainingDate', label: 'Training Date' }, { key: 'completionDate', label: 'Completion Date' }, { key: 'statusId', label: 'Status' }, { key: 'score', label: 'Score' }, { key: 'certificateNumber', label: 'Certificate' }]}
        filterFields={[]}
        formFields={[...entityFields, { key: 'trainingId', label: 'Training', type: 'autocomplete', options: trainingOptions }, { key: 'trainingDate', label: 'Training Date', type: 'date' }, { key: 'completionDate', label: 'Completion Date', type: 'date' }, { key: 'statusId', label: 'Status', type: 'autocomplete', options: trainingStatusOptions }, { key: 'score', label: 'Score' }, { key: 'certificateNumber', label: 'Certificate Number' }, { key: 'notes', label: 'Notes', fullWidth: true }]}
        defaultFilters={{ companyId: entityDefaults.companyId, employeeId: entityDefaults.employeeId }}
        emptyForm={{ ...entityDefaults, trainingId: '', trainingDate: '', completionDate: '', statusId: '', score: '', certificateNumber: '', notes: '' }}
        normalizePayload={(f) => resolvePayload(f, (x) => ({ trainingId: toUuid(x.trainingId), trainingDate: req(x.trainingDate), completionDate: opt(x.completionDate), statusId: toInt(x.statusId), score: toDecimal(x.score), certificateNumber: opt(x.certificateNumber), notes: opt(x.notes) }))}
        mapRecordToForm={(r) => ({ ...r, ...entityDefaults, trainingId: r?.trainingId ? String(r.trainingId) : '', statusId: r?.statusId != null ? String(r.statusId) : '', score: r?.score != null ? String(r.score) : '' })}
        listFetcher={normalizingFetcher(employeeDetailsService.listEmployeeTrainingRecords)}
        getByIdFetcher={normalizingGetById(employeeDetailsService.getEmployeeTrainingRecordById)}
        createFetcher={employeeDetailsService.createEmployeeTrainingRecord}
        updateFetcher={employeeDetailsService.updateEmployeeTrainingRecord}
        deleteFetcher={employeeDetailsService.deleteEmployeeTrainingRecord}
        prefillForm={entityDefaults}
        prefillFilters={prefillFilters}
        autoSearch
        autoSearchDebounceMs={50}
        hideHeader
        hideFilters
        showCreateButtonWhenHeaderHidden
      />
    ),
    complaint: (
      <CrudEntityPage
        title="Employee Complaint"
        icon={<ManageAccountsRoundedIcon sx={{ color: '#fff', fontSize: 20 }} />}
        gradient={`linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`}
        idKey="complaintId"
        columns={[{ key: 'complaintDate', label: 'Complaint Date' }, { key: 'subject', label: 'Subject' }, { key: 'priorityId', label: 'Priority' }, { key: 'statusId', label: 'Status' }, { key: 'resolvedDate', label: 'Resolved Date' }]}
        filterFields={[]}
        formFields={[...entityFields, { key: 'complaintDate', label: 'Complaint Date', type: 'date' }, { key: 'complaintTypeId', label: 'Complaint Type', type: 'autocomplete', options: complaintTypeOptions }, { key: 'subject', label: 'Subject' }, { key: 'description', label: 'Description', fullWidth: true }, { key: 'priorityId', label: 'Priority', type: 'autocomplete', options: complaintPriorityOptions }, { key: 'statusId', label: 'Status', type: 'autocomplete', options: complaintStatusOptions }, { key: 'assignedTo', label: 'Assigned To', type: 'autocomplete', options: employeeSelectOptions }, { key: 'resolution', label: 'Resolution', fullWidth: true }, { key: 'resolvedDate', label: 'Resolved Date', type: 'date' }]}
        defaultFilters={{ companyId: entityDefaults.companyId, employeeId: entityDefaults.employeeId }}
        emptyForm={{ ...entityDefaults, complaintDate: '', complaintTypeId: '', subject: '', description: '', priorityId: '', statusId: '', assignedTo: '', resolution: '', resolvedDate: '' }}
        normalizePayload={(f) => resolvePayload(f, (x) => ({ complaintDate: req(x.complaintDate), complaintTypeId: toInt(x.complaintTypeId), subject: req(x.subject), description: req(x.description), priorityId: toInt(x.priorityId), statusId: toInt(x.statusId), assignedTo: toUuid(x.assignedTo), resolution: opt(x.resolution), resolvedDate: opt(x.resolvedDate) }))}
        mapRecordToForm={(r) => ({ ...r, ...entityDefaults, complaintTypeId: r?.complaintTypeId != null ? String(r.complaintTypeId) : '', priorityId: r?.priorityId != null ? String(r.priorityId) : '', statusId: r?.statusId != null ? String(r.statusId) : '', assignedTo: r?.assignedTo ? String(r.assignedTo) : '' })}
        listFetcher={normalizingFetcher(employeeDetailsService.listEmployeeComplaints)}
        getByIdFetcher={normalizingGetById(employeeDetailsService.getEmployeeComplaintById)}
        createFetcher={employeeDetailsService.createEmployeeComplaint}
        updateFetcher={employeeDetailsService.updateEmployeeComplaint}
        deleteFetcher={employeeDetailsService.deleteEmployeeComplaint}
        prefillForm={entityDefaults}
        prefillFilters={prefillFilters}
        autoSearch
        autoSearchDebounceMs={50}
        hideHeader
        hideFilters
        showCreateButtonWhenHeaderHidden
      />
    ),
    performance: (
      <CrudEntityPage
        title="Employee Performance Review"
        icon={<ManageAccountsRoundedIcon sx={{ color: '#fff', fontSize: 20 }} />}
        gradient={`linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`}
        idKey="reviewId"
        columns={[{ key: 'reviewDate', label: 'Review Date' }, { key: 'reviewerId', label: 'Reviewer' }, { key: 'performanceScore', label: 'Performance' }, { key: 'overallRatingId', label: 'Overall Rating' }, { key: 'nextReviewDate', label: 'Next Review Date' }]}
        filterFields={[]}
        formFields={[...entityFields, { key: 'reviewDate', label: 'Review Date', type: 'date' }, { key: 'reviewerId', label: 'Reviewer', type: 'autocomplete', options: employeeSelectOptions }, { key: 'performanceScore', label: 'Performance Score' }, { key: 'attendanceScore', label: 'Attendance Score' }, { key: 'productivityScore', label: 'Productivity Score' }, { key: 'safetyScore', label: 'Safety Score' }, { key: 'overallRatingId', label: 'Overall Rating', type: 'autocomplete', options: performanceRatingOptions }, { key: 'strengths', label: 'Strengths', fullWidth: true }, { key: 'areasForImprovement', label: 'Areas For Improvement', fullWidth: true }, { key: 'goals', label: 'Goals', fullWidth: true }, { key: 'nextReviewDate', label: 'Next Review Date', type: 'date' }]}
        defaultFilters={{ companyId: entityDefaults.companyId, employeeId: entityDefaults.employeeId }}
        emptyForm={{ ...entityDefaults, reviewDate: '', reviewerId: '', performanceScore: '', attendanceScore: '', productivityScore: '', safetyScore: '', overallRatingId: '', strengths: '', areasForImprovement: '', goals: '', nextReviewDate: '' }}
        normalizePayload={(f) => resolvePayload(f, (x) => ({ reviewDate: req(x.reviewDate), reviewerId: toUuid(x.reviewerId), performanceScore: toDecimal(x.performanceScore), attendanceScore: toDecimal(x.attendanceScore), productivityScore: toDecimal(x.productivityScore), safetyScore: toDecimal(x.safetyScore), overallRatingId: toInt(x.overallRatingId), strengths: opt(x.strengths), areasForImprovement: opt(x.areasForImprovement), goals: opt(x.goals), nextReviewDate: opt(x.nextReviewDate) }))}
        mapRecordToForm={(r) => ({ ...r, ...entityDefaults, reviewerId: r?.reviewerId ? String(r.reviewerId) : '', overallRatingId: r?.overallRatingId != null ? String(r.overallRatingId) : '', performanceScore: r?.performanceScore != null ? String(r.performanceScore) : '', attendanceScore: r?.attendanceScore != null ? String(r.attendanceScore) : '', productivityScore: r?.productivityScore != null ? String(r.productivityScore) : '', safetyScore: r?.safetyScore != null ? String(r.safetyScore) : '' })}
        listFetcher={normalizingFetcher(employeeDetailsService.listEmployeePerformanceReviews)}
        getByIdFetcher={normalizingGetById(employeeDetailsService.getEmployeePerformanceReviewById)}
        createFetcher={employeeDetailsService.createEmployeePerformanceReview}
        updateFetcher={employeeDetailsService.updateEmployeePerformanceReview}
        deleteFetcher={employeeDetailsService.deleteEmployeePerformanceReview}
        prefillForm={entityDefaults}
        prefillFilters={prefillFilters}
        autoSearch
        autoSearchDebounceMs={50}
        hideHeader
        hideFilters
        showCreateButtonWhenHeaderHidden
      />
    ),
  };

  return (
    <Stack spacing={2}>
      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 1 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }} justifyContent="space-between">
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box sx={{ width: 40, height: 40, borderRadius: 1, background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ManageAccountsRoundedIcon sx={{ color: '#fff' }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>Employee Details</Typography>
              <Typography variant="caption" color="text.secondary">Search one employee, view overview, and manage related records</Typography>
            </Box>
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ minWidth: { md: 620 }, width: { xs: '100%', md: 'auto' } }}>
            <Autocomplete
              options={companyOptions}
              value={selectedCompanyOption}
              onChange={(_, x) => { setSelectedCompanyId(x?.value || ''); setSelectedEmployeeId(''); }}
              getOptionLabel={(option) => option?.label || ''}
              isOptionEqualToValue={(option, value) => option?.value === value?.value}
              renderInput={(params) => <TextField {...params} label="Company" size="small" />}
              sx={{ minWidth: 220 }}
            />
            <TextField size="small" label="Search Employee" value={q} onChange={(e) => setQ(e.target.value)} sx={{ minWidth: 180 }} />
            <Autocomplete
              options={employeeOptions}
              value={employeeOptions.find((x) => x.value === selectedEmployeeId) || null}
              onChange={(_, x) => setSelectedEmployeeId(x?.value || '')}
              renderInput={(params) => <TextField {...params} label="Employee" size="small" />}
              sx={{ minWidth: 320 }}
            />
          </Stack>
        </Stack>
        {loadingError && <Alert severity="error" sx={{ mt: 2 }}>{loadingError}</Alert>}
      </Paper>

      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 1 }}>
        {selectedEmployee ? (
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <Chip label={`Code: ${selectedEmployee.employeeCode || '-'}`} />
            <Chip label={`Name: ${`${selectedEmployee.firstName || ''} ${selectedEmployee.lastName || ''}`.trim() || '-'}`} />
            <Chip label={`Company: ${selectedEmployee.companyCode || companyMap[String(selectedEmployee.companyId)]?.code || '-'}`} />
            <Chip label={`Job Title: ${selectedEmployee.jobTitle || '-'}`} />
            <Chip label={`Hire Date: ${selectedEmployee.hireDate || '-'}`} />
          </Stack>
        ) : (
          <Alert severity="info">Select an employee to load details data.</Alert>
        )}
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mt: 1 }}>
          <Tab value="overview" label="Employee Overview" />
          <Tab value="education" label="Employee Education" />
          <Tab value="skill" label="Employee Skill Assessment" />
          <Tab value="document" label="Employee Document" />
          <Tab value="project" label="Project Member" />
          <Tab value="training" label="Employee Training Record" />
          <Tab value="complaint" label="Employee Complaint" />
          <Tab value="performance" label="Employee Performance Review" />
        </Tabs>
        {tabPanel(tab, 'overview', selectedEmployee ? (
          <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} alignItems="flex-start">

            {/* ── LEFT PANEL ── */}
            <Box sx={{ width: { xs: '100%', lg: 280 }, minWidth: { xs: '100%', lg: 280 }, flexShrink: 0 }}>

              {/* Employee Avatar Card */}
              <Paper
                variant="outlined"
                sx={{
                  p: 3,
                  mb: 2,
                  borderRadius: 3,
                  background: `linear-gradient(160deg, ${theme.palette.primary.main}18, ${theme.palette.secondary.main}14)`,
                  textAlign: 'center',
                }}
              >
                <Avatar
                  sx={{
                    width: 96,
                    height: 96,
                    mx: 'auto',
                    mb: 2,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    boxShadow: `0 4px 20px ${theme.palette.primary.main}44`,
                  }}
                >
                  <ManageAccountsRoundedIcon sx={{ fontSize: 52, color: '#fff' }} />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                  {selectedEmployee.employeeCode || '-'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
                  {`${selectedEmployee.firstName || ''} ${selectedEmployee.lastName || ''}`.trim() || '-'}
                </Typography>
                <Stack spacing={0.75}>
                  <Chip
                    size="small"
                    color={selectedEmployee.isActive !== false ? 'success' : 'default'}
                    label={employmentStatusNameById[String(selectedEmployee.employmentStatusId)] || 'Active'}
                    sx={{ fontWeight: 700 }}
                  />
                  <Chip
                    size="small"
                    variant="outlined"
                    color="primary"
                    label={`Type: ${employmentTypeNameById[String(selectedEmployee.employmentTypeId)] || '-'}`}
                  />
                  <Chip
                    size="small"
                    variant="outlined"
                    label={`Dept: ${selectedEmployee.departmentName || departmentNameById[String(selectedEmployee.departmentId)] || '-'}`}
                  />
                </Stack>
              </Paper>

              {/* Identity Card */}
              <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                  <BadgeRoundedIcon fontSize="small" color="primary" />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Identity</Typography>
                </Stack>
                <Divider sx={{ mb: 1.5 }} />
                {[
                  { label: 'Employee Code', value: selectedEmployee.employeeCode },
                  { label: 'National ID', value: selectedEmployee.nationalId },
                  { label: 'Gender', value: genderNameById[String(selectedEmployee.genderId)] || selectedEmployee.genderId },
                  { label: 'Date of Birth', value: selectedEmployee.dateOfBirth },
                ].map(({ label, value }) => (
                  <Box key={label} sx={{ mb: 1.25 }}>
                    <Typography variant="caption" color="text.secondary" display="block">{label}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, wordBreak: 'break-all' }}>{value || '-'}</Typography>
                  </Box>
                ))}
              </Paper>

              {/* Role Flags Card */}
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                  <WorkRoundedIcon fontSize="small" color="primary" />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Roles</Typography>
                </Stack>
                <Divider sx={{ mb: 1.5 }} />
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                  <Chip size="small" color={selectedEmployee.isDriver ? 'primary' : 'default'} variant={selectedEmployee.isDriver ? 'filled' : 'outlined'} label="Driver" sx={{ fontWeight: 700 }} />
                  <Chip size="small" color={selectedEmployee.isOperator ? 'primary' : 'default'} variant={selectedEmployee.isOperator ? 'filled' : 'outlined'} label="Operator" sx={{ fontWeight: 700 }} />
                  <Chip size="small" color={selectedEmployee.isTechnician ? 'primary' : 'default'} variant={selectedEmployee.isTechnician ? 'filled' : 'outlined'} label="Technician" sx={{ fontWeight: 700 }} />
                </Stack>
              </Paper>
            </Box>

            {/* ── RIGHT PANEL ── */}
            <Box sx={{ flex: 1, minWidth: 0 }}>

              {/* Personal Information */}
              <Paper variant="outlined" sx={{ p: 2.5, mb: 2, borderRadius: 2 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                  <PersonRoundedIcon fontSize="small" color="primary" />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Personal Information</Typography>
                </Stack>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  {[
                    { label: 'First Name', value: selectedEmployee.firstName, icon: <PersonRoundedIcon fontSize="small" /> },
                    { label: 'Last Name', value: selectedEmployee.lastName, icon: <PersonRoundedIcon fontSize="small" /> },
                    { label: 'Gender', value: genderNameById[String(selectedEmployee.genderId)] || selectedEmployee.genderId, icon: <BadgeRoundedIcon fontSize="small" /> },
                    { label: 'Date of Birth', value: selectedEmployee.dateOfBirth, icon: <CalendarMonthRoundedIcon fontSize="small" /> },
                    { label: 'National ID', value: selectedEmployee.nationalId, icon: <BadgeRoundedIcon fontSize="small" /> },
                  ].map(({ label, value, icon }) => (
                    <Grid item xs={12} sm={6} md={4} key={label}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, p: 1.5, borderRadius: 2, bgcolor: 'action.hover' }}>
                        <Box sx={{ color: 'primary.main', mt: 0.25, flexShrink: 0 }}>{icon}</Box>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="caption" color="text.secondary" display="block">{label}</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700, wordBreak: 'break-word' }}>{value || '-'}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Paper>

              {/* Contact Information */}
              <Paper variant="outlined" sx={{ p: 2.5, mb: 2, borderRadius: 2 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                  <ContactPhoneRoundedIcon fontSize="small" color="primary" />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Contact Information</Typography>
                </Stack>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  {[
                    { label: 'Mobile Phone', value: selectedEmployee.mobilePhone, icon: <ContactPhoneRoundedIcon fontSize="small" /> },
                    { label: 'Work Email', value: selectedEmployee.workEmail, icon: <EmailRoundedIcon fontSize="small" /> },
                    { label: 'Current Address', value: selectedEmployee.currentAddress, icon: <HomeRoundedIcon fontSize="small" /> },
                  ].map(({ label, value, icon }) => (
                    <Grid item xs={12} sm={6} key={label}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, p: 1.5, borderRadius: 2, bgcolor: 'action.hover' }}>
                        <Box sx={{ color: 'secondary.main', mt: 0.25, flexShrink: 0 }}>{icon}</Box>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="caption" color="text.secondary" display="block">{label}</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700, wordBreak: 'break-word' }}>{value || '-'}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Paper>

              {/* Organization & Employment */}
              <Paper variant="outlined" sx={{ p: 2.5, mb: 2, borderRadius: 2 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                  <BusinessRoundedIcon fontSize="small" color="primary" />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Organization & Employment</Typography>
                </Stack>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  {[
                    { label: 'Company', value: selectedEmployee.companyCode || companyMap[String(selectedEmployee.companyId)]?.code, icon: <BusinessRoundedIcon fontSize="small" /> },
                    { label: 'Branch', value: selectedEmployee.branchName || branchNameById[String(selectedEmployee.branchId)] || '-', icon: <BusinessRoundedIcon fontSize="small" /> },
                    { label: 'Department', value: selectedEmployee.departmentName || departmentNameById[String(selectedEmployee.departmentId)] || '-', icon: <BusinessRoundedIcon fontSize="small" /> },
                    { label: 'Job Title', value: selectedEmployee.jobTitle, icon: <WorkRoundedIcon fontSize="small" /> },
                    { label: 'Hire Date', value: selectedEmployee.hireDate, icon: <CalendarMonthRoundedIcon fontSize="small" /> },
                    { label: 'Employment Type', value: employmentTypeNameById[String(selectedEmployee.employmentTypeId)] || selectedEmployee.employmentTypeId, icon: <BadgeRoundedIcon fontSize="small" /> },
                    { label: 'Employment Status', value: employmentStatusNameById[String(selectedEmployee.employmentStatusId)] || selectedEmployee.employmentStatusId, icon: <BadgeRoundedIcon fontSize="small" /> },
                  ].map(({ label, value, icon }) => (
                    <Grid item xs={12} sm={6} md={4} key={label}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, p: 1.5, borderRadius: 2, bgcolor: 'action.hover' }}>
                        <Box sx={{ color: 'primary.main', mt: 0.25, flexShrink: 0 }}>{icon}</Box>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="caption" color="text.secondary" display="block">{label}</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700, wordBreak: 'break-word' }}>{value || '-'}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Paper>

            </Box>
          </Stack>
        ) : <Alert severity="info">Select an employee to view overview.</Alert>)}
        {tabPanel(tab, 'education', selectedEmployee ? <Box key={`edu-${selectedEmployeeId}`}>{tabs.education}</Box> : <Alert severity="info">Select an employee to add or modify education records.</Alert>)}
        {tabPanel(tab, 'skill', selectedEmployee ? <Box key={`skill-${selectedEmployeeId}`}>{tabs.skill}</Box> : <Alert severity="info">Select an employee to add or modify skill assessments.</Alert>)}
        {tabPanel(tab, 'document', selectedEmployee ? <Box key={`doc-${selectedEmployeeId}`}>{tabs.document}</Box> : <Alert severity="info">Select an employee to add or modify documents.</Alert>)}
        {tabPanel(tab, 'project', selectedEmployee ? <Box key={`project-${selectedEmployeeId}`}>{tabs.project}</Box> : <Alert severity="info">Select an employee to add or modify project member records.</Alert>)}
        {tabPanel(tab, 'training', selectedEmployee ? <Box key={`training-${selectedEmployeeId}`}>{tabs.training}</Box> : <Alert severity="info">Select an employee to add or modify training records.</Alert>)}
        {tabPanel(tab, 'complaint', selectedEmployee ? <Box key={`complaint-${selectedEmployeeId}`}>{tabs.complaint}</Box> : <Alert severity="info">Select an employee to add or modify complaints.</Alert>)}
        {tabPanel(tab, 'performance', selectedEmployee ? <Box key={`perf-${selectedEmployeeId}`}>{tabs.performance}</Box> : <Alert severity="info">Select an employee to add or modify performance reviews.</Alert>)}
      </Paper>
    </Stack>
  );
}
