module.exports = {
  verbose: true,
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js', 'json'],
  moduleDirectories: ['node_modules', 'src'],
  transform: {
    '\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
  },
  testRegex: '/tests/.*\\.test.(ts|js)$',
  testPathIgnorePatterns: ['/node_modules/', '/tests/__helpers__/'],
  reporters: ['default'],
};
