import ManageSearchRoundedIcon from '@mui/icons-material/ManageSearchRounded';
import { alpha, useTheme } from '@mui/material/styles';
import { Alert, Autocomplete, Box, Card, CardContent, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import CrudEntityPage from './organization/shared/CrudEntityPage';
import { useAuth } from '../app/AuthContext';
import { lookupAdminService } from '../services/lookupAdminService';
import { opt, req, rowsFrom, toBool } from './employee_hr_management/shared/hrCrudCommon';

export default function EnumLookupTablesPage() {
  const theme = useTheme();
  const { token } = useAuth();
  const [definitions, setDefinitions] = useState([]);
  const [selectedEnumKey, setSelectedEnumKey] = useState('');
  const [loadingDefs, setLoadingDefs] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      if (!token) return;
      setLoadingDefs(true);
      setError('');
      try {
        const defs = rowsFrom(await lookupAdminService.listEnumDefinitions(token));
        const sorted = [...defs].sort((a, b) => String(a.displayName || '').localeCompare(String(b.displayName || '')));
        setDefinitions(sorted);
        setSelectedEnumKey((prev) => (prev && sorted.some((d) => d.key === prev) ? prev : (sorted[0]?.key || '')));
      } catch (e) {
        setDefinitions([]);
        setSelectedEnumKey('');
        setError(e.message || 'Failed to load enum definitions');
      } finally {
        setLoadingDefs(false);
      }
    })();
  }, [token]);

  const selectedDef = useMemo(
    () => definitions.find((d) => d.key === selectedEnumKey) || null,
    [definitions, selectedEnumKey]
  );

  const hasDescription = !!selectedDef?.hasDescription;
  const hasActive = !!selectedDef?.hasActive;

  const columns = useMemo(() => {
    const cols = [
      { key: 'id', label: 'ID' },
      { key: 'code', label: 'Code' },
      { key: 'name', label: 'Name' },
    ];
    if (hasDescription) cols.push({ key: 'description', label: 'Description' });
    if (hasActive) cols.push({ key: 'active', label: 'Active', type: 'boolean' });
    return cols;
  }, [hasDescription, hasActive]);

  const filterFields = useMemo(() => {
    const fields = [
      { key: 'code_like', label: 'Code' },
      { key: 'name_like', label: 'Name' },
    ];
    if (hasDescription) fields.push({ key: 'description_like', label: 'Description' });
    if (hasActive) fields.push({ key: 'active', label: 'Active', type: 'boolean' });
    return fields;
  }, [hasDescription, hasActive]);

  const formFields = useMemo(() => {
    const fields = [
      { key: 'code', label: 'Code' },
      { key: 'name', label: 'Name' },
    ];
    if (hasDescription) fields.push({ key: 'description', label: 'Description', fullWidth: true, minWidth: 320 });
    if (hasActive) fields.push({ key: 'active', label: 'Active', type: 'boolean' });
    return fields;
  }, [hasDescription, hasActive]);

  const emptyForm = useMemo(() => ({
    code: '',
    name: '',
    description: '',
    active: hasActive ? 'true' : '',
  }), [hasActive]);

  return (
    <Stack spacing={2.5}>
      <Card
        sx={{
          borderRadius: 3,
          border: '1px solid',
          borderColor: alpha(theme.palette.primary.main, 0.16),
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.06)}, ${alpha(theme.palette.secondary.main, 0.06)})`,
        }}
      >
        <CardContent sx={{ p: 2.25 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ xs: 'stretch', md: 'center' }}>
            <Stack direction="row" spacing={1.25} alignItems="center">
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                }}
              >
                <ManageSearchRoundedIcon />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>ENUM / LOOKUP TABLES</Typography>
                <Typography variant="caption" color="text.secondary">
                  Admin management for dropdown and lookup values (create, edit, delete)
                </Typography>
              </Box>
            </Stack>
            <Autocomplete
              size="small"
              options={definitions}
              value={selectedDef}
              onChange={(_, next) => setSelectedEnumKey(next?.key || '')}
              getOptionLabel={(option) => `${option.displayName} (${option.key})`}
              isOptionEqualToValue={(option, value) => option.key === value.key}
              noOptionsText={loadingDefs ? 'Loading...' : 'No lookup tables'}
              loading={loadingDefs}
              disabled={loadingDefs || definitions.length === 0}
              sx={{ minWidth: { xs: '100%', md: 360 } }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Lookup Table"
                  placeholder="Search lookup table"
                />
              )}
            />
          </Stack>
          {selectedDef && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1.25, display: 'block' }}>
              Table: {selectedDef.tableName} | Description: {selectedDef.hasDescription ? 'Yes' : 'No'} | Active Flag: {selectedDef.hasActive ? 'Yes' : 'No'}
            </Typography>
          )}
        </CardContent>
      </Card>

      {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

      {selectedEnumKey ? (
        <CrudEntityPage
          key={`enum-admin-${selectedEnumKey}`}
          title={selectedDef?.displayName || 'Lookup Records'}
          icon={<ManageSearchRoundedIcon sx={{ color: '#fff', fontSize: 20 }} />}
          gradient={`linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`}
          idKey="id"
          hideFilters
          columns={columns}
          filterFields={filterFields}
          formFields={formFields}
          defaultFilters={{ code_like: '', name_like: '', ...(hasDescription ? { description_like: '' } : {}), ...(hasActive ? { active: '' } : {}), sortBy: 'name', sortDir: 'asc' }}
          emptyForm={emptyForm}
          normalizePayload={(f) => ({
            code: req(f.code),
            name: req(f.name),
            description: hasDescription ? opt(f.description) : null,
            active: hasActive ? toBool(f.active) : null,
          })}
          mapRecordToForm={(r) => ({
            ...emptyForm,
            ...(r || {}),
            active: hasActive ? (r?.active === true ? 'true' : r?.active === false ? 'false' : emptyForm.active) : '',
          })}
          listFetcher={(t, params) => lookupAdminService.listRecords(t, selectedEnumKey, params)}
          getByIdFetcher={(t, id) => lookupAdminService.getRecordById(t, selectedEnumKey, id)}
          createFetcher={(t, body) => lookupAdminService.createRecord(t, selectedEnumKey, body)}
          updateFetcher={(t, id, body) => lookupAdminService.updateRecord(t, selectedEnumKey, id, body)}
          deleteFetcher={(t, id) => lookupAdminService.deleteRecord(t, selectedEnumKey, id)}
          autoSearch
          autoSearchDebounceMs={300}
          fitViewport
          viewportOffset={200}
        />
      ) : (
        <Alert severity="info" sx={{ borderRadius: 2 }}>No enum/lookup table definitions found.</Alert>
      )}
    </Stack>
  );
}
