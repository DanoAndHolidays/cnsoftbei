/**
 * gen-test-report.ts
 *
 * 读取 test-results/results.json，生成一份中文 HTML 测试报告。
 * 用法：npx tsx scripts/gen-test-report.ts
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const INPUT = path.resolve(__dirname, '../test-results/results.json')
const OUTPUT = path.resolve(__dirname, '../test-results/report.html')

interface TestResult {
  id: string
  name: string
  fullName: string
  status: 'passed' | 'failed' | 'skipped'
  duration: number
  assertionResults: {
    fullName: string
    status: 'passed' | 'failed' | 'skipped'
    failureMessages?: string[]
    duration: number
  }[]
}

interface VitestResult {
  numTotalTests: number
  numPassedTests: number
  numFailedTests: number
  numPendingTests: number
  numTotalTestSuites: number
  startTime: number
  testResults: TestResult[]
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

function generateReport(data: VitestResult): string {
  const totalDuration = data.testResults.reduce(
    (sum, suite) => sum + (suite.duration || 0),
    0,
  )

  const passRate =
    data.numTotalTests > 0
      ? ((data.numPassedTests / data.numTotalTests) * 100).toFixed(1)
      : '0'

  const suiteRows = data.testResults
    .map((suite) => {
      const suiteName = path.basename(suite.name)
      const suiteDuration = formatDuration(suite.duration || 0)
      const passed = suite.assertionResults.filter(
        (a) => a.status === 'passed',
      ).length
      const failed = suite.assertionResults.filter(
        (a) => a.status === 'failed',
      ).length
      const total = suite.assertionResults.length
      const suiteStatus = suite.status === 'passed' ? '通过' : '失败'
      const statusClass = suite.status === 'passed' ? 'pass' : 'fail'

      const detailRows = suite.assertionResults
        .map((assertion) => {
          const aStatus = assertion.status === 'passed' ? '✅ 通过' : '❌ 失败'
          const aClass = assertion.status === 'passed' ? 'pass' : 'fail'
          const errorHtml =
            assertion.status === 'failed' && assertion.failureMessages?.length
              ? `<pre class="error-detail">${escapeHtml(assertion.failureMessages.join('\n'))}</pre>`
              : ''
          return `
          <tr class="${aClass}">
            <td>${escapeHtml(assertion.fullName)}</td>
            <td>${aStatus}</td>
            <td>${formatDuration(assertion.duration || 0)}</td>
          </tr>
          ${errorHtml ? `<tr><td colspan="3">${errorHtml}</td></tr>` : ''}`
        })
        .join('\n')

      return `
      <tr class="${statusClass}">
        <td><strong>${escapeHtml(suiteName)}</strong></td>
        <td>${passed}/${total}</td>
        <td>${failed > 0 ? `<span class="fail">${failed}</span>` : '0'}</td>
        <td>${suiteDuration}</td>
        <td>${suiteStatus}</td>
      </tr>
      <tr class="detail-row"><td colspan="5">
        <table class="detail-table">
          <thead><tr><th>用例</th><th>结果</th><th>耗时</th></tr></thead>
          <tbody>${detailRows}</tbody>
        </table>
      </td></tr>`
    })
    .join('\n')

  const now = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>测试报告 — 学习智能体系统</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, "Microsoft YaHei", sans-serif; background: #f5f5f5; color: #333; padding: 24px; }
  .container { max-width: 1100px; margin: 0 auto; }
  h1 { font-size: 24px; margin-bottom: 8px; }
  .meta { color: #888; font-size: 13px; margin-bottom: 24px; }

  /* 总览卡片 */
  .cards { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; margin-bottom: 32px; }
  .card { background: #fff; border-radius: 8px; padding: 20px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
  .card .num { font-size: 32px; font-weight: 700; }
  .card .label { font-size: 13px; color: #888; margin-top: 4px; }
  .card.pass .num { color: #22c55e; }
  .card.fail .num { color: #ef4444; }
  .card.skip .num { color: #f59e0b; }
  .card.rate .num { color: #3b82f6; }

  /* 结果表格 */
  table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 24px; }
  th { background: #f8f9fa; text-align: left; padding: 12px 16px; font-size: 13px; color: #666; border-bottom: 1px solid #eee; }
  td { padding: 10px 16px; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
  tr.fail > td { background: #fef2f2; }
  tr.pass > td { background: #f0fdf4; }
  tr.detail-row > td { padding: 0; }
  .detail-table { margin: 0; box-shadow: none; }
  .detail-table th { font-size: 12px; padding: 8px 16px 8px 32px; }
  .detail-table td { font-size: 13px; padding: 6px 16px 6px 32px; }
  .error-detail { background: #1e1e1e; color: #f87171; padding: 12px; border-radius: 4px; font-size: 12px; overflow-x: auto; margin: 4px 0; white-space: pre-wrap; }

  /* 覆盖率 */
  .coverage-note { background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 16px; font-size: 13px; color: #92400e; margin-bottom: 24px; }

  .footer { text-align: center; color: #aaa; font-size: 12px; margin-top: 32px; }
</style>
</head>
<body>
<div class="container">
  <h1>📋 测试报告 — 学习智能体系统</h1>
  <p class="meta">生成时间：${now} &nbsp;|&nbsp; 总耗时：${formatDuration(totalDuration)}</p>

  <div class="cards">
    <div class="card"><div class="num">${data.numTotalTests}</div><div class="label">总用例数</div></div>
    <div class="card pass"><div class="num">${data.numPassedTests}</div><div class="label">通过</div></div>
    <div class="card fail"><div class="num">${data.numFailedTests}</div><div class="label">失败</div></div>
    <div class="card skip"><div class="num">${data.numPendingTests}</div><div class="label">跳过</div></div>
    <div class="card rate"><div class="num">${passRate}%</div><div class="label">通过率</div></div>
  </div>

  <h2 style="margin-bottom:12px;">测试套件明细</h2>
  <table>
    <thead>
      <tr><th>测试文件</th><th>通过/总数</th><th>失败</th><th>耗时</th><th>状态</th></tr>
    </thead>
    <tbody>
      ${suiteRows}
    </tbody>
  </table>

  <div class="coverage-note">
    💡 覆盖率报告请运行 <code>npm run test:coverage</code>，结果在 <code>coverage/index.html</code>
  </div>

  <div class="footer">TestVault × 学习智能体系统 · 自动生成</div>
</div>
</body>
</html>`
}

// ==================== 主逻辑 ====================

if (!fs.existsSync(INPUT)) {
  console.error(`❌ 找不到测试结果文件: ${INPUT}`)
  console.error('   请先运行: npm test')
  process.exit(1)
}

const raw = fs.readFileSync(INPUT, 'utf-8')
const data: VitestResult = JSON.parse(raw)

const html = generateReport(data)

fs.mkdirSync(path.dirname(OUTPUT), { recursive: true })
fs.writeFileSync(OUTPUT, html, 'utf-8')

console.log(`✅ 测试报告已生成: ${OUTPUT}`)
console.log(`   总计 ${data.numTotalTests} 个用例，${data.numPassedTests} 通过，${data.numFailedTests} 失败`)
