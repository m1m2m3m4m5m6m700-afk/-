import fs from 'node:fs/promises';

const SCHEMA_PATH = new URL('./schemas/baseline.schema.json', import.meta.url);

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function typeMatches(value, type) {
  if (type === 'null') return value === null;
  if (type === 'object') return isObject(value);
  if (type === 'array') return Array.isArray(value);
  if (type === 'integer') return Number.isInteger(value);
  if (type === 'number') return typeof value === 'number' && Number.isFinite(value);
  return typeof value === type;
}

function resolveRef(schema, root) {
  if (!schema.$ref) return schema;
  if (!schema.$ref.startsWith('#/')) throw new Error(`Unsupported schema ref: ${schema.$ref}`);
  return schema.$ref.slice(2).split('/').reduce((node, key) => node?.[key], root) ?? {};
}

function validateNode(value, schema, location, root) {
  const errors = [];
  schema = resolveRef(schema, root);

  if (schema.const !== undefined && value !== schema.const) {
    errors.push(`${location}: expected ${JSON.stringify(schema.const)}`);
    return errors;
  }

  if (schema.enum && !schema.enum.some((candidate) => Object.is(candidate, value))) {
    errors.push(`${location}: value is not allowed`);
    return errors;
  }

  if (schema.type) {
    const types = Array.isArray(schema.type) ? schema.type : [schema.type];
    if (!types.some((type) => typeMatches(value, type))) {
      errors.push(`${location}: expected type ${types.join('|')}`);
      return errors;
    }
  }

  if (typeof value === 'string') {
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) errors.push(`${location}: pattern mismatch`);
    if (schema.minLength !== undefined && value.length < schema.minLength) errors.push(`${location}: string shorter than minLength`);
    if (schema.format === 'date-time' && !Number.isFinite(Date.parse(value))) errors.push(`${location}: invalid date-time`);
  }

  if (typeof value === 'number' && schema.minimum !== undefined && value < schema.minimum) {
    errors.push(`${location}: below minimum`);
  }

  if (Array.isArray(value)) {
    for (const [index, item] of value.entries()) {
      if (schema.items) errors.push(...validateNode(item, schema.items, `${location}[${index}]`, root));
    }
  }

  if (isObject(value)) {
    for (const key of schema.required ?? []) {
      if (!(key in value)) errors.push(`${location}: missing required property ${key}`);
    }

    if (schema.additionalProperties === false && schema.properties) {
      for (const key of Object.keys(value)) {
        if (!(key in schema.properties)) errors.push(`${location}: unexpected property ${key}`);
      }
    }

    for (const [key, propertySchema] of Object.entries(schema.properties ?? {})) {
      if (key in value) errors.push(...validateNode(value[key], propertySchema, `${location}.${key}`, root));
    }
  }

  return errors;
}

export async function loadBaselineSchema() {
  return JSON.parse(await fs.readFile(SCHEMA_PATH, 'utf8'));
}

export async function validateBaselineSchema(baseline) {
  const schema = await loadBaselineSchema();
  const errors = validateNode(baseline, schema, 'baseline', schema);
  return { valid: errors.length === 0, errors };
}
