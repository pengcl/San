/**
 * Analytics Dashboard
 * 开发环境下的分析数据查看面板
 */

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Button, Table, Tag, Timeline, Tabs } from 'antd';
import type { TabsProps } from 'antd';
import { 
  BarChartOutlined, 
  BugOutlined, 
  ClockCircleOutlined, 
  UserOutlined,
  ReloadOutlined,
  ClearOutlined,
  DownloadOutlined 
} from '@ant-design/icons';
import { useAnalyticsContext } from './AnalyticsProvider';

const AnalyticsDashboard: React.FC = () => {
  const { analytics, sessionInfo, queueStatus, flush, clear } = useAnalyticsContext();
  const [events, setEvents] = useState<any[]>([]);
  const [performance, setPerformance] = useState<any[]>([]);
  const [errors, setErrors] = useState<any[]>([]);

  // 模拟获取数据（实际应用中应该从analytics服务获取）
  useEffect(() => {
    const updateData = () => {
      // 这里应该从AnalyticsManager获取实际数据
      // 由于当前实现中数据在队列中，我们模拟一些数据用于展示
      setEvents([
        {
          id: '1',
          type: 'pageview',
          name: 'page_view',
          timestamp: Date.now() - 60000,
          properties: { page: 'Dashboard' }
        },
        {
          id: '2',
          type: 'click',
          name: 'button_click',
          timestamp: Date.now() - 30000,
          properties: { element: 'login-button' }
        }
      ]);

      setPerformance([
        {
          name: 'LCP',
          value: 1234,
          unit: 'ms',
          timestamp: Date.now() - 120000
        },
        {
          name: 'FID',
          value: 56,
          unit: 'ms',
          timestamp: Date.now() - 90000
        }
      ]);

      setErrors([
        {
          message: 'Network request failed',
          severity: 'medium',
          timestamp: Date.now() - 180000
        }
      ]);
    };

    updateData();
    const interval = setInterval(updateData, 10000);
    return () => clearInterval(interval);
  }, []);

  const eventColumns = [
    {
      title: '事件类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={type === 'pageview' ? 'blue' : type === 'click' ? 'green' : 'orange'}>
          {type}
        </Tag>
      ),
    },
    {
      title: '事件名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp: number) => new Date(timestamp).toLocaleTimeString(),
    },
    {
      title: '属性',
      dataIndex: 'properties',
      key: 'properties',
      render: (properties: any) => JSON.stringify(properties),
    },
  ];

  const performanceColumns = [
    {
      title: '指标名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '数值',
      dataIndex: 'value',
      key: 'value',
    },
    {
      title: '单位',
      dataIndex: 'unit',
      key: 'unit',
    },
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp: number) => new Date(timestamp).toLocaleTimeString(),
    },
  ];

  const errorColumns = [
    {
      title: '错误消息',
      dataIndex: 'message',
      key: 'message',
    },
    {
      title: '严重程度',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity: string) => (
        <Tag color={
          severity === 'critical' ? 'red' :
          severity === 'high' ? 'orange' :
          severity === 'medium' ? 'yellow' : 'green'
        }>
          {severity}
        </Tag>
      ),
    },
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp: number) => new Date(timestamp).toLocaleTimeString(),
    },
  ];

  const handleExportData = () => {
    const data = {
      session: sessionInfo,
      queue: queueStatus,
      events,
      performance,
      errors,
      exportTime: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-data-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const tabItems: TabsProps['items'] = [
    {
      key: 'overview',
      label: '总览',
      children: (
        <div>
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={6}>
              <Card>
                <Statistic
                  title="会话时长"
                  value={Math.round(sessionInfo.duration / 1000)}
                  suffix="秒"
                  prefix={<ClockCircleOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="事件队列"
                  value={queueStatus.events}
                  prefix={<BarChartOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="性能指标"
                  value={queueStatus.performance}
                  prefix={<BarChartOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="错误数量"
                  value={queueStatus.errors}
                  prefix={<BugOutlined />}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Card title="会话信息" extra={<UserOutlined />}>
                <p><strong>会话ID:</strong> {sessionInfo.sessionId}</p>
                <p><strong>用户ID:</strong> {sessionInfo.userId || '未设置'}</p>
                <p><strong>事件数量:</strong> {sessionInfo.events}</p>
                <p><strong>持续时间:</strong> {Math.round(sessionInfo.duration / 1000)}秒</p>
              </Card>
            </Col>
            <Col span={12}>
              <Card title="操作" extra={<ReloadOutlined />}>
                <div style={{ display: 'flex', gap: 8, flexDirection: 'column' }}>
                  <Button type="primary" onClick={flush} icon={<ReloadOutlined />}>
                    刷新队列
                  </Button>
                  <Button onClick={clear} icon={<ClearOutlined />}>
                    清空队列
                  </Button>
                  <Button onClick={handleExportData} icon={<DownloadOutlined />}>
                    导出数据
                  </Button>
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      ),
    },
    {
      key: 'events',
      label: '事件追踪',
      children: (
        <Card title="事件列表">
          <Table
            columns={eventColumns}
            dataSource={events}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            size="small"
          />
        </Card>
      ),
    },
    {
      key: 'performance',
      label: '性能监控',
      children: (
        <Card title="性能指标">
          <Table
            columns={performanceColumns}
            dataSource={performance}
            rowKey="name"
            pagination={{ pageSize: 10 }}
            size="small"
          />
        </Card>
      ),
    },
    {
      key: 'errors',
      label: '错误追踪',
      children: (
        <Card title="错误列表">
          <Table
            columns={errorColumns}
            dataSource={errors}
            rowKey={(record, index) => `${record.timestamp}-${index}`}
            pagination={{ pageSize: 10 }}
            size="small"
          />
        </Card>
      ),
    },
    {
      key: 'timeline',
      label: '时间线',
      children: (
        <Card title="活动时间线">
          <Timeline
            items={[
              ...events.map(event => ({
                color: 'blue',
                children: `${new Date(event.timestamp).toLocaleTimeString()} - ${event.name}`,
              })),
              ...performance.map(perf => ({
                color: 'green',
                children: `${new Date(perf.timestamp).toLocaleTimeString()} - ${perf.name}: ${perf.value}${perf.unit}`,
              })),
              ...errors.map(error => ({
                color: 'red',
                children: `${new Date(error.timestamp).toLocaleTimeString()} - 错误: ${error.message}`,
              })),
            ].sort((a, b) => b.children.localeCompare(a.children))}
          />
        </Card>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      <Card 
        title="分析数据面板" 
        extra={<Tag color="blue">开发模式</Tag>}
        style={{ marginBottom: 16 }}
      >
        <Tabs items={tabItems} />
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;