/**
 * Analytics组件导出
 */

export { default as AnalyticsManager } from '../../services/analytics/AnalyticsManager';
export { AnalyticsProvider, useAnalyticsContext } from './AnalyticsProvider';
export { default as AnalyticsDashboard } from './AnalyticsDashboard';

export * from '../../hooks/useAnalytics';
export * from '../../utils/analytics';