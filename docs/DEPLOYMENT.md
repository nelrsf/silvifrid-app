# Guía de Despliegue - Silvifrid Admin

## Introducción

Esta guía cubre todos los aspectos del despliegue de la aplicación Silvifrid Admin, desde la preparación del entorno hasta el monitoreo en producción.

## Estrategias de Despliegue

### Entornos

| Entorno | Propósito | URL | Branch |
|---------|-----------|-----|--------|
| **Desarrollo** | Desarrollo local | `http://localhost:4300` | `develop` |
| **Staging** | Testing y QA | `https://staging.silvifrid.app` | `staging` |
| **Producción** | Aplicación en vivo | `https://admin.silvifrid.app` | `main` |

### Flujo de Despliegue

```mermaid
graph LR
    A[Desarrollo Local] --> B[Push a develop]
    B --> C[Deploy Automático a Staging]
    C --> D[Testing QA]
    D --> E[Merge a main]
    E --> F[Deploy a Producción]
    F --> G[Monitoreo]
```

## Preparación para Producción

### 1. Configuración de Entorno

#### Variables de Entorno de Producción

```typescript
// src/environments/environment.prod.ts
export const environment = {
  production: true,
  api_url: "[API_URL]",
  secret: "[SECRET_KEY]", // Cambiar en producción
  version: "1.0.0",
  buildDate: new Date().toISOString(),
  enableAnalytics: true,
  logLevel: "error",
  cacheTimeout: 300000, // 5 minutos
  apiTimeout: 10000 // 10 segundos
};
```

### 2. Optimización del Build

#### Configuración Angular.json para Producción

La configuración de producción en angular.json incluye:
- Reemplazo de archivos de entorno (development → production)
- Optimización y minificación de código
- Hashing de archivos de salida para cache busting
- Configuración de budgets para control de tamaño
- Extracción de licencias y optimización de chunks

### 3. Script de Build Optimizado

```bash
#!/bin/bash
# scripts/build-prod.sh

echo "🏗️  Iniciando build de producción..."

# Limpiar directorio de salida
rm -rf dist/

# Build con optimizaciones
ng build --configuration production \
  --optimization=true \
  --aot=true \
  --build-optimizer=true \
  --vendor-chunk=false \
  --source-map=false

# Verificar tamaño del bundle
echo "📊 Análisis de tamaño:"
du -sh dist/*

# Generar reporte de bundle
ng build --configuration production --stats-json
npx webpack-bundle-analyzer dist/stats.json --mode static --report dist/bundle-report.html

echo "✅ Build completado"
```

## Opciones de Despliegue

### 1. Vercel (Recomendado)

#### Configuración vercel.json

```json
{
  "version": 2,
  "name": "silvifrid-admin",
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist/silvifrid-admin"
      }
    }
  ],
  "routes": [
    {
      "handle": "filesystem"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    },
    {
      "source": "/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

#### Scripts de Vercel

```json
{
  "scripts": {
    "vercel-build": "ng build --configuration production"
  }
}
```

#### Deploy Automático

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy de staging
vercel --prod=false

# Deploy de producción
vercel --prod
```

### 2. Netlify

#### netlify.toml

```toml
[build]
  publish = "dist/silvifrid-admin"
  command = "npm run build:prod"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "16"
  NPM_VERSION = "7"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"

[[headers]]
  for = "/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### 3. GitHub Pages

#### Workflow GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v3
      
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '16'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build
      run: npm run build:prod
      
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist/silvifrid-admin
```

### 4. AWS S3 + CloudFront

#### Script de Deploy a AWS

```bash
#!/bin/bash
# scripts/deploy-aws.sh

# Variables
BUCKET_NAME="silvifrid-admin-prod"
DISTRIBUTION_ID="E1234567890"
REGION="us-east-1"

echo "🚀 Desplegando a AWS S3..."

# Build de producción
npm run build:prod

# Sincronizar con S3
aws s3 sync dist/silvifrid-admin/ s3://$BUCKET_NAME/ \
  --region $REGION \
  --delete \
  --cache-control "max-age=31536000" \
  --exclude "index.html"

# Index.html sin cache
aws s3 cp dist/silvifrid-admin/index.html s3://$BUCKET_NAME/index.html \
  --region $REGION \
  --cache-control "no-cache"

# Invalidar CloudFront
aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --paths "/*"

echo "✅ Deploy completado"
```

## CI/CD con GitHub Actions

### Workflow Completo

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  NODE_VERSION: '16'
  
jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
      
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run linter
      run: npm run lint
      
    - name: Run tests
      run: npm run test:ci
      
    - name: Upload coverage reports
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
        
  build:
    needs: test
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
      
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build application
      run: npm run build:prod
      
    - name: Upload build artifacts
      uses: actions/upload-artifact@v3
      with:
        name: build-files
        path: dist/
        
  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    
    steps:
    - name: Download build artifacts
      uses: actions/download-artifact@v3
      with:
        name: build-files
        path: dist/
        
    - name: Deploy to staging
      run: |
        # Deploy a staging (Vercel, Netlify, etc.)
        echo "Deploying to staging..."
        
  deploy-production:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    environment: production
    
    steps:
    - name: Download build artifacts
      uses: actions/download-artifact@v3
      with:
        name: build-files
        path: dist/
        
    - name: Deploy to production
      run: |
        # Deploy a producción
        echo "Deploying to production..."
```

## Configuración de Servidores

### Nginx

```nginx
# /etc/nginx/sites-available/silvifrid-admin
server {
    listen 80;
    server_name admin.silvifrid.app;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name admin.silvifrid.app;
    
    # SSL Configuration
    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # Root directory
    root /var/www/silvifrid-admin;
    index index.html;
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    
    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Handle Angular routing
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API proxy (opcional)
    location /api/ {
        proxy_pass https://silvifrid-gateway.vercel.app/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Apache

```apache
# .htaccess
<IfModule mod_rewrite.c>
    RewriteEngine On
    
    # Handle Angular routing
    RewriteBase /
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</IfModule>

# Security headers
<IfModule mod_headers.c>
    Header always set X-Frame-Options "DENY"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set X-Content-Type-Options "nosniff"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>

# Cache static assets
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/ico "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
    ExpiresByType font/woff "access plus 1 year"
    ExpiresByType font/woff2 "access plus 1 year"
</IfModule>
```

## Docker

### Dockerfile

```dockerfile
# Multi-stage build
FROM node:16-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build:prod

# Production stage
FROM nginx:alpine

# Copy built application
COPY --from=builder /app/dist/silvifrid-admin /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  silvifrid-admin:
    build: .
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.silvifrid-admin.rule=Host(`admin.silvifrid.app`)"
      - "traefik.http.routers.silvifrid-admin.tls=true"
      - "traefik.http.routers.silvifrid-admin.tls.certresolver=letsencrypt"

networks:
  default:
    external:
      name: traefik
```

## Monitoreo y Logs

### Configuración de Analytics

```typescript
// src/app/services/analytics.service.ts
@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  
  constructor() {
    if (environment.production && environment.enableAnalytics) {
      this.initializeAnalytics();
    }
  }

  private initializeAnalytics(): void {
    // Google Analytics
    (window as any).gtag('config', 'GA_MEASUREMENT_ID');
    
    // Hotjar
    (window as any).hj = (window as any).hj || function() {
      ((window as any).hj.q = (window as any).hj.q || []).push(arguments);
    };
  }

  trackEvent(action: string, category: string, label?: string): void {
    if (environment.production) {
      (window as any).gtag('event', action, {
        event_category: category,
        event_label: label
      });
    }
  }

  trackPageView(page: string): void {
    if (environment.production) {
      (window as any).gtag('config', 'GA_MEASUREMENT_ID', {
        page_path: page
      });
    }
  }
}
```

### Error Tracking

```typescript
// src/app/services/error-tracking.service.ts
@Injectable({
  providedIn: 'root'
})
export class ErrorTrackingService {

  logError(error: any, context?: string): void {
    const errorInfo = {
      message: error.message || 'Unknown error',
      stack: error.stack,
      context: context,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    };

    if (environment.production) {
      // Enviar a servicio de tracking (Sentry, LogRocket, etc.)
      this.sendToTrackingService(errorInfo);
    } else {
      console.error('Error:', errorInfo);
    }
  }

  private sendToTrackingService(errorInfo: any): void {
    // Implementar envío a servicio de tracking
    // Ejemplo: Sentry.captureException(errorInfo);
  }
}
```

### Health Check

```typescript
// src/app/services/health-check.service.ts
@Injectable({
  providedIn: 'root'
})
export class HealthCheckService {

  constructor(private http: HttpClient) {}

  checkApiHealth(): Observable<boolean> {
    return this.http.get(`${environment.api_url}/health`).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  getSystemInfo(): any {
    return {
      version: environment.version,
      buildDate: environment.buildDate,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString()
    };
  }
}
```

## Rollback y Recuperación

### Estrategia de Rollback

```bash
#!/bin/bash
# scripts/rollback.sh

PREVIOUS_VERSION=$1

if [ -z "$PREVIOUS_VERSION" ]; then
  echo "❌ Especifica la versión a la cual hacer rollback"
  exit 1
fi

echo "🔄 Iniciando rollback a versión $PREVIOUS_VERSION..."

# Verificar que la versión existe
if git tag | grep -q "$PREVIOUS_VERSION"; then
  echo "✅ Versión encontrada"
else
  echo "❌ Versión no encontrada"
  exit 1
fi

# Checkout a la versión anterior
git checkout $PREVIOUS_VERSION

# Build y deploy
npm ci
npm run build:prod

# Deploy (dependiendo de la plataforma)
# vercel --prod
# o aws s3 sync...

echo "✅ Rollback completado"
```

### Backup Automático

```bash
#!/bin/bash
# scripts/backup.sh

BACKUP_DIR="/backups/silvifrid-admin"
DATE=$(date +%Y%m%d_%H%M%S)

echo "💾 Creando backup..."

# Crear directorio de backup
mkdir -p $BACKUP_DIR

# Comprimir build actual
tar -czf "$BACKUP_DIR/backup_$DATE.tar.gz" dist/

# Mantener solo los últimos 10 backups
cd $BACKUP_DIR
ls -t backup_*.tar.gz | tail -n +11 | xargs -r rm

echo "✅ Backup creado: backup_$DATE.tar.gz"
```

## Checklist de Despliegue

### Pre-despliegue

- [ ] Ejecutar tests unitarios
- [ ] Ejecutar tests e2e
- [ ] Verificar configuración de entorno
- [ ] Actualizar versión en package.json
- [ ] Verificar tamaño del bundle
- [ ] Revisar logs de errores
- [ ] Backup de versión actual

### Despliegue

- [ ] Build de producción exitoso
- [ ] Deploy a staging
- [ ] Testing en staging
- [ ] Aprobación para producción
- [ ] Deploy a producción
- [ ] Verificar funcionalidad crítica

### Post-despliegue

- [ ] Verificar aplicación en vivo
- [ ] Monitorear logs de errores
- [ ] Verificar métricas de performance
- [ ] Notificar al equipo
- [ ] Actualizar documentación
- [ ] Crear tag de release

## Troubleshooting de Despliegue

### Problemas Comunes

| Problema | Síntoma | Solución |
|----------|---------|----------|
| **Bundle muy grande** | Warning de Angular CLI | Optimizar imports, lazy loading |
| **404 en rutas** | Error al navegar | Configurar rewrite rules |
| **SSL/HTTPS** | Certificado inválido | Verificar configuración SSL |
| **CORS** | Error en requests API | Configurar headers CORS |
| **Cache** | Cambios no visibles | Invalidar cache, versioning |

### Scripts de Diagnóstico

```bash
#!/bin/bash
# scripts/diagnose.sh

echo "🔍 Diagnóstico del sistema..."

# Verificar URL
echo "📡 Verificando conectividad..."
curl -I https://admin.silvifrid.app

# Verificar API
echo "🔌 Verificando API..."
curl -I https://silvifrid-gateway.vercel.app/health

# Verificar tamaño de archivos
echo "📊 Tamaño de archivos estáticos..."
find dist/ -name "*.js" -exec du -h {} \;

# Verificar configuración DNS
echo "🌐 Verificando DNS..."
nslookup admin.silvifrid.app

echo "✅ Diagnóstico completado"
```

Esta guía proporciona un marco completo para el despliegue seguro y eficiente de la aplicación Silvifrid Admin en diversos entornos.