import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Product, ProductCreateDto, ProductUpdateDto } from '../model/product';
import { PermissionService } from './permission.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  
  private productsSubject = new BehaviorSubject<Product[]>([]);
  public products$ = this.productsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private permissionService: PermissionService
  ) { }

  /**
   * Get all products from catalog API
   * GET /getproducts
   */
  public getProducts(): Observable<Product[]> {
    if (!this.permissionService.canViewProducts()) {
      return throwError('Insufficient permissions to view products');
    }

    return this.http.get<Product[]>(`${environment.api_url}/getproducts`)
      .pipe(
        tap(products => this.productsSubject.next(products)),
        catchError(this.handleError)
      );
  }

  /**
   * Get product by ID from catalog API
   * GET /getproducts/:id
   */
  public getProductById(id: string): Observable<Product> {
    if (!this.permissionService.canViewProducts()) {
      return throwError('Insufficient permissions to view products');
    }

    return this.http.get<Product>(`${environment.api_url}/getproducts/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Create new product using catalog API
   * POST /createproduct
   * Protected endpoint - requires authentication and create permission
   */
  public createProduct(productData: ProductCreateDto): Observable<Product> {
    if (!this.permissionService.canCreateProducts()) {
      return throwError('Insufficient permissions to create products');
    }

    const headers = new HttpHeaders(this.permissionService.getAuthHeaders());

    return this.http.post<Product>(`${environment.api_url}/createproduct`, productData, { headers })
      .pipe(
        tap(product => {
          // Update local products list
          const currentProducts = this.productsSubject.getValue();
          this.productsSubject.next([...currentProducts, product]);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Update existing product
   * Note: This endpoint needs to be implemented in the backend
   * PUT /updateproduct/:id or PATCH /updateproduct/:id
   */
  public updateProduct(id: string, productData: ProductUpdateDto): Observable<Product> {
    if (!this.permissionService.canEditProducts()) {
      return throwError('Insufficient permissions to edit products');
    }

    const headers = new HttpHeaders(this.permissionService.getAuthHeaders());

    // This endpoint needs to be implemented in the backend
    return this.http.put<Product>(`${environment.api_url}/updateproduct/${id}`, productData, { headers })
      .pipe(
        tap(updatedProduct => {
          // Update local products list
          const currentProducts = this.productsSubject.getValue();
          const index = currentProducts.findIndex(p => p._id === id);
          if (index > -1) {
            currentProducts[index] = updatedProduct;
            this.productsSubject.next([...currentProducts]);
          }
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Delete product
   * Note: This endpoint needs to be implemented in the backend
   * DELETE /deleteproduct/:id
   */
  public deleteProduct(id: string): Observable<{ success: boolean, message?: string }> {
    if (!this.permissionService.canDeleteProducts()) {
      return throwError('Insufficient permissions to delete products');
    }

    const headers = new HttpHeaders(this.permissionService.getAuthHeaders());

    // This endpoint needs to be implemented in the backend
    return this.http.delete<{ success: boolean, message?: string }>(`${environment.api_url}/deleteproduct/${id}`, { headers })
      .pipe(
        tap(result => {
          if (result.success) {
            // Update local products list
            const currentProducts = this.productsSubject.getValue();
            const filteredProducts = currentProducts.filter(p => p._id !== id);
            this.productsSubject.next(filteredProducts);
          }
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Refresh products list from API
   */
  public refreshProducts(): Observable<Product[]> {
    return this.getProducts();
  }

  /**
   * Get main image URL for a product
   * Returns the first image in the array (index 0) as main image
   */
  public getMainImageUrl(product: Product): string {
    return product.images && product.images.length > 0 ? product.images[0] : '';
  }

  /**
   * Get secondary images for a product
   * Returns all images except the first one
   */
  public getSecondaryImages(product: Product): string[] {
    return product.images && product.images.length > 1 ? product.images.slice(1) : [];
  }

  /**
   * Check if user has permission for specific product operation
   */
  public canPerformOperation(operation: 'view' | 'create' | 'edit' | 'delete'): boolean {
    switch (operation) {
      case 'view':
        return this.permissionService.canViewProducts();
      case 'create':
        return this.permissionService.canCreateProducts();
      case 'edit':
        return this.permissionService.canEditProducts();
      case 'delete':
        return this.permissionService.canDeleteProducts();
      default:
        return false;
    }
  }

  /**
   * Handle HTTP errors
   */
  private handleError = (error: any) => {
    console.error('ProductService error:', error);
    
    if (error.status === 401) {
      return throwError('Authentication required. Please login.');
    } else if (error.status === 403) {
      return throwError('Insufficient permissions to perform this operation.');
    } else if (error.status === 404) {
      return throwError('Product not found.');
    } else if (error.status === 500) {
      return throwError('Server error. Please try again later.');
    }
    
    return throwError(error.message || 'An unexpected error occurred.');
  }
}