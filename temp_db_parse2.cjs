const fs = require('fs');
const raw = fs.readFileSync('temp_db_raw.txt', 'utf-8');

const questions = [];
let depth = 0, start = -1;
let inQ = false;

// Extract question objects by tracking brace depth
for (let i = 0; i < raw.length; i++) {
  if (raw[i] === '{') {
    if (depth === 0) start = i;
    depth++;
  } else if (raw[i] === '}') {
    depth--;
    if (depth === 0 && start >= 0) {
      const block = raw.substring(start, i + 1);
      start = -1;
      // Try JSON first, then eval
      let parsed = null;
      try { parsed = JSON.parse(block); } catch(e) {}
      if (!parsed) {
        try { parsed = (new Function('return ' + block))(); } catch(e) {}
      }
      if (parsed && parsed.id) {
        questions.push(parsed);
      }
    }
  }
}

console.log('Parsed', questions.length, 'questions');

// Tag normalization
const tagMap = {
  '数据库基础': 'db-basics', 'SQL基础': 'sql-basics', '数据库约束': 'constraints',
  '数据库索引': 'indexes', '数据库事务': 'transactions', '多表查询': 'joins',
  '数据库设计': 'db-design', '数据库运维': 'db-ops', '数据库类型': 'db-types',
  '存储过程': 'stored-proc', '视图': 'views', '备份恢复': 'backup',
  '系统': 'system', '函数': 'sql-functions', '分页': 'pagination',
  'DISTINCT': 'sql-basics', '实体': 'db-design', 'hash': 'indexes',
  '并发': 'concurrency', '优化': 'optimization', '统计': 'optimization',
  'MVCC': 'concurrency', 'NoSQL': 'nosql', '日志': 'logging',
  '两阶段锁': 'concurrency', 'DCL': 'dcl', '约束': 'constraints',
  '聚合': 'sql-functions', '日期': 'sql-functions', '类型': 'nosql',
  '设计': 'db-design', '反范式': 'db-design', '死锁': 'concurrency',
  'NULL': 'sql-basics',
};

const moduleMap = {
  'module-1': 'module-1', 'module-2': 'module-2', 'module-3': 'module-2',
  'module-4': 'module-3', 'module-5': 'module-4', 'module-6': 'module-2',
  'module-7': 'module-1', 'module-8': 'module-4', 'module-9': 'module-1',
  'db-basic': 'module-2',
};

const normalized = [];
for (const q of questions) {
  const norm = {
    id: '',
    moduleId: moduleMap[q.moduleId] || 'module-2',
    difficulty: q.difficulty || 'easy',
    category: (q.difficulty === 'hard' || q.category === '高级') ? 'extension' : 'core',
    tags: (q.tags || []).map(t => tagMap[t] || t).filter(Boolean),
    question: (q.question || '').trim(),
    explanation: q.explanation || '',
  };

  if (q.type === 'choice') {
    norm.type = 'choice';
    norm.options = q.options || [];
    norm.correctAnswer = q.correctAnswer || '';
  } else if (q.type === 'judge') {
    norm.type = 'truefalse';
    norm.trueFalseAnswer = q.correctAnswer === 'true' || q.correctAnswer === true;
  } else if (q.type === 'short') {
    norm.type = 'short';
    norm.sampleAnswer = q.correctAnswer || '';
  } else if (q.type === 'fill') {
    norm.type = 'short';
    norm.sampleAnswer = q.correctAnswer || '';
  }

  norm.id = 'db' + (normalized.length + 1);
  normalized.push(norm);
}

console.log('Normalized', normalized.length, 'questions');

const mods = {}; normalized.forEach(q => { mods[q.moduleId] = (mods[q.moduleId]||0) + 1; });
console.log('By module:', mods);

const types = {}; normalized.forEach(q => { types[q.type] = (types[q.type]||0) + 1; });
console.log('By type:', types);

const cats = {}; normalized.forEach(q => { cats[q.category] = (cats[q.category]||0) + 1; });
console.log('By category:', cats);

fs.writeFileSync('temp_db_processed.json', JSON.stringify(normalized, null, 2));
console.log('Saved');
