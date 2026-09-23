/** Product choices are supplied by the host conversation, never inferred from a framework. */
import fs from 'node:fs';
import path from 'node:path';

export const MARKETING_COMPONENTS = ['button', 'header', 'hero', 'section', 'card', 'footer', 'input-form', 'select', 'icon'];
export const PRODUCT_FIELDS = ['productType', 'taskType', 'includeMarketingHomepage', 'targetPaths'];

export function product_context(context = {}) {
  const result = { productType: 'saas', taskType: 'new', includeMarketingHomepage: false, targetPaths: [], ...context };
  if (!['saas', 'marketing'].includes(result.productType)) throw new Error('productType must be saas or marketing');
  if (!['new', 'optimize'].includes(result.taskType)) throw new Error('taskType must be new or optimize');
  if (typeof result.includeMarketingHomepage !== 'boolean') throw new Error('includeMarketingHomepage must be boolean');
  if (result.productType === 'marketing' && result.includeMarketingHomepage) throw new Error('includeMarketingHomepage applies only to SaaS');
  if (!Array.isArray(result.targetPaths) || result.targetPaths.some(value => typeof value !== 'string' || !value.trim())) throw new Error('targetPaths must contain source paths');
  if (result.taskType === 'optimize' && (!result.targetPaths.length || !result.webRoot || result.mode !== 'integrated')) throw new Error('Optimization requires integrated context, webRoot and inspected targetPaths');
  return result;
}

export function assert_same_product(saved, current) {
  if (!saved) return;
  const a = product_context(saved), b = product_context(current);
  for (const key of PRODUCT_FIELDS) {
    if (JSON.stringify(a[key]) !== JSON.stringify(b[key])) throw new Error(`Product context changed (${key}); start a new session for a changed product or scope`);
  }
}

export function required_custom(context) {
  const product = product_context(context);
  if (product.productType === 'marketing') return [...MARKETING_COMPONENTS];
  return product.includeMarketingHomepage ? MARKETING_COMPONENTS.map(name => `marketing-${name}`) : [];
}

export function validate_custom_coverage(entries, context, complete = false) {
  const names = entries.map(entry => typeof entry === 'string' ? entry : entry.name);
  const required = required_custom(context);
  const missing = required.filter(name => !names.includes(name));
  if (complete && missing.length) throw new Error(`Missing required custom components: ${missing.join(', ')}`);
  if (product_context(context).productType === 'marketing') {
    const extra = names.filter(name => !MARKETING_COMPONENTS.includes(name));
    if (extra.length) throw new Error(`Marketing inventory uses the nine core families; compose variants inside them: ${extra.join(', ')}`);
  }
}

export function target_sources(context) {
  const product = product_context(context);
  if (product.taskType !== 'optimize') return [];
  return product.targetPaths.map(value => {
    const file = path.resolve(product.webRoot, value);
    if (!fs.existsSync(file)) throw new Error(`Optimization target does not exist: ${value}`);
    return fs.realpathSync(file);
  });
}

export function assert_target_build(context, receipt) {
  for (const target of target_sources(context)) {
    if (!Object.keys(receipt.sourceFiles).some(file => file === target || file.startsWith(target + path.sep))) {
      throw new Error(`Verified build must include optimization target: ${target}`);
    }
  }
}
