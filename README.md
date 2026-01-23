# HousesAdda

A modern property listing platform for finding properties in India.

## Project Overview

HousesAdda is a React-based web application built with Vite, TypeScript, and Tailwind CSS. It provides a platform for users to browse and search for properties including Buy, Rent, New Projects, Plots, and Commercial spaces.

## Technologies Used

This project is built with:

- **Frontend:**
  - Vite
  - TypeScript
  - React
  - shadcn-ui
  - Tailwind CSS
  - React Router

- **Backend:**
  - Node.js
  - Express
  - Supabase (PostgreSQL cloud database)
  - JWT Authentication
  - bcryptjs

## Getting Started

### Prerequisites

- Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- Supabase account - [Sign up at supabase.com](https://supabase.com) (free tier available)

### Installation

1. **Clone the repository**
```sh
git clone <YOUR_GIT_URL>
cd housesadda
```

2. **Install dependencies**
```sh
npm install
```

3. **Database Setup (Supabase - Required)**

   This project uses Supabase as the database. Admin users are automatically created via the database schema.
   
   **Setup Steps:**
   - See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed setup instructions
   - Create a Supabase project at [supabase.com](https://supabase.com)
   - Run the schema from `database/schema-supabase.sql` in Supabase SQL Editor
   - The schema automatically creates the default admin user (admin/admin123)
   - Configure `.env` with your Supabase credentials

4. **Configure Environment Variables**

   Create a `.env` file in the root directory (copy from `.env.example`):
   ```env
   NODE_ENV=development
   JWT_SECRET=your-secret-key-change-in-production
   PORT=3001
   VITE_API_URL=http://localhost:3001/api
   
   # Supabase Configuration (Frontend)
   VITE_SUPABASE_PROJECT_ID=your-project-id-here
   VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key-here
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   
   # Supabase Configuration (Backend)
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   SUPABASE_ANON_KEY=your-anon-key-here
   ```

5. **Start the development servers**

   - Start both frontend and backend:
   ```sh
   npm run dev:all
   ```

   - Or start them separately:
   ```sh
   # Terminal 1 - Frontend
   npm run dev

   # Terminal 2 - Backend (Supabase)
   npm run dev:server
   ```

### Default Admin Credentials

- **Username:** `admin`
- **Password:** `admin123`

⚠️ **Important:** Change the default admin password after first login in production!

## Available Scripts

- `npm run dev` - Start the frontend development server
- `npm run dev:server` - Start the backend API server (Supabase)
- `npm run dev:all` - Start both frontend and backend concurrently
- `npm run build` - Build for production
- `npm run preview` - Preview the production build
- `npm run lint` - Run ESLint

**Note:** Admin users are created automatically via the Supabase database schema. No manual setup needed.

## Project Structure

```
housesadda/
├── server/              # Backend API
│   ├── routes/         # API routes
│   ├── middleware/     # Auth middleware
│   └── index.js        # Server entry point
├── database/           # Database files
│   ├── schema.sql      # Database schema
│   └── seed.sql        # Seed data
├── src/
│   ├── components/     # React components
│   ├── pages/          # Page components
│   ├── lib/            # Utilities & API client
│   └── ...
└── public/             # Static assets
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `GET /api/auth/verify` - Verify token

### Properties
- `GET /api/properties` - Get all properties
- `GET /api/properties/:id` - Get single property
- `POST /api/properties` - Create property (protected)
- `PUT /api/properties/:id` - Update property (protected)
- `DELETE /api/properties/:id` - Delete property (protected)
- `PATCH /api/properties/:id/featured` - Toggle featured (protected)
- `PATCH /api/properties/:id/active` - Toggle active (protected)

### Locations
- `GET /api/locations` - Get all locations
- `POST /api/locations` - Create location (protected)
- `PUT /api/locations/:id` - Update location (protected)
- `DELETE /api/locations/:id` - Delete location (protected)

### Property Types
- `GET /api/types` - Get all property types
- `POST /api/types` - Create type (protected)
- `PUT /api/types/:id` - Update type (protected)
- `DELETE /api/types/:id` - Delete type (protected)

## Features

- Property browsing and search
- Filter by type (Buy, Rent, New Projects, Plots, Commercial)
- Browse by city and locality
- Property details page
- Admin dashboard for property management
- MySQL database integration
- JWT-based authentication
- Responsive design for mobile and desktop

## Database Schema

The database (Supabase PostgreSQL) includes the following tables:
- `admin_users` - Admin user accounts (created automatically via schema)
- `properties` - Property listings (with transaction_type: Sale, Rent, Lease, PG)
- `property_types` - Property type definitions
- `locations` - Location/area data
- `property_images` - Property image URLs

**Supabase (Cloud PostgreSQL):**
- Cloud-hosted PostgreSQL database
- Free tier available
- Use `database/schema-supabase.sql` for schema
- Admin users are created automatically when you run the schema
- See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed setup

## Production Deployment

See `DEPLOYMENT.md` for detailed deployment instructions.

Quick steps:
1. Build the frontend:
   ```sh
   npm run build
   ```

2. Set up environment variables on your production server

3. Configure your web server (nginx, Apache) to serve the frontend

4. Run the backend server using PM2:
   ```sh
   pm2 start ecosystem.config.js
   ```

5. For Supabase: Ensure environment variables are set correctly in your deployment platform

## Security Notes

- Change the default JWT_SECRET in production
- Use strong passwords for MySQL
- Implement rate limiting for API endpoints
- Use HTTPS in production
- Regularly update dependencies

## License

Private - All rights reserved
