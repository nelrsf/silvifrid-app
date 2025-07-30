import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Product } from '../../../model/product';
import { ProductService } from '../../../services/product.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-product-list',
    templateUrl: './product-list.component.html',
    styleUrls: ['./product-list.component.css'],
    standalone: false
})
export class ProductListComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  isLoading = true;
  private subscription: Subscription = new Subscription();

  constructor(
    private productService: ProductService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadProducts();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private loadProducts(): void {
    this.isLoading = true;
    this.subscription.add(
      this.productService.getProducts().subscribe({
        next: (products) => {
          this.products = products;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading products:', error);
          this.isLoading = false;
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error al cargar los productos'
          });
        }
      })
    );
  }

  createProduct(): void {
    this.router.navigate(['/products/create']);
  }

  viewProduct(product: Product): void {
    this.router.navigate(['/products/view', product.id]);
  }

  editProduct(product: Product): void {
    this.router.navigate(['/products/edit', product.id]);
  }

  deleteProduct(product: Product): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar el producto "${product.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.subscription.add(
          this.productService.deleteProduct(product.id).subscribe({
            next: () => {
              Swal.fire({
                icon: 'success',
                title: 'Eliminado',
                text: 'El producto ha sido eliminado exitosamente',
                timer: 2000
              });
            },
            error: (error) => {
              console.error('Error deleting product:', error);
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al eliminar el producto'
              });
            }
          })
        );
      }
    });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  }

  getImageUrl(product: Product): string {
    const mainImage = product.mainImage;
    if (mainImage?.url) {
      // If it's an image ID, get the actual URL from service
      if (mainImage.url.startsWith('img_')) {
        return this.productService.getImageUrl(mainImage.url);
      }
      return mainImage.url;
    }
    return 'assets/images/no-image.png';
  }

  seedDemoData(): void {
    this.productService.seedDemoData();
  }
}