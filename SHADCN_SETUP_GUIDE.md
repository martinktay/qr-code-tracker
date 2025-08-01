# shadcn/ui Setup Guide

## Overview

This project now includes shadcn/ui components, a collection of reusable UI components built on top of Tailwind CSS and Radix UI.

## Installed Components

The following shadcn/ui components have been installed and are ready to use:

### Core Components

- **Button** (`@/components/ui/button`) - Various button styles and variants
- **Card** (`@/components/ui/card`) - Container components for content
- **Input** (`@/components/ui/input`) - Form input fields
- **Label** (`@/components/ui/label`) - Form labels
- **Form** (`@/components/ui/form`) - Form handling with validation

### Data Display

- **Badge** (`@/components/ui/badge`) - Status indicators and tags
- **Table** (`@/components/ui/table`) - Data tables

### Overlay Components

- **Dialog** (`@/components/ui/dialog`) - Modal dialogs
- **Dropdown Menu** (`@/components/ui/dropdown-menu`) - Dropdown menus

## How to Use

### 1. Import Components

```jsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
```

### 2. Basic Usage Examples

#### Button Component

```jsx
<Button>Default Button</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
```

#### Card Component

```jsx
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
</Card>
```

#### Form Elements

```jsx
<div className="grid w-full max-w-sm items-center gap-1.5">
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" placeholder="Enter your email" />
</div>
```

#### Badge Component

```jsx
<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Error</Badge>
<Badge variant="outline">Outline</Badge>
```

#### Table Component

```jsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>John Doe</TableCell>
      <TableCell>
        <Badge>Active</Badge>
      </TableCell>
    </TableRow>
  </TableBody>
</Table>
```

#### Dialog Component

```jsx
<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>Dialog description goes here.</DialogDescription>
    </DialogHeader>
    <div className="py-4">
      <p>Dialog content goes here.</p>
    </div>
  </DialogContent>
</Dialog>
```

## Demo Page

Visit `/shadcn-demo` in your application to see all components in action. This page demonstrates:

- All button variants
- Form elements with labels
- Status badges
- Data tables
- Dialog modals
- Dropdown menus

## Adding More Components

To add more shadcn/ui components, use the CLI:

```bash
npx shadcn@latest add [component-name]
```

### Popular Additional Components

```bash
# Navigation
npx shadcn@latest add navigation-menu
npx shadcn@latest add breadcrumb

# Data Entry
npx shadcn@latest add select
npx shadcn@latest add textarea
npx shadcn@latest add checkbox
npx shadcn@latest add radio-group
npx shadcn@latest add switch

# Feedback
npx shadcn@latest add alert
npx shadcn@latest add toast
npx shadcn@latest add progress
npx shadcn@latest add skeleton

# Layout
npx shadcn@latest add separator
npx shadcn@latest add sheet
npx shadcn@latest add tabs
npx shadcn@latest add accordion

# Data Display
npx shadcn@latest add avatar
npx shadcn@latest add calendar
npx shadcn@latest add popover
npx shadcn@latest add tooltip
```

## Configuration Files

The following files were created/modified for shadcn/ui:

- `components.json` - shadcn/ui configuration
- `jsconfig.json` - Import alias configuration
- `vite.config.js` - Updated with import alias
- `tailwind.config.js` - Updated with shadcn/ui styles
- `src/index.css` - Added CSS variables
- `src/lib/utils.js` - Utility functions for class merging

## Customization

### Colors

You can customize the color scheme by modifying the CSS variables in `src/index.css`:

```css
:root {
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  /* ... other colors */
}
```

### Component Variants

You can add custom variants to components by modifying the component files in `src/components/ui/`.

## Best Practices

1. **Use the `cn()` utility** for conditional classes:

   ```jsx
   import { cn } from "@/lib/utils";

   <div className={cn("base-class", condition && "conditional-class")}>
   ```

2. **Follow the component API** - Each component has specific props and variants documented in the shadcn/ui documentation.

3. **Maintain consistency** - Use the same variants and patterns throughout your application.

4. **Accessibility** - shadcn/ui components are built with accessibility in mind, but always test with screen readers.

## Resources

- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Component Examples](https://ui.shadcn.com/examples)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com/)

## Troubleshooting

### Import Issues

If you encounter import errors, ensure:

1. The `@` alias is properly configured in `vite.config.js` and `jsconfig.json`
2. Components are imported from `@/components/ui/[component-name]`

### Styling Issues

If styles aren't applying correctly:

1. Check that `tailwind.config.js` includes the shadcn/ui configuration
2. Ensure CSS variables are defined in `src/index.css`
3. Verify that `tailwindcss-animate` is installed

### Component Not Found

If a component isn't available:

1. Install it using `npx shadcn@latest add [component-name]`
2. Check the component registry at https://ui.shadcn.com/docs/components
