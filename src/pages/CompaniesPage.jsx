import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
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
const toInt = (v) => {
  const s = opt(v);
  return s == null ? null : Number.parseInt(s, 10);
};
const toBool = (v) => (v === '' || v == null ? null : String(v) === 'true');
const safeIntlValues = (type) => {
  try {
    if (typeof Intl !== 'undefined' && typeof Intl.supportedValuesOf === 'function') {
      return Intl.supportedValuesOf(type) || [];
    }
  } catch {}
  return [];
};
const rowsFrom = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

export default function CompaniesPage() {
  const theme = useTheme();
  const { token } = useAuth();
  const [companyTypes, setCompanyTypes] = useState([]);
  const [companyCodeOptions, setCompanyCodeOptions] = useState([]);
  const [timezones, setTimezones] = useState(() => safeIntlValues('timeZone').map((z) => ({ value: z, label: z })));
  const [currencies, setCurrencies] = useState(() => safeIntlValues('currency').map((c) => ({ value: c, label: c })));

  useEffect(() => {
    const loadLookups = async () => {
      if (!token) return;
      try {
        const data = await organizationService.organizationLookups(token, { activeOnly: true });
        let enums = data?.companyTypes || [];
        if (!enums.length) {
          enums = await organizationService.enumValues('company_type', { activeOnly: true });
        }
        const options = (enums || []).map((x) => ({ value: String(x.id), label: x.name }));
        setCompanyTypes(options);
        const tzRaw = (data?.timezones && data.timezones.length) ? data.timezones : safeIntlValues('timeZone');
        const curRaw = (data?.currencies && data.currencies.length) ? data.currencies : safeIntlValues('currency');
        const tz = tzRaw.map((z) => ({ value: z, label: z }));
        const cur = curRaw.map((c) => ({ value: c, label: c }));
        setTimezones(tz);
        setCurrencies(cur);

        const companies = rowsFrom(await organizationService.listCompanies(token, { activeOnly: '' }));
        const codes = [...new Set(companies.map((x) => x.companyCode).filter(Boolean))]
          .sort((a, b) => a.localeCompare(b))
          .map((code) => ({ value: code, label: code }));
        setCompanyCodeOptions(codes);
      } catch {
        try {
          const enums = await organizationService.enumValues('company_type', { activeOnly: true });
          const options = (enums || []).map((x) => ({ value: String(x.id), label: x.name }));
          setCompanyTypes(options);
          setTimezones(safeIntlValues('timeZone').map((z) => ({ value: z, label: z })));
          setCurrencies(safeIntlValues('currency').map((c) => ({ value: c, label: c })));
          const companies = rowsFrom(await organizationService.listCompanies(token, { activeOnly: '' }));
          const codes = [...new Set(companies.map((x) => x.companyCode).filter(Boolean))]
            .sort((a, b) => a.localeCompare(b))
            .map((code) => ({ value: code, label: code }));
          setCompanyCodeOptions(codes);
        } catch {
          setCompanyTypes([]);
          setCompanyCodeOptions([]);
          setTimezones(safeIntlValues('timeZone').map((z) => ({ value: z, label: z })));
          setCurrencies(safeIntlValues('currency').map((c) => ({ value: c, label: c })));
        }
      }
    };
    loadLookups();
  }, [token]);

  const formFields = useMemo(() => ([
    { key: 'companyCode', label: 'Company Code' },
    { key: 'companyName', label: 'Company Name' },
    { key: 'companyTypeId', label: 'Company Type', type: 'select', options: [{ value: '', label: 'Select Type' }, ...companyTypes] },
    { key: 'registrationNo', label: 'Registration No' },
    { key: 'taxId', label: 'Tax ID' },
    { key: 'email', label: 'Email' },
    { key: 'phonePrimary', label: 'Phone' },
    { key: 'address', label: 'Address', minWidth: 260 },
    { key: 'timezone', label: 'Timezone', type: 'select', options: [{ value: '', label: 'Select Timezone' }, ...timezones] },
    { key: 'currency', label: 'Currency', type: 'select', options: [{ value: '', label: 'Select Currency' }, ...currencies] },
    { key: 'isActive', label: 'Is Active', type: 'boolean' },
  ]), [companyTypes, timezones, currencies]);

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
    { key: 'companyName_like', label: 'Company Name' },
    { key: 'registrationNo_like', label: 'Registration No' },
    { key: 'phoneNo_like', label: 'Phone No' },
    {
      key: 'companyCode_like',
      label: 'Company Code',
      type: 'select',
      options: [{ value: '', label: 'All Codes' }, ...companyCodeOptions],
    },
  ]), [companyCodeOptions]);
  const listCompaniesByFilter = useCallback(async (sessionToken, filters) => {
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
    return organizationService.listCompanies(sessionToken, params);
  }, []);

  return (
    <CrudEntityPage
      title="Companies"
      icon={<BusinessRoundedIcon sx={{ color: '#fff', fontSize: 20 }} />}
      gradient={`linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`}
      idKey="companyId"
      columns={[
        { key: 'companyCode', label: 'Code', type: 'code' },
        { key: 'companyName', label: 'Name' },
        { key: 'registrationNo', label: 'Registration' },
        { key: 'phonePrimary', label: 'Phone' },
        { key: 'email', label: 'Email' },
        { key: 'isActive', label: 'Active', type: 'boolean' },
      ]}
      filterFields={filterFields}
      formFields={formFields}
      defaultFilters={{
        status: 'active',
        companyName_like: '',
        registrationNo_like: '',
        phoneNo_like: '',
        companyCode_like: '',
        sortBy: 'companyName',
        sortDir: 'asc',
      }}
      emptyForm={{
        companyCode: '',
        companyName: '',
        companyTypeId: '',
        registrationNo: '',
        taxId: '',
        email: '',
        phonePrimary: '',
        address: '',
        timezone: 'Asia/Colombo',
        currency: 'LKR',
        isActive: 'true',
      }}
      normalizePayload={(form, mode) => {
        const payload = {
          companyName: req(form.companyName),
          companyTypeId: toInt(form.companyTypeId),
          registrationNo: req(form.registrationNo),
          taxId: opt(form.taxId),
          email: req(form.email),
          phonePrimary: req(form.phonePrimary),
          address: opt(form.address),
          timezone: opt(form.timezone),
          currency: opt(form.currency),
          isActive: toBool(form.isActive),
        };
        if (mode !== 'edit') payload.companyCode = req(form.companyCode);
        return payload;
      }}
      listFetcher={listCompaniesByFilter}
      getByIdFetcher={organizationService.getCompanyById}
      createFetcher={organizationService.createCompany}
      updateFetcher={organizationService.updateCompany}
      deleteFetcher={organizationService.deleteCompany}
      autoSearch
      autoSearchDebounceMs={350}
      fitViewport
      viewportOffset={190}
    />
  );
}
