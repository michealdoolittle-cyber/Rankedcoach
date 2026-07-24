import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const defaultOutputPath = path.join(root, "worker", "curated-playlist-research.mjs");
const agentNames = Object.freeze([
  "Astra", "Breach", "Brimstone", "Chamber", "Clove", "Cypher", "Deadlock", "Fade", "Gekko",
  "Harbor", "Iso", "Jett", "KAY/O", "Killjoy", "Miks", "Neon", "Omen", "Phoenix", "Raze",
  "Reyna", "Sage", "Skye", "Sova", "Tejo", "Veto", "Viper", "Vyse", "Waylay", "Yoru"
]);
const mapNames = Object.freeze([
  "Abyss", "Ascent", "Bind", "Breeze", "Corrode", "Fracture", "Haven", "Icebox", "Lotus",
  "Pearl", "Split", "Summit", "Sunset"
]);
const roleNames = Object.freeze(["Controller", "Duelist", "Initiator", "Sentinel", "All Roles"]);
const youtubeIdPattern = /(?:https?:\/\/)?(?:(?:www\.)?youtube\.com\/watch\?[^\s]*?[?&]?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/gi;
const youtubeTimePattern = /[?&]t=(\d+)s\b/gi;
const metadataConcurrency = 10;
const metadataAttempts = 3;

function usage() {
  return [
    "Usage:",
    "  node scripts/import-owner-research-outline.mjs <outline.txt> [output.mjs]",
    "",
    "The outline must group YouTube watch URLs beneath Map, Agent, or Role headings."
  ].join("\n");
}

function targetMetadata(heading = "") {
  if (mapNames.includes(heading)) {
    return Object.freeze({ targetType: "Map", targetName: heading, topicTypeOverride: "Map Knowledge" });
  }
  if (agentNames.includes(heading)) {
    return Object.freeze({ targetType: "Agent", targetName: heading, topicTypeOverride: "Agent" });
  }
  if (roleNames.includes(heading)) {
    return Object.freeze({ targetType: "Role", targetName: heading, topicTypeOverride: "Role" });
  }
  return null;
}

function parseOutline(source = "") {
  const entries = [];
  const seenIds = new Map();
  let heading = "";

  String(source).split(/\r?\n/).forEach((rawLine, index) => {
    const lineNumber = index + 1;
    const line = rawLine.trim();
    if (!line) return;

    if (/^[^:]+:$/.test(line) && !/https?:\/\//i.test(line)) {
      heading = line.slice(0, -1).trim();
      return;
    }

    const idMatches = [...line.matchAll(youtubeIdPattern)];
    if (!idMatches.length) return;

    const ids = [...new Set(idMatches.map(match => match[1]))];
    if (ids.length !== 1) {
      throw new Error(`Line ${lineNumber} contains more than one distinct YouTube video ID.`);
    }

    const target = targetMetadata(heading);
    if (!target) {
      throw new Error(`Line ${lineNumber} is beneath an unknown or missing target heading: ${heading || "(none)"}.`);
    }

    const id = ids[0];
    if (seenIds.has(id)) {
      throw new Error(`YouTube video ${id} is repeated on lines ${seenIds.get(id)} and ${lineNumber}.`);
    }
    seenIds.set(id, lineNumber);

    const offsets = [...new Set([...line.matchAll(youtubeTimePattern)].map(match => Number(match[1])))];
    if (offsets.length > 1) {
      throw new Error(`Line ${lineNumber} contains conflicting YouTube start offsets.`);
    }

    entries.push(Object.freeze({
      ...target,
      id,
      startSeconds: offsets[0] || 0,
      lineNumber
    }));
  });

  if (!entries.length) throw new Error("The outline did not contain any recognized YouTube watch URLs.");
  return Object.freeze(entries);
}

function canonicalHttpsUrl(value = "") {
  if (!value) return "";
  try {
    const url = new URL(value);
    url.protocol = "https:";
    return url.toString();
  } catch {
    return "";
  }
}

async function wait(milliseconds) {
  await new Promise(resolve => setTimeout(resolve, milliseconds));
}

async function fetchYouTubeMetadata(entry, fetchImpl = fetch) {
  const watchUrl = `https://www.youtube.com/watch?v=${entry.id}`;
  const endpoint = new URL("https://www.youtube.com/oembed");
  endpoint.searchParams.set("url", watchUrl);
  endpoint.searchParams.set("format", "json");

  let lastError;
  for (let attempt = 1; attempt <= metadataAttempts; attempt += 1) {
    try {
      const response = await fetchImpl(endpoint, {
        headers: {
          Accept: "application/json",
          "User-Agent": "RankedCoach owner-curated research metadata importer"
        }
      });
      if (!response.ok) {
        throw new Error(`YouTube oEmbed returned HTTP ${response.status}`);
      }

      const metadata = await response.json();
      const title = String(metadata.title || "").trim();
      const channel = String(metadata.author_name || "").trim();
      const thumbnail = canonicalHttpsUrl(metadata.thumbnail_url);
      const channelUrl = canonicalHttpsUrl(metadata.author_url);
      if (!title || !channel || !channelUrl || !thumbnail) {
        throw new Error("YouTube oEmbed omitted required public metadata");
      }

      return Object.freeze({
        id: entry.id,
        platform: "youtube",
        url: watchUrl,
        title,
        channel,
        channelUrl,
        thumbnail,
        sourceKind: "owner-curated-research-video",
        sourceType: "owner-curated-research-video",
        topicTypeOverride: entry.topicTypeOverride,
        targetType: entry.targetType,
        targetName: entry.targetName,
        entities: Object.freeze([entry.targetName]),
        ...(entry.startSeconds > 0 ? { startSeconds: entry.startSeconds } : {}),
        archiveOnly: true,
        researchEligible: true,
        ownerCurated: true
      });
    } catch (error) {
      lastError = error;
      if (attempt < metadataAttempts) await wait(250 * attempt);
    }
  }

  throw new Error(`Could not verify ${entry.id} from line ${entry.lineNumber}: ${lastError?.message || "unknown error"}`);
}

async function mapConcurrent(values, concurrency, callback) {
  const results = new Array(values.length);
  let cursor = 0;
  const worker = async () => {
    while (cursor < values.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await callback(values[index], index);
    }
  };
  await Promise.all(Array.from({ length: Math.min(concurrency, values.length) }, () => worker()));
  return results;
}

function renderModule(sources, verifiedAt = new Date()) {
  const verifiedDate = verifiedAt.toISOString().slice(0, 10);
  return `// Generated by scripts/import-owner-research-outline.mjs.
// Public video metadata only. No transcript or extracted coaching claim is stored here.
export const CURATED_PLAYLIST_RESEARCH_VERIFIED_AT = ${JSON.stringify(verifiedDate)};

export const CURATED_PLAYLIST_RESEARCH_ARCHIVE = Object.freeze(${JSON.stringify(sources, null, 2)}.map(source => Object.freeze({
  ...source,
  entities: Object.freeze(source.entities || [])
})));
`;
}

export async function importOwnerResearchOutline({
  outlinePath,
  outputPath = defaultOutputPath,
  fetchImpl = fetch,
  verifiedAt = new Date()
} = {}) {
  if (!outlinePath) throw new Error("An outlinePath is required.");
  const source = await readFile(outlinePath, "utf8");
  const parsed = parseOutline(source);
  const sources = await mapConcurrent(
    parsed,
    metadataConcurrency,
    entry => fetchYouTubeMetadata(entry, fetchImpl)
  );
  await writeFile(outputPath, renderModule(sources, verifiedAt), "utf8");

  const counts = sources.reduce((result, sourceItem) => {
    result[sourceItem.targetType] = (result[sourceItem.targetType] || 0) + 1;
    if (sourceItem.startSeconds > 0) result.withStartSeconds += 1;
    return result;
  }, { Map: 0, Agent: 0, Role: 0, withStartSeconds: 0 });

  return Object.freeze({
    outputPath,
    sourceCount: sources.length,
    counts: Object.freeze(counts)
  });
}

const isDirectRun = process.argv[1]
  && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  const [outlineArgument, outputArgument] = process.argv.slice(2);
  if (!outlineArgument || outlineArgument === "--help" || outlineArgument === "-h") {
    console.log(usage());
    process.exitCode = outlineArgument ? 0 : 1;
  } else {
    const outlinePath = path.resolve(process.cwd(), outlineArgument);
    const outputPath = outputArgument
      ? path.resolve(process.cwd(), outputArgument)
      : defaultOutputPath;
    const result = await importOwnerResearchOutline({ outlinePath, outputPath });
    console.log(
      `Registered ${result.sourceCount} owner-curated research videos `
      + `(${result.counts.Map} map, ${result.counts.Agent} agent, ${result.counts.Role} role; `
      + `${result.counts.withStartSeconds} with start offsets) in ${path.relative(root, result.outputPath)}.`
    );
  }
}
