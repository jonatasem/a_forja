module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\\.(t|j)sx?$": "@swc/jest",
  },
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  testPathIgnorePatterns: [
    "/node_modules/",
    "/dist/"
  ],
  silent: true,
};   