import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Product, ProductCreateDto, ProductUpdateDto } from '../../../model/product';
import { ProductService } from '../../../services/product.service';
import { ImageService } from '../../../services/image.service';
import { PermissionService } from '../../../services/permission.service';
import Swal from 'sweetalert2';
import { faBox, faInfoCircle, faImages, faTrash, faStar, faExclamationTriangle, faTimes, faSave, faDollarSign } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-product-form',
    templateUrl: './product-form.component.html',
    styleUrls: ['./product-form.component.css'],
    standalone: false
})
export class ProductFormComponent implements OnInit, OnDestroy {
  productForm!: FormGroup;
  isEditMode = false;
  isLoading = false;
  isSaving = false;
  productId: string | null = null;
  currentProduct: Product | null = null;
  
  images: string[] = [];
  selectedDemoImages: string[] = [];
  private subscription: Subscription = new Subscription();

  // FontAwesome icons
  faBox = faBox;
  faInfoCircle = faInfoCircle;
  faImages = faImages;
  faTrash = faTrash;
  faStar = faStar;
  faExclamationTriangle = faExclamationTriangle;
  faTimes = faTimes;
  faSave = faSave;
  faDollarSign = faDollarSign;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private imageService: ImageService,
    private permissionService: PermissionService
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    // Check permissions
    if (!this.permissionService.canCreateProducts() && !this.permissionService.canEditProducts()) {
      Swal.fire({
        icon: 'error',
        title: 'Sin permisos',
        text: 'No tiene permisos para crear o editar productos'
      }).then(() => {
        this.router.navigate(['/products']);
      });
      return;
    }

    this.productId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.productId;
    
    if (this.isEditMode && this.productId) {
      if (!this.permissionService.canEditProducts()) {
        Swal.fire({
          icon: 'error',
          title: 'Sin permisos',
          text: 'No tiene permisos para editar productos'
        }).then(() => {
          this.router.navigate(['/products']);
        });
        return;
      }
      this.loadProduct(this.productId);
    } else {
      if (!this.permissionService.canCreateProducts()) {
        Swal.fire({
          icon: 'error',
          title: 'Sin permisos',
          text: 'No tiene permisos para crear productos'
        }).then(() => {
          this.router.navigate(['/products']);
        });
        return;
      }
      // Load demo images for new products
      this.loadDemoImages();
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private initForm(): void {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      price: [0, [Validators.required, Validators.min(1)]],
      extendedPrice: [0, [Validators.required, Validators.min(1)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]]
    });
  }

  private loadDemoImages(): void {
    this.subscription.add(
      this.imageService.getDemoImages().subscribe({
        next: (demoImages) => {
          this.selectedDemoImages = demoImages;
          // Set first image as default
          if (demoImages.length > 0) {
            this.images = [demoImages[0]];
          }
        },
        error: (error) => {
          console.error('Error loading demo images:', error);
        }
      })
    );
  }

  private loadProduct(id: string): void {
    this.isLoading = true;
    this.subscription.add(
      this.productService.getProductById(id).subscribe({
        next: (product) => {
          this.currentProduct = product;
          this.productForm.patchValue({
            name: product.name,
            price: product.price,
            extendedPrice: product.extendedPrice,
            stock: product.stock,
            description: product.description
          });
          this.images = [...product.images];
          this.isLoading = false;
          
          // Load demo images for additional options
          this.loadDemoImages();
        },
        error: (error) => {
          console.error('Error loading product:', error);
          this.isLoading = false;
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Producto no encontrado'
          }).then(() => {
            this.router.navigate(['/products']);
          });
        }
      })
    );
  }

  onDemoImageSelect(imageUrl: string): void {
    if (!this.images.includes(imageUrl)) {
      this.images.push(imageUrl);
    }
  }

  removeImage(index: number): void {
    this.images.splice(index, 1);
  }

  moveImageToFirst(index: number): void {
    if (index > 0) {
      const [image] = this.images.splice(index, 1);
      this.images.unshift(image);
    }
  }

  getMainImageUrl(): string {
    return this.images.length > 0 ? this.images[0] : '';
  }

  onSubmit(): void {
    if (this.productForm.valid && this.images.length > 0) {
      this.isSaving = true;
      
      const productData: ProductCreateDto | ProductUpdateDto = {
        name: this.productForm.value.name,
        description: this.productForm.value.description,
        price: this.productForm.value.price,
        extendedPrice: this.productForm.value.extendedPrice,
        stock: this.productForm.value.stock,
        images: this.images
      };

      const operation = this.isEditMode && this.productId
        ? this.productService.updateProduct(this.productId, productData as ProductUpdateDto)
        : this.productService.createProduct(productData as ProductCreateDto);

      this.subscription.add(
        operation.subscribe({
          next: (product) => {
            const message = this.isEditMode ? 'actualizado' : 'creado';
            Swal.fire({
              icon: 'success',
              title: 'Éxito',
              text: `Producto ${message} exitosamente`,
              timer: 2000
            }).then(() => {
              this.router.navigate(['/products']);
            });
          },
          error: (error) => {
            console.error('Error saving product:', error);
            this.isSaving = false;
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: error || 'Error al guardar el producto'
            });
          }
        })
      );
    } else {
      this.markFormGroupTouched();
      if (this.images.length === 0) {
        Swal.fire({
          icon: 'warning',
          title: 'Imagen requerida',
          text: 'Debe agregar al menos una imagen del producto'
        });
      }
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.productForm.controls).forEach(key => {
      this.productForm.get(key)?.markAsTouched();
    });
  }

  cancel(): void {
    this.router.navigate(['/products']);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.productForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.productForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${fieldName} es requerido`;
      if (field.errors['minlength']) return `${fieldName} debe tener al menos ${field.errors['minlength'].requiredLength} caracteres`;
      if (field.errors['maxlength']) return `${fieldName} no debe exceder ${field.errors['maxlength'].requiredLength} caracteres`;
      if (field.errors['min']) return `${fieldName} debe ser mayor a ${field.errors['min'].min}`;
    }
    return '';
  }
}