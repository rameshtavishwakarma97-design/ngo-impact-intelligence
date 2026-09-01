---
name: GitHub HTML publishing
description: Connector gateway constraint affecting HTML entry files during GitHub API publishing.
---

GitHub connector writes can reject HTML payloads containing module script tags with a gateway-generated 403, even when sent as base64 through REST or GraphQL.

**Why:** The connector gateway inspects decoded payloads and blocks the script-tag signature before GitHub receives the request.

**How to apply:** Keep Vite entry HTML script-free and inject the module entry with a `transformIndexHtml` hook using `order: "pre"` so development and production builds still discover and bundle the entry.