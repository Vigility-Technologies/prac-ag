# Quick Start Guide - New Features

## 🎯 What's New?

### For Admins

1. **Search Bar** - Find bids instantly
2. **Category Filter** - Filter by bid categories
3. **Member Filter** - See bids by assigned member or unassigned
4. **Table/Card View Toggle** - Switch between layouts (📊/📇 buttons)
5. **Bid Details Modal** - Click 👁️ to see full details and take actions

### For Members

1. **Search & Filter** - Find your assigned bids quickly
2. **Table/Card View** - Choose your preferred layout
3. **Status Management** - Update bid status through modal
4. **Document Submission** - Submit work with links

## 🚀 Quick Actions

### Admin - Assign a Bid

```text
1. Click 👁️ on any available bid
2. Select member from dropdown
3. Set due date (optional)
4. Click "Assign Bid"
```

### Admin - Change Status

```text
1. Click 👁️ on any bid
2. Click "Change Status"
3. Select new status
4. Confirm
```

### Member - Submit Work

```text
1. Click 👁️ on your bid
2. Click "Change Status"
3. Add document link
4. Select "Submitted"
5. Confirm
```

## 🔍 Search Tips

Search works across:

- Bid numbers
- Category names
- Department names
- Assigned member names (admin only)

## 📊 Filter Combinations

You can combine multiple filters:

- Status + Category
- Status + Member (admin)
- Search + Any filter

## 🎨 Status Colors

- 🟢 **Available** - Green
- 🔵 **Considered** - Blue
- 🟠 **In Progress** - Orange
- 🟣 **Submitted** - Purple
- 🔴 **Rejected** - Red

## ⌨️ Keyboard Tips

- Click outside modal to close
- Use Tab to navigate forms
- Enter in search to apply

## 📱 Mobile Usage

- Swipe to scroll table
- Use card view for easier mobile viewing
- Tap 👁️ to see full details

## 🛠️ For Developers

### Run Member Seed Script

```bash
cd server
npm run seed:members
```

### API Examples

**Get Categories:**

```bash
GET /api/bids/categories
```

**Filter by Category:**

```bash
GET /api/bids/available?category=Enterprise%20Storage
```

**Filter by Member:**

```bash
GET /api/bids/stats?category=Cloud%20Service
```

## ❓ FAQ

**Q: Can I assign multiple members to one bid?**
A: No, each bid can only be assigned to one member.

**Q: Can members see all bids?**
A: No, members only see bids assigned to them.

**Q: How do I bulk create members?**
A: Use `npm run seed:members` or the bulk API endpoint.

**Q: Can I change a submitted bid back to in-progress?**
A: Yes, admins can change any status. Members can only move forward.

**Q: What if I don't see my category?**
A: Categories are auto-populated from fetched bids. Fetch bids first.
