# Page Structure & Routing

## Overview

This document describes the LEDUP frontend application's page structure, routing system, layout hierarchy, and navigation flow. It covers the Next.js app directory structure and conventions used throughout the application.

## Next.js App Directory Structure

The LEDUP application uses Next.js 13+ App Router, which uses a file-system based router where folders define routes.

```
app/
├── (patient)/             # Patient route group
│   ├── layout.tsx         # Patient layout
│   ├── dashboard/         # Patient dashboard pages
│   ├── settings/          # Patient settings pages
│   ├── shared-with-me/    # Shared data pages
│   ├── verification/      # Verification pages
│   ├── access-control/    # Access control pages
│   └── patient-records/   # Patient records pages
├── (provider)/            # Provider route group (empty/planned)
├── auth/                  # Authentication routes
│   ├── signin/            # Sign in page
│   └── refresh/           # Token refresh handling
├── api/                   # API routes
├── layout.tsx             # Root layout
├── page.tsx               # Home page
└── globals.css            # Global styles
```

## Routing Conventions

### Page Definitions

In Next.js App Router, a page is defined by exporting a default React component from a `page.tsx` file:

```tsx
// app/page.tsx
export default function HomePage() {
  return <main>Home Page Content</main>;
}
```

### Route Groups

The application uses route groups to organize routes without affecting the URL structure:

- `(common)`: Shared functionality across user types with common layouts
- `(patient)`: Patient-specific pages and features
- `(provider)`: Provider-specific pages (planned/in development)

Route groups are denoted by parentheses and allow for shared layouts without affecting the URL path.

### Dynamic Routes

Dynamic routes are used for pages that depend on dynamic data:

```
app/(patient)/patient-records/[recordId]/page.tsx  # Matches /patient-records/123, etc.
```

## Layout Hierarchy

The application uses a hierarchical layout system where layouts wrap pages and nested layouts:

### Root Layout

```tsx
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Web3Provider>
            <AuthProvider>
              <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
            </AuthProvider>
          </Web3Provider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### Nested Layouts

#### Patient Layout

The patient layout (`app/(patient)/layout.tsx`) provides consistent structure for all patient-related pages, including the sidebar navigation:

```tsx
// app/(patient)/layout.tsx
export default function PatientLayout({ children }) {
  return (
    <div className="md:ml-[68px] relative min-h-screen">
      <Sidebar />
      <main>{children}</main>
    </div>
  );
}
```

#### Common Layout

The common layout (`app/(common)/layout.tsx`) provides a structure for proof-related pages:

```tsx
// app/(common)/layout.tsx
export default function PatientLayout({ children }) {
  return <PatientRecordsLayout>{children}</PatientRecordsLayout>;
}
```

## Navigation Components

### Sidebar

The application uses a responsive sidebar for main navigation:

- Desktop: Fixed vertical sidebar with icon-only view and tooltips
- Mobile: Collapsible drawer menu with full text labels

Main navigation items include:

- Home
- Dashboard
- Health Records
- Compensation
- Access Control
- Verification
- Settings

### Dashboard Header

Dashboard pages include a header component that provides:

- Mobile menu toggle
- Search functionality
- User profile access
- Notifications

## Route Protection & Authentication

The application implements route protection using Next.js middleware:

```tsx
// middleware.ts
export async function middleware(request: NextRequest) {
  // Check for public routes, API routes, server action routes, or static assets
  if (isPublicRoute || isApiRoute || isServerActionRoute || isStaticRoute) {
    return NextResponse.next();
  }

  // Check for auth token in cookies
  const authToken = request.cookies.get('auth_token')?.value;
  const refreshToken = request.cookies.get('refresh_token')?.value;

  // If no token is found, redirect to login
  if (!authToken) {
    if (refreshToken) {
      // Redirect to token refresh page
      const refreshUrl = new URL('/auth/refresh', request.url);
      refreshUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(refreshUrl);
    }

    // No tokens available, redirect to login
    const loginUrl = new URL('/auth/signin', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}
```

### Authentication Flow

1. Unauthenticated users are redirected to `/auth/signin`
2. After successful authentication, users are redirected to their intended destination
3. If an auth token expires but a refresh token exists, users are redirected to `/auth/refresh`
4. The refresh page attempts to get a new token and then redirects to the original destination

## Responsive Behavior

The application is responsive and adapts to different screen sizes:

### Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### Mobile Navigation

- Collapsible drawer menu with hamburger toggle
- Full-width pages with stacked layout
- Touch-optimized interactive elements

### Desktop Navigation

- Persistent vertical sidebar with icon-only view
- Wider content area with multi-column layouts where appropriate
- Hover interactions for navigation elements

## Role-Based Routing

The application provides different dashboard views based on user roles:

```tsx
// Example from dashboard page
if (userRoles.includes('ADMIN')) {
  return <AdminDashboard />;
}

return (
  <div className="space-y-8">
    {userRoles.includes('PROVIDER') && <ProviderDashboard />}
    {userRoles.includes('PRODUCER') && <ProducerDashboard />}
    {(userRoles.includes('CONSUMER') || userRoles.length === 0) && <ConsumerDashboard />}
  </div>
);
```

---

**Last Updated:** May 2024  
**Contact:** LED-UP Development Team
