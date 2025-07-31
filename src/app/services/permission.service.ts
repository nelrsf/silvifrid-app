import { Injectable } from '@angular/core';
import { AuthService } from '../auth/auth/auth.service';

export enum ProductPermission {
  VIEW = 'products-view',
  CREATE = 'products-create',
  EDIT = 'products-edit',
  DELETE = 'products-delete',
  ALL = 'products-all'
}

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

  constructor(private authService: AuthService) { }

  /**
   * Check if user has specific product permission
   * @param permission The permission to check
   * @returns true if user has permission
   */
  hasProductPermission(permission: ProductPermission): boolean {
    const user = this.authService.getUserFromLocalStorage();
    
    if (!user || !user.permissions) {
      return false;
    }

    // Check if user has 'products-all' permission (overrides all others)
    if (user.permissions.includes(ProductPermission.ALL)) {
      return true;
    }

    // Check for specific permission
    return user.permissions.includes(permission);
  }

  /**
   * Check if user can view products
   */
  canViewProducts(): boolean {
    return this.hasProductPermission(ProductPermission.VIEW);
  }

  /**
   * Check if user can create products
   */
  canCreateProducts(): boolean {
    return this.hasProductPermission(ProductPermission.CREATE);
  }

  /**
   * Check if user can edit products
   */
  canEditProducts(): boolean {
    return this.hasProductPermission(ProductPermission.EDIT);
  }

  /**
   * Check if user can delete products
   */
  canDeleteProducts(): boolean {
    return this.hasProductPermission(ProductPermission.DELETE);
  }

  /**
   * Check if user has all product permissions
   */
  hasAllProductPermissions(): boolean {
    return this.hasProductPermission(ProductPermission.ALL);
  }

  /**
   * Get current user's auth token for API calls
   */
  getAuthToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Get authorization header for API calls
   */
  getAuthHeaders(): { [key: string]: string } {
    const token = this.getAuthToken();
    if (token) {
      return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
    }
    return {
      'Content-Type': 'application/json'
    };
  }
}