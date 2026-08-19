const DEVELOPMENT_BRANCH = 'feat/certification-foundation-pdf-merge';
const PRODUCTION_BRANCH = 'main';

export function verifyPromotion({ sourceBranch, targetBranch, ciGreen, approved, certificationStatus }) {
  const errors = [];
  if (sourceBranch !== DEVELOPMENT_BRANCH) errors.push(`promotion source must be ${DEVELOPMENT_BRANCH}`);
  if (targetBranch !== PRODUCTION_BRANCH) errors.push('promotion target must be main');
  if (ciGreen !== true) errors.push('promotion requires green CI');
  if (approved !== true) errors.push('promotion requires explicit approval');
  if (certificationStatus !== 'CERTIFIED') errors.push('promotion requires CERTIFIED release decision');
  return { valid: errors.length === 0, errors, sourceBranch, targetBranch };
}

export { DEVELOPMENT_BRANCH, PRODUCTION_BRANCH };
