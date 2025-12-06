

Below is a **clean, production-grade, scalable, modern API Integration plan** + suggestions on your existing guide.

---

# ⭐ What you already did right

* Clear module-wise API breakdown (auth, jobs, events, etc.)
* Directory structure (`src/api/*`)
* Using axios + clean wrappers
* Listing endpoints per module

Good start — but ek professional team ke liye thoda raw lagta hai.

---

# 🚀 PRO-LEVEL IMPROVEMENTS (VERY IMPORTANT)

## 1. **Create a global API client wrapper (`apiClient.js`)**

Instead of calling axios directly inside each file, make a **single configured axios instance**.

This gives:

* Auto-inject JWT
* Auto-refresh tokens
* Global error handling
* Base URL default
* Retry logic
* Timeout
* Interceptors

### Example: `src/api/apiClient.js`

```js
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api/v1",
  timeout: 10000,
});

// Automatically attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); 
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global error handler
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // handle unauthorized globally
      // redirect to login
    }
    return Promise.reject(err);
  }
);

export default api;
```

Every API file now becomes super clean.

---

## 2. **Use modular files but keep them small**

Your suggestion is correct:
`src/api/auth.js`, `src/api/events.js`, etc.

But the inside code must follow a consistent pattern:

### Example (much better):

```js
import api from "./apiClient";

export const login = (payload) => api.post("/auth/login", payload);
export const registerAlumni = (payload) => api.post("/auth/register/alumni", payload);
export const verifyAlumni = () => api.post("/auth/verify/alumni");
```

Benefits:

* Just return the **promise**
* Consumer handles `.data`
* Maximum reusability

---

## 3. **Add TypeScript support (recommended for large apps)**

Since your project is big, TypeScript gives:

* Type-safe API responses
* Auto-complete for endpoints
* Fewer bugs
* More maintainable

### Example:

`src/api/types.ts`

```ts
export interface Alumni {
  _id: string;
  name: string;
  email: string;
  graduationYear: number;
  profilePic?: string;
}
```

Now use:

```ts
export const getAlumni = async (): Promise<Alumni[]> => {
  const res = await api.get("/alumni");
  return res.data.data;
};
```

---

## 4. **Use ENV Variables**

Never hardcode URLs.

In `.env.local`:

```
NEXT_PUBLIC_API_URL="http://localhost:5001/api/v1"
```

In axios:

```js
baseURL: process.env.NEXT_PUBLIC_API_URL
```

Production-ready.

---

## 5. **Response Normalization**

Different backend devs return different structures & it becomes messy.

Make one helper:

```js
export function extract(res) {
  return res?.data?.data || res?.data;
}
```

Then use this in UI:

```js
const alumni = extract(await getAlumni());
```

Clean & consistent.

---

## 6. **Add a “useAPI” hook layer (recommended for Next.js)**

### Example:

`src/hooks/useAlumni.js`

```js
import { useState, useEffect } from "react";
import { getAlumni } from "@/api/alumni";

export const useAlumni = () => {
  const [loading, setLoading] = useState(true);
  const [alumni, setAlumni] = useState([]);

  useEffect(() => {
    getAlumni()
      .then((res) => setAlumni(res.data))
      .finally(() => setLoading(false));
  }, []);

  return { loading, alumni };
};
```

This keeps pages clean.

---

## 7. **Handle errors globally in toast notifications**

Create:

`src/utils/handleApiError.js`

```js
export const handleApiError = (error) => {
  const message =
    error.response?.data?.message || "Something went wrong. Try again.";
    
  toast.error(message);
};
```

Use anywhere:

```js
try {
  await login(values);
} catch (error) {
  handleApiError(error);
}
```

Professional apps do this.

---

## 8. **Document request/response shapes in the guide**

Right now you listed endpoints but not:

* Expected payloads
* What backend returns
* Example success response
* Example error response

Add something like:

### Example:

```
POST /auth/login
Payload:
{
  email: string,
  password: string
}

Response:
{
  success: true,
  token: "jwt-token",
  user: {
    _id: string,
    role: "alumni" | "college_admin"
  }
}
```

This helps frontend devs avoid guessing.

---

## 9. **Add authentication flow documentation**

Your guide should include:

### Login flow

→ Save JWT → Put in interceptor → Navigate dashboard.

### Logout flow

→ Remove token → Reset store → Redirect login.

### Protected routes

Use a wrapper:

```js
export function requireAuth(page) {
  return () => {
    const token = localStorage.getItem("token");
    if (!token) redirect("/login");
    return page;
  }
}
```

---

## 10. **Rate-limit & debounce API requests**

For directory search, chat, posts feed, map search → always debounce.

Use:

```js
import debounce from "lodash.debounce";
```

---

# ⭐ What your API list currently lacks (Important)

### 1. No pagination endpoints

Large alumni list will kill performance.

Should have:

```
GET /alumni?page=1&limit=20&search=&department=
```

### 2. Missing filters for alumni directory

Backend should accept:

```
degree=
department=
batch=
location=
verified=
```

### 3. Missing endpoints:

* `/alumni/me`
* `/alumni/update-profile-picture`
* `/notifications`
* `/analytics/alumni-profile`
* `/events/register`
* `/events/mark-attendance`
* `/campaigns/contribute`
* `/chat/messages/:chatId`
* `/jobs/:id/applicants`

### 4. Missing token refresh endpoint

JWT refresh is important for long sessions.

---

Perfect — here is a **fully rewritten, polished, production-grade API Integration Guide** suitable for a serious Next.js/React project with modular APIs, axios client, token handling, TypeScript-friendly patterns, standardized response formats, hooks, and clean structure.

This is the version you can directly put in your repo’s `/docs/API_INTEGRATION.md`.

---

# 🚀 **API Integration Guide (Frontend)**

*A clean, scalable structure for integrating the frontend with the backend API.*

This guide standardizes how the frontend communicates with the backend. It ensures consistency across modules, improves maintainability, and keeps our codebase professional and scalable as our project grows.

---

# 1. **Folder Structure**

Place all API-related logic inside a dedicated `src/api` folder.

```
src/
  api/
    apiClient.js        # Configured axios instance (global)
    auth.js             # Auth / login / registration API
    alumni.js           # Alumni-specific API
    connections.js      # Connection module API
    events.js           # Event module API
    jobs.js             # Job module API
    chats.js            # Chat module API
    posts.js            # Social posts API
    messages.js         # Message module API
    users.js            # User module API
  hooks/
    useAlumni.js
    useEvents.js
    ...
  utils/
    handleApiError.js
```

Each file handles **only one module**, keeping concerns separated and clean.

---

# 2. **Global API Client (Required)**

All requests must go through a **single axios instance** to ensure:

* Automatic JWT injection
* Global error handling
* Auto-logout on 401
* Timeout + retry logic
* Clean, shorter code in modules

### `src/api/apiClient.js`

```js
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api/v1",
  timeout: 10000,
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;
```

---

# 3. **API Module Structure**

Each module should export **small, single-purpose functions**.

### Example: `src/api/auth.js`

```js
import api from "./apiClient";

export const login = (payload) => api.post("/auth/login", payload);
export const registerAlumni = (payload) => api.post("/auth/register/alumni", payload);
export const verifyAlumni = () => api.post("/auth/verify/alumni");
```

### Example: `src/api/alumni.js`

```js
import api from "./apiClient";

export const getAllAlumni = (params) => api.get("/alumni", { params });
export const getAlumniById = (id) => api.get(`/alumni/${id}`);
export const updateAlumni = (id, payload) => api.put(`/alumni/${id}`, payload);
```

---

# 4. **Standardized Response Handling**

To avoid repeating `.data.data` everywhere, use a helper:

### `src/utils/extract.js`

```js
export const extract = (response) => response?.data?.data || response?.data;
```

Usage:

```js
const alumni = extract(await getAllAlumni());
```

---

# 5. **Error Handling (Unified)**

Create a global function to display API errors nicely via toast.

### `src/utils/handleApiError.js`

```js
import { toast } from "react-hot-toast";

export const handleApiError = (error) => {
  const message =
    error?.response?.data?.message ||
    "Something went wrong. Please try again.";

  toast.error(message);
};
```

Usage:

```js
try {
  await login(values);
} catch (err) {
  handleApiError(err);
}
```

---

# 6. **Authentication Flow**

### Login

1. Call `login()`
2. Save token to localStorage
3. Redirect to dashboard

```js
const res = await login(values);
localStorage.setItem("token", res.data.token);
router.push("/dashboard");
```

### Logout

```js
localStorage.removeItem("token");
router.push("/login");
```

### Protected Route Guard

Use in layout or high-order components:

```js
if (!localStorage.getItem("token")) router.push("/login");
```

---

# 7. **Pagination, Filters & Queries (Required for Large Data)**

Most GET endpoints should support:

```
GET /alumni?page=1&limit=20&search=&department=&degree=
```

Example:

```js
export const getAllAlumni = (params) => api.get("/alumni", { params });
```

UI example:

```js
await getAllAlumni({ page: 1, limit: 20, department: "CSE" });
```

---

# 8. **Debounce Search Inputs**

Use debounce for directory search:

```js
import debounce from "lodash.debounce";

const handleSearch = debounce((value) => {
  fetchAlumni({ search: value });
}, 400);
```

---

# 9. **React Query (Optional but Highly Recommended)**

If using TanStack Query:

```js
import { useQuery } from "@tanstack/react-query";
import { getAllAlumni } from "@/api/alumni";

export const useAlumni = () =>
  useQuery({
    queryKey: ["alumni"],
    queryFn: () => getAllAlumni().then((r) => r.data),
  });
```

This gives:

* auto caching
* auto refetching
* stale-while-revalidate

---

# 10. **Hooks Layer (Clean UI)**

Example: `src/hooks/useAlumni.js`

```js
import { useEffect, useState } from "react";
import { getAllAlumni } from "@/api/alumni";
import { extract } from "@/utils/extract";

export const useAlumni = () => {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllAlumni()
      .then((res) => setAlumni(extract(res)))
      .finally(() => setLoading(false));
  }, []);

  return { alumni, loading };
};
```

---

# 11. **List of Available Endpoints (Clean + Modern Style)**

Each module lists its endpoints in a crisp manner.

### **Auth**

```
POST /auth/register/alumni
POST /auth/login
POST /auth/verify/alumni
```

### **Alumni**

```
GET    /alumni
GET    /alumni/:id
PUT    /alumni/:id
```

### **Connections**

```
POST  /connections/send-request
POST  /connections/accept-request
POST  /connections/reject-request
GET   /connections
```

### **Events**

```
POST  /events
GET   /events
GET   /events/:id
PUT   /events/:id
DELETE /events/:id
```

### **Jobs**

```
POST  /jobs
GET   /jobs
GET   /jobs/:id
PUT   /jobs/:id
DELETE /jobs/:id
POST  /jobs/:id/apply
```

### **Chat & Messages**

```
POST  /chat
GET   /chat
GET   /chat/:id
PUT   /chat/:id
DELETE /chat/:id

POST  /messages
GET   /messages
GET   /messages/:id
PUT   /messages/:id
DELETE /messages/:id
```

### **Posts**

```
POST  /posts
GET   /posts
GET   /posts/:id
PUT   /posts/:id
DELETE /posts/:id
POST  /posts/:id/like
POST  /posts/:id/comment
```

---

# 12. **Security Best Practices**

* Never store JWT in cookies unless HTTP-only
* Always read API URL from `.env`
* Interceptors must auto-logout on 401
* Disable logs in production
* Validate query parameters before passing to backend
* Prefer POST for sensitive filters instead of GET

---

# 13. **Recommended Add-Ons (Future-Ready)**

* Auto refresh tokens via `/auth/refresh`
* File upload module (`/uploads`)
* Notification API (`/notifications`)
* Analytics endpoints

---

# 🎯 Final Summary

Your integration guide is now:

* Modular
* Professional
* Scalable
* TypeScript-friendly
* Team-ready
* Production-grade

