#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 TourMyHoliday - Migration Runner');
console.log('====================================');

const migrations = [
  // Main village migration
  { name: 'Villages', command: 'node src/database/migrate.js' },
  
  // Hotel migrations
  { name: 'Hotel Amenities', command: 'node migrations/migrate-hotel-amenities.js' },
  { name: 'Update Hotel Amenities', command: 'node migrations/update-hotel-amenities.js' },
  
  // Culture migrations
  { name: 'India Culture Info', command: 'node migrations/create-india-culture-info-table.js' },
  
  // Bonfire migration
  { name: 'Default Bonfire', command: 'node migrations/add-default-bonfire.js' },
  
  // Fix migrations
  { name: 'Fix Amenities', command: 'node migrations/fix-amenities.js' },
  
  // Database migrations
  { name: 'Village Highlights', command: 'node database/migrations/20240320_add_highlights_to_villages.js' },
  { name: 'Fix Highlights Column', command: 'node database/migrations/20240320_fix_highlights_column.js' },
  { name: 'Fix Highlights Constraint', command: 'node database/migrations/20240320_fix_highlights_constraint.js' },
  { name: 'Update Village Images', command: 'node database/migrations/20240320_update_villages_images.js' },
  { name: 'Update State Foreign Keys', command: 'node database/migrations/20240321_update_state_foreign_keys.js' }
];

async function runMigrations() {
  for (const migration of migrations) {
    try {
      console.log(`\n📦 Running: ${migration.name}`);
      execSync(migration.command, { stdio: 'inherit' });
      console.log(`✅ ${migration.name} completed successfully`);
    } catch (error) {
      console.log(`❌ ${migration.name} failed:`, error.message);
      console.log('Continuing with next migration...');
    }
  }
  
  console.log('\n🎉 All migrations completed!');
}

// Check command line arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Usage: node migrate.js [options]

Options:
  --help, -h     Show this help message
  --list, -l     List all available migrations
  --specific     Run specific migration by name
  --reset        Run all migrations (default)

Examples:
  node migrate.js                    # Run all migrations
  node migrate.js --list            # List all migrations
  node migrate.js --specific "Villages"  # Run specific migration
  `);
  process.exit(0);
}

if (args.includes('--list') || args.includes('-l')) {
  console.log('\n📋 Available Migrations:');
  migrations.forEach((migration, index) => {
    console.log(`${index + 1}. ${migration.name}`);
  });
  process.exit(0);
}

if (args.includes('--specific')) {
  const specificName = args[args.indexOf('--specific') + 1];
  const migration = migrations.find(m => m.name.toLowerCase() === specificName.toLowerCase());
  
  if (migration) {
    console.log(`\n🎯 Running specific migration: ${migration.name}`);
    try {
      execSync(migration.command, { stdio: 'inherit' });
      console.log(`✅ ${migration.name} completed successfully`);
    } catch (error) {
      console.log(`❌ ${migration.name} failed:`, error.message);
      process.exit(1);
    }
  } else {
    console.log(`❌ Migration "${specificName}" not found`);
    console.log('Use --list to see available migrations');
    process.exit(1);
  }
} else {
  // Run all migrations
  runMigrations();
} 