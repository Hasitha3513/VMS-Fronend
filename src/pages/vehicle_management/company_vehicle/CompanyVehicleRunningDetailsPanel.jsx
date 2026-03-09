import EditRoadRoundedIcon from '@mui/icons-material/EditRoadRounded';
import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import CrudEntityPage from '../../organization/shared/CrudEntityPage';
import { useAuth } from '../../../app/AuthContext';
import { organizationService } from '../../../services/organizationService';
import { employeeService } from '../../../services/employee_hr_management/employee/employeeService';
import { vehicleRunningLogService } from '../../../services/vehicle_management/vehicle_running_log/vehicleRunningLogService';
import { opt, req, rowsFrom, toDecimal, toInt } from '../../employee_hr_management/shared/hrCrudCommon';

const EMPTY_LABEL_OPTION = { value: '', label: 'Select' };

export default function CompanyVehicleRunningDetailsPanel({
  companyId,
  companyVehicleId,
  vehicleRows,
}) {
  const theme = useTheme();
  const { token } = useAuth();
  const scopedCompanyVehicleId = String(companyVehicleId || '');

  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [workTypes, setWorkTypes] = useState([]);
  const [companies, setCompanies] = useState([]);

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

  const selectedVehicleId = useMemo(
    () => String(vehicleOptionByCompanyVehicleId.get(companyVehicleIdFromProps)?.vehicleId || ''),
    [vehicleOptionByCompanyVehicleId, companyVehicleIdFromProps]
  );

  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!token) return;
      const settled = await Promise.allSettled([
        organizationService.listCompanies(token, { activeOnly: false }),
        employeeService.listEmployees(token, companyId ? { companyId, sortBy: 'firstName', sortDir: 'asc' } : { sortBy: 'firstName', sortDir: 'asc' }),
        organizationService.listProjects(token, companyId ? { companyId, activeOnly: true } : { activeOnly: true }),
        organizationService.enumValues('work_type', { locale: 'en-US', activeOnly: true }),
      ]);
      if (ignore) return;
      setCompanies(
        rowsFrom(settled[0]?.status === 'fulfilled' ? settled[0].value : null)
          .map((c) => ({
            id: String(c?.companyId || c?.company_id || c?.id || ''),
            code: c?.companyCode || c?.company_code || c?.code || '',
            name: c?.companyName || c?.company_name || c?.name || '',
          }))
          .filter((c) => c.id)
      );
      const employeeRows = rowsFrom(settled[1]?.status === 'fulfilled' ? settled[1].value : null);
      setEmployees(
        employeeRows
          .map((e) => ({
            employeeId: String(e?.employeeId || e?.employee_id || e?.id || ''),
            label: [e?.employeeCode || e?.employee_code, [e?.firstName || e?.first_name, e?.lastName || e?.last_name].filter(Boolean).join(' ')].filter(Boolean).join(' - '),
          }))
          .filter((e) => e.employeeId)
      );
      const projectRows = rowsFrom(settled[2]?.status === 'fulfilled' ? settled[2].value : null);
      setProjects(
        projectRows
          .map((p) => ({
            projectId: String(p?.projectId || p?.project_id || p?.id || ''),
            label: p?.projectName || p?.project_name || p?.projectCode || p?.project_code || '',
          }))
          .filter((p) => p.projectId)
      );
      setWorkTypes(
        rowsFrom(settled[3]?.status === 'fulfilled' ? settled[3].value : null)
          .map((w) => ({
            id: String(w?.id || w?.type_id || w?.typeId || ''),
            name: w?.name || w?.type_name || w?.typeName || '',
          }))
          .filter((w) => w.id)
      );
    })();
    return () => { ignore = true; };
  }, [token, companyId]);

  const companyCodeById = useMemo(() => {
    const map = new Map();
    companies.forEach((c) => map.set(String(c.id), String(c.code || '')));
    return map;
  }, [companies]);

  const employeeOptions = useMemo(
    () => employees.map((e) => ({ value: e.employeeId, label: e.label || e.employeeId })),
    [employees]
  );

  const projectOptions = useMemo(
    () => projects.map((p) => ({ value: p.projectId, label: p.label || p.projectId })),
    [projects]
  );

  const workTypeOptions = useMemo(
    () => workTypes.map((w) => ({ value: w.id, label: w.name || w.id })),
    [workTypes]
  );

  const workTypeLabelById = useMemo(() => {
    const map = new Map();
    workTypes.forEach((w) => map.set(String(w.id), String(w.name || w.id)));
    return map;
  }, [workTypes]);

  const employeeLabelById = useMemo(() => {
    const map = new Map();
    employees.forEach((e) => map.set(String(e.employeeId), String(e.label || e.employeeId)));
    return map;
  }, [employees]);

  const projectLabelById = useMemo(() => {
    const map = new Map();
    projects.forEach((p) => map.set(String(p.projectId), String(p.label || p.projectId)));
    return map;
  }, [projects]);

  const baseFilters = useMemo(
    () => ({
      companyId: companyId || '',
      companyVehicleId: companyVehicleIdFromProps,
      vehicleId: selectedVehicleId,
      driverId: '',
      projectId: '',
      workTypeId: '',
      startLogDate: '',
      sortBy: 'startLogDate',
      sortDir: 'desc',
    }),
    [companyId, companyVehicleIdFromProps, selectedVehicleId]
  );

  const baseForm = useMemo(
    () => ({
      companyId: companyId || '',
      companyCode: companyCodeById.get(String(companyId || '')) || '',
      companyVehicleId: companyVehicleIdFromProps,
      vehicleId: selectedVehicleId,
      driverId: '',
      projectId: '',
      startLogDate: '',
      endLogDate: '',
      startTime: '',
      endTime: '',
      startOdometer: '',
      startHourmeter: '',
      endOdometer: '',
      endHourmeter: '',
      totalDistance: '',
      engineHours: '',
      workTypeId: '',
      workDescription: '',
      loadCapacityUsed: '',
      tripsCount: '',
      operatorSignature: '',
      supervisorApproval: '',
    }),
    [companyId, companyCodeById, companyVehicleIdFromProps, selectedVehicleId]
  );

  return (
    <CrudEntityPage
      title="Running Details"
      icon={<EditRoadRoundedIcon sx={{ color: '#fff', fontSize: 20 }} />}
      gradient={`linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`}
      idKey="logId"
      columns={[
        { key: 'startLogDate', label: 'Start Date' },
        { key: 'endLogDate', label: 'End Date' },
        { key: 'companyVehicleId', label: 'Vehicle', render: (r) => vehicleOptions.find((x) => String(x.vehicleId || '') === String(r?.vehicleId || ''))?.label || '-' },
        { key: 'driverId', label: 'Driver', render: (r) => employeeLabelById.get(String(r?.driverId || '')) || '-' },
        { key: 'projectId', label: 'Project', render: (r) => projectLabelById.get(String(r?.projectId || '')) || '-' },
        { key: 'workTypeId', label: 'Work Type', render: (r) => workTypeLabelById.get(String(r?.workTypeId || '')) || '-' },
        { key: 'totalDistance', label: 'Distance' },
      ]}
      filterFields={[
        {
          key: 'companyVehicleId',
          label: 'Vehicle',
          type: 'autocomplete',
          options: [EMPTY_LABEL_OPTION, ...vehicleOptions],
        },
        { key: 'startLogDate', label: 'Start Date', type: 'date' },
        {
          key: 'driverId',
          label: 'Driver',
          type: 'autocomplete',
          options: [EMPTY_LABEL_OPTION, ...employeeOptions],
        },
        {
          key: 'projectId',
          label: 'Project',
          type: 'autocomplete',
          options: [EMPTY_LABEL_OPTION, ...projectOptions],
        },
        {
          key: 'workTypeId',
          label: 'Work Type',
          type: 'autocomplete',
          options: [EMPTY_LABEL_OPTION, ...workTypeOptions],
        },
      ]}
      formFields={[
        {
          key: 'companyVehicleId',
          label: 'Vehicle (Identify Code | Register No | Chassis No)',
          type: 'autocomplete',
          options: [EMPTY_LABEL_OPTION, ...vehicleOptions],
        },
        { key: 'startLogDate', label: 'Start Date', type: 'date' },
        { key: 'endLogDate', label: 'End Date', type: 'date' },
        {
          key: 'driverId',
          label: 'Driver',
          type: 'autocomplete',
          options: [EMPTY_LABEL_OPTION, ...employeeOptions],
        },
        {
          key: 'projectId',
          label: 'Project',
          type: 'autocomplete',
          options: [EMPTY_LABEL_OPTION, ...projectOptions],
        },
        { key: 'startTime', label: 'Start Time (ISO Timestamp)' },
        { key: 'endTime', label: 'End Time (ISO Timestamp)' },
        { key: 'startOdometer', label: 'Start Odometer', type: 'number' },
        { key: 'startHourmeter', label: 'Start Hourmeter', type: 'number' },
        { key: 'endOdometer', label: 'End Odometer', type: 'number' },
        { key: 'endHourmeter', label: 'End Hourmeter', type: 'number' },
        { key: 'totalDistance', label: 'Total Distance', type: 'number', readOnly: true },
        { key: 'engineHours', label: 'Engine Hours', type: 'number' },
        {
          key: 'workTypeId',
          label: 'Work Type',
          type: 'autocomplete',
          options: [EMPTY_LABEL_OPTION, ...workTypeOptions],
        },
        { key: 'workDescription', label: 'Work Description', fullWidth: true, minWidth: 300 },
        { key: 'loadCapacityUsed', label: 'Load Capacity Used', type: 'number' },
        { key: 'tripsCount', label: 'Trips Count', type: 'number' },
        { key: 'operatorSignature', label: 'Operator Signature' },
        {
          key: 'supervisorApproval',
          label: 'Supervisor Approval',
          type: 'autocomplete',
          options: [EMPTY_LABEL_OPTION, ...employeeOptions],
        },
      ]}
      defaultFilters={baseFilters}
      emptyForm={baseForm}
      prefillFilters={{
        companyId: companyId || '',
        companyVehicleId: companyVehicleIdFromProps,
        vehicleId: selectedVehicleId,
      }}
      prefillForm={{
        companyId: companyId || '',
        companyCode: companyCodeById.get(String(companyId || '')) || '',
        companyVehicleId: companyVehicleIdFromProps,
        vehicleId: selectedVehicleId,
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
      mapRecordToForm={(row) => {
        const matchedVehicle = vehicleOptions.find((x) => String(x.vehicleId || '') === String(row?.vehicleId || ''));
        return {
          companyId: String(row?.companyId || companyId || ''),
          companyCode: String(row?.companyCode || row?.company_code || companyCodeById.get(String(row?.companyId || companyId || '')) || ''),
          companyVehicleId: matchedVehicle?.value || companyVehicleIdFromProps,
          vehicleId: String(row?.vehicleId || matchedVehicle?.vehicleId || ''),
          driverId: String(row?.driverId || ''),
          projectId: String(row?.projectId || ''),
          startLogDate: String(row?.startLogDate || ''),
          endLogDate: String(row?.endLogDate || ''),
          startTime: String(row?.startTime || ''),
          endTime: String(row?.endTime || ''),
          startOdometer: row?.startOdometer == null ? '' : String(row.startOdometer),
          startHourmeter: row?.startHourmeter == null ? '' : String(row.startHourmeter),
          endOdometer: row?.endOdometer == null ? '' : String(row.endOdometer),
          endHourmeter: row?.endHourmeter == null ? '' : String(row.endHourmeter),
          totalDistance: row?.totalDistance == null ? '' : String(row.totalDistance),
          engineHours: row?.engineHours == null ? '' : String(row.engineHours),
          workTypeId: row?.workTypeId == null ? '' : String(row.workTypeId),
          workDescription: String(row?.workDescription || ''),
          loadCapacityUsed: row?.loadCapacityUsed == null ? '' : String(row.loadCapacityUsed),
          tripsCount: row?.tripsCount == null ? '' : String(row.tripsCount),
          operatorSignature: String(row?.operatorSignature || ''),
          supervisorApproval: String(row?.supervisorApproval || ''),
        };
      }}
      normalizePayload={(f) => {
        const selectedVehicle = vehicleOptionByCompanyVehicleId.get(String(f.companyVehicleId || ''));
        const payloadCompanyId = req(f.companyId || companyId);
        return {
          companyId: payloadCompanyId,
          companyCode: req(f.companyCode || companyCodeById.get(String(payloadCompanyId))),
          vehicleId: req(selectedVehicle?.vehicleId || f.vehicleId),
          driverId: opt(f.driverId),
          projectId: opt(f.projectId),
          startLogDate: opt(f.startLogDate),
          endLogDate: opt(f.endLogDate),
          startTime: opt(f.startTime),
          endTime: opt(f.endTime),
          startOdometer: toDecimal(f.startOdometer),
          startHourmeter: toDecimal(f.startHourmeter),
          endOdometer: toDecimal(f.endOdometer),
          endHourmeter: toDecimal(f.endHourmeter),
          engineHours: toDecimal(f.engineHours),
          workTypeId: toInt(f.workTypeId),
          workDescription: opt(f.workDescription),
          loadCapacityUsed: toDecimal(f.loadCapacityUsed),
          tripsCount: toInt(f.tripsCount),
          operatorSignature: opt(f.operatorSignature),
          supervisorApproval: opt(f.supervisorApproval),
        };
      }}
      listFetcher={(sessionToken, params) => {
        const selectedVehicle = vehicleOptionByCompanyVehicleId.get(String(params?.companyVehicleId || ''));
        const payload = {
          companyId: params?.companyId || companyId || '',
          vehicleId: selectedVehicle?.vehicleId || params?.vehicleId || '',
        };
        return vehicleRunningLogService.list(sessionToken, payload);
      }}
      getByIdFetcher={vehicleRunningLogService.getById}
      createFetcher={vehicleRunningLogService.create}
      updateFetcher={vehicleRunningLogService.update}
      deleteFetcher={vehicleRunningLogService.delete}
      autoSearch
      autoSearchDebounceMs={350}
      fitViewport
      viewportOffset={250}
      hideFilters
      hideFilterSearchButton
      showHeaderResetFilters={false}
    />
  );
}
