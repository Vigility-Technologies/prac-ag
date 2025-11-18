# System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         GEM PORTAL                              │
│                  https://bidplus.gem.gov.in                     │
└────────────────────────────┬────────────────────────────────────┘
                             │ CSRF Token + API Calls
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXPRESS BACKEND SERVER                        │
│                    (Port 5000 - Node.js)                        │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Routes                                                 │   │
│  │  • /api/auth/*     - Authentication                     │   │
│  │  • /api/users/*    - User Management                    │   │
│  │  • /api/bids/*     - Bid Management                     │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Middleware                                             │   │
│  │  • JWT Authentication                                   │   │
│  │  • Role-based Authorization                            │   │
│  │  • CORS                                                │   │
│  │  • Body Parser                                         │   │
│  │  • Cookie Parser                                       │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ Supabase Client
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SUPABASE DATABASE                           │
│                      (PostgreSQL Cloud)                          │
│                                                                  │
│  ┌──────────────┐         ┌──────────────┐                    │
│  │    users     │         │     bids     │                    │
│  ├──────────────┤         ├──────────────┤                    │
│  │ • id         │         │ • id         │                    │
│  │ • email      │◄────────┤ • assigned_to│                    │
│  │ • password   │  FK     │ • bid_number │                    │
│  │ • full_name  │         │ • gem_bid_id │                    │
│  │ • role       │         │ • status     │                    │
│  │ • created_at │         │ • due_date   │                    │
│  │ • updated_at │         │ • doc_link   │                    │
│  └──────────────┘         └──────────────┘                    │
│                                                                  │
│  Indexes: email, role, status, assigned_to, gem_bid_id         │
│  RLS Policies: Row-level security enabled                       │
└─────────────────────────────────────────────────────────────────┘
                             ▲
                             │ Axios API Calls
                             │ (JWT Token)
                             │
┌─────────────────────────────────────────────────────────────────┐
│                    NEXT.JS FRONTEND                              │
│                    (Port 3000 - React)                          │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Pages & Routes                                         │   │
│  │  • /              - Home (Auto-redirect)                │   │
│  │  • /login         - Login Page                          │   │
│  │  • /register      - Registration Page                   │   │
│  │  • /admin         - Admin Dashboard                     │   │
│  │  • /member        - Member Dashboard                    │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Context & State                                        │   │
│  │  • AuthContext    - Global auth state                   │   │
│  │  • API Client     - Axios with interceptors            │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘


# User Flow Diagrams

## Admin Flow
```

1. Admin Login
   ↓
2. Admin Dashboard
   ↓
3. Fetch Bids (CSRF Token)
   ↓
4. View All Bids
   ↓
5. Assign Bid → Select Member → Set Due Date
   ↓
6. Track Progress (Statistics)
   ↓
7. Reject Unwanted Bids

```

## Member Flow
```

1. Member Login
   ↓
2. Member Dashboard
   ↓
3. View Assigned Bids
   ↓
4. Start Work (Status → In Progress)
   ↓
5. Complete Work
   ↓
6. Submit with Document Link

```

## Bid Status Lifecycle
```

[Available]
↓ (Admin assigns to member)
[Considered]
↓ (Member starts work)
[In Progress]
↓ (Member submits)
[Submitted]

OR

[Any Status]
↓ (Admin rejects)
[Rejected] → Hidden Forever

```

# Authentication Flow
```

┌──────────┐
│ Client │
└────┬─────┘
│ 1. POST /api/auth/login
│ { email, password }
▼
┌──────────────┐
│ Backend │
└──────┬───────┘
│ 2. Verify credentials
│ 3. Hash check (bcrypt)
│ 4. Generate JWT token
│ 5. Set HTTP-only cookie
▼
┌──────────┐
│ Client │ 6. Store token in localStorage
└────┬─────┘
│ 7. Add token to requests
│ Authorization: Bearer <token>
▼
┌──────────────┐
│ Backend │ 8. Verify JWT
└──────┬───────┘ 9. Check role
│ 10. Allow/Deny access
▼
┌──────────┐
│ Client │ 11. Receive data
└──────────┘

```

# Data Flow - Fetching Bids
```

┌─────────┐
│ Admin │
└────┬────┘
│ 1. Enter CSRF Token
▼
┌──────────────┐
│ Frontend │
└──────┬───────┘
│ 2. POST /api/bids/fetch
▼
┌──────────────┐
│ Backend │
└──────┬───────┘
│ 3. Loop through 34 categories
│ 4. Fetch from GEM Portal
│ 5. Parse response
│ 6. Check for rejected bids
│ 7. Filter out rejected
▼
┌──────────────┐
│ Supabase │ 8. Upsert new bids
└──────┬───────┘
│ 9. Return saved bids
▼
┌──────────────┐
│ Backend │ 10. Send response
└──────┬───────┘
│ 11. Stats + Counts
▼
┌──────────────┐
│ Frontend │ 12. Update UI
└──────┬───────┘
│ 13. Show success
▼
┌─────────┐
│ Admin │ View new bids
└─────────┘

```

# Security Layers
```

┌─────────────────────────────────────┐
│ 1. HTTPS (Production) │
├─────────────────────────────────────┤
│ 2. CORS (Frontend Whitelist) │
├─────────────────────────────────────┤
│ 3. JWT Token Verification │
├─────────────────────────────────────┤
│ 4. Role-Based Access Control │
├─────────────────────────────────────┤
│ 5. Row-Level Security (Supabase) │
├─────────────────────────────────────┤
│ 6. Input Validation │
├─────────────────────────────────────┤
│ 7. Password Hashing (bcrypt) │
├─────────────────────────────────────┤
│ 8. HTTP-Only Cookies │
└─────────────────────────────────────┘

```

# Deployment Architecture
```

┌──────────────────┐
│ Vercel/Netlify │ ← Next.js Frontend
└────────┬─────────┘
│ API Calls
▼
┌──────────────────┐
│ Heroku/Railway │ ← Express Backend
└────────┬─────────┘
│ Database Connection
▼
┌──────────────────┐
│ Supabase Cloud │ ← PostgreSQL Database
└──────────────────┘

```

```
