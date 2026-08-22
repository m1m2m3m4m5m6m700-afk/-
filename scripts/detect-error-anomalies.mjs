import fs from 'node:fs';

const file = 'ERROR-MEMORY.md';
if (!fs.existsSync(file)) {
  console.log(JSON.stringify({ event: 'error.anomaly', status: 'no-memory-file' }));
  process.exit(0);
}

const text = fs.readFileSync(file, 'utf8');
const fingerprints = new Map();
for (const line of text.split('\n')) {
  const match = line.match(/fingerprint=([\w.-]+)/);
  if (match) fingerprints.set(match[1], (fingerprints.get(match[1]) || 0) + 1);
}

const threshold = Number(process.env.ERROR_ANOMALY_THRESHOLD || 3);
const anomalies = [...fingerprints.entries()].filter(([, count]) => count >= threshold).map(([fingerprint, count]) => ({ fingerprint, count }));
console.log(JSON.stringify({ event: 'error.anomaly', threshold, anomalies }));
if (anomalies.length) {
  console.error(`Detected ${anomalies.length} repeated error fingerprints.`);
  process.exit(1);
}
