# Keyboard Shortcuts System — Implementation Plan

## Context

The app has hardcoded keyboard shortcuts in `useKeyboardShortcuts.ts` (Ctrl+Shift+letter for entity creation). There is no Ctrl+S to save, and no way for users to customize shortcuts. We want a system with sensible defaults that users can override, stored in `react_settings` and pulled from the backend at login.

---

## Architecture

### Three Layers

1. **Definitions** — a registry of all shortcut action IDs, their default key combos, and metadata
2. **Resolution** — a hook that merges defaults with user overrides from `react_settings`
3. **Listeners** — global listener (App.tsx) for navigation shortcuts, page-level listener (Default.tsx) for save

### Data Model

**Shortcut combo format:** Human-readable strings like `"Ctrl+S"`, `"Ctrl+Shift+C"`. Parsed at runtime.

**Storage:** `company_user.react_settings.keyboard_shortcuts`

```typescript
// Only overrides are stored. Missing keys = use default. null = disabled.
keyboard_shortcuts?: Record<string, string | null>;
```

**Example stored value:**
```json
{
  "keyboard_shortcuts": {
    "save": "Ctrl+Shift+S",
    "create:client": null
  }
}
```

This means: save is rebound to Ctrl+Shift+S, create client is disabled, everything else uses defaults.

---

## Backend Integration

### How shortcuts are loaded

Shortcuts piggyback on the existing login/bootstrap flow — no new endpoint needed.

1. User logs in via `POST /api/v1/login`
2. Response includes `company_user.react_settings` (already loaded today)
3. `react_settings.keyboard_shortcuts` contains any user overrides
4. `useReactSettings()` merges with defaults via lodash `merge()` (existing pattern)

### How shortcuts are saved

Uses the existing preferences persistence pattern:

1. User changes a shortcut in settings UI
2. `usePreferences().update('keyboard_shortcuts', overrides)` updates Redux state
3. `usePreferences().save()` calls `PUT /api/v1/company_users/:id/preferences`
4. Request body:
   ```json
   {
     "react_settings": {
       "keyboard_shortcuts": {
         "save": "Ctrl+Shift+S",
         "create:client": null
       }
     }
   }
   ```
5. Backend stores in `company_users.react_settings` JSON column
6. On success, Redux state is updated via `updateUser()` dispatch

### API Details

| Action | Method | URL                                                          | Body                                                |
| ------ | ------ | ------------------------------------------------------------ | --------------------------------------------------- |
| Load   | `POST` | `/api/v1/login`                                              | (part of login response)                            |
| Save   | `PUT`  | `/api/v1/company_users/:id/preferences?include=company_user` | `{ react_settings: { keyboard_shortcuts: {...} } }` |

### Expected Data Shape

```typescript
// What the backend stores and returns in react_settings
interface ReactSettings {
  // ... existing fields ...
  keyboard_shortcuts?: Record<string, string | null>;
}

// The full shortcut definition (frontend only, not stored on backend)
interface ShortcutDefinition {
  id: string;           // e.g. "save", "create:invoice"
  defaultCombo: string; // e.g. "Ctrl+S", "Ctrl+Shift+I"
  label: string;        // e.g. "Save", "Create Invoice" (for settings UI)
  scope: 'global' | 'page';
}
```

The backend only stores **overrides** — the full list of available shortcuts and their defaults live in the frontend code.

---

## Files to Create

### 1. `src/common/hooks/keyboard-shortcuts/shortcuts.ts`

Core definitions and helpers.

- `ShortcutAction` — string literal union of all action IDs
- `ShortcutDefinition` — interface: `{ id, defaultCombo, label, scope }`
- `DEFAULT_SHORTCUTS` — array of all shortcuts:

| Action ID                  | Default Combo  | Scope  |
| -------------------------- | -------------- | ------ |
| `save`                     | `Ctrl+S`       | page   |
| `create:client`            | `Ctrl+Shift+C` | global |
| `create:product`           | `Ctrl+Shift+K` | global |
| `create:invoice`           | `Ctrl+Shift+I` | global |
| `create:recurring_invoice` | `Ctrl+Shift+R` | global |
| `create:quote`             | `Ctrl+Shift+Q` | global |
| `create:payment`           | `Ctrl+Shift+P` | global |
| `create:expense`           | `Ctrl+Shift+E` | global |
| `create:purchase_order`    | `Ctrl+Shift+O` | global |
| `create:credit`            | `Ctrl+Shift+D` | global |
| `create:project`           | `Ctrl+Shift+J` | global |
| `create:task`              | `Ctrl+Shift+T` | global |
| `create:vendor`            | `Ctrl+Shift+V` | global |
| `create:recurring_expense` | `Ctrl+Shift+X` | global |
| `create:transaction`       | `Ctrl+Shift+A` | global |
| `create:docuninja`         | `Ctrl+Shift+N` | global |

- `ACTION_ROUTES` — maps global action IDs to routes
- `parseCombo(combo: string)` — converts `"Ctrl+Shift+C"` to `{ ctrlKey: true, shiftKey: true, altKey: false, metaKey: false, key: 'c' }`
- `matchesEvent(combo: string, event: KeyboardEvent): boolean`

### 2. `src/common/hooks/keyboard-shortcuts/useShortcutMap.ts`

Resolution hook that merges defaults with user overrides.

```typescript
export function useShortcutMap(): Record<string, string | null> {
  const reactSettings = useReactSettings();
  const overrides = reactSettings.keyboard_shortcuts ?? {};

  const map: Record<string, string | null> = {};
  for (const def of DEFAULT_SHORTCUTS) {
    map[def.id] = def.id in overrides ? overrides[def.id] : def.defaultCombo;
  }
  return map;
}
```

### 3. `src/common/hooks/keyboard-shortcuts/useGlobalShortcuts.ts`

Replaces `useKeyboardShortcuts.ts`. Handles all `scope: 'global'` shortcuts.

- Uses `useShortcutMap()` for resolved combos
- Uses `usePreventNavigation()` for route navigation (same as current)
- Single `keydown` listener on `document` with capture phase

### 4. `src/common/hooks/keyboard-shortcuts/usePageShortcut.ts`

Hook for page-level shortcuts (like save).

```typescript
export function usePageShortcut(
  actionId: string,
  callback: (() => void) | null
) {
  const shortcutMap = useShortcutMap();
  const combo = shortcutMap[actionId];

  useEffect(() => {
    if (!combo || !callback) return;

    const handler = (event: KeyboardEvent) => {
      if (matchesEvent(combo, event)) {
        event.preventDefault();
        callback();
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [combo, callback]);
}
```

### 5. `src/common/hooks/keyboard-shortcuts/index.ts`

Barrel exports.

---

## Files to Modify

### 6. `src/common/hooks/useReactSettings.ts`

Add to `ReactSettings` interface:
```typescript
keyboard_shortcuts?: Record<string, string | null>;
```

### 7. `src/components/layouts/Default.tsx`

Add one hook call after line 90 (where `saveBtn` is read):

```typescript
const saveCallback = saveBtn?.onClick || props.onSaveClick;
const isSaveDisabled = saveBtn?.disableSaveButton || props.disableSaveButton || props.disableSaveButtonOnly;

usePageShortcut('save', (!isSaveDisabled && saveCallback) ? saveCallback : null);
```

This covers Ctrl+S for **all** entity edit/create pages since they all render through `Default`.

### 8. `src/App.tsx` (line 80)

```diff
-import { useKeyboardShortcuts } from './common/hooks/useKeyboardShortcuts';
+import { useGlobalShortcuts } from './common/hooks/keyboard-shortcuts';
...
-useKeyboardShortcuts();
+useGlobalShortcuts();
```

### 9. Delete `src/common/hooks/useKeyboardShortcuts.ts`

Replaced by the new system.

---

## Implementation Order

### Phase 1: Core System + Ctrl+S
1. Create `keyboard-shortcuts/` module (files 1-5)
2. Add `keyboard_shortcuts` to `ReactSettings` (file 6)
3. Wire up `Default.tsx` for Ctrl+S (file 7)
4. Swap global shortcuts in `App.tsx` (file 8)
5. Delete old hook (file 9)

### Phase 2: Settings UI (future)
- A settings page that reads `DEFAULT_SHORTCUTS`, shows current bindings
- Uses `usePreferences().update('keyboard_shortcuts', ...)` to persist overrides
- The data model already supports this — no backend changes needed

---

## Verification

- Ctrl+S on any entity edit/create page triggers save
- Ctrl+S does NOT trigger when save button is disabled (locked, cancelled, busy)
- Ctrl+S does NOT trigger when focused in an input that might use Ctrl+S (should still work — we preventDefault)
- Ctrl+Shift+I still navigates to `/invoices/create` (and all other existing shortcuts)
- Browser's default save dialog is prevented
- No regressions on existing shortcut behavior

---

## Known Concerns

### Browser shortcut conflicts (pre-existing)

These shortcuts were already overridden by the old `useKeyboardShortcuts.ts` and are carried forward:

| Shortcut | Browser default | Our action |
|----------|----------------|------------|
| `Ctrl+Shift+T` | Reopen closed tab | Create task |
| `Ctrl+Shift+I` | Open DevTools | Create invoice |
| `Ctrl+Shift+N` | Incognito/private window | Create docuninja |

These may frustrate power users who rely on the browser defaults. Once the Phase 2 settings UI is built, users can disable or rebind these.

### Ctrl+S in text inputs

When a user is typing in a text field or textarea and presses Ctrl+S, it will trigger save and prevent the browser default. This is generally the expected behavior for a web app (similar to Google Docs, Figma, etc.), but worth noting.

### Save shortcut registration paths

Ctrl+S is registered in two places to cover all pages:

1. **`Default.tsx`** — covers create pages (which pass `onSaveClick` directly) and pages using `saveBtnAtom`
2. **`ResourceActions.tsx`** — covers edit pages (which pass `onSaveClick` via `navigationTopRight`)

These paths are **mutually exclusive** — a page uses one or the other, never both — so there is no risk of double-firing. The 6 pages using `saveBtnAtom` (invoice design, payments refund/apply, document settings) are handled by `Default.tsx` only.

### No double registration risk

Verified that no page combines `ResourceActions` with `saveBtnAtom` or direct `onSaveClick` on `Default`. The three save callback sources (`props.onSaveClick`, `saveBtnAtom`, `ResourceActions.onSaveClick`) are always used independently.
