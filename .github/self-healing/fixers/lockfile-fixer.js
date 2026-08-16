export const policy = {
  name: 'lockfile-fixer',
  allowedPaths: ['package-lock.json'],
  forbiddenPaths: ['package.json', 'src/'],
  command: ['npm', 'install', '--package-lock-only', '--ignore-scripts'],
};
