# 🏖️ TourMyHoliday - Complete Tourism Management Platform

A comprehensive full-stack tourism management system with advanced content management, booking capabilities, and extensive destination information.

## 📊 Project Overview

**TourMyHoliday** is a premium tourism platform designed to manage travel destinations, packages, accommodations, and tourism-related content. Built with modern technologies, it serves both administrative and end-user needs for tourism information and booking services.

### 🎯 Key Features
- **Geographic Data Management**: States, Districts, Subdistricts, Villages
- **Tourism Content**: Attractions, Packages, Hotels, Accommodations
- **Cultural Information**: Cultures, History, Traditions
- **Media Management**: Images, Videos, Web Stories
- **Administrative Dashboard**: Users, Permissions, Content approval
- **Analytics**: Population, Education, Healthcare data
- **Weather Integration**: Real-time weather data for destinations
- **Search & Filtering**: Advanced search capabilities
- **Responsive Design**: Mobile-first approach

## 🛠️ Technology Stack

### Backend
- **Node.js** + **Express.js**
- **MySQL** Database
- **Multer** (file uploads)
- **JWT** Authentication
- **CORS**, **Helmet**, **Rate Limiting**
- **Axios** for external API calls

### Frontend
- **React.js**
- **CSS3** with responsive design
- **Axios** for API calls
- **Context API** for state management

### Development Tools
- **Git** version control
- **npm** package managers
- **Development servers**

## 📁 Project Structure

```
tourmyholiday/
├── backend/                    # Backend Node.js/Express application
│   ├── src/
│   │   ├── routes/            # 60+ API route files
│   │   ├── controllers/       # 20+ controller files
│   │   ├── models/           # 10+ model files
│   │   ├── middleware/       # 5+ middleware files
│   │   └── server.js         # Main server file
│   ├── routes/               # Additional route files
│   ├── controllers/          # Additional controller files
│   ├── models/              # Additional model files
│   ├── migrations/          # 10+ migration files
│   ├── uploads/             # 700+ uploaded files
│   ├── config/              # Configuration files
│   └── db.js                # Database connection
├── frontend/                 # Frontend React application
│   ├── src/
│   │   ├── components/       # 80+ React components
│   │   ├── pages/           # 50+ page components
│   │   ├── services/        # 10+ service files
│   │   ├── styles/          # 40+ CSS files
│   │   └── assets/          # 20+ asset files
│   └── public/              # Public assets
└── README.md                # This file
```

## 📈 Project Scale Metrics

| Metric | Count |
|--------|-------|
| **Total Files** | ~1,000+ |
| **Backend Files** | ~150+ |
| **Frontend Files** | ~200+ |
| **Database Tables** | 50+ |
| **API Endpoints** | 60+ |
| **React Components** | 80+ |
| **CSS Files** | 40+ |
| **Uploaded Files** | 700+ |
| **Database Queries** | 950+ |

## 🗄️ Database Structure

### Core Tables (50+ tables)
1. **territories** - Union territories
2. **districts** - District information
3. **subdistricts** - Subdistrict data
4. **villages** - Village information
5. **states** - State data
6. **hotels** - Hotel accommodations
7. **packages** - Tour packages
8. **attractions** - Tourist attractions
9. **cultures** - Cultural information
10. **wildlife_sanctuaries** - Wildlife data

### Supporting Tables
- **village_population**, **village_education**, **village_health**
- **territory_villages**, **territory_districts**
- **hotel_images**, **hotel_rooms**, **hotel_categories**
- **season_images**, **package_seasons**
- **web_stories**, **articles**, **gallery**
- **team**, **weather**, **search**

## 🔍 Database Queries Analysis

### Query Types Used:
- **SELECT Queries**: ~500+ queries
- **INSERT Queries**: ~200+ queries
- **UPDATE Queries**: ~150+ queries
- **DELETE Queries**: ~50+ queries
- **CREATE TABLE Queries**: ~50+ queries

**Total Database Queries**: **~950+ queries**

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tourmyholiday
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```

3. **Database Setup**
   ```bash
   # Create MySQL database
   CREATE DATABASE tourmyholiday;
   
   # Update database configuration in backend/config/database.js
   ```

4. **Environment Variables**
   ```bash
   # Create .env file in backend directory
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=tourmyholiday
   TOMORROW_API_KEY=your_weather_api_key
   JWT_SECRET=your_jwt_secret
   ```

5. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```

6. **Run the Application**
   ```bash
   # Backend (from backend directory)
   npm start
   # or
   node src/server.js
   
   # Frontend (from frontend directory)
   npm start
   ```

## 📋 API Endpoints

### Core Endpoints (60+ endpoints)
- `GET /api/territories` - Get all territories
- `GET /api/districts` - Get all districts
- `GET /api/subdistricts` - Get all subdistricts
- `GET /api/villages` - Get all villages
- `GET /api/hotels` - Get all hotels
- `GET /api/packages` - Get all tour packages
- `GET /api/attractions` - Get all attractions
- `GET /api/cultures` - Get cultural information
- `GET /api/weather/:subdistrictId` - Get weather data
- `POST /api/upload` - Upload files
- `GET /api/search` - Search functionality

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile

## 🎨 Frontend Features

### Admin Dashboard
- **Content Management**: CRUD operations for all entities
- **Media Management**: Image upload and management
- **User Management**: User roles and permissions
- **Analytics**: Data visualization and reports

### User-Facing Features
- **Destination Pages**: Detailed information about places
- **Search & Filter**: Advanced search with multiple filters
- **Image Galleries**: High-quality image displays
- **Web Stories**: Interactive story format
- **Responsive Design**: Works on all devices

## 🔧 Production Features

### Security
- **JWT Authentication**: Secure user authentication
- **Rate Limiting**: API rate limiting for security
- **CORS**: Cross-origin resource sharing
- **Helmet**: Security headers
- **Input Validation**: Comprehensive input validation

### Performance
- **Database Indexing**: Optimized database queries
- **File Compression**: Image and file compression
- **Caching**: Response caching for better performance
- **CDN Ready**: Static file serving optimization

### Monitoring
- **Console Logging**: Comprehensive logging for debugging
- **Error Handling**: Graceful error handling
- **Health Checks**: API health monitoring
- **File Management**: Automatic file cleanup

## 📱 Content Management Areas

1. **Geographic Data**: States, Districts, Subdistricts, Villages
2. **Tourism Content**: Attractions, Packages, Hotels
3. **Cultural Information**: Cultures, History, Traditions
4. **Media Management**: Images, Videos, Web Stories
5. **Administrative**: Users, Permissions, Content approval
6. **Analytics**: Population, Education, Healthcare data

## 💰 Project Valuation

### Development Cost Estimate
- **Conservative**: $25,000 - $35,000
- **Market Value**: $35,000 - $50,000
- **Premium**: $50,000 - $75,000

### Ongoing Services
- **Monthly Maintenance**: $500 - $1,500/month
- **Feature Additions**: $100 - $200/hour
- **Technical Support**: $75 - $150/hour
- **Content Management**: $300 - $800/month

## 🚀 Deployment

### Backend Deployment
```bash
# Production build
npm run build

# Start production server
npm start
```

### Frontend Deployment
```bash
# Build for production
npm run build

# Deploy to hosting service
# (Netlify, Vercel, AWS, etc.)
```

## 🔄 Version Control

### Git Workflow
```bash
# Feature development
git checkout -b feature/new-feature
git add .
git commit -m "Add new feature"
git push origin feature/new-feature

# Merge to main
git checkout main
git merge feature/new-feature
git push origin main
```

## 📞 Support & Maintenance Call +919520325406

### Regular Maintenance Tasks
- **Database Optimization**: Regular query optimization
- **Security Updates**: Keep dependencies updated
- **Backup Management**: Regular data backups
- **Performance Monitoring**: Monitor application performance

### Support Channels
- **Technical Support**: Available 24/7
- **Documentation**: Comprehensive API documentation
- **Training**: User training sessions available
- **Updates**: Regular feature updates and improvements

## 📄 License

This project is proprietary software. All rights reserved.

## 👥 Team

- **Development**: Anuj Bhatt
- **Design**: Anuj Bhatt
- **Testing**: Anuj Bhatt
- **Support**: No One

## 📈 Future Enhancements

### Planned Features
- **Mobile App**: Native mobile applications
- **AI Integration**: AI-powered recommendations
- **Payment Gateway**: Integrated payment processing
- **Multi-language**: Internationalization support
- **Advanced Analytics**: Business intelligence dashboard

### Scalability Plans
- **Microservices**: Break down into microservices
- **Cloud Migration**: Move to cloud infrastructure
- **CDN Integration**: Global content delivery
- **API Gateway**: Centralized API management

---

**TourMyHoliday** - Your Complete Tourism Management Solution

*Built with ❤️ for the tourism industry* 