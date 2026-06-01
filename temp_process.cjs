const fs = require('fs');

const b1 = JSON.parse(fs.readFileSync('temp_batch1.json','utf-8'));
const b2 = JSON.parse(fs.readFileSync('temp_batch2.json','utf-8'));
const b3 = JSON.parse(fs.readFileSync('temp_batch3.json','utf-8'));
const b4 = JSON.parse(fs.readFileSync('temp_batch4.json','utf-8'));

const tagMap = {
  syntax:'syntax', package:'syntax', import:'syntax', comment:'syntax', identifier:'syntax', jvm:'syntax', 'main-signature':'syntax', jdk:'syntax', jre:'syntax',
  datatype:'data-types', array:'data-types', wrapper:'data-types', float:'data-types', boolean:'data-types', char:'data-types', conversion:'data-types', 'string-pool':'data-types', null:'data-types',
  operator:'operators', increment:'operators', ternary:'operators', shift:'operators', mod:'operators', assignment:'operators', logical:'operators', instanceof:'operators',
  flow:'control-flow', for:'control-flow', continue:'control-flow', 'for-each':'control-flow', 'do-while':'control-flow', switch:'control-flow', 'if-else':'control-flow', 'break-label':'control-flow', label:'control-flow',
  method:'functions', 'return-type':'functions', varargs:'functions', recursion:'functions', overriding:'functions', 'static-import':'functions', signature:'functions', return:'functions', 'overload-resolution':'functions',
  oop:'OOP', class:'classes', static:'classes', this:'classes', encapsulation:'classes', constructor:'classes', gc:'classes', 'access-modifier':'classes',
  inheritance:'inheritance', final:'inheritance', abstract:'inheritance', extends:'inheritance', 'object-class':'inheritance', 'final-method':'inheritance',
  polymorphism:'polymorphism', casting:'polymorphism', binding:'polymorphism',
  interface:'interfaces', 'default-method':'interfaces', implements:'interfaces',
  exception:'exceptions', throw:'exceptions', custom:'exceptions', runtime:'exceptions', 'try-multiple-catch':'exceptions', error:'exceptions', finally:'exceptions',
  file:'io', bufferedreader:'io', nio:'io', path:'io', 'io-package':'io', serialization:'io', 'nio-package':'io',
  collection:'collections', list:'collections', set:'collections', comparable:'collections', map:'collections', iterator:'collections', queue:'collections', 'list-ordered':'collections',
  generic:'generics', 'type-erasure':'generics', wildcard:'generics', diamond:'generics', 'type-parameter':'generics',
  annotation:'annotations', override:'annotations', retention:'annotations', deprecated:'annotations', target:'annotations',
  thread:'multithreading', runnable:'multithreading', sleep:'multithreading', volatile:'multithreading', start:'multithreading', join:'multithreading', lock:'multithreading',
  lambda:'lambda', stream:'lambda', functional:'lambda', 'stream-parallel':'lambda', 'method-reference':'lambda',
  knowledgeBase:'data-types', dataType:'data-types', processControl:'control-flow',
  function:'functions', scope:'scope', oop:'OOP', classObj:'classes', inherit:'inheritance',
  polymorphism:'polymorphism', exception:'exceptions', collection:'collections', io:'io', modifier:'classes',
  errorPoint:'errorProne',
};

const moduleMap = {
  'syntax-basics':'module-1', 'data-types':'module-1', 'operators':'module-1', 'flow-control':'module-1',
  'methods':'module-2',
  'oop-basics':'module-3', 'inheritance':'module-3', 'polymorphism':'module-3', 'interfaces':'module-3',
  'exceptions':'module-4', 'file-io':'module-4', 'collections':'module-4', 'generics':'module-4',
  'annotations':'module-4', 'multithreading':'module-4', 'lambda':'module-4',
  'module-1':'module-1', 'module-2':'module-1', 'module-3':'module-1', 'module-4':'module-1', 'module-5':'module-1',
  'module-6':'module-2', 'module-7':'module-2',
  'module-8':'module-3', 'module-9':'module-3', 'module-10':'module-3', 'module-14':'module-3',
  'module-11':'module-4', 'module-12':'module-4', 'module-13':'module-4',
};

function normalizeTags(tags) {
  return [...new Set(tags.map(t => tagMap[t] || t).filter(Boolean))];
}

function normalizeQuestion(q, defaultModule) {
  const normTags = normalizeTags(q.tags);
  const moduleId = moduleMap[q.moduleId] || defaultModule;
  const category = q.difficulty === 'hard' ? 'extension' : 'core';

  let type, correctAnswer, sampleAnswer, options;

  if (q.type === 'multiplechoice' || q.type === 'single') {
    type = 'choice';
    options = q.options || [];
    if (q.multipleChoiceAnswer !== undefined) {
      correctAnswer = options[q.multipleChoiceAnswer] || '';
    } else if (q.answer) {
      const idx = q.answer.charCodeAt(0) - 65;
      correctAnswer = options[idx] || q.answer;
    }
  } else if (q.type === 'fillinblank' || q.type === 'fillblank') {
    type = 'short';
    sampleAnswer = q.fillInBlankAnswer || q.answer || '';
  }

  return {
    id: '',
    moduleId,
    type,
    difficulty: q.difficulty,
    category,
    tags: normTags,
    question: q.question.trim(),
    options,
    correctAnswer,
    sampleAnswer,
    explanation: q.explanation || '',
  };
}

let all = [];
b1.forEach(q => all.push(normalizeQuestion(q, 'module-1')));
b2.forEach(q => all.push(normalizeQuestion(q, 'module-1')));
b3.forEach(q => all.push(normalizeQuestion(q, 'module-1')));
b4.forEach(q => all.push(normalizeQuestion(q, 'module-1')));

console.log('Total before dedup:', all.length);

// Deduplicate
const seen = new Set();
const unique = [];
const skipped = [];
for (const q of all) {
  const key = q.question.toLowerCase().replace(/\s+/g, ' ').trim();
  if (!seen.has(key)) {
    seen.add(key);
    q.id = 'j' + (unique.length + 1);
    unique.push(q);
  } else {
    skipped.push(q.question.substring(0, 50));
  }
}

console.log('After dedup:', unique.length);
console.log('Skipped duplicates:', skipped.length);
if (skipped.length > 0 && skipped.length <= 20) {
  skipped.forEach(s => console.log('  -', s));
}

const modCounts = {};
unique.forEach(q => { modCounts[q.moduleId] = (modCounts[q.moduleId]||0) + 1; });
console.log('By module:', modCounts);

const typeCounts = {};
unique.forEach(q => { typeCounts[q.type] = (typeCounts[q.type]||0) + 1; });
console.log('By type:', typeCounts);

const catCounts = {};
unique.forEach(q => { catCounts[q.category] = (catCounts[q.category]||0) + 1; });
console.log('By category:', catCounts);

fs.writeFileSync('temp_processed.json', JSON.stringify(unique, null, 2));
console.log('Saved temp_processed.json with', unique.length, 'questions');
