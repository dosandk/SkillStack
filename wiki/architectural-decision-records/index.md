## ADRs Decision index

> Companion document: `wiki/architecture.md` describes the current shape of the system.
> This file explains _why_ that shape was chosen.

| ADR | Decision                                                          |
| --- | ----------------------------------------------------------------- |
| 1   | [Single repo, independently built packages](./001-adr.md)         |
| 2   | [Firebase as the backend platform](./002-adr.md)                  |
| 3   | [Three-layer backend (Handler → Domain → Store)](./003-adr.md)    |
| 4   | [`shared/` is the only gateway to backend + GitHub](./004-adr.md) |
| 5   | [Firestore has one owner; trust flows inward](./005-adr.md)       |
| 6   | [Zod as the validation boundary and schema source](./006-adr.md)  |
| 7   | [Repository aggregate root + skills subcollection](./007-adr.md)  |
| 8   | [Vendored ELEKS UI, accessed only via aliases](./008-adr.md)      |
| 9   | [CLI built as a Commander app bundled with tsup](./009-adr.md)    |
