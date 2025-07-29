import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product, ProductImage } from '../model/product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly STORAGE_KEY = 'silvifrid_products';
  private readonly IMAGE_STORAGE_KEY = 'silvifrid_product_images';
  
  private productsSubject = new BehaviorSubject<Product[]>([]);
  public products$ = this.productsSubject.asObservable();

  constructor() {
    this.loadProducts();
  }

  private loadProducts(): void {
    try {
      const storedProducts = localStorage.getItem(this.STORAGE_KEY);
      if (storedProducts) {
        const productsData = JSON.parse(storedProducts);
        const products = productsData.map((data: any) => Product.fromJSON(data));
        this.productsSubject.next(products);
      }
    } catch (error) {
      console.error('Error loading products from localStorage:', error);
      this.productsSubject.next([]);
    }
  }

  private saveProducts(products: Product[]): void {
    try {
      const productsData = products.map(product => product.toJSON());
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(productsData));
      this.productsSubject.next(products);
    } catch (error) {
      console.error('Error saving products to localStorage:', error);
    }
  }

  public getProducts(): Observable<Product[]> {
    return this.products$;
  }

  public getProductById(id: string): Product | undefined {
    const products = this.productsSubject.getValue();
    return products.find(product => product.id === id);
  }

  public createProduct(productData: Partial<Product>): Observable<Product> {
    return new Observable(observer => {
      try {
        const product = new Product();
        
        if (productData.name) product.name = productData.name;
        if (productData.price !== undefined) product.price = productData.price;
        if (productData.description) product.description = productData.description;
        if (productData.images) product.images = productData.images;

        const products = this.productsSubject.getValue();
        products.push(product);
        this.saveProducts(products);
        
        observer.next(product);
        observer.complete();
      } catch (error) {
        observer.error(error);
      }
    });
  }

  public updateProduct(id: string, productData: Partial<Product>): Observable<Product> {
    return new Observable(observer => {
      try {
        const products = this.productsSubject.getValue();
        const productIndex = products.findIndex(p => p.id === id);
        
        if (productIndex === -1) {
          observer.error(new Error('Product not found'));
          return;
        }

        const product = products[productIndex];
        
        if (productData.name !== undefined) product.name = productData.name;
        if (productData.price !== undefined) product.price = productData.price;
        if (productData.description !== undefined) product.description = productData.description;
        if (productData.images !== undefined) product.images = productData.images;

        this.saveProducts(products);
        
        observer.next(product);
        observer.complete();
      } catch (error) {
        observer.error(error);
      }
    });
  }

  public deleteProduct(id: string): Observable<boolean> {
    return new Observable(observer => {
      try {
        const products = this.productsSubject.getValue();
        const productIndex = products.findIndex(p => p.id === id);
        
        if (productIndex === -1) {
          observer.error(new Error('Product not found'));
          return;
        }

        // Remove product images from storage
        const product = products[productIndex];
        product.images.forEach(image => {
          this.removeImageFromStorage(image.id);
        });

        products.splice(productIndex, 1);
        this.saveProducts(products);
        
        observer.next(true);
        observer.complete();
      } catch (error) {
        observer.error(error);
      }
    });
  }

  public saveImageToStorage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageData = e.target?.result as string;
          const imageId = 'img_' + Math.random().toString(36).substr(2, 9) + Date.now();
          
          // Store image data in localStorage
          const images = this.getStoredImages();
          images[imageId] = {
            data: imageData,
            name: file.name,
            size: file.size,
            type: file.type,
            createdAt: new Date().toISOString()
          };
          
          localStorage.setItem(this.IMAGE_STORAGE_KEY, JSON.stringify(images));
          resolve(imageId);
        };
        
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      } catch (error) {
        reject(error);
      }
    });
  }

  public getImageUrl(imageId: string): string {
    try {
      const images = this.getStoredImages();
      return images[imageId]?.data || '';
    } catch (error) {
      console.error('Error retrieving image:', error);
      return '';
    }
  }

  private getStoredImages(): any {
    try {
      const storedImages = localStorage.getItem(this.IMAGE_STORAGE_KEY);
      return storedImages ? JSON.parse(storedImages) : {};
    } catch (error) {
      console.error('Error parsing stored images:', error);
      return {};
    }
  }

  private removeImageFromStorage(imageId: string): void {
    try {
      const images = this.getStoredImages();
      delete images[imageId];
      localStorage.setItem(this.IMAGE_STORAGE_KEY, JSON.stringify(images));
    } catch (error) {
      console.error('Error removing image from storage:', error);
    }
  }

  public clearAllData(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.IMAGE_STORAGE_KEY);
    this.productsSubject.next([]);
  }

  // Utility method to seed some demo data
  public seedDemoData(): void {
    const demoProducts = [
      {
        name: "Victoria's Secret Paris Hilton tradicional",
        price: 22000,
        description: "Disfruta de la versión tradicional de Paris Hilton, una fragancia clásica que nunca pasa de moda. Con notas de manzana, jazmín y almizle, Paris Hilton Tradicional es ideal para quienes buscan un aroma elegante y atemporal.",
        images: []
      }
    ];

    demoProducts.forEach(productData => {
      this.createProduct(productData).subscribe();
    });
  }
}