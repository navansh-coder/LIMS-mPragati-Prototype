import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Progress, Typography } from 'antd';
import { UserOutlined, FileOutlined,  CheckCircleOutlined } from '@ant-design/icons';

const { Title } = Typography;

interface DashboardMetrics {
    totalUsers: number;
    activeUsers: number;
    totalSamples: number;
    processedSamples: number;
    pendingSamples: number;
    testsCompleted: number;
    averageProcessTime: number;
}

const Dashboard: React.FC = () => {
    const [metrics, setMetrics] = useState<DashboardMetrics>({
        totalUsers: 0,
        activeUsers: 0,
        totalSamples: 0,
        processedSamples: 0,
        pendingSamples: 0,
        testsCompleted: 0,
        averageProcessTime: 0
    });
    
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulating data fetch - replace with actual API call
        setTimeout(() => {
            setMetrics({
                totalUsers: 155,
                activeUsers: 78,
                totalSamples: 1240,
                processedSamples: 985,
                pendingSamples: 255,
                testsCompleted: 2450,
                averageProcessTime: 24
            });
            setLoading(false);
        }, 1000);
    }, []);

    return (
        <div style={{ padding: '24px' }}>
            <Title level={2}>Laboratory Dashboard</Title>
            
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={6}>
                    <Card loading={loading}>
                        <Statistic
                            title="Total Users"
                            value={metrics.totalUsers}
                            prefix={<UserOutlined />}
                        />
                        <div style={{ marginTop: 10 }}>
                            <span>Active: {metrics.activeUsers}</span>
                            <Progress percent={Math.round((metrics.activeUsers / metrics.totalUsers) * 100)} />
                        </div>
                    </Card>
                </Col>
                
                <Col xs={24} sm={12} md={6}>
                    <Card loading={loading}>
                        <Statistic
                            title="Total Samples"
                            value={metrics.totalSamples}
                            prefix={<FileOutlined />}
                        />
                        <div style={{ marginTop: 10 }}>
                            <span>Processed: {metrics.processedSamples}</span>
                            <Progress 
                                percent={Math.round((metrics.processedSamples / metrics.totalSamples) * 100)} 
                                status="active" 
                            />
                        </div>
                    </Card>
                </Col>
                
                <Col xs={24} sm={12} md={6}>
                    <Card loading={loading}>
                        <Statistic
                            title="Pending Samples"
                            value={metrics.pendingSamples}
                            valueStyle={{ color: metrics.pendingSamples > 300 ? '#cf1322' : '#3f8600' }}
                        />
                        <div style={{ marginTop: 10 }}>
                            <Progress 
                                percent={Math.round((metrics.pendingSamples / metrics.totalSamples) * 100)} 
                                status={metrics.pendingSamples > 300 ? "exception" : "normal"} 
                            />
                        </div>
                    </Card>
                </Col>
                
                <Col xs={24} sm={12} md={6}>
                    <Card loading={loading}>
                        <Statistic
                            title="Tests Completed"
                            value={metrics.testsCompleted}
                            prefix={<CheckCircleOutlined />}
                        />
                        <div style={{ marginTop: 10 }}>
                            <span>Avg. Process Time: {metrics.averageProcessTime} hrs</span>
                            <Progress 
                                percent={100 - Math.min(100, metrics.averageProcessTime / 48 * 100)} 
                                status="active" 
                            />
                        </div>
                    </Card>
                </Col>
            </Row>
            
            {/* Additional dashboard components can be added here */}
            <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
                <Col span={24}>
                    <Card loading={loading} title="Recent Activity">
                        <p>Recent activity data would be displayed here</p>
                        {/* Add a table or list of recent activities */}
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;