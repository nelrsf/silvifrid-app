import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Product, ProductImage } from '../../../model/product';
import { ProductService } from '../../../services/product.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-product-view',
    templateUrl: './product-view.component.html',
    styleUrls: ['./product-view.component.css'],
    standalone: false
})
export class ProductViewComponent implements OnInit, OnDestroy {
  product: Product | null = null;
  isLoading = true;
  selectedImage: ProductImage | null = null;
  
  private subscription: Subscription = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService
  ) { }

  ngOnInit(): void {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.loadProduct(productId);
    } else {
      this.router.navigate(['/products']);
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private loadProduct(id: string): void {
    this.isLoading = true;
    this.product = this.productService.getProductById(id) || null;
    
    if (this.product) {
      this.selectedImage = this.product.mainImage || null;
      this.isLoading = false;
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Producto no encontrado'
      }).then(() => {
        this.router.navigate(['/products']);
      });
    }
  }

  selectImage(image: ProductImage): void {
    this.selectedImage = image;
  }

  getImageUrl(image: ProductImage | null): string {
    if (!image) return this.getDefaultImageUrl();
    
    if (image.url.startsWith('img_')) {
      const url = this.productService.getImageUrl(image.url);
      return url || this.getDefaultImageUrl();
    }
    return image.url;
  }

  public getDefaultImageUrl(): string {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjZjhGOWZhIi8+CjxwYXRoIGQ9Ik0yMDAgMTUwQzIyNy42MTQgMTUwIDI1MCA3Mi4zODU5IDI1MCAyMDBDMjUwIDIyNy42MTQgMjI3LjYxNCAyNTAgMjAwIDI1MEMxNzIuMzg2IDI1MCAxNTAgMjI3LjYxNCAxNTAgMjAwQzE1MCAxNzIuMzg2IDE3Mi4zODYgMTUwIDIwMCAxNTBaIiBmaWxsPSIjNjc3NTg5Ii8+CjxwYXRoIGQ9Ik0xMDAgMTAwSDMwMEMzMDUuNTIzIDEwMCAzMTAgMTA0LjQ3NyAzMTAgMTEwVjI5MEMzMTAgMjk1LjUyMyAzMDUuNTIzIDMwMCAzMDAgMzAwSDEwMEM5NC40NzcyIDMwMCA5MCAyOTUuNTIzIDkwIDI5MFYxMTBDOTAgMTA0LjQ3NyA5NC40NzcyIDEwMCAxMDAgMTAwWiIgc3Ryb2tlPSIjNjc3NTg5IiBzdHJva2Utd2lkdGg9IjIwIiBmaWxsPSJub25lIi8+Cjwvc3ZnPg==';
  }

  onImageError(event: any): void {
    event.target.src = this.getDefaultImageUrl();
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  }

  editProduct(): void {
    if (this.product) {
      this.router.navigate(['/products/edit', this.product.id]);
    }
  }

  deleteProduct(): void {
    if (!this.product) return;

    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar el producto "${this.product.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed && this.product) {
        this.subscription.add(
          this.productService.deleteProduct(this.product.id).subscribe({
            next: () => {
              Swal.fire({
                icon: 'success',
                title: 'Eliminado',
                text: 'El producto ha sido eliminado exitosamente',
                timer: 2000
              }).then(() => {
                this.router.navigate(['/products']);
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

  goBack(): void {
    this.router.navigate(['/products']);
  }
}