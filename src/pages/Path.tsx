import React, { useState, useEffect } from 'react'
import {
    Card,
    Typography,
    Tag,
    Space,
    Button,
    Row,
    Col,
    Progress,
    List,
    Avatar,
    message,
    Tooltip,
} from 'antd'
import {
    ClockCircleOutlined,
    RobotOutlined,
    PlayCircleOutlined,
    AimOutlined,
} from '@ant-design/icons'
import {
    getRecommendedPaths,
    getAIRecommendation,
    getProfileSummary,
} from '../services/pathRecommender'
import {
    setActivePath,
    setActiveBank,
    getActivePath,
} from '../services/practiceGrader'
import type { StructuredLearningPath, PathModule } from '../types'
import { usePageCache } from '../context/PageCacheContext'

const { Title, Text, Paragraph } = Typography

const PAGE_KEY = 'path'

const PathPage: React.FC = () => {
    const { cachedState, saveState } = usePageCache(PAGE_KEY)

    const [paths, setPaths] = useState<
        { path: StructuredLearningPath; score: number; isBest: boolean }[]
    >(() => cachedState?.paths)
    const [aiReason, setAiReason] = useState<string>(
        () => cachedState?.aiReason ?? '',
    )
    const [aiLoading, setAiLoading] = useState(false)
    const [aiPathId, setAiPathId] = useState<string>(
        () => cachedState?.aiPathId ?? '',
    )
    const [activePathId, setActivePathId] = useState<string>(
        () => cachedState?.activePathId ?? getActivePath() ?? '',
    )
    const [profile, setProfile] = useState(() => getProfileSummary())

    // 初始化路径评分
    useEffect(() => {
        const scored = getRecommendedPaths()
        setPaths(scored)
        setProfile(getProfileSummary())
    }, [])

    useEffect(() => {
        if (paths) saveState({ paths, aiReason, aiPathId, activePathId })
    }, [paths, aiReason, aiPathId, activePathId, saveState])

    // 同步活跃路径
    useEffect(() => {
        setActivePathId(getActivePath() ?? '')
    }, [])

    // AI 智能推荐
    const handleAIRecommend = async () => {
        setAiLoading(true)
        setAiReason('')

        try {
            const result = await getAIRecommendation((text) => {
                setAiReason((prev) => prev + text)
            })

            if (result) {
                setAiPathId(result.recommendedPathId)
                message.success('AI 推荐完成！')
            }
        } catch {
            message.error('AI 推荐失败，请重试')
        } finally {
            setAiLoading(false)
        }
    }

    // 开始学习某条路径
    const handleStartPath = (path: StructuredLearningPath) => {
        setActivePath(path.id)
        setActivePathId(path.id)
        // 从第一个模块获取 questionBankId
        const firstModule = path.modules[0]
        if (firstModule) {
            setActiveBank(firstModule.questionBankId)
        }
        message.success(`已选择路径：${path.name}，前往练习中心开始学习`)
        // 通知导航
        window.dispatchEvent(new CustomEvent('navigateToPractice'))
    }

    // 计算路径进度
    const getPathProgress = (path: StructuredLearningPath) => {
        const activePathId = localStorage.getItem('activeLearningPath')
        if (activePathId !== path.id) return 0
        // 这里可以从 localStorage 读取该路径的模块进度
        return 0 // 简化：开始前进度为 0
    }

    // 计算路径总时长
    const getPathHours = (path: StructuredLearningPath) =>
        path.modules.reduce((sum, m) => sum + (m.estimatedHours || 8), 0)

    const hasProfile = profile.dimensions && profile.dimensions.length > 0

    return (
        <div style={{ padding: 24 }}>
            <Title level={2}>个性化学习路径</Title>
            <Text type="secondary">
                基于学习画像，智能推荐最适合你的学习路径
            </Text>

            {/* 头像信息 */}
            {hasProfile && (
                <Card style={{ marginTop: 24 }}>
                    <Row align="middle">
                        <Col span={2}>
                            <Avatar size={64} style={{ background: '#1890ff' }}>
                                {(profile.name || '?')[0]}
                            </Avatar>
                        </Col>
                        <Col span={14}>
                            <Text strong style={{ fontSize: 18 }}>
                                {profile.name}
                            </Text>
                            <br />
                            <Text type="secondary">
                                {profile.major} | {profile.grade}
                            </Text>
                            <br />
                            <Space style={{ marginTop: 8 }}>
                                {profile.dimensions
                                    ?.slice(0, 3)
                                    .map((d: any) => (
                                        <Tag
                                            key={d.key}
                                            color={
                                                d.level === '高'
                                                    ? 'success'
                                                    : d.level === '中'
                                                      ? 'processing'
                                                      : 'warning'
                                            }
                                        >
                                            {d.label}: {d.level}
                                        </Tag>
                                    ))}
                            </Space>
                        </Col>
                        <Col span={8} style={{ textAlign: 'right' }}>
                            <Button
                                type="primary"
                                icon={<RobotOutlined />}
                                loading={aiLoading}
                                onClick={handleAIRecommend}
                                size="large"
                            >
                                {aiLoading ? 'AI 分析中...' : 'AI 智能推荐'}
                            </Button>
                            <div style={{ marginTop: 4 }}>
                                <Text type="secondary" style={{ fontSize: 11 }}>
                                    让 AI 根据你的画像推荐最佳学习路径
                                </Text>
                            </div>
                        </Col>
                    </Row>
                </Card>
            )}

            {/* AI 推荐结果 */}
            {aiReason && (
                <Card
                    size="small"
                    style={{
                        marginTop: 16,
                        background: '#e6f7ff',
                        border: '1px solid #91d5ff',
                    }}
                >
                    <Row align="middle">
                        <Col span={2}>
                            <Avatar
                                style={{ background: '#1890ff' }}
                                icon={<RobotOutlined />}
                            />
                        </Col>
                        <Col span={22}>
                            <Text strong>AI 推荐分析：</Text>
                            <br />
                            <Paragraph
                                style={{ margin: '4px 0', color: '#555' }}
                            >
                                {aiReason}
                            </Paragraph>
                        </Col>
                    </Row>
                </Card>
            )}

            {/* 路径卡片列表 */}
            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                {paths?.map(({ path, score, isBest }: { path: StructuredLearningPath; score: number; isBest: boolean }) => {
                    const progress = getPathProgress(path)
                    const hours = getPathHours(path)
                    const isActive = activePathId === path.id

                    return (
                        <Col span={12} key={path.id}>
                            <Card
                                hoverable
                                style={{
                                    borderTop: `3px solid ${isActive ? '#ff4d4f' : isBest ? '#1890ff' : score >= 60 ? '#52c41a' : '#d9d9d9'}`,
                                    background: isActive ? '#fff0f0' : undefined,
                                }}
                                title={
                                    <Space>
                                        <AimOutlined
                                            style={{
                                                color: isActive
                                                    ? '#ff4d4f'
                                                    : isBest
                                                      ? '#1890ff'
                                                      : '#000',
                                            }}
                                        />
                                        <Text strong>{path.name}</Text>
                                        {isActive && (
                                            <Tag color="red">学习中</Tag>
                                        )}
                                        {isBest && !isActive && (
                                            <Tag color="blue">最佳匹配</Tag>
                                        )}
                                        {aiPathId === path.id && !isActive && (
                                            <Tag
                                                color="processing"
                                                icon={<RobotOutlined />}
                                            >
                                                AI 推荐
                                            </Tag>
                                        )}
                                    </Space>
                                }
                                extra={
                                    <Tooltip title="与学习画像的匹配度">
                                        <Tag
                                            color={
                                                score >= 80
                                                    ? 'success'
                                                    : score >= 50
                                                      ? 'processing'
                                                      : 'warning'
                                            }
                                        >
                                            匹配度 {score}%
                                        </Tag>
                                    </Tooltip>
                                }
                            >
                                <Paragraph
                                    type="secondary"
                                    style={{ marginBottom: 12 }}
                                >
                                    {path.description}
                                </Paragraph>

                                {/* 模块列表 */}
                                <List
                                    size="small"
                                    dataSource={path.modules}
                                    renderItem={(
                                        module: PathModule,
                                        idx: number,
                                    ) => {
                                        const hours = module.estimatedHours || 8
                                        return (
                                            <List.Item>
                                                <Space>
                                                    <Avatar
                                                        size={20}
                                                        style={{
                                                            background: '#1890ff',
                                                            fontSize: 12,
                                                        }}
                                                    >
                                                        {idx + 1}
                                                    </Avatar>
                                                    <Text>{module.name}</Text>
                                                    {module.isEntry && (
                                                        <Tag
                                                            color="green"
                                                            style={{ fontSize: 10 }}
                                                        >
                                                            入口
                                                        </Tag>
                                                    )}
                                                    <Tag
                                                        icon={
                                                            <ClockCircleOutlined />
                                                        }
                                                        style={{ fontSize: 10 }}
                                                    >
                                                        ~{hours}h
                                                    </Tag>
                                                </Space>
                                            </List.Item>
                                        )
                                    }}
                                />

                                <div
                                    style={{
                                        marginTop: 16,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Space>
                                        <Text
                                            type="secondary"
                                            style={{ fontSize: 12 }}
                                        >
                                            {path.modules.length} 个模块 · ~
                                            {hours} 小时
                                        </Text>
                                        {progress > 0 && (
                                            <Progress
                                                percent={progress}
                                                size="small"
                                                style={{ width: 80 }}
                                            />
                                        )}
                                    </Space>
                                    <Button
                                        type={isBest ? 'primary' : 'default'}
                                        icon={<PlayCircleOutlined />}
                                        onClick={() => handleStartPath(path)}
                                    >
                                        开始学习
                                    </Button>
                                </div>
                            </Card>
                        </Col>
                    )
                })}
            </Row>
        </div>
    )
}

export default PathPage
