## ADRs Decision index

> Companion document: `wiki/architecture.md` describes the current shape of the system.
> This file explains _why_ that shape was chosen.

| ADR | Decision                                                          |
| --- | ----------------------------------------------------------------- |
| 001 | [Single repo, independently built packages](./001-adr.md)         |
| 002 | [Firebase as the backend platform](./002-adr.md)                  |
| 003 | [Three-layer backend (Handler → Domain → Store)](./003-adr.md)    |
| 004 | [`shared/` is the only gateway to backend + GitHub](./004-adr.md) |
| 005 | [Firestore has one owner; trust flows inward](./005-adr.md)       |
| 006 | [Zod as the validation boundary and schema source](./006-adr.md)  |
| 007 | [Repository aggregate root + skills subcollection](./007-adr.md)  |
| 008 | [Vendored ELEKS UI, accessed only via aliases](./008-adr.md)      |
| 009 | [CLI built as a Commander app bundled with tsup](./009-adr.md)    |
| 010 | [Auth-token propagation via `setAuthTokenProvider`](./010-adr.md) |
| 011 | [Repo detail reuses `repository.skills` from list](./011-adr.md)  |
| 012 | [Favorites mutations return the full enriched list](./012-adr.md) |
| 013 | [Single `create-share-link` endpoint (all / one repo)](./013-adr.md) |
| 014 | [`AppLink` / `AppNavButton` wrap ELEKS UI Link/Button](./014-adr.md) |
