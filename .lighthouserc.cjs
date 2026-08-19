module.exports = {
  ci: {
    collect: {
      startServerCommand: "npm run dev -- --host 127.0.0.1 --port 3000",
      startServerReadyPattern: "Local:",
      startServerReadyTimeout: 60000,
      url: ["http://127.0.0.1:3000/"],
      numberOfRuns: 2,
      settings: {
        preset: "desktop",
      },
    },
    assert: {
      assertions: {
        "categories:performance": ["warn", { minScore: 0.75 }],
        "categories:accessibility": ["warn", { minScore: 0.90 }],
        "categories:seo": ["warn", { minScore: 0.90 }],
        "categories:best-practices": ["warn", { minScore: 0.85 }],
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
