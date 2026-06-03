# UI Coding Standards

## Component Library — shadcn/ui Only

**All UI components in this project must use [shadcn/ui](https://ui.shadcn.com/) exclusively.**

- Do **not** create custom UI components (buttons, inputs, dialogs, cards, badges, etc.).
- Do **not** use any other component library (e.g. MUI, Chakra, Radix directly, Headless UI).
- If a shadcn/ui component exists for a UI need, use it. If one does not exist, open a discussion before building anything custom.
- Add new shadcn/ui components to the project with the CLI:
  ```bash
  npx shadcn@latest add <component-name>
  ```
- Components are installed into `components/ui/`. Do **not** modify generated shadcn files — compose or wrap them at the page/feature level if customisation is needed.

## Date Formatting — date-fns

All date formatting must use **[date-fns](https://date-fns.org/)**.

### Required format

Dates must be displayed with an ordinal day, abbreviated month, and four-digit year:

| Example output |
|----------------|
| 1st Sep 2025   |
| 2nd Aug 2025   |
| 3rd Jan 2026   |
| 4th Jun 2024   |

### How to format

```ts
import { format } from "date-fns"

function formatDate(date: Date): string {
  return format(date, "do MMM yyyy")
}
```

`do` produces the ordinal day (`1st`, `2nd`, `3rd`, `4th`, …).  
`MMM` produces the abbreviated month (`Jan`, `Feb`, …).  
`yyyy` produces the four-digit year.

### Rules

- Never use `new Date().toLocaleDateString()`, `Intl.DateTimeFormat`, or hand-rolled ordinal helpers.
- Always pass a `Date` object to `format`. Parse strings with `parseISO` or `parse` from date-fns first:
  ```ts
  import { parseISO, format } from "date-fns"

  const date = parseISO("2025-09-01")
  const label = format(date, "do MMM yyyy") // "1st Sep 2025"
  ```
