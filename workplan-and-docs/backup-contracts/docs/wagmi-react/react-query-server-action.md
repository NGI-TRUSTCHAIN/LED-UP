# Using React Query with Next.js Server Actions: A Comprehensive Guide

## Introduction

This guide explains how to effectively combine React Query (TanStack Query) with Next.js Server Actions to create optimized, type-safe, and seamless data fetching experiences. By leveraging these two powerful tools together, you can build applications with excellent user experiences that maintain a clear separation between server and client responsibilities.

## Table of Contents

1. [Understanding the Fundamentals](#understanding-the-fundamentals)
   - [What are Server Actions?](#what-are-server-actions)
   - [What is React Query?](#what-is-react-query)
   - [Why Combine Them?](#why-combine-them)
2. [Setting Up Your Environment](#setting-up-your-environment)
   - [Installation](#installation)
   - [Basic Configuration](#basic-configuration)
3. [Data Fetching with Server Actions and React Query](#data-fetching-with-server-actions-and-react-query)
   - [Approach 1: Server-First Data Fetching](#approach-1-server-first-data-fetching)
   - [Approach 2: Using Server Actions for Query Functions](#approach-2-using-server-actions-for-query-functions)
4. [Mutations with Server Actions](#mutations-with-server-actions)
   - [Creating Server Actions for Mutations](#creating-server-actions-for-mutations)
   - [Using useMutation with Server Actions](#using-usemutation-with-server-actions)
5. [Advanced Patterns](#advanced-patterns)
   - [Optimistic Updates](#optimistic-updates)
   - [Error Handling](#error-handling)
   - [Type Safety](#type-safety)
   - [Nested Data Dependencies](#nested-data-dependencies)
6. [Performance Optimization](#performance-optimization)
   - [Caching Strategies](#caching-strategies)
   - [Prefetching Data](#prefetching-data)
   - [Request Deduplication](#request-deduplication)
7. [Best Practices](#best-practices)
   - [Separation of Concerns](#separation-of-concerns)
   - [Organizing Server Actions](#organizing-server-actions)
   - [When to Use Server Components vs. Client Components](#when-to-use-server-components-vs-client-components)
8. [Troubleshooting](#troubleshooting)
   - [Common Issues](#common-issues)
   - [Debugging Tips](#debugging-tips)
9. [Real-World Examples](#real-world-examples)
   - [Simple CRUD Application](#simple-crud-application)
   - [Infinite Loading](#infinite-loading)
   - [Form Handling](#form-handling)

## Understanding the Fundamentals

### What are Server Actions?

Server Actions are a feature in Next.js that allow you to define and execute asynchronous functions on the server. They can be called directly from both Server and Client Components, without needing to create API routes.

```tsx
// Define a Server Action
'use server';

export async function fetchUserData(userId) {
  // Server-side code that runs securely on the server
  const user = await db.users.findUnique({ where: { id: userId } });
  return user;
}
```

### What is React Query?

React Query (TanStack Query) is a powerful data-fetching and state management library for React applications. It provides hooks for fetching, caching, synchronizing, and updating server state in your React applications.

```tsx
'use client';

import { useQuery } from '@tanstack/react-query';

// Using React Query hook for data fetching
function UserProfile({ userId }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUserData(userId),
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>Hello, {data.name}!</div>;
}
```

### Why Combine Them?

Combining Server Actions with React Query offers several benefits:

1. **Type Safety**: End-to-end type safety from your server to client
2. **Caching**: React Query's powerful caching avoids redundant requests
3. **Loading and Error States**: Built-in management of loading, error, and success states
4. **Optimistic Updates**: Seamless UX with immediate visual feedback
5. **Server-Side Security**: Keep sensitive data and operations server-side
6. **Reduced API Boilerplate**: No need to create API routes for data operations

## Setting Up Your Environment

### Installation

First, ensure you have the necessary dependencies installed:

```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
# or
yarn add @tanstack/react-query @tanstack/react-query-devtools
```

### Basic Configuration

Set up React Query in your application by creating a provider component:

```tsx
// app/providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function Providers({ children }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // With SSR, we usually want to set some default staleTime
            // to avoid refetching immediately on the client
            staleTime: 60 * 1000,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

Then use this provider in your layout:

```tsx
// app/layout.tsx
import { Providers } from './providers';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

## Data Fetching with Server Actions and React Query

### Approach 1: Server-First Data Fetching

In this approach, you fetch data on the server using Server Components and pass it as initial data to React Query.

```tsx
// app/users/page.tsx (Server Component)
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { UsersDisplay } from './users-display';
import { fetchUsers } from './actions';

export default async function UsersPage() {
  // Create a new QueryClient for each request
  const queryClient = new QueryClient();

  // Prefetch the data on the server
  await queryClient.prefetchQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UsersDisplay />
    </HydrationBoundary>
  );
}
```

```tsx
// app/users/actions.ts
'use server';

export async function fetchUsers() {
  // Fetch users from your database
  const users = await db.users.findMany();
  return users;
}
```

```tsx
// app/users/users-display.tsx (Client Component)
'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchUsers } from './actions';

export function UsersDisplay() {
  const {
    data: users,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    // No need to refetch on mount as we already have the data from the server
    refetchOnMount: false,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Users</h1>
      <ul>
        {users.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
      <button onClick={() => refetch()}>Refresh</button>
    </div>
  );
}
```

### Approach 2: Using Server Actions for Query Functions

In this approach, you create Server Actions that serve as query functions for React Query:

```tsx
// app/posts/actions.ts
'use server';

export async function fetchPosts(category?: string) {
  // Server-side data fetching with validation and error handling
  try {
    const posts = await db.posts.findMany({
      where: category ? { category } : undefined,
      orderBy: { createdAt: 'desc' },
    });
    return posts;
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw new Error('Failed to fetch posts');
  }
}
```

```tsx
// app/posts/posts-list.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchPosts } from './actions';

export function PostsList({ category }: { category?: string }) {
  const {
    data: posts,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['posts', category],
    queryFn: () => fetchPosts(category),
  });

  if (isLoading) return <div>Loading posts...</div>;
  if (error) return <div>Error loading posts: {error.message}</div>;

  return (
    <div>
      <h2>{category ? `${category} Posts` : 'All Posts'}</h2>
      <ul>
        {posts.map((post) => (
          <li key={post.id}>
            <h3>{post.title}</h3>
            <p>{post.excerpt}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## Mutations with Server Actions

Server Actions are perfect for handling mutations, and they work seamlessly with React Query's mutation hooks.

### Creating Server Actions for Mutations

```tsx
// app/posts/actions.ts
'use server';

export async function createPost(formData: FormData) {
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;

  if (!title || !content) {
    throw new Error('Title and content are required');
  }

  try {
    const newPost = await db.posts.create({
      data: { title, content },
    });
    return newPost;
  } catch (error) {
    console.error('Error creating post:', error);
    throw new Error('Failed to create post');
  }
}

export async function deletePost(postId: string) {
  try {
    await db.posts.delete({ where: { id: postId } });
    return { success: true };
  } catch (error) {
    console.error('Error deleting post:', error);
    throw new Error('Failed to delete post');
  }
}
```

### Using useMutation with Server Actions

```tsx
// app/posts/post-form.tsx
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPost } from './actions';
import { useState } from 'react';

export function PostForm() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const mutation = useMutation({
    mutationFn: (formData: FormData) => createPost(formData),
    onSuccess: () => {
      // Invalidate queries to refetch the posts list
      queryClient.invalidateQueries({ queryKey: ['posts'] });

      // Reset form
      setTitle('');
      setContent('');
    },
    onError: (error) => {
      // Handle the error, e.g., show a toast message
      console.error('Failed to create post:', error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    mutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Create New Post</h2>
      <div>
        <label htmlFor="title">Title:</label>
        <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div>
        <label htmlFor="content">Content:</label>
        <textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} required />
      </div>
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Creating...' : 'Create Post'}
      </button>
      {mutation.isError && <p className="error">Error: {mutation.error.message}</p>}
    </form>
  );
}
```

## Advanced Patterns

### Optimistic Updates

Optimistic updates improve user experience by showing changes immediately before they're confirmed by the server:

```tsx
// app/todos/todo-list.tsx
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toggleTodoComplete } from './actions';

export function TodoList() {
  const queryClient = useQueryClient();
  const { data: todos } = useQuery({
    queryKey: ['todos'],
    queryFn: fetchTodos,
  });

  const mutation = useMutation({
    mutationFn: toggleTodoComplete,
    // Optimistically update the UI before the server responds
    onMutate: async (toggledTodo) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ['todos'] });

      // Snapshot the previous value
      const previousTodos = queryClient.getQueryData(['todos']);

      // Optimistically update the UI
      queryClient.setQueryData(['todos'], (old) =>
        old.map((todo) => (todo.id === toggledTodo.id ? { ...todo, completed: !todo.completed } : todo))
      );

      // Return the snapshot so we can roll back if something goes wrong
      return { previousTodos };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, roll back to the previous state
      queryClient.setQueryData(['todos'], context.previousTodos);
    },
    onSettled: () => {
      // Regardless of success/failure, refetch to ensure server state
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });

  const handleToggle = (todo) => {
    mutation.mutate({ id: todo.id, completed: !todo.completed });
  };

  return (
    <ul>
      {todos?.map((todo) => (
        <li key={todo.id}>
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => handleToggle(todo)}
            disabled={mutation.isPending}
          />
          <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>{todo.title}</span>
        </li>
      ))}
    </ul>
  );
}
```

### Error Handling

Implement robust error handling for both server and client:

```tsx
// app/actions.ts
'use server';

import { z } from 'zod';

// Define validation schema
const UserInputSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
});

export async function updateUserProfile(formData: FormData) {
  // Extract and validate data
  try {
    const data = {
      email: formData.get('email') as string,
      name: formData.get('name') as string,
    };

    // Validate the input
    const validatedData = UserInputSchema.parse(data);

    // Update in database
    const updatedUser = await db.user.update({
      where: { email: validatedData.email },
      data: { name: validatedData.name },
    });

    return { success: true, user: updatedUser };
  } catch (error) {
    // Check if it's a validation error
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation failed',
        details: error.errors,
      };
    }

    // Database or other errors
    console.error('Error updating user:', error);
    return {
      success: false,
      error: 'Failed to update profile',
    };
  }
}
```

Client-side handling:

```tsx
'use client';

import { useMutation } from '@tanstack/react-query';
import { updateUserProfile } from './actions';
import { useState } from 'react';

export function ProfileForm() {
  const [serverErrors, setServerErrors] = useState(null);

  const mutation = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (result) => {
      if (result.success) {
        // Handle success case
        toast.success('Profile updated successfully!');
      } else {
        // Handle server-side validation errors or other failures
        setServerErrors(result.details || [{ message: result.error }]);
      }
    },
    onError: (error) => {
      // Handle network/unexpected errors
      console.error('Unexpected error:', error);
      toast.error('An unexpected error occurred');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setServerErrors(null);
    mutation.mutate(new FormData(e.target));
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      {serverErrors && (
        <div className="error-messages">
          {serverErrors.map((err, i) => (
            <p key={i} className="error">
              {err.message}
            </p>
          ))}
        </div>
      )}
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Updating...' : 'Update Profile'}
      </button>
    </form>
  );
}
```

## Performance Optimization

### Caching Strategies

Configure React Query's caching based on your data requirements:

```tsx
// app/providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function Providers({ children }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data that changes infrequently
            staleTime: 5 * 60 * 1000, // 5 minutes
            // Keep cached data for 10 minutes
            gcTime: 10 * 60 * 1000,
            // Retry 3 times if a query fails
            retry: 3,
            // Don't refetch on window focus for certain queries
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
```

For individual queries with specific caching needs:

```tsx
// Long-living static data
const { data: countries } = useQuery({
  queryKey: ['countries'],
  queryFn: fetchCountries,
  // Keep this data fresh for 24 hours
  staleTime: 24 * 60 * 60 * 1000,
  // Don't refetch on mount if we have data
  refetchOnMount: false,
});

// Real-time data that needs frequent updates
const { data: stockPrices } = useQuery({
  queryKey: ['stocks', symbol],
  queryFn: () => fetchStockPrice(symbol),
  // Data becomes stale immediately
  staleTime: 0,
  // Refetch every 30 seconds
  refetchInterval: 30 * 1000,
});
```

### Prefetching Data

Prefetch data for anticipated user actions:

```tsx
// app/posts/[id]/page.tsx
import { prefetchQuery } from './prefetch';
import PostDetail from './post-detail';

export default async function PostPage({ params }) {
  // Prefetch related posts that the user might view next
  await prefetchQuery(['related-posts', params.id], () => fetchRelatedPosts(params.id));

  return <PostDetail id={params.id} />;
}
```

```tsx
// app/posts/post-list.tsx
'use client';

import { useQueryClient } from '@tanstack/react-query';
import { fetchPostDetail } from './actions';

export function PostList({ posts }) {
  const queryClient = useQueryClient();

  // Prefetch post details when user hovers over a post
  const prefetchPost = (postId) => {
    queryClient.prefetchQuery({
      queryKey: ['post', postId],
      queryFn: () => fetchPostDetail(postId),
    });
  };

  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id} onMouseEnter={() => prefetchPost(post.id)}>
          <Link href={`/posts/${post.id}`}>{post.title}</Link>
        </li>
      ))}
    </ul>
  );
}
```

## Best Practices

### Separation of Concerns

Follow these best practices to maintain clean code:

1. **Server Actions should handle data logic, not UI:**

```tsx
// Good practice
'use server';
export async function fetchPosts() {
  const response = await db.posts.findMany();
  if (!response) throw new Error('Failed to fetch posts');
  return response;
}

// Bad practice - Don't mix UI and data fetching
('use server');
export async function fetchPosts() {
  const posts = await db.posts.findMany();
  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

2. **Organize actions by feature:**

```
app/
  actions/
    users.ts      // User-related actions
    posts.ts      // Post-related actions
    comments.ts   // Comment-related actions
```

3. **Keep Server Actions focused and reusable:**

```tsx
// Focused Server Action
'use server';
export async function updateUserEmail(userId: string, email: string) {
  // Validation and error handling
  return await db.user.update({
    where: { id: userId },
    data: { email },
  });
}

// Instead of a large, multipurpose action
('use server');
export async function updateUser(userId: string, data: any) {
  // Too generic and hard to maintain
}
```

## Real-World Examples

### Simple CRUD Application

Here's a complete example of a To-Do list application using Server Actions with React Query:

```tsx
// app/todos/actions.ts
'use server';

import { db } from '@/lib/db';
import { z } from 'zod';

const TodoSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  completed: z.boolean().optional(),
});

export async function fetchTodos() {
  try {
    return await db.todo.findMany({
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Error fetching todos:', error);
    throw new Error('Failed to fetch todos');
  }
}

export async function createTodo(formData: FormData) {
  const title = formData.get('title') as string;

  try {
    const validated = TodoSchema.parse({ title });
    return await db.todo.create({
      data: { title: validated.title, completed: false },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Validation failed', details: error.errors };
    }
    throw new Error('Failed to create todo');
  }
}

export async function toggleTodo(id: string, completed: boolean) {
  try {
    return await db.todo.update({
      where: { id },
      data: { completed },
    });
  } catch (error) {
    throw new Error(`Failed to toggle todo ${id}`);
  }
}

export async function deleteTodo(id: string) {
  try {
    await db.todo.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    throw new Error(`Failed to delete todo ${id}`);
  }
}
```

```tsx
// app/todos/page.tsx (Server Component)
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { TodoList } from './todo-list';
import { TodoForm } from './todo-form';
import { fetchTodos } from './actions';

export default async function TodosPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['todos'],
    queryFn: fetchTodos,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="todos-container">
        <h1>Todo List</h1>
        <TodoForm />
        <TodoList />
      </div>
    </HydrationBoundary>
  );
}
```

```tsx
// app/todos/todo-list.tsx (Client Component)
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchTodos, toggleTodo, deleteTodo } from './actions';

export function TodoList() {
  const queryClient = useQueryClient();

  const {
    data: todos,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['todos'],
    queryFn: fetchTodos,
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, completed }) => toggleTodo(id, completed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteTodo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });

  if (isLoading) return <div>Loading todos...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!todos.length) return <div>No todos yet. Add one above!</div>;

  return (
    <ul className="todo-list">
      {todos.map((todo) => (
        <li key={todo.id} className={todo.completed ? 'completed' : ''}>
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() =>
              toggleMutation.mutate({
                id: todo.id,
                completed: !todo.completed,
              })
            }
            disabled={toggleMutation.isPending}
          />
          <span>{todo.title}</span>
          <button
            onClick={() => deleteMutation.mutate(todo.id)}
            disabled={deleteMutation.isPending}
            aria-label="Delete todo"
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}
```

```tsx
// app/todos/todo-form.tsx (Client Component)
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTodo } from './actions';
import { useState } from 'react';

export function TodoForm() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [errors, setErrors] = useState([]);

  const mutation = useMutation({
    mutationFn: (formData: FormData) => createTodo(formData),
    onSuccess: (result) => {
      if (result.success === false) {
        setErrors(result.details || [{ message: result.error }]);
        return;
      }

      // Clear form and errors on success
      setTitle('');
      setErrors([]);
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    const formData = new FormData();
    formData.append('title', title);
    mutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="todo-form">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Add a new todo..."
        disabled={mutation.isPending}
      />
      <button type="submit" disabled={mutation.isPending || !title.trim()}>
        {mutation.isPending ? 'Adding...' : 'Add Todo'}
      </button>

      {errors.length > 0 && (
        <div className="error-messages">
          {errors.map((err, i) => (
            <p key={i} className="error">
              {err.message}
            </p>
          ))}
        </div>
      )}
    </form>
  );
}
```

## Conclusion

Combining React Query with Server Actions creates a powerful data fetching and mutation solution for Next.js applications. By following the patterns and best practices outlined in this guide, you can build applications that are:

- Fast and responsive with optimized data fetching
- Type-safe from server to client
- Well-structured with clear separation of concerns
- Maintainable and scalable as your application grows

The integration of these tools allows you to focus on building features rather than managing data fetching logic, state management, or API routes. As both technologies continue to evolve, they'll likely become an even more central part of the React and Next.js ecosystem.

## Additional Resources

- [TanStack Query Documentation](https://tanstack.com/query/latest/docs/react/overview)
- [Next.js Server Actions Documentation](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
