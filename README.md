
# VaquaH Cooling Service

A full-stack MERN (MongoDB, Express, React, Node.js) application for an AC service and product company.

## Features

- User authentication (login/signup)
- Product catalog with details
- Shopping cart functionality
- Service appointment scheduling
- Order management
- User dashboard
- Contract management
- Payment gateway integration (demo)

## Tech Stack

- **Frontend:**
  - React with TypeScript
  - React Router for navigation
  - React Hook Form for form handling
  - Tailwind CSS for styling
  - Shadcn UI component library
  - TanStack Query for data fetching

- **Backend:**
  - Node.js with Express
  - MongoDB for database
  - Mongoose for object modeling
  - JWT for authentication
  - bcrypt for password hashing

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```
4. Start the backend server:
   ```
   node server/server.js
   ```
5. In a separate terminal, start the frontend:
   ```
   npm run dev
   ```
6. Visit `http://localhost:8080` in your browser

## Project Structure

- `/server`: Backend Express.js server
  - `/config`: Database configuration
  - `/controllers`: Route controllers
  - `/middleware`: Custom middleware
  - `/models`: Mongoose data models
  - `/routes`: API routes
  - `/utils`: Utility functions
- `/src`: Frontend React application
  - `/components`: UI components
  - `/context`: React context providers
  - `/hooks`: Custom React hooks
  - `/pages`: Page components
  - `/services`: API service methods

## API Endpoints

- **Authentication:**
  - `POST /api/users/login`: User login
  - `POST /api/users`: User registration
  - `GET /api/users/profile`: Get user profile
  - `PUT /api/users/profile`: Update user profile

- **Products:**
  - `GET /api/products`: Get all products
  - `GET /api/products/:id`: Get a product by ID
  - `POST /api/products`: Create a product (admin)

- **Orders:**
  - `POST /api/orders`: Create a new order
  - `GET /api/orders/:id`: Get an order by ID
  - `PUT /api/orders/:id/pay`: Update order to paid

- **Appointments:**
  - `POST /api/appointments`: Create a new appointment
  - `GET /api/appointments/myappointments`: Get user's appointments
  - `GET /api/appointments/:id`: Get an appointment by ID
  - `PUT /api/appointments/:id/status`: Update appointment status (admin)
