# La Yucateca — Admin Pages Documentation

## Overview

All missing admin pages have been created for the La Yucateca CMS. These production-ready pages provide comprehensive management tools for the platform with a consistent design aesthetic.

---

## Created Pages

### 1. **Dashboard** (`/src/app/admin/page.tsx`)
- ✅ Main admin overview with key metrics
- Stats cards showing: Total Posts, Draft Posts, Portfolio Items, Draft Portfolio
- Quick action buttons for creating new posts/portfolio items
- Recent posts table with edit/view options
- Summary of platform activity

**Features:**
- Real-time data fetching with Prisma
- Quick stats with color-coded indicators
- Direct links to content creation
- Action-oriented interface

---

### 2. **Users Management** (`/src/app/admin/users/page.tsx`)
- ✅ Complete user management system
- Create, read, update, delete (CRUD) users
- Role management (User, Moderator, Admin)
- Search and filter by role
- Stats dashboard showing user distribution

**Features:**
- User statistics by role
- Search functionality
- Role-based filtering
- Quick role switching from table
- Email validation
- User profile editing form

**Roles:**
- `USER` - Standard user (blue)
- `MODERATOR` - Moderation capabilities (blue)
- `ADMIN` - Full administrative access (orange)

---

### 3. **Settings** (`/src/app/admin/settings/page.tsx`)
- ✅ Comprehensive app configuration
- 4 tabbed sections for organized settings
- General, Content, Performance, and System configurations

**Tab 1: General**
- Site name and description
- Maintenance mode toggle
- Basic platform metadata

**Tab 2: Content**
- Comment moderation requirements
- File upload size limits (1-500 MB)
- Allowed image types (JPG, PNG, WebP, GIF)

**Tab 3: Performance**
- Analytics tracking enable/disable
- Cache system controls
- Cache duration configuration (1-1440 minutes)
- Real-time performance optimization

**Tab 4: System**
- SMTP/Email configuration status
- System information display
- Database, framework, storage, auth details
- Danger zone with cache clearing option

**Features:**
- Tab-based organization
- Toggle switches for features
- Persistent storage with localStorage
- Professional UI with clear labeling

---

### 4. **Portfolio Management** (`/src/app/admin/portfolio/page.tsx`)
- ✅ IT services and project showcase management
- Visual grid-based portfolio display
- Create, edit, delete portfolio items
- Publish/unpublish control

**Features:**
- Portfolio statistics (Total, Published, Drafts, With Pricing)
- Search by title or description
- Filter by status (All, Published, Drafts)
- WYSIWYG form with image preview
- Slug auto-generation from title
- Optional pricing information
- Live URL management
- Direct links to published items
- Card-based grid layout with thumbnails

**Form Fields:**
- Title (required)
- Slug (auto-generated)
- Description (required, textarea)
- Image URL with inline preview
- Live URL
- Optional pricing

---

### 5. **Posts & Articles** (`/src/app/admin/posts/page.tsx`)
- ✅ Comprehensive blog post and article management
- Trilingual support (Spanish, English, Mayan)
- Advanced filtering and sorting
- View tracking and analytics

**Features:**
- Post statistics dashboard
- Search by title
- Multi-filter system:
  - Status: All, Published, Drafts
  - Language: All, Spanish, English, Mayan
- Advanced sorting:
  - Newest first
  - Oldest first
  - Most viewed
  - Alphabetical (A-Z)
- Inline publish/unpublish toggle
- View counter display
- Direct links to published posts
- Category tracking
- Read time estimation
- Quick edit access

**Display Fields:**
- Title and slug
- Publication status
- Language badge
- Category
- View count
- Publication date
- Action buttons (Edit, View, Delete)

---

## API Endpoints

### User Management API
**Base:** `/api/admin/users`

- `GET /api/admin/users` - Fetch all users
- `POST /api/admin/users` - Create new user
- `PUT /api/admin/users` - Update user
- `DELETE /api/admin/users?id=<id>` - Delete user

### Portfolio Management API
**Base:** `/api/admin/portfolio`

- `GET /api/admin/portfolio` - Fetch all portfolio items
- `POST /api/admin/portfolio` - Create item
- `PUT /api/admin/portfolio` - Update item
- `DELETE /api/admin/portfolio?id=<id>` - Delete item

### Posts Management API
**Base:** `/api/admin/posts`

- `GET /api/admin/posts` - Fetch all posts
- `POST /api/admin/posts` - Create post
- `DELETE /api/admin/posts?id=<id>` - Delete post
- `GET /api/admin/posts/[id]` - Get single post
- `PATCH /api/admin/posts/[id]` - Update post fields

---

## Design System

### Theme & Colors
- **Primary Accent:** `#d4a853` (Gold)
- **Success:** `#25d366` (Green) - WhatsApp theme
- **Warning:** `#f59e0b` (Amber)
- **Error:** `#ef4444` (Red)
- **Secondary Colors:** Blue, Purple, Cyan

### Components
- Dark theme with `var(--bg-primary)`, `var(--bg-secondary)`, `var(--bg-tertiary)`
- Cards with subtle borders and hover effects
- Glass morphism effects
- Smooth transitions (0.2s easing)
- Consistent padding and spacing

### Typography
- Headers: 800-900 font-weight
- Labels: 600 font-weight
- Body: 400 font-weight
- Section labels: Uppercase, letter-spacing

### Interactive Elements
- Hover effects with subtle scale (1.04)
- Color-coded badges and status indicators
- Smooth button transitions
- Responsive grid layouts
- Accessible form controls

---

## Features Included

✅ **CRUD Operations** - Create, read, update, delete for all content types  
✅ **Search & Filter** - Powerful filtering across multiple dimensions  
✅ **Sorting** - Multiple sort options (date, views, title, etc.)  
✅ **Status Management** - Publish/unpublish controls  
✅ **Statistics** - Real-time metrics and dashboards  
✅ **Forms** - Comprehensive editing with validation  
✅ **Notifications** - Toast notifications for user feedback  
✅ **Responsive Design** - Works on desktop and tablet  
✅ **Accessibility** - Semantic HTML and ARIA labels  
✅ **Error Handling** - Graceful error management  
✅ **Loading States** - Clear loading indicators  
✅ **Data Persistence** - localStorage for settings  

---

## Navigation

The admin sidebar includes all pages in the management section:

```
Dashboard      (⊞)
Posts          (📰)
Portfolio      (🎨)
Users          (👥)
WhatsApp       (💬)
Settings       (⚙️)
```

---

## Usage

### Accessing Admin
1. Navigate to `/admin`
2. Must be authenticated via Firebase
3. Admin guard protects all pages

### Creating Content
- Use "New Post" / "New Item" buttons
- Fill required fields (marked with *)
- Submit to save

### Managing Content
- Edit via "Edit" button in table/cards
- Toggle publish status with status badge
- Delete with confirmation dialog
- Search and filter to find content

### Settings
- Switch between tabs
- Toggle features on/off
- Save settings (persisted locally)
- System information visible in System tab

---

## Database Schema

### User Model
```typescript
- id: string (primary)
- email: string (unique)
- name: string | null
- role: string (default: "USER")
- avatarUrl: string | null
- createdAt: DateTime
- updatedAt: DateTime
```

### PortfolioItem Model
```typescript
- id: string (primary)
- title: string
- slug: string (unique)
- description: string
- imageUrl: string | null
- liveUrl: string | null
- price: float | null
- published: boolean (default: false)
- createdAt: DateTime
- updatedAt: DateTime
```

### Post Model
```typescript
- id: string (primary)
- title: string
- slug: string (unique)
- content: string
- imageUrl: string | null
- state: string (default: "Yucatán")
- category: string (default: "Local")
- published: boolean (default: false)
- views: int (default: 0)
- language: string (default: "es")
- readTimeMinutes: int (default: 3)
- createdAt: DateTime
- updatedAt: DateTime
```

---

## File Structure

```
src/
├── app/
│   ├── admin/
│   │   ├── layout.tsx              (Updated with Users link)
│   │   ├── page.tsx                (Dashboard)
│   │   ├── users/
│   │   │   └── page.tsx            ✨ NEW
│   │   ├── posts/
│   │   │   └── page.tsx            ✨ NEW (Client)
│   │   ├── portfolio/
│   │   │   └── page.tsx            ✨ NEW (Client)
│   │   ├── settings/
│   │   │   └── page.tsx            ✨ NEW (Client)
│   │   └── ...existing pages
│   └── api/
│       └── admin/
│           ├── users/
│           │   └── route.ts        ✨ NEW
│           ├── portfolio/
│           │   └── route.ts        ✨ NEW
│           └── posts/
│               ├── route.ts        ✨ NEW
│               └── [id]/
│                   └── route.ts    ✨ NEW
```

---

## Production Readiness

✅ **TypeScript** - Fully typed  
✅ **Error Handling** - Try/catch and error responses  
✅ **Performance** - Optimized queries with Prisma  
✅ **Security** - Firebase auth protection via AdminGuard  
✅ **Validation** - Required field checking  
✅ **Testing** - All pages tested and working  
✅ **SEO** - Proper meta tags and semantic markup  
✅ **Accessibility** - WCAG compliant components  

---

## Future Enhancements

- [ ] Bulk operations (delete multiple items)
- [ ] Advanced search with regex
- [ ] Export functionality (CSV/PDF)
- [ ] Scheduled publishing
- [ ] User activity logs
- [ ] Content versioning
- [ ] Media library
- [ ] Automated backups
- [ ] Performance monitoring dashboard

---

## Support

All pages are fully functional and production-ready. They integrate seamlessly with:
- Supabase PostgreSQL database
- Firebase authentication
- Next.js 16 App Router
- Prisma ORM

For questions or issues, refer to the project architecture in `/AGENTS.md` and `/steering/project-context.md`.

---

**Status:** ✅ Complete & Production Ready  
**Created:** June 2026  
**Framework:** Next.js 16, React 19, TypeScript  
**Database:** Prisma + PostgreSQL
