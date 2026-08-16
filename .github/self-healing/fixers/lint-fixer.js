export const policy = {
  name: 'lint-fixer',
  allowedRoots: ['tests/'],
  forbiddenRoots: ['src/'],
  command: ['npx', 'eslint', 'tests', '--fix'],
};
