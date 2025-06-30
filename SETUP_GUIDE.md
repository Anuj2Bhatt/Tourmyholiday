# TourMyHoliday - Setup Guide for Testing

## Project Overview
TourMyHoliday is a comprehensive tourism management system with:
- **Backend**: Node.js/Express with MySQL database (150+ files, 50+ tables, 950+ queries)
- **Frontend**: React with modern UI components (200+ files, 80+ components)
- **Features**: Complete tourism management, booking system, admin panel, and more

## Prerequisites
- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- Git

## Quick Setup Instructions

### 1. Clone the Repository
```bash
git clone <repository-url>
cd tourmyholiday
```

### 2. Database Setup
1. Create a MySQL database named `tourmyholiday`
2. Import the database schema (ask developer for SQL dump)
3. Update database credentials in `backend/.env` file

### 3. Backend Setup
```bash
cd backend
npm install
npm start
```
The backend will run on `http://localhost:5000`

### 4. Frontend Setup
```bash
cd frontend
npm install
npm start
```
The frontend will run on `http://localhost:3000`

## Environment Configuration

### Backend Environment Variables
Create `backend/.env` file with:
```
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=tourmyholiday
DB_PORT=3306
JWT_SECRET=your_secret_key
PORT=5000
NODE_ENV=development
```

### Frontend Environment Variables
Create `frontend/.env` file with:
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_BACKEND_URL=http://localhost:5000
```

## Key Features to Test

### Admin Panel
- **URL**: `http://localhost:3000/admin`
- **Features**: Complete CRUD operations for all tourism data
- **Sections**: States, Districts, Villages, Hotels, Packages, Articles, etc.

### User Features
- **Homepage**: `http://localhost:3000`
- **Search**: Destination search and filtering
- **Booking**: Hotel and package booking system
- **Gallery**: Image galleries for destinations

### API Endpoints
- **Base URL**: `http://localhost:5000/api`
- **Documentation**: Available at `http://localhost:5000/api-docs`

## Database Tables (50+ tables)
- States, Districts, Villages
- Hotels, Rooms, Bookings
- Tour Packages, Seasons
- Articles, Gallery, Media
- User management
- And many more...

## Common Issues & Solutions

### Port Already in Use
```bash
# Kill process on port 5000
npx kill-port 5000
# Kill process on port 3000
npx kill-port 3000
```

### Database Connection Issues
- Verify MySQL is running
- Check database credentials in `.env`
- Ensure database `tourmyholiday` exists

### Module Not Found Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Testing Checklist

### Backend Testing
- [ ] Server starts without errors
- [ ] Database connection successful
- [ ] All API endpoints respond
- [ ] File upload functionality works
- [ ] Authentication system works

### Frontend Testing
- [ ] React app loads without errors
- [ ] All pages render correctly
- [ ] API calls work properly
- [ ] Admin panel accessible
- [ ] Image uploads work

### Integration Testing
- [ ] Frontend can communicate with backend
- [ ] Database operations work through API
- [ ] File uploads work end-to-end
- [ ] Search functionality works

## Project Structure
```
tourmyholiday/
├── backend/          # Node.js/Express server
│   ├── controllers/  # API controllers
│   ├── models/       # Database models
│   ├── routes/       # API routes
│   ├── middleware/   # Custom middleware
│   └── uploads/      # File uploads
├── frontend/         # React application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   └── utils/       # Utility functions
│   └── public/          # Static assets
└── README.md           # Project documentation
```

## Support
If you encounter any issues during testing, please:
1. Check the console logs for error messages
2. Verify all environment variables are set correctly
3. Ensure database is properly configured
4. Contact the development team for assistance

## Notes
- This is a production-ready application with comprehensive features
- All sensitive data is properly secured
- The application follows best practices for security and performance
- Environment files are excluded from Git for security 