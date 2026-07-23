---
name: s-life-ui-kit
description: Guidelines and documentation for the S-LIFE TechHub UI Kit. Use when building or refactoring UI components for the S-LIFE platform.
---

# S-LIFE TechHub UI Kit

This skill documents the centralized UI components for the S-LIFE TechHub platform. Using these components ensures consistency and safety across the application.

## 🎨 Design Philosophy
- **Style**: Hardcore Techwear / Premium Minimalist.
- **Rules**: NO excessive italics, font-black, uppercase interactive elements.

## 🧱 Available Components

### [Button](file:///home/hoan/Projects/DATN_TechHub/frontend/src/components/ui/Button.jsx)
Standard button with Framer Motion animations.
- **Variants**: `primary`, `secondary`, `outline`, `ghost`, `danger`.
- **Sizes**: `sm`, `md`, `lg`, `icon`.

### [Input](file:///home/hoan/Projects/DATN_TechHub/frontend/src/components/ui/Input.jsx)
Standard text input with support for icons and labels.
- **Usage**: Search bars, form inputs.

### [Modal](file:///home/hoan/Projects/DATN_TechHub/frontend/src/components/ui/Modal.jsx)
Premium glassmorphism modal with spring animations.

### [ConfirmModal](file:///home/hoan/Projects/DATN_TechHub/frontend/src/components/ui/ConfirmModal.jsx)
Specialized confirmation dialog for risk management.
- **Requirement**: Use for logout, deletions, and clearing sensitive filters.

## 🛠️ Usage Patterns
```javascript
import Button from '../ui/Button';
import ConfirmModal from '../ui/ConfirmModal';

// Example: Dangerous action with confirmation
const [isConfirmOpen, setIsConfirmOpen] = useState(false);

return (
  <>
    <Button variant="danger" onClick={() => setIsConfirmOpen(true)}>
      DELETE ACCOUNT
    </Button>
    <ConfirmModal
      isOpen={isConfirmOpen}
      onClose={() => setIsConfirmOpen(false)}
      onConfirm={handleDelete}
      message="This action is permanent. Proceed?"
    />
  </>
);
```
