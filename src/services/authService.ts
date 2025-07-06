import api from './api';

export interface LoginRequest {
  email: string;
  password: string;
  userType?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: string;
      email: string;
      name: string;
      userType: string;
    };
    token: string;
  };
}

// Backend response format
export interface BackendLoginResponse {
  status: string;
  data: {
    superUser?: {
      id: string;
      name: string;
      email: string;
    };
    agent?: {
      id: string;
      name: string;
      email: string;
    };
    propertyManager?: {
      id: string;
      name: string;
      email: string;
    };
    staff?: {
      id: string;
      name: string;
      email: string;
    };
    tenant?: {
      id: string;
      name: string;
      email: string;
    };
    token: string;
  };
}

export interface AuthError {
  message: string;
  code?: string;
}

class AuthService {
  /**
   * Map backend user types to frontend user types
   */
  private mapUserType(backendType: string): string {
    const typeMapping: Record<string, string> = {
      'superUser': 'super_user',
      'admin': 'super_user',
      'propertyManager': 'property_manager',
      'staff': 'staff',
      'tenant': 'tenant',
      'agent': 'property_manager' // Assuming agent maps to property_manager
    };
    
    return typeMapping[backendType] || 'staff'; // Default to staff if unknown
  }

  /**
   * Login user with email and password
   */
  async login(email: string, password: string, userType = 'admin'): Promise<LoginResponse> {
    try {
      const response = await api.post<BackendLoginResponse>('/v1/auth/login', {
        email,
        password,
        userType,
      });

             // Check if login was successful
       if (response.data.status === 'success' && response.data.data?.token) {
         // Extract user data based on what's present in the response
         let user: { id: string; email: string; name: string; } | null = null;
         let userType = 'staff'; // default
         
         const responseData = response.data.data;
         
         if (responseData.superUser) {
           user = responseData.superUser;
           userType = this.mapUserType('superUser');
         } else if (responseData.agent) {
           user = responseData.agent;
           userType = this.mapUserType('agent');
         } else if (responseData.propertyManager) {
           user = responseData.propertyManager;
           userType = this.mapUserType('propertyManager');
         } else if (responseData.staff) {
           user = responseData.staff;
           userType = this.mapUserType('staff');
         } else if (responseData.tenant) {
           user = responseData.tenant;
           userType = this.mapUserType('tenant');
         }
         
         if (!user) {
           throw new Error('Invalid user data received from server');
         }

         // Transform backend response to frontend format
         const transformedResponse: LoginResponse = {
           success: true,
           message: 'Login successful',
           data: {
             user: {
               id: user.id,
               email: user.email,
               name: user.name,
               userType: userType
             },
             token: response.data.data.token
           }
         };

                 // Store token in localStorage
         localStorage.setItem('authToken', response.data.data.token);
         localStorage.setItem('userData', JSON.stringify(transformedResponse.data!.user));

        return transformedResponse;
      } else {
        return {
          success: false,
          message: 'Login failed'
        };
      }
    } catch (error: any) {
      // Handle API errors
      if (error.response?.data) {
        throw new Error(error.response.data.message || 'Login failed');
      } else if (error.request) {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error('An unexpected error occurred');
      }
    }
  }

  /**
   * Logout user
   */
  logout(): void {
    // Just clear localStorage - Redux state will be cleared by the logout action
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
  }

  /**
   * Get stored token
   */
  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  /**
   * Get stored user data
   */
  getUserData(): any | null {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export default new AuthService(); 