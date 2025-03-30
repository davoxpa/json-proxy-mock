import { Box, IconButton, Tooltip, Paper } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import ApiList from './ApiList';
import LogViewer from './LogViewer';
import { useTheme } from '../theme/ThemeContext';
import { useLayoutConfig } from '../hooks/useLayoutConfig';

export default function Dashboard() {
  const { isDarkMode, toggleTheme } = useTheme();
  const { config, toggleLogs, updateLogHeight } = useLayoutConfig();

  const handleDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = config.logHeight;

    const handleDrag = (e: MouseEvent) => {
      const deltaY = startY - e.clientY;
      const newHeight = startHeight + (deltaY / window.innerHeight) * 100;
      updateLogHeight(newHeight);
    };

    const handleDragEnd = () => {
      document.removeEventListener('mousemove', handleDrag);
      document.removeEventListener('mouseup', handleDragEnd);
    };

    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', handleDragEnd);
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      bgcolor: 'background.default'
    }}>
      <Box sx={{ 
        borderBottom: 1, 
        borderColor: 'divider',
        bgcolor: 'background.paper',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 1,
        px: 1.5,
        py: 0.5,
        minHeight: 48
      }}>
        <Tooltip title={config.showLogs ? 'Nascondi Log' : 'Mostra Log'}>
          <IconButton 
            onClick={toggleLogs} 
            color="inherit"
            size="small"
          >
            {config.showLogs ? <VisibilityOffIcon /> : <VisibilityIcon />}
          </IconButton>
        </Tooltip>
        <Tooltip title={isDarkMode ? 'Passa al tema chiaro' : 'Passa al tema scuro'}>
          <IconButton 
            onClick={toggleTheme} 
            color="inherit"
            size="small"
          >
            {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Tooltip>
      </Box>
      <Box sx={{ 
        flexGrow: 1,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        p: 1
      }}>
        <Box sx={{ 
          height: config.showLogs ? `${100 - config.logHeight}%` : '100%',
          transition: 'height 0.2s ease-in-out',
          overflow: 'hidden',
          bgcolor: 'background.paper',
          borderRadius: 1,
          display: 'flex',
          flexDirection: 'column'
        }}>
          <ApiList />
        </Box>
        {config.showLogs && (
          <Paper
            elevation={0}
            sx={{
              height: `${config.logHeight}%`,
              transition: 'height 0.2s ease-in-out',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              bgcolor: 'background.paper',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Box
              sx={{
                height: 24,
                bgcolor: 'background.default',
                borderBottom: '1px solid',
                borderColor: 'divider',
                cursor: 'ns-resize',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                '&:hover': {
                  bgcolor: 'action.hover'
                }
              }}
              onMouseDown={handleDragStart}
            >
              <DragIndicatorIcon 
                sx={{ 
                  color: 'text.secondary',
                  fontSize: 20
                }} 
              />
            </Box>
            <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
              <LogViewer />
            </Box>
          </Paper>
        )}
      </Box>
    </Box>
  );
} 