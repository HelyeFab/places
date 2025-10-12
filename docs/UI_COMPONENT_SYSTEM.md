# UI Component System

**Last Updated**: 2025-10-12
**Status**: Production Ready

This document outlines the custom UI component library used throughout the Places application. All components follow consistent design patterns and use the lucide-react icon library.

---

## Design Principles

1. **No Browser Native UI**: Never use browser alerts, confirms, or prompts
2. **Consistent Styling**: All components use Tailwind CSS with consistent color schemes
3. **Icon Library**: All icons from lucide-react (no inline SVGs)
4. **Accessibility**: Keyboard navigation, ARIA labels, focus management
5. **i18n Ready**: All text through translation system
6. **Responsive**: Mobile-first design patterns

---

## Core Components

### 1. Modal Component

**Location**: `/components/ui/Modal.tsx`

Professional modal dialog with overlay and animations.

**Basic Usage**:
```tsx
import Modal from '@/components/ui/Modal';

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Modal Title"
  size="md"
>
  <p>Modal content goes here</p>
</Modal>
```

**Props**:
- `isOpen: boolean` - Controls visibility
- `onClose: () => void` - Close callback
- `title?: string` - Optional header title
- `children: React.ReactNode` - Modal content
- `size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'` - Modal width (default: 'md')
- `showCloseButton?: boolean` - Show X button (default: true)

**Features**:
- ESC key to close
- Click outside to close
- Body scroll lock when open
- Smooth animations
- Auto-focus management

### 2. ConfirmModal Component

**Location**: `/components/ui/Modal.tsx`

Pre-built confirmation dialog for destructive actions.

**Usage**:
```tsx
import { ConfirmModal } from '@/components/ui/Modal';

<ConfirmModal
  isOpen={showConfirm}
  onClose={() => setShowConfirm(false)}
  onConfirm={handleDelete}
  title="Delete Photo?"
  message="This action cannot be undone."
  confirmText="Delete"
  cancelText="Cancel"
  confirmVariant="danger"
/>
```

**Props**:
- `isOpen: boolean`
- `onClose: () => void`
- `onConfirm: () => void` - Confirmation callback
- `title: string`
- `message: string`
- `confirmText?: string` (default: "Confirm")
- `cancelText?: string` (default: "Cancel")
- `confirmVariant?: 'primary' | 'danger'` (default: 'primary')

---

### 3. Toast Notification System

**Location**: `/components/ui/Toast.tsx`

Toast notifications for user feedback (success, error, warning, info).

**Setup** (already done in layout.tsx):
```tsx
import { ToastProvider } from '@/components/ui/Toast';

<ToastProvider>
  <YourApp />
</ToastProvider>
```

**Usage**:
```tsx
import { useToast } from '@/components/ui/Toast';

function MyComponent() {
  const { showToast } = useToast();

  const handleSuccess = () => {
    showToast('Photo uploaded successfully!', 'success', 5000);
  };

  const handleError = () => {
    showToast('Upload failed. Please try again.', 'error');
  };
}
```

**API**:
```typescript
showToast(
  message: string,
  type?: 'success' | 'error' | 'info' | 'warning',
  duration?: number // milliseconds (default: 5000, 0 = permanent)
)
```

**Features**:
- Auto-dismiss after duration
- Manual dismiss with X button
- Stacked notifications (bottom-right)
- Color-coded by type
- Smooth animations
- Icon per type

---

### 4. Dropdown Component

**Location**: `/components/ui/Dropdown.tsx`

Flexible dropdown menu for navigation and actions.

**Basic Usage**:
```tsx
import Dropdown, { DropdownItem, DropdownDivider, DropdownLabel } from '@/components/ui/Dropdown';
import { User, Settings, LogOut } from 'lucide-react';

<Dropdown
  trigger={<button>Menu</button>}
  align="right"
>
  <DropdownLabel>Account</DropdownLabel>
  <DropdownItem icon={<User />} onClick={handleProfile}>
    Profile
  </DropdownItem>
  <DropdownItem icon={<Settings />} onClick={handleSettings}>
    Settings
  </DropdownItem>

  <DropdownDivider />

  <DropdownItem icon={<LogOut />} onClick={handleLogout} variant="danger">
    Sign Out
  </DropdownItem>
</Dropdown>
```

**Dropdown Props**:
- `trigger: React.ReactNode` - Button/element to toggle
- `children: React.ReactNode` - Menu items
- `align?: 'left' | 'right'` (default: 'right')
- `className?: string`

**DropdownItem Props**:
- `children: React.ReactNode`
- `onClick?: () => void`
- `icon?: React.ReactNode`
- `variant?: 'default' | 'danger'`
- `disabled?: boolean`

**Features**:
- Click outside to close
- ESC key to close
- Auto-positioning
- Smooth animations
- Keyboard navigation

---

### 5. UserMenu Component

**Location**: `/components/UserMenu.tsx`

Integrated user menu with profile, language switcher, and sign out.

**Usage** (already integrated in Navigation):
```tsx
import UserMenu from '@/components/UserMenu';

<UserMenu
  user={{
    displayName: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
  }}
  currentLocale="en"
/>
```

**Features**:
- User avatar with fallback
- Display name and email
- Language switcher (EN/IT)
- Sign out with toast notification
- Uses Dropdown component
- Uses Toast for feedback

---

## Icon Library

**Library**: lucide-react
**Documentation**: https://lucide.dev/icons

### Common Icons Used:

```tsx
import {
  User,           // User profile
  LogOut,         // Sign out
  Globe,          // Language/international
  Settings,       // Settings/preferences
  X,              // Close/dismiss
  CheckCircle2,   // Success
  AlertCircle,    // Error
  Info,           // Information
  AlertTriangle,  // Warning
  Trash2,         // Delete
  Upload,         // Upload
  Download,       // Download
  Edit,           // Edit
  Search,         // Search
} from 'lucide-react';

<User className="w-5 h-5" />
```

### Icon Guidelines:
- Default size: `w-5 h-5` (20px)
- Button icons: `w-4 h-4` (16px)
- Hero icons: `w-8 h-8` (32px)
- Always specify size with Tailwind classes
- Use consistent sizing within components

---

## Color Schemes

### Primary Actions
- Blue: `bg-blue-600 hover:bg-blue-700 text-white`

### Danger Actions
- Red: `bg-red-600 hover:bg-red-700 text-white`

### Secondary Actions
- Gray: `bg-gray-100 hover:bg-gray-200 text-gray-700`

### Toast Colors
- Success: Green (`bg-green-50 border-green-200 text-green-800`)
- Error: Red (`bg-red-50 border-red-200 text-red-800`)
- Warning: Yellow (`bg-yellow-50 border-yellow-200 text-yellow-800`)
- Info: Blue (`bg-blue-50 border-blue-200 text-blue-800`)

---

## Migration Guide

### Replacing Browser Alerts

**Before**:
```tsx
if (confirm('Are you sure?')) {
  deleteItem();
}
```

**After**:
```tsx
import { ConfirmModal } from '@/components/ui/Modal';

const [showConfirm, setShowConfirm] = useState(false);

<button onClick={() => setShowConfirm(true)}>Delete</button>

<ConfirmModal
  isOpen={showConfirm}
  onClose={() => setShowConfirm(false)}
  onConfirm={deleteItem}
  title="Delete Item?"
  message="This action cannot be undone."
  confirmVariant="danger"
/>
```

### Replacing Browser Alerts for Feedback

**Before**:
```tsx
alert('Photo uploaded successfully!');
```

**After**:
```tsx
import { useToast } from '@/components/ui/Toast';

const { showToast } = useToast();
showToast('Photo uploaded successfully!', 'success');
```

### Using Icons Instead of SVG

**Before**:
```tsx
<svg className="w-5 h-5" fill="none" stroke="currentColor">
  <path d="M..." />
</svg>
```

**After**:
```tsx
import { Trash2 } from 'lucide-react';

<Trash2 className="w-5 h-5" />
```

---

## Best Practices

1. **Always use ToastProvider**: Wrap your app in layout.tsx (already done)

2. **Consistent Toast Usage**:
   - Success: User actions complete successfully
   - Error: Operations fail or validation errors
   - Warning: Non-critical issues or alerts
   - Info: General notifications

3. **Modal Sizing**:
   - `sm`: Simple confirmations, alerts (max-w-md)
   - `md`: Forms, basic content (max-w-lg)
   - `lg`: Detailed views, editing (max-w-2xl)
   - `xl`: Complex forms, data tables (max-w-4xl)
   - `full`: Image galleries, full content (max-w-7xl)

4. **Dropdown Alignment**:
   - Use `align="right"` for user menus (top-right corner)
   - Use `align="left"` for action menus (top-left corner)

5. **Accessibility**:
   - Always provide `aria-label` for icon-only buttons
   - Use semantic HTML
   - Ensure keyboard navigation works
   - Test with screen readers

6. **i18n Integration**:
   - All user-facing text through `useTranslations()`
   - No hardcoded strings
   - Include toast messages in translation files

---

## Examples in Codebase

### PhotoModal with Delete Confirmation
**File**: `/components/gallery/PhotoModal.tsx`

Shows ConfirmModal for delete confirmation instead of browser confirm().

### UserMenu
**File**: `/components/UserMenu.tsx`

Complete example of Dropdown + Toast integration with language switching.

### Gallery Error Handling
**File**: `/app/gallery/page.tsx`

Uses Toast for error notifications during photo loading.

---

## Future Enhancements

1. **Button Component**: Standardized button with variants
2. **Input Component**: Form input with validation states
3. **Select Component**: Dropdown select with search
4. **DatePicker**: Date selection component
5. **Progress Bar**: Upload/loading progress
6. **Skeleton Loaders**: Loading state placeholders

---

## Component Checklist

When creating new components:
- [ ] Use lucide-react for icons
- [ ] Support i18n (useTranslations)
- [ ] Include TypeScript types
- [ ] Handle loading states
- [ ] Handle error states with Toast
- [ ] Keyboard navigation (ESC, Enter, Tab)
- [ ] Mobile responsive
- [ ] Consistent spacing (p-4, gap-4, etc.)
- [ ] Consistent colors (blue-600, red-600, etc.)
- [ ] ARIA labels for accessibility

---

## Questions?

For questions about UI components, refer to:
1. This documentation
2. Component source code (`/components/ui/`)
3. lucide-react docs: https://lucide.dev
4. Tailwind CSS docs: https://tailwindcss.com
