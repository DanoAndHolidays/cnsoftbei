import { useState, useRef, useEffect } from 'react';
import { Card, Typography, Tag, Space, Button, Row, Col, Steps, Progress, List, Avatar, Collapse, Modal, message } from 'antd';
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  PlayCircleOutlined,
  RobotOutlined,
  AimOutlined,
  DownOutlined,
  ReloadOutlined,
  CloseOutlined,
  LockOutlined,
} from '@ant-design/icons';
import { mockLearningPath, mockResources, smartRecommendations } from '../data/mockData';
import { streamChatCompletion } from '../services/api';
import { getAllGeneratedResources, type GeneratedResource } from '../services/resourceStorage';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { usePageCache } from '../context/PageCacheContext';
import { parseStructuredPathResponse, adoptPredefinedPath } from '../services/pathParser';
import { loadActiveStructuredPath, saveActiveStructuredPath } from '../services/activePathStorage';
import { getAllBankIds, getBank, COMPLETION_THRESHOLD } from '../services/practiceGrader';
import { allPaths } from '../services/pathRecommender';
import type { LearningPath, LearningNode, StructuredLearningNode } from '../types';

const { Title, Text } = Typography

const PAGE_KEY = 'path'

const Path: React.FC<{ onNavigate?: (key: string) => void }> = ({ onNavigate }) => {
  const { cachedState, saveState } = usePageCache(PAGE_KEY);

  const [pathData, setPathData] = useState<LearningPath>(() => {
    // 优先使用已保存的结构化路径
    const saved = loadActiveStructuredPath();
    if (saved) {
      return {
        id: saved.id,
        title: saved.title,
        description: saved.description,
        nodes: saved.nodes.map((n: StructuredLearningNode) => ({
          id: n.id,
          title: n.title,
          description: n.description,
          status: n.status,
          progress: n.progress,
          estimatedHours: n.estimatedHours,
        })),
        estimatedTime: `${Math.round(saved.nodes.reduce((sum, n) => sum + (n.estimatedHours || 8), 0) / 40)}周`,
        currentNodeId: saved.nodes[0]?.id || 'node-1',
      };
    }
    const cached = cachedState?.pathData;
    if (cached) {
      return {
        ...cached,
        nodes: cached.nodes.map((n: LearningNode) => ({
          ...n,
          status: (n.status as string) === 'pending' ? 'locked' : n.status,
        })),
      };
    }
    return mockLearningPath;
  });
  const [activeNode, setActiveNode] = useState<string>(() => cachedState?.activeNode ?? mockLearningPath.currentNodeId);
  const [isPlanning, setIsPlanning] = useState<boolean>(() => cachedState?.isPlanning ?? false);
  const [planningResult, setPlanningResult] = useState<string | null>(() => cachedState?.planningResult ?? null);
  const [currentPlanText, setCurrentPlanText] = useState<string>(() => cachedState?.currentPlanText ?? '');
  const [showSteps, setShowSteps] = useState(false);
  const [isChangingPath, setIsChangingPath] = useState(false);
  const [skipModalNode, setSkipModalNode] = useState<{ id: string; title: string } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // 已生成资源状态
  const [generatedResources, setGeneratedResources] = useState<GeneratedResource[]>(() => getAllGeneratedResources());

  // 监听资源更新事件
  useEffect(() => {
    const handler = () => setGeneratedResources(getAllGeneratedResources());
    window.addEventListener('generatedResourcesUpdated', handler);
    return () => window.removeEventListener('generatedResourcesUpdated', handler);
  }, []);

  // 监听 Practice 进度更新
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!detail || !detail.moduleId) return;
      const { moduleId, score } = detail;

      const saved = loadActiveStructuredPath();
      if (!saved) return;

      let changed = false;
      saved.nodes = saved.nodes.map(n => {
        // 匹配：节点 moduleId 与事件 moduleId 相同
        if (n.moduleId !== moduleId) return n;
        if (n.status === 'completed') return n; // 不可回退

        changed = true;
        if (score >= COMPLETION_THRESHOLD) {
          return { ...n, status: 'completed' as const, progress: 100 };
        }
        return { ...n, status: 'in-progress' as const, progress: score };
      });

      if (changed) {
        saveActiveStructuredPath(saved);
        setPathData(prev => ({
          ...prev,
          nodes: prev.nodes.map(node => {
            const updated = saved.nodes.find(n => n.id === node.id);
            return updated ? { ...node, status: updated.status, progress: updated.progress } : node;
          }),
        }));
      }
    };
    window.addEventListener('moduleProgressUpdated', handler);
    return () => window.removeEventListener('moduleProgressUpdated', handler);
  }, []);

  // 缓存状态变化
  useEffect(() => {
    saveState({ pathData, activeNode, isPlanning, planningResult, currentPlanText });
  }, [pathData, activeNode, isPlanning, planningResult, currentPlanText, saveState]);

  // 调用AI生成个性化学习路径（流式）
  const generateLearningPath = async (topic: string) => {
    setIsPlanning(true);
    setCurrentPlanText('');
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const bankList = getAllBankIds().map(bankId => {
        const bank = getBank(bankId);
        if (!bank) return '';
        return `- ${bankId}: ${bank.modules.map(m => `${m.id}:${m.name}`).join(' | ')}`;
      }).filter(Boolean).join('\n');

      const messages = [
        { role: 'system' as const, content: `你是路径规划智能体。学生会输入学习主题。

可选题库与模块清单（共 ${getAllBankIds().length} 库）：
${bankList}

任务：根据用户主题，从清单中挑选 3-6 个最相关的模块，按学习顺序排列。
（解析器接受 1-N 节点，但 3-6 是建议范围。）
每个节点必须包含合法的 questionBankId 和 moduleId。
节点标题可与模块原名相同或重写以贴合主题。
第一个节点 isEntry = true。

输出严格 JSON（仅 JSON，无其他文字）：
{
  "title": "<路径名>",
  "description": "<路径描述>",
  "nodes": [
    {
      "questionBankId": "<bankId>",
      "moduleId": "<moduleId>",
      "title": "<节点标题>",
      "description": "<节点描述>",
      "estimatedHours": <数字>,
      "isEntry": true
    },
    ...
  ]
}` },
        { role: 'user' as const, content: `请为"${topic}"生成一个完整的个性化学习路径规划` },
      ];

      let fullResponse = '';
      let hasJsonParsed = false;

      await streamChatCompletion(
        messages,
        (chunk, isThinking) => {
          if (!isThinking) {
            fullResponse += chunk;
            if (!hasJsonParsed) {
              setCurrentPlanText(prev => prev + chunk);
            }
          }
        },
        () => {
          // 思考过程处理
        },
        controller.signal,
      );

      // 调用纯函数解析并校验
      const result = parseStructuredPathResponse(fullResponse);

      if (!result.ok) {
        setPlanningResult(`路径解析失败：${result.errors.join('; ')}`);
        console.error('Path parse errors:', result.errors);
        return;
      }

      const aiPath = result.path;
      hasJsonParsed = true;

      // 写入 localStorage
      saveActiveStructuredPath(aiPath);

      // 转换为本页使用的 LearningPath（含 status 映射）
      const newNodes: LearningNode[] = aiPath.nodes.map((n) => ({
        id: n.id,
        title: n.title,
        description: n.description,
        status: n.status,
        progress: n.progress,
        estimatedHours: n.estimatedHours,
      }));

      setPathData({
        id: aiPath.id,
        title: aiPath.title,
        description: aiPath.description,
        nodes: newNodes,
        estimatedTime: `${Math.round(newNodes.reduce((sum, n) => sum + (n.estimatedHours || 8), 0) / 40)}周`,
        currentNodeId: newNodes[0]?.id || 'node-1',
      });

      setActiveNode(newNodes[0]?.id || 'node-1');
      setPlanningResult('学习路径规划完成！');
      setIsChangingPath(false);
      setShowSteps(false);
      message.success(`AI 已为您生成包含 ${aiPath.nodes.filter(n => n.valid !== false).length} 个阶段的个性化学习路径`);

    } catch (error: any) {
      if (error?.name === 'AbortError') {
        message.info('已取消路径生成');
      } else {
        console.error('Path planning failed:', error);
        message.error('路径规划失败：' + error.message);
      }
    } finally {
      setIsPlanning(false);
      abortRef.current = null;
    }
  };

  const doStartLearning = (nodeId: string) => {
    const updatedNodes = pathData.nodes.map(node => {
      if (node.id === nodeId) {
        return { ...node, status: 'in-progress' as const };
      }
      if (node.status === 'in-progress') {
        return { ...node, status: 'locked' as const };
      }
      return node;
    });
    const newPathData = { ...pathData, nodes: updatedNodes, currentNodeId: nodeId };
    setPathData(newPathData);
    setActiveNode(nodeId);
    saveState({ pathData: newPathData, activeNode: nodeId, isPlanning, planningResult, currentPlanText });
    onNavigate?.('practice');
  };

  const handleSkipConfirm = () => {
    if (skipModalNode) {
      doStartLearning(skipModalNode.id);
    }
    setSkipModalNode(null);
  };

  const handleCancel = () => {
    abortRef.current?.abort();
  };

  const handleAdoptPredefined = (predefinedId: string) => {
    const p = allPaths.find(ap => ap.id === predefinedId);
    if (!p) return;

    const adopted = adoptPredefinedPath(
      p.id,
      p.name,
      p.description,
      p.modules.map(m => ({
        questionBankId: m.questionBankId,
        moduleId: m.moduleId,
        name: m.name,
        estimatedHours: m.estimatedHours,
        isEntry: m.isEntry,
      }))
    );

    saveActiveStructuredPath(adopted);

    // 转换为 LearningPath
    const newNodes: LearningNode[] = adopted.nodes.map(n => ({
      id: n.id,
      title: n.title,
      description: n.description,
      status: n.status,
      progress: n.progress,
      estimatedHours: n.estimatedHours,
    }));

    setPathData({
      id: adopted.id,
      title: adopted.title,
      description: adopted.description,
      nodes: newNodes,
      estimatedTime: `${Math.round(newNodes.reduce((sum, n) => sum + (n.estimatedHours || 8), 0) / 40)}周`,
      currentNodeId: newNodes[0]?.id || 'node-1',
    });
    setActiveNode(newNodes[0]?.id || 'node-1');
    setPlanningResult('已采用推荐路径');
    setIsChangingPath(false);
    setShowSteps(false);
    message.success(`已采用「${p.name}」`);
  };

  const handleGenerate = () => {
    const value = inputRef.current?.value || '';
    if (value.trim()) {
      generateLearningPath(value);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'in-progress':
        return <PlayCircleOutlined style={{ color: '#1890ff' }} />;
      case 'locked':
        return <LockOutlined style={{ color: '#d9d9d9' }} />;
      default:
        return <ClockCircleOutlined style={{ color: '#d9d9d9' }} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#52c41a';
      case 'in-progress':
        return '#1890ff';
      case 'locked':
        return '#d9d9d9';
      default:
        return '#d9d9d9';
    }
  };

  const SUGGESTED_TOPICS = ['Python', 'Java', '机器学习', '数据结构与算法', '前端开发'];

  const renderTopicInput = (placeholder: string, btnText: string, recLabel: string, disableInput: boolean) => (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Space.Compact style={{ width: '100%' }}>
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          style={{
            flex: 1,
            padding: '8px 12px',
            border: '1px solid #d9d9d9',
            borderRadius: '6px',
            outline: 'none',
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !isPlanning) {
              handleGenerate();
            }
          }}
          disabled={isPlanning || disableInput}
        />
        {isPlanning ? (
          <Button danger icon={<CloseOutlined />} onClick={handleCancel}>取消</Button>
        ) : (
          <Button type="primary" icon={<RobotOutlined />} onClick={handleGenerate}>{btnText}</Button>
        )}
      </Space.Compact>
      <div style={{ marginTop: 4 }}>
        <Text type="secondary" style={{ fontSize: 12 }}>{recLabel}</Text>
        {SUGGESTED_TOPICS.map(t => (
          <Button key={t} type="link" size="small" style={{ padding: '0 4px' }} onClick={() => generateLearningPath(t)} disabled={isPlanning}>{t}</Button>
        ))}
      </div>
      {isPlanning && (
        <Card size="small" style={{ background: '#f5f5f5', marginTop: 8 }}>
          <Text type="secondary">正在规划：</Text>
          <div style={{ maxHeight: 200, overflow: 'auto', fontSize: 12, marginTop: 8 }}>
            {currentPlanText ? (
              <MarkdownRenderer content={currentPlanText} />
            ) : (
              <Text type="secondary">AI 正在思考中...</Text>
            )}
            <span style={{ animation: 'blink 1s infinite' }}>|</span>
          </div>
        </Card>
      )}
    </Space>
  );

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>个性化学习路径</Title>
      <Text type="secondary">基于您的学习画像和目标，智能规划学习步骤与顺序</Text>

      {/* AI路径规划入口 */}
      {planningResult && !isPlanning && !isChangingPath ? (
        <Card style={{ marginTop: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space>
              <Avatar icon={<AimOutlined />} style={{ background: '#faad14' }} />
              <div>
                <Text strong>{pathData.title}</Text>
                <Tag color="success" icon={<CheckCircleOutlined />} style={{ marginLeft: 8 }}>已规划</Tag>
              </div>
            </Space>
            <Space>
              <Button
                icon={<DownOutlined rotate={showSteps ? 180 : 0} />}
                onClick={() => setShowSteps(!showSteps)}
              >
                {showSteps ? '隐藏学习步骤' : '查看学习步骤'}
              </Button>
              <Button icon={<ReloadOutlined />} onClick={() => setIsChangingPath(true)}>
                更换学习路径
              </Button>
            </Space>
          </div>
        </Card>
      ) : planningResult && !isPlanning && isChangingPath ? (
        <Card style={{ marginTop: 24, borderColor: '#1890ff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Space>
              <Avatar icon={<AimOutlined />} style={{ background: '#faad14' }} />
              <div>
                <Text strong>{pathData.title}</Text>
                <Tag color="success" icon={<CheckCircleOutlined />} style={{ marginLeft: 8 }}>已规划</Tag>
              </div>
            </Space>
            <Button icon={<CloseOutlined />} onClick={() => setIsChangingPath(false)}>取消更换</Button>
          </div>
          <Text strong style={{ display: 'block', marginBottom: 8 }}>输入新学习主题，生成新路径：</Text>
          {renderTopicInput('输入新主题，如：机器学习、数据结构...', '生成新路径', '快速推荐：', false)}
        </Card>
      ) : (
        <Card style={{ marginTop: 24 }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Space>
              <Avatar icon={<AimOutlined />} style={{ background: '#faad14' }} />
              <div>
                <Text strong>AI智能路径规划</Text>
                <br />
                <Text type="secondary">基于您的学习画像，自动生成最优学习路径</Text>
              </div>
            </Space>
            {renderTopicInput('输入您想学习的主题，如：Python面向对象编程、机器学习...', '生成路径', '推荐学习：', false)}
          </Space>
        </Card>
      )}

      {/* 路径概览 */}
      <Card style={{ marginTop: 24 }}>
        <Row gutter={24}>
          <Col span={16}>
            <Space direction="vertical">
              <Title level={4} style={{ marginBottom: 0 }}>{pathData.title}</Title>
              <Text type="secondary">{pathData.description}</Text>
            </Space>
          </Col>
          <Col span={8}>
            <Row gutter={16}>
              <Col span={12}>
                <Text type="secondary">预计完成时间</Text>
                <br />
                <Text strong style={{ fontSize: 18 }}>{pathData.estimatedTime}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">当前进度</Text>
                <br />
                <Text strong style={{ fontSize: 18 }}>
                  {Math.round((pathData.nodes.filter(n => n.status === 'completed').length / pathData.nodes.length) * 100)}%
                </Text>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      {/* 推荐学习路径（预定义） */}
      <Card title="推荐学习路径" style={{ marginTop: 24 }}>
        <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
          基于专家经验预制的 12 条结构化路径，每条都对应练习中心的具体题库模块
        </Text>
        <Row gutter={[16, 16]}>
          {allPaths.map(p => {
            const moduleCount = p.modules.length;
            const isCurrent = pathData.id.startsWith(`adopted-${p.id}`);
            return (
              <Col span={6} key={p.id}>
                <Card
                  size="small"
                  hoverable
                  style={{
                    borderColor: isCurrent ? '#1890ff' : undefined,
                    borderWidth: isCurrent ? 2 : 1,
                  }}
                >
                  <Text strong style={{ display: 'block', marginBottom: 4 }}>{p.name}</Text>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
                    {p.description}
                  </Text>
                  <Space size={4} wrap style={{ marginBottom: 8 }}>
                    {p.tags.slice(0, 3).map(t => (
                      <Tag key={t} color="blue" style={{ fontSize: 11 }}>{t}</Tag>
                    ))}
                  </Space>
                  <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
                    共 {moduleCount} 个模块 · {p.modules.reduce((s, m) => s + (m.estimatedHours || 8), 0)}小时
                  </div>
                  <Button
                    type={isCurrent ? 'primary' : 'default'}
                    size="small"
                    block
                    onClick={() => handleAdoptPredefined(p.id)}
                  >
                    {isCurrent ? '当前采用' : '采用此路径'}
                  </Button>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Card>

      {/* 学习步骤可视化 */}
      {(!planningResult || showSteps) && (
        <Card title="学习步骤" style={{ marginTop: 24 }}>
          <Steps
            current={pathData.nodes.findIndex(n => n.id === pathData.currentNodeId)}
            items={pathData.nodes.map(node => ({
              title: node.title,
              description: node.status === 'in-progress' ? `进行中 - ${node.progress}%` : node.status === 'completed' ? '已完成' : '未解锁',
              icon: getStatusIcon(node.status),
            }))}
          />
        </Card>
      )}

      {/* 学习节点详情 */}
      <Row gutter={24} style={{ marginTop: 24 }}>
        <Col span={16}>
          <Card title="学习内容">
            <Collapse
              accordion
              activeKey={activeNode}
              onChange={(keys) => setActiveNode(keys.length > 0 ? keys[0] : '')}
            >
              {/* {pathData.nodes.map((node) => (
                // <Panel
                //   key={node.id}
                //   header={
                //     <Space>
                //       {getStatusIcon(node.status)}
                //       <Text strong>{node.title}</Text>
                //       {node.status === 'in-progress' && (
                //         <Tag color="blue">进行中</Tag>
                //       )}
                //       {node.status === 'completed' && (
                //         <Tag color="success">已完成</Tag>
                //       )}
                //       {node.status === 'locked' && (
                //         <Tag color="default">未解锁</Tag>
                //       )}
                //     </Space>
                //   }
                //   extra={
                //     node.status === 'locked' ? (
                //       <Button size="small" icon={<LockOutlined />} onClick={() => handleStartLearning(node.id)}>
                //         开始学习
                //       </Button>
                //     ) : node.status === 'in-progress' ? (
                //       <Button size="small" icon={<PlayCircleOutlined />} onClick={() => onNavigate?.('practice')}>
                //         继续学习
                //       </Button>
                //     ) : (
                //       <Button size="small" icon={<EyeOutlined />} onClick={() => onNavigate?.('practice')}>
                //         查看回顾
                //       </Button>
                //     )
                //   }
                // >
                //   {node.status === 'in-progress' && (
                //     <Progress percent={node.progress} status="active" style={{ marginBottom: 16 }} />
                //   )}
                //   <Text type="secondary">{node.description}</Text>
                //   {node.estimatedHours && (
                //     <div style={{ marginTop: 8 }}>
                //       <Tag icon={<ClockCircleOutlined />}>预估时长：{node.estimatedHours}小时</Tag>
                //     </div>
                //   )}
                // </Panel>
              ))} */}
            </Collapse>
          </Card>
        </Col>

        {/* 右侧：路径统计 */}
        <Col span={8}>
          <Card title="路径统计">
            <Space direction="vertical" style={{ width: '100%' }}>
              {pathData.nodes.map(node => (
                <div key={node.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Space>
                      {getStatusIcon(node.status)}
                      <Text style={{ color: node.status === 'locked' ? '#999' : '#000' }}>{node.title}</Text>
                    </Space>
                    <Text type="secondary">{node.progress}%</Text>
                  </div>
                  <Progress
                    percent={node.progress}
                    showInfo={false}
                    size="small"
                    strokeColor={getStatusColor(node.status)}
                    style={{ marginTop: 4, marginBottom: 12 }}
                  />
                </div>
              ))}
            </Space>
          </Card>

          <Card title="智能推荐" style={{ marginTop: 16 }}>
            <List
              size="small"
              dataSource={smartRecommendations}
              renderItem={item => (
                <List.Item>
                  <Space direction="vertical" size="small">
                    <Text>{item.title}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>{item.reason}</Text>
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* 资源推送预览 */}
      <Card title="个性化资源推送" style={{ marginTop: 24 }}>
        <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
          基于您的学习进度和画像，系统为您智能推送以下资源
        </Text>
        <Row gutter={16}>
          {(generatedResources.length > 0 ? generatedResources.slice(0, 4) : mockResources.slice(0, 4)).map((resource, idx) => (
            <Col span={6} key={resource.id || idx}>
              <Card size="small" hoverable>
                <Card.Meta
                  avatar={
                    <Avatar shape="square" style={{ background: '#722ed1' }}>
                      {(resource as any).type?.[0]?.toUpperCase() || 'R'}
                    </Avatar>
                  }
                  title={<Text style={{ fontSize: 12 }} ellipsis={{ tooltip: false }}>{(resource as any).topic || (resource as any).title}</Text>}
                  description={<Tag color="purple">{generatedResources.length > 0 ? '已生成' : '推荐'}</Tag>}
                />
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* 跳过确认弹窗 */}
      <Modal
        title="切换学习阶段"
        open={skipModalNode !== null}
        onOk={handleSkipConfirm}
        onCancel={() => setSkipModalNode(null)}
        okText="确认进入"
        cancelText="取消"
      >
        <p>你尚未完成前面阶段的学习，直接学习 <strong>{skipModalNode?.title}</strong> 可能会因基础不足影响学习效果。</p>
        <p>确定要进入该阶段吗？</p>
      </Modal>

      {/* 添加闪烁动画样式 */}
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default Path;
