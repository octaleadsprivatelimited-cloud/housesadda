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
  - SQLite (default) / MySQL (optional)
  - JWT Authentication
  - bcryptjs

## Getting Started

### Prerequisites

- Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- SQLite (included with Node.js) - No additional setup needed!
- MySQL Server (optional, for production use)

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

3. **Database Setup (SQLite - Default)**

   SQLite database is automatically created on first run. No additional setup needed!
   
   The database file will be created at: `database/housesadda.db`
   
   **For MySQL (Optional):**
   - Create a MySQL database:
   ```sql
   CREATE DATABASE housesadda;
   ```
   - Run the schema file:
   ```sh
   mysql -u root -p housesadda < database/schema.sql
   ```
   - Use `npm run dev:server:mysql` instead of `npm run dev:server`

4. **Configure Environment Variables**

   Create a `.env` file in the root directory:
   ```env
   # For SQLite (default - no DB config needed)
   NODE_ENV=development
   JWT_SECRET=your-secret-key-change-in-production
   PORT=3001
   VITE_API_URL=http://localhost:3001/api
   
   # For MySQL (optional)
   # DB_HOST=localhost
   # DB_USER=root
   # DB_PASSWORD=your_mysql_password
   # DB_NAME=housesadda
   ```

5. **Start the development servers**

   - Start both frontend and backend (SQLite):
   ```sh
   npm run dev:all
   ```

   - Or start them separately:
   ```sh
   # Terminal 1 - Frontend
   npm run dev

   # Terminal 2 - Backend (SQLite - default)
   npm run dev:server
   
   # Or Backend (MySQL - if configured)
   npm run dev:server:mysql
   ```

### Default Admin Credentials

- **Username:** `admin`
- **Password:** `admin123`

⚠️ **Important:** Change the default admin password after first login in production!

## Available Scripts

- `npm run dev` - Start the frontend development server
- `npm run dev:server` - Start the backend API server (SQLite)
- `npm run dev:server:mysql` - Start the backend API server (MySQL)
- `npm run dev:all` - Start both frontend and backend concurrently (SQLite)
- `npm run build` - Build for production
- `npm run preview` - Preview the production build
- `npm run lint` - Run ESLint
- `npm run setup:admin` - Create/update admin user (MySQL only)
- `npm run test:db` - Test database connection

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

The database (SQLite or MySQL) includes the following tables:
- `admin_users` - Admin user accounts
- `properties` - Property listings (with transaction_type: Sale, Rent, Lease, PG)
- `property_types` - Property type definitions
- `locations` - Location/area data
- `property_images` - Property image URLs

**SQLite (Default):**
- Database file: `database/housesadda.db`
- Automatically created on first run
- No configuration needed

**MySQL (Optional):**
- Requires MySQL server setup
- Use `database/schema.sql` for schema

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

5. For SQLite: Ensure database directory is writable
6. For MySQL: Ensure MySQL is properly configured and secured

## Security Notes

- Change the default JWT_SECRET in production
- Use strong passwords for MySQL
- Implement rate limiting for API endpoints
- Use HTTPS in production
- Regularly update dependencies

## License

Private - All rights reserved
