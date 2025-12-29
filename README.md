# Digital Prescription Management System (DPMS)

A full-stack web application for managing digital prescriptions, built with React (Vite) frontend and Node.js/Express backend.

## 🚀 Features

- **User Management**: Admin can manage doctors, patients, and pharmacists
- **Prescription Management**: Doctors can create and manage prescriptions
- **Medication Inventory**: Track medications with expiry dates
- **QR Code Integration**: Generate and scan QR codes for prescriptions
- **Pharmacist Dashboard**: Verify prescriptions and calculate billing
- **Role-based Access**: Different dashboards for Admin, Doctor, Patient, and Pharmacist

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd "Digital Prescription Management System"
```

### 2. Install dependencies

Install all dependencies (root, backend, and frontend):

```bash
npm run install:all
```

Or install manually:

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../dpms
npm install
```

### 3. Environment Setup

#### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```env
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/dpms
# Or use MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dpms

# JWT Secret (Change this to a strong random string in production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Frontend URL for CORS
FRONTEND_URL=http://localhost:5173
```

#### Frontend Environment Variables (Optional)

Create a `.env` file in the `dpms` directory (optional for development, as Vite proxy is configured):

```env
# API Base URL - Use proxy in development, full URL in production
VITE_API_BASE_URL=/api
```

For production, set:
```env
VITE_API_BASE_URL=http://your-backend-domain.com/api
```

## 🚀 Running the Application

### Development Mode (Recommended)

Run both frontend and backend together:

```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:5000`
- Frontend development server on `http://localhost:5173`

### Run Separately

#### Backend Only

```bash
npm run dev:backend
# or
cd backend
npm start
```

#### Frontend Only

```bash
npm run dev:frontend
# or
cd dpms
npm run dev
```

## 📁 Project Structure

```
Digital Prescription Management System/
├── backend/                 # Node.js/Express backend
│   ├── config/             # Database and JWT configuration
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Authentication and error handling
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── utils/             # Utility functions
│   ├── app.js             # Express app configuration
│   └── server.js          # Server entry point
│
├── dpms/                  # React frontend (Vite)
│   ├── src/
│   │   ├── admin/        # Admin dashboard components
│   │   ├── doctor/       # Doctor dashboard components
│   │   ├── pages/        # Patient and Pharmacist pages
│   │   ├── components/   # Shared components
│   │   ├── config/       # API configuration
│   │   └── App.jsx       # Main app component
│   └── vite.config.js    # Vite configuration
│
└── package.json          # Root package.json for running both
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Users
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/role/:role` - Get users by role
- `DELETE /api/users/:id` - Delete user (Admin only)

### Medications
- `GET /api/medications` - Get all medications
- `POST /api/medications` - Create medication (Admin only)

### Prescriptions
- `GET /api/prescriptions` - Get all prescriptions
- `GET /api/prescriptions/my-doctor` - Get doctor's prescriptions
- `POST /api/prescriptions` - Create prescription

### Pharmacist
- `GET /api/pharmacist/pending` - Get pending prescriptions
- `PUT /api/pharmacist/enter-amount` - Update prescription amount

### QR Codes
- `GET /api/qr/:prescriptionId` - Generate QR code for prescription

## 🔐 Authentication

The application uses JWT (JSON Web Tokens) for authentication. After login, the token is stored in localStorage and automatically included in API requests via axios interceptors.

## 🎨 Frontend Features

- **Centralized API Configuration**: All API calls use a centralized axios instance (`src/config/api.js`)
- **Automatic Token Management**: Tokens are automatically added to requests
- **Error Handling**: Global error handling for 401 (unauthorized) redirects
- **Vite Proxy**: Development proxy configured for seamless API calls

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running locally or check your MongoDB Atlas connection string
- Verify `MONGO_URI` in backend `.env` file

### CORS Errors
- Ensure `FRONTEND_URL` in backend `.env` matches your frontend URL
- Check that both servers are running on the correct ports

### Port Already in Use
- Change `PORT` in backend `.env` or frontend port in `vite.config.js`
- Update `FRONTEND_URL` accordingly

## 📝 Notes

- The frontend uses Vite's proxy in development mode, so API calls use relative paths (`/api/*`)
- In production, set `VITE_API_BASE_URL` to your backend URL
- Make sure to change `JWT_SECRET` to a strong random string in production

## 📄 License

ISC

