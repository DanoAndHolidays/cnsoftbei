import { useState, useEffect, useMemo } from 'react';
import { Card, Row, Col, Statistic, Progress, Typography, Tag, Space, Avatar, List } from 'antd';
import {
  FileTextOutlined,
  FireOutlined,
  ClockCircleOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import { initialProfile, homeStats, agentStatusList } from '../data/mockData';
import type { StudentProfile, PracticeState } from '../types';
import { loadPracticeState, learningPlan as practiceLearningPlan } from '../services/practiceGrader';

const { Title, Text } = Typography;

// Same tag-to-Chinese mapping as Assessment.tsx
function tagToChinese(tag: string): string {
  const map: Record<string, string> = {
    syntax: '语法基础',
    'data-types': '数据类型',
    operators: '运算符',
    'control-flow': '流程控制',
    functions: '函数',
    modules: '模块',
    scope: '作用域',
    OOP: '面向对象',
    classes: '类与对象',
    inheritance: '继承',
    polymorphism: '多态',
    exceptions: '异常处理',
    files: '文件操作',
    decorators: '装饰器',
    comprehensions: '推导式',
    errorProne: '易错点',
    studyHabit: '学习习惯',
  };
  return map[tag] || tag;
}

const Home: React.FC = () => {
  // -------- Load real data from localStorage on mount --------
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [practiceState, setPracticeState] = useState<PracticeState | null>(null);

  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem('studentProfile');
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile) as StudentProfile);
      }
    } catch { /* ignore parse errors */ }

    const ps = loadPracticeState();
    if (ps) {
      setPracticeState(ps);
    }
  }, []);

  // -------- Resolved data (real or fallback) --------
  const resolvedProfile = profile || initialProfile;

  // -------- Derived stats --------
  const totalQuestions = practiceLearningPlan.modules.reduce(
    (sum, m) => sum + m.questionCount,
    0,
  );

  const completedQuestions = practiceState?.results.length ?? 0;

  const correctCount = practiceState
    ? practiceState.results.filter(
        (r) =>
          r.isCorrect === true ||
          (r.aiScore !== undefined && r.aiScore >= 50),
      ).length
    : 0;

  const efficiencyScore =
    completedQuestions > 0
      ? Math.round((correctCount / completedQuestions) * 100)
      : homeStats.efficiencyScore;

  const estimatedWeeks = practiceLearningPlan.modules.length * 2;

  // Try to count generated resources from page cache (sessionStorage)
  const resourcesGenerated = useMemo(() => {
    try {
      const cached = sessionStorage.getItem('page_cache_resources');
      if (cached) {
        const data = JSON.parse(cached);
        const content = data.streamingContent;
        if (content && typeof content === 'object') {
          return Object.values(content as Record<string, unknown>).filter(
            (v) => typeof v === 'string' && (v as string).length > 0,
          ).length;
        }
      }
    } catch { /* ignore */ }
    return 0;
  }, []);

  // Module with most completed questions (for "当前学习进度" card)
  const topModule = useMemo(() => {
    if (!practiceState || practiceState.results.length === 0) return null;
    const moduleCounts = new Map<string, number>();
    for (const r of practiceState.results) {
      moduleCounts.set(r.moduleId, (moduleCounts.get(r.moduleId) || 0) + 1);
    }
    let bestModuleId = '';
    let bestCount = 0;
    moduleCounts.forEach((count, mid) => {
      if (count > bestCount) {
        bestCount = count;
        bestModuleId = mid;
      }
    });
    return practiceLearningPlan.modules.find((m) => m.id === bestModuleId) || null;
  }, [practiceState]);

  // Progress percentage for the top module
  const topModuleCompleted = practiceState && topModule
    ? practiceState.results.filter((r) => r.moduleId === topModule.id).length
    : 0;
  const topModulePercent = topModule
    ? Math.round((topModuleCompleted / topModule.questionCount) * 100)
    : 0;

  // Top tag scores for the "学习效果评估" card
  const topTagScores = useMemo(() => {
    if (!practiceState || practiceState.tagScores.length === 0) return [];
    return [...practiceState.tagScores]
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);
  }, [practiceState]);

  // -------- Render --------
  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>欢迎回来，{resolvedProfile.name}</Title>
      <Text type="secondary" style={{ fontSize: 16 }}>
        专业：{resolvedProfile.major} | 年级：{resolvedProfile.grade}
      </Text>

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="已完成学习节点"
              value={completedQuestions}
              suffix={`/ ${totalQuestions}`}
              prefix={<FireOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已生成资源"
              value={resourcesGenerated}
              prefix={<FileTextOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="学习效率指数"
              value={efficiencyScore}
              suffix="分"
              prefix={<RiseOutlined style={{ color: '#faad14' }} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="预计完成时间"
              value={estimatedWeeks}
              suffix="周"
              prefix={<ClockCircleOutlined style={{ color: '#722ed1' }} />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 24 }}>
        {/* 当前学习进度 */}
        <Col span={12}>
          <Card title="当前学习进度" bordered={false}>
            {topModule && practiceState ? (
              <>
                <div style={{ marginBottom: 16 }}>
                  <Text strong>{topModule.name}</Text>
                  <br />
                  <Text type="secondary">{topModule.description}</Text>
                </div>
                <Progress percent={topModulePercent} status="active" />
                <div style={{ marginTop: 16 }}>
                  <Text type="secondary">
                    学习计划：{practiceLearningPlan.name}
                  </Text>
                </div>
              </>
            ) : (
              <>
                <div style={{ marginBottom: 16 }}>
                  <Text strong>暂无练习记录</Text>
                  <br />
                  <Text type="secondary">
                    完成一些练习后，这里将展示您的学习进度
                  </Text>
                </div>
                <Progress percent={0} />
                <div style={{ marginTop: 16 }}>
                  <Text type="secondary">
                    学习计划：{practiceLearningPlan.name}
                  </Text>
                </div>
              </>
            )}
          </Card>
        </Col>

        {/* 学习效果评估 */}
        <Col span={12}>
          <Card title="学习效果评估" bordered={false}>
            {topTagScores.length > 0 ? (
              <Space direction="vertical" style={{ width: '100%' }}>
                {topTagScores.map((item, index) => (
                  <div key={index}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: 4,
                      }}
                    >
                      <Text>{tagToChinese(item.tag)}</Text>
                      <Text strong>{item.score}分</Text>
                    </div>
                    <Progress
                      percent={item.score}
                      showInfo={false}
                      size="small"
                    />
                  </div>
                ))}
              </Space>
            ) : (
              <Text type="secondary">
                尚无练习数据，完成练习后将自动评估各项知识点掌握情况
              </Text>
            )}
          </Card>
        </Col>
      </Row>

      {/* 学习画像概览 */}
      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card
            title="学习画像概览"
            bordered={false}
            extra={
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                }}
              >
                查看详情
              </a>
            }
          >
            <Row gutter={16}>
              {resolvedProfile.dimensions.map((dim, index) => (
                <Col span={8} key={index} style={{ marginBottom: 16 }}>
                  <Card size="small" style={{ background: '#fafafa' }}>
                    <Space>
                      <Avatar
                        size="small"
                        style={{
                          background:
                            dim.level === '高'
                              ? '#52c41a'
                              : dim.level === '中'
                                ? '#1890ff'
                                : '#faad14',
                        }}
                      >
                        {dim.label[0]}
                      </Avatar>
                      <div>
                        <Text strong>{dim.label}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {dim.value}
                        </Text>
                      </div>
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>

      {/* 多智能体协作展示 */}
      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title="多智能体协作系统" bordered={false}>
            <List
              grid={{ gutter: 16, xs: 1, sm: 2, md: 5 }}
              dataSource={agentStatusList}
              renderItem={(item) => (
                <List.Item>
                  <Card
                    size="small"
                    style={{ borderTop: `3px solid ${item.color}` }}
                  >
                    <Space
                      direction="vertical"
                      style={{ width: '100%', textAlign: 'center' }}
                    >
                      <Tag color={item.color}>
                        {item.active ? '运行中' : '待激活'}
                      </Tag>
                      <Text strong style={{ fontSize: 12 }}>
                        {item.name}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {item.desc}
                      </Text>
                    </Space>
                  </Card>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Home;
