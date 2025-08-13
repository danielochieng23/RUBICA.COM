import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
// Using emoji icons instead of react-icons for React 19 compatibility

const HeroSection = styled.section`
  background: linear-gradient(135deg, ${props => props.theme.colors.primary} 0%, ${props => props.theme.colors.primaryDark} 100%);
  color: white;
  padding: 4rem 0;
  text-align: center;
`;

const HeroContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const HeroTitle = styled.h1`
  font-size: ${props => props.theme.fontSizes['5xl']};
  font-weight: ${props => props.theme.fontWeights.bold};
  margin-bottom: 1rem;
  line-height: ${props => props.theme.lineHeights.tight};
`;

const HeroSubtitle = styled.p`
  font-size: ${props => props.theme.fontSizes.xl};
  margin-bottom: 3rem;
  opacity: 0.9;
`;

const SearchContainer = styled.div`
  background: white;
  border-radius: ${props => props.theme.borderRadius.xl};
  padding: 1rem;
  display: flex;
  gap: 1rem;
  max-width: 600px;
  margin: 0 auto;
  box-shadow: ${props => props.theme.shadows.lg};

  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    flex-direction: column;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  padding: 1rem;
  font-size: ${props => props.theme.fontSizes.md};
  color: ${props => props.theme.colors.text};
  
  &::placeholder {
    color: ${props => props.theme.colors.textLight};
  }
`;

const SearchSelect = styled.select`
  border: none;
  padding: 1rem;
  min-width: 150px;
  font-size: ${props => props.theme.fontSizes.md};
  color: ${props => props.theme.colors.text};
  background: white;
`;

const SearchButton = styled.button`
  background: ${props => props.theme.colors.primary};
  color: white;
  padding: 1rem 2rem;
  border-radius: ${props => props.theme.borderRadius.lg};
  font-weight: ${props => props.theme.fontWeights.semibold};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: ${props => props.theme.transitions.normal};

  &:hover {
    background: ${props => props.theme.colors.primaryDark};
  }
`;

const CategoriesSection = styled.section`
  padding: 4rem 0;
  background: ${props => props.theme.colors.backgroundAlt};
`;

const SectionTitle = styled.h2`
  text-align: center;
  margin-bottom: 3rem;
  color: ${props => props.theme.colors.text};
`;

const CategoriesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const CategoryCard = styled.div`
  background: white;
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: 2rem;
  text-align: center;
  box-shadow: ${props => props.theme.shadows.md};
  transition: ${props => props.theme.transitions.normal};
  cursor: pointer;

  &:hover {
    transform: translateY(-5px);
    box-shadow: ${props => props.theme.shadows.lg};
  }
`;

const CategoryIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const CategoryName = styled.h3`
  color: ${props => props.theme.colors.text};
  margin-bottom: 0.5rem;
`;

const CategoryCount = styled.p`
  color: ${props => props.theme.colors.textLight};
  font-size: ${props => props.theme.fontSizes.sm};
`;

const FeaturedSection = styled.section`
  padding: 4rem 0;
`;

const FeaturedGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const ListingCard = styled.div`
  background: white;
  border-radius: ${props => props.theme.borderRadius.lg};
  overflow: hidden;
  box-shadow: ${props => props.theme.shadows.md};
  transition: ${props => props.theme.transitions.normal};
  cursor: pointer;

  &:hover {
    transform: translateY(-5px);
    box-shadow: ${props => props.theme.shadows.lg};
  }
`;

const ListingImage = styled.div<{ image: string }>`
  height: 200px;
  background-image: url(${props => props.image});
  background-size: cover;
  background-position: center;
  position: relative;
`;

const PremiumBadge = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: ${props => props.theme.colors.accent};
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: ${props => props.theme.borderRadius.full};
  font-size: ${props => props.theme.fontSizes.xs};
  font-weight: ${props => props.theme.fontWeights.semibold};
`;

const ListingContent = styled.div`
  padding: 1.5rem;
`;

const ListingTitle = styled.h4`
  color: ${props => props.theme.colors.text};
  margin-bottom: 0.5rem;
  font-size: ${props => props.theme.fontSizes.lg};
`;

const ListingLocation = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${props => props.theme.colors.textLight};
  margin-bottom: 1rem;
  font-size: ${props => props.theme.fontSizes.sm};
`;

const ListingStats = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const Stat = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: ${props => props.theme.colors.textLight};
  font-size: ${props => props.theme.fontSizes.sm};
`;

const ListingPrice = styled.div`
  color: ${props => props.theme.colors.primary};
  font-weight: ${props => props.theme.fontWeights.semibold};
  font-size: ${props => props.theme.fontSizes.lg};
`;

const CitiesSection = styled.section`
  padding: 4rem 0;
  background: ${props => props.theme.colors.backgroundAlt};
`;

const CitiesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const CityCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: ${props => props.theme.borderRadius.lg};
  text-align: center;
  box-shadow: ${props => props.theme.shadows.sm};
  cursor: pointer;
  transition: ${props => props.theme.transitions.normal};

  &:hover {
    box-shadow: ${props => props.theme.shadows.md};
    transform: translateY(-2px);
  }
`;

const CityName = styled.h4`
  color: ${props => props.theme.colors.text};
  margin-bottom: 0.5rem;
`;

const CityListings = styled.p`
  color: ${props => props.theme.colors.textLight};
  font-size: ${props => props.theme.fontSizes.sm};
`;

const HomePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const navigate = useNavigate();

  const categories = [
    { icon: '👯‍♀️', name: 'Call Girls', count: '1,234 ads' },
    { icon: '💆‍♀️', name: 'Massage', count: '856 ads' },
    { icon: '👨‍🦱', name: 'Male Escorts', count: '567 ads' },
    { icon: '🏠', name: 'Independent', count: '923 ads' },
    { icon: '🌟', name: 'Premium', count: '445 ads' },
    { icon: '💎', name: 'VIP Services', count: '234 ads' },
  ];

  const featuredListings = [
    {
      id: 1,
      title: 'Elite Companion Services',
      location: 'Mumbai, Maharashtra',
      image: 'https://via.placeholder.com/300x200/e91e63/ffffff?text=Premium+Service',
      price: '₹5,000/hr',
      views: 1234,
      likes: 89,
      isPremium: true,
      verified: true
    },
    {
      id: 2,
      title: 'Relaxing Massage Therapy',
      location: 'Delhi, Delhi',
      image: 'https://via.placeholder.com/300x200/673ab7/ffffff?text=Massage+Therapy',
      price: '₹2,500/hr',
      views: 856,
      likes: 67,
      isPremium: false,
      verified: true
    },
    {
      id: 3,
      title: 'Professional Escort Services',
      location: 'Bangalore, Karnataka',
      image: 'https://via.placeholder.com/300x200/ff5722/ffffff?text=Escort+Service',
      price: '₹3,500/hr',
      views: 923,
      likes: 45,
      isPremium: true,
      verified: false
    },
  ];

  const cities = [
    { name: 'Mumbai', listings: '2,456 ads' },
    { name: 'Delhi', listings: '1,987 ads' },
    { name: 'Bangalore', listings: '1,654 ads' },
    { name: 'Chennai', listings: '1,234 ads' },
    { name: 'Kolkata', listings: '987 ads' },
    { name: 'Pune', listings: '765 ads' },
    { name: 'Hyderabad', listings: '643 ads' },
    { name: 'Ahmedabad', listings: '521 ads' },
  ];

  const handleSearch = () => {
    navigate(`/browse?q=${searchQuery}&city=${selectedCity}`);
  };

  return (
    <>
      <HeroSection>
        <div className="container">
          <HeroContent>
            <HeroTitle>Find Premium Adult Services</HeroTitle>
            <HeroSubtitle>
              Discover verified companions, massage services, and more in your city
            </HeroSubtitle>
            
            <SearchContainer>
              <SearchInput
                type="text"
                placeholder="Search for services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <SearchSelect
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
              >
                <option value="">All Cities</option>
                {cities.map((city) => (
                  <option key={city.name} value={city.name}>
                    {city.name}
                  </option>
                ))}
              </SearchSelect>
              <SearchButton onClick={handleSearch}>
                🔍 Search
              </SearchButton>
            </SearchContainer>
          </HeroContent>
        </div>
      </HeroSection>

      <CategoriesSection>
        <div className="container">
          <SectionTitle>Browse by Category</SectionTitle>
          <CategoriesGrid>
            {categories.map((category) => (
              <CategoryCard
                key={category.name}
                onClick={() => navigate(`/category/${category.name.toLowerCase().replace(' ', '-')}`)}
              >
                <CategoryIcon>{category.icon}</CategoryIcon>
                <CategoryName>{category.name}</CategoryName>
                <CategoryCount>{category.count}</CategoryCount>
              </CategoryCard>
            ))}
          </CategoriesGrid>
        </div>
      </CategoriesSection>

      <FeaturedSection>
        <div className="container">
          <SectionTitle>Featured Listings</SectionTitle>
          <FeaturedGrid>
            {featuredListings.map((listing) => (
              <ListingCard
                key={listing.id}
                onClick={() => navigate(`/listing/${listing.id}`)}
              >
                <ListingImage image={listing.image}>
                  {listing.isPremium && <PremiumBadge>Premium</PremiumBadge>}
                </ListingImage>
                <ListingContent>
                  <ListingTitle>{listing.title}</ListingTitle>
                  <ListingLocation>
                    📍 {listing.location}
                  </ListingLocation>
                                                          <ListingStats>
                      <Stat>
                        👁️ {listing.views}
                      </Stat>
                      <Stat>
                        ❤️ {listing.likes}
                      </Stat>
                      {listing.verified && (
                        <Stat>
                          ⭐ Verified
                        </Stat>
                      )}
                    </ListingStats>
                  <ListingPrice>{listing.price}</ListingPrice>
                </ListingContent>
              </ListingCard>
            ))}
          </FeaturedGrid>
        </div>
      </FeaturedSection>

      <CitiesSection>
        <div className="container">
          <SectionTitle>Popular Cities</SectionTitle>
          <CitiesGrid>
            {cities.map((city) => (
              <CityCard
                key={city.name}
                onClick={() => navigate(`/city/${city.name.toLowerCase()}`)}
              >
                <CityName>{city.name}</CityName>
                <CityListings>{city.listings}</CityListings>
              </CityCard>
            ))}
          </CitiesGrid>
        </div>
      </CitiesSection>
    </>
  );
};

export default HomePage;