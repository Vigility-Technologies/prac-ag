# GEM Bid Management System

A comprehensive bid management system with Express backend, Supabase database, and Next.js frontend.

## 🏗️ Architecture

- **Backend**: Express.js with TypeScript (Monolithic)
- **Database**: Supabase (PostgreSQL)
- **Frontend**: Next.js 14 with TypeScript
- **Authentication**: JWT-based auth with role-based access control

## 🚀 Features

### Authentication

- User registration and login
- Role-based access control (Admin & Member)
- JWT token authentication

### Admin Features

- Fetch bids from GEM portal
- View all available bids (excluding rejected)
- Assign bids to team members
- Track bid status (Available, Considered, In Progress, Submitted, Rejected)
- Set due dates for assigned bids
- View bid statistics
- Download bid documents

### Member Features

- View assigned bids
- Update bid status (Start Work, Submit)
- Add submitted document links
- Download bid documents
- Track due dates

### Bid Management

- Rejected bids are automatically filtered out
- Status tracking: Available → Considered → In Progress → Submitted
- Document management with external storage links
- Comprehensive bid information (category, department, quantity, dates)

## 📁 Project Structure

```
├── server/                    # Express backend
│   ├── src/
│   │   ├── config/           # Supabase configuration
│   │   ├── db/               # Database schema and migrations
│   │   ├── middleware/       # Auth middleware
│   │   ├── routes/           # API routes
│   │   ├── types/            # TypeScript types
│   │   └── index.ts          # Server entry point
│   ├── package.json
│   └── tsconfig.json
│
├── app/                      # Next.js frontend
│   ├── admin/               # Admin dashboard
│   ├── member/              # Member dashboard
│   ├── login/               # Login page
│   └── register/            # Registration page
│
├── contexts/                # React contexts
│   └── AuthContext.tsx      # Authentication context
│
├── lib/                     # Utilities
│   └── api.ts              # API client
│
└── package.json            # Frontend dependencies
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- Supabase account
- GEM portal CSRF token

### 1. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema from `server/src/db/schema.sql`
3. Get your Supabase URL and keys from Settings → API

### 2. Backend Setup

```bash
cd server
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your credentials:
# - SUPABASE_URL
# - SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_KEY
# - JWT_SECRET (generate a random string)
# - FRONTEND_URL (default: http://localhost:3000)

# Run development server
npm run dev
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
# From project root
npm install

# Copy environment file
cp .env.local.example .env.local

# Edit .env.local:
# NEXT_PUBLIC_API_URL=http://localhost:5000

# Run development server
npm run dev
```

The frontend will run on `http://localhost:3000`

## 🔑 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Users

- `GET /api/users/members` - Get all members (admin only)

### Bids

- `POST /api/bids/fetch` - Fetch bids from GEM portal (admin only)
- `GET /api/bids/available` - Get available bids (exclude rejected)
- `GET /api/bids/my-bids` - Get bids assigned to member
- `POST /api/bids/:bidId/assign` - Assign bid to member (admin only)
- `PATCH /api/bids/:bidId/status` - Update bid status
- `GET /api/bids/stats` - Get bid statistics (admin only)
- `GET /api/bids/document/:gemBidId` - Download bid document

## 🗄️ Database Schema

### Users Table

- `id` (UUID, Primary Key)
- `email` (Unique)
- `password` (Hashed)
- `full_name`
- `role` (admin | member)
- `created_at`, `updated_at`

### Bids Table

- `id` (UUID, Primary Key)
- `bid_number`
- `gem_bid_id` (Unique)
- `category_name`, `category_id`
- `quantity`, `end_date`, `department`
- `status` (available | rejected | considered | in-progress | submitted)
- `assigned_to` (Foreign Key → users.id)
- `assigned_user_name`
- `due_date`
- `submitted_doc_link`
- `created_at`, `updated_at`

## 🔐 Security Features

- JWT-based authentication
- HTTP-only cookies
- CORS configuration
- Row-level security in Supabase
- Password hashing with bcrypt
- Role-based access control

## 📝 Usage Flow

1. **Admin registers/logs in** → Redirected to Admin Dashboard
2. **Admin fetches bids** → Enter GEM CSRF token → Bids imported
3. **Admin assigns bid** → Select bid → Choose member → Set due date
4. **Member logs in** → Sees assigned bids
5. **Member starts work** → Updates status to "In Progress"
6. **Member submits** → Adds document link → Marks as "Submitted"
7. **Admin can reject** → Bid hidden from future views

## 🚀 Production Deployment

### Backend

```bash
cd server
npm run build
npm start
```

### Frontend

```bash
npm run build
npm start
```

## 🔧 Environment Variables

### Backend (.env)

```
PORT=5000
NODE_ENV=production
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-frontend-url.com
```

### Frontend (.env.local)

```
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

## 📄 License

MIT

## 👥 Support

For issues and questions, please create an issue in the repository.
