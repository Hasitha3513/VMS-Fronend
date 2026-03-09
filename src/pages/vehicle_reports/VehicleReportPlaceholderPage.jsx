import { Box, Paper, Stack, Typography } from '@mui/material';
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';

export default function VehicleReportPlaceholderPage({ title }) {
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          p: { xs: 2.5, md: 4 },
          border: (theme) => `1px solid ${theme.palette.divider}`,
          background: (theme) => theme.palette.background.paper,
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
          <AssessmentRoundedIcon color="primary" />
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary">
          Report UI and filters will be added here.
        </Typography>
      </Paper>
    </Box>
  );
}

