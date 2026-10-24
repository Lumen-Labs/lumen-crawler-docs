module.exports = {
  apps: [
    {
      name: "lumen-crawler-docs",
      script: "npm start",
      cwd: __dirname,
      env: {
        PORT: 3878,
        NEXT_PUBLIC_DOCS_ORIGIN: "https://crawler-docs.lumen-labs.ai",
      },
      out_file: "./logs/lumen-crawler-docs-out.log",
      error_file: "./logs/lumen-crawler-docs-error.log",
    },
  ],
};
