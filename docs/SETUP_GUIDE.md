# Setup Guide - GEM Bid Management System

## Quick Start (Step by Step)

### Step 1: Create Supabase Project

1. Go to <https://supabase.com> and create an account
2. Create a new project
3. Wait for the project to initialize (2-3 minutes)
4. Go to **SQL Editor** in the left sidebar
5. Copy the entire content from `server/src/db/schema.sql` and paste it
6. Click **Run** to execute the SQL
7. Go to **Settings → API** and copy:
   - Project URL (SUPABASE_URL)
   - anon/public key (SUPABASE_ANON_KEY)
   - service_role key (SUPABASE_SERVICE_KEY)

### Step 2: Install Backend Dependencies

```bash
cd server
npm install
```

### Step 3: Configure Backend Environment

```bash
# Copy the example env file
cp .env.example .env

# Open .env and fill in:
# PORT=5000
# NODE_ENV=development
# SUPABASE_URL=<your-supabase-url>
# SUPABASE_ANON_KEY=<your-anon-key>
# SUPABASE_SERVICE_KEY=<your-service-key>
# JWT_SECRET=<generate-random-string-here>
# JWT_EXPIRES_IN=7d
# FRONTEND_URL=http://localhost:3000
# GEMINI_API_KEY=<your-gemini-api-key>
```

To generate JWT_SECRET, you can use:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 4: Start Backend Server

```bash
# From server directory
npm run dev
```

You should see: `🚀 Server running on http://localhost:5000`

### Step 5: Install Frontend Dependencies

```bash
# From project root (go back one directory)
cd ..
npm install
```

### Step 6: Configure Frontend Environment

```bash
# Copy the example env file
cp .env.local.example .env.local

# Open .env.local and set:
# NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Step 7: Start Frontend Server

```bash
# From project root
npm run dev
```

You should see the Next.js app starting on `http://localhost:3000`

### Step 8: First Login

1. Open browser to `http://localhost:3000`
2. Click "Register here"
3. Create an admin account:
   - Full Name: Your Name
   - Email: `your@email.com` (example)
   - Password: (min 6 characters)
   - Role: Admin
4. Click Register
5. You'll be redirected to Admin Dashboard

### Step 9: Get GEM CSRF Token

1. Go to <https://bidplus.gem.gov.in>
2. Open Browser DevTools (F12)
3. Go to Console tab
4. Type: `document.cookie`
5. Find and copy the value after `csrf_gem_cookie=`

### Step 10: Fetch Bids

1. In Admin Dashboard, paste your CSRF token
2. Optionally set an end date
3. Click "Fetch Bids"
4. Wait for the bids to be fetched (this may take a few minutes)

## 🎯 Usage Guide

### As Admin

1. **Fetch Bids**: Use GEM CSRF token to import bids
2. **View Bids**: See all available bids (rejected ones are hidden)
3. **Assign Bids**: Click "Assign" on a bid, select a member, set due date
4. **Track Progress**: Monitor status of all bids
5. **Reject Bids**: Click "Reject" to permanently hide unwanted bids

### As Member

1. **View Assigned Bids**: See bids assigned to you
2. **Start Work**: Click "Start Work" to change status to In Progress
3. **Submit**: Add document link and click "Submit" when done
4. **Download**: Download bid documents from GEM portal

## 📊 Bid Status Flow

```text
Available → Considered → In Progress → Submitted
           ↓
        Rejected (hidden forever)
```

## 🔧 Troubleshooting

### Backend won't start

- Check if port 5000 is available
- Verify all environment variables in .env
- Check Supabase credentials are correct

### Frontend won't start

- Check if port 3000 is available
- Verify .env.local has correct API URL
- Clear .next folder: `rm -rf .next`

### Can't login

- Verify backend is running on port 5000
- Check browser console for errors
- Clear localStorage and cookies

### Bids not fetching

- Verify CSRF token is fresh (regenerate from GEM portal)
- Check backend logs for errors
- Ensure Supabase is accessible

### CORS errors

- Verify FRONTEND_URL in backend .env matches your frontend URL
- Check both servers are running

## 🚀 Production Deployment

### Backend (Deploy to Heroku, Railway, or any Node.js host)

```bash
cd server
npm run build
npm start
```

Set environment variables on your hosting platform.

### Frontend (Deploy to Vercel, Netlify)

```bash
npm run build
```

Set `NEXT_PUBLIC_API_URL` to your production backend URL.

### Supabase

Your Supabase database is already hosted in the cloud, no additional deployment needed!

## 📝 Notes

- First user should create an admin account to manage the system
- Create member accounts for team members who will work on bids
- Rejected bids are filtered at database level and won't appear again
- Document links can be Google Drive, Dropbox, or any accessible URL
- CSRF tokens expire, fetch a new one when bids stop loading

## 🆘 Support

If you encounter issues:

1. Check all environment variables are set correctly
2. Verify Supabase SQL schema was run successfully
3. Check browser console and server logs for errors
4. Ensure both frontend and backend servers are running
