import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Product, ProductImage } from '../../../model/product';
import { ProductService } from '../../../services/product.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.css']
})
export class ProductFormComponent implements OnInit, OnDestroy {
  productForm!: FormGroup;
  isEditMode = false;
  isLoading = false;
  isSaving = false;
  productId: string | null = null;
  currentProduct: Product | null = null;
  
  images: ProductImage[] = [];
  private subscription: Subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.productId;
    
    if (this.isEditMode && this.productId) {
      this.loadProduct(this.productId);
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private initForm(): void {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      price: [0, [Validators.required, Validators.min(1)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]]
    });
  }

  private loadProduct(id: string): void {
    this.isLoading = true;
    this.currentProduct = this.productService.getProductById(id) || null;
    
    if (this.currentProduct) {
      this.productForm.patchValue({
        name: this.currentProduct.name,
        price: this.currentProduct.price,
        description: this.currentProduct.description
      });
      this.images = [...this.currentProduct.images];
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

  onImageFileSelected(event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (this.isValidImageFile(file)) {
          this.processImageFile(file);
        }
      }
    }
  }

  private isValidImageFile(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      Swal.fire({
        icon: 'error',
        title: 'Tipo de archivo no válido',
        text: 'Solo se permiten archivos de imagen (JPEG, PNG, GIF, WebP)'
      });
      return false;
    }

    if (file.size > maxSize) {
      Swal.fire({
        icon: 'error',
        title: 'Archivo muy grande',
        text: 'El archivo no debe superar los 5MB'
      });
      return false;
    }

    return true;
  }

  private async processImageFile(file: File): Promise<void> {
    try {
      const imageId = await this.productService.saveImageToStorage(file);
      const newImage: ProductImage = {
        id: imageId,
        url: imageId, // Store the imageId as URL, will be resolved by service
        isMain: this.images.length === 0, // First image is main
        file: file
      };
      
      // If this is set as main, unset others
      if (newImage.isMain) {
        this.images.forEach(img => img.isMain = false);
      }
      
      this.images.push(newImage);
    } catch (error) {
      console.error('Error processing image:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al procesar la imagen'
      });
    }
  }

  setMainImage(imageId: string): void {
    this.images.forEach(img => {
      img.isMain = img.id === imageId;
    });
  }

  removeImage(imageId: string): void {
    const imageIndex = this.images.findIndex(img => img.id === imageId);
    if (imageIndex > -1) {
      const removedImage = this.images[imageIndex];
      this.images.splice(imageIndex, 1);
      
      // If we removed the main image, make the first remaining image main
      if (removedImage.isMain && this.images.length > 0) {
        this.images[0].isMain = true;
      }
    }
  }

  getImageUrl(image: ProductImage): string {
    if (image.url.startsWith('img_')) {
      return this.productService.getImageUrl(image.url);
    }
    return image.url;
  }

  onSubmit(): void {
    if (this.productForm.valid && this.images.length > 0) {
      this.isSaving = true;
      
      const productData = {
        ...this.productForm.value,
        images: this.images
      };

      const operation = this.isEditMode && this.productId
        ? this.productService.updateProduct(this.productId, productData)
        : this.productService.createProduct(productData);

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
              text: 'Error al guardar el producto'
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