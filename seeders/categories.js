const mongoose = require('mongoose');
const Category = require('../models/Category');
require('dotenv').config();

const categories = [
  {
    name: 'Beauty & Wellness',
    description: 'Professional beauty and wellness services',
    icon: 'fas fa-spa',
    color: '#ec4899',
    sortOrder: 1,
    meta: {
      keywords: ['beauty', 'wellness', 'spa', 'massage', 'skincare'],
      metaTitle: 'Beauty & Wellness Services',
      metaDescription: 'Find professional beauty and wellness services near you'
    }
  },
  {
    name: 'Fitness & Sports',
    description: 'Personal training and sports services',
    icon: 'fas fa-dumbbell',
    color: '#10b981',
    sortOrder: 2,
    meta: {
      keywords: ['fitness', 'gym', 'personal trainer', 'sports', 'yoga'],
      metaTitle: 'Fitness & Sports Services',
      metaDescription: 'Professional fitness and sports training services'
    }
  },
  {
    name: 'Education & Training',
    description: 'Tutoring and educational services',
    icon: 'fas fa-graduation-cap',
    color: '#3b82f6',
    sortOrder: 3,
    meta: {
      keywords: ['education', 'tutoring', 'training', 'learning', 'coaching'],
      metaTitle: 'Education & Training Services',
      metaDescription: 'Quality education and training services'
    }
  },
  {
    name: 'Entertainment',
    description: 'Event and entertainment services',
    icon: 'fas fa-music',
    color: '#f59e0b',
    sortOrder: 4,
    meta: {
      keywords: ['entertainment', 'events', 'music', 'dance', 'performers'],
      metaTitle: 'Entertainment Services',
      metaDescription: 'Professional entertainment and event services'
    }
  },
  {
    name: 'Professional Services',
    description: 'Business and professional consulting',
    icon: 'fas fa-briefcase',
    color: '#6366f1',
    sortOrder: 5,
    meta: {
      keywords: ['professional', 'business', 'consulting', 'legal', 'finance'],
      metaTitle: 'Professional Services',
      metaDescription: 'Expert professional and business services'
    }
  },
  {
    name: 'Home Services',
    description: 'Home maintenance and cleaning services',
    icon: 'fas fa-home',
    color: '#059669',
    sortOrder: 6,
    meta: {
      keywords: ['home', 'cleaning', 'maintenance', 'repair', 'domestic'],
      metaTitle: 'Home Services',
      metaDescription: 'Reliable home services and maintenance'
    }
  },
  {
    name: 'Technology',
    description: 'IT and technology services',
    icon: 'fas fa-laptop',
    color: '#8b5cf6',
    sortOrder: 7,
    meta: {
      keywords: ['technology', 'IT', 'computer', 'software', 'repair'],
      metaTitle: 'Technology Services',
      metaDescription: 'Professional IT and technology services'
    }
  },
  {
    name: 'Automotive',
    description: 'Vehicle services and repairs',
    icon: 'fas fa-car',
    color: '#ef4444',
    sortOrder: 8,
    meta: {
      keywords: ['automotive', 'car', 'vehicle', 'repair', 'maintenance'],
      metaTitle: 'Automotive Services',
      metaDescription: 'Professional automotive and vehicle services'
    }
  }
];

async function seedCategories() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rubica');
    console.log('✅ Connected to MongoDB');

    // Clear existing categories
    await Category.deleteMany({});
    console.log('🗑️  Cleared existing categories');

    // Insert new categories
    const createdCategories = await Category.insertMany(categories);
    console.log(`✅ Created ${createdCategories.length} categories`);

    console.log('🌱 Categories seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  seedCategories();
}

module.exports = { categories, seedCategories };