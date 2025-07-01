import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Chip,
  Avatar,
  LinearProgress,
  Alert,
  IconButton,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  AutoAwesome,
  Diamond,
  MonetizationOn,
  History,
  Close,
  Star,
  Celebration,
  EmojiEvents,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../store';
import { addNotification } from '../../store/slices/uiSlice';
import {
  useNormalSummonMutation,
  usePremiumSummonMutation,
  useGetSummonHistoryQuery,
  useGetSummonRatesQuery,
  useGetUserProfileQuery,
} from '../../store/slices/apiSlice';
import { getQualityColor } from '../../utils/qualityColors';

interface SummonResult {
  heroId: number;
  heroName: string;
  quality: number;
  qualityName: string;
  qualityColor: string;
  isNewHero: boolean;
  fragments: number;
}

const SummonPageMUI: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState(0);
  const [summonResults, setSummonResults] = useState<SummonResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [summonCount, setSummonCount] = useState(1);

  // API hooks
  const [normalSummon, { isLoading: normalSummonLoading }] = useNormalSummonMutation();
  const [premiumSummon, { isLoading: premiumSummonLoading }] = usePremiumSummonMutation();
  const { data: summonHistory } = useGetSummonHistoryQuery({ page: 1, limit: 20 });
  const { data: summonRates } = useGetSummonRatesQuery();
  const { data: userProfile } = useGetUserProfileQuery();

  const handleNormalSummon = async () => {
    try {
      const result = await normalSummon({ count: summonCount }).unwrap();
      setSummonResults(result.data.results);
      setShowResults(true);
      
      dispatch(addNotification({
        type: 'success',
        title: '召唤成功',
        message: `获得 ${result.data.newHeroesCount} 个新武将`,
        duration: 3000,
      }));
    } catch (error) {
      console.error('普通召唤失败:', error);
      dispatch(addNotification({
        type: 'error',
        title: '召唤失败',
        message: '金币不足或服务器错误',
        duration: 3000,
      }));
    }
  };

  const handlePremiumSummon = async () => {
    try {
      const result = await premiumSummon({ count: summonCount }).unwrap();
      setSummonResults(result.data.results);
      setShowResults(true);
      
      dispatch(addNotification({
        type: 'success',
        title: '高级召唤成功',
        message: `获得 ${result.data.newHeroesCount} 个新武将`,
        duration: 3000,
      }));
    } catch (error) {
      console.error('高级召唤失败:', error);
      dispatch(addNotification({
        type: 'error',
        title: '召唤失败',
        message: '钻石不足或服务器错误',
        duration: 3000,
      }));
    }
  };

  const renderSummonCard = (
    title: string,
    description: string,
    costIcon: React.ReactNode,
    costAmount: number,
    costType: string,
    onSummon: () => void,
    isLoading: boolean,
    rates: Record<number, number> = {}
  ) => (
    <Card 
      sx={{ 
        background: 'linear-gradient(45deg, #1a1a2e, #16213e)',
        border: '1px solid #374151',
        height: '100%',
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography 
            variant="h5" 
            sx={{ 
              color: '#ff6b35', 
              fontWeight: 'bold',
              mb: 1,
              fontSize: { xs: '1.25rem', sm: '1.5rem' }
            }}
          >
            {title}
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'gray',
              fontSize: { xs: '0.8rem', sm: '0.875rem' }
            }}
          >
            {description}
          </Typography>
        </Box>

        {/* 概率显示 */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ color: 'white', mb: 1, fontSize: { xs: '1rem', sm: '1.125rem' } }}>
            获得概率
          </Typography>
          <Stack spacing={1}>
            {Object.entries(rates).map(([quality, rate]) => (
              <Box key={quality} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box 
                  sx={{ 
                    width: 12, 
                    height: 12, 
                    borderRadius: '50%', 
                    backgroundColor: getQualityColor(parseInt(quality)).color 
                  }} 
                />
                <Typography variant="body2" sx={{ color: 'white', flex: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  {quality}星
                </Typography>
                <Typography variant="body2" sx={{ color: 'gray', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  {(rate * 100).toFixed(1)}%
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>

        {/* 召唤次数选择 */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ color: 'white', mb: 1 }}>
            召唤次数
          </Typography>
          <Stack direction="row" spacing={1}>
            {[1, 5, 10].map(count => (
              <Button
                key={count}
                variant={summonCount === count ? "contained" : "outlined"}
                size="small"
                onClick={() => setSummonCount(count)}
                sx={{ 
                  minHeight: { xs: 36, sm: 40 },
                  fontSize: { xs: '0.75rem', sm: '0.875rem' }
                }}
              >
                {count}次
              </Button>
            ))}
          </Stack>
        </Box>

        {/* 消耗显示 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          {costIcon}
          <Typography variant="h6" sx={{ color: 'white', fontSize: { xs: '1rem', sm: '1.125rem' } }}>
            {costAmount * summonCount} {costType}
          </Typography>
        </Box>

        {/* 召唤按钮 */}
        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={onSummon}
          disabled={isLoading}
          startIcon={isLoading ? <LinearProgress /> : <AutoAwesome />}
          sx={{
            background: 'linear-gradient(45deg, #ff6b35, #ff8a50)',
            minHeight: { xs: 44, sm: 48 },
            fontSize: { xs: '0.9rem', sm: '1rem' },
            '&:hover': {
              background: 'linear-gradient(45deg, #ff5722, #ff6b35)',
            },
          }}
        >
          {isLoading ? '召唤中...' : `${title}${summonCount}次`}
        </Button>
      </CardContent>
    </Card>
  );

  const renderHistoryTab = () => (
    <Box>
      <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
        召唤历史
      </Typography>
      
      {summonHistory?.data?.history?.length ? (
        <TableContainer component={Paper} sx={{ background: 'rgba(26,26,46,0.8)' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: 'white', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  武将
                </TableCell>
                <TableCell sx={{ color: 'white', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  品质
                </TableCell>
                <TableCell sx={{ color: 'white', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  类型
                </TableCell>
                <TableCell sx={{ color: 'white', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  时间
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {summonHistory.data.history.map((record: any, index: number) => (
                <TableRow key={index}>
                  <TableCell sx={{ color: 'white', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    {record.summoned_hero?.name || '未知'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={`${record.hero_star}星`}
                      size="small"
                      sx={{
                        backgroundColor: getQualityColor(record.hero_star).color + '40',
                        color: getQualityColor(record.hero_star).color,
                        fontSize: { xs: '0.65rem', sm: '0.75rem' }
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: 'white', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    {record.summon_type === 'normal' ? '普通召唤' : '高级召唤'}
                  </TableCell>
                  <TableCell sx={{ color: 'gray', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    {new Date(record.summon_time).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Alert severity="info" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
          还没有召唤记录
        </Alert>
      )}
    </Box>
  );

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3 }, px: { xs: 2, sm: 3 } }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* 头部 */}
        <Box sx={{ mb: { xs: 2, sm: 3 }, textAlign: 'center' }}>
          <Typography 
            variant="h4" 
            sx={{ 
              color: '#ff6b35', 
              fontWeight: 'bold',
              fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
              mb: 1
            }}
          >
            武将召唤 ✨
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: 'gray',
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}
          >
            召唤强力武将，组建最强阵容
          </Typography>
        </Box>

        {/* 资源显示 */}
        <Card sx={{ mb: 3, background: 'linear-gradient(45deg, #1a1a2e, #16213e)' }}>
          <CardContent sx={{ py: { xs: 1.5, sm: 2 } }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MonetizationOn sx={{ color: '#ffc107' }} />
                  <Typography variant="h6" sx={{ color: 'white', fontSize: { xs: '1rem', sm: '1.125rem' } }}>
                    {userProfile?.data?.gold?.toLocaleString() || '0'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'gray', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    金币
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Diamond sx={{ color: '#e91e63' }} />
                  <Typography variant="h6" sx={{ color: 'white', fontSize: { xs: '1rem', sm: '1.125rem' } }}>
                    {userProfile?.data?.gems?.toLocaleString() || '0'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'gray', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    钻石
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* 标签页 */}
        <Tabs 
          value={activeTab} 
          onChange={(_, newValue) => setActiveTab(newValue)}
          centered
          sx={{ mb: 3 }}
        >
          <Tab label="普通召唤" sx={{ color: 'white', fontSize: { xs: '0.8rem', sm: '0.875rem' } }} />
          <Tab label="高级召唤" sx={{ color: 'white', fontSize: { xs: '0.8rem', sm: '0.875rem' } }} />
          <Tab label="召唤历史" sx={{ color: 'white', fontSize: { xs: '0.8rem', sm: '0.875rem' } }} />
        </Tabs>

        {/* 标签页内容 */}
        {activeTab === 0 && (
          <Grid container spacing={{ xs: 2, sm: 3 }} justifyContent="center">
            <Grid item xs={12} md={6} lg={5}>
              {renderSummonCard(
                '普通召唤',
                '使用金币召唤，主要获得1-4星武将',
                <MonetizationOn sx={{ color: '#ffc107' }} />,
                summonRates?.data?.normal?.cost?.amount || 10000,
                '金币',
                handleNormalSummon,
                normalSummonLoading,
                summonRates?.data?.normal?.rates || {}
              )}
            </Grid>
          </Grid>
        )}

        {activeTab === 1 && (
          <Grid container spacing={{ xs: 2, sm: 3 }} justifyContent="center">
            <Grid item xs={12} md={6} lg={5}>
              {renderSummonCard(
                '高级召唤',
                '使用钻石召唤，更高概率获得4-6星武将',
                <Diamond sx={{ color: '#e91e63' }} />,
                summonRates?.data?.premium?.cost?.amount || 300,
                '钻石',
                handlePremiumSummon,
                premiumSummonLoading,
                summonRates?.data?.premium?.rates || {}
              )}
            </Grid>
          </Grid>
        )}

        {activeTab === 2 && renderHistoryTab()}

        {/* 召唤结果对话框 */}
        <Dialog
          open={showResults}
          onClose={() => setShowResults(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
              color: 'white',
            }
          }}
        >
          <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                🎉 召唤结果
              </Typography>
              <IconButton onClick={() => setShowResults(false)} sx={{ color: 'white' }}>
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2}>
              <AnimatePresence>
                {summonResults.map((result, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: index * 0.2, duration: 0.4 }}
                  >
                    <Card 
                      sx={{ 
                        background: `linear-gradient(45deg, ${result.qualityColor}20, ${result.qualityColor}10)`,
                        border: `2px solid ${result.qualityColor}`,
                      }}
                    >
                      <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar 
                            sx={{ 
                              width: { xs: 48, sm: 56 }, 
                              height: { xs: 48, sm: 56 },
                              bgcolor: result.qualityColor 
                            }}
                          >
                            {result.heroName[0]}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: { xs: '1rem', sm: '1.125rem' } }}>
                              {result.heroName}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                              <Chip
                                label={result.qualityName}
                                size="small"
                                sx={{
                                  backgroundColor: result.qualityColor + '40',
                                  color: result.qualityColor,
                                  fontWeight: 'bold'
                                }}
                              />
                              {result.isNewHero && (
                                <Chip
                                  label="新武将!"
                                  size="small"
                                  icon={<Celebration />}
                                  sx={{
                                    backgroundColor: '#4caf50',
                                    color: 'white',
                                    fontWeight: 'bold'
                                  }}
                                />
                              )}
                            </Box>
                            {result.fragments > 0 && (
                              <Typography variant="caption" sx={{ color: 'gray' }}>
                                转换为碎片 +{result.fragments}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button
              onClick={() => setShowResults(false)}
              variant="contained"
              fullWidth
              sx={{ 
                fontSize: { xs: '0.9rem', sm: '1rem' },
                minHeight: { xs: 40, sm: 44 }
              }}
            >
              确定
            </Button>
          </DialogActions>
        </Dialog>
      </motion.div>
    </Container>
  );
};

export default SummonPageMUI;