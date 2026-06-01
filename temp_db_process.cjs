const fs = require('fs');

const raw = fs.readFileSync('temp_db_raw.txt', 'utf-8');

// Extract all question objects from the raw text
// Each question is a { ... } block
const qBlocks = raw.match(/\{[^}]+\}/g);
if (!qBlocks) { console.log('No questions found'); process.exit(1); }

console.log('Found', qBlocks.length, 'question blocks');

// Parse each block
const questions = [];
for (const block of qBlocks) {
  try {
    // Try direct JSON parse first
    const q = JSON.parse(block);
    questions.push(q);
  } catch(e) {
    // Fix common issues and retry
    try {
      let fixed = block
        .replace(/'/g, '"')  // single quotes to double
        .replace(/,\s*}/g, '}')  // trailing comma
        .replace(/,\s*]/g, ']')  // trailing comma in array
        .replace(/(\w+):/g, '"$1":')  // unquoted keys
        .replace(/"([^"]+)":/g, (m, key) => {
          // Only quote keys that aren't already quoted
          return m;
        });
      // Actually, let's try a different approach
      // The blocks use single quotes for strings, which isn't valid JSON
      // Let's use eval (safe since it's our own document)
      const q = (new Function('return ' + block))();
      questions.push(q);
    } catch(e2) {
      console.log('Failed to parse:', block.substring(0, 80), '...');
    }
  }
}

console.log('Parsed', questions.length, 'questions');

// Tag normalization map
const tagMap = {
  '数据库基础': 'db-basics',
  'SQL基础': 'sql-basics',
  '数据库约束': 'constraints',
  '数据库索引': 'indexes',
  '数据库事务': 'transactions',
  '多表查询': 'joins',
  '数据库设计': 'db-design',
  '数据库运维': 'db-ops',
  '数据库类型': 'db-types',
  '存储过程': 'stored-proc',
  '视图': 'views',
  '备份恢复': 'backup',
  '系统': 'system',
  '函数': 'sql-functions',
  '分页': 'pagination',
  'DISTINCT': 'sql-basics',
  '实体': 'db-design',
  'hash': 'indexes',
  '并发': 'concurrency',
  '优化': 'optimization',
  '统计': 'optimization',
  'MVCC': 'concurrency',
  'NoSQL': 'nosql',
  '日志': 'logging',
  '两阶段锁': 'concurrency',
  'DCL': 'dcl',
  '约束': 'constraints',
  '聚合': 'sql-functions',
  '日期': 'sql-functions',
  '类型': 'nosql',
  '设计': 'db-design',
  '反范式': 'db-design',
  '死锁': 'concurrency',
};

// Module mapping
const moduleMap = {
  'module-1': 'module-1',  // 数据库基础
  'module-2': 'module-2',  // SQL基础
  'module-3': 'module-2',  // 约束 → SQL/DDL
  'module-4': 'module-3',  // 索引
  'module-5': 'module-4',  // 事务
  'module-6': 'module-2',  // 多表查询 → SQL
  'module-7': 'module-1',  // 数据库设计 → 基础理论
  'module-8': 'module-4',  // 运维
  'module-9': 'module-1',  // 数据库类型 → 基础理论
  'db-basic': 'module-2',  // SQL/通用
};

function normalizeTag(tag) {
  return tagMap[tag] || tag;
}

function normalizeModule(q) {
  return moduleMap[q.moduleId] || 'module-2';
}

const normalized = [];
for (const q of questions) {
  const norm = {
    id: '',
    moduleId: normalizeModule(q),
    difficulty: q.difficulty || 'easy',
    category: q.difficulty === 'hard' ? 'extension' : 'core',
    tags: (q.tags || []).map(t => normalizeTag(t)),
    question: (q.question || '').trim(),
    explanation: q.explanation || '',
  };

  if (q.type === 'choice') {
    norm.type = 'choice';
    norm.options = q.options || [];
    norm.correctAnswer = q.correctAnswer || '';
  } else if (q.type === 'judge') {
    norm.type = 'truefalse';
    norm.trueFalseAnswer = q.correctAnswer === 'true';
  } else if (q.type === 'short' || q.type === 'fill') {
    norm.type = 'short';
    norm.sampleAnswer = q.correctAnswer || '';
  }

  norm.id = 'db' + (normalized.length + 1);
  normalized.push(norm);
}

console.log('Normalized', normalized.length, 'questions');

// Counts
const modCounts = {};
normalized.forEach(q => { modCounts[q.moduleId] = (modCounts[q.moduleId]||0) + 1; });
console.log('By module:', modCounts);

const typeCounts = {};
normalized.forEach(q => { typeCounts[q.type] = (typeCounts[q.type]||0) + 1; });
console.log('By type:', typeCounts);

fs.writeFileSync('temp_db_processed.json', JSON.stringify(normalized, null, 2));
console.log('Saved temp_db_processed.json');
