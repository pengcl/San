import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Switch,
  FormControlLabel,
  Chip,
  Stack,
  Divider,
  Button,
  Alert,
  LinearProgress
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Bug as BugIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  Memory as MemoryIcon,
  Speed as SpeedIcon,
  Visibility as VisibilityIcon,
  Code as CodeIcon
} from '@mui/icons-material';

interface MapDebugPanelProps {
  debugInfo: any;
  performance?: {
    fps: number;
    renderTime: number;
    memoryUsage?: number;
  };
  onToggleDebug?: (enabled: boolean) => void;
  onRefreshData?: () => void;
  onClearConsole?: () => void;
  mapType: '3D' | 'Pixel' | 'Geo';
}

const MapDebugPanel: React.FC<MapDebugPanelProps> = ({
  debugInfo,
  performance,
  onToggleDebug,
  onRefreshData,
  onClearConsole,
  mapType
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [debugEnabled, setDebugEnabled] = useState(true);

  const handleToggleDebug = (enabled: boolean) => {
    setDebugEnabled(enabled);
    onToggleDebug?.(enabled);
  };

  const getStatusColor = (status: boolean) => {
    return status ? 'success' : 'default';
  };

  const getStatusText = (status: boolean) => {
    return status ? '✅ 完成' : '⏳ 等待';
  };

  const formatPerformanceMetrics = () => {
    if (!performance) return null;
    
    return (
      <Stack spacing={2}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SpeedIcon fontSize="small" />
          <Typography variant="body2">
            FPS: <strong>{performance.fps}</strong>
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={Math.min(performance.fps / 60 * 100, 100)}
            sx={{ flexGrow: 1, height: 6, borderRadius: 3 }}
            color={performance.fps >= 30 ? 'success' : performance.fps >= 15 ? 'warning' : 'error'}
          />
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <MemoryIcon fontSize="small" />
          <Typography variant="body2">
            渲染时间: <strong>{performance.renderTime.toFixed(2)}ms</strong>
          </Typography>
        </Box>
        
        {performance.memoryUsage && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <MemoryIcon fontSize="small" />
            <Typography variant="body2">
              内存使用: <strong>{(performance.memoryUsage / 1024 / 1024).toFixed(2)}MB</strong>
            </Typography>
          </Box>
        )}
      </Stack>
    );
  };

  const render3DDebugInfo = () => (
    <Stack spacing={2}>
      <Box>
        <Typography variant="subtitle2" gutterBottom>场景状态</Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip 
            label="场景创建" 
            color={getStatusColor(debugInfo.sceneCreated)} 
            size="small" 
          />
          <Chip 
            label="地形生成" 
            color={getStatusColor(debugInfo.terrainGenerated)} 
            size="small" 
          />
          <Chip 
            label="光照设置" 
            color={getStatusColor(debugInfo.lightsSetup)} 
            size="small" 
          />
          <Chip 
            label="城池加载" 
            color={getStatusColor(debugInfo.citiesLoaded)} 
            size="small" 
          />
          <Chip 
            label="天气效果" 
            color={getStatusColor(debugInfo.weatherCreated)} 
            size="small" 
          />
          <Chip 
            label="渲染启动" 
            color={getStatusColor(debugInfo.renderStarted)} 
            size="small" 
          />
        </Stack>
      </Box>
    </Stack>
  );

  const renderPixelDebugInfo = () => (
    <Stack spacing={2}>
      <Box>
        <Typography variant="subtitle2" gutterBottom>像素世界状态</Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip 
            label="地形生成" 
            color={getStatusColor(debugInfo.terrainGenerated)} 
            size="small" 
          />
          <Chip 
            label="城池创建" 
            color={getStatusColor(debugInfo.citiesCreated)} 
            size="small" 
          />
          <Chip 
            label="画布准备" 
            color={getStatusColor(debugInfo.canvasReady)} 
            size="small" 
          />
          <Chip 
            label="渲染启动" 
            color={getStatusColor(debugInfo.renderingActive)} 
            size="small" 
          />
        </Stack>
      </Box>
      
      {debugInfo.verticesCount > 0 && (
        <Typography variant="body2">
          像素数量: <strong>{debugInfo.verticesCount.toLocaleString()}</strong>
        </Typography>
      )}
      
      {debugInfo.citiesCount > 0 && (
        <Typography variant="body2">
          城池数量: <strong>{debugInfo.citiesCount}</strong>
        </Typography>
      )}
    </Stack>
  );

  const renderGeoDebugInfo = () => (
    <Stack spacing={2}>
      <Box>
        <Typography variant="subtitle2" gutterBottom>数据加载状态</Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip 
            label="三国领土" 
            color={getStatusColor(debugInfo.dataLoaded?.kingdoms)} 
            size="small" 
          />
          <Chip 
            label="历史城池" 
            color={getStatusColor(debugInfo.dataLoaded?.cities)} 
            size="small" 
          />
          <Chip 
            label="地形要素" 
            color={getStatusColor(debugInfo.dataLoaded?.terrain)} 
            size="small" 
          />
        </Stack>
      </Box>
      
      <Box>
        <Typography variant="subtitle2" gutterBottom>图层状态</Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip 
            label="地图初始化" 
            color={getStatusColor(debugInfo.mapInitialized)} 
            size="small" 
          />
          <Chip 
            label="领土图层" 
            color={getStatusColor(debugInfo.layersAdded?.kingdoms)} 
            size="small" 
          />
          <Chip 
            label="城池图层" 
            color={getStatusColor(debugInfo.layersAdded?.cities)} 
            size="small" 
          />
          <Chip 
            label="地形图层" 
            color={getStatusColor(debugInfo.layersAdded?.terrain)} 
            size="small" 
          />
        </Stack>
      </Box>
      
      {debugInfo.dataStats && (
        <Stack spacing={1}>
          <Typography variant="body2">
            领土数量: <strong>{debugInfo.dataStats.kingdomsCount}</strong>
          </Typography>
          <Typography variant="body2">
            城池数量: <strong>{debugInfo.dataStats.citiesCount}</strong>
          </Typography>
          <Typography variant="body2">
            地形要素: <strong>{debugInfo.dataStats.terrainCount}</strong>
          </Typography>
        </Stack>
      )}
    </Stack>
  );

  const renderDebugContent = () => {
    switch (mapType) {
      case '3D':
        return render3DDebugInfo();
      case 'Pixel':
        return renderPixelDebugInfo();
      case 'Geo':
        return renderGeoDebugInfo();
      default:
        return null;
    }
  };

  if (!isOpen) {
    return (
      <IconButton
        onClick={() => setIsOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 16,
          left: 16,
          bgcolor: 'rgba(255, 107, 53, 0.9)',
          color: 'white',
          '&:hover': {
            bgcolor: 'rgba(255, 107, 53, 1)',
          },
          zIndex: 1000,
          animation: 'pulse 2s infinite'
        }}
      >
        <BugIcon />
      </IconButton>
    );
  }

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 16,
        left: 16,
        width: 350,
        maxHeight: '60vh',
        overflow: 'auto',
        zIndex: 1000,
        background: 'rgba(26, 26, 46, 0.95)',
        backdropFilter: 'blur(10px)',
        border: '1px solid #ff6b35',
        borderRadius: 2
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BugIcon sx={{ color: '#ff6b35' }} />
            <Typography variant="h6" sx={{ color: '#fff' }}>
              {mapType}地图调试
            </Typography>
          </Box>
          <IconButton onClick={() => setIsOpen(false)} size="small">
            <CloseIcon sx={{ color: '#fff' }} />
          </IconButton>
        </Box>

        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}>
            <Typography sx={{ color: '#fff' }}>🔧 控制面板</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={debugEnabled}
                    onChange={(e) => handleToggleDebug(e.target.checked)}
                    color="warning"
                  />
                }
                label="启用调试模式"
                sx={{ color: '#fff' }}
              />
              
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={onRefreshData}
                  startIcon={<RefreshIcon />}
                  sx={{ color: '#fff', borderColor: '#ff6b35' }}
                >
                  刷新数据
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={onClearConsole}
                  startIcon={<CodeIcon />}
                  sx={{ color: '#fff', borderColor: '#ff6b35' }}
                >
                  清理控制台
                </Button>
              </Stack>
            </Stack>
          </AccordionDetails>
        </Accordion>

        {performance && (
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}>
              <Typography sx={{ color: '#fff' }}>⚡ 性能监控</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {formatPerformanceMetrics()}
            </AccordionDetails>
          </Accordion>
        )}

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}>
            <Typography sx={{ color: '#fff' }}>📊 状态信息</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {renderDebugContent()}
          </AccordionDetails>
        </Accordion>

        <Box sx={{ mt: 2, p: 1, bgcolor: 'rgba(0, 0, 0, 0.3)', borderRadius: 1 }}>
          <Typography variant="caption" sx={{ color: '#999' }}>
            💡 提示: 打开浏览器控制台查看详细日志
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default MapDebugPanel;