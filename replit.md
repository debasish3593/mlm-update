# MLM Management System

## Overview

This is a full-stack MLM (Multi-Level Marketing) management system built with React and Express.js. The application manages a hierarchical network of clients organized in a binary tree structure, where each client can have up to two downline positions (left and right). The system supports different package tiers (Silver, Gold, Diamond) and provides both admin and client interfaces for managing the network.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### January 2025 - Comprehensive Client Creation System

- Enhanced client creation workflow with payment integration
- New admin pages: Add Client, Payment Processing, Manage Users
- Responsive admin sidebar with collapsible navigation
- Binary tree position assignment with automatic fallback logic
- Form validation with Zod schemas for all client data fields
- Payment confirmation workflow with QR code interface
- Real-time client directory with search and filtering capabilities

## System Architecture

### Frontend Architecture

The frontend is built with **React 18** and **TypeScript**, using a modern component-based architecture:

- **UI Framework**: Radix UI components with shadcn/ui for consistent design system
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Form Handling**: React Hook Form with Zod validation
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized production builds

The component structure follows a clear separation of concerns:
- `/components/ui/` - Reusable UI components (buttons, forms, cards, etc.)
- `/components/` - Business logic components (binary tree visualization, package badges, admin sidebar)
- `/pages/` - Route-specific page components (add-client, payment, manage-users)
- `/lib/` - Utility functions and shared logic
- `/hooks/` - Custom React hooks

### Backend Architecture

The backend is built with **Express.js** and **TypeScript** using a RESTful API design:

- **Runtime**: Node.js with ESM modules
- **API Framework**: Express.js with middleware for logging, error handling, and session management
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: Session-based authentication with role-based access control (admin/client)
- **Password Security**: bcrypt for password hashing
- **Data Validation**: Zod schemas shared between frontend and backend

The backend follows a modular structure:
- `/server/routes.ts` - API route definitions and handlers
- `/server/storage.ts` - Data access layer with abstract interface
- `/server/index.ts` - Application setup and middleware configuration
- `/shared/schema.ts` - Shared TypeScript types and Zod validation schemas

### Data Storage Architecture

The system uses a **PostgreSQL** database with the following key design decisions:

- **Binary Tree Structure**: Users table includes `parentId` and `position` fields to maintain hierarchical relationships
- **Role-Based Access**: Users have roles ('admin' or 'client') for authorization
- **Package Tiers**: Clients are assigned to Silver, Gold, or Diamond packages
- **Type Safety**: Drizzle ORM provides compile-time type checking for database operations

The storage layer implements an abstract interface (`IStorage`) allowing for different implementations:
- Production: PostgreSQL with Drizzle ORM
- Development: In-memory storage for testing

### Authentication & Authorization

The application implements session-based authentication:

- **Session Management**: Express sessions with PostgreSQL session store
- **Role-Based Access Control**: Middleware functions (`requireAuth`, `requireAdmin`) protect routes
- **Client-Side Auth**: React Query handles authentication state with automatic token refresh
- **Password Security**: bcrypt with salt rounds for secure password storage

### Key Design Patterns

**Hierarchical Data Management**: The binary tree structure is central to the MLM model, with each client having at most two direct downline positions. This is enforced at both database and application levels.

**Type Safety**: Shared TypeScript types and Zod schemas ensure consistency between frontend and backend, reducing runtime errors and improving developer experience.

**Separation of Concerns**: Clear boundaries between data access (storage layer), business logic (route handlers), and presentation (React components).

**Progressive Enhancement**: The UI gracefully handles loading states and errors, with proper fallbacks for network issues.

## External Dependencies

### Database & ORM
- **Neon Database** (@neondatabase/serverless) - Serverless PostgreSQL database
- **Drizzle ORM** - Type-safe database toolkit with migrations
- **connect-pg-simple** - PostgreSQL session store for Express

### UI Components & Styling
- **Radix UI** - Headless UI components for accessibility and customization
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library
- **class-variance-authority** - Utility for handling component variants

### Form Management & Validation
- **React Hook Form** - Forms with minimal re-renders
- **Zod** - TypeScript-first schema validation
- **@hookform/resolvers** - Zod integration for React Hook Form

### Development Tools
- **Vite** - Build tool and development server
- **TypeScript** - Type safety and development experience
- **ESBuild** - Fast JavaScript/TypeScript bundler for production
- **PostCSS** - CSS processing with Tailwind

### Authentication & Security
- **bcrypt** - Password hashing
- **express-session** - Session middleware for Express

### State Management
- **TanStack Query** - Server state management and caching
- **Wouter** - Lightweight routing for React