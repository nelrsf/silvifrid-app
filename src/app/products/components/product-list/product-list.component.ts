import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Product } from '../../../model/product';
import { ProductService } from '../../../services/product.service';
import { PermissionService } from '../../../services/permission.service';
import Swal from 'sweetalert2';
import { faPlus, faDatabase, faBoxOpen, faEye, faEdit, faTrash, faInfoCircle, faDollarSign, faBox } from '@fortawesome/free-solid-svg-icons';

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

  // FontAwesome icons
  faPlus = faPlus;
  faDatabase = faDatabase;
  faBoxOpen = faBoxOpen;
  faEye = faEye;
  faEdit = faEdit;
  faTrash = faTrash;
  faInfoCircle = faInfoCircle;
  faDollarSign = faDollarSign;
  faBox = faBox;

  constructor(
    private productService: ProductService,
    private permissionService: PermissionService,
    private router: Router
  ) { }

  ngOnInit(): void {
    if (!this.permissionService.canViewProducts()) {
      Swal.fire({
        icon: 'error',
        title: 'Sin permisos',
        text: 'No tiene permisos para ver productos'
      }).then(() => {
        this.router.navigate(['/']);
      });
      return;
    }
    
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
            text: error || 'Error al cargar los productos'
          });
        }
      })
    );
  }

  createProduct(): void {
    if (!this.permissionService.canCreateProducts()) {
      Swal.fire({
        icon: 'error',
        title: 'Sin permisos',
        text: 'No tiene permisos para crear productos'
      });
      return;
    }
    this.router.navigate(['/products/create']);
  }

  viewProduct(product: Product): void {
    this.router.navigate(['/products/view', product._id]);
  }

  editProduct(product: Product): void {
    if (!this.permissionService.canEditProducts()) {
      Swal.fire({
        icon: 'error',
        title: 'Sin permisos',
        text: 'No tiene permisos para editar productos'
      });
      return;
    }
    this.router.navigate(['/products/edit', product._id]);
  }

  deleteProduct(product: Product): void {
    if (!this.permissionService.canDeleteProducts()) {
      Swal.fire({
        icon: 'error',
        title: 'Sin permisos',
        text: 'No tiene permisos para eliminar productos'
      });
      return;
    }

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
      if (result.isConfirmed && product._id) {
        this.subscription.add(
          this.productService.deleteProduct(product._id).subscribe({
            next: (result) => {
              if (result.success) {
                Swal.fire({
                  icon: 'success',
                  title: 'Eliminado',
                  text: 'El producto ha sido eliminado exitosamente',
                  timer: 2000
                });
              }
            },
            error: (error) => {
              console.error('Error deleting product:', error);
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error || 'Error al eliminar el producto'
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

  getMainImageUrl(product: Product): string {
    return this.productService.getMainImageUrl(product) || 'assets/images/no-image.png';
  }

  refreshProducts(): void {
    this.loadProducts();
  }

  // Permission checks for template
  canCreateProducts(): boolean {
    return this.permissionService.canCreateProducts();
  }

  canEditProducts(): boolean {
    return this.permissionService.canEditProducts();
  }

  canDeleteProducts(): boolean {
    return this.permissionService.canDeleteProducts();
  }
}