import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, AuthContextType, LoginCredentials, RegisterData } from '../types';
import { authAPI, setAuthToken } from '../utils/api';
import toast from 'react-hot-toast';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User };

const initialState: AuthState = {
  user: null,
  token: null,
  loading: true,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        loading: true,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing token on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        setAuthToken(token);
        try {
          const response = await authAPI.getProfile();
          if (response.success && response.data) {
            dispatch({
              type: 'AUTH_SUCCESS',
              payload: { user: response.data, token },
            });
          } else {
            dispatch({ type: 'AUTH_FAILURE' });
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          dispatch({ type: 'AUTH_FAILURE' });
        }
      } else {
        dispatch({ type: 'AUTH_FAILURE' });
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await authAPI.login(credentials);
      
      if (response.success && response.data) {
        const { token, user } = response.data;
        setAuthToken(token);
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user, token },
        });
        toast.success('Login successful!');
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE' });
      const message = error instanceof Error ? error.message : 'Login failed';
      toast.error(message);
      throw error;
    }
  };

  const register = async (data: RegisterData): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await authAPI.register(data);
      
      if (response.success && response.data) {
        const { token, user } = response.data;
        setAuthToken(token);
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user, token },
        });
        toast.success('Registration successful!');
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE' });
      const message = error instanceof Error ? error.message : 'Registration failed';
      toast.error(message);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setAuthToken(null);
      dispatch({ type: 'LOGOUT' });
      toast.success('Logged out successfully');
    }
  };

  const updateProfile = async (data: Partial<User>): Promise<void> => {
    try {
      const response = await authAPI.updateProfile(data);
      
      if (response.success && response.data) {
        dispatch({
          type: 'UPDATE_USER',
          payload: response.data,
        });
        toast.success('Profile updated successfully!');
      } else {
        throw new Error(response.message || 'Profile update failed');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Profile update failed';
      toast.error(message);
      throw error;
    }
  };

  const value: AuthContextType = {
    user: state.user,
    token: state.token,
    loading: state.loading,
    login,
    register,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};