import VpnKeyRoundedIcon from '@mui/icons-material/VpnKeyRounded';
import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import CrudEntityPage from '../../organization/shared/CrudEntityPage';
import { useAuth } from '../../../app/AuthContext';
import { organizationService } from '../../../services/organizationService';
import { vehicleTypeService } from '../../../services/vehicle_management/vehicle_type/vehicleTypeService';
import { companyVehicleIdTypeService } from '../../../services/vehicle_management/company_vehicle_id_type/companyVehicleIdTypeService';
import { getOwnCompanyPrefill, req, rowsFrom, toBool } from '../../employee_hr_management/shared/hrCrudCommon';

export default function CompanyVehicleIdTypePage() {
  const theme = useTheme();
  const { token, auth } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);

  useEffect(() => {
    (async () => {
      if (!token) return;
      const settled = await Promise.allSettled([
        organizationService.listCompanies(token, { activeOnly: true }),
        vehicleTypeService.list(token, { sortBy: 'typeName', sortDir: 'asc' }),
      ]);

      const companyData = settled[0]?.status === 'fulfilled' ? rowsFrom(settled[0].value) : [];
      const typeData = settled[1]?.status === 'fulfilled' ? rowsFrom(settled[1].value) : [];

      setCompanies(companyData.map((c) => ({
        id: c.companyId,
        code: c.companyCode,
        name: c.companyName,
      })));
      setVehicleTypes(typeData);
    })();
  }, [token]);

  const own = useMemo(() => getOwnCompanyPrefill(auth, companies), [auth, companies]);

  const companyById = useMemo(
    () => Object.fromEntries(companies.map((c) => [String(c.id), c])),
    [companies]
  );
  const typeById = useMemo(
    () => Object.fromEntries(vehicleTypes.map((t) => [String(t.typeId), t])),
    [vehicleTypes]
  );

  const companyFilterOpts = useMemo(
    () => [{ value: '', label: 'All Companies' }, ...companies.map((c) => ({
      value: String(c.id),
      label: `${c.name || '-'} (${c.code || '-'})`,
    }))],
    [companies]
  );

  const companyFormOpts = useMemo(
    () => [{ value: '', label: 'Select Company' }, ...companies.map((c) => ({
      value: String(c.id),
      label: `${c.name || '-'} (${c.code || '-'})`,
    }))],
    [companies]
  );

  const vehicleTypeFilterOpts = useMemo(
    () => [{ value: '', label: 'All Vehicle Types' }, ...vehicleTypes.map((t) => ({
      value: String(t.typeId),
      label: t.typeName || '-',
    }))],
    [vehicleTypes]
  );

  const vehicleTypeFormOpts = useMemo(
    () => [{ value: '', label: 'Select Vehicle Type' }, ...vehicleTypes.map((t) => ({
      value: String(t.typeId),
      label: t.typeName || '-',
    }))],
    [vehicleTypes]
  );

  const sortByOpts = [
    { value: 'updatedAt', label: 'Updated Time' },
    { value: 'createdAt', label: 'Created Time' },
    { value: 'companyName', label: 'Company Name' },
    { value: 'companyCode', label: 'Company Code' },
    { value: 'typeName', label: 'Vehicle Type' },
    { value: 'idTypeCode', label: 'Identity Type Code' },
  ];

  const sortDirOpts = [
    { value: 'asc', label: 'Ascending' },
    { value: 'desc', label: 'Descending' },
  ];

  return (
    <CrudEntityPage
      title="Company Vehicle Types"
      icon={<VpnKeyRoundedIcon sx={{ color: '#fff', fontSize: 20 }} />}
      gradient={`linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`}
      idKey="idTypeId"
      prefillForm={own}
      prefillFilters={own ? { companyId: own.companyId } : null}
      columns={[
        { key: 'companyName', label: 'Company', render: (r) => r.companyName || companyById[String(r.companyId)]?.name || '-' },
        { key: 'companyCode', label: 'Company Code' },
        { key: 'typeName', label: 'Vehicle Type', render: (r) => r.typeName || typeById[String(r.typeId)]?.typeName || '-' },
        { key: 'idTypeCode', label: 'Identity Type Code' },
        { key: 'isActive', label: 'Active', type: 'boolean' },
      ]}
      filterFields={[
        { key: 'companyId', label: 'Company', type: 'autocomplete', options: companyFilterOpts },
        { key: 'typeId', label: 'Vehicle Type', type: 'autocomplete', options: vehicleTypeFilterOpts },
        { key: 'idTypeCode_like', label: 'Identity Type Code' },
        { key: 'isActive', label: 'Active', type: 'boolean' },
        { key: 'sortBy', label: 'Sort By', type: 'autocomplete', options: sortByOpts },
        { key: 'sortDir', label: 'Sort Direction', type: 'autocomplete', options: sortDirOpts },
      ]}
      formFields={[
        { key: 'companyId', label: 'Company', type: 'autocomplete', options: companyFormOpts },
        { key: 'companyCode', label: 'Company Code', readOnly: true },
        { key: 'typeId', label: 'Vehicle Type', type: 'autocomplete', options: vehicleTypeFormOpts },
        { key: 'idTypeCode', label: 'Identity Type Code' },
        { key: 'isActive', label: 'Status', type: 'boolean' },
      ]}
      defaultFilters={{
        companyId: '',
        typeId: '',
        idTypeCode_like: '',
        isActive: '',
        sortBy: 'updatedAt',
        sortDir: 'desc',
      }}
      emptyForm={{
        companyId: '',
        companyCode: '',
        typeId: '',
        idTypeCode: '',
        isActive: 'true',
      }}
      normalizePayload={(f) => ({
        companyId: req(f.companyId),
        companyCode: req(f.companyCode),
        typeId: req(f.typeId),
        idTypeCode: req(f.idTypeCode).toUpperCase(),
        isActive: toBool(f.isActive),
      })}
      onFormFieldChange={(next, key, value) => {
        if (key === 'companyId') {
          return {
            ...next,
            companyCode: companyById[String(value)]?.code || '',
          };
        }
        if (key === 'idTypeCode') {
          return {
            ...next,
            idTypeCode: String(value || '').toUpperCase(),
          };
        }
        return next;
      }}
      mapRecordToForm={(r) => ({
        ...r,
        companyCode: r?.companyCode || companyById[String(r?.companyId)]?.code || '',
        isActive: (r?.isActive ?? true) ? 'true' : 'false',
      })}
      listFetcher={companyVehicleIdTypeService.list}
      getByIdFetcher={companyVehicleIdTypeService.getById}
      createFetcher={companyVehicleIdTypeService.create}
      updateFetcher={companyVehicleIdTypeService.update}
      deleteFetcher={companyVehicleIdTypeService.delete}
      autoSearch
      autoSearchDebounceMs={350}
      fitViewport
      viewportOffset={190}
    />
  );
}
