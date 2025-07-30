export interface ProductImage {
  id: string;
  url: string;
  isMain: boolean;
  file?: File;
}

export class Product {
  private _id!: string;
  private _code!: string;
  private _name!: string;
  private _price!: number;
  private _description!: string;
  private _images!: ProductImage[];
  private _createdAt!: Date;
  private _updatedAt!: Date;

  constructor() {
    this._id = this.generateId();
    this._code = this.generateCode();
    this._images = [];
    this._createdAt = new Date();
    this._updatedAt = new Date();
  }

  public get id(): string {
    return this._id;
  }
  public set id(value: string) {
    this._id = value;
  }

  public get code(): string {
    return this._code;
  }
  public set code(value: string) {
    this._code = value;
  }

  public get name(): string {
    return this._name;
  }
  public set name(value: string) {
    this._name = value;
    this._updatedAt = new Date();
  }

  public get price(): number {
    return this._price;
  }
  public set price(value: number) {
    this._price = value;
    this._updatedAt = new Date();
  }

  public get description(): string {
    return this._description;
  }
  public set description(value: string) {
    this._description = value;
    this._updatedAt = new Date();
  }

  public get images(): ProductImage[] {
    return this._images;
  }
  public set images(value: ProductImage[]) {
    this._images = value;
    this._updatedAt = new Date();
  }

  public get createdAt(): Date {
    return this._createdAt;
  }
  public set createdAt(value: Date) {
    this._createdAt = value;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }
  public set updatedAt(value: Date) {
    this._updatedAt = value;
  }

  public get mainImage(): ProductImage | undefined {
    return this._images.find(img => img.isMain) || this._images[0];
  }

  public get secondaryImages(): ProductImage[] {
    return this._images.filter(img => !img.isMain);
  }

  private generateId(): string {
    return 'prod_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  private generateCode(): string {
    const prefix = 'SVF';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substr(2, 3).toUpperCase();
    return `${prefix}${timestamp}${random}`;
  }

  public addImage(imageUrl: string, isMain: boolean = false): void {
    const imageId = 'img_' + Math.random().toString(36).substr(2, 9);
    
    // If this is the first image, make it main
    if (this._images.length === 0) {
      isMain = true;
    }
    
    // If setting as main, unset other main images
    if (isMain) {
      this._images.forEach(img => img.isMain = false);
    }

    this._images.push({
      id: imageId,
      url: imageUrl,
      isMain: isMain
    });
    
    this._updatedAt = new Date();
  }

  public removeImage(imageId: string): void {
    const imageIndex = this._images.findIndex(img => img.id === imageId);
    if (imageIndex > -1) {
      const removedImage = this._images[imageIndex];
      this._images.splice(imageIndex, 1);
      
      // If we removed the main image, make the first remaining image main
      if (removedImage.isMain && this._images.length > 0) {
        this._images[0].isMain = true;
      }
    }
    this._updatedAt = new Date();
  }

  public setMainImage(imageId: string): void {
    this._images.forEach(img => {
      img.isMain = img.id === imageId;
    });
    this._updatedAt = new Date();
  }

  public static fromJSON(json: any): Product {
    const product = new Product();
    product._id = json._id || json.id;
    product._code = json._code || json.code;
    product._name = json._name || json.name;
    product._price = json._price || json.price;
    product._description = json._description || json.description;
    product._images = json._images || json.images || [];
    product._createdAt = new Date(json._createdAt || json.createdAt);
    product._updatedAt = new Date(json._updatedAt || json.updatedAt);
    return product;
  }

  public toJSON(): any {
    return {
      id: this._id,
      code: this._code,
      name: this._name,
      price: this._price,
      description: this._description,
      images: this._images,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt
    };
  }
}