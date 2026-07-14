import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const inputPaths = [
  path.join(root, 'docs', 'fable-occupation-pack-approved.txt'),
  path.join(root, 'docs', 'pack2-batch1-fable.txt'),
  path.join(root, 'docs', 'pack2-batch2-fable.txt'),
  path.join(root, 'docs', 'pack2-batch3-fable.txt'),
  path.join(root, 'docs', 'pack2-batch4-fable.txt'),
  path.join(root, 'docs', 'pack3-batch1-fable.txt'),
  path.join(root, 'docs', 'pack3-batch2-fable.txt'),
  path.join(root, 'docs', 'pack3-batch3-fable.txt'),
  path.join(root, 'docs', 'pack3-batch4-fable.txt'),
];
const outputPath = path.join(root, 'data', 'occupations.json');

const pack2SourceMap = {
  S1: 'S1',
  S2: 'S3',
  S3: 'S4',
  S4: 'S5',
  S5: 'S6',
  S6: 'S7',
  S7: 'S8',
  S8: 'S9',
};

function normalisePack2Sources(text) {
  return text.replace(/\[(S\d+)\]/g, (match, key) => `[${pack2SourceMap[key] || key}]`);
}

const inputs = [];
for (const inputPath of inputPaths) {
  try {
    const text = (await readFile(inputPath, 'utf8')).replace(/\\t/g, '\t');
    inputs.push(path.basename(inputPath).startsWith('pack2-') ? normalisePack2Sources(text) : text);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}
const input = inputs.join('\n\n');

const clean = (value = '') => value
  .replace(/\s*\(kim_review_pending\)/gi, '')
  .replace(/\s*\[KIM REVIEW:[^\]]+\]/gi, '')
  .replace(/\s*\(KIM REVIEW:[^)]+\)/gi, '')
  .replace(/\s*\(\d+w\)\s*$/gi, '')
  .replace(/\s+/g, ' ')
  .trim();

const sourceMatches = [...input.matchAll(/^\[(S\d+)\]\s+(.+?):\s+(https?:\/\/\S+)$/gm)];
const sources = Object.fromEntries(sourceMatches.map((match) => [match[1], {
  label: clean(match[2]),
  url: match[3],
  accessed: '2026-07-13',
}]));

const headingPattern = /^(\d+)\.\s+([a-z0-9-]+)\s+\|\s+(.+?)\s+\|\s+(.+)$/gm;
const headings = [...input.matchAll(headingPattern)];
const sectorMatches = [...input.matchAll(/^SECTOR:\s+(.+)$/gm)];

function extractBetween(section, start, end) {
  const match = section.match(new RegExp(`${start}[ \\t]*\\r?\\n+([\\s\\S]*?)\\r?\\n+${end}`));
  return clean(match?.[1]);
}

function parseRisk(value) {
  const numeric = Number(value);
  if (Number.isFinite(numeric)) return numeric;
  return { low: 25, medium: 50, high: 75 }[clean(value).toLowerCase()] ?? 50;
}

function normaliseCategory(value) {
  const key = clean(value).toLowerCase().replace(/[- ]+/g, '_');
  return {
    planning: 'judgement',
    documentation: 'admin_processing',
    coordination: 'communication',
    analysis: 'data_work',
    design: 'technical',
    monitoring: 'supervision',
    automatable: 'admin_processing',
    augmented: 'technical',
    human_led: 'judgement',
    automate: 'data_work',
    augment: 'technical',
    human_edge: 'judgement',
    cognitive_routine: 'data_work',
    cognitive_non_routine: 'judgement',
    manual: 'physical',
    interpersonal: 'communication',
  }[key] || key;
}

function normaliseHorizon(value, risk) {
  if (risk <= 25) return '10y+';
  return {
    now: '0-2y',
    '1-3_years': '2-5y',
    '3-5_years': '5-10y',
    '5+_years': '10y+',
  }[clean(value).toLowerCase().replace(/\s+/g, '_')] || clean(value);
}

function normaliseIsco(value) {
  const code = clean(value).replace(/\s*\(verify[^)]*\)$/i, '');
  return /^\d{4}$/.test(code) ? `ISCO-08 ${code}` : code;
}

function sectorAt(index) {
  return clean(sectorMatches.filter((match) => match.index < index).at(-1)?.[1]);
}

function referencedSources(text) {
  return [...new Set([...text.matchAll(/\[(S\d+)\]/g)].map((match) => match[1]))];
}

const occupations = headings.map((heading, index) => {
  const start = heading.index + heading[0].length;
  const summaryIndex = input.indexOf('MACHINE-CHECK SUMMARY', start);
  const end = headings[index + 1]?.index ?? (summaryIndex === -1 ? input.length : summaryIndex);
  const section = input.slice(start, end);
  const tasksBlock = section.match(/Tasks\s*\n#\tTask\tCategory\tBase risk\tHorizon\tWhat this means for you\s*\n([\s\S]*?)\nRisk interpretation/)?.[1] || '';
  const tasks = tasksBlock.split(/\r?\n/).filter((line) => /^\d+\t/.test(line)).map((line) => {
    const [order, task, category, baseRisk, horizon, ...explanation] = line.split('\t');
    const risk = parseRisk(baseRisk);
    return { order: Number(order), task: clean(task), category: normaliseCategory(category), baseRisk: risk, horizon: normaliseHorizon(horizon, risk), explanation: clean(explanation.join(' ')) };
  });
  const faqBlock = section.match(/FAQs\s*\n([\s\S]*?)\nRelated roles/)?.[1] || '';
  const faqs = faqBlock.split(/\r?\n/).filter((line) => /^Q:/.test(line)).map((line) => {
    const match = line.match(/^Q:\s*(.*?)\s+A:\s*([\s\S]+)$/);
    return { question: clean(match?.[1]), answer: clean(match?.[2]) };
  });
  const relatedBlock = section.match(/Related roles\s*\n([\s\S]*?)\nUAE application/)?.[1] || '';
  const related = relatedBlock.split(/\r?\n/).filter((line) => line.includes(':')).map((line) => {
    const separator = line.indexOf(':');
    return { slug: clean(line.slice(0, separator)).replace(/\s*\(60-list\)$/i, ''), reason: clean(line.slice(separator + 1)).replace(/^./, (character) => character.toLowerCase()) };
  });
  const outlook = extractBetween(section, 'Role outlook \\([\\d-]+ words\\)', 'Tasks');
  const riskInterpretation = extractBetween(section, 'Risk interpretation \\([\\d-]+ words\\)', 'Protection plan');
  const protectionPlan = extractBetween(section, 'Protection plan \\([\\d-]+ words\\)', 'FAQs');
  const uae = extractBetween(section, 'UAE application \\([\\d-]+ words\\)', 'Saudi application');
  const saudi = clean(section.match(/Saudi application \([\d-]+ words\)[ \t]*\r?\n+([\s\S]*?)(?:\r?\n+\[S\d+\]|\r?\n+SECTOR:|\r?\n+MACHINE-CHECK SUMMARY|$)/)?.[1]);
  const allText = [outlook, ...tasks.map((task) => task.explanation), riskInterpretation, protectionPlan, ...faqs.flatMap((faq) => [faq.question, faq.answer]), ...related.map((item) => item.reason), uae, saudi].join(' ');
  return {
    order: Number(heading[1]),
    slug: heading[2],
    title: clean(heading[3]),
    isco: normaliseIsco(heading[4]),
    iscoVerified: !/\(verify\b/i.test(heading[4]),
    sector: sectorAt(heading.index),
    outlook,
    tasks,
    riskInterpretation,
    protectionPlan,
    faqs,
    related,
    regions: { uae, 'saudi-arabia': saudi },
    sourceKeys: referencedSources(allText),
    wordCount: clean(allText.replace(/\[S\d+\]/g, '')).split(/\s+/).filter(Boolean).length,
  };
});

const slugs = occupations.map((occupation) => occupation.slug);
if (new Set(slugs).size !== slugs.length) throw new Error('Duplicate occupation slugs found.');
for (const occupation of occupations) {
  if (occupation.wordCount < 650) throw new Error(`${occupation.slug} has only ${occupation.wordCount} words.`);
  if (occupation.tasks.length < 8 || occupation.faqs.length !== 4 || !occupation.regions.uae || !occupation.regions['saudi-arabia']) {
    throw new Error(`${occupation.slug} is missing required content.`);
  }
}

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify({ generatedAt: '2026-07-14', sources, occupations }, null, 2)}\n`, 'utf8');
console.log(`Wrote ${occupations.length} occupations and ${occupations.length * 3} indexable pages to ${outputPath}.`);
console.log(`Word-count range: ${Math.min(...occupations.map((item) => item.wordCount))}-${Math.max(...occupations.map((item) => item.wordCount))}.`);
