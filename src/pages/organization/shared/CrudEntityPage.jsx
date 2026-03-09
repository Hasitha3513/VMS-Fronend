import {
  Alert, Autocomplete, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  Divider, IconButton, InputAdornment, LinearProgress, MenuItem, Paper,
  Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, Tooltip, Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useAuth } from '../../../app/AuthContext';
import { useThemeMode } from '../../../app/ThemeContext';

const BOOL_OPTIONS = [
  { label: 'Any', value: '' },
  { label: 'Yes', value: 'true' },
  { label: 'No', value: 'false' },
];

function getFieldOptions(field, formState) {
  if (typeof field.optionsByForm === 'function') {
    return field.optionsByForm(formState || {}) || [];
  }
  return field.options || [];
}

function resolveFieldByForm(field, formState) {
  const next = { ...field };
  if (typeof field.typeByForm === 'function') {
    next.type = field.typeByForm(formState || {}) || field.type;
  }
  if (typeof field.labelByForm === 'function') {
    next.label = field.labelByForm(formState || {}) || field.label;
  }
  return next;
}

function ImageUploadField({ field, value, onChange, disabled }) {
  const [preview, setPreview] = useState(value || null);
  const fileInputRef = React.useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result;
      setPreview(base64);
      onChange({ target: { value: base64 } });
    };
    reader.readAsDataURL(file);
  };

  const handleClear = () => {
    setPreview(null);
    onChange({ target: { value: '' } });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <Box>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={disabled}
        style={{ display: 'none' }}
        id={`file-${field.key}`}
      />
      <Stack spacing={1}>
        <Stack direction="row" spacing={1} alignItems="center">
          <label htmlFor={`file-${field.key}`}>
            <Button
              variant="outlined"
              component="span"
              size="small"
              disabled={disabled}
              startIcon={<CloudUploadRoundedIcon />}
              sx={{ textTransform: 'none' }}
            >
              {preview ? 'Change Image' : 'Upload Image'}
            </Button>
          </label>
          {preview && !disabled && (
            <IconButton size="small" onClick={handleClear} sx={{ color: 'error.main' }}>
              <DeleteRoundedIcon fontSize="small" />
            </IconButton>
          )}
        </Stack>
        {preview && (
          <Box
            component="img"
            src={preview}
            alt="Preview"
            sx={{
              width: 120,
              height: 120,
              objectFit: 'cover',
              borderRadius: 1,
              border: '2px solid',
              borderColor: 'divider',
            }}
          />
        )}
        <Typography variant="caption" color="text.secondary">
          {field.label || 'Image'} • Max 5MB • JPG, PNG
        </Typography>
      </Stack>
    </Box>
  );
}

function renderField(field, value, onChange, disabled, formState) {
  if (field.type === 'section') {
    return (
      <Box key={field.key} sx={{ gridColumn: '1 / -1', mt: field.key === 'first-section' ? 0 : 2, mb: 1 }}>
        <Divider sx={{ mb: 1.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem' }}>
            {field.label}
          </Typography>
        </Divider>
      </Box>
    );
  }

  if (field.type === 'image' || field.type === 'file') {
    return <ImageUploadField key={field.key} field={field} value={value} onChange={onChange} disabled={disabled} />;
  }

  if (field.type === 'autocomplete') {
    const options = getFieldOptions(field, formState);
    const selected = options.find((opt) => String(opt.value) === String(value ?? '')) || null;
    return (
      <Autocomplete
        options={options}
        value={selected}
        disabled={disabled}
        size="small"
        fullWidth
        getOptionLabel={(opt) => opt?.label || ''}
        isOptionEqualToValue={(opt, val) => String(opt?.value) === String(val?.value)}
        onChange={(_, opt) => onChange({ target: { value: opt?.value ?? '' } })}
        renderInput={(params) => <TextField {...params} label={field.label} />}
      />
    );
  }

  if (field.type === 'select') {
    const options = getFieldOptions(field, formState);
    return (
      <TextField
        key={field.key}
        select
        label={field.label}
        value={value ?? ''}
        onChange={onChange}
        size="small"
        fullWidth
        disabled={disabled}
      >
        {options.map((opt) => (
          <MenuItem key={`${field.key}-${opt.value}`} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </TextField>
    );
  }

  if (field.type === 'boolean') {
    const boolValue = value === true ? 'true' : value === false ? 'false' : (value ?? '');
    const options = getFieldOptions(field, formState).length ? getFieldOptions(field, formState) : BOOL_OPTIONS;
    return (
      <TextField
        key={field.key}
        select
        label={field.label}
        value={boolValue}
        onChange={onChange}
        size="small"
        fullWidth
        disabled={disabled}
      >
        {options.map((opt) => (
          <MenuItem key={opt.label} value={opt.value}>{opt.label}</MenuItem>
        ))}
      </TextField>
    );
  }
  return (
    <TextField
      key={field.key}
      label={field.label}
      value={value ?? ''}
      onChange={onChange}
      size="small"
      fullWidth
      type={field.type || 'text'}
      disabled={disabled}
      InputLabelProps={field.type === 'date' ? { shrink: true } : undefined}
    />
  );
}

function BoolChip({ value, theme }) {
  if (value === true || value === 'true' || value === 1)
    return <Chip label="Yes" size="small" sx={{ bgcolor: alpha(theme.palette.success.main, 0.14), color: theme.palette.success.main, fontWeight: 600, fontSize: '0.7rem' }} />;
  if (value === false || value === 'false' || value === 0)
    return <Chip label="No" size="small" sx={{ bgcolor: alpha(theme.palette.error.main, 0.14), color: theme.palette.error.main, fontWeight: 600, fontSize: '0.7rem' }} />;
  return <Typography variant="caption" color="text.secondary">—</Typography>;
}

function CodeBadge({ value }) {
  if (!value) return <Typography variant="caption" color="text.secondary">—</Typography>;
  return (
    <Box component="span" sx={{ display: 'inline-block', px: 1, py: 0.25, borderRadius: 1, bgcolor: 'action.selected', fontFamily: 'monospace', fontWeight: 700, fontSize: '0.75rem' }}>
      {value}
    </Box>
  );
}

function EntityAvatar({ text, gradient, imageUrl }) {
  if (imageUrl) {
    return (
      <Box
        component="img"
        src={imageUrl}
        alt={text || 'Avatar'}
        sx={{
          width: 32,
          height: 32,
          borderRadius: 1.5,
          objectFit: 'cover',
          flexShrink: 0,
          border: '2px solid',
          borderColor: 'divider',
        }}
      />
    );
  }
  const initials = (text || '?').substring(0, 2).toUpperCase();
  return (
    <Box sx={{ width: 32, height: 32, borderRadius: 1.5, background: gradient || 'linear-gradient(135deg,#2563eb,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Typography sx={{ color: '#fff', fontSize: '0.7rem', fontWeight: 700 }}>{initials}</Typography>
    </Box>
  );
}

export default function CrudEntityPage({
  title,
  icon,
  gradient,
  idKey,
  columns,
  filterFields,
  formFields,
  defaultFilters,
  emptyForm,
  normalizePayload,
  listFetcher,
  getByIdFetcher,
  createFetcher,
  updateFetcher,
  deleteFetcher,
  renderCell,
  prefillForm,
  prefillFilters,
  mapRecordToForm,
  autoSearch = false,
  autoSearchDebounceMs = 350,
  tableMaxHeight,
  fitViewport = false,
  viewportOffset = 180,
  onFormFieldChange,
  avatarImageKey,
  hideHeader = false,
  hideFilters = false,
  hideFilterSearchButton = false,
  hideFilterResetButton = false,
  showHeaderResetFilters = false,
  hideEditAction = false,
  showCreateButtonWhenHeaderHidden = false,
  headerActions = null,
}) {
  const theme = useTheme();
  const { token } = useAuth();
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';
  const effectiveViewportOffset = Math.max(96, (viewportOffset ?? 180) - 80);
  const baseForm = { ...emptyForm, ...(prefillForm || {}) };

  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState(() => ({ ...defaultFilters }));
  const [form, setForm] = useState(baseForm);
  const [dialogMode, setDialogMode] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const extractRows = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.content)) return payload.content;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
  };

  const load = async (appliedFilters = filters) => {
    if (!token) {
      setRows([]);
      return;
    }
    setError('');
    setLoading(true);
    try {
      const data = await listFetcher(token, appliedFilters);
      setRows(extractRows(data));
    } catch (e) {
      setError(e.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [token]);

  useEffect(() => {
    if (!autoSearch || !token) return;
    const t = setTimeout(() => { load(); }, autoSearchDebounceMs);
    return () => clearTimeout(t);
  }, [filters, autoSearch, autoSearchDebounceMs, token]);

  useEffect(() => {
    if (prefillForm) {
      setForm((p) => ({ ...p, ...prefillForm }));
    }
  }, [prefillForm]);

  useEffect(() => {
    if (prefillFilters) {
      setFilters((p) => ({ ...p, ...prefillFilters }));
    }
  }, [prefillFilters]);

  const resetFilters = () => {
    const next = { ...defaultFilters, ...(prefillFilters || {}) };
    setFilters(next);
    if (!autoSearch) load(next);
  };

  const openCreate = () => { setForm(baseForm); setSelectedId(null); setFormError(''); setDialogMode('create'); };

  const openView = async (id) => {
    setFormError('');
    try {
      const data = await getByIdFetcher(token, id);
      const nextForm = typeof mapRecordToForm === 'function' ? mapRecordToForm(data || emptyForm) : (data || emptyForm);
      setForm(nextForm);
      setSelectedId(id);
      setDialogMode('view');
    } catch (e) { setError(e.message || 'Failed to load record'); }
  };

  const openEdit = async (id) => {
    setFormError('');
    try {
      const data = await getByIdFetcher(token, id);
      const nextForm = typeof mapRecordToForm === 'function' ? mapRecordToForm(data || emptyForm) : (data || emptyForm);
      setForm(nextForm);
      setSelectedId(id);
      setDialogMode('edit');
    } catch (e) { setError(e.message || 'Failed to load record for edit'); }
  };

  const closeDialog = () => { setDialogMode(null); setSelectedId(null); setForm(baseForm); setFormError(''); };

  const onSave = async () => {
    setFormError('');
    setSaving(true);
    try {
      const payload = normalizePayload(form, dialogMode);
      if (dialogMode === 'edit' && selectedId) {
        await updateFetcher(token, selectedId, payload);
      } else {
        await createFetcher(token, payload);
      }
      closeDialog();
      await load();
    } catch (e) {
      setFormError(e.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const onDelete = async (id) => {
    setDeleteConfirm(null);
    setSaving(true);
    try {
      await deleteFetcher(token, id);
      await load();
    } catch (e) { setError(e.message || 'Delete failed'); }
    finally { setSaving(false); }
  };

  const dialogTitle = useMemo(() => {
    if (dialogMode === 'edit') return 'Edit ' + title.replace(/s$/, '');
    if (dialogMode === 'view') return 'View ' + title.replace(/s$/, '');
    return 'New ' + title.replace(/s$/, '');
  }, [dialogMode, title]);

  const defaultRenderCell = (col, row) => {
    const val = row[col.key];
    if (col.render) return col.render(row);
    if (col.type === 'boolean' || typeof val === 'boolean') return <BoolChip value={val} theme={theme} />;
    if (col.type === 'code') return <CodeBadge value={val} />;
    if (val == null || val === '') return <Typography variant="caption" color="text.secondary">—</Typography>;
    return val;
  };

  const nameCol = columns.find((c) => c.key.toLowerCase().includes('name'));
  const codeCol = columns.find((c) => c.key.toLowerCase().includes('code'));

  return (
    <Stack
      spacing={fitViewport ? 2 : 3}
      sx={fitViewport ? { height: `calc(100vh - ${effectiveViewportOffset}px)`, overflow: 'hidden' } : undefined}
    >
      {/* Page Header */}
      {!hideHeader && (
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box sx={{ width: 40, height: 40, borderRadius: 1, background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
              {icon}
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>{title}</Typography>
              <Typography variant="caption" color="text.secondary">
                {loading ? 'Loading...' : rows.length + ' records'}
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Refresh">
              <span>
                <IconButton onClick={load} size="small" disabled={loading}>
                  <RefreshRoundedIcon />
                </IconButton>
              </span>
            </Tooltip>
            {showHeaderResetFilters && !hideFilters && (
              <Tooltip title="Reset Filters">
                <span>
                  <IconButton onClick={resetFilters} size="small" disabled={loading}>
                    <RestartAltRoundedIcon />
                  </IconButton>
                </span>
              </Tooltip>
            )}
            {headerActions}
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={openCreate}
              size="small"
              sx={{ height: 36, fontWeight: 600 }}
            >
              New {title.replace(/s$/, '')}
            </Button>
          </Stack>
        </Stack>
      )}
      {hideHeader && showCreateButtonWhenHeaderHidden && (
        <Stack direction="row" justifyContent="flex-end" alignItems="center">
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={openCreate}
            size="small"
            sx={{ height: 36, fontWeight: 600 }}
          >
            New {title.replace(/s$/, '')}
          </Button>
        </Stack>
      )}

      {error && <Alert severity="error" sx={{ borderRadius: 1 }} onClose={() => setError('')}>{error}</Alert>}

      {!hideFilters && (
        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 1, border: isDark ? '1px solid #1e293b' : '1px solid #e2e8f0', bgcolor: isDark ? 'rgba(30,41,59,0.5)' : 'rgba(241,245,249,0.8)' }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <FilterListRoundedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
            <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>Filter & Search</Typography>
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} flexWrap="wrap" useFlexGap>
            {filterFields.map((field) => (
              <Box key={field.key} sx={{ minWidth: 160, flex: '1 1 160px', maxWidth: 260 }}>
                {renderField(
                  field,
                  filters[field.key],
                  (e) => setFilters((p) => ({ ...p, [field.key]: e.target.value })),
                  !!field.readOnly,
                  filters
                )}
              </Box>
            ))}
            {!hideFilterSearchButton && (
              <Button
                variant="contained"
                onClick={load}
                startIcon={<SearchRoundedIcon />}
                size="small"
                disabled={loading}
                sx={{ height: 40, alignSelf: 'flex-end', minWidth: 100, fontWeight: 600 }}
              >
                Search
              </Button>
            )}
            {!hideFilterResetButton && (
              <Button
                variant="outlined"
                onClick={resetFilters}
                size="small"
                disabled={loading}
                sx={{ height: 40, alignSelf: 'flex-end', minWidth: 100, fontWeight: 600 }}
              >
                Reset
              </Button>
            )}
          </Stack>
        </Paper>
      )}

      {/* Data Table */}
      <Paper
        variant="outlined"
        sx={{
          mt: hideFilters ? 1 : 2,
          borderRadius: 1,
          overflow: 'hidden',
          border: isDark ? '1px solid #1e293b' : '1px solid #e2e8f0',
          ...(fitViewport ? { flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' } : {}),
        }}
      >
        {(loading || saving) && <LinearProgress />}
        <TableContainer sx={fitViewport ? { flex: 1, minHeight: 0, maxHeight: tableMaxHeight || 'none' } : (tableMaxHeight ? { maxHeight: tableMaxHeight } : undefined)}>
          <Table size="small" stickyHeader={!!tableMaxHeight || fitViewport}>
            <TableHead>
              <TableRow sx={{ bgcolor: isDark ? 'rgba(15,23,42,0.6)' : 'rgba(241,245,249,0.9)' }}>
                {nameCol && <TableCell sx={{ width: 48, py: 1.9 }} />}
                {columns.map((c) => (
                  <TableCell key={c.key} sx={{ fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary', py: 1.9, whiteSpace: 'nowrap' }}>
                    {c.label}
                  </TableCell>
                ))}
                <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary', py: 1.9, width: 124 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={columns.length + (nameCol ? 2 : 1)} align="center" sx={{ py: 6 }}>
                    <Box sx={{ opacity: 0.4, mb: 1 }}>
                      <Box sx={{ width: 40, height: 40, borderRadius: 2, background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto' }}>{icon}</Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary">No {title.toLowerCase()} found</Typography>
                    <Typography variant="caption" color="text.secondary">Adjust filters or add a new record</Typography>
                  </TableCell>
                </TableRow>
              )}
              {rows.map((row, idx) => (
                <TableRow
                  key={row[idKey]}
                  hover
                  sx={{ '&:last-child td': { border: 0 }, cursor: 'pointer', transition: 'background 0.15s' }}
                  onClick={() => openView(row[idKey])}
                >
                  {nameCol && (
                    <TableCell sx={{ py: 1.5, pl: 2, pr: 0.5 }}>
                      <EntityAvatar
                        text={row[nameCol.key]}
                        gradient={gradient}
                        imageUrl={avatarImageKey ? row[avatarImageKey] : null}
                      />
                    </TableCell>
                  )}
                  {columns.map((col) => (
                    <TableCell key={col.key} sx={{ py: 1.5, fontSize: '0.9rem' }}>
                      {renderCell ? (renderCell(col, row) ?? defaultRenderCell(col, row)) : defaultRenderCell(col, row)}
                    </TableCell>
                  ))}
                  <TableCell sx={{ py: 1.2, pr: 1.5 }} onClick={(e) => e.stopPropagation()}>
                    <Stack direction="row" spacing={0.25}>
                      <Tooltip title="View details">
                        <IconButton size="small" onClick={() => openView(row[idKey])} sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>
                          <VisibilityRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {!hideEditAction && (
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => openEdit(row[idKey])} sx={{ color: 'text.secondary', '&:hover': { color: 'warning.main' } }}>
                            <EditRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Delete">
                        <IconButton size="small" onClick={() => setDeleteConfirm(row[idKey])} sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}>
                          <DeleteRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Create / Edit / View Dialog */}
      <Dialog
        open={!!dialogMode}
        onClose={closeDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 1, bgcolor: isDark ? '#0f172a' : '#fff' } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box sx={{ width: 32, height: 32, borderRadius: 1.5, background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {icon}
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{dialogTitle}</Typography>
                {selectedId && <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>ID: {selectedId}</Typography>}
              </Box>
            </Stack>
            <IconButton size="small" onClick={closeDialog}><CloseRoundedIcon fontSize="small" /></IconButton>
          </Stack>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ pt: 2.5 }}>
          {formError && <Alert severity="error" sx={{ mb: 2, borderRadius: 1 }}>{formError}</Alert>}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' },
              gap: 2,
            }}
          >
            {formFields.map((field) => {
              if (typeof field.hiddenByForm === 'function' && field.hiddenByForm(form)) {
                return null;
              }
              const effectiveField = resolveFieldByForm(field, form);
              if (field.type === 'section') {
                return renderField(effectiveField, null, null, false, form);
              }
              return (
                <Box key={effectiveField.key} sx={{ gridColumn: effectiveField.fullWidth || effectiveField.minWidth > 200 || effectiveField.type === 'image' ? 'span 2' : 'span 1' }}>
                  {renderField(
                    effectiveField,
                    form[effectiveField.key],
                    (e) => {
                      const value = e.target.value;
                      setForm((p) => {
                        const next = { ...p, [effectiveField.key]: value };
                        if (typeof onFormFieldChange === 'function') {
                          const result = onFormFieldChange(next, effectiveField.key, value, p);
                          if (result && typeof result.then === 'function') {
                            result.then((resolved) => {
                              if (!resolved) return;
                              setForm((current) => resolved);
                            }).catch(() => {});
                            return next;
                          }
                          return result || next;
                        }
                        return next;
                      });
                    },
                    dialogMode === 'view' || !!effectiveField.readOnly || (effectiveField.readonlyOnEdit && dialogMode === 'edit'),
                    form
                  )}
                </Box>
              );
            })}
          </Box>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ px: 3, py: 2 }}>
          {dialogMode === 'view' ? (
            <>
              <Button size="small" variant="outlined" startIcon={<CancelRoundedIcon />} onClick={closeDialog}>Close</Button>
              {!hideEditAction && (
                <Button size="small" variant="contained" startIcon={<EditRoundedIcon />} onClick={() => setDialogMode('edit')}>Edit</Button>
              )}
            </>
          ) : (
            <>
              <Button size="small" variant="outlined" startIcon={<CancelRoundedIcon />} onClick={closeDialog} disabled={saving}>Cancel</Button>
              <Button size="small" variant="contained" startIcon={<SaveRoundedIcon />} onClick={onSave} disabled={saving} sx={{ fontWeight: 600 }}>
                {saving ? 'Saving...' : dialogMode === 'edit' ? 'Update' : 'Create'}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: alpha(theme.palette.error.main, 0.14), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DeleteRoundedIcon sx={{ color: 'error.main', fontSize: 18 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Delete Record</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">This action cannot be undone. Are you sure you want to delete this record?</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button variant="outlined" size="small" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button variant="contained" color="error" size="small" onClick={() => onDelete(deleteConfirm)} disabled={saving}>
            {saving ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
