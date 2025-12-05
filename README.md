# RLine Frontend 🎨

> Modern, responsive microblogging platform built with Next.js 14 and TypeScript

**Live Demo**: [rline.ryanneeki.xyz](https://rline.ryanneeki.xyz)  
**Backend Repository**: [rline-backend](https://github.com/ryanneekidev/rline-backend)

[![TypeScript](https://img.shields.io/badge/TypeScript-92.5%25-blue)](https://github.com/ryanneekidev/new-rline-frontend)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC)](https://tailwindcss.com/)

## 📖 Overview

RLine is a full-stack social media application featuring real-time interactions, optimistic UI updates, and production-ready authentication patterns. This repository contains the frontend client built with Next.js App Router and TypeScript.

### Notable Features

- **Automatic Token Refresh**: Seamless authentication experience with zero user disruption
- **Optimistic Updates**: Instant UI feedback despite 500ms+ API latency
- **Production Patterns**: Real-world solutions to cross-origin auth, state management, and error handling
- **Modern Stack**: Next.js 14 App Router, TypeScript, shadcn/ui, Tailwind CSS

## ✨ Features

### 🔐 Authentication & Security
- JWT-based authentication with automatic token refresh
- Secure session management (httpOnly cookies + localStorage)
- Protected routes with middleware
- Seamless re-authentication on token expiry

### 📱 Social Features
- **Posts**: Create and share text content
- **Comments**: Threaded discussions on posts
- **Likes**: React to content with optimistic updates
- **Follow System**: Connect with other users
- **User Profiles**: View stats (posts, followers, following, likes)

### ⚡ Performance & UX
- **Optimistic Updates**: UI updates instantly before server confirmation
- **Smart Caching**: Efficient data fetching with proper invalidation
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Loading States**: Skeleton screens and meaningful feedback
- **Error Recovery**: Automatic retry logic and fallback states

## 🛠 Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | [Next.js 14](https://nextjs.org/) (App Router) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) |
| **State Management** | React Context API |
| **Authentication** | JWT + httpOnly Cookies |
| **HTTP Client** | Native Fetch API with custom wrapper |
| **Deployment** | [Vercel](https://vercel.com/) |

## 📁 Project Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth-related pages (login, register)
│   ├── create/            # Post creation page
│   ├── post/              # Individual post view
│   ├── profile/           # User profile pages
│   │   └── [username]/    # Dynamic profile routes
│   └── page.tsx           # Home feed
│
├── components/
│   └── ui/                # Reusable UI components
│       ├── button.tsx     # shadcn/ui button
│       ├── card.tsx       # Card container
│       ├── follow-button.tsx  # Follow/unfollow button
│       ├── navigation.tsx # Global navigation bar
│       ├── post-card.tsx  # Post display component
│       └── posts-feed.tsx # Main feed component
│
├── contexts/
│   └── auth-context.tsx   # Authentication state & logic
│
├── lib/
│   ├── api.ts             # API endpoint functions
│   ├── api-config.ts      # Environment-based API URL
│   └── utils.ts           # Utility functions
│
└── utils/
    └── authFetch.ts       # Authenticated request wrapper
```

## 🔑 Key Technical Implementations

### 1. Automatic Token Refresh

The `makeAuthenticatedRequest` wrapper automatically handles expired tokens:
```typescript
// utils/authFetch.ts
export const makeAuthenticatedRequest = async (url, options, auth) => {
  let response = await fetch(url, { ...options, credentials: 'include' })
  
  // If 401, refresh token and retry
  if (response.status === 401) {
    const refreshResponse = await fetch('/refresh', { credentials: 'include' })
    if (refreshResponse.ok) {
      const { token } = await refreshResponse.json()
      localStorage.setItem('rline_token', token)
      // Retry original request with new token
      response = await fetch(url, { ...options, Authorization: `Bearer ${token}` })
    }
  }
  return response
}
```

**Flow**:
```
User clicks "Like" → Token expired (401) 
  → Auto-refresh token 
  → Retry like request 
  → Success ✅
```

### 2. Optimistic UI Updates

Provides instant feedback for user actions:
```typescript
const handleLikePost = async (postId) => {
  // 1. Update UI immediately
  setPost(prev => ({ ...prev, likes: prev.likes + 1 }))
  auth.togglePostLike(postId, true)
  
  try {
    // 2. Send to server
    await likePost(postId, auth.user.id)
  } catch (error) {
    // 3. Revert only if it fails
    setPost(prev => ({ ...prev, likes: prev.likes - 1 }))
    auth.togglePostLike(postId, false)
  }
}
```

**Why?** With distributed infrastructure (Frontend: Asia, Backend: Europe, DB: US East), API calls take 500ms+. Users see instant feedback instead of waiting.

### 3. Environment-Based Configuration

Seamless switching between development and production:
```typescript
// lib/api-config.ts
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.rline.ryanneeki.xyz'

// .env.local (development)
NEXT_PUBLIC_API_URL=http://localhost:4000

// .env.production (Vercel)
NEXT_PUBLIC_API_URL=https://api.rline.ryanneeki.xyz
```

### 4. Follow System with Real-Time Updates

Follow button updates counts optimistically:
```typescript
<FollowButton
  userId={user.id}
  initialIsFollowing={isFollowing}
  onFollowChange={(delta) => setFollowersCount(prev => prev + delta)}
/>
```

When you follow someone:
- Button changes to "Following" instantly
- Follower count increments immediately
- Server request happens in background
- If it fails, everything reverts

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend API running (see [rline-backend](https://github.com/ryanneekidev/rline-backend))

### Installation
```bash
# Clone the repository
git clone https://github.com/ryanneekidev/new-rline-frontend.git
cd new-rline-frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
# Edit .env.local with your API URL

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables
```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:4000  # Your backend API URL
```

## 📦 Build & Deploy
```bash
# Production build
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

### Deployment (Vercel)

1. Push to GitHub
2. Import repository in Vercel
3. Add environment variable: `NEXT_PUBLIC_API_URL=https://api.rline.ryanneeki.xyz`
4. Deploy ✅

## 🎨 Design Philosophy

### Minimalist Aesthetic
- Clean, uncluttered interface
- Soft color palette (pinks, blues, subtle gradients)
- Generous whitespace
- Smooth transitions and hover effects

### User Experience Principles
1. **Zero Interruption**: Token refresh happens silently
2. **Instant Feedback**: Optimistic updates for all interactions
3. **Progressive Enhancement**: Works without JavaScript (SSR)
4. **Responsive**: Mobile-first design
5. **Accessible**: Semantic HTML, ARIA labels, keyboard navigation

## 🔧 Development Decisions

### Why Next.js App Router?
- **Server Components**: Faster initial page loads
- **Built-in Routing**: File-based routing with dynamic routes
- **API Routes**: Could serve as BFF (Backend for Frontend) if needed
- **SEO Friendly**: Server-side rendering out of the box

### Why Context API over Redux?
- **Simpler**: Less boilerplate for authentication state
- **Sufficient**: App doesn't need complex state management
- **Type-Safe**: Full TypeScript support
- **Performance**: Only auth state triggers re-renders

### Why Optimistic Updates?
**Challenge**: 500ms API latency (Frontend: Asia, Backend: Europe, DB: US East)

**Solution**: Update UI immediately, revert only on error
- **User Perception**: App feels instant
- **Real Performance**: No change
- **Compromise**: Acceptable for social features (likes, follows)

### Why Manual Token Refresh?
- **Control**: Custom retry logic for any authenticated request
- **Flexibility**: Can add logging, analytics, rate limiting
- **Learning**: Understanding auth flows deeply
- **No Deps**: Avoids library lock-in

## 📊 Performance Metrics

| Metric | Value | Notes |
|--------|-------|-------|
| First Contentful Paint | ~1.2s | Vercel CDN + Next.js SSR |
| Time to Interactive | ~1.8s | Hydration + initial JS |
| API Response Time | 500ms | Cross-region latency |
| *Perceived* Like Time | 0ms | Optimistic updates |

## 🐛 Challenges Overcome

### 1. Cookie Not Being Set
**Problem**: Browser refused to save httpOnly refresh token  
**Root Cause**: JWT payload too large (4KB+) with user's posts, comments, likes arrays  
**Solution**: Store only essential fields (id, username, email) in JWT

### 2. CORS with Credentials
**Problem**: Browser blocked API requests with `credentials: 'include'`  
**Solution**: Explicit CORS configuration, domain attribute on cookies (`.ryanneeki.xyz`)

### 3. Stale Follow Status
**Problem**: Follow button showed old state after page refresh  
**Solution**: Separate useEffect to fetch follow status after post loads

### 4. Double Token Verification
**Problem**: Backend verified token in middleware AND route handler  
**Solution**: Trust middleware, attach decoded user to `req.user`

## 🔮 Future Enhancements

- [ ] Real-time notifications (Server-Sent Events or WebSockets)
- [ ] Direct messaging system
- [ ] Image uploads for posts (Cloudinary/S3)
- [ ] Infinite scroll with pagination
- [ ] Dark mode toggle
- [ ] Feed filtering (Following only, Popular, Recent)
- [ ] Search functionality
- [ ] Progressive Web App (PWA)

## 📝 License

MIT License - feel free to use this project for learning!

## 👨‍💻 Author

**Rayan Neeki** - Aspiring Software Engineer, 19 years old

- Portfolio: [ryanneeki.xyz](https://ryanneeki.xyz)
- GitHub: [@ryanneekidev](https://github.com/ryanneekidev)

---

⭐ **Star this repo** if you found it helpful! Questions? Open an issue or reach out.
