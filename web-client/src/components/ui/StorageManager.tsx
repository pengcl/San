import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useStorageState, useAppSettings } from '../../hooks/useStorage';
import { storageUtils } from '../../utils/storage';
import ModalDialog from './ModalDialog';
// import GameButton from '../game/GameButton';

interface StorageManagerProps {
  open: boolean;
  onClose: () => void;
}

export const StorageManager: React.FC<StorageManagerProps> = ({
  open,
  onClose,
}) => {
  const { usage, updateUsage, clearUserData, clearCache, isLowSpace } =
    useStorageState();
  const { settings } = useAppSettings();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<
    'clearUser' | 'clearAll' | null
  >(null);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);

  // 格式化字节大小
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 获取使用百分比
  const getUsagePercent = (): number => {
    return (usage.used / usage.total) * 100;
  };

  // 获取状态颜色
  const getStatusColor = (): string => {
    const percent = getUsagePercent();
    if (percent > 90) return 'text-red-400';
    if (percent > 70) return 'text-yellow-400';
    return 'text-green-400';
  };

  // 清理缓存
  const handleClearCache = useCallback(async () => {
    try {
      const cleared = storageUtils.cleanup();
      clearCache();
      updateUsage();
      console.log(`Cleared ${cleared} cache items`);
    } catch (error) {
      console.error('Clear cache error:', error);
    }
  }, [clearCache, updateUsage]);

  // 清理用户数据
  const handleClearUserData = useCallback(() => {
    setConfirmAction('clearUser');
    setShowConfirmDialog(true);
  }, []);

  // 清理所有数据
  const handleClearAllData = useCallback(() => {
    setConfirmAction('clearAll');
    setShowConfirmDialog(true);
  }, []);

  // 确认清理
  const handleConfirmClear = useCallback(async () => {
    try {
      if (confirmAction === 'clearUser') {
        clearUserData();
      } else if (confirmAction === 'clearAll') {
        clearUserData();
        clearCache();
        // 清理所有本地存储
        localStorage.clear();
      }
      updateUsage();
      setShowConfirmDialog(false);
      setConfirmAction(null);
    } catch (error) {
      console.error('Clear data error:', error);
    }
  }, [confirmAction, clearUserData, clearCache, updateUsage]);

  // 导出数据
  const handleExportData = useCallback(async () => {
    try {
      setExporting(true);
      const data = storageUtils.exportData();

      // 创建下载链接
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `three-kingdoms-backup-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export data error:', error);
    } finally {
      setExporting(false);
    }
  }, []);

  // 导入数据
  const handleImportData = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      try {
        setImporting(true);
        const text = await file.text();
        const success = storageUtils.importData(text);

        if (success) {
          updateUsage();
          console.log('Data imported successfully');
        } else {
          console.error('Import failed');
        }
      } catch (error) {
        console.error('Import data error:', error);
      } finally {
        setImporting(false);
        // 重置input
        event.target.value = '';
      }
    },
    [updateUsage]
  );

  const usagePercent = getUsagePercent();

  return (
    <>
      <ModalDialog
        open={open}
        onClose={onClose}
        title='存储管理'
        subtitle='管理游戏数据和缓存'
        size='lg'
        variant='game'
      >
        <div className='space-y-6'>
          {/* 存储使用情况 */}
          <div className='bg-slate-800/50 rounded-lg p-4'>
            <h3 className='text-lg font-bold text-white mb-4'>存储使用情况</h3>

            {/* 使用进度条 */}
            <div className='mb-4'>
              <div className='flex justify-between items-center mb-2'>
                <span className='text-sm text-slate-300'>已使用空间</span>
                <span className={`text-sm font-medium ${getStatusColor()}`}>
                  {usagePercent.toFixed(1)}%
                </span>
              </div>

              <div className='w-full bg-slate-700 rounded-full h-3'>
                <motion.div
                  className={`h-3 rounded-full ${
                    usagePercent > 90
                      ? 'bg-red-500'
                      : usagePercent > 70
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${usagePercent}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
            </div>

            {/* 详细信息 */}
            <div className='grid grid-cols-3 gap-4 text-center'>
              <div className='bg-slate-700/50 rounded-lg p-3'>
                <div className='text-sm text-slate-400'>已使用</div>
                <div className='text-lg font-bold text-white'>
                  {formatBytes(usage.used)}
                </div>
              </div>

              <div className='bg-slate-700/50 rounded-lg p-3'>
                <div className='text-sm text-slate-400'>可用</div>
                <div className='text-lg font-bold text-white'>
                  {formatBytes(usage.available)}
                </div>
              </div>

              <div className='bg-slate-700/50 rounded-lg p-3'>
                <div className='text-sm text-slate-400'>总计</div>
                <div className='text-lg font-bold text-white'>
                  {formatBytes(usage.total)}
                </div>
              </div>
            </div>

            {/* 低空间警告 */}
            {isLowSpace && (
              <motion.div
                className='mt-4 p-3 bg-red-500/20 border border-red-400 rounded-lg'
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className='flex items-center space-x-2'>
                  <svg
                    className='w-5 h-5 text-red-400'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z'
                    />
                  </svg>
                  <span className='text-red-400 text-sm font-medium'>
                    存储空间不足，建议清理数据
                  </span>
                </div>
              </motion.div>
            )}
          </div>

          {/* 清理选项 */}
          <div className='bg-slate-800/50 rounded-lg p-4'>
            <h3 className='text-lg font-bold text-white mb-4'>清理选项</h3>

            <div className='space-y-3'>
              <div className='flex justify-between items-center'>
                <div>
                  <div className='text-white font-medium'>清理缓存</div>
                  <div className='text-sm text-slate-400'>
                    清理过期的API缓存和临时数据
                  </div>
                </div>
                <button
                  className='px-3 py-1 bg-slate-600 hover:bg-slate-500 text-white rounded text-sm transition-colors'
                  onClick={handleClearCache}
                >
                  清理
                </button>
              </div>

              <div className='flex justify-between items-center'>
                <div>
                  <div className='text-white font-medium'>清理用户数据</div>
                  <div className='text-sm text-slate-400'>
                    清理游戏进度，保留应用设置
                  </div>
                </div>
                <button
                  className='px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm transition-colors'
                  onClick={handleClearUserData}
                >
                  清理
                </button>
              </div>

              <div className='flex justify-between items-center'>
                <div>
                  <div className='text-white font-medium'>清理所有数据</div>
                  <div className='text-sm text-slate-400'>
                    清理所有数据，包括设置和缓存
                  </div>
                </div>
                <button
                  className='px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm transition-colors'
                  onClick={handleClearAllData}
                >
                  全部清理
                </button>
              </div>
            </div>
          </div>

          {/* 数据备份 */}
          <div className='bg-slate-800/50 rounded-lg p-4'>
            <h3 className='text-lg font-bold text-white mb-4'>数据备份</h3>

            <div className='space-y-3'>
              <div className='flex justify-between items-center'>
                <div>
                  <div className='text-white font-medium'>导出数据</div>
                  <div className='text-sm text-slate-400'>
                    将游戏数据导出为JSON文件
                  </div>
                </div>
                <button
                  className='px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded text-sm transition-colors disabled:opacity-50'
                  onClick={handleExportData}
                  disabled={exporting}
                >
                  {exporting ? '导出中...' : '导出'}
                </button>
              </div>

              <div className='flex justify-between items-center'>
                <div>
                  <div className='text-white font-medium'>导入数据</div>
                  <div className='text-sm text-slate-400'>
                    从备份文件恢复游戏数据
                  </div>
                </div>
                <div className='relative'>
                  <input
                    type='file'
                    accept='.json'
                    onChange={handleImportData}
                    className='absolute inset-0 opacity-0 cursor-pointer'
                    disabled={importing}
                  />
                  <button
                    className='px-3 py-1 bg-slate-600 hover:bg-slate-500 text-white rounded text-sm transition-colors disabled:opacity-50'
                    disabled={importing}
                  >
                    {importing ? '导入中...' : '选择文件'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 应用设置摘要 */}
          {settings && (
            <div className='bg-slate-800/50 rounded-lg p-4'>
              <h3 className='text-lg font-bold text-white mb-4'>当前设置</h3>

              <div className='grid grid-cols-2 gap-4 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-slate-400'>主题:</span>
                  <span className='text-white'>
                    {settings.theme === 'dark' ? '深色' : '浅色'}
                  </span>
                </div>

                <div className='flex justify-between'>
                  <span className='text-slate-400'>语言:</span>
                  <span className='text-white'>{settings.language}</span>
                </div>

                <div className='flex justify-between'>
                  <span className='text-slate-400'>音效:</span>
                  <span className='text-white'>
                    {settings.soundEnabled ? '开启' : '关闭'}
                  </span>
                </div>

                <div className='flex justify-between'>
                  <span className='text-slate-400'>自动保存:</span>
                  <span className='text-white'>
                    {settings.autoSave ? '开启' : '关闭'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ModalDialog>

      {/* 确认对话框 */}
      <ModalDialog
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        title='确认清理'
        variant='game'
        size='sm'
        onConfirm={handleConfirmClear}
        onCancel={() => setShowConfirmDialog(false)}
        confirmText='确认清理'
        cancelText='取消'
      >
        <div className='text-center py-4'>
          <div className='w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4'>
            <svg
              className='w-8 h-8 text-red-400'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z'
              />
            </svg>
          </div>

          <p className='text-white text-lg font-medium mb-2'>
            {confirmAction === 'clearUser' ? '清理用户数据' : '清理所有数据'}
          </p>

          <p className='text-slate-400 text-sm'>
            {confirmAction === 'clearUser'
              ? '这将删除您的游戏进度，但保留应用设置。此操作无法撤销。'
              : '这将删除所有数据，包括游戏进度和应用设置。此操作无法撤销。'}
          </p>
        </div>
      </ModalDialog>
    </>
  );
};

export default StorageManager;
