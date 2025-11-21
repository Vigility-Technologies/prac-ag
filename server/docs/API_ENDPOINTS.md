# API Endpoints Documentation

Complete documentation of all backend API endpoints following BE_PRECISE_API format.

---

## Health API

### GET /health

```text
GET /health
   ├─ Input: None
   │
   ├─ System Process:
   │  └─ No processing required
   │
   └─ Returns:
      ├─ Status: 200 OK
      └─ Body: { status: "ok", message: "GEM Bot API is running" }
```

**Summary:** Health check endpoint. Returns server status with no authentication required.

---

## Authentication APIs

### POST /api/auth/register

```text
POST /api/auth/register
   ├─ Input: RegisterRequest
   │  ├─ email (required, valid email format)
   │  ├─ password (required, min 6 characters)
   │  ├─ full_name (required, non-empty string)
   │  └─ role (required, "admin" | "member")
   │
   ├─ Validation:
   │  ├─ Email format validation
   │  ├─ Password length check (≥6)
   │  ├─ Full name not empty
   │  └─ Role must be "admin" or "member"
   │
   ├─ System Process:
   │  ├─ Check if email already exists in users table
   │  ├─ Hash password with bcrypt (10 rounds)
   │  ├─ Insert new user into users table
   │  ├─ Generate JWT token (expires: 7 days)
   │  └─ Set HTTP-only cookie with token
   │
   └─ Returns:
      ├─ Success (201 Created):
      │  └─ Body: { user: { id, email, full_name, role }, token }
      │
      └─ Errors:
         ├─ 400 Bad Request: Validation errors or email already registered
         └─ 500 Internal Server Error: Database/processing failure
```

**Summary:** Creates new user account with hashed password and returns JWT token. Email must be unique.

**Database Tables:**

- `users` - User records

---

### POST /api/auth/login

```text
POST /api/auth/login
   ├─ Input: LoginRequest
   │  ├─ email (required, valid email format)
   │  └─ password (required, non-empty)
   │
   ├─ Validation:
   │  ├─ Email format validation
   │  └─ Password not empty
   │
   ├─ System Process:
   │  ├─ Query users table by email
   │  ├─ Verify password with bcrypt.compare()
   │  ├─ Generate JWT token (expires: 7 days)
   │  └─ Set HTTP-only cookie with token
   │
   └─ Returns:
      ├─ Success (200 OK):
      │  └─ Body: { user: { id, email, full_name, role }, token }
      │
      └─ Errors:
         ├─ 400 Bad Request: Validation errors
         ├─ 401 Unauthorized: Invalid credentials
         └─ 500 Internal Server Error: Database/processing failure
```

**Summary:** Validates email/password credentials and returns JWT token. Sets HTTP-only cookie.

**Database Tables:**

- `users` - User records

---

### GET /api/auth/me

```text
GET /api/auth/me
   ├─ Input: None
   │
   ├─ Authentication:
   │  └─ Requires valid JWT token (via authenticate middleware)
   │
   ├─ System Process:
   │  ├─ Extract user ID from JWT token
   │  └─ Query users table for current user details
   │
   └─ Returns:
      ├─ Success (200 OK):
      │  └─ Body: { user: { id, email, full_name, role, created_at } }
      │
      └─ Errors:
         ├─ 401 Unauthorized: Invalid/missing token
         └─ 500 Internal Server Error: Database failure
```

**Summary:** Returns current authenticated user details from JWT token.

**Database Tables:**

- `users` - User records

---

### POST /api/auth/logout

```text
POST /api/auth/logout
   ├─ Input: None
   │
   ├─ System Process:
   │  └─ Clear HTTP-only cookie (token)
   │
   └─ Returns:
      └─ Success (200 OK):
         └─ Body: { message: "Logged out successfully" }
```

**Summary:** Clears authentication cookie. No database operations required.

---

## User Management APIs

### GET /api/users/members

```text
GET /api/users/members
   ├─ Input: None
   │
   ├─ Authentication:
   │  ├─ Requires valid JWT token
   │  └─ Requires admin role (via isAdmin middleware)
   │
   ├─ System Process:
   │  ├─ Query users table
   │  ├─ Filter by role = "member"
   │  └─ Order by full_name (ascending)
   │
   └─ Returns:
      ├─ Success (200 OK):
      │  └─ Body: { members: [{ id, email, full_name, created_at }] }
      │
      └─ Errors:
         ├─ 401 Unauthorized: Invalid/missing token
         ├─ 403 Forbidden: Not an admin user
         └─ 500 Internal Server Error: Database failure
```

**Summary:** Admin-only endpoint to list all member users, ordered by name.

**Database Tables:**

- `users` - User records (filtered by role = "member")

---

### POST /api/users/members/bulk

```text
POST /api/users/members/bulk
   ├─ Input: BulkCreateRequest
   │  ├─ members (required, array of objects, min 1)
   │  │  ├─ full_name (required, non-empty string)
   │  │  └─ email (required, valid email format)
   │  └─ defaultPassword (optional, min 6 characters, default: "Member@123")
   │
   ├─ Authentication:
   │  ├─ Requires valid JWT token
   │  └─ Requires admin role (via isAdmin middleware)
   │
   ├─ Validation:
   │  ├─ members must be array with at least 1 item
   │  ├─ Each member must have full_name and email
   │  └─ Email format validation for each member
   │
   ├─ System Process:
   │  ├─ Hash defaultPassword with bcrypt (10 rounds)
   │  ├─ Map members array to insert format (role = "member")
   │  ├─ Bulk insert into users table
   │  └─ Return created members (excluding password)
   │
   └─ Returns:
      ├─ Success (201 Created):
      │  └─ Body: { message: "{count} members created successfully", members: [...], defaultPassword }
      │
      └─ Errors:
         ├─ 400 Bad Request: Validation errors or duplicate emails
         ├─ 401 Unauthorized: Invalid/missing token
         ├─ 403 Forbidden: Not an admin user
         └─ 500 Internal Server Error: Database failure
```

**Summary:** Admin-only endpoint to bulk create multiple member accounts with a shared default password.

**Database Tables:**

- `users` - User records (bulk insert)

---

## Bid Management APIs

### POST /api/bids/fetch

```text
POST /api/bids/fetch
   ├─ Input: FetchBidsRequest
   │  ├─ csrfToken (required, non-empty string)
   │  └─ endDate (optional, string, ISO date format)
   │
   ├─ Authentication:
   │  ├─ Requires valid JWT token
   │  └─ Requires admin role (via isAdmin middleware)
   │
   ├─ Validation:
   │  ├─ csrfToken must not be empty
   │  └─ endDate must be valid string if provided
   │
   ├─ System Process:
   │  ├─ Loop through 34 predefined categories
   │  ├─ For each category:
   │  │  ├─ Fetch bids from GEM portal (paginated)
   │  │  ├─ Parse bid data (bid_number, category, quantity, end_date, department)
   │  │  └─ Continue until all pages fetched
   │  ├─ Deduplicate bids by gem_bid_id
   │  ├─ Check existing rejected bids in database
   │  ├─ Filter out rejected bids from fetched list
   │  ├─ Upsert new bids into bids table (onConflict: gem_bid_id)
   │  └─ Trigger background PQ generation for new bids (async)
   │
   └─ Returns:
      ├─ Success (200 OK):
      │  └─ Body: {
      │       message: "Bids fetched successfully",
      │       totalFetched: number,
      │       uniqueBids: number,
      │       duplicatesRemoved: number,
      │       newBidsAdded: number,
      │       rejectedFiltered: number
      │     }
      │
      └─ Errors:
         ├─ 400 Bad Request: Validation errors
         ├─ 401 Unauthorized: Invalid/missing token
         ├─ 403 Forbidden: Not an admin user
         └─ 500 Internal Server Error: GEM portal fetch failure or database error
```

**Summary:** Admin-only endpoint to fetch bids from GEM portal across all categories, filter rejected bids, and upsert into database.

**Database Tables:**

- `bids` - Bid records (upsert operation)

**External API:**

- GEM Portal: `https://bidplus.gem.gov.in/search-bids`

---

### GET /api/bids/categories

```text
GET /api/bids/categories
   ├─ Input: None
   │
   ├─ Authentication:
   │  └─ Requires valid JWT token
   │
   ├─ System Process:
   │  ├─ Query bids table
   │  ├─ Filter out rejected bids (status != "rejected")
   │  ├─ Select category_name and category_id
   │  ├─ Extract unique categories
   │  └─ Sort by category_name (alphabetical)
   │
   └─ Returns:
      ├─ Success (200 OK):
      │  └─ Body: { categories: [{ name: string, id: string }] }
      │
      └─ Errors:
         ├─ 401 Unauthorized: Invalid/missing token
         └─ 500 Internal Server Error: Database failure
```

**Summary:** Returns unique categories from non-rejected bids, sorted alphabetically.

**Database Tables:**

- `bids` - Bid records (for category extraction)

---

### GET /api/bids/available

```text
GET /api/bids/available
   ├─ Input: Query Parameters
   │  └─ category (optional, string, category name)
   │
   ├─ Authentication:
   │  └─ Requires valid JWT token
   │
   ├─ System Process:
   │  ├─ Query bids table
   │  ├─ Filter out rejected bids (status != "rejected")
   │  ├─ Apply category filter if provided
   │  ├─ Select all fields including assigned_to, assigned_user_name, due_date
   │  └─ Order by end_date (ascending)
   │
   └─ Returns:
      ├─ Success (200 OK):
      │  └─ Body: { bids: [...] }
      │
      └─ Errors:
         ├─ 401 Unauthorized: Invalid/missing token
         └─ 500 Internal Server Error: Database failure
```

**Summary:** Returns all non-rejected bids, optionally filtered by category, ordered by end date.

**Database Tables:**

- `bids` - Bid records

---

### GET /api/bids/my-bids

```text
GET /api/bids/my-bids
   ├─ Input: Query Parameters
   │  └─ category (optional, string, category name)
   │
   ├─ Authentication:
   │  └─ Requires valid JWT token
   │
   ├─ System Process:
   │  ├─ Extract user ID from JWT token
   │  ├─ Query bids table
   │  ├─ Filter by assigned_to = current user ID
   │  ├─ Filter out rejected bids (status != "rejected")
   │  ├─ Apply category filter if provided
   │  └─ Order by due_date (ascending)
   │
   └─ Returns:
      ├─ Success (200 OK):
      │  └─ Body: { bids: [...] }
      │
      └─ Errors:
         ├─ 401 Unauthorized: Invalid/missing token
         └─ 500 Internal Server Error: Database failure
```

**Summary:** Returns bids assigned to current user, optionally filtered by category, ordered by due date.

**Database Tables:**

- `bids` - Bid records (filtered by assigned_to)

---

### POST /api/bids/:bidId/assign

```text
POST /api/bids/:bidId/assign
   ├─ Input: AssignBidRequest
   │  ├─ bidId (path parameter, UUID)
   │  ├─ assignedTo (required, UUID, user ID)
   │  ├─ assignedUserName (required, string)
   │  └─ dueDate (optional, ISO8601 date string)
   │
   ├─ Authentication:
   │  └─ Requires valid JWT token
   │
   ├─ Validation:
   │  ├─ assignedTo must not be empty
   │  ├─ assignedUserName must not be empty
   │  └─ dueDate must be valid ISO8601 format if provided
   │
   ├─ Authorization Checks:
   │  ├─ Members can only self-assign (assignedTo must equal their user ID)
   │  ├─ Admins can assign to anyone
   │  ├─ Members can only assign available and unassigned bids
   │  └─ Admins can reassign any bid
   │
   ├─ System Process:
   │  ├─ Verify bid exists
   │  ├─ Check bid status and assignment (for members)
   │  ├─ Update bid with assigned_to, assigned_user_name
   │  ├─ Update due_date if provided
   │  ├─ Set status to "considered" if currently "available"
   │  └─ Update updated_at timestamp
   │
   └─ Returns:
      ├─ Success (200 OK):
      │  └─ Body: { message: "Bid assigned successfully", bid: {...} }
      │
      └─ Errors:
         ├─ 400 Bad Request: Validation errors, bid not available, or already assigned
         ├─ 401 Unauthorized: Invalid/missing token
         ├─ 403 Forbidden: Not authorized to assign to this user
         ├─ 404 Not Found: Bid not found
         └─ 500 Internal Server Error: Database failure
```

**Summary:** Assigns bid to user with optional due date. Members can only self-assign available bids; admins can assign any bid.

**Database Tables:**

- `bids` - Bid records (update operation)

---

### PATCH /api/bids/:bidId/status

```text
PATCH /api/bids/:bidId/status
   ├─ Input: UpdateStatusRequest
   │  ├─ bidId (path parameter, UUID)
   │  ├─ status (required, one of: "available", "rejected", "considered", "in-progress", "submitted")
   │  └─ submittedDocLink (optional, string, required if status = "submitted")
   │
   ├─ Authentication:
   │  └─ Requires valid JWT token
   │
   ├─ Validation:
   │  └─ status must be one of the allowed values
   │
   ├─ Authorization Checks:
   │  ├─ Admin can update any bid
   │  └─ Members can only update bids assigned to them
   │
   ├─ System Process:
   │  ├─ Verify bid exists and check assignment
   │  ├─ Update bid status
   │  ├─ Update submitted_doc_link if status = "submitted" and link provided
   │  └─ Update updated_at timestamp
   │
   └─ Returns:
      ├─ Success (200 OK):
      │  └─ Body: { message: "Bid status updated successfully", bid: {...} }
      │
      └─ Errors:
         ├─ 400 Bad Request: Validation errors
         ├─ 401 Unauthorized: Invalid/missing token
         ├─ 403 Forbidden: Not authorized to update this bid
         ├─ 404 Not Found: Bid not found
         └─ 500 Internal Server Error: Database failure
```

**Summary:** Updates bid status through workflow (available → considered → in-progress → submitted). Members can only update their assigned bids.

**Database Tables:**

- `bids` - Bid records (update operation)

---

### GET /api/bids/stats

```text
GET /api/bids/stats
   ├─ Input: Query Parameters
   │  └─ category (optional, string, category name)
   │
   ├─ Authentication:
   │  ├─ Requires valid JWT token
   │  └─ Requires admin role (via isAdmin middleware)
   │
   ├─ System Process:
   │  ├─ Query bids table
   │  ├─ Apply category filter if provided
   │  ├─ Select status and category_name fields
   │  └─ Calculate counts by status:
   │     ├─ total
   │     ├─ available
   │     ├─ considered
   │     ├─ inProgress
   │     ├─ submitted
   │     └─ rejected
   │
   └─ Returns:
      ├─ Success (200 OK):
      │  └─ Body: {
      │       stats: {
      │         total: number,
      │         available: number,
      │         considered: number,
      │         inProgress: number,
      │         submitted: number,
      │         rejected: number
      │       }
      │     }
      │
      └─ Errors:
         ├─ 401 Unauthorized: Invalid/missing token
         ├─ 403 Forbidden: Not an admin user
         └─ 500 Internal Server Error: Database failure
```

**Summary:** Admin-only endpoint to get bid statistics by status, optionally filtered by category.

**Database Tables:**

- `bids` - Bid records (for statistics calculation)

---

### GET /api/bids/document/:gemBidId

```text
GET /api/bids/document/:gemBidId
   ├─ Input: Path Parameters
   │  └─ gemBidId (required, string, GEM bid ID)
   │
   ├─ Authentication:
   │  └─ Requires valid JWT token
   │
   ├─ System Process:
   │  ├─ Construct GEM portal document URL
   │  ├─ Fetch document from GEM portal
   │  ├─ Determine content type (PDF or DOC)
   │  ├─ Generate filename: {gemBidId}.{extension}
   │  └─ Stream document as binary response
   │
   └─ Returns:
      ├─ Success (200 OK):
      │  ├─ Content-Type: application/pdf or application/msword
      │  ├─ Content-Disposition: attachment; filename="{gemBidId}.{ext}"
      │  └─ Body: Binary file content
      │
      └─ Errors:
         ├─ 401 Unauthorized: Invalid/missing token
         ├─ 404 Not Found: Document not found on GEM portal
         └─ 500 Internal Server Error: Download failure
```

**Summary:** Downloads bid document (PDF/DOC) from GEM portal and streams as binary response with appropriate headers.

**External API:**

- GEM Portal: `https://bidplus.gem.gov.in/showbidDocument/{gemBidId}`

---

### POST /api/bids/:bidId/check-pq

```text
POST /api/bids/:bidId/check-pq
   ├─ Input: Path Parameters
   │  └─ bidId (required, UUID)
   │
   ├─ Authentication:
   │  └─ Requires valid JWT token
   │
   ├─ System Process:
   │  ├─ Query bid from database by bidId
   │  ├─ Check if bid_preparation_guide already exists
   │  ├─ If exists, return cached guide
   │  ├─ If not exists:
   │  │  ├─ Download PDF from GEM portal using gem_bid_id
   │  │  ├─ Parse PDF text using pdf-parse
   │  │  ├─ Generate guide using Gemini AI (gemini-2.0-flash model)
   │  │  ├─ Structure guide with:
   │  │  │  ├─ Scope of Work & Technical Requirements
   │  │  │  ├─ Pre-Qualification (PQ) Criteria
   │  │  │  ├─ Bid Submission Checklist
   │  │  │  └─ Important Bid Details
   │  │  └─ Save guide to bids.bid_preparation_guide
   │  └─ Return generated guide
   │
   └─ Returns:
      ├─ Success (200 OK):
      │  └─ Body: { guide: string (markdown formatted) }
      │
      └─ Errors:
         ├─ 401 Unauthorized: Invalid/missing token
         ├─ 404 Not Found: Bid not found
         └─ 500 Internal Server Error: PDF download/parsing/AI generation failure
```

**Summary:** Generates AI-powered bid preparation guide from PDF. Returns cached guide if already generated, otherwise downloads PDF, parses text, and uses Gemini AI to create structured guide.

**Database Tables:**

- `bids` - Bid records (update bid_preparation_guide field)

**External APIs:**

- GEM Portal: `https://bidplus.gem.gov.in/showbidDocument/{gemBidId}`
- Google Gemini AI: For generating bid preparation guide

---

## Summary

### Authentication Flow

1. **Register**: Creates new user account, hashes password, returns JWT token
2. **Login**: Validates credentials, returns JWT token
3. **Me**: Returns current authenticated user details
4. **Logout**: Clears authentication cookie

### User Management

- **Get Members**: Admin-only endpoint to list all member users
- **Bulk Create Members**: Admin-only endpoint to create multiple member accounts at once

### Bid Management Flow

1. **Fetch**: Admin fetches bids from GEM portal, filters rejected, saves to database
2. **Categories**: Get unique categories from available bids
3. **Available**: Get all non-rejected bids (admin sees all, members see assigned)
4. **My Bids**: Get bids assigned to current user
5. **Assign**: Assign bid to user with optional due date
6. **Status Update**: Update bid status through workflow (available → considered → in-progress → submitted)
7. **Stats**: Admin-only statistics dashboard
8. **Document Download**: Download bid documents from GEM portal
9. **Check PQ**: Generate AI-powered bid preparation guide from PDF

### Security Features

- JWT-based authentication with 7-day expiration
- HTTP-only cookies for token storage
- Password hashing with bcrypt (10 rounds)
- Role-based access control (admin vs member)
- Input validation on all endpoints
- Email uniqueness enforcement

### Database Tables

- `users` - User accounts and authentication
- `bids` - Bid records, assignments, and status tracking

### External Integrations

- **GEM Portal**: Bid fetching and document downloads
- **Google Gemini AI**: Bid preparation guide generation
