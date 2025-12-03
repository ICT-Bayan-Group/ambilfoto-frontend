import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, UserProfile } from '@/services/api/auth.service';
import { useToast } from '@/hooks/use-toast';

interface LoginResult {
  user: UserProfile;
  token: string;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<LoginResult | null>;
  loginWithFace: (faceImage: string) => Promise<LoginResult | null>;
  register: (data: any) => Promise<LoginResult | null>;
  logout: () => void;
  updateUser: (user: UserProfile) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Load auth state from localStorage
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('user_data');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      
      // Verify token is still valid
      authService.verifyToken()
        .then((response) => {
          if (response.success) {
            setIsLoading(false);
          } else {
            logout();
          }
        })
        .catch(() => {
          logout();
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<LoginResult | null> => {
    try {
      const response = await authService.login({ email, password });
      
      if (response.success && response.data) {
        setUser(response.data.user);
        setToken(response.data.token);
        
        localStorage.setItem('auth_token', response.data.token);
        localStorage.setItem('user_data', JSON.stringify(response.data.user));
        
        toast({
          title: "Welcome back!",
          description: `Logged in as ${response.data.user.full_name}`,
        });
        
        // Return user data for role-based redirect
        return {
          user: response.data.user,
          token: response.data.token
        };
      }
      
      return null;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Login failed';
      toast({
        title: "Login failed",
        description: message,
        variant: "destructive",
      });
      throw new Error(message);
    }
  };

  const loginWithFace = async (faceImage: string): Promise<LoginResult | null> => {
    try {
      const response = await authService.loginWithFace({ face_image: faceImage });
      
      if (response.success && response.data) {
        setUser(response.data.user);
        setToken(response.data.token);
        
        localStorage.setItem('auth_token', response.data.token);
        localStorage.setItem('user_data', JSON.stringify(response.data.user));
        
        toast({
          title: "Face recognized!",
          description: `Welcome back, ${response.data.user.full_name}`,
        });
        
        // Return user data for role-based redirect
        return {
          user: response.data.user,
          token: response.data.token
        };
      }
      
      return null;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Face login failed';
      toast({
        title: "Face login failed",
        description: message,
        variant: "destructive",
      });
      throw new Error(message);
    }
  };

  const register = async (data: any): Promise<LoginResult | null> => {
    try {
      const response = await authService.register(data);
      
      if (response.success && response.data) {
        setUser(response.data.user);
        setToken(response.data.token);
        
        localStorage.setItem('auth_token', response.data.token);
        localStorage.setItem('user_data', JSON.stringify(response.data.user));
        
        toast({
          title: "Account created!",
          description: `Welcome to AmbildFoto.id, ${response.data.user.full_name}`,
        });
        
        // Return user data for role-based redirect
        return {
          user: response.data.user,
          token: response.data.token
        };
      }
      
      return null;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Registration failed';
      toast({
        title: "Registration failed",
        description: message,
        variant: "destructive",
      });
      throw new Error(message);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };

  const updateUser = (updatedUser: UserProfile) => {
    setUser(updatedUser);
    localStorage.setItem('user_data', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
        loginWithFace,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};