# Eventopia - Event Management & Ticket Booking System

A full-stack MERN application for managing events and booking tickets with QR code-based digital tickets.

## Features

- **User Authentication**: Register and login with JWT-based authentication
- **Event Browsing**: View all upcoming events with search and category filters
- **Ticket Booking**: Book tickets for events with real-time seat availability
- **QR Code Tickets**: Generate unique QR codes for each booking
- **Booking Management**: View, manage, and cancel bookings
- **Admin Panel**: Create and manage events (admin users only)
- **Transaction Safety**: MongoDB transactions ensure no overbooking

## Tech Stack

### Backend
- **Node.js** & **Express**: RESTful API server
- **MongoDB** & **Mongoose**: Database and ODM
- **JWT**: Authentication
- **bcryptjs**: Password hashing
- **qrcode**: QR code generation

### Frontend
- **React**: UI library
- **Vite**: Build tool and dev server
- **React Router**: Client-side routing
- **Axios**: HTTP client

## Project Structure

```
Eventopia/
├── backend/
│   ├── models/           # Mongoose models (User, Event, Booking)
│   ├── routes/           # API routes (auth, events, bookings, qrcode)
│   ├── middleware/       # Authentication middleware
│   ├── server.js         # Express server entry point
│   └── package.json      # Backend dependencies
│
└── frontend/
    ├── src/
    │   ├── components/   # React components
    │   ├── pages/        # Page components (Home, EventDetail, etc.)
    │   ├── context/      # Auth context
    │   ├── services/     # API service layer
    │   └── App.jsx       # Main app component
    └── package.json      # Frontend dependencies
```

## Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB** (local or Atlas cloud instance)
- **npm** or **yarn**

## Installation & Setup

### 1. Clone the repository

```bash
cd c:\Eventopia
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/event_booking
JWT_SECRET=your_secure_jwt_secret_key
NODE_ENV=development
```

### 3. Setup Frontend

```bash
cd ../frontend
npm install
```

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

## Running the Application

### 1. Start MongoDB

Make sure MongoDB is running locally or update the `MONGODB_URI` in backend `.env` to point to your MongoDB instance.

```bash
# If using local MongoDB
mongod
```

### 2. Start Backend Server

```bash
cd backend
npm run dev
```

Backend will run on `http://localhost:5000`

### 3. Start Frontend Dev Server

```bash
cd frontend
npm run dev
```

Frontend will run on `http://localhost:3000`

### 4. Access the Application

Open your browser and navigate to `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Events
- `GET /api/events` - Get all events (public)
- `GET /api/events/:id` - Get single event (public)
- `POST /api/events` - Create event (admin only)
- `PUT /api/events/:id` - Update event (admin only)
- `DELETE /api/events/:id` - Delete event (admin only)

### Bookings
- `POST /api/bookings` - Create booking (authenticated)
- `GET /api/bookings/my` - Get user's bookings (authenticated)
- `GET /api/bookings/:id` - Get single booking (authenticated)
- `PATCH /api/bookings/:id/cancel` - Cancel booking (authenticated)

### QR Code
- `GET /api/qrcode/:bookingId` - Generate QR code for booking
- `POST /api/qrcode/verify` - Verify QR code for check-in

## Creating an Admin User

To create events, you need an admin user. Register a new user and manually update the role in MongoDB:

```bash
mongosh
use event_booking
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

Or register with role in the API directly by modifying the register payload temporarily.

## Testing

### Backend Tests

```bash
cd backend
npm test
```

## Building for Production

### Backend

```bash
cd backend
npm start
```

### Frontend

```bash
cd frontend
npm run build
npm run preview
```

## License

MIT
