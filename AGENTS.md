# ongaku.today Project Agents

Essential guidance for AI agents working on ongaku.today project.

## Core Architecture

### Key Directories
```
src/
├── components/       # React components (feature-specific in subdirs)
├── hooks/            # Custom React hooks
├── stores/           # Zustand state management
├── lib/api/          # API layer with Supabase
├── utils/            # Utility functions
├── constants/        # App constants
└── types/            # TypeScript type definitions
```

### Critical Rules

#### 🚫 Never Break These:
- **Optimistic UI updates** - UI updates immediately, API calls in background
- **Dialog state control** - Dialogs must manage their own open/close state
- **Cache consistency** - Store updates must maintain data integrity
- **Type safety** - Always use proper TypeScript types, no `any`

#### ✅ Always Follow These:
- Import from centralized types/constants, don't duplicate
- Follow naming: components PascalCase, hooks camelCase
- Extract complex logic into utilities
- **Prefer shadcn components** over custom implementations when available
- **Look for generalization opportunities** - extract reusable patterns

## When to Update This Document

### Update When:
- **New core patterns emerge** (e.g., different state management approach)
- **Architecture decisions change** (e.g., moving from Zustand to different solution)
- **New fundamental directories added** (e.g., services/ for business logic)
- **Critical patterns established** (e.g., standardized error handling approach)

### What to Add:
- **Essential patterns only** - don't document every function or component
- **Critical rules** - things that, if broken, cause major regressions
- **Architecture decisions** - why certain approaches were chosen
- **File organization principles** - where to put new types of code

### What NOT to Add:
- **Function-by-function documentation** - use JSDoc in code instead
- **Specific implementation details** - focus on patterns, not individual functions
- **Minor styling conventions** - these can change frequently
- **Temporary workarounds** - unless they become established patterns

## Example of Good Update

If you add a new pattern like "All API calls must be wrapped in try-catch with toast notifications," add that to the "Critical Rules" section.

## Example of Bad Update

Don't add "The folder store has a moveFolder function that takes folderId, oldParentId, newParentId" - that's implementation detail that belongs in JSDoc, not this guide.