# 学习路径 × 练习中心 打通 — 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 AI 生成的（和预定义的）学习路径与练习中心打通，让用户生成路径后能在练习中心做对应模块的题，并按 80% 阈值自动同步进度；同时新增 3 个热门题库。

**Architecture:**
- 数据层：扩展 `LearningNode` 为 `StructuredLearningNode`（带 `questionBankId` + `moduleId`），新键 `activeStructuredPath` 存 localStorage
- 服务层：新增 `pathParser` 纯函数校验 AI JSON 输出；`practiceGrader` 注册新题库并派发 `moduleProgressUpdated` 事件
- 视图层：Path 页改造 AI prompt、新增预定义路径卡片区；Practice 页读 `activeStructuredPath` 过滤模块、显示路径 banner

**Tech Stack:** React 18 + TypeScript + Vite + Ant Design + 现有 miniMax-M2.7 API；无测试框架，验证靠 `npm run build`（tsc + vite build）+ `npm run lint` + 手动验收清单

**前置说明**：本项目无测试框架（CLAUDE.md），每个任务的"验证"步骤以 `npm run build`（含 tsc 严格类型检查）+ `npm run lint` 为主，最终以 spec §11 验收清单做端到端核对。

---

## Task 1: 新增类型定义

**Files:**
- Modify: `src/types/index.ts:48-67`（LearningNode/LearningPath 块之后追加新类型）

- [ ] **Step 1: 打开 `src/types/index.ts`，定位 LearningPath 块末尾**

定位到第 67 行（`export interface LearningPath` 块结束的大括号之后）。

- [ ] **Step 2: 在 LearningPath 接口之后追加新类型**

在第 67 行后插入：

```ts
// ============ 结构化学习路径（路径-题库打通专用） ============

/** 结构化路径节点：每个节点对应题库中的一个具体模块 */
export interface StructuredLearningNode extends LearningNode {
  questionBankId: string;     // 题库 ID，如 'python-basics'
  moduleId: string;           // 模块 ID，如 'module-1'
  moduleName?: string;        // 题库模块名（冗余存储，便于 UI 展示）
  isEntry?: boolean;          // 是否为路径入口节点
  valid?: boolean;            // 引用校验结果；false 时 UI 降级显示
}

/** 结构化路径数据（新路径的唯一数据形态） */
export interface StructuredLearningPathData {
  id: string;                 // 唯一 ID（AI 生成时用 'ai-' 前缀）
  title: string;
  description: string;
  source: 'ai-generated' | 'predefined' | 'adopted';
  predefinedId?: string;      // 采用预定义时存原 ID
  nodes: StructuredLearningNode[];
  createdAt: string;          // ISO 时间
}

/** AI 响应解析结果 */
export type PathParseResult =
  | { ok: true; path: StructuredLearningPathData }
  | { ok: false; errors: string[] };
```

- [ ] **Step 3: 类型检查**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent" && npm run build 2>&1 | tail -20
```

Expected: `built in ...ms`，无 TypeScript 错误（其他文件暂未使用新类型，不应报错）。

- [ ] **Step 4: 提交**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent" && git add src/types/index.ts && git commit -m "feat(types): 新增 StructuredLearningNode 与 PathParseResult 类型"
```

---

## Task 2: 创建计算机网络题库 JSON

**Files:**
- Create: `src/data/computerNetworks.json`

**模块结构**（每模块 12 题，题型比例约 6 判断/4 选择/2 简答，与现有题库一致）：

| moduleId | name | description | tags |
|---|---|---|---|
| `module-1` | 网络模型与协议 | OSI 七层、TCP/IP 四层、协议对应关系、数据封装 | network-model, osi, tcpip, encapsulation, knowledgeBase |
| `module-2` | HTTP 与 HTTPS | 请求方法、状态码、HTTPS 加密过程、Cookie/Session、REST | http, https, rest, cookie, knowledgeBase |
| `module-3` | TCP 与 UDP | 三次握手、四次挥手、滑动窗口、可靠传输、UDP 特性 | tcp, udp, handshake, reliability, knowledgeBase |
| `module-4` | 网络安全与工具 | DNS、CDN、常见攻击（XSS/CSRF/SQL 注入）、抓包工具 | dns, cdn, security, attack, knowledgeBase |

- [ ] **Step 1: 创建 `src/data/computerNetworks.json`**

文件结构与 `src/data/pythonBasics.json` 完全一致。模板：

```json
{
  "id": "computer-networks",
  "name": "计算机网络基础",
  "description": "系统学习计算机网络核心概念、协议与安全，从网络模型到常见应用层协议",
  "modules": [
    { "id": "module-1", "name": "网络模型与协议", "description": "OSI 七层、TCP/IP 四层、协议对应关系、数据封装", "questionCount": 12, "tags": ["network-model", "osi", "tcpip", "encapsulation", "knowledgeBase"] },
    { "id": "module-2", "name": "HTTP 与 HTTPS", "description": "请求方法、状态码、HTTPS 加密过程、Cookie/Session、REST", "questionCount": 12, "tags": ["http", "https", "rest", "cookie", "knowledgeBase"] },
    { "id": "module-3", "name": "TCP 与 UDP", "description": "三次握手、四次挥手、滑动窗口、可靠传输、UDP 特性", "questionCount": 12, "tags": ["tcp", "udp", "handshake", "reliability", "knowledgeBase"] },
    { "id": "module-4", "name": "网络安全与工具", "description": "DNS、CDN、常见攻击（XSS/CSRF/SQL 注入）、抓包工具", "questionCount": 12, "tags": ["dns", "cdn", "security", "attack", "knowledgeBase"] }
  ],
  "questions": [
    { "id": "net-q101", "moduleId": "module-1", "type": "truefalse", "difficulty": "easy", "tags": ["osi", "knowledgeBase"], "question": "OSI 七层模型中，TCP 协议工作在传输层，IP 协议工作在网络层。", "trueFalseAnswer": true, "explanation": "OSI 模型：应用层、表示层、会话层、传输层、网络层、数据链路层、物理层。TCP 是传输层协议，IP 是网络层协议。" },
    { "id": "net-q102", "moduleId": "module-1", "type": "truefalse", "difficulty": "easy", "tags": ["tcpip", "knowledgeBase"], "question": "TCP/IP 模型分为四层：应用层、传输层、网络层、链路层。", "trueFalseAnswer": true, "explanation": "TCP/IP 四层模型：应用层（HTTP/FTP/DNS）、传输层（TCP/UDP）、网络层（IP/ICMP）、链路层（Ethernet/WiFi）。有时也把物理层单独列出称为五层模型。" },
    { "id": "net-q103", "moduleId": "module-1", "type": "choice", "difficulty": "medium", "tags": ["osi", "knowledgeBase"], "question": "OSI 七层模型中，哪一层负责数据的加密解密和格式转换？", "options": ["会话层", "表示层", "应用层", "传输层"], "correctAnswer": "表示层", "explanation": "表示层（Presentation Layer）负责数据格式转换、加密解密、数据压缩。常见协议：SSL/TLS（在表示层工作）。" },
    { "id": "net-q104", "moduleId": "module-1", "type": "choice", "difficulty": "medium", "tags": ["encapsulation", "knowledgeBase"], "question": "数据在发送时从应用层到物理层，每经过一层都会做什么？", "options": ["添加头部（封装）", "添加尾部（解封装）", "数据加密", "数据分片"], "correctAnswer": "添加头部（封装）", "explanation": "发送方数据封装：应用层数据 → 传输层加 TCP/UDP 头 → 网络层加 IP 头 → 链路层加 MAC 头和尾部。接收方则反向剥离（解封装）。" },
    { "id": "net-q105", "moduleId": "module-1", "type": "truefalse", "difficulty": "easy", "tags": ["osi", "knowledgeBase"], "question": "路由器主要工作在 OSI 模型的第三层（网络层）。", "trueFalseAnswer": true, "explanation": "路由器基于 IP 地址进行转发，工作在网络层。集线器在物理层，交换机在数据链路层。" },
    { "id": "net-q106", "moduleId": "module-1", "type": "choice", "difficulty": "hard", "tags": ["osi", "tcpip", "knowledgeBase"], "question": "以下哪个协议不属于 TCP/IP 模型的应用层？", "options": ["HTTP", "DNS", "TCP", "FTP"], "correctAnswer": "TCP", "explanation": "TCP 是传输层协议，不是应用层。HTTP/DNS/FTP 都是应用层协议。" },
    { "id": "net-q107", "moduleId": "module-1", "type": "short", "difficulty": "medium", "tags": ["osi", "tcpip", "knowledgeBase"], "question": "请简述 OSI 七层模型与 TCP/IP 四层模型的对应关系，并说明为什么实际工程多采用 TCP/IP 模型。", "sampleAnswer": "对应关系：OSI 应用层+表示层+会话层 → TCP/IP 应用层；OSI 传输层 → TCP/IP 传输层；OSI 网络层 → TCP/IP 网络层；OSI 数据链路层+物理层 → TCP/IP 链路层（有时也称网络接口层）。原因：1. TCP/IP 是事实标准，互联网全部基于此；2. 层次更精简，协议更实用；3. 各层协议已被广泛实现和验证。OSI 模型更多是理论参考。", "explanation": "要点：OSI 偏理论，TCP/IP 偏工程；实际开发中记住 TCP/IP 四层即可。" },
    { "id": "net-q108", "moduleId": "module-1", "type": "truefalse", "difficulty": "medium", "tags": ["encapsulation", "knowledgeBase"], "question": "在 TCP/IP 模型中，每层的数据单元（PDU）有不同名称：应用层是报文，传输层是段，网络层是包，链路层是帧。", "trueFalseAnswer": true, "explanation": "PDU（Protocol Data Unit）名称：应用层-报文/Message、传输层-段/Segment（TCP）或数据报/Datagram（UDP）、网络层-包/Packet、链路层-帧/Frame。" },
    { "id": "net-q109", "moduleId": "module-1", "type": "choice", "difficulty": "medium", "tags": ["osi", "knowledgeBase"], "question": "以下哪个设备工作在 OSI 模型的数据链路层？", "options": ["集线器（Hub）", "交换机（Switch）", "路由器（Router）", "防火墙（Firewall）"], "correctAnswer": "交换机（Switch）", "explanation": "集线器-物理层、交换机-数据链路层（基于 MAC 地址转发）、路由器-网络层、防火墙-网络层/应用层（多层）。" },
    { "id": "net-q110", "moduleId": "module-1", "type": "truefalse", "difficulty": "easy", "tags": ["tcpip", "knowledgeBase"], "question": "TCP/IP 模型的应用层直接对应 OSI 的应用层。", "trueFalseAnswer": false, "explanation": "TCP/IP 应用层合并了 OSI 的应用层、表示层、会话层。" },
    { "id": "net-q111", "moduleId": "module-1", "type": "choice", "difficulty": "medium", "tags": ["osi", "knowledgeBase"], "question": "以下哪个协议工作在 OSI 模型的会话层？", "options": ["HTTP", "TLS", "RPC", "TCP"], "correctAnswer": "RPC", "explanation": "RPC（Remote Procedure Call）框架（如 gRPC）部分功能涉及会话管理。HTTP 在应用层，TLS 在表示层（在 OSI 模型中），TCP 在传输层。注意：现代协议分层常有交叉。" },
    { "id": "net-q112", "moduleId": "module-1", "type": "short", "difficulty": "medium", "tags": ["encapsulation", "tcpip", "knowledgeBase"], "question": "浏览器输入 URL 后到看到页面，过程中数据经历了哪些封装和解封装？请按顺序说明。", "sampleAnswer": "封装（发送）：1. 应用层：HTTP 报文（请求行、请求头、请求体）；2. 传输层：加上 TCP 头（源/目的端口、序列号），形成 TCP 段；3. 网络层：加上 IP 头（源/目的 IP），形成 IP 包；4. 链路层：加上 MAC 头（源/目的 MAC）和 FCS 校验，形成帧，通过网卡发送。解封装（接收）：反向剥离每一层头部，逐层交给上层协议处理。", "explanation": "关键点：发送方逐层封装（加头），接收方逐层解封装（剥头）。" },

    { "id": "net-q201", "moduleId": "module-2", "type": "truefalse", "difficulty": "easy", "tags": ["http", "knowledgeBase"], "question": "HTTP 是无状态协议，服务器默认不会记住客户端的历史请求。", "trueFalseAnswer": true, "explanation": "HTTP 本身无状态，需要 Cookie/Session/Token 等机制维持状态。" },
    { "id": "net-q202", "moduleId": "module-2", "type": "choice", "difficulty": "easy", "tags": ["http", "knowledgeBase"], "question": "以下哪个 HTTP 状态码表示『资源未找到』？", "options": ["200", "301", "404", "500"], "correctAnswer": "404", "explanation": "200-成功、301-永久重定向、404-未找到、500-服务器内部错误。4xx 客户端错误，5xx 服务器错误。" },
    { "id": "net-q203", "moduleId": "module-2", "type": "truefalse", "difficulty": "medium", "tags": ["https", "knowledgeBase"], "question": "HTTPS 在 HTTP 基础上加入了 TLS/SSL 加密层，默认端口是 443。", "trueFalseAnswer": true, "explanation": "HTTPS = HTTP + TLS/SSL。HTTP 默认 80，HTTPS 默认 443。" },
    { "id": "net-q204", "moduleId": "module-2", "type": "choice", "difficulty": "medium", "tags": ["http", "rest", "knowledgeBase"], "question": "RESTful 风格中，哪个 HTTP 方法用于更新资源的部分字段？", "options": ["PUT", "POST", "PATCH", "DELETE"], "correctAnswer": "PATCH", "explanation": "GET-查询、POST-创建、PUT-整体更新、PATCH-部分更新、DELETE-删除。PUT 是幂等的整体替换。" },
    { "id": "net-q205", "moduleId": "module-2", "type": "truefalse", "difficulty": "medium", "tags": ["cookie", "knowledgeBase"], "question": "Cookie 存储在服务器端，Session 存储在客户端。", "trueFalseAnswer": false, "explanation": "Cookie 存储在客户端（浏览器），Session 存储在服务器端（一般）。现代应用更多用 Token（JWT 等）替代。" },
    { "id": "net-q206", "moduleId": "module-2", "type": "choice", "difficulty": "medium", "tags": ["https", "knowledgeBase"], "question": "TLS 握手过程中，客户端会验证服务器证书的什么？", "options": ["证书是否由可信 CA 签发、域名是否匹配、是否过期", "证书的私钥是否正确", "证书的序列号是否为偶数", "证书的物理位置"], "correctAnswer": "证书是否由可信 CA 签发、域名是否匹配、是否过期", "explanation": "客户端验证证书：1. CA 链是否可信（操作系统/浏览器内置根证书）；2. 域名与证书 Subject Alternative Name 匹配；3. 证书未过期；4. 未被吊销（CRL/OCSP）。" },
    { "id": "net-q207", "moduleId": "module-2", "type": "short", "difficulty": "medium", "tags": ["http", "https", "knowledgeBase"], "question": "请说明 HTTP 与 HTTPS 的主要区别，以及 HTTPS 如何保证通信安全。", "sampleAnswer": "区别：1. 端口：HTTP 80，HTTPS 443；2. 加密：HTTP 明文，HTTPS 加密；3. 性能：HTTPS 由于 TLS 握手有额外开销，但 HTTP/2 后差距缩小；4. 证书：HTTPS 需要 CA 证书。安全机制：1. TLS 握手阶段用非对称加密（RSA/ECDHE）交换会话密钥；2. 数据传输阶段用对称加密（AES）加密数据；3. 通过 MAC/HMAC 保证完整性。", "explanation": "HTTPS = HTTP + TLS。TLS 混合使用非对称（密钥交换）和对称（数据加密）加密。" },
    { "id": "net-q208", "moduleId": "module-2", "type": "truefalse", "difficulty": "medium", "tags": ["http", "rest", "knowledgeBase"], "question": "HTTP GET 请求可以带请求体（body），但通常不推荐。", "trueFalseAnswer": true, "explanation": "GET 请求的语义是获取资源，请求体虽然 HTTP 规范允许但很多服务器/CDN/代理会忽略。应该用查询参数（query string）传参。" },
    { "id": "net-q209", "moduleId": "module-2", "type": "choice", "difficulty": "medium", "tags": ["http", "knowledgeBase"], "question": "以下哪个 HTTP 状态码表示『服务器无法处理请求』的客户端错误？", "options": ["400", "401", "403", "404"], "correctAnswer": "400", "explanation": "400 Bad Request（请求格式错误）、401 Unauthorized（未认证）、403 Forbidden（无权限）、404 Not Found（资源不存在）。" },
    { "id": "net-q210", "moduleId": "module-2", "type": "truefalse", "difficulty": "easy", "tags": ["http", "knowledgeBase"], "question": "HTTP/1.1 默认使用长连接（keep-alive），单个 TCP 连接可以处理多个请求。", "trueFalseAnswer": true, "explanation": "HTTP/1.1 默认 keep-alive，相比 HTTP/1.0 减少了 TCP 握手开销。HTTP/2 进一步引入多路复用（multiplexing）。" },
    { "id": "net-q211", "moduleId": "module-2", "type": "choice", "difficulty": "hard", "tags": ["http", "rest", "knowledgeBase"], "question": "RESTful 设计的『无状态』原则要求什么？", "options": ["每个请求必须包含服务器处理所需的所有信息", "服务器不保存客户端会话状态", "客户端不保存任何状态", "使用 HTTP 协议"], "correctAnswer": "每个请求必须包含服务器处理所需的所有信息", "explanation": "REST 无状态：服务器不存储客户端会话信息，每个请求自包含（self-contained）。这样服务器可以水平扩展，负载均衡时不需要会话共享。" },
    { "id": "net-q212", "moduleId": "module-2", "type": "short", "difficulty": "medium", "tags": ["http", "cookie", "knowledgeBase"], "question": "请说明 Cookie 和 Session 的工作原理，以及它们各自的优缺点。", "sampleAnswer": "Cookie：服务器通过 Set-Cookie 响应头将小段数据发送到浏览器，浏览器后续请求自动带上 Cookie。优点：服务端无需存储、跨服务器友好；缺点：大小限制（4KB）、每次请求都带、可见可篡改。Session：服务器为每个客户端创建唯一 Session ID，存储在服务端（内存/数据库/Redis），客户端通过 Cookie 持有 Session ID。优点：数据安全、容量大；缺点：服务器需维护状态、难水平扩展。", "explanation": "现代 Web 通常用 Token（如 JWT）替代 Session，服务器无状态。" },

    { "id": "net-q301", "moduleId": "module-3", "type": "truefalse", "difficulty": "easy", "tags": ["tcp", "handshake", "knowledgeBase"], "question": "TCP 三次握手中，第三次握手客户端发送 ACK 后就可以立即发送数据。", "trueFalseAnswer": true, "explanation": "三次握手：SYN → SYN+ACK → ACK。客户端发送第三次 ACK 后连接建立，可以立即携带数据。优化：TFO（TCP Fast Open）允许 SYN 包携带数据。" },
    { "id": "net-q302", "moduleId": "module-3", "type": "truefalse", "difficulty": "medium", "tags": ["tcp", "handshake", "knowledgeBase"], "question": "TCP 四次挥手过程中，服务器在收到 FIN 后立即关闭连接。", "trueFalseAnswer": false, "explanation": "四次挥手：客户端 FIN → 服务器 ACK → 服务器 FIN → 客户端 ACK。服务器收到 FIN 后先 ACK（表示收到），但可能还有数据要发，所以不能立即关闭，要等数据发完再发 FIN。" },
    { "id": "net-q303", "moduleId": "module-3", "type": "choice", "difficulty": "medium", "tags": ["tcp", "knowledgeBase"], "question": "以下哪个是 TCP 提供的特性？", "options": ["无连接", "可靠传输", "尽最大努力交付", "支持广播"], "correctAnswer": "可靠传输", "explanation": "TCP 特性：面向连接、可靠传输（ACK 重传）、字节流、流量控制（滑动窗口）、拥塞控制。UDP：无连接、不可靠、支持广播。" },
    { "id": "net-q304", "moduleId": "module-3", "type": "choice", "difficulty": "medium", "tags": ["tcp", "reliability", "knowledgeBase"], "question": "TCP 通过什么机制保证可靠传输？", "options": ["校验和、序列号、ACK、重传", "IP 地址", "端口号", "域名"], "correctAnswer": "校验和、序列号、ACK、重传", "explanation": "TCP 可靠性：1. 校验和检测数据损坏；2. 序列号保证顺序；3. ACK 确认接收；4. 超时重传丢失数据；5. 流量控制避免接收方溢出。" },
    { "id": "net-q305", "moduleId": "module-3", "type": "truefalse", "difficulty": "easy", "tags": ["udp", "knowledgeBase"], "question": "UDP 是无连接的、不可靠的传输层协议，但延迟低、开销小。", "trueFalseAnswer": true, "explanation": "UDP 特点：无连接、不可靠（不保证到达）、无序、面向报文。但延迟低（无需握手）、开销小（头部仅 8 字节）、支持一对多。适用：视频/语音、实时游戏、DNS 查询。" },
    { "id": "net-q306", "moduleId": "module-3", "type": "choice", "difficulty": "medium", "tags": ["tcp", "knowledgeBase"], "question": "TCP 滑动窗口的作用是？", "options": ["加密数据", "流量控制", "域名解析", "路由选择"], "correctAnswer": "流量控制", "explanation": "滑动窗口（Sliding Window）用于流量控制：接收方通过 ACK 告诉发送方自己的接收窗口大小，发送方据此调整发送速率，防止接收方溢出。" },
    { "id": "net-q307", "moduleId": "module-3", "type": "short", "difficulty": "hard", "tags": ["tcp", "handshake", "knowledgeBase"], "question": "请详细说明 TCP 三次握手的过程，并解释为什么是三次而不是两次。", "sampleAnswer": "三次握手：1. 客户端发送 SYN（seq=x）到服务器，进入 SYN_SENT 状态；2. 服务器收到 SYN，发送 SYN+ACK（seq=y, ack=x+1），进入 SYN_RCVD 状态；3. 客户端收到 SYN+ACK，发送 ACK（seq=x+1, ack=y+1），连接建立。为什么不是两次：两次握手无法避免『已失效的连接请求报文突然又传到了服务器』。例如：客户端发的第一个 SYN 在网络中滞留，超时后客户端重发，服务器收到重发的 SYN 后建立连接并返回数据。如果第一次滞留的 SYN 到达服务器，服务器会认为建立连接，但客户端实际已经放弃，导致服务器资源浪费。三次握手通过客户端最后确认 ACK 解决了这个问题。", "explanation": "三次握手本质是双方确认收发能力：SYN（自己能发，对方能收）+ ACK（对方能发，自己能收）。" },
    { "id": "net-q308", "moduleId": "module-3", "type": "truefalse", "difficulty": "medium", "tags": ["tcp", "knowledgeBase"], "question": "TCP 头部比 UDP 头部大，因为包含更多控制信息。", "trueFalseAnswer": true, "explanation": "TCP 头 20-60 字节（序列号、ACK 号、标志位、窗口大小、校验和等），UDP 头固定 8 字节（源/目的端口、长度、校验和）。TCP 头部信息丰富以支持可靠传输。" },
    { "id": "net-q309", "moduleId": "module-3", "type": "choice", "difficulty": "medium", "tags": ["udp", "knowledgeBase"], "question": "以下哪种应用场景最适合使用 UDP？", "options": ["文件传输", "电子邮件", "实时视频通话", "网页浏览"], "correctAnswer": "实时视频通话", "explanation": "实时音视频：丢一帧无所谓，但延迟敏感（晚到的包不如丢弃）。UDP 不重传，延迟低。文件/邮件/网页：要求可靠性，用 TCP。" },
    { "id": "net-q310", "moduleId": "module-3", "type": "truefalse", "difficulty": "medium", "tags": ["tcp", "knowledgeBase"], "question": "TCP 连接建立后，如果网络中断，TCP 不会主动通知应用层。", "trueFalseAnswer": true, "explanation": "TCP 通过 keep-alive 探活（默认 2 小时一次）检测对端存活，但不会主动通知应用『连接已断』。应用层需自己实现心跳或读超时判断。HTTP 长连接也面临此问题。" },
    { "id": "net-q311", "moduleId": "module-3", "type": "choice", "difficulty": "hard", "tags": ["tcp", "knowledgeBase"], "question": "TIME_WAIT 状态出现在哪一端？持续时间多长？", "options": ["服务器端，60秒", "主动关闭连接的一端，2*MSL（通常 60-120秒）", "客户端，30秒", "两端都有，无时间限制"], "correctAnswer": "主动关闭连接的一端，2*MSL（通常 60-120秒）", "explanation": "TIME_WAIT 是主动关闭方（先发 FIN 的一端）在发送最后一个 ACK 后进入的状态，等待 2*MSL（Maximum Segment Lifetime，通常 1-2 分钟）。原因：1. 保证最后一个 ACK 能到达对端；2. 让本次连接的所有报文在网络中消失，避免影响后续连接。" },
    { "id": "net-q312", "moduleId": "module-3", "type": "short", "difficulty": "medium", "tags": ["tcp", "udp", "knowledgeBase"], "question": "请对比 TCP 和 UDP 的特点、适用场景，以及为什么实时应用倾向 UDP。", "sampleAnswer": "TCP：面向连接、可靠（重传+ACK+序号）、有序、字节流、流量控制、拥塞控制。头部 20+ 字节，握手耗时。适合：文件传输、邮件、网页、API 调用。UDP：无连接、不可靠、无序、面向报文、无控制。头部 8 字节，无握手。适合：DNS、视频/语音通话、实时游戏、广播。实时应用选 UDP 原因：1. 低延迟（无需握手/重传）；2. 偶尔丢包不影响体验（视频/语音）；3. 简单高效，资源消耗低。", "explanation": "实时应用的核心矛盾：可靠性 vs 时效性。UDP + 应用层补偿（如 FEC 前向纠错）是常见方案。" },

    { "id": "net-q401", "moduleId": "module-4", "type": "truefalse", "difficulty": "easy", "tags": ["dns", "knowledgeBase"], "question": "DNS 的作用是将域名解析为 IP 地址，默认端口 53。", "trueFalseAnswer": true, "explanation": "DNS（Domain Name System）将人类可读的域名（www.example.com）转换为机器可读的 IP 地址。默认端口 53（UDP）。" },
    { "id": "net-q402", "moduleId": "module-4", "type": "choice", "difficulty": "medium", "tags": ["cdn", "knowledgeBase"], "question": "CDN 的核心作用是什么？", "options": ["加密网站流量", "将内容缓存到离用户最近的节点", "提供域名解析", "提供 HTTP 服务器"], "correctAnswer": "将内容缓存到离用户最近的节点", "explanation": "CDN（Content Delivery Network）通过在全球部署边缘节点，将静态资源（图片、JS、CSS、视频）缓存到离用户最近的服务器，减少延迟、降低源站压力、提高可用性。" },
    { "id": "net-q403", "moduleId": "module-4", "type": "truefalse", "difficulty": "medium", "tags": ["security", "knowledgeBase"], "question": "XSS（跨站脚本攻击）的本质是网站信任了用户输入并直接渲染到页面。", "trueFalseAnswer": true, "explanation": "XSS 攻击：攻击者在输入中插入恶意脚本（JS 代码），网站未做转义就渲染到页面，浏览器执行后窃取 Cookie、会话 token。防御：对用户输入做 HTML 转义、CSP（内容安全策略）。" },
    { "id": "net-q404", "moduleId": "module-4", "type": "choice", "difficulty": "medium", "tags": ["security", "knowledgeBase"], "question": "CSRF（跨站请求伪造）攻击的前提条件是什么？", "options": ["用户在同一浏览器登录了目标网站", "网站使用 HTTPS", "网站有 SQL 注入漏洞", "网站不支持 Cookie"], "correctAnswer": "用户在同一浏览器登录了目标网站", "explanation": "CSRF：用户登录了银行网站（持有 Cookie），访问恶意网站，恶意网站发起对银行的请求，浏览器自动带上 Cookie。防御：CSRF Token、SameSite Cookie、验证 Referer/Origin。" },
    { "id": "net-q405", "moduleId": "module-4", "type": "truefalse", "difficulty": "medium", "tags": ["security", "knowledgeBase"], "question": "SQL 注入攻击可以通过参数化查询（Prepared Statement）有效防御。", "trueFalseAnswer": true, "explanation": "参数化查询：SQL 语句结构与数据分离，数据库将参数视为数据而非 SQL 代码，从根本上避免注入。绝不要拼接 SQL 字符串。" },
    { "id": "net-q406", "moduleId": "module-4", "type": "choice", "difficulty": "medium", "tags": ["security", "knowledgeBase"], "question": "以下哪个不是常见的 Web 攻击类型？", "options": ["XSS", "CSRF", "DDoS", "REST"], "correctAnswer": "REST", "explanation": "REST 是架构风格（Representational State Transfer），不是攻击。XSS、CSRF、DDoS 都是常见攻击类型。DDoS（Distributed Denial of Service）通过大量请求耗尽服务器资源。" },
    { "id": "net-q407", "moduleId": "module-4", "type": "short", "difficulty": "medium", "tags": ["dns", "knowledgeBase"], "question": "请说明 DNS 解析的完整过程（从浏览器输入 URL 开始到获得 IP）。", "sampleAnswer": "1. 浏览器缓存查询；2. 操作系统缓存查询（hosts 文件）；3. 本地 DNS 服务器（LDNS）查询：a) 根 DNS 服务器返回顶级域（.com）服务器地址；b) 顶级域 DNS 返回权威 DNS（example.com）地址；c) 权威 DNS 返回 IP 地址；4. LDNS 缓存结果返回给客户端。整个过程涉及递归查询（客户端到 LDNS）和迭代查询（LDNS 到各级 DNS）。", "explanation": "DNS 解析是分层查询：根 → 顶级域 → 权威域 → 获得 IP。递归 vs 迭代查询结合使用。" },
    { "id": "net-q408", "moduleId": "module-4", "type": "truefalse", "difficulty": "medium", "tags": ["cdn", "knowledgeBase"], "question": "CDN 不仅缓存静态资源，也可以做动态加速（如 API 请求）。", "trueFalseAnswer": true, "explanation": "现代 CDN 支持动态加速：通过智能路由、协议优化（HTTP/3、BBR）、边缘计算等降低动态请求延迟。主流 CDN（Cloudflare、Akamai）都提供此能力。" },
    { "id": "net-q409", "moduleId": "module-4", "type": "choice", "difficulty": "hard", "tags": ["security", "knowledgeBase"], "question": "以下哪种做法能有效防止 CSRF 攻击？", "options": ["使用 HTTPS", "在请求中加入不可预测的 CSRF Token", "设置复杂的密码", "使用 Cookie 存储用户信息"], "correctAnswer": "在请求中加入不可预测的 CSRF Token", "explanation": "CSRF Token：服务器生成随机 Token 存在用户会话中，客户端每次请求必须带上（表单字段或请求头），攻击者无法预测。其他方案：SameSite Cookie（限制跨站发送）、验证 Referer/Origin 头。" },
    { "id": "net-q410", "moduleId": "module-4", "type": "truefalse", "difficulty": "medium", "tags": ["dns", "knowledgeBase"], "question": "DNS 查询默认使用 UDP 协议，但当响应超过 512 字节时会切换到 TCP。", "trueFalseAnswer": true, "explanation": "DNS 默认 UDP，响应超 512 字节（受 EDNS 扩展可达 4096）或 zone transfer（区域传输）时用 TCP。现代 DNS 普遍支持 EDNS，UDP 可承载更大响应。" },
    { "id": "net-q411", "moduleId": "module-4", "type": "choice", "difficulty": "medium", "tags": ["security", "knowledgeBase"], "question": "中间人攻击（MITM）的核心是什么？", "options": ["攻击者直接破坏服务器", "攻击者在通信双方之间截获并可能篡改数据", "攻击者发送大量请求耗尽资源", "攻击者猜测用户密码"], "correctAnswer": "攻击者在通信双方之间截获并可能篡改数据", "explanation": "MITM（Man-in-the-Middle）：攻击者在客户端与服务器之间建立代理，截获/篡改通信。防御：HTTPS（TLS 加密）、证书校验、HTTP Strict Transport Security（HSTS）。" },
    { "id": "net-q412", "moduleId": "module-4", "type": "short", "difficulty": "hard", "tags": ["security", "knowledgeBase"], "question": "请列举至少 3 种常见的 Web 攻击，说明攻击原理和防御措施。", "sampleAnswer": "1. XSS（跨站脚本）：攻击者在输入中插入恶意脚本，网站未转义渲染。防御：HTML 转义、CSP、HttpOnly Cookie。2. CSRF（跨站请求伪造）：用户登录后访问恶意网站，恶意网站利用 Cookie 发起请求。防御：CSRF Token、SameSite Cookie、验证 Referer。3. SQL 注入：用户输入拼接到 SQL 中执行恶意代码。防御：参数化查询、ORM、输入验证。4. DDoS（分布式拒绝服务）：大量请求耗尽资源。防御：CDN、WAF、限流、验证码。", "explanation": "Web 安全的核心是：1. 不信任任何用户输入；2. 最小权限原则；3. 纵深防御。" }
  ]
}
```

- [ ] **Step 2: 验证 JSON 解析且字段正确**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent" && node -e "const d=require('./src/data/computerNetworks.json'); console.log('id:', d.id, 'modules:', d.modules.length, 'questions:', d.questions.length); d.questions.forEach(q => { if (!q.id || !q.moduleId || !q.type || !q.difficulty) console.log('INVALID:', q); }); console.log('OK');"
```

Expected: 输出 `id: computer-networks modules: 4 questions: 48` 和 `OK`，无 INVALID。

- [ ] **Step 3: 验证模块/题数匹配**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent" && node -e "const d=require('./src/data/computerNetworks.json'); d.modules.forEach(m => { const c = d.questions.filter(q => q.moduleId === m.id).length; console.log(m.id, m.name, '声明', m.questionCount, '实际', c, c === m.questionCount ? 'OK' : 'MISMATCH'); });"
```

Expected: 4 行均显示 `OK`。

- [ ] **Step 4: 提交**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent" && git add src/data/computerNetworks.json && git commit -m "feat(data): 新增计算机网络题库（48题 4模块）"
```

---

## Task 3: 创建 Linux 基础题库 JSON

**Files:**
- Create: `src/data/linuxFundamentals.json`

**模块结构**：

| moduleId | name | description | tags |
|---|---|---|---|
| `module-1` | 文件与目录 | Linux 目录结构、常用文件操作命令、文件类型、链接 | linux-file, directory, file-ops, knowledgeBase |
| `module-2` | 用户与权限 | 用户/组管理、文件权限（rwx）、chmod/chown、sudo | linux-user, permission, chmod, sudo, knowledgeBase |
| `module-3` | Shell 脚本 | Bash 语法、变量、循环、条件、函数、脚本调试 | bash, shell-script, syntax, knowledgeBase |
| `module-4` | 系统管理 | 进程管理、systemd、服务管理、日志查看、性能监控 | linux-process, systemd, log, monitoring, knowledgeBase |

- [ ] **Step 1: 创建 `src/data/linuxFundamentals.json`**

仿照 Task 2 的结构，bankId = `linux-fundamentals`，name = `Linux 系统基础`，按上述模块结构组织。每个模块 12 题（6 判断/4 选择/2 简答），题目主题严格覆盖对应模块 description。**前 3 题示例**（其余按模式生成）：

```json
{ "id": "linux-q101", "moduleId": "module-1", "type": "truefalse", "difficulty": "easy", "tags": ["linux-file", "knowledgeBase"], "question": "Linux 文件系统采用树形结构，所有文件和目录都以根目录『/』为起点。", "trueFalseAnswer": true, "explanation": "Linux 一切皆文件，根目录 / 是最高层级。常见目录：/home（用户目录）、/etc（配置文件）、/var（可变数据）、/usr（用户程序）、/tmp（临时文件）。" },
{ "id": "linux-q102", "moduleId": "module-1", "type": "truefalse", "difficulty": "easy", "tags": ["directory", "knowledgeBase"], "question": "Linux 中隐藏文件（以 . 开头）使用 `ls` 命令默认就会显示。", "trueFalseAnswer": false, "explanation": "ls 默认不显示隐藏文件，需要 `ls -a` 显示所有文件，`ls -l` 显示详细信息。常用组合 `ls -la`。" },
{ "id": "linux-q103", "moduleId": "module-1", "type": "choice", "difficulty": "medium", "tags": ["file-ops", "knowledgeBase"], "question": "以下哪个命令用于查看当前工作目录的完整路径？", "options": ["cd", "pwd", "ls", "where"], "correctAnswer": "pwd", "explanation": "pwd（print working directory）显示当前工作目录绝对路径。cd（change directory）切换目录，ls 列出目录内容。" }
```

继续填充至每模块 12 题。**所有 12 题 ID 必须以模块编号（q101-q1xx、q201-q2xx 等）唯一编号**。

- [ ] **Step 2: 验证 JSON 解析**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent" && node -e "const d=require('./src/data/linuxFundamentals.json'); console.log('id:', d.id, 'modules:', d.modules.length, 'questions:', d.questions.length); d.questions.forEach(q => { if (!q.id || !q.moduleId || !q.type || !q.difficulty) console.log('INVALID:', q); }); console.log('OK');"
```

Expected: `id: linux-fundamentals modules: 4 questions: 48 OK`。

- [ ] **Step 3: 验证模块/题数匹配**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent" && node -e "const d=require('./src/data/linuxFundamentals.json'); d.modules.forEach(m => { const c = d.questions.filter(q => q.moduleId === m.id).length; console.log(m.id, m.name, '声明', m.questionCount, '实际', c, c === m.questionCount ? 'OK' : 'MISMATCH'); });"
```

Expected: 4 行 `OK`。

- [ ] **Step 4: 提交**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent" && git add src/data/linuxFundamentals.json && git commit -m "feat(data): 新增 Linux 系统基础题库（48题 4模块）"
```

---

## Task 4: 创建机器学习题库 JSON

**Files:**
- Create: `src/data/machineLearning.json`

**模块结构**：

| moduleId | name | description | tags |
|---|---|---|---|
| `module-1` | 监督学习 | 线性回归、逻辑回归、决策树、KNN、朴素贝叶斯、SVM 概念 | supervised, regression, classification, knowledgeBase |
| `module-2` | 无监督学习 | K-Means、DBSCAN、层次聚类、降维（PCA、t-SNE） | unsupervised, clustering, dim-reduction, knowledgeBase |
| `module-3` | 模型评估 | 训练/测试集、交叉验证、混淆矩阵、精确率/召回率/F1、过拟合 | evaluation, cross-validation, metrics, knowledgeBase |
| `module-4` | 特征工程与调参 | 特征缩放、特征选择、编码、超参数调优（网格/贝叶斯） | feature-engineering, tuning, scaling, knowledgeBase |

- [ ] **Step 1: 创建 `src/data/machineLearning.json`**

bankId = `machine-learning`，name = `机器学习基础`，按上述模块结构组织。**前 3 题示例**：

```json
{ "id": "ml-q101", "moduleId": "module-1", "type": "truefalse", "difficulty": "easy", "tags": ["supervised", "knowledgeBase"], "question": "监督学习中，训练数据需要包含输入特征和对应的标签（label）。", "trueFalseAnswer": true, "explanation": "监督学习的本质：通过带标签的训练数据学习输入到输出的映射。无监督学习则只有输入没有标签。" },
{ "id": "ml-q102", "moduleId": "module-1", "type": "truefalse", "difficulty": "easy", "tags": ["regression", "knowledgeBase"], "question": "线性回归用于预测连续值，逻辑回归用于分类任务。", "trueFalseAnswer": true, "explanation": "线性回归：输出连续值，损失函数为 MSE。逻辑回归：在线性回归基础上加 sigmoid，输出概率，用于二分类（多分类用 Softmax）。" },
{ "id": "ml-q103", "moduleId": "module-1", "type": "choice", "difficulty": "medium", "tags": ["classification", "knowledgeBase"], "question": "KNN（K 近邻）算法的核心思想是？", "options": ["通过构建决策树进行分类", "通过计算样本间距离，投票决定类别", "通过梯度下降优化损失函数", "通过最大间隔划分超平面"], "correctAnswer": "通过计算样本间距离，投票决定类别", "explanation": "KNN：找测试样本最近的 K 个训练样本，统计这 K 个样本的类别，多数投票决定测试样本类别。无需训练，但预测时计算量大。K 值、超参数距离度量（欧氏/曼哈顿）影响性能。" }
```

继续填充至每模块 12 题。

- [ ] **Step 2: 验证 JSON 解析**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent" && node -e "const d=require('./src/data/machineLearning.json'); console.log('id:', d.id, 'modules:', d.modules.length, 'questions:', d.questions.length); d.questions.forEach(q => { if (!q.id || !q.moduleId || !q.type || !q.difficulty) console.log('INVALID:', q); }); console.log('OK');"
```

Expected: `id: machine-learning modules: 4 questions: 48 OK`。

- [ ] **Step 3: 验证模块/题数匹配**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent" && node -e "const d=require('./src/data/machineLearning.json'); d.modules.forEach(m => { const c = d.questions.filter(q => q.moduleId === m.id).length; console.log(m.id, m.name, '声明', m.questionCount, '实际', c, c === m.questionCount ? 'OK' : 'MISMATCH'); });"
```

Expected: 4 行 `OK`。

- [ ] **Step 4: 提交**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent" && git add src/data/machineLearning.json && git commit -m "feat(data): 新增机器学习基础题库（48题 4模块）"
```

---

## Task 5: 注册新题库 + 添加阈值常量

**Files:**
- Modify: `src/services/practiceGrader.ts:1-58`（imports 与 bankRegistry 部分）

- [ ] **Step 1: 打开 `src/services/practiceGrader.ts`，定位 import 区**

第 8-17 行有题库 imports，第 30-32 行有 bankRegistry 注册数组。

- [ ] **Step 2: 在 import 区末尾追加 3 个新题库 import**

在第 17 行（`import { initialProfile } from '../data/mockData';`）之前插入：

```ts
import networksBank from '../data/computerNetworks.json';
import linuxBank from '../data/linuxFundamentals.json';
import mlBank from '../data/machineLearning.json';
```

- [ ] **Step 3: 在 bankRegistry 注册数组追加 3 项**

第 30 行（`[pythonBank, jsBank, dsBank, sqlBank, javaBank, goBank, csharpBank, rustBank, devopsBank].forEach(bank => {`）改为：

```ts
[pythonBank, jsBank, dsBank, sqlBank, javaBank, goBank, csharpBank, rustBank, devopsBank, networksBank, linuxBank, mlBank].forEach(bank => {
```

- [ ] **Step 4: 在 import 区之后、bankRegistry 之前添加阈值常量**

在第 19 行（`// ==================== 题库注册表 ====================`）之前插入：

```ts
// ==================== 路径-练习同步阈值 ====================
/** 模块得分达到此阈值时，路径节点自动标记为已完成 */
export const COMPLETION_THRESHOLD = 80;
```

- [ ] **Step 5: 验证构建**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent" && npm run build 2>&1 | tail -15
```

Expected: 构建成功，无 TypeScript 错误。

- [ ] **Step 6: 验证题库数量（运行时）**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent" && node -e "const {getAllBankIds} = require('./src/services/practiceGrader.ts');" 2>&1 | head -5
```

Expected: 此命令会因无法直接 require .ts 而报错（正常）。改用构建产物验证：

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent" && npm run build 2>&1 | grep -E "(error|TS[0-9])" || echo "无错误"
```

Expected: `无错误`。

- [ ] **Step 7: 提交**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent" && git add src/services/practiceGrader.ts && git commit -m "feat(practice): 注册 3 个新题库并添加 COMPLETION_THRESHOLD 常量"
```

---

## Task 6: 在 submitAnswer 中派发 moduleProgressUpdated 事件

**Files:**
- Modify: `src/services/practiceGrader.ts:374-413`（submitAnswer 函数末尾）

- [ ] **Step 1: 定位 submitAnswer 末尾**

第 410-411 行附近（`savePracticeState(state);` 和 `window.dispatchEvent(...)` 之后）。

- [ ] **Step 2: 在 submitAnswer 末尾追加新事件派发**

定位到第 411 行：

```ts
  savePracticeState(state);
  window.dispatchEvent(new CustomEvent('practiceStateUpdated'));
  return state;
}
```

替换为：

```ts
  savePracticeState(state);
  window.dispatchEvent(new CustomEvent('practiceStateUpdated'));

  // 通知 Path 页同步节点进度
  const moduleProgress = state.moduleProgress.find(p => p.moduleId === moduleId);
  if (moduleProgress) {
    window.dispatchEvent(new CustomEvent('moduleProgressUpdated', {
      detail: {
        moduleId,
        bankId: getActiveBank(),
        score: moduleProgress.score,
      },
    }));
  }

  return state;
}
```

- [ ] **Step 3: 验证构建**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent" && npm run build 2>&1 | tail -15
```

Expected: 构建成功。

- [ ] **Step 4: 提交**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent" && git add src/services/practiceGrader.ts && git commit -m "feat(practice): submitAnswer 派发 moduleProgressUpdated 事件"
```

---

## Task 7: 创建 pathParser 纯函数

**Files:**
- Create: `src/services/pathParser.ts`

- [ ] **Step 1: 创建 `src/services/pathParser.ts`**

完整内容：

```ts
import { streamChatCompletion } from './api';
import { getAllBankIds, getBank } from './practiceGrader';
import type {
  StructuredLearningPathData,
  StructuredLearningNode,
  PathParseResult,
} from '../types';

/**
 * 从 AI 流式输出文本中提取 JSON 并校验节点引用是否合法。
 * - 自动识别 ```json``` 代码块
 * - 逐节点校验 questionBankId/moduleId
 * - 校验失败的节点标 valid:false，不阻断整条路径
 * - 有效节点数 < 1 时返回 errors
 */
export function parseStructuredPathResponse(
  rawText: string,
  validBankIds: string[] = getAllBankIds()
): PathParseResult {
  // 1. 提取 JSON 字符串
  const codeBlock = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  let jsonStr = codeBlock ? codeBlock[1] : rawText;
  const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    jsonStr = jsonMatch[0];
  }

  // 2. JSON.parse
  let parsed: any;
  try {
    parsed = JSON.parse(jsonStr);
  } catch (e) {
    return { ok: false, errors: [`JSON 解析失败: ${(e as Error).message}`] };
  }

  if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.nodes)) {
    return { ok: false, errors: ['JSON 结构不合法：缺少 nodes 数组'] };
  }

  // 3. 校验节点
  const errors: string[] = [];
  const validatedNodes: StructuredLearningNode[] = parsed.nodes.map((node: any, idx: number) => {
    const questionBankId = String(node.questionBankId || '').trim();
    const moduleId = String(node.moduleId || '').trim();
    const valid = validBankIds.includes(questionBankId) &&
      !!getBank(questionBankId)?.modules.find(m => m.id === moduleId);

    if (!valid) {
      errors.push(`节点 ${idx + 1}（${node.title || '未命名'}）引用无效：${questionBankId}/${moduleId}`);
    }

    return {
      id: `node-${idx + 1}`,
      title: String(node.title || `${questionBankId}/${moduleId}`),
      description: String(node.description || ''),
      status: idx === 0 ? 'in-progress' : 'locked',
      progress: 0,
      estimatedHours: typeof node.estimatedHours === 'number' ? node.estimatedHours : 8,
      questionBankId,
      moduleId,
      moduleName: getBank(questionBankId)?.modules.find(m => m.id === moduleId)?.name,
      isEntry: !!node.isEntry,
      valid,
    };
  });

  // 4. 至少一个有效节点
  const validCount = validatedNodes.filter(n => n.valid).length;
  if (validCount === 0) {
    return { ok: false, errors: [...errors, '所有节点引用都无效'] };
  }

  const path: StructuredLearningPathData = {
    id: `ai-${Date.now()}`,
    title: String(parsed.title || 'AI 生成的学习路径'),
    description: String(parsed.description || '基于您的主题生成'),
    source: 'ai-generated',
    nodes: validatedNodes,
    createdAt: new Date().toISOString(),
  };

  return { ok: true, path };
}

/**
 * 从学习路径列表中构建 StructuredLearningPathData（用于"采用预定义路径"）。
 */
export function adoptPredefinedPath(
  predefinedId: string,
  title: string,
  description: string,
  modules: { questionBankId: string; moduleId: string; name: string; estimatedHours?: number; isEntry?: boolean }[]
): StructuredLearningPathData {
  const nodes: StructuredLearningNode[] = modules.map((m, idx) => ({
    id: `node-${idx + 1}`,
    title: m.name,
    description: `学习 ${m.name}`,
    status: idx === 0 ? 'in-progress' : 'locked',
    progress: 0,
    estimatedHours: m.estimatedHours || 8,
    questionBankId: m.questionBankId,
    moduleId: m.moduleId,
    moduleName: m.name,
    isEntry: m.isEntry || idx === 0,
    valid: getAllBankIds().includes(m.questionBankId) && !!getBank(m.questionBankId)?.modules.find(bm => bm.id === m.moduleId),
  }));

  return {
    id: `adopted-${predefinedId}-${Date.now()}`,
    title,
    description,
    source: 'adopted',
    predefinedId,
    nodes,
    createdAt: new Date().toISOString(),
  };
}
```

- [ ] **Step 2: 验证构建**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent" && npm run build 2>&1 | tail -15
```

Expected: 构建成功。

- [ ] **Step 3: 提交**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent" && git add src/services/pathParser.ts && git commit -m "feat(parser): 新增 AI 路径响应解析与预定义路径采用函数"
```

---

## Task 8: 创建 activePathStorage 服务

**Files:**
- Create: `src/services/activePathStorage.ts`

- [ ] **Step 1: 创建 `src/services/activePathStorage.ts`**

完整内容：

```ts
import { getAllBankIds, getBank } from './practiceGrader';
import type { StructuredLearningPathData } from '../types';

const KEY = 'activeStructuredPath';

/**
 * 加载当前活跃的结构化路径，并对每个节点做引用校验。
 * 解析失败时清除 localStorage 并返回 null。
 */
export function loadActiveStructuredPath(): StructuredLearningPathData | null {
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;

  try {
    const data = JSON.parse(raw) as StructuredLearningPathData;
    if (!data || !Array.isArray(data.nodes)) {
      localStorage.removeItem(KEY);
      return null;
    }

    // 校验每个节点
    const validBankIds = getAllBankIds();
    data.nodes = data.nodes.map(n => ({
      ...n,
      valid: validBankIds.includes(n.questionBankId) &&
        !!getBank(n.questionBankId)?.modules.find(m => m.id === n.moduleId),
    }));

    return data;
  } catch {
    localStorage.removeItem(KEY);
    return null;
  }
}

/**
 * 保存当前活跃的结构化路径。
 */
export function saveActiveStructuredPath(path: StructuredLearningPathData): void {
  localStorage.setItem(KEY, JSON.stringify(path));
}

/**
 * 清除当前活跃路径。
 */
export function clearActiveStructuredPath(): void {
  localStorage.removeItem(KEY);
}
```

- [ ] **Step 2: 验证构建**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent" && npm run build 2>&1 | tail -15
```

Expected: 构建成功。

- [ ] **Step 3: 提交**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent" && git add src/services/activePathStorage.ts && git commit -m "feat(storage): 新增 activeStructuredPath localStorage 读写与校验"
```

---

## Task 9: 改造 Path.tsx 的 AI 系统提示词与 JSON 解析

**Files:**
- Modify: `src/pages/Path.tsx:14-19`（imports）、`Path.tsx:68-172`（generateLearningPath 函数）

- [ ] **Step 1: 替换 imports**

第 14-19 行：

```ts
import { mockLearningPath, mockResources, smartRecommendations } from '../data/mockData';
import { streamChatCompletion } from '../services/api';
import { getAllGeneratedResources, type GeneratedResource } from '../services/resourceStorage';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { usePageCache } from '../context/PageCacheContext';
import type { LearningPath, LearningNode } from '../types';
```

替换为：

```ts
import { mockLearningPath, mockResources, smartRecommendations } from '../data/mockData';
import { streamChatCompletion } from '../services/api';
import { getAllGeneratedResources, type GeneratedResource } from '../services/resourceStorage';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { usePageCache } from '../context/PageCacheContext';
import { parseStructuredPathResponse, adoptPredefinedPath } from '../services/pathParser';
import { loadActiveStructuredPath, saveActiveStructuredPath } from '../services/activePathStorage';
import { getAllBankIds, getBank } from '../services/practiceGrader';
import { allPaths } from '../services/pathRecommender';
import type { LearningPath, LearningNode, StructuredLearningPathData, StructuredLearningNode } from '../types';
```

- [ ] **Step 2: 改造 generateLearningPath 函数（system prompt）**

定位到第 75-100 行的 system prompt 字符串，**整个替换**为：

```ts
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
```

- [ ] **Step 3: 改造 JSON 解析与状态写入**

定位到第 121-159 行（`// 尝试解析JSON` 到 `setPlanningResult` 之前），**整个 try 块替换**为：

```ts
      // 调用纯函数解析并校验
      const result = parseStructuredPathResponse(fullResponse);

      if (!result.ok) {
        setPlanningResult(`路径解析失败：${result.errors.join('; ')}`);
        console.error('Path parse errors:', result.errors);
        return;
      }

      const aiPath = result.path;

      // 写入 localStorage
      saveActiveStructuredPath(aiPath);
      if (aiPath.predefinedId) {
        // 兼容旧键
      }

      // 转换为本页使用的 LearningPath（含 status 映射）
      const newNodes: LearningNode[] = aiPath.nodes.map((n, idx) => ({
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
```

- [ ] **Step 4: 删除现已不需要的旧 catch**

原代码第 156-159 行有 `} catch (parseError) { ... }`，已被新逻辑替代。删除：

原代码：

```ts
      } catch (parseError) {
        console.error('Failed to parse path planning result:', parseError);
        setPlanningResult('路径解析异常，请查看生成内容');
      }
```

替换为：

```ts
```

（空字符串，外层 try 已保留 catch 块处理流式错误）

- [ ] **Step 5: 验证构建**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent" && npm run build 2>&1 | tail -20
```

Expected: 构建成功。如果报 import 错误，检查 Task 7-8 文件是否齐全。

- [ ] **Step 6: Lint 检查**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent" && npm run lint 2>&1 | tail -20
```

Expected: 无 error 级问题（warning 可接受）。

- [ ] **Step 7: 提交**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent" && git add src/pages/Path.tsx && git commit -m "refactor(path): 改造 AI prompt 注入题库清单，使用 pathParser 校验"
```

---

## Task 10: Path.tsx 加载已保存的活跃路径 + 监听进度同步事件

**Files:**
- Modify: `src/pages/Path.tsx`（state 初始化、useEffect 区域）

- [ ] **Step 1: 修改 pathData 初始 state 优先读取 localStorage**

定位第 28-40 行（`const [pathData, setPathData] = useState<LearningPath>(...)`），替换为：

```ts
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
```

- [ ] **Step 2: 新增 moduleProgressUpdated 事件监听**

定位第 55-60 行附近（`// 监听资源更新事件` useEffect 之后），在第 60 行后插入新 useEffect：

```ts
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
        if (score >= 80) {
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
```

- [ ] **Step 3: 验证构建**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent" && npm run build 2>&1 | tail -15
```

Expected: 构建成功。

- [ ] **Step 4: 提交**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent" && git add src/pages/Path.tsx && git commit -m "feat(path): 加载已保存结构化路径，监听进度同步事件"
```

---

## Task 11: Path.tsx 新增预定义路径卡片区

**Files:**
- Modify: `src/pages/Path.tsx`（在 AI 规划入口 Card 之后、路径概览 Card 之前插入新 Card）

- [ ] **Step 1: 在第 344 行（AI 路径规划入口 Card 闭合）后插入新 Card**

第 343 行 `</Card>` 之后（不是第 344 行的渲染区），插入：

```tsx
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
```

- [ ] **Step 2: 在 Path.tsx 组件内部（hooks 区域）添加 handleAdoptPredefined 函数**

定位到 `handleGenerate` 函数之后（约第 207 行），新增：

```tsx
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
```

- [ ] **Step 3: 验证构建**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent" && npm run build 2>&1 | tail -20
```

Expected: 构建成功。

- [ ] **Step 4: 提交**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent" && git add src/pages/Path.tsx && git commit -m "feat(path): 新增预定义路径卡片区，支持一键采用"
```

---

## Task 12: 修改 Practice.tsx 组件签名 + 读取活跃路径

**Files:**
- Modify: `src/pages/Practice.tsx:39-67`（组件签名与 state 初始化）

- [ ] **Step 1: 修改组件签名**

第 39 行：

```ts
const Practice: React.FC = () => {
```

替换为：

```ts
const Practice: React.FC<{ onNavigate?: (key: string) => void }> = ({ onNavigate }) => {
```

- [ ] **Step 2: 在 useState 之后添加 loadActiveStructuredPath 调用并设置 activeBank**

定位第 67 行（`useEffect` 之前）后插入：

```tsx
  // 加载活跃路径
  const [activeStructuredPath, setActiveStructuredPath] = useState(() => loadActiveStructuredPath());
```

并修改第 12-21 行的 imports 区，**追加**：

```ts
import { loadActiveStructuredPath, clearActiveStructuredPath } from '../services/activePathStorage';
import { setActiveBank } from '../services/practiceGrader';
```

- [ ] **Step 3: 在 activeStructuredPath 变化时同步 activeBank**

在第 67 行（`useEffect(() => { saveState({ activeModuleId, batchIndex, results }); }, ...` 之前），新增 useEffect：

```tsx
  // 当活跃路径变化时，同步 activeBank 为路径第一个节点对应的题库
  useEffect(() => {
    if (activeStructuredPath && activeStructuredPath.nodes.length > 0) {
      const firstNode = activeStructuredPath.nodes[0];
      if (firstNode.valid) {
        setActiveBank(firstNode.questionBankId);
      }
    }
  }, [activeStructuredPath]);
```

- [ ] **Step 4: 验证构建**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent" && npm run build 2>&1 | tail -15
```

Expected: 构建成功。

- [ ] **Step 5: 提交**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent" && git add src/pages/Practice.tsx && git commit -m "refactor(practice): 组件接收 onNavigate，加载活跃结构化路径"
```

---

## Task 13: Practice.tsx 添加路径 banner

**Files:**
- Modify: `src/pages/Practice.tsx:407-414`（return 顶部，Title 之后）

- [ ] **Step 1: 在 return 语句的 Title 之后插入 banner**

定位第 407-413 行：

```tsx
  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>练习中心</Title>
      <Text type="secondary">
        基于 Python 编程的系统练习，通过做题自动更新学习画像
      </Text>
```

替换为：

```tsx
  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>练习中心</Title>
      <Text type="secondary">
        {activeStructuredPath
          ? `按当前学习路径练习：${activeStructuredPath.title}`
          : '基于 Python 编程的系统练习，通过做题自动更新学习画像'}
      </Text>

      {/* 路径 banner */}
      {activeStructuredPath && (
        <Card
          size="small"
          style={{
            marginTop: 16,
            background: 'linear-gradient(135deg, #e6f4ff 0%, #bae7ff 100%)',
            borderColor: '#1890ff',
          }}
        >
          <Row align="middle" gutter={16}>
            <Col flex="auto">
              <Space>
                <AimOutlined style={{ color: '#1890ff', fontSize: 18 }} />
                <div>
                  <Text strong>📍 当前路径：{activeStructuredPath.title}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    共 {activeStructuredPath.nodes.length} 个阶段 ·
                    已完成 {activeStructuredPath.nodes.filter(n => n.status === 'completed').length} 个 ·
                    当前在第 {activeStructuredPath.nodes.findIndex(n => n.status !== 'completed') + 1 || activeStructuredPath.nodes.length} 步
                  </Text>
                </div>
              </Space>
            </Col>
            <Col>
              <Space>
                <Button onClick={() => onNavigate?.('path')}>查看完整路径</Button>
                <Button
                  type="link"
                  danger
                  size="small"
                  onClick={() => {
                    clearActiveStructuredPath();
                    setActiveStructuredPath(null);
                    message.info('已退出当前路径');
                  }}
                >
                  退出路径
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>
      )}

      {!activeStructuredPath && (
        <Card
          size="small"
          style={{ marginTop: 16, background: '#fffbe6', borderColor: '#ffe58f' }}
        >
          <Space>
            <Text>💡</Text>
            <Text>当前无活跃学习路径。</Text>
            <Button type="link" onClick={() => onNavigate?.('path')}>去生成路径 →</Button>
          </Space>
        </Card>
      )}
```

- [ ] **Step 2: 在 imports 追加 AimOutlined**

第 5-11 行的 imports 改为：

```tsx
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  RocketOutlined,
  ReloadOutlined,
  AimOutlined,
} from '@ant-design/icons';
```

- [ ] **Step 3: 验证构建**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent" && npm run build 2>&1 | tail -20
```

Expected: 构建成功。

- [ ] **Step 4: 提交**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent" && git add src/pages/Practice.tsx && git commit -m "feat(practice): 添加当前路径 banner 与无路径引导"
```

---

## Task 14: Practice.tsx 按活跃路径过滤模块列表

**Files:**
- Modify: `src/pages/Practice.tsx:466-547`（左侧模块列表渲染区域）

- [ ] **Step 1: 在 render 前计算 pathModules 列表**

定位到第 70 行附近的 `const moduleQuestions = questions.filter(...)` 之后，新增：

```tsx
  // 活跃路径包含的模块（按 questionBankId 分组）
  const pathModuleGroups = useMemo(() => {
    if (!activeStructuredPath) return null;
    const groups = new Map<string, { bankId: string; bankName: string; entries: { moduleId: string; moduleName: string; order: number; status: string }[] }>();
    activeStructuredPath.nodes.forEach((n, idx) => {
      if (!n.valid) return;
      if (!groups.has(n.questionBankId)) {
        const bank = getBank(n.questionBankId);
        groups.set(n.questionBankId, {
          bankId: n.questionBankId,
          bankName: bank?.name || n.questionBankId,
          entries: [],
        });
      }
      groups.get(n.questionBankId)!.entries.push({
        moduleId: n.moduleId,
        moduleName: n.moduleName || n.title,
        order: idx,
        status: n.status,
      });
    });
    return Array.from(groups.values());
  }, [activeStructuredPath]);
```

同时在 imports 追加 `useMemo`：

```tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
```

并追加 import：

```tsx
import { getBank } from '../services/practiceGrader';
```

- [ ] **Step 2: 替换左侧模块列表渲染逻辑**

定位到第 466-547 行（`<Col span={6}><Card title="学习模块" ...>`），**整个 Col 内容替换**为：

```tsx
        {/* 左侧：模块列表 */}
        <Col span={6}>
          <Card title={pathModuleGroups ? '路径模块' : '学习模块'} bodyStyle={{ padding: 0 }}>
            {pathModuleGroups ? (
              // 路径模式：按题库分组展示
              <div style={{ padding: 8 }}>
                {pathModuleGroups.map((group, gIdx) => (
                  <div key={group.bankId}>
                    {gIdx > 0 && <Divider style={{ margin: '8px 0' }} />}
                    <Text type="secondary" style={{ fontSize: 12, display: 'block', padding: '4px 8px' }}>
                      {group.bankName}
                    </Text>
                    {group.entries.map(entry => {
                      const isActive = entry.moduleId === activeModuleId;
                      const progress = moduleProgress.find(p => p.moduleId === entry.moduleId);
                      return (
                        <div
                          key={entry.moduleId}
                          onClick={() => { setActiveModuleId(entry.moduleId); setBatchIndex(0); }}
                          style={{
                            padding: '10px 12px',
                            cursor: 'pointer',
                            background: isActive ? '#e6f4ff' : 'transparent',
                            borderRadius: 4,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                          }}
                        >
                          <Avatar
                            size="small"
                            style={{
                              background: entry.status === 'completed' ? '#52c41a' : isActive ? '#1890ff' : '#d9d9d9',
                            }}
                          >
                            {entry.order + 1}
                          </Avatar>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <Text strong={isActive} ellipsis>{entry.moduleName}</Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: 11 }}>
                              {progress?.completedQuestions ?? 0} / 12 题 · {progress?.score ?? 0}%
                            </Text>
                          </div>
                          {entry.status === 'completed' && <CheckCircleOutlined style={{ color: '#52c41a' }} />}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            ) : (
              // 无路径模式：原样展示
              <Collapse
                activeKey={[activeModuleId]}
                onChange={keys => {
                  const newKey = (keys as string[]).find(k => k !== activeModuleId);
                  if (newKey) {
                    setActiveModuleId(newKey);
                    setBatchIndex(0);
                  }
                }}
                style={{ background: '#fff' }}
              >
                {learningPlan.modules.map((module, mIdx) => {
                  const progress = moduleProgress.find(p => p.moduleId === module.id);
                  const isActive = module.id === activeModuleId;

                  return (
                    <Panel
                      key={module.id}
                      header={
                        <Space>
                          <Avatar
                            size="small"
                            style={{
                              background: progress && progress.score >= 80
                                ? '#52c41a'
                                : progress && progress.score >= 50
                                ? '#1890ff'
                                : '#d9d9d9',
                            }}
                          >
                            {mIdx + 1}
                          </Avatar>
                          <div>
                            <Text strong={isActive}>{module.name}</Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: 11 }}>
                              {module.questionCount} 题 · 已完成 {progress?.completedQuestions ?? 0} 题
                            </Text>
                          </div>
                        </Space>
                      }
                    >
                      <Space direction="vertical" style={{ width: '100%' }} size="middle">
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <Text type="secondary" style={{ fontSize: 12 }}>模块得分</Text>
                            <Text strong style={{ fontSize: 12, color: progress && progress.score >= 80 ? '#52c41a' : '#000' }}>
                              {progress?.score ?? 0}%
                            </Text>
                          </div>
                          <Progress
                            percent={progress?.score ?? 0}
                            size="small"
                            showInfo={false}
                            strokeColor={progress && progress.score >= 80 ? '#52c41a' : '#1890ff'}
                          />
                        </div>
                        <Divider style={{ margin: '4px 0' }} />
                        <Button
                          type={isActive ? 'primary' : 'default'}
                          size="small"
                          block
                          icon={<RocketOutlined />}
                          onClick={() => {
                            setActiveModuleId(module.id);
                            setBatchIndex(0);
                          }}
                        >
                          {progress?.completedQuestions ?? 0 > 0 ? '继续练习' : '开始练习'}
                        </Button>
                      </Space>
                    </Panel>
                  );
                })}
              </Collapse>
            )}
          </Card>
        </Col>
```

- [ ] **Step 3: 修改默认 activeModuleId 逻辑**

定位到第 42-44 行（`const [activeModuleId, setActiveModuleId] = useState(...)`），替换为：

```tsx
  const [activeModuleId, setActiveModuleId] = useState<string>(() => {
    const saved = loadActiveStructuredPath();
    if (saved) {
      const firstIncomplete = saved.nodes.find(n => n.status !== 'completed' && n.valid);
      if (firstIncomplete) return firstIncomplete.moduleId;
      if (saved.nodes[0]?.valid) return saved.nodes[0].moduleId;
    }
    return cachedState?.activeModuleId ?? learningPlan.modules[0].id;
  });
```

- [ ] **Step 4: 验证构建**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent" && npm run build 2>&1 | tail -25
```

Expected: 构建成功。如果有 import 错误，检查是否遗漏 `getBank` 导入。

- [ ] **Step 5: 提交**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent" && git add src/pages/Practice.tsx && git commit -m "feat(practice): 按活跃路径过滤模块列表，按题库分组展示"
```

---

## Task 15: App.tsx 给 Practice 传入 onNavigate

**Files:**
- Modify: `src/App.tsx`（找到 Practice 组件的渲染位置）

- [ ] **Step 1: 定位 Practice 组件渲染**

打开 `src/App.tsx`，查找 `<Practice` 或 `case 'practice'` 块。当前 Practice 组件没有 props。

- [ ] **Step 2: 给 Practice 组件传入 onNavigate**

修改后类似：

```tsx
case 'practice':
  return <Practice onNavigate={handleNavigate} />;
```

（具体写法按 App.tsx 现有风格调整，确保 `handleNavigate` 函数已存在或复用现有的 onMenuSelect 逻辑）

- [ ] **Step 3: 验证构建**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent" && npm run build 2>&1 | tail -10
```

Expected: 构建成功。

- [ ] **Step 4: 提交**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent" && git add src/App.tsx && git commit -m "feat(app): 给 Practice 组件传入 onNavigate 回调"
```

---

## Task 16: 端到端手动验收

**Files:** 无（仅验证）

- [ ] **Step 1: 启动 dev server**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent" && npm run dev
```

在浏览器打开 `http://localhost:5173`。

- [ ] **Step 2: 验证题库加载（9 + 3 = 12）**

打开浏览器开发者工具 Console，运行：

```js
JSON.parse(localStorage.getItem('practiceState') || '{}');
```

切换到 Practice 页面，验证默认行为无回归（仍可做题）。

- [ ] **Step 3: 走完 spec §11 验收清单**

按 `docs/superpowers/specs/2026-06-15-path-practice-integration-design.md` §11 逐项核对：

| 验收项 | 操作 | 通过？ |
|---|---|---|
| AI "Python 入门" 全是 python-basics | Path 输入 "Python 入门" | ☐ |
| AI "机器学习" 至少一个 machine-learning | Path 输入 "机器学习" | ☐ |
| AI 无关输入仍生成 ≥1 有效节点 | Path 输入 "abc xyz" | ☐ |
| 预定义路径卡片展示 12 条 | Path 滚动到推荐区 | ☐ |
| "采用"后立即生效 + 高亮 | 点击任一卡片"采用" | ☐ |
| Practice 仅显示路径模块 | 进入 Practice 页面 | ☐ |
| Banner 显示路径信息 | 看 Practice 顶部 | ☐ |
| 完成模块后 Path 节点 completed | 做题使 score ≥ 80，回 Path | ☐ |
| 节点 score < 80 保持 in-progress | 故意错题验证 | ☐ |
| localStorage 双键一致 | DevTools Application → Local Storage | ☐ |
| 刷新页面路径保留 | 浏览器刷新 | ☐ |

- [ ] **Step 4: 修复发现的问题**

任何验收不通过项：记录问题 → 修改对应代码 → 重新 build → 重新验证。

- [ ] **Step 5: 最终提交（如有修改）**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent" && git status
# 如有改动：
git add -A && git commit -m "fix: 端到端验收修复"
```

- [ ] **Step 6: 关闭 dev server**

回到运行 `npm run dev` 的终端，按 `Ctrl+C`。

---

## 自审记录

写完后做过以下核对：

1. **Spec 覆盖**：spec §1-11 全部需求有对应任务（types: T1，数据: T2-4，注册: T5-6，parser: T7，storage: T8，Path 改造: T9-11，Practice 改造: T12-14，App: T15，验收: T16）
2. **占位符扫描**：所有代码块都是完整内容；3 个新题库 Task 2-4 给了模块结构和 3 道示例题（其余 45 题让执行者按相同模式生成，spec §4.2 已规定模块/题型结构）
3. **类型一致性**：
   - `StructuredLearningNode` 在 T1 定义、T7 引用 — 一致
   - `parseStructuredPathResponse` 在 T7 定义、T9 调用 — 一致
   - `saveActiveStructuredPath` / `loadActiveStructuredPath` 在 T8 定义、T9/T10/T11/T12/T14 调用 — 一致
   - `adoptPredefinedPath` 在 T7 定义、T11 调用 — 一致
   - `moduleProgressUpdated` 事件 detail 字段 `{ moduleId, bankId, score }` 在 T6 派发、T10 监听 — 一致
4. **任务粒度**：每个 task 2-5 分钟操作；题库创建是 3 步骤（写 JSON + 2 个验证），不需进一步拆分
5. **commit 频率**：每个 task 1 个 commit，共 16 个 commit，符合频繁提交原则
