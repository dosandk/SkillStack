# ELEKS UI — Component Reference

Local component layout when the eleks-ui MCP server is unavailable.

| Category     | Path            | Examples                                                                       |
| ------------ | --------------- | ------------------------------------------------------------------------------ |
| Core         | `core/`         | Button, TextField, Alert, Dialog, Select, Table, Tabs, Accordion, Autocomplete |
| Custom       | `custom/`       | EmptyState, FileUpload, Heading, TransferList                                  |
| X-Components | `x-components/` | DataGrid, Charts, DateTime pickers, TreeView                                   |

Base path: `src/components/eleks-ui/components`

Each component directory contains an `index.tsx` with TypeScript interfaces and props.
The barrel export at `src/components/eleks-ui/components/index.tsx` lists everything available.
