import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../app/AuthContext';

function toLabel(key) {
  return String(key)
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

export default function EntityListPage({
  title,
  subtitle,
  listFetcher,
  keyField,
  defaultParams = {},
}) {
  const { token } = useAuth();
  const [rows, setRows] = useState([]);
  const [params, setParams] = useState(defaultParams);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setError('');
    setLoading(true);
    try {
      const data = await listFetcher(token, params);
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const columns = useMemo(() => {
    if (!rows.length) return [];
    return Object.keys(rows[0]).slice(0, 8);
  }, [rows]);

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h5">{title}</Typography>
          <Typography variant="caption" color="text.secondary">
            {subtitle || `${rows.length} records found`}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button size="small" variant="outlined" startIcon={<RefreshRoundedIcon />} onClick={load} disabled={loading}>
            Refresh
          </Button>
        </Stack>
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}

      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
            <TextField
              size="small"
              label="Sort By"
              value={params.sortBy || ''}
              onChange={(e) => setParams((p) => ({ ...p, sortBy: e.target.value }))}
            />
            <TextField
              size="small"
              label="Sort Dir"
              value={params.sortDir || ''}
              onChange={(e) => setParams((p) => ({ ...p, sortDir: e.target.value }))}
            />
            <Button size="small" variant="contained" startIcon={<SearchRoundedIcon />} onClick={load} disabled={loading}>
              Search
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
        {loading && <LinearProgress />}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {columns.map((c) => (
                  <TableCell key={c}>{toLabel(c)}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {!rows.length && !loading && (
                <TableRow>
                  <TableCell colSpan={Math.max(columns.length, 1)} align="center" sx={{ py: 5, color: 'text.secondary' }}>
                    No records found
                  </TableCell>
                </TableRow>
              )}
              {rows.map((row, idx) => (
                <TableRow key={row[keyField] || idx}>
                  {columns.map((c) => (
                    <TableCell key={c}>
                      {typeof row[c] === 'boolean' ? (
                        <Chip size="small" label={row[c] ? 'Yes' : 'No'} color={row[c] ? 'success' : 'default'} />
                      ) : (
                        <Tooltip title={row[c] == null ? '' : String(row[c])}>
                          <span>{row[c] == null ? '—' : String(row[c])}</span>
                        </Tooltip>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Stack>
  );
}
