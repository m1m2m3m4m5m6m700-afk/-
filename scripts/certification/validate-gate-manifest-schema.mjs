import fs from "node:fs/promises";
import path from "node:path";

const SCHEMA_PATH = new URL("./schemas/gate-manifest.schema.json", import.meta.url);

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function typeMatches(value, type) {
  if (type === "null") return value === null;
  if (type === "object") return isObject(value);
  if (type === "array") return Array.isArray(value);
  if (type === "integer") return Number.isInteger(value);
  return typeof value === type;
}

function validateNode(value, schema, location) {
  const errors = [];

  if (schema.const !== undefined && value !== schema.const) {
    errors.push(`${location}: expected const ${JSON.stringify(schema.const)}`);
    return errors;
  }

  if (schema.enum && !schema.enum.some((candidate) => Object.is(candidate, value))) {
    errors.push(`${location}: value is not in enum`);
    return errors;
  }

  if (schema.type) {
    const types = Array.isArray(schema.type) ? schema.type : [schema.type];
    if (!types.some((type) => typeMatches(value, type))) {
      errors.push(`${location}: expected type ${types.join("|")}`);
      return errors;
    }
  }

  if (typeof value === "string") {
    if (schema.minLength !== undefined && value.length < schema.minLength) {
      errors.push(`${location}: string shorter than minLength`);
    }
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) {
      errors.push(`${location}: pattern mismatch`);
    }
    if (schema.format === "date-time") {
      const timestamp = Date.parse(value);
      if (!Number.isFinite(timestamp)) errors.push(`${location}: invalid date-time`);
    }
  }

  if (typeof value === "number" && schema.minimum !== undefined && value < schema.minimum) {
    errors.push(`${location}: number below minimum`);
  }

  if (isObject(value)) {
    const required = schema.required ?? [];
    for (const key of required) {
      if (!(key in value)) errors.push(`${location}: missing required property ${key}`);
    }

    if (schema.additionalProperties === false && schema.properties) {
      for (const key of Object.keys(value)) {
        if (!(key in schema.properties)) errors.push(`${location}: unexpected property ${key}`);
      }
    }

    for (const [key, propertySchema] of Object.entries(schema.properties ?? {})) {
      if (key in value) errors.push(...validateNode(value[key], propertySchema, `${location}.${key}`));
    }
  }

  return errors;
}

export async function loadGateManifestSchema() {
  return JSON.parse(await fs.readFile(SCHEMA_PATH, "utf8"));
}

export async function validateGateManifestSchema(manifest) {
  const schema = await loadGateManifestSchema();
  const errors = validateNode(manifest, schema, "manifest");
  return { valid: errors.length === 0, errors, schemaVersion: schema.const ?? schema.properties?.schemaVersion?.const };
}

export async function assertGateManifestSchema(manifest, context = "gate manifest") {
  const result = await validateGateManifestSchema(manifest);
  if (!result.valid) {
    throw new Error(`${context} does not satisfy Gate Manifest Schema v${result.schemaVersion}:\n- ${result.errors.join("\n- ")}`);
  }
  return manifest;
}

async function walk(root) {
  const files = [];
  async function visit(directory) {
    for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
      const full = path.join(directory, entry.name);
      if (entry.isDirectory()) await visit(full);
      else if (entry.name === "gate-manifest.json") files.push(full);
    }
  }
  await visit(root);
  return files;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const root = process.argv[2] ?? `.artifacts`;
  const files = await walk(root);
  if (!files.length) {
    console.error(`No gate-manifest.json files found under ${root}`);
    process.exit(1);
  }
  let failed = false;
  for (const file of files) {
    try {
      const manifest = JSON.parse(await fs.readFile(file, "utf8"));
      const result = await validateGateManifestSchema(manifest);
      if (!result.valid) {
        failed = true;
        console.error(`SCHEMA FAIL: ${file}`);
        result.errors.forEach((error) => console.error(`- ${error}`));
      } else {
        console.log(`SCHEMA PASS: ${file}`);
      }
    } catch (error) {
      failed = true;
      console.error(`SCHEMA FAIL: ${file}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  if (failed) process.exit(1);
}
