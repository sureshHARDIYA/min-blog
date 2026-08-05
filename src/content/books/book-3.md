# Redux Quick Start Guide

**Authors:** James Lee, Tao Wei, & Dr. Suresh Kumar Mukhiya  
**Publisher:** Packt Publishing Limited  
**Year:** 2019  
**ISBN:** 978-1789612349  
**Domain:** React, Redux, State Management, JavaScript  

---

## Executive Summary

State management is one of the most critical aspects of building predictable, scalable single-page web applications. The **Redux Quick Start Guide** provides a practical, step-by-step introduction to managing application state predictably using Redux, React-Redux, middleware, and devtools.

---

## Key Learning Objectives

1. **Redux Three Principles**: Single source of truth, state is read-only, and changes are made with pure reducer functions.
2. **Actions, Reducers & Store**: Building immutable state trees and dispatching action payloads cleanly.
3. **Async Action Middleware**: Handling asynchronous API calls with Redux Thunk and Redux Saga.
4. **Reselect & Performance**: Memoizing state selectors to prevent unnecessary component re-renders.
5. **Redux Toolkit Transition**: Simplifying boilerplate with modern slice patterns and standard store configurations.

---

## Code Example: Pure Reducer & Action Dispatcher

```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  authenticated: boolean;
  user: { id: string; name: string } | null;
}

const initialState: UserState = {
  authenticated: false,
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<{ id: string; name: string }>) {
      state.authenticated = true;
      state.user = action.payload;
    },
    logout(state) {
      state.authenticated = false;
      state.user = null;
    },
  },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;
```

---

## Who This Book Is For

Frontend developers and JavaScript engineers looking to master predictable state architectures in complex React applications.
