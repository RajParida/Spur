# Spur Frontend Setup Guide

## Overview
Next.js + React + Tailwind CSS frontend for the Spur social app.

## Prerequisites
- Node.js 18+
- npm or yarn
- Backend API running (http://localhost:8080/api)

## Local Development Setup

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Environment Variables
Copy `.env.local.example` to `.env.local` and fill in values:
```bash
cp .env.local.example .env.local
```

**Required Environment Variables:**
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key (optional)
```

### 3. Run Development Server
```bash
npm run dev
```

Visit: http://localhost:3000

### 4. Build for Production
```bash
npm run build
npm start
```

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Home page
│   ├── components/
│   │   ├── Layout/             # Layout components
│   │   ├── Dashboard/          # Status dashboard
│   │   ├── Feed/               # Friend feed
│   │   ├── Chat/               # Chat components
│   │   ├── Events/             # Events (Claim a Seat)
│   │   └── Common/             # Shared components
│   ├── features/               # Feature modules
│   ├── hooks/                  # Custom React hooks
│   ├── services/               # API & Supabase clients
│   ├── types/                  # TypeScript types
│   ├── styles/                 # Global styles
│   └── utils/                  # Helper utilities
├── public/                     # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

## Key Technologies

### UI & Styling
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library (import from lucide-react)
- **React Hot Toast**: Toast notifications

### State Management
- **Zustand**: Lightweight state management (optional)
- **React Hooks**: useState, useEffect, useContext

### API & Real-time
- **Supabase SDK**: Database, Auth, Realtime WebSockets
- **Axios**: HTTP client

### Forms & Validation
- **React Hook Form**: Form handling
- **Zod/Yup**: Schema validation

## Development Workflow

### Component Creation
1. Create component in appropriate directory
2. Export from index.ts (if creating barrel exports)
3. Import in parent component
4. Add TypeScript types

Example:
```typescript
// src/components/Dashboard/StatusButton.tsx
import { FC } from 'react';

interface StatusButtonProps {
  label: string;
  onClick: () => void;
}

export const StatusButton: FC<StatusButtonProps> = ({ label, onClick }) => {
  return <button onClick={onClick}>{label}</button>;
};
```

### Custom Hooks
```typescript
// src/hooks/useStatus.ts
import { useEffect, useState } from 'react';

export function useStatus() {
  const [status, setStatus] = useState(null);
  
  useEffect(() => {
    // Fetch logic
  }, []);
  
  return { status };
}
```

### API Integration
```typescript
// src/services/statusService.ts
export async function createStatus(data) {
  return apiClient.post('/statuses', data);
}

// In component
const status = await statusService.createStatus(data);
```

## Styling Guidelines

### Tailwind Classes
- Mobile-first design (320px min width)
- Dark mode by default
- Neon accent colors: `neon-green`, `neon-cyan`, `neon-pink`
- Use custom theme colors from `tailwind.config.ts`

### Example
```jsx
<div className="p-4 bg-bg-secondary rounded-lg text-neon-cyan hover:shadow-neon-glow">
  Content
</div>
```

## Performance Optimization

### Code Splitting
- Dynamic imports for routes
- Lazy load heavy components

### Image Optimization
- Use Next.js `Image` component
- Configure remote image domains in `next.config.ts`

### Caching
- Implement React Query or SWR for data caching
- Use browser localStorage for client-side cache

## Deployment

### Vercel (Recommended for Next.js)
```bash
npm i -g vercel
vercel login
vercel
```

### AWS S3 + CloudFront
```bash
# Build static export
npm run build
npm run export  # If configured

# Upload to S3
aws s3 sync out/ s3://spur-frontend/
```

### Docker
```bash
docker build -t spur-frontend .
docker run -p 3000:3000 spur-frontend
```

## Environment Configuration

### Development
- API: http://localhost:8080/api
- Supabase: Development project
- Google OAuth: Development app

### Production
- API: https://api.spur.app/api
- Supabase: Production project
- Google OAuth: Production app
- CDN: CloudFront

## Troubleshooting

### Port 3000 Already in Use
```bash
lsof -ti:3000 | xargs kill -9
```

### Supabase Connection Issues
- Check `.env.local` values
- Verify network connectivity
- Check browser console for errors

### Build Issues
```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

### Hot Reload Not Working
- Restart development server
- Check for syntax errors
- Verify `next.config.ts` configuration

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Mobile browsers:
- iOS Safari 14+
- Chrome Mobile 90+

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Supabase Docs](https://supabase.com/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
