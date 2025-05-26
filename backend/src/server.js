require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const app = express();

// Import shared database connection
const pool = require('./db');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory at:', uploadsDir);
}

// Copy default image if it doesn't exist
const defaultImagePath = path.join(uploadsDir, 'default-image.jpg');
if (!fs.existsSync(defaultImagePath)) {
  fs.copyFileSync(
    path.join(__dirname, './assets/default-image.jpg'),
    defaultImagePath
  );
}

// Serve static files from uploads directory
app.use('/uploads', express.static(uploadsDir));

// Add debug logging for routes
app.use((req, res, next) => {
  if (req.url.startsWith('/uploads/')) {
    const requestedFile = req.url.replace('/uploads/', '');
    const filePath = path.join(uploadsDir, requestedFile);
    console.log('Static file request:', {
      url: req.url,
      method: req.method,
      requestedFile,
      uploadsDir,
      filePath,
      exists: fs.existsSync(filePath),
      currentDir: __dirname,
      absolutePath: path.resolve(filePath)
    });
  }
  next();
});

// Import routes
const territoryRoutes = require('./routes/territoryRoutes');
const territoryImageRoutes = require('./routes/territoryImageRoutes');
const territoryHistoryRoutes = require('./routes/territoryHistoryRoutes');
const territoryDistrictRoutes = require('./routes/territoryDistrictRoutes');
const territoryDistrictImagesRoutes = require('./routes/territoryDistrictImages');
const territorySubdistrictsRouter = require('./routes/territorySubdistricts');
const subdistrictDetailRouter = require('./routes/subdistrictDetail');
const subdistrictImagesRouter = require('./routes/subdistrictImages');
const subdistrictVillagesRouter = require('./routes/subdistrictVillages');
const subdistrictDemographicsRouter = require('./routes/subdistrictDemographics');
const subdistrictTravelInfoRouter = require('./routes/subdistrictTravelInfo');
const subdistrictEconomyRouter = require('./routes/subdistrictEconomy');
const subdistrictEducationRouter = require('./routes/subdistrictEducation');
const subdistrictHealthcareRouter = require('./routes/subdistrictHealthcare');
const subdistrictWeatherRouter = require('./routes/subdistrictWeather');
const territoryTravelInfoRoutes = require('./routes/territoryTravelInfo');
const stateEducationInstitutionsRouter = require('./routes/stateEducationInstitutions');
const galleryRouter = require('./routes/gallery');
const authRouter = require('./routes/auth');
const territoryImageRoutesRouter = require('./routes/territoryImageRoutes');
const territoryRoutesRouter = require('./routes/territoryRoutes');
const hotelCategoriesRouter = require('./routes/hotelCategories');
const packagesRouter = require('./routes/packages');
const articlesRouter = require('../routes/articles');
const statesRouter = require('./routes/states');
const districtsRouter = require('./routes/districts');
const webStoriesRouter = require('./routes/web-stories');
const seasonsRouter = require('./routes/seasons');
const seasonImagesRouter = require('./routes/season-images');
const stateImagesRouter = require('./routes/stateImages');
const stateSeasonImagesRouter = require('./routes/stateSeasonImages');
const stateHistoryRoutes = require('./routes/stateHistory');
const teamRouter = require('./routes/team');
const placesRouter = require('../routes/places');
const videoRouter = require('../routes/videos');
const subdistrictsRouter = require('./routes/subdistricts');
const territoryAttractionsRouter = require('../routes/territoryAttractions');
const attractionsRouter = require('../routes/attractions');
const cultureRouter = require('../routes/cultureRoutes');
const travelInfoRouter = require('./routes/subdistrictTravelInfo');
const adventureActivitiesRouter = require('../routes/adventureActivities');
const territorySubdistrictImagesRouter = require('./routes/territorySubdistrictImages');
const weatherRouter = require('./routes/weather');
const villagesRouter = require('./routes/villages');
const territoryVillagesRouter = require('./routes/territoryVillages');
const uploadRouter = require('./routes/upload');
const villageImageRoutes = require('../routes/villageImageRoutes');
const stateVillageImagesRouter = require('./routes/stateVillageImages');
const villagePopulationRoutes = require('../routes/villagePopulationRoutes');
const villageEmploymentRoutes = require('../routes/villageEmploymentRoutes');
const villageEducationRoutes = require('../routes/villageEducationRoutes');
const villageHealthRoutes = require('../routes/villageHealthRoutes');
const hotelsRouter = require('../routes/hotels');
const packageSeasonRoutes = require('../routes/packageSeasonRoutes');
const categoriesRouter = require('../routes/categories');

// Register routes
app.use('/api/territories', territoryRoutes);
app.use('/api/territory-images', territoryImageRoutes);
app.use('/api/territory-history', territoryHistoryRoutes);
app.use('/api/territory-districts', territoryDistrictRoutes);
app.use('/api/territory-district-images', territoryDistrictImagesRoutes);
app.use('/api/territory-subdistricts', territorySubdistrictsRouter);
app.use('/api/subdistrict-detail', subdistrictDetailRouter);
app.use('/api/subdistrict-images', subdistrictImagesRouter);
app.use('/api/subdistrict-villages', subdistrictVillagesRouter);
app.use('/api/subdistrict-demographics', subdistrictDemographicsRouter);
app.use('/api/subdistrict-travel-info', subdistrictTravelInfoRouter);
app.use('/api/subdistrict-economy', subdistrictEconomyRouter);
app.use('/api/subdistrict-education', subdistrictEducationRouter);
app.use('/api/subdistrict-healthcare', subdistrictHealthcareRouter);
app.use('/api/subdistrict-weather', subdistrictWeatherRouter);
app.use('/api/territory-travel-info', territoryTravelInfoRoutes);
app.use('/api/state-education-institutions', stateEducationInstitutionsRouter);
app.use('/api/gallery', galleryRouter);
app.use('/api/auth', authRouter);
app.use('/api/territory-image-routes', territoryImageRoutesRouter);
app.use('/api/territory-routes', territoryRoutesRouter);
app.use('/api/hotel-categories', hotelCategoriesRouter);
app.use('/api/packages', packagesRouter);
app.use('/api/package-seasons', packageSeasonRoutes);
app.use('/api/articles', articlesRouter);
app.use('/api/states', statesRouter);
app.use('/api/districts', districtsRouter);
app.use('/api/web-stories', webStoriesRouter);
app.use('/api/seasons', seasonsRouter);
app.use('/api/season-images', seasonImagesRouter);
app.use('/api/states/images', stateImagesRouter);
app.use('/api/state-season-images', stateSeasonImagesRouter);
app.use('/api/state-history', stateHistoryRoutes);
app.use('/api/team', teamRouter);
app.use('/api/places', placesRouter);
app.use('/api/videos', videoRouter);
app.use('/api/subdistricts', subdistrictsRouter);
app.use('/api/state-season-images', stateSeasonImagesRouter);
app.use('/api/territory-attractions', territoryAttractionsRouter);
app.use('/api/season-images', seasonImagesRouter);
app.use('/api/attractions', attractionsRouter);
app.use('/api/cultures', cultureRouter);
app.use('/api/travel-info', travelInfoRouter);
app.use('/api/adventure-activities', adventureActivitiesRouter);
app.use('/api/territory-subdistrict-images', territorySubdistrictImagesRouter);
app.use('/api/weather', weatherRouter);
app.use('/api/villages', villagesRouter);
app.use('/api/territory-villages', territoryVillagesRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/village-images', villageImageRoutes);
app.use('/api/state-village-images', stateVillageImagesRouter);
app.use('/api/village-population', villagePopulationRoutes);
app.use('/api/village-employment', villageEmploymentRoutes);
app.use('/api/village-education', villageEducationRoutes);
app.use('/api/village-health', villageHealthRoutes);
app.use('/api/hotels', hotelsRouter);
app.use('/api/categories', categoriesRouter); 

// Configure upload paths for weather images
const weatherUploadPath = path.join(__dirname, '../uploads/weather');
if (!fs.existsSync(weatherUploadPath)) {
  fs.mkdirSync(weatherUploadPath, { recursive: true });
}

// Serve weather images statically
app.use('/uploads/weather', express.static(weatherUploadPath));

// Health check endpoint for frontend
app.get('/test', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Function to create tables
async function createTables() {
  try {
    const connection = await pool.getConnection();
    console.log('Database connected successfully');

    // Create territories table if not exists
    await connection.query(`
      CREATE TABLE IF NOT EXISTS territories (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        capital VARCHAR(255) NOT NULL,
        famous_for TEXT,
        preview_image VARCHAR(255) NOT NULL,
        featured_image VARCHAR(255),
        meta_title VARCHAR(60) NOT NULL,
        meta_description VARCHAR(160) NOT NULL,
        meta_keywords TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_title (title),
        INDEX idx_slug (slug)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('Territories table checked/created successfully');

    // Create districts table if not exists
    await connection.query(`
      CREATE TABLE IF NOT EXISTS districts (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        state_name VARCHAR(255) NOT NULL,
        description TEXT,
        featured_image VARCHAR(255),
        banner_image VARCHAR(255),
        meta_title VARCHAR(255),
        meta_description TEXT,
        meta_keywords VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('Districts table checked/created successfully');

    // Create districts_images table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS district_images (
        id INT PRIMARY KEY AUTO_INCREMENT,
        district_id INT NOT NULL,
        image_url VARCHAR(255) NOT NULL,
        alt_text VARCHAR(255),
        caption TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE CASCADE,
        INDEX idx_district (district_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('Districts images table checked/created successfully');

    // Create district_web_stories table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS district_web_stories (
        id INT PRIMARY KEY AUTO_INCREMENT,
        district_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        featured_image VARCHAR(255),
        meta_title VARCHAR(255),
        meta_description TEXT,
        meta_keywords VARCHAR(255),
        schema_json JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE CASCADE,
        INDEX idx_district (district_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('District web stories table checked/created successfully');

    // Create subdistrict_images table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS subdistrict_gallery (
        id INT PRIMARY KEY AUTO_INCREMENT,
        subdistrict_id INT NOT NULL,
        image_url VARCHAR(255) NOT NULL,
        alt_text VARCHAR(255),
        caption TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (subdistrict_id) REFERENCES subdistricts(id)
      )
    `);

    // Create territory_subdistrict_gallery table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS territory_subdistrict_gallery (
        id INT PRIMARY KEY AUTO_INCREMENT,
        territory_subdistrict_id INT NOT NULL,
        image_url VARCHAR(255) NOT NULL,
        alt_text VARCHAR(255),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (territory_subdistrict_id) REFERENCES territory_subdistricts(id)
      )
    `);

    // Create subdistrict_demographics table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS subdistrict_demographics (
        id INT PRIMARY KEY AUTO_INCREMENT,
        subdistrict_id INT NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        meta_title VARCHAR(255),
        meta_description TEXT,
        meta_keywords VARCHAR(255),
        total_population INT,
        male_population INT,
        female_population INT,
        literacy_rate DECIMAL(5,2),
        languages JSON,
        religions JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (subdistrict_id) REFERENCES subdistricts(id)
      )
    `);

    // Create territory_subdistrict_demographics table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS territory_subdistrict_demographics (
        id INT PRIMARY KEY AUTO_INCREMENT,
        territory_subdistrict_id INT NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        meta_title VARCHAR(255),
        meta_description TEXT,
        meta_keywords VARCHAR(255),
        total_population INT,
        male_population INT,
        female_population INT,
        literacy_rate DECIMAL(5,2),
        languages JSON,
        religions JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (territory_subdistrict_id) REFERENCES territory_subdistricts(id)
      )
    `);

    // Create subdistrict_travel_info table with exact structure
    await connection.query(`
      CREATE TABLE IF NOT EXISTS subdistrict_travel_info (
        id INT(11) NOT NULL AUTO_INCREMENT,
        subdistrict_id INT(11) NOT NULL,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL,
        description TEXT,
        featured_image VARCHAR(255),
        meta_title VARCHAR(255),
        meta_description TEXT,
        meta_keywords TEXT,
        best_time_to_visit TEXT,
        how_to_reach TEXT,
        accommodation TEXT,
        local_transport TEXT,
        safety_tips TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY unique_slug (slug)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `);
    console.log('Subdistrict travel info table checked/created successfully');

    // Create territory_subdistrict_travel_info table with same structure
    await connection.query(`
      CREATE TABLE IF NOT EXISTS territory_subdistrict_travel_info (
        id INT(11) NOT NULL AUTO_INCREMENT,
        territory_subdistrict_id INT(11) NOT NULL,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL,
        description TEXT,
        featured_image VARCHAR(255),
        meta_title VARCHAR(255),
        meta_description TEXT,
        meta_keywords TEXT,
        best_time_to_visit TEXT,
        how_to_reach TEXT,
        accommodation TEXT,
        local_transport TEXT,
        safety_tips TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY unique_slug (slug)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `);
    console.log('Territory subdistrict travel info table checked/created successfully');

    // Create subdistrict_economy table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS subdistrict_economy (
        id INT PRIMARY KEY AUTO_INCREMENT,
        subdistrict_id INT NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        meta_title VARCHAR(255),
        meta_description TEXT,
        meta_keywords VARCHAR(255),
        gdp DECIMAL(15,2),
        main_industries JSON,
        employment_rate DECIMAL(5,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (subdistrict_id) REFERENCES subdistricts(id)
      )
    `);

    // Create territory_subdistrict_economy table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS territory_subdistrict_economy (
        id INT PRIMARY KEY AUTO_INCREMENT,
        territory_subdistrict_id INT NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        meta_title VARCHAR(255),
        meta_description TEXT,
        meta_keywords VARCHAR(255),
        main_occupations JSON,
        industries TEXT,
        agriculture TEXT,
        tourism_contribution TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (territory_subdistrict_id) REFERENCES territory_subdistricts(id)
      )
    `);

    // Create subdistrict_education table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS subdistrict_education (
        id INT PRIMARY KEY AUTO_INCREMENT,
        subdistrict_id INT NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        meta_title VARCHAR(255),
        meta_description TEXT,
        meta_keywords VARCHAR(255),
        schools_count INT,
        colleges_count INT,
        universities_count INT,
        literacy_rate DECIMAL(5,2),
        notable_institutions TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (subdistrict_id) REFERENCES subdistricts(id)
      )
    `);

    // Create territory_subdistrict_education table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS territory_subdistrict_education (
        id INT PRIMARY KEY AUTO_INCREMENT,
        territory_subdistrict_id INT NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        meta_title VARCHAR(255),
        meta_description TEXT,
        meta_keywords VARCHAR(255),
        schools_count INT,
        colleges_count INT,
        universities_count INT,
        literacy_rate DECIMAL(5,2),
        notable_institutions TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (territory_subdistrict_id) REFERENCES territory_subdistricts(id)
      )
    `);

    // Create subdistrict_healthcare table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS subdistrict_healthcare (
        id INT PRIMARY KEY AUTO_INCREMENT,
        subdistrict_id INT NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        meta_title VARCHAR(255),
        meta_description TEXT,
        meta_keywords VARCHAR(255),
        hospitals_count INT,
        clinics_count INT,
        health_centers_count INT,
        medical_facilities TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (subdistrict_id) REFERENCES subdistricts(id)
      )
    `);

    // Create territory_subdistrict_healthcare table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS territory_subdistrict_healthcare (
        id INT PRIMARY KEY AUTO_INCREMENT,
        territory_subdistrict_id INT NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        meta_title VARCHAR(255),
        meta_description TEXT,
        meta_keywords VARCHAR(255),
        hospitals_count INT,
        clinics_count INT,
        health_centers_count INT,
        medical_facilities TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (territory_subdistrict_id) REFERENCES territory_subdistricts(id)
      )
    `);

    // Create subdistrict_weather table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS subdistrict_weather (
        id INT PRIMARY KEY AUTO_INCREMENT,
        subdistrict_id INT NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        meta_title VARCHAR(255),
        meta_description TEXT,
        meta_keywords VARCHAR(255),
        climate_type VARCHAR(100),
        temperature_range VARCHAR(100),
        rainfall VARCHAR(100),
        best_season VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (subdistrict_id) REFERENCES subdistricts(id)
      )
    `);

    // Create territory_subdistrict_weather table (keeping only one version with better structure)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS territory_subdistrict_weather (
        id INT PRIMARY KEY AUTO_INCREMENT,
        territory_subdistrict_id INT NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        meta_title VARCHAR(255),
        meta_description TEXT,
        meta_keywords VARCHAR(255),
        climate_type VARCHAR(100),
        temperature_range VARCHAR(100),
        rainfall VARCHAR(255),
        best_season VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (territory_subdistrict_id) REFERENCES territory_subdistricts(id)
      )
    `);

    // Create places table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS places (
        id INT PRIMARY KEY AUTO_INCREMENT,
        state_id INT NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        title VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        location VARCHAR(255),
        description TEXT,
        content TEXT,
        best_time_to_visit VARCHAR(255),
        entry_fee DECIMAL(10,2),
        timings VARCHAR(255),
        featured BOOLEAN DEFAULT 0,
        image VARCHAR(255),
        featured_image VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (state_id) REFERENCES states(id) ON DELETE CASCADE,
        INDEX idx_state (state_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create videos table (keeping the better version with ENUM for entity_type)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS videos (
        id INT PRIMARY KEY AUTO_INCREMENT,
        youtube_url VARCHAR(255) NOT NULL,
        youtube_id VARCHAR(11) NOT NULL,
        entity_type ENUM('package', 'state', 'district', 'subdistrict') NOT NULL,
        entity_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_entity (entity_type, entity_id),
        INDEX idx_youtube_id (youtube_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('Videos table checked/created successfully');

    // Create team_members table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS team (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(255) NOT NULL,
        description TEXT,
        image VARCHAR(255),
        linkedin VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('Team members table checked/created successfully');

    // Create subdistricts table with exact structure
    await connection.query(`
      CREATE TABLE IF NOT EXISTS subdistricts (
        id INT(11) NOT NULL AUTO_INCREMENT,
        district_id INT(11) NOT NULL,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL,
        description TEXT,
        featured_image VARCHAR(255),
        status ENUM('publish', 'draft') DEFAULT 'publish',
        meta_title VARCHAR(255),
        meta_description TEXT,
        meta_keywords TEXT,
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY unique_slug (slug),
        KEY district_id (district_id),
        FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `);
    console.log('Subdistricts table checked/created successfully');

    // Create state_season_images table with exact structure
    await connection.query(`
      CREATE TABLE IF NOT EXISTS state_season_images (
        id INT(11) NOT NULL AUTO_INCREMENT,
        state_id INT(11) NOT NULL,
        season ENUM('winter', 'summer', 'autumn', 'spring') NOT NULL,
        url VARCHAR(255) NOT NULL,
        location VARCHAR(255),
        alt VARCHAR(255),
        caption TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY state_id (state_id),
        FOREIGN KEY (state_id) REFERENCES states(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `);
    console.log('State season images table checked/created successfully');

    // Create territory_attractions table with exact structure
    await connection.query(`
      CREATE TABLE IF NOT EXISTS territory_attractions (
        id INT(11) NOT NULL AUTO_INCREMENT,
        territory_subdistrict_id INT(11) NOT NULL,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL,
        description TEXT,
        featured_image VARCHAR(255),
        meta_title VARCHAR(255),
        meta_description VARCHAR(255),
        meta_keywords VARCHAR(255),
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY territory_subdistrict_id (territory_subdistrict_id),
        FOREIGN KEY (territory_subdistrict_id) REFERENCES territory_subdistricts(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `);
    console.log('Territory attractions table checked/created successfully');

    // Create season_images table with exact structure
    await connection.query(`
      CREATE TABLE IF NOT EXISTS season_images (
        id INT(11) NOT NULL AUTO_INCREMENT,
        season_id INT(11) NOT NULL,
        image_url VARCHAR(255) NOT NULL,
        alt_text VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY season_id (season_id),
        FOREIGN KEY (season_id) REFERENCES seasons(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `);
    console.log('Season images table checked/created successfully');

    // Create attractions table with exact structure
    await connection.query(`
      CREATE TABLE IF NOT EXISTS attractions (
        id INT(11) NOT NULL AUTO_INCREMENT,
        subdistrict_id INT(11) NOT NULL,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL,
        description TEXT,
        featured_image VARCHAR(255),
        meta_title VARCHAR(255),
        meta_description VARCHAR(255),
        meta_keywords VARCHAR(255),
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY subdistrict_id (subdistrict_id),
        FOREIGN KEY (subdistrict_id) REFERENCES subdistricts(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `);
    console.log('Attractions table checked/created successfully');

    // Create cultures table with exact structure
    await connection.query(`
      CREATE TABLE IF NOT EXISTS cultures (
        id INT(11) NOT NULL AUTO_INCREMENT,
        subdistrict_id INT(11) NOT NULL,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL,
        description TEXT,
        featured_image VARCHAR(255),
        meta_title VARCHAR(60),
        meta_description VARCHAR(160),
        meta_keywords TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY slug (slug),
        KEY idx_subdistrict (subdistrict_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('Cultures table checked/created successfully');

    // Create territory_cultures table with same structure
    await connection.query(`
      CREATE TABLE IF NOT EXISTS territory_cultures (
        id INT(11) NOT NULL AUTO_INCREMENT,
        territory_subdistrict_id INT(11) NOT NULL,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL,
        description TEXT,
        featured_image VARCHAR(255),
        meta_title VARCHAR(60),
        meta_description VARCHAR(160),
        meta_keywords TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY slug (slug),
        KEY idx_territory_subdistrict (territory_subdistrict_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('Territory cultures table checked/created successfully');

    // Create adventure activities tables
    await connection.query(`
      CREATE TABLE IF NOT EXISTS state_adventure_activities (
        id INT PRIMARY KEY AUTO_INCREMENT,
        subdistrict_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL,
        category ENUM('trekking', 'adventure_sports', 'nature_trails', 'wildlife', 'camping') NOT NULL,
        description TEXT,
        difficulty_level ENUM('easy', 'moderate', 'challenging', 'expert') NOT NULL,
        duration VARCHAR(50),
        best_season VARCHAR(100),
        location_details TEXT,
        coordinates VARCHAR(100),
        featured_image VARCHAR(255),
        gallery_images JSON,
        safety_guidelines TEXT,
        required_permits TEXT,
        contact_info TEXT,
        price_range VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (subdistrict_id) REFERENCES subdistricts(id),
        INDEX idx_subdistrict (subdistrict_id),
        INDEX idx_category (category)
      )
    `);
    console.log('State adventure activities table checked/created successfully');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS territory_adventure_activities (
        id INT PRIMARY KEY AUTO_INCREMENT,
        territory_subdistrict_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL,
        category ENUM('trekking', 'adventure_sports', 'nature_trails', 'wildlife', 'camping') NOT NULL,
        description TEXT,
        difficulty_level ENUM('easy', 'moderate', 'challenging', 'expert') NOT NULL,
        duration VARCHAR(50),
        best_season VARCHAR(100),
        location_details TEXT,
        coordinates VARCHAR(100),
        featured_image VARCHAR(255),
        gallery_images JSON,
        safety_guidelines TEXT,
        required_permits TEXT,
        contact_info TEXT,
        price_range VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (territory_subdistrict_id) REFERENCES territory_subdistricts(id),
        INDEX idx_territory_subdistrict (territory_subdistrict_id),
        INDEX idx_category (category)
      )
    `);
    console.log('Territory adventure activities table checked/created successfully');

    // Create territory_subdistricts table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS territory_subdistricts (
        id INT(11) NOT NULL AUTO_INCREMENT,
        territory_district_id INT(11) NOT NULL,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL,
        description TEXT,
        featured_image VARCHAR(255),
        status ENUM('publish', 'draft') DEFAULT 'publish',
        meta_title VARCHAR(255),
        meta_description TEXT,
        meta_keywords TEXT,
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY unique_slug (slug),
        KEY territory_district_id (territory_district_id),
        FOREIGN KEY (territory_district_id) REFERENCES territory_districts(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `);
    console.log('Territory subdistricts table checked/created successfully');

    // Create villages table if not exists
    await connection.query(`
      CREATE TABLE IF NOT EXISTS villages (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        location VARCHAR(255),
        population INT,
        main_occupation VARCHAR(255),
        cultural_significance TEXT,
        attractions TEXT,
        how_to_reach TEXT,
        best_time_to_visit VARCHAR(255),
        images JSON,
        featured_image VARCHAR(255),
        status ENUM('draft', 'published') DEFAULT 'draft',
        state_id INT,
        territory_id INT,
        district_id INT,
        subdistrict_id INT,
        area DECIMAL(10,2),
        highlights JSON,
        meta_title VARCHAR(255),
        meta_description TEXT,
        meta_keywords TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (state_id) REFERENCES states(id) ON DELETE SET NULL,
        FOREIGN KEY (territory_id) REFERENCES territories(id) ON DELETE SET NULL,
        FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE SET NULL,
        FOREIGN KEY (subdistrict_id) REFERENCES subdistricts(id) ON DELETE SET NULL,
        INDEX idx_state (state_id),
        INDEX idx_territory (territory_id),
        INDEX idx_district (district_id),
        INDEX idx_subdistrict (subdistrict_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('Villages table checked/created successfully');

    // Create village_images table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS village_images (
        id INT PRIMARY KEY AUTO_INCREMENT,
        village_id INT NOT NULL,
        image_path VARCHAR(255) NOT NULL,
        alt_text VARCHAR(255),
        description TEXT,
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (village_id) REFERENCES villages(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('Village images table checked/created successfully');

    // Create state_village_images table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS state_village_images (
        id INT PRIMARY KEY AUTO_INCREMENT,
        village_id INT NOT NULL,
        image_path VARCHAR(255) NOT NULL,
        alt_text VARCHAR(255),
        description TEXT,
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (village_id) REFERENCES villages(id) ON DELETE CASCADE,
        INDEX idx_village (village_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('State village images table checked/created successfully');

    // Create territory_village_images table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS territory_village_images (
        id INT PRIMARY KEY AUTO_INCREMENT,
        village_id INT NOT NULL,
        image_path VARCHAR(255) NOT NULL,
        alt_text VARCHAR(255),
        description TEXT,
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (village_id) REFERENCES territory_villages(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('Territory village images table checked/created successfully');

    // Create village_population table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS village_population (
        id INT PRIMARY KEY AUTO_INCREMENT,
        village_id INT NOT NULL,
        total_population INT,
        male_population INT,
        female_population INT,
        rural_population INT,
        urban_population INT,
        literacy_rate DECIMAL(5,2),
        male_literacy_rate DECIMAL(5,2),
        female_literacy_rate DECIMAL(5,2),
        scheduled_caste_population INT,
        scheduled_tribe_population INT,
        other_backward_classes_population INT,
        muslim_population INT,
        christian_population INT,
        sikh_population INT,
        buddhist_population INT,
        jain_population INT,
        other_religions_population INT,
        not_stated_population INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (village_id) REFERENCES villages(id) ON DELETE CASCADE,
        INDEX idx_village (village_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('Village population table checked/created successfully');

    // Create territory_village_population table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS territory_village_population (
        id INT PRIMARY KEY AUTO_INCREMENT,
        territory_village_id INT NOT NULL,
        total_population INT,
        male_population INT,
        female_population INT,
        rural_population INT,
        urban_population INT,
        literacy_rate DECIMAL(5,2),
        male_literacy_rate DECIMAL(5,2),
        female_literacy_rate DECIMAL(5,2),
        scheduled_caste_population INT,
        scheduled_tribe_population INT,
        other_backward_classes_population INT,
        muslim_population INT,
        christian_population INT,
        sikh_population INT,
        buddhist_population INT,
        jain_population INT,
        other_religions_population INT,
        not_stated_population INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (territory_village_id) REFERENCES territory_villages(id) ON DELETE CASCADE,
        INDEX idx_territory_village (territory_village_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('Territory village population table checked/created successfully');

    // Create state_village_employment table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS state_village_employment (
        id INT PRIMARY KEY AUTO_INCREMENT,
        village_id INT NOT NULL,
        year INT NOT NULL,
        
        working_population INT,
        main_workers INT,
        main_cultivators INT,
        agri_labourers INT,
        marginal_workers INT,
        marginal_cultivators INT,
        non_working INT,
        non_working_males INT,
        non_working_females INT,
        
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (village_id) REFERENCES villages(id) ON DELETE CASCADE,
        UNIQUE KEY unique_village_year (village_id, year)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('State village employment table checked/created successfully');

    // Create territory_village_employment table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS territory_village_employment (
        id INT PRIMARY KEY AUTO_INCREMENT,
        village_id INT NOT NULL,
        year INT NOT NULL,
        
        working_population INT,
        main_workers INT,
        main_cultivators INT,
        agri_labourers INT,
        marginal_workers INT,
        marginal_cultivators INT,
        non_working INT,
        non_working_males INT,
        non_working_females INT,
        
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (village_id) REFERENCES villages(id) ON DELETE CASCADE,
        UNIQUE KEY unique_village_year (village_id, year)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('Territory village employment table checked/created successfully');

    // Create state_village_education table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS state_village_education (
        id INT PRIMARY KEY AUTO_INCREMENT,
        village_id INT NOT NULL,
        primary_schools_govt INT,
        middle_schools_govt INT,
        secondary_schools_govt INT,
        senior_secondary_schools_govt INT,
        nearest_arts_college VARCHAR(255),
        nearest_engg_college VARCHAR(255),
        nearest_medical_college VARCHAR(255),
        nearest_polytechnic VARCHAR(255),
        nearest_vocational_iti VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (village_id) REFERENCES villages(id) ON DELETE CASCADE,
        INDEX idx_village (village_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('State village education table checked/created successfully');

    // Create territory_village_education table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS territory_village_education (
        id INT PRIMARY KEY AUTO_INCREMENT,
        village_id INT NOT NULL,
        primary_schools_govt INT,
        middle_schools_govt INT,
        secondary_schools_govt INT,
        senior_secondary_schools_govt INT,
        nearest_arts_college VARCHAR(255),
        nearest_engg_college VARCHAR(255),
        nearest_medical_college VARCHAR(255),
        nearest_polytechnic VARCHAR(255),
        nearest_vocational_iti VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (village_id) REFERENCES territory_villages(id) ON DELETE CASCADE,
        INDEX idx_village (village_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('Territory village education table checked/created successfully');

    // Create hotels table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS hotels (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        category_id INT,
        state_id INT,
        location VARCHAR(255),
        address TEXT,
        phone_number VARCHAR(20),
        description TEXT,
        star_rating DECIMAL(2,1),
        price_per_night DECIMAL(10,2),
        total_rooms INT,
        available_rooms INT,
        amenities JSON,
        check_in_time TIME,
        check_out_time TIME,
        latitude DECIMAL(10,8),
        longitude DECIMAL(11,8),
        meta_title VARCHAR(255),
        meta_description TEXT,
        meta_keywords TEXT,
        featured_image VARCHAR(255),
        accommodation_type ENUM('hotel', 'tent', 'resort', 'homestay', 'hostel', 'guesthouse', 'cottage') DEFAULT 'hotel',
        tent_capacity INT,
        tent_type VARCHAR(50),
        resort_category VARCHAR(50),
        resort_features JSON,
        homestay_features JSON,
        hostel_features JSON,
        guesthouse_features JSON,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES hotel_categories(id) ON DELETE SET NULL,
        FOREIGN KEY (state_id) REFERENCES states(id) ON DELETE SET NULL,
        INDEX idx_name (name),
        INDEX idx_slug (slug),
        INDEX idx_state (state_id),
        INDEX idx_category (category_id),
        INDEX idx_accommodation_type (accommodation_type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('Hotels table checked/created successfully');

    // Create hotel_images table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS hotel_images (
        id INT PRIMARY KEY AUTO_INCREMENT,
        hotel_id INT NOT NULL,
        url VARCHAR(255) NOT NULL,
        alt_text VARCHAR(255),
        description TEXT,
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
        INDEX idx_hotel (hotel_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('Hotel images table checked/created successfully');

    // Create hotel_rooms table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS hotel_rooms (
        id INT PRIMARY KEY AUTO_INCREMENT,
        hotel_id INT NOT NULL,
        type VARCHAR(50) NOT NULL,
        total_rooms INT NOT NULL,
        available_rooms INT NOT NULL,
        peak_season_price DECIMAL(10,2),
        off_season_price DECIMAL(10,2),
        amenities JSON,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
        INDEX idx_hotel (hotel_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('Hotel rooms table checked/created successfully');

    // Create hotel_categories table if not exists
    await connection.query(`
      CREATE TABLE IF NOT EXISTS hotel_categories (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_slug (slug)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('Hotel categories table checked/created successfully');

    // Create hotel_amenities table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS hotel_amenities (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        accommodation_type ENUM('hotel', 'tent', 'resort', 'homestay', 'hostel', 'guesthouse', 'cottage') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_accommodation_type (accommodation_type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('Hotel amenities table checked/created successfully');

    // Create hotel_amenity_mappings table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS hotel_amenity_mappings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        hotel_id INT NOT NULL,
        amenity_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
        FOREIGN KEY (amenity_id) REFERENCES hotel_amenities(id) ON DELETE CASCADE,
        UNIQUE KEY unique_hotel_amenity (hotel_id, amenity_id),
        INDEX idx_hotel (hotel_id),
        INDEX idx_amenity (amenity_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('Hotel amenity mappings table checked/created successfully');

    // Create package_seasons table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS package_seasons (
        id INT PRIMARY KEY AUTO_INCREMENT,
        package_id INT NOT NULL,
        season VARCHAR(20) NOT NULL,
        season_description TEXT,
        best_time_to_visit TEXT,
        weather_conditions TEXT,
        special_attractions TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE,
        UNIQUE KEY unique_package_season (package_id, season),
        INDEX idx_package_season_active (package_id, season, is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('Package seasons table checked/created successfully');

    // Create package_season_images table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS package_season_images (
        id INT PRIMARY KEY AUTO_INCREMENT,
        package_id INT NOT NULL,
        season VARCHAR(20) NOT NULL,
        image_path VARCHAR(255) NOT NULL,
        alt_text VARCHAR(255),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE,
        INDEX idx_package_season (package_id, season)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('Package season images table checked/created successfully');

    // Create articles table if not exists
    await connection.query(`
      CREATE TABLE IF NOT EXISTS articles (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL,
        content TEXT,
        description TEXT,
        featured_image VARCHAR(255),
        category VARCHAR(100),
        category_id INT,
        status VARCHAR(50),
        featured BOOLEAN,
        meta_title VARCHAR(255),
        meta_description TEXT,
        meta_keywords TEXT,
        author VARCHAR(255),
        packages_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('Articles table checked/created successfully');

    console.log('All tables created successfully');
    connection.release();
  } catch (error) {
    console.error('Error creating tables:', error);
    process.exit(1);
  }
}

// Create tables when server starts
createTables();

// Create weather tables
const createWeatherTables = async () => {
  try {
    // Weather Alerts table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS weather_alerts (
        id INT PRIMARY KEY AUTO_INCREMENT,
        subdistrict_id INT NOT NULL,
        type VARCHAR(50) NOT NULL,
        severity ENUM('low', 'medium', 'high', 'extreme') NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        start_date DATETIME NOT NULL,
        end_date DATETIME NOT NULL,
        affected_areas JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (subdistrict_id) REFERENCES subdistricts(id) ON DELETE CASCADE
      )
    `);

    // Seasonal Guides table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS seasonal_guides (
        id INT PRIMARY KEY AUTO_INCREMENT,
        subdistrict_id INT NOT NULL,
        month VARCHAR(20) NOT NULL,
        temperature_range VARCHAR(50) NOT NULL,
        rainfall VARCHAR(50) NOT NULL,
        activities TEXT NOT NULL,
        packing_suggestions TEXT NOT NULL,
        best_time BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (subdistrict_id) REFERENCES subdistricts(id) ON DELETE CASCADE
      )
    `);

    // Weather Statistics table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS weather_statistics (
        id INT PRIMARY KEY AUTO_INCREMENT,
        subdistrict_id INT NOT NULL,
        month VARCHAR(20) NOT NULL,
        avg_temperature DECIMAL(5,2) NOT NULL,
        rainfall DECIMAL(6,2) NOT NULL,
        humidity DECIMAL(5,2) NOT NULL,
        wind_speed DECIMAL(5,2) NOT NULL,
        wind_direction VARCHAR(10) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (subdistrict_id) REFERENCES subdistricts(id) ON DELETE CASCADE
      )
    `);

    // Tourist Features table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tourist_features (
        id INT PRIMARY KEY AUTO_INCREMENT,
        subdistrict_id INT NOT NULL,
        feature_type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        best_time VARCHAR(100) NOT NULL,
        recommendations TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (subdistrict_id) REFERENCES subdistricts(id) ON DELETE CASCADE
      )
    `);

    // Weather Activities table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS weather_activities (
        id INT PRIMARY KEY AUTO_INCREMENT,
        subdistrict_id INT NOT NULL,
        activity_type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        weather_requirements TEXT NOT NULL,
        indoor_outdoor ENUM('indoor', 'outdoor', 'both') NOT NULL,
        best_season VARCHAR(50) NOT NULL,
        recommendations TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (subdistrict_id) REFERENCES subdistricts(id) ON DELETE CASCADE
      )
    `);

    // Add image path columns to tables with updated comments
    await pool.query(`
      ALTER TABLE weather_alerts 
      MODIFY COLUMN alert_images JSON COMMENT 'Array of image paths relative to /uploads/weather/'
    `);

    await pool.query(`
      ALTER TABLE seasonal_guides 
      MODIFY COLUMN month_images JSON COMMENT 'Array of image paths relative to /uploads/weather/'
    `);

    await pool.query(`
      ALTER TABLE tourist_features 
      MODIFY COLUMN feature_images JSON COMMENT 'Array of image paths relative to /uploads/weather/'
    `);

    await pool.query(`
      ALTER TABLE weather_activities 
      MODIFY COLUMN activity_images JSON COMMENT 'Array of image paths relative to /uploads/weather/'
    `);

    console.log('Weather tables and image directory created successfully');
  } catch (error) {
    console.error('Error creating weather tables:', error);
    throw error;
  }
};

// Call createWeatherTables after other table creation functions
createWeatherTables().catch(console.error);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 