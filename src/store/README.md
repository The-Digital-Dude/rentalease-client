# Redux Setup Guide for RentalEase-CRM

## 📋 Overview

This project uses **Redux Toolkit** for state management. The user management system tracks authentication, email, user type, and other user information.

## 🚀 User Types

- `super_user` - Super admin with full access
- `agency` - Agency with management access
- `staff` - Staff members with limited access
- `tenant` - Tenants with basic access

## 📁 File Structure

```
src/store/
├── index.ts          # Main exports
├── store.ts          # Store configuration
├── userSlice.ts      # User state management
└── hooks.ts          # Typed hooks
```

## 🔧 Usage

### Import hooks

```typescript
import { useAppSelector, useAppDispatch } from "../store";
```

### Get user state

```typescript
const { isLoggedIn, email, userType, name } = useAppSelector(
  (state) => state.user
);
```

### Dispatch actions

```typescript
import { login, logout, updateUser } from "../store";

const dispatch = useAppDispatch();

// Login
dispatch(
  login({
    email: "user@example.com",
    userType: "property_manager",
    name: "John Doe",
    id: "123",
  })
);

// Logout
dispatch(logout());

// Update user
dispatch(
  updateUser({
    email: "newemail@example.com",
    name: "John Updated",
  })
);
```

## 🎯 Available Actions

- `login(payload)` - Logs in a user with email, userType, name, and id
- `logout()` - Logs out the current user
- `updateUser(payload)` - Updates user information

## 🔍 State Structure

```typescript
interface UserState {
  isLoggedIn: boolean;
  email: string | null;
  userType: "super_user" | "property_manager" | "staff" | "tenant" | null;
  name: string | null;
  id: string | null;
}
```
