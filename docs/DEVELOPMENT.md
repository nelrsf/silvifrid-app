# Guía de Desarrollo - Silvifrid Admin

## Introducción

Esta guía proporciona instrucciones detalladas para desarrolladores que trabajen en el proyecto Silvifrid Admin, incluyendo configuración del entorno, estándares de código, flujos de trabajo y mejores prácticas.

## Configuración del Entorno de Desarrollo

### Requisitos del Sistema

- **Node.js**: 16.x o superior
- **npm**: 7.x o superior  
- **Git**: 2.x o superior
- **Editor**: Visual Studio Code (recomendado)

### Instalación Inicial

```bash
# 1. Clonar el repositorio
git clone https://github.com/nelrsf/silvifrid-app.git
cd silvifrid-app

# 2. Instalar dependencias
npm install

# 3. Instalar Angular CLI globalmente (si no está instalado)
npm install -g @angular/cli@13.3.7

# 4. Verificar instalación
ng version
```

### Configuración de Visual Studio Code

#### Extensiones Recomendadas

```json
{
  "recommendations": [
    "angular.ng-template",
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "angular.ng-template",
    "johnpapa.angular2",
    "ms-vscode.vscode-json"
  ]
}
```

#### Configuración de Workspace (.vscode/settings.json)

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "angular.enableTraceLogging": true,
  "editor.rulers": [100],
  "files.trimTrailingWhitespace": true,
  "files.insertFinalNewline": true
}
```

## Estructura del Proyecto

### Convenciones de Nomenclatura

```
src/app/
├── shared/                 # Módulos y servicios compartidos
│   ├── components/         # Componentes reutilizables
│   ├── services/          # Servicios compartidos
│   ├── models/            # Interfaces y modelos
│   ├── guards/            # Guards de navegación
│   └── pipes/             # Pipes personalizados
├── core/                  # Servicios singleton y configuración
│   ├── services/          # Servicios core (una instancia)
│   ├── interceptors/      # HTTP interceptors
│   └── config/            # Configuraciones
├── features/              # Módulos de funcionalidades
│   ├── auth/              # Módulo de autenticación
│   ├── dashboard/         # Dashboard principal
│   └── users/             # Gestión de usuarios
└── layout/                # Componentes de layout
    ├── header/
    ├── sidebar/
    └── footer/
```

### Nomenclatura de Archivos

| Tipo | Convención | Ejemplo |
|------|------------|---------|
| Componente | `nombre.component.ts` | `user-list.component.ts` |
| Servicio | `nombre.service.ts` | `auth.service.ts` |
| Guard | `nombre.guard.ts` | `auth.guard.ts` |
| Modelo | `nombre.model.ts` | `user.model.ts` |
| Interface | `nombre.interface.ts` | `api-response.interface.ts` |
| Pipe | `nombre.pipe.ts` | `date-format.pipe.ts` |
| Directive | `nombre.directive.ts` | `highlight.directive.ts` |

## Estándares de Código

### TypeScript

#### Configuración TSConfig

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true
  }
}
```

#### Estilo de Código

```typescript
// ✅ Buenas prácticas
export class UserService {
  private readonly apiUrl = environment.apiUrl;
  
  constructor(
    private readonly http: HttpClient,
    private readonly logger: LoggerService
  ) {}

  async getUsers(): Promise<User[]> {
    try {
      const response = await this.http.get<User[]>(`${this.apiUrl}/users`).toPromise();
      return response || [];
    } catch (error) {
      this.logger.error('Error fetching users', error);
      throw error;
    }
  }
}

// ❌ Evitar
export class UserService {
  constructor(private http: any) {} // No usar 'any'

  getUsers() { // Sin tipo de retorno
    return this.http.get('/users'); // URL hardcodeada
  }
}
```

### Angular

#### Componentes

```typescript
// ✅ Estructura recomendada
@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserListComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  
  users$: Observable<User[]>;
  loading = false;
  
  constructor(
    private readonly userService: UserService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadUsers(): void {
    this.loading = true;
    this.users$ = this.userService.getUsers().pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      }),
      takeUntil(this.destroy$)
    );
  }
}
```

#### Servicios

```typescript
// ✅ Servicio bien estructurado
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly baseUrl = `${environment.apiUrl}/users`;
  
  constructor(
    private readonly http: HttpClient,
    private readonly errorHandler: ErrorHandlerService
  ) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.baseUrl).pipe(
      catchError(this.errorHandler.handleError('getUsers'))
    );
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/${id}`).pipe(
      catchError(this.errorHandler.handleError('getUserById'))
    );
  }
}
```

### HTML Templates

```html
<!-- ✅ Template estructurado -->
<div class="user-list-container" *ngIf="users$ | async as users; else loadingTemplate">
  <div class="user-card" 
       *ngFor="let user of users; trackBy: trackByUserId">
    <h3>{{ user.name }}</h3>
    <p>{{ user.email }}</p>
    <button (click)="editUser(user.id)" 
            [attr.aria-label]="'Editar usuario ' + user.name">
      Editar
    </button>
  </div>
</div>

<ng-template #loadingTemplate>
  <div class="loading-spinner">Cargando...</div>
</ng-template>
```

### CSS/SCSS

```scss
// ✅ Estilos organizados
.user-list-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  padding: 1rem;

  .user-card {
    background: var(--card-background);
    border-radius: 8px;
    padding: 1rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    
    &:hover {
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }

    h3 {
      margin: 0 0 0.5rem 0;
      color: var(--text-primary);
    }

    p {
      margin: 0 0 1rem 0;
      color: var(--text-secondary);
    }
  }
}

// Variables CSS
:root {
  --card-background: #ffffff;
  --text-primary: #333333;
  --text-secondary: #666666;
}
```

## Flujo de Trabajo con Git

### Estrategia de Branching

```
main                    # Rama principal - producción
├── develop            # Rama de desarrollo - integración
├── feature/xxx        # Nuevas funcionalidades
├── bugfix/xxx         # Corrección de bugs
├── hotfix/xxx         # Correcciones urgentes en producción
└── release/x.x.x      # Preparación de releases
```

### Convenciones de Commit

```bash
# Formato: <tipo>(<scope>): <descripción>
# 
# Tipos:
# feat:     Nueva funcionalidad
# fix:      Corrección de bug
# docs:     Documentación
# style:    Formato (sin cambios de código)
# refactor: Refactorización
# test:     Tests
# chore:    Tareas de mantenimiento

# Ejemplos:
git commit -m "feat(auth): implementar login con JWT"
git commit -m "fix(user-service): corregir error en validación de email"
git commit -m "docs(readme): actualizar guía de instalación"
git commit -m "refactor(components): simplificar estructura de carpetas"
```

### Workflow de Desarrollo

```bash
# 1. Crear nueva rama feature
git checkout develop
git pull origin develop
git checkout -b feature/nueva-funcionalidad

# 2. Desarrollar y hacer commits
git add .
git commit -m "feat(modulo): agregar nueva funcionalidad"

# 3. Sincronizar con develop
git checkout develop
git pull origin develop
git checkout feature/nueva-funcionalidad
git rebase develop

# 4. Push y crear Pull Request
git push origin feature/nueva-funcionalidad

# 5. Después de aprobación, merge y limpieza
git checkout develop
git pull origin develop
git branch -d feature/nueva-funcionalidad
```

## Testing

### Configuración de Testing

```typescript
// karma.conf.js personalizado
module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      clearContext: false,
      jasmine: {
        random: false // Para tests determinísticos
      }
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage/'),
      reporters: [
        { type: 'html' },
        { type: 'text-summary' },
        { type: 'lcov' }
      ]
    },
    reporters: ['progress', 'coverage'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
    singleRun: false
  });
};
```

### Ejemplos de Tests

#### Test de Componente

```typescript
describe('UserListComponent', () => {
  let component: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;
  let userService: jasmine.SpyObj<UserService>;

  beforeEach(async () => {
    const userServiceSpy = jasmine.createSpyObj('UserService', ['getUsers']);

    await TestBed.configureTestingModule({
      declarations: [UserListComponent],
      imports: [HttpClientTestingModule],
      providers: [
        { provide: UserService, useValue: userServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load users on init', () => {
    const mockUsers = [{ id: '1', name: 'Test User', email: 'test@test.com' }];
    userService.getUsers.and.returnValue(of(mockUsers));

    component.ngOnInit();

    expect(userService.getUsers).toHaveBeenCalled();
    component.users$.subscribe(users => {
      expect(users).toEqual(mockUsers);
    });
  });
});
```

#### Test de Servicio

```typescript
describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should authenticate user successfully', () => {
    const mockResponse = { token: 'fake-jwt-token' };
    const credentials = { userName: 'test', password: 'password' };

    service.auth(credentials.userName, credentials.password).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.api_url}/auth`);
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Authorization')).toContain('Bearer');
    req.flush(mockResponse);
  });
});
```

## Debugging

### Configuración de VS Code para Debugging

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "ng serve",
      "type": "pwa-chrome",
      "request": "launch",
      "preLaunchTask": "npm: start",
      "url": "http://localhost:4300",
      "webRoot": "${workspaceFolder}",
      "sourceMaps": true
    },
    {
      "name": "ng test",
      "type": "pwa-chrome",
      "request": "launch",
      "preLaunchTask": "npm: test",
      "url": "http://localhost:9876/debug.html",
      "webRoot": "${workspaceFolder}",
      "sourceMaps": true
    }
  ]
}
```

### Herramientas de Debugging

```typescript
// Logging service para debugging
@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  private isDevelopment = !environment.production;

  debug(message: string, ...args: any[]): void {
    if (this.isDevelopment) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    console.info(`[INFO] ${message}`, ...args);
  }

  warn(message: string, ...args: any[]): void {
    console.warn(`[WARN] ${message}`, ...args);
  }

  error(message: string, error?: any): void {
    console.error(`[ERROR] ${message}`, error);
  }
}
```

## Performance y Optimización

### Técnicas de Optimización

```typescript
// ✅ OnPush Change Detection
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OptimizedComponent {
  
  // ✅ TrackBy para *ngFor
  trackByUserId(index: number, user: User): string {
    return user.id;
  }

  // ✅ Async pipe para suscripciones
  users$ = this.userService.getUsers();
}
```

### Lazy Loading de Imágenes

```typescript
// Directiva para lazy loading
@Directive({
  selector: '[appLazyLoad]'
})
export class LazyLoadDirective implements OnInit {
  @Input() appLazyLoad: string = '';

  constructor(private el: ElementRef) {}

  ngOnInit() {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = this.appLazyLoad;
          observer.unobserve(img);
        }
      });
    });

    observer.observe(this.el.nativeElement);
  }
}
```

## Seguridad

### Validación de Inputs

```typescript
// Sanitización de inputs
@Component({
  template: `
    <div [innerHTML]="sanitizedContent"></div>
  `
})
export class SafeComponent {
  constructor(private sanitizer: DomSanitizer) {}

  get sanitizedContent() {
    return this.sanitizer.sanitize(SecurityContext.HTML, this.rawContent);
  }
}
```

### HTTP Interceptors

```typescript
@Injectable()
export class SecurityInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Agregar headers de seguridad
    const secureReq = req.clone({
      setHeaders: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block'
      }
    });

    return next.handle(secureReq);
  }
}
```

## Scripts de Desarrollo

### package.json Scripts

```json
{
  "scripts": {
    "start": "ng serve --port 4300",
    "build": "ng build",
    "build:prod": "ng build --configuration production",
    "test": "ng test",
    "test:ci": "ng test --watch=false --browsers=ChromeHeadless --code-coverage",
    "e2e": "ng e2e",
    "lint": "ng lint",
    "lint:fix": "ng lint --fix",
    "analyze": "ng build --stats-json && npx webpack-bundle-analyzer dist/stats.json",
    "clean": "rm -rf node_modules package-lock.json && npm install"
  }
}
```

### Scripts de Automatización

```bash
#!/bin/bash
# scripts/deploy.sh

echo "🚀 Iniciando deploy..."

# Ejecutar tests
npm run test:ci
if [ $? -ne 0 ]; then
  echo "❌ Tests fallidos, cancelando deploy"
  exit 1
fi

# Build de producción
npm run build:prod
if [ $? -ne 0 ]; then
  echo "❌ Build fallido, cancelando deploy"
  exit 1
fi

echo "✅ Deploy completado exitosamente"
```

## Troubleshooting

### Problemas Comunes

| Problema | Solución |
|----------|----------|
| `Cannot resolve dependency` | `rm -rf node_modules && npm install` |
| `Port 4300 already in use` | `lsof -ti:4300 \| xargs kill -9` |
| `Memory heap out of space` | `export NODE_OPTIONS="--max-old-space-size=8192"` |
| Angular CLI version mismatch | `npm uninstall -g @angular/cli && npm install -g @angular/cli@13.3.7` |

### Logs y Debugging

```bash
# Habilitar logs detallados
export DEBUG=*
ng serve --verbose

# Analizar bundle size
ng build --stats-json
npx webpack-bundle-analyzer dist/stats.json

# Verificar dependencias
npm audit
npm outdated
```

Esta guía proporciona un marco completo para el desarrollo eficiente y mantenible del proyecto Silvifrid Admin.