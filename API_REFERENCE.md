# API Quick Reference

Base URL: `http://localhost:5000`

## Authentication Endpoints

### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "John Doe",
  "role": "admin" | "member"
}

Response: {
  "user": { "id", "email", "full_name", "role" },
  "token": "jwt_token"
}
```

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response: {
  "user": { "id", "email", "full_name", "role" },
  "token": "jwt_token"
}
```

### Get Current User

```http
GET /api/auth/me
Authorization: Bearer <token>

Response: {
  "user": { "id", "email", "full_name", "role", "created_at" }
}
```

### Logout

```http
POST /api/auth/logout
Authorization: Bearer <token>

Response: { "message": "Logged out successfully" }
```

## User Management (Admin Only)

### Get All Members

```http
GET /api/users/members
Authorization: Bearer <token>

Response: {
  "members": [
    { "id", "email", "full_name", "created_at" }
  ]
}
```

## Bid Management

### Fetch Bids from GEM (Admin Only)

```http
POST /api/bids/fetch
Authorization: Bearer <token>
Content-Type: application/json

{
  "csrfToken": "your_csrf_token",
  "endDate": "2024-12-31" // optional
}

Response: {
  "message": "Bids fetched successfully",
  "totalFetched": 100,
  "newBidsAdded": 80,
  "rejectedFiltered": 20
}
```

### Get All Categories

```http
GET /api/bids/categories
Authorization: Bearer <token>

Response: {
  "categories": [
    { "name": "Enterprise Storage", "id": "home_info_co87882452_medi_en44773564" }
  ]
}
```

### Get Available Bids

```http
GET /api/bids/available?category=Enterprise%20Storage
Authorization: Bearer <token>

Query Parameters:
- category (optional): Filter by category name

Response: {
  "bids": [
    {
      "id", "bid_number", "gem_bid_id",
      "category_name", "category_id", "quantity", "end_date",
      "department", "status", "assigned_to",
      "assigned_user_name", "due_date",
      "submitted_doc_link", "created_at", "updated_at"
    }
  ]
}
```

### Get My Assigned Bids (Member)

```http
GET /api/bids/my-bids?category=Enterprise%20Storage
Authorization: Bearer <token>

Query Parameters:
- category (optional): Filter by category name

Response: {
  "bids": [ ... ] // Same structure as above
}
```

### Assign Bid to Member (Admin Only)

```http
POST /api/bids/:bidId/assign
Authorization: Bearer <token>
Content-Type: application/json

{
  "assignedTo": "user_id",
  "assignedUserName": "John Doe",
  "dueDate": "2024-12-31" // optional
}

Response: {
  "message": "Bid assigned successfully",
  "bid": { ... }
}
```

### Update Bid Status

```http
PATCH /api/bids/:bidId/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "available" | "rejected" | "considered" | "in-progress" | "submitted",
  "submittedDocLink": "https://..." // required if status is "submitted"
}

Response: {
  "message": "Bid status updated successfully",
  "bid": { ... }
}
```

### Get Bid Statistics (Admin Only)

```http
GET /api/bids/stats?category=Enterprise%20Storage
Authorization: Bearer <token>

Query Parameters:
- category (optional): Filter statistics by category name

Response: {
  "stats": {
    "total": 100,
    "available": 50,
    "considered": 20,
    "inProgress": 15,
    "submitted": 10,
    "rejected": 5
  }
}
```

### Bulk Create Members (Admin Only)

```http
POST /api/users/members/bulk
Authorization: Bearer <token>
Content-Type: application/json

{
  "members": [
    {"full_name": "John Doe", "email": "john@example.com"},
    {"full_name": "Jane Smith", "email": "jane@example.com"}
  ],
  "defaultPassword": "Member@123" // optional, defaults to "Member@123"
}

Response: {
  "message": "2 members created successfully",
  "members": [ ... ],
  "defaultPassword": "Member@123"
}
```

### Download Bid Document

```http
GET /api/bids/document/:gemBidId
Authorization: Bearer <token>

Response: Binary file (PDF/DOC)
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (not logged in or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Server Error

## Authentication

All protected endpoints require one of:

- `Authorization: Bearer <token>` header
- `token` cookie (set automatically on login)

## CORS

Frontend URL must be in `FRONTEND_URL` environment variable.
Credentials are included in all requests.

## Rate Limiting

GEM portal fetching uses:

- Batch size: 2 categories at a time
- Delay between batches: 1 second
- Delay between pages: 500ms
- Retry attempts: 3 with exponential backoff
