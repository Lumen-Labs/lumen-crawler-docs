# Contributing to the Lumen Crawler documentation

Thank you for improving the Lumen Crawler documentation. Contributions may fix an error, clarify a workflow, add an example, or update documentation after a shipped API change.

## Before you start

1. Search existing issues and pull requests.
2. Use an issue for a substantial information-architecture or API-reference change.
3. Base behavior claims on shipped `lumen-crawler2` code, tests, OpenAPI, or ADRs.
4. Do not include credentials, customer information, production screenshots, private hostnames, or local absolute paths.

## Local setup

Use Node.js 22 and npm:

```bash
npm ci
npm run dev
```

The documentation is served at `http://localhost:3001/docs`.

## Writing guidance

- Write for a reader task and state the expected outcome early.
- Distinguish shipped behavior from rationale.
- Use fictional, domain-neutral data unless a domain is essential to the feature.
- Use `lc_live_` placeholders, never real tokens.
- Never publish real tokens, account identifiers, user data, or internal deployment information.

## Validation

Run before opening a pull request:

```bash
npm run docs:check
npm run public:check
npm run build
```

If your change modifies the HTTP contract, also synchronize and review the OpenAPI snapshot using the commands in the README.

## Pull requests

Describe:

- the reader problem being solved;
- the source used to verify technical behavior;
- the routes or publication surfaces affected;
- the validation performed.

By submitting a contribution, you agree that it is licensed under Apache-2.0 and that you have the right to submit it.
