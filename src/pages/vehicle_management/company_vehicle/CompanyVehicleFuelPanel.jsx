import LocalGasStationRoundedIcon from '@mui/icons-material/LocalGasStationRounded';
import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import CrudEntityPage from '../../organization/shared/CrudEntityPage';
import { useAuth } from '../../../app/AuthContext';
import { organizationService } from '../../../services/organizationService';
import { employeeService } from '../../../services/employee_hr_management/employee/employeeService';
import { vehicleFuelRecordService } from '../../../services/vehicle_management/vehicle_fuel_record/vehicleFuelRecordService';
import { opt, req, toDecimal } from '../../employee_hr_management/shared/hrCrudCommon';

const EMPTY_LABEL_OPTION = { value: '', label: 'Select' };

export default function CompanyVehicleFuelPanel({
  companyId,
  companyVehicleId,
  vehicleId,
  vehicleRows,
}) {
  const theme = useTheme();
  const { token } = useAuth();
  const scopedCompanyVehicleId = String(companyVehicleId || vehicleId || '');
  const [refillLocationOptions, setRefillLocationOptions] = useState([]);
  const [fuelTypeOptions, setFuelTypeOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);

  const vehicleOptions = useMemo(
    () => (vehicleRows || []).map((r) => ({
      value: String(r?.companyVehicleId || r?.companyvehicleId || r?.companyvehicle_id || r?.id || ''),
      label: `${r?.keyNumber || '-'} | ${r?.registrationNumber || '-'} | ${r?.chassisNumber || '-'}`,
      vehicleId: String(r?.vehicleId || r?.vehicle_id || ''),
    })).filter((x) => x.value),
    [vehicleRows]
  );

  const vehicleOptionByCompanyVehicleId = useMemo(() => {
    const map = new Map();
    vehicleOptions.forEach((x) => map.set(String(x.value), x));
    return map;
  }, [vehicleOptions]);

  const companyVehicleIdFromProps = useMemo(() => {
    if (scopedCompanyVehicleId) return scopedCompanyVehicleId;
    return vehicleOptions[0]?.value || '';
  }, [scopedCompanyVehicleId, vehicleOptions]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!token) return;
      try {
        const params = {};
        if (companyId) params.companyId = companyId;
        if (companyVehicleIdFromProps) params.companyVehicleId = companyVehicleIdFromProps;
        const rows = await vehicleFuelRecordService.refillLocationOptions(
          token,
          Object.keys(params).length ? params : undefined
        );
        if (ignore) return;
        const options = (Array.isArray(rows) ? rows : []).map((x) => {
          const label = String(x?.label || x?.name || '').trim();
          const name = String(x?.name || '').trim();
          return {
            value: label || name,
            label: label || name,
          };
        }).filter((x) => x.value);
        setRefillLocationOptions(options);
      } catch {
        if (!ignore) setRefillLocationOptions([]);
      }
    })();
    return () => { ignore = true; };
  }, [token, companyId, companyVehicleIdFromProps]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!token) return;
      try {
        const rows = await organizationService.enumValues('fuel_type', { activeOnly: true });
        if (ignore) return;
        setFuelTypeOptions(
          (Array.isArray(rows) ? rows : [])
            .map((x) => ({
              value: String(x?.type_id || x?.typeId || x?.id || ''),
              label: String(x?.type_name || x?.typeName || x?.name || ''),
            }))
            .filter((x) => x.value)
        );
      } catch {
        if (!ignore) setFuelTypeOptions([]);
      }
    })();
    return () => { ignore = true; };
  }, [token]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!token) return;
      try {
        const params = {};
        if (companyId) params.companyId = companyId;
        const rows = await employeeService.listEmployees(token, params);
        const list = Array.isArray(rows) ? rows : (Array.isArray(rows?.data) ? rows.data : []);
        if (!ignore) {
          setEmployeeOptions(
            list
              .map((x) => ({
                value: String(x?.employeeId || x?.employee_id || x?.id || ''),
                label: [x?.employeeCode || x?.employee_code, x?.firstName || x?.first_name, x?.lastName || x?.last_name]
                  .filter(Boolean).join(' - '),
              }))
              .filter((x) => x.value)
          );
        }
      } catch {
        if (!ignore) setEmployeeOptions([]);
      }
    })();
    return () => { ignore = true; };
  }, [token, companyId]);

  const baseFilters = useMemo(
    () => ({
      companyId: companyId || '',
      companyVehicleId: companyVehicleIdFromProps,
      fuelDate: '',
      fuelTypeId: '',
      operatorId: '',
      preparedBy: '',
      q: '',
      sortBy: 'fuelDate',
      sortDir: 'desc',
    }),
    [companyId, companyVehicleIdFromProps]
  );

  const baseForm = useMemo(
    () => ({
      companyId: companyId || '',
      companyVehicleId: companyVehicleIdFromProps,
      vehicleId: vehicleOptionByCompanyVehicleId.get(companyVehicleIdFromProps)?.vehicleId || '',
      fuelDate: '',
      fuelQty: '',
      currentKm: '',
      currentHr: '',
      refillLocation: '',
      fuelTypeId: '',
      operatorId: '',
      preparedBy: '',
      notes: '',
    }),
    [companyId, companyVehicleIdFromProps, vehicleOptionByCompanyVehicleId]
  );

  const refillLocationFormOptions = (form) => {
    const currentValue = String(form?.refillLocation || '').trim();
    if (!currentValue) return [EMPTY_LABEL_OPTION, ...refillLocationOptions];
    if (refillLocationOptions.some((x) => String(x.value) === currentValue)) {
      return [EMPTY_LABEL_OPTION, ...refillLocationOptions];
    }
    return [EMPTY_LABEL_OPTION, { value: currentValue, label: currentValue }, ...refillLocationOptions];
  };

  return (
    <CrudEntityPage
      title="Fuel Details"
      icon={<LocalGasStationRoundedIcon sx={{ color: '#fff', fontSize: 20 }} />}
      gradient={`linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`}
      idKey="fuelId"
      columns={[
        { key: 'companyVehicleKeyNumber', label: 'Identify Code' },
        { key: 'companyVehicleRegistrationNumber', label: 'Register No' },
        { key: 'fuelDate', label: 'Fuel Date' },
        { key: 'fuelQty', label: 'Fuel Qty' },
        { key: 'currentKm', label: 'Current KM' },
        { key: 'currentHr', label: 'Current HR' },
        {
          key: 'kmDifference',
          label: 'KM Difference',
          render: (r) => r?.kmDifference ?? r?.km_difference ?? '-',
        },
        {
          key: 'hrDifference',
          label: 'HR Difference',
          render: (r) => r?.hrDifference ?? r?.hr_difference ?? '-',
        },
        {
          key: 'fuelTypeName',
          label: 'Fuel Type',
          render: (r) => r?.fuelTypeName || r?.fuel_type_name || r?.fuelTypeId || r?.fuel_type_id || '-',
        },
        {
          key: 'operatorName',
          label: 'Operator',
          render: (r) => r?.operatorName || r?.operator_name || r?.operatorId || r?.operator_id || '-',
        },
        {
          key: 'preparedByName',
          label: 'Prepared By',
          render: (r) => r?.preparedByName || r?.prepared_by_name || r?.preparedBy || r?.prepared_by || '-',
        },
        { key: 'refillLocation', label: 'Refill Location' },
      ]}
      filterFields={[
        {
          key: 'companyVehicleId',
          label: 'Vehicle',
          type: 'autocomplete',
          options: [EMPTY_LABEL_OPTION, ...vehicleOptions],
        },
        { key: 'fuelDate', label: 'Fuel Date', type: 'date' },
        {
          key: 'refillLocation',
          label: 'Refill Location',
          type: 'select',
          optionsByForm: refillLocationFormOptions,
        },
        {
          key: 'fuelTypeId',
          label: 'Fuel Type',
          type: 'select',
          options: [EMPTY_LABEL_OPTION, ...fuelTypeOptions],
        },
        { key: 'q', label: 'Search' },
      ]}
      formFields={[
        {
          key: 'companyVehicleId',
          label: 'Vehicle (Identify Code | Register No | Chassis No)',
          type: 'autocomplete',
          options: [EMPTY_LABEL_OPTION, ...vehicleOptions],
        },
        { key: 'fuelDate', label: 'Fuel Date', type: 'date' },
        { key: 'fuelQty', label: 'Fuel Qty', type: 'number' },
        { key: 'currentKm', label: 'Current KM', type: 'number' },
        { key: 'currentHr', label: 'Current HR', type: 'number' },
        {
          key: 'fuelTypeId',
          label: 'Fuel Type',
          type: 'select',
          options: [EMPTY_LABEL_OPTION, ...fuelTypeOptions],
        },
        {
          key: 'operatorId',
          label: 'Operator (Employee)',
          type: 'select',
          options: [EMPTY_LABEL_OPTION, ...employeeOptions],
        },
        {
          key: 'preparedBy',
          label: 'Prepared By (Employee)',
          type: 'select',
          options: [EMPTY_LABEL_OPTION, ...employeeOptions],
        },
        {
          key: 'refillLocation',
          label: 'Refill Location',
          type: 'select',
          optionsByForm: refillLocationFormOptions,
        },
        { key: 'notes', label: 'Notes' },
      ]}
      defaultFilters={baseFilters}
      emptyForm={baseForm}
      prefillFilters={{
        companyId: companyId || '',
        companyVehicleId: companyVehicleIdFromProps,
      }}
      prefillForm={{
        companyId: companyId || '',
        companyVehicleId: companyVehicleIdFromProps,
        vehicleId: vehicleOptionByCompanyVehicleId.get(companyVehicleIdFromProps)?.vehicleId || '',
      }}
      mapRecordToForm={(row) => {
        const selectedVehicle =
          String(row?.companyVehicleId || row?.company_vehicle_id || '')
          || companyVehicleIdFromProps;
        return {
          companyId: String(row?.companyId || row?.company_id || companyId || ''),
          companyVehicleId: selectedVehicle,
          vehicleId: String(row?.vehicleId || row?.vehicle_id || vehicleOptionByCompanyVehicleId.get(selectedVehicle)?.vehicleId || ''),
          fuelDate: String(row?.fuelDate || row?.fuel_date || ''),
          fuelQty: row?.fuelQty == null ? '' : String(row.fuelQty),
          currentKm: row?.currentKm == null ? '' : String(row.currentKm),
          currentHr: row?.currentHr == null ? '' : String(row.currentHr),
          fuelTypeId: row?.fuelTypeId == null ? '' : String(row.fuelTypeId),
          operatorId: String(row?.operatorId || row?.operator_id || ''),
          preparedBy: String(row?.preparedBy || row?.prepared_by || ''),
          refillLocation: String(row?.refillLocation || row?.refill_location || ''),
          notes: String(row?.notes || ''),
        };
      }}
      normalizePayload={(f) => {
        const selectedVehicle = vehicleOptionByCompanyVehicleId.get(String(f.companyVehicleId || ''));
        return {
          companyId: req(f.companyId || companyId),
          companyCode: null,
          companyVehicleId: req(f.companyVehicleId),
          vehicleId: opt(selectedVehicle?.vehicleId || f.vehicleId),
          fuelDate: req(f.fuelDate),
          fuelQty: toDecimal(f.fuelQty),
          currentKm: toDecimal(f.currentKm),
          currentHr: toDecimal(f.currentHr),
          refillLocation: opt(f.refillLocation),
          fuelTypeId: f.fuelTypeId === '' ? null : Number(f.fuelTypeId),
          operatorId: opt(f.operatorId),
          preparedBy: opt(f.preparedBy),
          notes: opt(f.notes),
        };
      }}
      onFormFieldChange={(next, key, value) => {
        if (key === 'companyVehicleId') {
          const selectedVehicle = vehicleOptionByCompanyVehicleId.get(String(value || ''));
          return {
            ...next,
            companyVehicleId: value,
            vehicleId: selectedVehicle?.vehicleId || '',
          };
        }
        return next;
      }}
      listFetcher={vehicleFuelRecordService.list}
      getByIdFetcher={vehicleFuelRecordService.getById}
      createFetcher={vehicleFuelRecordService.create}
      updateFetcher={vehicleFuelRecordService.update}
      deleteFetcher={vehicleFuelRecordService.delete}
      autoSearch
      autoSearchDebounceMs={350}
      fitViewport
      viewportOffset={250}
      hideHeader={false}
      hideFilters
      hideFilterSearchButton
      showHeaderResetFilters={false}
    />
  );
}
