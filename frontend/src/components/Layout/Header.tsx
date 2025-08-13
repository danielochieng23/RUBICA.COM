import React, { useState } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
// Using emoji icons instead of react-icons for React 19 compatibility

const HeaderContainer = styled.header`
  background: linear-gradient(135deg, ${props => props.theme.colors.primary} 0%, ${props => props.theme.colors.primaryDark} 100%);
  color: white;
  position: sticky;
  top: 0;
  z-index: ${props => props.theme.zIndices.sticky};
  box-shadow: ${props => props.theme.shadows.md};
`;

const TopBar = styled.div`
  background: rgba(0, 0, 0, 0.1);
  padding: 0.5rem 0;
  font-size: ${props => props.theme.fontSizes.sm};
  text-align: center;
`;

const NavContainer = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  max-width: 1200px;
  margin: 0 auto;
  padding-left: 1rem;
  padding-right: 1rem;
`;

const Logo = styled(Link)`
  font-size: ${props => props.theme.fontSizes['3xl']};
  font-weight: ${props => props.theme.fontWeights.bold};
  color: white;
  text-decoration: none;
  font-family: ${props => props.theme.fonts.heading};
  
  &:hover {
    color: white;
  }
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    display: none;
  }
`;

const NavLink = styled(Link)`
  color: white;
  text-decoration: none;
  font-weight: ${props => props.theme.fontWeights.medium};
  padding: 0.5rem 1rem;
  border-radius: ${props => props.theme.borderRadius.md};
  transition: ${props => props.theme.transitions.normal};
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }
`;

const UserActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'outline' }>`
  padding: 0.75rem 1.5rem;
  border-radius: ${props => props.theme.borderRadius.md};
  font-weight: ${props => props.theme.fontWeights.medium};
  font-size: ${props => props.theme.fontSizes.sm};
  transition: ${props => props.theme.transitions.normal};
  display: flex;
  align-items: center;
  gap: 0.5rem;

  ${props => props.variant === 'outline' && `
    background: transparent;
    border: 2px solid white;
    color: white;
    
    &:hover {
      background: white;
      color: ${props.theme.colors.primary};
    }
  `}

  ${props => props.variant === 'secondary' && `
    background: ${props.theme.colors.secondary};
    border: none;
    color: white;
    
    &:hover {
      background: ${props.theme.colors.secondaryDark};
    }
  `}

  ${props => (!props.variant || props.variant === 'primary') && `
    background: white;
    border: none;
    color: ${props.theme.colors.primary};
    
    &:hover {
      background: ${props.theme.colors.gray100};
    }
  `}
`;

const MobileMenuButton = styled.button`
  display: none;
  background: transparent;
  color: white;
  padding: 0.5rem;
  border-radius: ${props => props.theme.borderRadius.md};

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    display: flex;
    align-items: center;
  }
`;

const MobileMenu = styled.div<{ isOpen: boolean }>`
  display: none;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    display: ${props => props.isOpen ? 'block' : 'none'};
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: ${props => props.theme.colors.primary};
    padding: 1rem;
    box-shadow: ${props => props.theme.shadows.lg};
  }
`;

const MobileNavLink = styled(Link)`
  display: block;
  color: white;
  text-decoration: none;
  padding: 1rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-weight: ${props => props.theme.fontWeights.medium};

  &:hover {
    color: ${props => props.theme.colors.primaryLight};
  }
`;

interface HeaderProps {
  isAuthenticated?: boolean;
  user?: any;
}

const Header: React.FC<HeaderProps> = ({ isAuthenticated = false, user }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <HeaderContainer>
      <TopBar>
        <div className="container">
          Welcome to Rubica.com - Premium Adult Services Directory
        </div>
      </TopBar>
      
      <div className="container">
        <NavContainer>
          <Logo to="/">
            Rubica.com
          </Logo>

          <NavLinks>
            <NavLink to="/browse">
              🔍 Browse Services
            </NavLink>
            <NavLink to="/categories">
              Categories
            </NavLink>
            <NavLink to="/cities">
              Cities
            </NavLink>
                                        {isAuthenticated && (
                <NavLink to="/favorites">
                  ❤️ Favorites
                </NavLink>
              )}
          </NavLinks>

          <UserActions>
                                        {isAuthenticated ? (
                <>
                  <Button onClick={() => navigate('/dashboard')}>
                    👤 Dashboard
                  </Button>
                  <Button variant="secondary" onClick={() => navigate('/post-ad')}>
                    ➕ Post Ad
                  </Button>
                </>
              ) : (
              <>
                <Button variant="outline" onClick={() => navigate('/login')}>
                  Login
                </Button>
                <Button onClick={() => navigate('/register')}>
                  Sign Up
                </Button>
              </>
            )}

            <MobileMenuButton onClick={toggleMobileMenu}>
              {isMobileMenuOpen ? '✕' : '☰'}
            </MobileMenuButton>
          </UserActions>
        </NavContainer>

        <MobileMenu isOpen={isMobileMenuOpen}>
          <MobileNavLink to="/browse" onClick={() => setIsMobileMenuOpen(false)}>
            Browse Services
          </MobileNavLink>
          <MobileNavLink to="/categories" onClick={() => setIsMobileMenuOpen(false)}>
            Categories
          </MobileNavLink>
          <MobileNavLink to="/cities" onClick={() => setIsMobileMenuOpen(false)}>
            Cities
          </MobileNavLink>
          {isAuthenticated && (
            <MobileNavLink to="/favorites" onClick={() => setIsMobileMenuOpen(false)}>
              Favorites
            </MobileNavLink>
          )}
        </MobileMenu>
      </div>
    </HeaderContainer>
  );
};

export default Header;