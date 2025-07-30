import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  // Hardcoded demo image URLs as specified in requirements
  private readonly demoImages: string[] = [
    'https://res.cloudinary.com/dlcfifnqw/image/upload/v1716766165/silvifrid/Productos/victoria%20secret/aqua%20kiss/gma6zkucwdrlbqvipijh.jpg',
    'https://res.cloudinary.com/dlcfifnqw/image/upload/v1716767605/silvifrid/Productos/victoria%20secret/varias/einmgayrrprv2la7prhl.jpg',
    'https://res.cloudinary.com/dlcfifnqw/image/upload/v1716767604/silvifrid/Productos/victoria%20secret/varias/qkdlbxvuo09a4ftjy6gv.jpg'
  ];

  constructor() { }

  /**
   * Get demo images for product
   * Returns all demo images or a subset for variety
   */
  getDemoImages(): Observable<string[]> {
    return of([...this.demoImages]);
  }

  /**
   * Get a single demo image (main image)
   */
  getMainDemoImage(): Observable<string> {
    return of(this.demoImages[0]);
  }

  /**
   * Get random selection of demo images
   * @param count Number of images to return
   */
  getRandomDemoImages(count: number = 3): Observable<string[]> {
    const shuffled = [...this.demoImages].sort(() => 0.5 - Math.random());
    return of(shuffled.slice(0, Math.min(count, this.demoImages.length)));
  }
}