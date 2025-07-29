# Documentación de API y Modelos de Datos

## Introducción

Este documento describe la estructura de datos, los modelos utilizados y la interfaz de comunicación con la API del sistema Silvifrid Admin.

## API Endpoints

### Base URLs

- **Desarrollo**: `http://localhost:4000`
- **Producción**: `https://silvifrid-gateway.vercel.app`

### Autenticación

#### POST /auth

Endpoint para autenticación de usuarios administrativos.

**Headers:**
```http
Authorization: Bearer {encrypted_credentials}
Content-Type: application/json
```

**Request:**
```json
{} // Cuerpo vacío, credenciales van en el header
```

**Encrypted Credentials Format:**
```typescript
// Antes de encriptar
{
  "userName": "string",
  "password": "string"
}

// Proceso de encriptación
const payload = JSON.stringify({userName, password});
const encrypted = CryptoJS.AES.encrypt(payload, environment.secret);
const token = encrypted.toString();
```

**Response Success (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response Error (401):**
```json
{
  "error": "Unauthorized",
  "message": "Invalid credentials"
}
```

**Response Error (500):**
```json
{
  "error": "Internal Server Error",
  "message": "Authentication service unavailable"
}
```

## Estructura del JWT Token

### Header
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

### Payload (Claims)
```json
{
  "id": "uuid-string",
  "userName": "string",
  "name": "string", 
  "position": "string",
  "permissions": ["permission1", "permission2"],
  "permissionsData": [
    {
      "name": "permission1",
      "url": "/module1",
      "hasRedirectProtection": true,
      "caption": "Módulo 1"
    }
  ],
  "iat": 1640995200,
  "exp": 1641081600
}
```

### Verificación de Firma
```typescript
// Algoritmo de verificación personalizado
const [header, payload, signature] = jwt.split(".");
const signInput = `${header}.${payload}`;
const hmac = CryptoJS.HmacSHA256(signInput, environment.secret);
const computedSignature = CryptoJS.enc.Base64url.stringify(hmac);
return computedSignature === signature;
```

## Modelos de Datos

### AdmUser (Usuario Administrativo)

Representa un usuario del sistema administrativo con sus permisos y datos básicos.

```typescript
export class AdmUser {
  private _id!: string;
  private _userName!: string;
  private _name!: string;
  private _position!: string;
  private _permissions!: Array<string>;
  private _permissionsData!: Array<Permission>;

  // Getters y Setters
  public get id(): string { return this._id; }
  public set id(value: string) { this._id = value; }

  public get userName(): string { return this._userName; }
  public set userName(value: string) { this._userName = value; }

  public get name(): string { return this._name; }
  public set name(value: string) { this._name = value; }

  public get position(): string { return this._position; }
  public set position(value: string) { this._position = value; }

  public get permissions(): Array<string> { return this._permissions; }
  public set permissions(value: Array<string>) { this._permissions = value; }

  public get permissionsData(): Array<Permission> { return this._permissionsData; }
  public set permissionsData(value: Array<Permission>) { this._permissionsData = value; }
}
```

#### Propiedades del AdmUser

| Propiedad | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `id` | string | Identificador único del usuario | "123e4567-e89b-12d3-a456-426614174000" |
| `userName` | string | Nombre de usuario para login | "admin.silva" |
| `name` | string | Nombre completo del usuario | "Juan Silva Administrador" |
| `position` | string | Cargo o posición en la organización | "Administrador General" |
| `permissions` | Array<string> | Lista de IDs de permisos | ["menu", "users", "reports"] |
| `permissionsData` | Array<Permission> | Datos completos de permisos | [Permission objects] |

#### Métodos Auxiliares Sugeridos

```typescript
// Extensiones útiles para la clase AdmUser
export class AdmUser {
  // ... propiedades existentes ...

  hasPermission(permissionName: string): boolean {
    return this._permissions?.includes(permissionName) || false;
  }

  getPermissionByName(name: string): Permission | undefined {
    return this._permissionsData?.find(p => p.name === name);
  }

  isAdmin(): boolean {
    return this.hasPermission('admin') || this._position?.toLowerCase().includes('admin');
  }

  getMenuPermissions(): Array<Permission> {
    return this._permissionsData?.filter(p => p.url && p.caption) || [];
  }
}
```

### Permission (Permiso)

Representa un permiso específico que define el acceso a una funcionalidad o módulo.

```typescript
export class Permission {
  private _name!: string;
  private _url!: string;
  private _hasRedirectProtection!: boolean;
  private _caption!: string;

  // Getters y Setters
  public get name(): string { return this._name; }
  public set name(value: string) { this._name = value; }

  public get url(): string { return this._url; }
  public set url(value: string) { this._url = value; }

  public get hasRedirectProtection(): boolean { return this._hasRedirectProtection; }
  public set hasRedirectProtection(value: boolean) { this._hasRedirectProtection = value; }

  public get caption(): string { return this._caption; }
  public set caption(value: string) { this._caption = value; }
}
```

#### Propiedades del Permission

| Propiedad | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `name` | string | Identificador único del permiso | "users_management" |
| `url` | string | URL de destino del módulo | "/admin/users" |
| `hasRedirectProtection` | boolean | Si requiere token en URL para acceso externo | true |
| `caption` | string | Texto descriptivo para mostrar en UI | "Gestión de Usuarios" |

#### Tipos de Permisos

```typescript
// Enumeración sugerida para tipos de permisos
export enum PermissionType {
  MENU = 'menu',
  ADMIN = 'admin', 
  USERS = 'users',
  REPORTS = 'reports',
  SETTINGS = 'settings',
  DASHBOARD = 'dashboard'
}

// Niveles de acceso
export enum AccessLevel {
  READ = 'read',
  WRITE = 'write', 
  DELETE = 'delete',
  ADMIN = 'admin'
}
```

#### Métodos Auxiliares Sugeridos

```typescript
export class Permission {
  // ... propiedades existentes ...

  getSecureUrl(token?: string): string {
    if (this._hasRedirectProtection && token) {
      return `${this._url}?token=${token}`;
    }
    return this._url;
  }

  isExternalLink(): boolean {
    return this._url?.startsWith('http') || false;
  }

  isActive(): boolean {
    return !!(this._name && this._url && this._caption);
  }
}
```

## Interfaces Auxiliares

### AuthResponse
```typescript
export interface AuthResponse {
  token: string;
  refreshToken?: string;
  expiresIn?: number;
  user?: Partial<AdmUser>;
}
```

### LoginRequest
```typescript
export interface LoginRequest {
  userName: string;
  password: string;
  rememberMe?: boolean;
}
```

### ApiError
```typescript
export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
  path: string;
}
```

## Validaciones de Datos

### Validación de AdmUser

```typescript
export class AdmUserValidator {
  static validate(user: AdmUser): ValidationResult {
    const errors: string[] = [];

    if (!user.id || user.id.trim().length === 0) {
      errors.push('ID es requerido');
    }

    if (!user.userName || user.userName.trim().length < 3) {
      errors.push('Nombre de usuario debe tener al menos 3 caracteres');
    }

    if (!user.name || user.name.trim().length === 0) {
      errors.push('Nombre completo es requerido');
    }

    if (!user.permissions || user.permissions.length === 0) {
      errors.push('Usuario debe tener al menos un permiso');
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }
}
```

### Validación de Permission

```typescript
export class PermissionValidator {
  static validate(permission: Permission): ValidationResult {
    const errors: string[] = [];

    if (!permission.name || permission.name.trim().length === 0) {
      errors.push('Nombre del permiso es requerido');
    }

    if (!permission.url || permission.url.trim().length === 0) {
      errors.push('URL es requerida');
    }

    if (!permission.caption || permission.caption.trim().length === 0) {
      errors.push('Caption es requerido');
    }

    // Validar formato de URL
    if (permission.url && !this.isValidUrl(permission.url)) {
      errors.push('Formato de URL inválido');
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  private static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return url.startsWith('/') && url.length > 1;
    }
  }
}
```

## Manejo de Errores de API

### Códigos de Estado HTTP

| Código | Significado | Acción en Frontend |
|--------|-------------|-------------------|
| 200 | OK | Procesar respuesta exitosa |
| 401 | Unauthorized | Redirigir a login |
| 403 | Forbidden | Mostrar página de acceso denegado |
| 404 | Not Found | Mostrar página 404 |
| 500 | Server Error | Mostrar error genérico |

### Interceptor de Errores Sugerido

```typescript
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  
  constructor(private alertService: AlertService, private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        switch (error.status) {
          case 401:
            localStorage.removeItem('token');
            this.router.navigate(['/']);
            break;
          case 403:
            this.router.navigate(['/pages/unauthorized']);
            break;
          case 500:
            this.alertService.showError('Error interno del servidor');
            break;
          default:
            this.alertService.showError('Error de conexión');
        }
        return throwError(error);
      })
    );
  }
}
```

## Configuración de Entornos

### Variables de Entorno

```typescript
export interface Environment {
  production: boolean;
  api_url: string;
  secret: string;
  tokenExpirationTime?: number;
  apiTimeout?: number;
  retryAttempts?: number;
}
```

### Configuración Extendida

```typescript
// environment.ts
export const environment: Environment = {
  production: false,
  api_url: "http://localhost:4000",
  secret: "SILVIA_JULIANA",
  tokenExpirationTime: 24 * 60 * 60 * 1000, // 24 horas
  apiTimeout: 30000, // 30 segundos
  retryAttempts: 3
};
```

## Mejores Prácticas

### 1. Manejo de Tokens
```typescript
// Almacenamiento seguro
class TokenService {
  setToken(token: string): void {
    localStorage.setItem('token', token);
    // Considerar sessionStorage para mayor seguridad
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  removeToken(): void {
    localStorage.removeItem('token');
  }
}
```

### 2. Cache de Datos
```typescript
// Cache simple para permisos
class PermissionCache {
  private cache = new Map<string, Permission[]>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  getPermissions(userId: string): Permission[] | null {
    const cached = this.cache.get(userId);
    if (cached && this.isValidCache(userId)) {
      return cached;
    }
    return null;
  }

  setPermissions(userId: string, permissions: Permission[]): void {
    this.cache.set(userId, permissions);
    this.setCacheTimestamp(userId);
  }
}
```

### 3. Tipado Fuerte
```typescript
// Usar tipos específicos en lugar de 'any'
type AuthState = 'authenticated' | 'unauthenticated' | 'loading';
type PermissionAction = 'read' | 'write' | 'delete' | 'admin';

interface UserSession {
  user: AdmUser;
  token: string;
  expiresAt: Date;
  permissions: Permission[];
}
```

## Pruebas de API

### Testing con Jasmine

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

  it('should authenticate user', () => {
    const mockResponse = { token: 'fake-jwt-token' };
    
    service.auth('testuser', 'password').subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.api_url}/auth`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });
});
```

## Consideraciones de Seguridad

### 1. Almacenamiento de Tokens
- Usar `httpOnly` cookies cuando sea posible
- Considerar `sessionStorage` en lugar de `localStorage`
- Implementar refresh tokens para sesiones largas

### 2. Validación de Datos
- Validar todos los datos del servidor
- Sanitizar inputs del usuario
- Implementar rate limiting en el cliente

### 3. Comunicación Segura
- Usar HTTPS en producción
- Implementar CSRF protection
- Validar certificados SSL

Este documento proporciona una base sólida para el manejo de datos y comunicación con la API en la aplicación Silvifrid Admin.