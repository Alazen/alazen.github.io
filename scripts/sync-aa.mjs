#!/usr/bin/env node
/**
 * Syncs MODELS in benchmarks/aa-accuracy-vs-hallucination/index.html with live
 * Artificial Analysis Omniscience and AA-Briefcase data.
 *
 * Usage:
 *   node scripts/sync-aa.mjs                  Refresh existing models in place
 *   node scripts/sync-aa.mjs --dry-run        Preview changes without writing
 *   node scripts/sync-aa.mjs --check          Exit 1 if any model has drifted
 *   node scripts/sync-aa.mjs --list [query]   List AA models with full metrics
 *   node scripts/sync-aa.mjs --add slug1,slug2  Add new AA model slugs
 *   node scripts/sync-aa.mjs --input file.json  Use a saved decrypted AA JSON
 *   node scripts/sync-aa.mjs --save-json file.json  Save decrypted AA JSON
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');
const HTML_PATH = path.join(REPO_ROOT, 'benchmarks', 'aa-accuracy-vs-hallucination', 'index.html');

const AA_ORIGIN = 'https://artificialanalysis.ai';
const AA_PAGES = ['/evaluations/omniscience', '/evaluations/aa-briefcase'];
const FETCH_HEADERS = { 'user-agent': 'Mozilla/5.0 (compatible; aa-benchmark-sync/1.0)' };
const SUPPORTED_CREATORS = ['openai', 'google', 'anthropic'];

function printHelp() {
  console.log([
    'Usage: node scripts/sync-aa.mjs [options]',
    '',
    'Options:',
    '  --dry-run             Show planned changes without modifying index.html',
    '  --check               Like --dry-run, exits with code 1 if drift is found',
    '  --list [query]        List live AA models with Omniscience and Briefcase data',
    '  --add slug1,slug2     Add new model slugs (comma-separated) to index.html',
    '  --input <path>        Read decrypted AA JSON from disk instead of fetching live',
    '  --save-json <path>    Write decrypted live AA JSON to disk',
    '  -h, --help            Show this help message',
    '',
    'Note: If a local proxy blocks outbound fetch, clear HTTP_PROXY and HTTPS_PROXY first.'
  ].join('\n'));
}

function parseArgs(argv) {
  const opts = {
    dryRun: false,
    check: false,
    list: false,
    listQuery: '',
    addSlugs: [],
    inputPath: null,
    saveJsonPath: null,
    help: false
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--dry-run') {
      opts.dryRun = true;
    } else if (arg === '--check') {
      opts.dryRun = true;
      opts.check = true;
    } else if (arg === '--list') {
      opts.list = true;
      const next = argv[i + 1];
      if (next && !next.startsWith('-')) {
        opts.listQuery = next;
        i++;
      }
    } else if (arg === '--add') {
      const next = argv[++i];
      if (!next) throw new Error('--add requires a comma-separated list of AA model slugs.');
      for (const s of next.split(',').map(x => x.trim()).filter(Boolean)) {
        opts.addSlugs.push(s);
      }
    } else if (arg === '--input') {
      opts.inputPath = argv[++i];
      if (!opts.inputPath) throw new Error('--input requires a file path.');
    } else if (arg === '--save-json') {
      opts.saveJsonPath = argv[++i];
      if (!opts.saveJsonPath) throw new Error('--save-json requires a file path.');
    } else if (arg === '-h' || arg === '--help') {
      opts.help = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return opts;
}

async function fetchText(url) {
  let res;
  try {
    res = await fetch(url, { headers: FETCH_HEADERS });
  } catch (err) {
    const proxySet = Boolean(process.env.HTTPS_PROXY || process.env.HTTP_PROXY || process.env.https_proxy || process.env.http_proxy);
    const hint = proxySet
      ? ' Proxy env vars (HTTP_PROXY/HTTPS_PROXY) are set; try clearing them before running.'
      : '';
    throw new Error(`Network fetch failed for ${url}: ${err.message}.${hint}`);
  }
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} fetching ${url}`);
  }
  return res.text();
}

async function mapPool(items, concurrency, fn) {
  const results = new Array(items.length);
  let idx = 0;
  async function worker() {
    while (idx < items.length) {
      const cur = idx++;
      results[cur] = await fn(items[cur], cur);
    }
  }
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, worker);
  await Promise.all(workers);
  return results;
}

function tryDecryptPayload(buf, keyHex) {
  if (buf.length < 17) throw new Error('Payload too short');
  const key = Buffer.from(keyHex, 'hex');
  const iv = crypto.createHash('sha256').update(key).digest().subarray(0, 12);
  const ciphertext = buf.subarray(0, buf.length - 16);
  const authTag = buf.subarray(buf.length - 16);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  const compressed = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return JSON.parse(zlib.gunzipSync(compressed).toString('utf8'));
}

async function fetchLiveAAData() {
  const dataUrls = new Set();
  const keys = new Set();
  const chunkPaths = new Set();

  for (const pagePath of AA_PAGES) {
    const html = await fetchText(AA_ORIGIN + pagePath);
    for (const m of html.matchAll(/\/_next\/static\/chunks\/[^"'\s<>]+\.js/g)) chunkPaths.add(m[0]);
    for (const m of html.matchAll(/\/data\/[a-f0-9]+\.txt/g)) dataUrls.add(m[0]);
    for (const m of html.matchAll(/\b[a-f0-9]{64}\b/g)) keys.add(m[0]);
  }

  await mapPool([...chunkPaths], 8, async chunkPath => {
    try {
      const js = await fetchText(AA_ORIGIN + chunkPath);
      for (const m of js.matchAll(/\/data\/[a-f0-9]+\.txt/g)) dataUrls.add(m[0]);
      for (const m of js.matchAll(/\b[a-f0-9]{64}\b/g)) keys.add(m[0]);
    } catch {
      // Ignore individual chunk fetch misses while scanning.
    }
  });

  if (!dataUrls.size || !keys.size) {
    throw new Error(
      `Could not discover AA data URL (${dataUrls.size}) or decryption key (${keys.size}). ` +
      'Artificial Analysis may have changed its bundle format or enabled a bot challenge.'
    );
  }

  for (const dataUrl of dataUrls) {
    let res;
    try {
      res = await fetch(AA_ORIGIN + dataUrl, { headers: FETCH_HEADERS });
    } catch {
      continue;
    }
    if (!res.ok) continue;
    const buf = Buffer.from(await res.arrayBuffer());
    for (const keyHex of keys) {
      try {
        const parsed = tryDecryptPayload(buf, keyHex);
        if (parsed && Array.isArray(parsed.models) && parsed.models.length > 0) {
          return { data: parsed, dataUrl };
        }
      } catch {
        // Key did not match this payload.
      }
    }
  }

  throw new Error(
    `Found ${dataUrls.size} data URL(s) and ${keys.size} key candidate(s), but none decrypted into an AA models payload.`
  );
}

function splitCacheTokens(tok, cacheHitRate) {
  if (!tok) return null;
  if (tok.cacheableInput == null) {
    return {
      nonCacheInput: tok.input,
      cacheRead: 0,
      cacheWrite: 0,
      reasoning: tok.reasoning || 0,
      answer: tok.answer || 0
    };
  }
  if (cacheHitRate == null) return null;
  const cacheRead = tok.cacheableInput * cacheHitRate;
  return {
    nonCacheInput: 0,
    cacheRead,
    cacheWrite: tok.input - cacheRead,
    reasoning: tok.reasoning || 0,
    answer: tok.answer || 0
  };
}

function calcRawCost(split, price) {
  const inputP = price.input;
  const outputP = price.output;
  const cacheHitP = price.cacheHit != null ? price.cacheHit : inputP;
  const cacheWriteP = price.cacheWrite != null ? price.cacheWrite : inputP;
  return {
    nonCacheInput: (split.nonCacheInput / 1e6) * inputP,
    cacheRead: (split.cacheRead / 1e6) * cacheHitP,
    cacheWrite: (split.cacheWrite / 1e6) * cacheWriteP,
    reasoning: (split.reasoning / 1e6) * outputP,
    answer: (split.answer / 1e6) * outputP
  };
}

function blend(a, b, r) {
  return a * (1 - r) + b * r;
}

function computeEvalCost(model, evalKey, fallbackMap) {
  const tok = model.canonicalEvalTokenCounts?.[evalKey];
  if (!tok || model.price1mInputTokens == null || model.price1mOutputTokens == null) return null;
  const split = splitCacheTokens(tok, model.cacheHitRate);
  if (!split) return null;
  const primary = calcRawCost(split, {
    input: model.price1mInputTokens,
    output: model.price1mOutputTokens,
    cacheHit: model.cacheHitPrice,
    cacheWrite: model.cacheWritePrice
  });
  const fb = fallbackMap?.[model.id];
  const rate = fb?.rateByEval?.[evalKey];
  if (rate) {
    const fbCost = calcRawCost(split, fb.fallbackPrice);
    return (
      blend(primary.nonCacheInput, fbCost.nonCacheInput, rate.input) +
      blend(primary.cacheRead, fbCost.cacheRead, rate.input) +
      blend(primary.cacheWrite, fbCost.cacheWrite, rate.input) +
      blend(primary.reasoning, fbCost.reasoning, rate.reasoning) +
      blend(primary.answer, fbCost.answer, rate.output)
    );
  }
  return primary.nonCacheInput + primary.cacheRead + primary.cacheWrite + primary.reasoning + primary.answer;
}

function extractMetrics(aaModel, fallbackMap) {
  const ob = aaModel.omniscienceBreakdown;
  const omniCost = computeEvalCost(aaModel, 'omniscience', fallbackMap);
  const briefCost = computeEvalCost(aaModel, 'briefcase', fallbackMap);
  if (
    !ob ||
    typeof ob.accuracy !== 'number' ||
    typeof ob.hallucinationRate !== 'number' ||
    typeof aaModel.omniscience !== 'number' ||
    typeof aaModel.briefcaseElo !== 'number' ||
    omniCost == null ||
    briefCost == null
  ) {
    return null;
  }
  return {
    accuracy: ob.accuracy,
    hallucinationRate: ob.hallucinationRate,
    netScore: aaModel.omniscience,
    totalCost: Number(omniCost.toFixed(4)),
    briefcaseElo: aaModel.briefcaseElo,
    briefcaseTotalCost: Number(briefCost.toFixed(4))
  };
}

function deriveFamily(shortName) {
  return shortName.replace(/\s*\([^)]*\)\s*$/, '').trim() || shortName;
}

function jsString(str) {
  return "'" + String(str).replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
}

function formatModelsBlock(models, eol) {
  const lines = ['  const MODELS = ['];
  for (let i = 0; i < models.length; i++) {
    const m = models[i];
    if (i > 0 && models[i - 1].family !== m.family) {
      lines.push('');
    }
    const comma = i < models.length - 1 ? ',' : '';
    lines.push(
      `    { slug: ${jsString(m.slug)}, family: ${jsString(m.family)}, shortName: ${jsString(m.shortName)}, ` +
      `creatorSlug: ${jsString(m.creatorSlug)}, creatorName: ${jsString(m.creatorName)}, ` +
      `accuracy: ${m.accuracy}, hallucinationRate: ${m.hallucinationRate}, netScore: ${m.netScore}, ` +
      `totalCost: ${m.totalCost}, briefcaseElo: ${m.briefcaseElo}, briefcaseTotalCost: ${m.briefcaseTotalCost} }${comma}`
    );
  }
  lines.push('  ];');
  return lines.join(eol);
}

function readCurrentModels(html) {
  const match = html.match(/  const MODELS = \[[\s\S]*?\r?\n  \];/);
  if (!match) throw new Error('Could not locate const MODELS = [...] block in index.html');
  const arrLiteral = match[0].replace(/^  const MODELS = /, '').replace(/;$/, '');
  const models = new Function(`return (${arrLiteral});`)();
  if (!Array.isArray(models)) throw new Error('Parsed MODELS is not an array');
  return { models, matchText: match[0] };
}

function checkBounds(html, models) {
  const warnings = [];
  const metricsBlockMatch = html.match(/  const METRICS = \{[\s\S]*?\r?\n  \};/);
  if (!metricsBlockMatch) return warnings;
  const metricsBlock = metricsBlockMatch[0];

  const maxTotalCost = Math.max(...models.map(m => m.totalCost));
  const minTotalCost = Math.min(...models.map(m => m.totalCost));
  const maxBriefElo = Math.max(...models.map(m => m.briefcaseElo));
  const minBriefElo = Math.min(...models.map(m => m.briefcaseElo));
  const maxBriefCost = Math.max(...models.map(m => m.briefcaseTotalCost));
  const minBriefCost = Math.min(...models.map(m => m.briefcaseTotalCost));

  const tcMatch = metricsBlock.match(/\btotalCost:\s*\{[\s\S]*?baseBounds:\s*\(\)\s*=>\s*\(state\.costScale === 'log' \? \[([^,]+),\s*([^\]]+)\] : \[([^,]+),\s*([^\]]+)\]\)/);
  if (tcMatch) {
    const [, logMin, logMax, linMin, linMax] = tcMatch.map(Number);
    if (minTotalCost < logMin || maxTotalCost > logMax) {
      warnings.push(`totalCost [${minTotalCost}, ${maxTotalCost}] exceeds log baseBounds [${logMin}, ${logMax}]`);
    }
    if (minTotalCost < linMin || maxTotalCost > linMax) {
      warnings.push(`totalCost [${minTotalCost}, ${maxTotalCost}] exceeds linear baseBounds [${linMin}, ${linMax}]`);
    }
  }

  const eloMatch = metricsBlock.match(/\bbriefcaseElo:\s*\{[\s\S]*?baseBounds:\s*\(\)\s*=>\s*\[([^,]+),\s*([^\]]+)\]/);
  if (eloMatch) {
    const [, eloMin, eloMax] = eloMatch.map(Number);
    if (minBriefElo < eloMin || maxBriefElo > eloMax) {
      warnings.push(`briefcaseElo [${minBriefElo}, ${maxBriefElo}] exceeds baseBounds [${eloMin}, ${eloMax}]`);
    }
  }

  const bcMatch = metricsBlock.match(/\bbriefcaseTotalCost:\s*\{[\s\S]*?baseBounds:\s*\(\)\s*=>\s*\(state\.costScale === 'log' \? \[([^,]+),\s*([^\]]+)\] : \[([^,]+),\s*([^\]]+)\]\)/);
  if (bcMatch) {
    const [, logMin, logMax, linMin, linMax] = bcMatch.map(Number);
    if (minBriefCost < logMin || maxBriefCost > logMax) {
      warnings.push(`briefcaseTotalCost [${minBriefCost}, ${maxBriefCost}] exceeds log baseBounds [${logMin}, ${logMax}]`);
    }
    if (minBriefCost < linMin || maxBriefCost > linMax) {
      warnings.push(`briefcaseTotalCost [${minBriefCost}, ${maxBriefCost}] exceeds linear baseBounds [${linMin}, ${linMax}]`);
    }
  }

  return warnings;
}

function updateHtmlCounts(html, models) {
  const total = models.length;
  const counts = {
    openai: models.filter(m => m.creatorSlug === 'openai').length,
    google: models.filter(m => m.creatorSlug === 'google').length,
    anthropic: models.filter(m => m.creatorSlug === 'anthropic').length
  };

  let out = html;
  out = out.replace(
    /(<meta name="description" content="AA-Omniscience and AA-Briefcase benchmarks across )\d+( OpenAI, Google, and Anthropic model variants)/,
    `$1${total}$2`
  );
  out = out.replace(
    /(<span id="model-trigger-label">Models \()\d+\/\d+(\)<\/span>)/,
    `$1${total}/${total}$2`
  );
  out = out.replace(/(<span class="legend-count" id="count-openai">\()\d+(\)<\/span>)/, `$1${counts.openai}$2`);
  out = out.replace(/(<span class="legend-count" id="count-google">\()\d+(\)<\/span>)/, `$1${counts.google}$2`);
  out = out.replace(/(<span class="legend-count" id="count-anthropic">\()\d+(\)<\/span>)/, `$1${counts.anthropic}$2`);
  out = out.replace(
    /(<svg class="plot" id="plot" role="img" aria-label="Scatter plot comparing AA-Omniscience and AA-Briefcase metrics across )\d+( OpenAI, Google, and Anthropic models\."><\/svg>)/,
    `$1${total}$2`
  );
  return out;
}

function validateHtmlScript(html) {
  const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
  if (!scriptMatch) throw new Error('Could not find <script> block in index.html');
  new Function(scriptMatch[1]);
}

function insertModel(models, newEntry) {
  const sameFamilyIdx = models.map(m => m.family).lastIndexOf(newEntry.family);
  if (sameFamilyIdx >= 0) {
    models.splice(sameFamilyIdx + 1, 0, newEntry);
    return;
  }
  const sameCreatorIdx = models.map(m => m.creatorSlug).lastIndexOf(newEntry.creatorSlug);
  if (sameCreatorIdx >= 0) {
    models.splice(sameCreatorIdx + 1, 0, newEntry);
    return;
  }
  models.push(newEntry);
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    printHelp();
    return;
  }

  let data;
  let sourceLabel;
  if (opts.inputPath) {
    const resolved = path.resolve(opts.inputPath);
    data = JSON.parse(fs.readFileSync(resolved, 'utf8'));
    sourceLabel = resolved;
  } else {
    const live = await fetchLiveAAData();
    data = live.data;
    sourceLabel = `${AA_ORIGIN}${live.dataUrl}`;
    if (opts.saveJsonPath) {
      const outPath = path.resolve(opts.saveJsonPath);
      fs.writeFileSync(outPath, JSON.stringify(data));
      console.log(`Saved decrypted AA payload to ${outPath}`);
    }
  }

  const fallbackMap = data.priceFallbackByModelId || {};
  const bySlug = new Map((data.models || []).map(m => [m.slug, m]));
  const html = fs.readFileSync(HTML_PATH, 'utf8');
  const eol = html.includes('\r\n') ? '\r\n' : '\n';
  const { models, matchText } = readCurrentModels(html);
  const existingSlugs = new Set(models.map(m => m.slug));

  console.log(`Source: ${sourceLabel} (${bySlug.size} total AA models)`);

  if (opts.list) {
    const re = opts.listQuery ? new RegExp(opts.listQuery, 'i') : null;
    const rows = [];
    for (const m of data.models || []) {
      const metrics = extractMetrics(m, fallbackMap);
      if (!metrics) continue;
      const label = `${m.slug} ${m.shortName || m.name || ''} ${m.creator?.name || ''}`;
      if (re && !re.test(label)) continue;
      rows.push({
        slug: m.slug,
        shortName: m.shortName || m.name,
        creator: m.creator?.slug || 'unknown',
        inChart: existingSlugs.has(m.slug),
        ...metrics
      });
    }
    rows.sort((a, b) => b.briefcaseElo - a.briefcaseElo);
    console.log(`Models with complete Omniscience + Briefcase metrics: ${rows.length}`);
    for (const r of rows) {
      const tag = r.inChart ? '[in chart]' : '          ';
      console.log(
        `${tag} ${r.slug.padEnd(34)} | ${(r.shortName || '').padEnd(32)} | ` +
        `acc ${(r.accuracy * 100).toFixed(1)}% | hal ${(r.hallucinationRate * 100).toFixed(1)}% | ` +
        `cost $${r.totalCost.toFixed(2).padStart(7)} | elo ${r.briefcaseElo.toFixed(1).padStart(6)} | ` +
        `bCost $${r.briefcaseTotalCost.toFixed(2).padStart(7)}`
      );
    }
    return;
  }

  const updatedModels = models.map(m => ({ ...m }));
  const metricKeys = ['accuracy', 'hallucinationRate', 'netScore', 'totalCost', 'briefcaseElo', 'briefcaseTotalCost'];
  const changes = [];
  const missing = [];

  for (const entry of updatedModels) {
    const aaModel = bySlug.get(entry.slug);
    if (!aaModel) {
      missing.push(entry.slug);
      continue;
    }
    const live = extractMetrics(aaModel, fallbackMap);
    if (!live) {
      missing.push(`${entry.slug} (incomplete metrics on AA)`);
      continue;
    }
    const fieldDiffs = [];
    for (const key of metricKeys) {
      if (Math.abs(live[key] - entry[key]) > 1e-12) {
        fieldDiffs.push(`${key}: ${entry[key]} -> ${live[key]}`);
        entry[key] = live[key];
      }
    }
    if (fieldDiffs.length) {
      changes.push({ type: 'update', slug: entry.slug, details: fieldDiffs.join(', ') });
    }
  }

  const unsupportedCreators = new Set();
  for (const slug of opts.addSlugs) {
    if (existingSlugs.has(slug)) {
      console.log(`Skipping already-present slug: ${slug}`);
      continue;
    }
    const aaModel = bySlug.get(slug);
    if (!aaModel) {
      throw new Error(`Requested --add slug not found on AA: ${slug}`);
    }
    const live = extractMetrics(aaModel, fallbackMap);
    if (!live) {
      throw new Error(`Requested --add slug is missing required Omniscience or Briefcase metrics on AA: ${slug}`);
    }
    const shortName = aaModel.shortName || aaModel.name || slug;
    const creatorSlug = aaModel.creator?.slug || 'unknown';
    const creatorName = aaModel.creator?.name || creatorSlug;
    if (!SUPPORTED_CREATORS.includes(creatorSlug)) {
      unsupportedCreators.add(`${creatorName} (${creatorSlug})`);
    }
    const newEntry = {
      slug,
      family: deriveFamily(shortName),
      shortName,
      creatorSlug,
      creatorName,
      ...live
    };
    insertModel(updatedModels, newEntry);
    existingSlugs.add(slug);
    changes.push({
      type: 'add',
      slug,
      details: `${shortName} | acc ${(live.accuracy * 100).toFixed(1)}%, hal ${(live.hallucinationRate * 100).toFixed(1)}%, cost $${live.totalCost}, elo ${live.briefcaseElo}, bCost $${live.briefcaseTotalCost}`
    });
  }

  if (missing.length) {
    console.warn(`Warning: ${missing.length} existing model(s) missing or incomplete on AA: ${missing.join(', ')}`);
  }
  if (unsupportedCreators.size) {
    console.warn(
      `Warning: Added model(s) use creator(s) not wired into the chart legend/colors yet: ${[...unsupportedCreators].join(', ')}. ` +
      'Update ALL_CREATORS, legend buttons, and creatorColor() in index.html.'
    );
  }

  if (!changes.length) {
    console.log(`All ${updatedModels.length} models in index.html already match AA data (0 changes).`);
    return;
  }

  console.log(`Planned changes (${changes.length}):`);
  for (const c of changes) {
    console.log(`  [${c.type.toUpperCase()}] ${c.slug}: ${c.details}`);
  }

  const boundWarnings = checkBounds(html, updatedModels);
  for (const w of boundWarnings) {
    console.warn(`Warning: ${w}. Expand METRICS baseBounds() in index.html if needed.`);
  }

  if (opts.dryRun) {
    console.log('Dry run complete; index.html was not modified.');
    if (opts.check) process.exitCode = 1;
    return;
  }

  const nextBlock = formatModelsBlock(updatedModels, eol);
  let nextHtml = html.replace(matchText, nextBlock);
  nextHtml = updateHtmlCounts(nextHtml, updatedModels);
  validateHtmlScript(nextHtml);

  fs.writeFileSync(HTML_PATH, nextHtml, 'utf8');
  console.log(`Updated ${HTML_PATH} (${updatedModels.length} models).`);
}

main().catch(err => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
