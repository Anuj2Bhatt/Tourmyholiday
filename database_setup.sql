-- TourMyHoliday Database Setup Script
-- Run this script in MySQL to create the database and basic structure

-- Create database
CREATE DATABASE IF NOT EXISTS tourmyholiday;
USE tourmyholiday;

-- Basic tables that will be created automatically by the application
-- The Node.js application will create all tables when it starts

-- You can also manually create some basic tables if needed:

-- States table
CREATE TABLE IF NOT EXISTS states (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Districts table
CREATE TABLE IF NOT EXISTS districts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    state_id INT,
    description TEXT,
    image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (state_id) REFERENCES states(id) ON DELETE CASCADE
);

-- Users table (if authentication is needed)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert sample data for testing
INSERT INTO states (name, description) VALUES 
('Uttarakhand', 'Land of Gods - Beautiful Himalayan state'),
('Himachal Pradesh', 'Dev Bhoomi - Land of Gods'),
('Rajasthan', 'Land of Kings - Rich cultural heritage');

INSERT INTO districts (name, state_id, description) VALUES 
('Dehradun', 1, 'Capital city of Uttarakhand'),
('Shimla', 2, 'Capital city of Himachal Pradesh'),
('Jaipur', 3, 'Pink City - Capital of Rajasthan');

-- Note: The application will automatically create all other tables when it starts
-- This includes: villages, hotels, packages, articles, gallery, etc.

-- To verify setup:
SELECT 'Database setup completed successfully!' as status;
SELECT COUNT(*) as states_count FROM states;
SELECT COUNT(*) as districts_count FROM districts; 