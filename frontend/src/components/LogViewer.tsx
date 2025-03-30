import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Collapse,
  Tooltip,
  useTheme,
} from '@mui/material';
import { ExpandMore, ExpandLess, Search, Clear, Delete } from '@mui/icons-material';
import { websocketService, LogEntry } from '../services/websocket.service';

const useLogColors = () => {
  const theme = useTheme();
  
  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'error':
        return theme.palette.error.main;
      case 'warn':
        return theme.palette.warning.main;
      case 'info':
        return theme.palette.info.main;
      case 'debug':
        return theme.palette.success.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'mock':
        return theme.palette.success.main;
      case 'proxy':
        return theme.palette.primary.main;
      case 'system':
        return theme.palette.secondary.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  return { getLevelColor, getTypeColor };
};

export default function LogViewer() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [expandedLogs, setExpandedLogs] = useState<Set<number>>(new Set());
  const { getLevelColor, getTypeColor } = useLogColors();

  useEffect(() => {
    const subscription = websocketService.getLogs().subscribe((newLogs: LogEntry[]) => {
      setLogs(newLogs);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleClearLogs = () => {
    websocketService.clearLogs();
  };

  const toggleLogExpansion = (logId: number) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedLogs(newExpanded);
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchTerm === '' || 
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      JSON.stringify(log.details).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLevel = levelFilter === 'all' || log.level.toLowerCase() === levelFilter;
    const matchesType = typeFilter === 'all' || log.type.toLowerCase() === typeFilter;
    
    return matchesSearch && matchesLevel && matchesType;
  });

  return (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <Box 
        sx={{ 
          p: 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          flexWrap: 'wrap'
        }}
      >
        <TextField
          size="small"
          placeholder="Cerca nei log..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ 
            flexGrow: 1,
            minWidth: 200,
            '& .MuiOutlinedInput-root': {
              bgcolor: 'background.default'
            }
          }}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />,
            endAdornment: searchTerm && (
              <IconButton size="small" onClick={() => setSearchTerm('')}>
                <Clear fontSize="small" />
              </IconButton>
            ),
          }}
        />
        <FormControl 
          size="small" 
          sx={{ 
            minWidth: 100,
            '& .MuiOutlinedInput-root': {
              bgcolor: 'background.default'
            }
          }}
        >
          <InputLabel>Livello</InputLabel>
          <Select
            value={levelFilter}
            label="Livello"
            onChange={(e) => setLevelFilter(e.target.value)}
          >
            <MenuItem value="all">Tutti</MenuItem>
            <MenuItem value="error">Error</MenuItem>
            <MenuItem value="warn">Warn</MenuItem>
            <MenuItem value="info">Info</MenuItem>
            <MenuItem value="debug">Debug</MenuItem>
          </Select>
        </FormControl>
        <FormControl 
          size="small" 
          sx={{ 
            minWidth: 100,
            '& .MuiOutlinedInput-root': {
              bgcolor: 'background.default'
            }
          }}
        >
          <InputLabel>Tipo</InputLabel>
          <Select
            value={typeFilter}
            label="Tipo"
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <MenuItem value="all">Tutti</MenuItem>
            <MenuItem value="mock">Mock</MenuItem>
            <MenuItem value="proxy">Proxy</MenuItem>
            <MenuItem value="system">System</MenuItem>
          </Select>
        </FormControl>
        <Tooltip title="Pulisci tutti i log">
          <Button 
            variant="outlined" 
            color="error" 
            onClick={handleClearLogs}
            startIcon={<Delete />}
            size="small"
            sx={{ 
              bgcolor: 'background.default',
              minWidth: 'auto'
            }}
          >
            Pulisci
          </Button>
        </Tooltip>
      </Box>

      <Box sx={{ 
        flexGrow: 1,
        overflow: 'auto',
        py: 0.5,
        px: 1
      }}>
        {filteredLogs.map((log) => (
          <Box 
            key={log.id} 
            sx={{ 
              py: 0.5,
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              borderRadius: 1,
              '&:hover': {
                bgcolor: 'action.hover'
              }
            }}
          >
            <Box display="flex" alignItems="center" gap={0.5}>
              <IconButton 
                size="small" 
                onClick={() => toggleLogExpansion(log.id)}
                sx={{ 
                  p: 0.5,
                  color: 'text.secondary',
                  '&:hover': {
                    bgcolor: 'action.hover'
                  }
                }}
              >
                {expandedLogs.has(log.id) ? (
                  <ExpandLess fontSize="small" />
                ) : (
                  <ExpandMore fontSize="small" />
                )}
              </IconButton>
              <Typography 
                component="span" 
                sx={{ 
                  color: getLevelColor(log.level),
                  fontWeight: 600,
                  fontSize: 'inherit',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  userSelect: 'none'
                }}
              >
                [{log.level}]
              </Typography>
              <Typography 
                component="span" 
                sx={{ 
                  color: getTypeColor(log.type),
                  fontSize: 'inherit',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  userSelect: 'none'
                }}
              >
                [{log.type}]
              </Typography>
              <Typography 
                component="span" 
                sx={{ 
                  color: 'text.secondary',
                  fontSize: 'inherit',
                  ml: 1
                }}
              >
                {new Date(log.timestamp).toLocaleTimeString()}
              </Typography>
              <Typography 
                sx={{ 
                  color: 'text.primary',
                  fontSize: 'inherit',
                  flexGrow: 1,
                  ml: 1
                }}
              >
                {log.message}
              </Typography>
            </Box>
            <Collapse in={expandedLogs.has(log.id)}>
              <Box 
                sx={{ 
                  ml: 4,
                  mt: 0.5,
                  p: 1,
                  bgcolor: 'background.default',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  fontFamily: 'monospace'
                }}
              >
                <pre style={{ 
                  margin: 0, 
                  whiteSpace: 'pre-wrap',
                  fontSize: 'inherit',
                  color: 'inherit'
                }}>
                  {JSON.stringify(log.details, null, 2)}
                </pre>
              </Box>
            </Collapse>
          </Box>
        ))}
      </Box>
    </Box>
  );
} 