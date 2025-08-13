import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Star, Eye, Users, ArrowRight, TrendingUp } from 'lucide-react';
import { categoriesAPI, listingsAPI } from '../utils/api';
import { Category, Listing } from '../types';
import LoadingSpinner from '../components/common/LoadingSpinner';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredListings, setFeaturedListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesResponse, listingsResponse] = await Promise.all([
          categoriesAPI.getCategories(true),
          listingsAPI.getListings({ featured: true, limit: 8 })
        ]);

        if (categoriesResponse.success) {
          setCategories(categoriesResponse.data?.slice(0, 8) || []);
        }

        if (listingsResponse.success) {
          setFeaturedListings(listingsResponse.data || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.append('search', searchQuery.trim());
    if (searchCity.trim()) params.append('city', searchCity.trim());
    navigate(`/listings?${params.toString()}`);
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Find Premium Services
              <span className="block text-primary-200">Near You</span>
            </h1>
            <p className="text-xl text-gray-200 mb-12 max-w-3xl mx-auto">
              Discover and connect with verified service providers in your area. 
              From beauty and wellness to professional services - find exactly what you need.
            </p>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-lg p-2 flex flex-col md:flex-row gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="What service are you looking for?"
                    className="w-full pl-10 pr-4 py-3 border-0 focus:ring-0 rounded-md text-lg placeholder-gray-500"
                  />
                </div>
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                    placeholder="Enter your city"
                    className="w-full pl-10 pr-4 py-3 border-0 focus:ring-0 rounded-md text-lg placeholder-gray-500"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-md font-semibold transition-colors flex items-center justify-center"
                >
                  <Search className="w-5 h-5 mr-2" />
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary-600">10K+</div>
              <div className="text-gray-600">Service Providers</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary-600">50K+</div>
              <div className="text-gray-600">Happy Customers</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary-600">100+</div>
              <div className="text-gray-600">Cities Covered</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary-600">4.8★</div>
              <div className="text-gray-600">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Popular Categories
            </h2>
            <p className="text-lg text-gray-600">
              Explore our most sought-after service categories
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                key={category._id}
                to={`/category/${category.slug}`}
                className="bg-white rounded-lg shadow-soft hover:shadow-medium transition-shadow p-6 text-center group"
              >
                <div 
                  className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-white text-2xl"
                  style={{ backgroundColor: category.color }}
                >
                  <i className={category.icon}></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {category.stats.listingCount} services
                </p>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/listings" className="btn-primary">
              View All Categories
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Featured Services
            </h2>
            <p className="text-lg text-gray-600">
              Premium services recommended by our community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredListings.map((listing) => (
              <Link
                key={listing._id}
                to={`/listings/${listing._id}`}
                className="bg-white rounded-lg shadow-soft hover:shadow-medium transition-shadow overflow-hidden group"
              >
                <div className="aspect-w-16 aspect-h-12 bg-gray-200">
                  {listing.mainImage ? (
                    <img
                      src={listing.mainImage}
                      alt={listing.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                      <span className="text-primary-600 text-4xl">
                        <i className={listing.category.icon}></i>
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="badge-primary">
                      {listing.category.name}
                    </span>
                    {listing.features.verified && (
                      <span className="badge-accent text-xs">
                        Verified
                      </span>
                    )}
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                    {listing.title}
                  </h3>
                  
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    {listing.location.city}, {listing.location.state}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-600">
                      <Star className="w-4 h-4 mr-1 text-yellow-400 fill-current" />
                      {listing.ratings.average.toFixed(1)} ({listing.ratings.count})
                    </div>
                    <div className="font-semibold text-primary-600">
                      {listing.formattedPrice}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/listings?featured=true" className="btn-secondary">
              View All Featured Services
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600">
              Get started in just a few simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                1. Search Services
              </h3>
              <p className="text-gray-600">
                Browse through thousands of verified service providers in your area
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                2. Connect & Compare
              </h3>
              <p className="text-gray-600">
                View profiles, read reviews, and compare prices to find the perfect match
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                3. Book & Enjoy
              </h3>
              <p className="text-gray-600">
                Book your service and enjoy a premium experience with trusted professionals
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Your Service Business?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of service providers and grow your business with Rubica
          </p>
          <Link to="/register" className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 rounded-md font-semibold transition-colors inline-flex items-center">
            Get Started Today
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;