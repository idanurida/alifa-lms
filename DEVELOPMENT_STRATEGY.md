# Development Strategy & Design Guidelines

> **CRITICAL RULE**: Maintain existing style, design, and layout at all costs. No visual regressions are permitted.

## 1. Core Philosophy: "Zero Regression"
Every development task, whether backend logic or frontend feature, must strictly preserve the current visual identity of the **ALIFA Institute LMS**. The "Premium & Professional" aesthetic established in the current codebase is the source of truth.

## 2. Design System & Styling Rules

### A. Color Palette Adherence
Do **NOT** introduce hardcoded hex values or new color tokens unless explicitly requested. Use the existing Tailwind CSS variables defined in `global.css` / `tailwind.config.js`:
- **Primary**: Use `primary` / `primary-foreground`
- **Secondary**: Use `secondary` / `secondary-foreground`
- **Backgrounds**: Use `background`, `card`, `muted` for hierarchical depth.
- **Borders**: Use `border` or `input` for standard inputs.

### B. Typography
- **Font Family**: Stick to the configured sans-serif default (likely Inter or similar).
- **Hierarchy**:
  - Page Titles: `text-3xl font-bold tracking-tight`
  - Section Headers: `text-xl font-semibold`
  - Body Text: `text-sm text-muted-foreground`

### C. Layout Patterns
1.  **Dashboard Layout**:
    - Always use the `DashboardShell` or equivalent wrapper.
    - Maintain the Sidebar + Header + Main Content structure.
2.  **Card Grids**:
    - Use the grid system: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4`.
    - Cards must have shadow and rounded corners consistent with existing `Card` components.

## 3. Component Reusability Protocol
**Before writing any HTML/TSX**, check the `components/` directory.

- **Cards**: Use `Card`, `CardHeader`, `CardTitle`, `CardContent` (shadcn/ui pattern).
- **Buttons**: Use the `Button` component with correct variants (`default`, `outline`, `ghost`, `destructive`).
- **Inputs/Forms**: Use `Input`, `Select`, `Label` components. **Do not** use raw `<input>` or `<button>` tags.
- **Custom-built Components**:
  - `StatsCard`: For top-level metrics.
  - `ModuleCard`: For navigation items.
  - `QuickAction`: For distinct action buttons.

## 4. Implementation Workflow for Design Preservation
1.  **Analyze**: Before changing a file, visually inspect the current page (if possible) or read the code to understand the existing class structure.
2.  **Edit**: Apply changes using **only** existing utility classes and components.
3.  **Verify**:
    - Does the alignment match the original?
    - Is the spacing (padding/margin) identical?
    - Are interactive states (hover/focus) preserved?

## 5. Specific Directives for Future Tasks
- **New Features**: Must look like they have always been there. Inherit styles from neighbor elements.
- **Refactoring**: If refactoring logic, ensuring the return usage of JSX remains **pixel-perfectly** identical to the original.
- **Error Handling**: Error states and toasts must use the existing notification system (`sonner` / `toast`).

---
*Reference this document at the start of every session to ensure compliance.*
