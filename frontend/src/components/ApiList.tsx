/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Divider,
  Switch,
  FormControlLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import InfoIcon from '@mui/icons-material/Info';
import { apiService, IMemoryJson } from '../services/apiService';
import { websocketService, LogEntry } from '../services/websocket.service';

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'];

export default function ApiList() {
  const [apis, setApis] = useState<IMemoryJson[]>([]);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingApi, setEditingApi] = useState<IMemoryJson | null>(null);
  const [formData, setFormData] = useState({
    url: '',
    method: 'GET',
    statusCode: 200,
    responseBody: '',
    inputBody: '',
    headers: {} as Record<string, string>,
    params: {} as Record<string, string[]>,
    bypass: false,
    delay: 0
  });
  const [newHeaderKey, setNewHeaderKey] = useState('');
  const [newHeaderValue, setNewHeaderValue] = useState('');
  const [newParamKey, setNewParamKey] = useState('');
  const [newParamValue, setNewParamValue] = useState('');

  useEffect(() => {
    loadApis();
  }, []);

  useEffect(() => {
    const subscription = websocketService.getLogs().subscribe((logs: LogEntry[]) => {
      // Controlla se c'è almeno un log di tipo mock
      const hasMockLogs = logs.some(log => log.type === 'mock');
      if (hasMockLogs) {
        loadApis();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadApis = async () => {
    try {
      const data = await apiService.getAll();
      setApis(data || []);
    } catch (err) {
      setError('Errore nel caricamento delle API');
      console.error(err);
      setApis([]);
    }
  };

  const handleClickOpen = (api?: IMemoryJson) => {
    if (api) {
      setEditingApi(api);
      setFormData({
        url: api.input.url,
        method: api.input.method,
        statusCode: api.output.statusCode,
        responseBody: JSON.stringify(api.output.body, null, 2),
        inputBody: JSON.stringify(api.input.body, null, 2),
        headers: api.input.headers || {},
        params: api.input.params || {},
        bypass: api.bypass,
        delay: api.delay
      });
    } else {
      setEditingApi(null);
      setFormData({
        url: '',
        method: 'GET',
        statusCode: 200,
        responseBody: '',
        inputBody: '',
        headers: {},
        params: {},
        bypass: false,
        delay: 0
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingApi(null);
    setFormData({
      url: '',
      method: 'GET',
      statusCode: 200,
      responseBody: '',
      inputBody: '',
      headers: {},
      params: {},
      bypass: false,
      delay: 0
    });
  };

  const handleSubmit = async () => {
    try {
      const apiData = {
        input: {
          url: formData.url,
          method: formData.method,
          headers: formData.headers,
          params: formData.params,
          body: formData.inputBody.trim() ? JSON.parse(formData.inputBody) : {}
        },
        output: {
          headers: {},
          body: formData.responseBody.trim() ? JSON.parse(formData.responseBody) : {},
          statusCode: formData.statusCode
        },
        bypass: formData.bypass,
        delay: formData.delay
      };

      if (editingApi?.id) {
        await apiService.update(editingApi.id, apiData);
      } else {
        await apiService.create(apiData as Omit<IMemoryJson, 'id' | 'createdAt' | 'updatedAt'>);
      }
      
      await loadApis();
      handleClose();
    } catch (err) {
      setError(editingApi ? 'Errore nella modifica dell\'API' : 'Errore nella creazione dell\'API');
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiService.delete(id);
      await loadApis();
    } catch (err) {
      setError('Errore nell\'eliminazione dell\'API');
      console.error(err);
    }
  };

  const handleAddHeader = () => {
    if (newHeaderKey && newHeaderValue) {
      setFormData({
        ...formData,
        headers: {
          ...formData.headers,
          [newHeaderKey]: newHeaderValue
        }
      });
      setNewHeaderKey('');
      setNewHeaderValue('');
    }
  };

  const handleRemoveHeader = (key: string) => {
    const { [key]: _, ...rest } = formData.headers;
    setFormData({
      ...formData,
      headers: rest
    });
  };

  const handleAddParam = () => {
    if (newParamKey && newParamValue) {
      setFormData({
        ...formData,
        params: {
          ...formData.params,
          [newParamKey]: [newParamValue]
        }
      });
      setNewParamKey('');
      setNewParamValue('');
    }
  };

  const handleRemoveParam = (key: string) => {
    const { [key]: _, ...rest } = formData.params;
    setFormData({
      ...formData,
      params: rest
    });
  };

  const handleBypassToggle = async (api: IMemoryJson) => {
    try {
      await apiService.update(api.id!, {
        ...api,
        bypass: !api.bypass
      });
      await loadApis();
    } catch (err) {
      setError('Errore nella modifica del bypass');
      console.error(err);
    }
  };

  const renderHeadersTooltip = (headers: Record<string, string>) => {
    return (
      <Box sx={{ p: 1 }}>
        {Object.entries(headers).map(([key, value]) => (
          <Typography key={key} variant="body2">
            <strong>{key}:</strong> {value}
          </Typography>
        ))}
      </Box>
    );
  };

  const renderParamsTooltip = (params: Record<string, string[]>) => {
    return (
      <Box sx={{ p: 1 }}>
        {Object.entries(params).map(([key, values]) => (
          <Typography key={key} variant="body2">
            <strong>{key}:</strong> {Array.isArray(values) ? values.join(', ') : values}
          </Typography>
        ))}
      </Box>
    );
  };

  return (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      bgcolor: 'background.default'
    }}>
      <Box sx={{ 
        p: 2,
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        bgcolor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider',
        boxShadow: 1
      }}>
        <Typography variant="h6" color="primary">
          API Mock Manager
        </Typography>
        <Button
          variant="contained"
          size="large"
          startIcon={<AddIcon />}
          onClick={() => handleClickOpen()}
        >
          Crea API Mock
        </Button>
      </Box>

      <Box sx={{ 
        flexGrow: 1, 
        overflow: 'auto',
        p: 2
      }}>
        <TableContainer 
          component={Paper} 
          elevation={0}
          sx={{ 
            height: '100%',
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            boxShadow: 1,
            '& .MuiTable-root': {
              width: '100%',
              '& .MuiTableHead-root': {
                backgroundColor: 'background.paper',
                '& .MuiTableCell-root': {
                  fontWeight: 600,
                  color: 'text.primary',
                  borderBottom: 2,
                  borderColor: 'divider',
                  py: 2
                }
              },
              '& .MuiTableBody-root': {
                '& .MuiTableRow-root': {
                  '&:hover': {
                    backgroundColor: 'action.hover'
                  },
                  '& .MuiTableCell-root': {
                    borderBottom: 1,
                    borderColor: 'divider',
                    py: 2
                  }
                }
              }
            }
          }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell width="10%">Metodo</TableCell>
                <TableCell width="35%">URL</TableCell>
                <TableCell width="10%">Status Code</TableCell>
                <TableCell width="10%">Headers</TableCell>
                <TableCell width="10%">Params</TableCell>
                <TableCell width="10%">Bypass</TableCell>
                <TableCell width="5%">Azioni</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {apis.map((api) => (
                <TableRow key={api.id} hover>
                  <TableCell>
                    <Chip 
                      label={api.input.method} 
                      color={api.input.method === 'GET' ? 'success' : 
                             api.input.method === 'POST' ? 'primary' : 
                             api.input.method === 'PUT' ? 'warning' : 
                             api.input.method === 'DELETE' ? 'error' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title={api.input.url}>
                      <Typography 
                        sx={{ 
                          wordBreak: 'break-all',
                          maxWidth: 300,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {api.input.url}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={api.output.statusCode} 
                      color={api.output.statusCode < 300 ? 'success' : 
                             api.output.statusCode < 400 ? 'info' : 
                             api.output.statusCode < 500 ? 'warning' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip 
                      title={renderHeadersTooltip(api.input.headers || {})}
                      arrow
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <InfoIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {Object.keys(api.input.headers || {}).length} headers
                        </Typography>
                      </Box>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Tooltip 
                      title={renderParamsTooltip(api.input.params || {})}
                      arrow
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <InfoIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {Object.keys(api.input.params || {}).length} params
                        </Typography>
                      </Box>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={api.bypass}
                          onChange={() => handleBypassToggle(api)}
                          color="primary"
                        />
                      }
                      label={api.bypass ? 'Bypass' : 'Mock'}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Modifica">
                        <IconButton size="small" onClick={() => handleClickOpen(api)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Elimina">
                        <IconButton size="small" onClick={() => handleDelete(api.id!)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Dialog 
        open={open} 
        onClose={handleClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{editingApi ? 'Modifica API Mock' : 'Crea Nuova API Mock'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Metodo</InputLabel>
                  <Select
                    value={formData.method}
                    label="Metodo"
                    onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                  >
                    {HTTP_METHODS.map((method) => (
                      <MenuItem key={method} value={method}>{method}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="URL"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Status Code"
                  type="number"
                  value={formData.statusCode}
                  onChange={(e) => setFormData({ ...formData, statusCode: Number(e.target.value) })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Delay (ms)"
                  type="number"
                  value={formData.delay}
                  onChange={(e) => setFormData({ ...formData, delay: Number(e.target.value) })}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="subtitle1" gutterBottom>Input Body (JSON)</Typography>
            <TextField
              fullWidth
              label="Input Body"
              multiline
              rows={4}
              value={formData.inputBody}
              onChange={(e) => setFormData({ ...formData, inputBody: e.target.value })}
              error={!isValidJson(formData.inputBody)}
              helperText={!isValidJson(formData.inputBody) ? 'Inserisci un JSON valido' : ''}
              sx={{ mb: 3 }}
            />

            <Typography variant="subtitle1" gutterBottom>Headers</Typography>
            <Box sx={{ mb: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={5}>
                  <TextField
                    fullWidth
                    label="Chiave"
                    value={newHeaderKey}
                    onChange={(e) => setNewHeaderKey(e.target.value)}
                  />
                </Grid>
                <Grid item xs={5}>
                  <TextField
                    fullWidth
                    label="Valore"
                    value={newHeaderValue}
                    onChange={(e) => setNewHeaderValue(e.target.value)}
                  />
                </Grid>
                <Grid item xs={2}>
                  <IconButton 
                    color="primary" 
                    onClick={handleAddHeader}
                    disabled={!newHeaderKey || !newHeaderValue}
                  >
                    <AddCircleOutlineIcon />
                  </IconButton>
                </Grid>
              </Grid>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
              {Object.entries(formData.headers).map(([key, value]) => (
                <Chip
                  key={key}
                  label={`${key}: ${value}`}
                  onDelete={() => handleRemoveHeader(key)}
                  deleteIcon={<RemoveCircleOutlineIcon />}
                />
              ))}
            </Box>

            <Typography variant="subtitle1" gutterBottom>Parametri</Typography>
            <Box sx={{ mb: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={5}>
                  <TextField
                    fullWidth
                    label="Chiave"
                    value={newParamKey}
                    onChange={(e) => setNewParamKey(e.target.value)}
                  />
                </Grid>
                <Grid item xs={5}>
                  <TextField
                    fullWidth
                    label="Valore"
                    value={newParamValue}
                    onChange={(e) => setNewParamValue(e.target.value)}
                  />
                </Grid>
                <Grid item xs={2}>
                  <IconButton 
                    color="primary" 
                    onClick={handleAddParam}
                    disabled={!newParamKey || !newParamValue}
                  >
                    <AddCircleOutlineIcon />
                  </IconButton>
                </Grid>
              </Grid>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
              {Object.entries(formData.params).map(([key, values]) => (
                <Chip
                  key={key}
                  label={`${key}: ${Array.isArray(values) ? values.join(', ') : values}`}
                  onDelete={() => handleRemoveParam(key)}
                  deleteIcon={<RemoveCircleOutlineIcon />}
                />
              ))}
            </Box>

            <Typography variant="subtitle1" gutterBottom>Output Body (JSON)</Typography>
            <TextField
              fullWidth
              label="Response Body"
              multiline
              rows={4}
              value={formData.responseBody}
              onChange={(e) => setFormData({ ...formData, responseBody: e.target.value })}
              error={!isValidJson(formData.responseBody)}
              helperText={!isValidJson(formData.responseBody) ? 'Inserisci un JSON valido' : ''}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleClose} variant="outlined">Annulla</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={!isValidJson(formData.responseBody)}
          >
            {editingApi ? 'Modifica' : 'Crea'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
      >
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}

function isValidJson(str: string): boolean {
  if (!str.trim()) return true;
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
} 