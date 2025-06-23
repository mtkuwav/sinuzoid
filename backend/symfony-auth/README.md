# Sinuzoid Authentication Service 🔐

The authentication microservice for Sinuzoid, built with Symfony 7.2 and PHP. This service handles user registration, login, JWT token management, and user profile operations.

## Features

- 🔐 **JWT Authentication**: Secure token-based authentication
- 👤 **User Management**: Registration, login, profile management
- 🛡️ **Security**: Password hashing, token validation, CORS handling
- 🔗 **API Integration**: RESTful API for microservices communication
- 📊 **User Analytics**: Track user activity and authentication events
- 🌐 **CORS Support**: Proper cross-origin resource sharing configuration

## Technology Stack

- **Symfony 7.2** - Modern PHP framework
- **API Platform** - API development framework
- **Doctrine ORM** - Database abstraction layer
- **LexikJWTAuthenticationBundle** - JWT token management
- **NelmioCorsBundle** - CORS handling
- **PostgreSQL** - Database backend

## Getting Started

### Prerequisites

- PHP 8.2+
- Composer
- PostgreSQL database
- OpenSSL (for JWT key generation)

### Development Setup

1. **Install dependencies**
   ```bash
   composer install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Configure your database and JWT settings
   ```

3. **Generate JWT keys**
   ```bash
   php bin/console lexik:jwt:generate-keypair
   ```

4. **Set up database**
   ```bash
   php bin/console doctrine:database:create
   php bin/console doctrine:migrations:migrate
   ```

5. **Run the application**
   ```bash
   # Development server
   symfony server:start --port=9000
   
   # Or with Docker
   docker compose up auth
   ```

6. **Access the service**
   - API Base: http://localhost:9000
   - API Documentation: http://localhost:9000/api/docs

## Project Structure

```
symfony-auth/
├── composer.json          # PHP dependencies
├── Dockerfile            # Container configuration
├── bin/
│   └── console          # Symfony console commands
├── config/
│   ├── packages/        # Bundle configurations
│   ├── routes/          # Route definitions
│   └── services.yaml    # Service container
├── migrations/          # Database migrations
├── public/
│   └── index.php       # Application entry point
├── src/
│   ├── Controller/     # API controllers
│   ├── Entity/         # Doctrine entities
│   ├── Repository/     # Data repositories
│   ├── Security/       # Security components
│   └── EventListener/ # Event handlers
└── var/
    ├── cache/          # Application cache
    └── log/           # Application logs
```

## API Endpoints

### Authentication

- `POST /api/register` - User registration
- `POST /api/login_check` - User login (get JWT token)
- `POST /api/token/refresh` - Refresh JWT token
- `POST /api/logout` - User logout

### User Management

- `GET /api/user/profile` - Get current user profile
- `PUT /api/user/profile` - Update user profile
- `POST /api/user/change-password` - Change user password
- `DELETE /api/user/account` - Delete user account

### User Administration (Admin only)

- `GET /api/admin/users` - List all users
- `GET /api/admin/users/{id}` - Get specific user
- `PUT /api/admin/users/{id}` - Update user
- `DELETE /api/admin/users/{id}` - Delete user

## Database Entities

### User Entity
```php
class User implements UserInterface
{
    private int $id;
    private string $email;
    private string $password;
    private array $roles = [];
    private ?\DateTimeImmutable $createdAt;
    private ?\DateTimeImmutable $lastLoginAt;
    private bool $isActive = true;
    // ... additional properties
}
```

### UserProfile Entity
```php
class UserProfile
{
    private int $id;
    private User $user;
    private ?string $firstName;
    private ?string $lastName;
    private ?string $avatar;
    private ?\DateTimeImmutable $birthDate;
    // ... additional profile fields
}
```

## Security Configuration

### JWT Configuration
```yaml
# config/packages/lexik_jwt_authentication.yaml
lexik_jwt_authentication:
    secret_key: '%env(resolve:JWT_SECRET_KEY)%'
    public_key: '%env(resolve:JWT_PUBLIC_KEY)%'
    pass_phrase: '%env(JWT_PASSPHRASE)%'
    token_ttl: 3600 # 1 hour
```

### CORS Configuration
```yaml
# config/packages/nelmio_cors.yaml
nelmio_cors:
    defaults:
        origin_regex: true
        allow_origin: ['%env(CORS_ALLOW_ORIGIN)%']
        allow_methods: ['GET', 'OPTIONS', 'POST', 'PUT', 'PATCH', 'DELETE']
        allow_headers: ['Content-Type', 'Authorization']
        expose_headers: ['Link']
        max_age: 3600
```

### Security Configuration
```yaml
# config/packages/security.yaml
security:
    password_hashers:
        App\Entity\User:
            algorithm: auto
    providers:
        app_user_provider:
            entity:
                class: App\Entity\User
                property: email
    firewalls:
        api:
            pattern: ^/api
            stateless: true
            jwt: ~
```

## Controllers

### AuthController
Handles authentication endpoints:
- User registration with validation
- Login with JWT token generation
- Token refresh mechanism
- Logout handling

### UserController
Manages user profile operations:
- Profile retrieval and updates
- Password change functionality
- Account deletion

### AdminController
Administrative functions:
- User management for admins
- System statistics
- User activity monitoring

## Services

### UserService
```php
class UserService
{
    public function registerUser(array $userData): User;
    public function updateProfile(User $user, array $profileData): UserProfile;
    public function changePassword(User $user, string $newPassword): void;
    public function deleteAccount(User $user): void;
}
```

### AuthenticationService
```php
class AuthenticationService
{
    public function authenticateUser(string $email, string $password): ?string;
    public function refreshToken(string $refreshToken): ?string;
    public function validateToken(string $token): bool;
}
```

## Event Listeners

### AuthenticationListener
- Tracks login/logout events
- Updates last login timestamps
- Logs authentication attempts

### UserEventListener
- Handles user lifecycle events
- Sends welcome emails (future feature)
- Cleans up user data on deletion

## Configuration

### Environment Variables
```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# JWT Configuration
JWT_SECRET_KEY=%kernel.project_dir%/config/jwt/private.pem
JWT_PUBLIC_KEY=%kernel.project_dir%/config/jwt/public.pem
JWT_PASSPHRASE=your_jwt_passphrase

# Symfony Configuration
APP_ENV=dev
APP_SECRET=your_app_secret

# CORS
CORS_ALLOW_ORIGIN=^https?://(localhost|127\.0\.0\.1)(:[0-9]+)?$
```

## Database Migrations

Create new migrations:
```bash
php bin/console make:migration
```

Run migrations:
```bash
php bin/console doctrine:migrations:migrate
```

Check migration status:
```bash
php bin/console doctrine:migrations:status
```

## Console Commands

### Custom Commands
```bash
# Create admin user
php bin/console app:create-admin-user

# List all users
php bin/console app:list-users

# Clean expired tokens
php bin/console app:clean-expired-tokens
```

## API Documentation

The service uses API Platform for automatic documentation:
- **API Docs**: Available at `/api/docs`
- **OpenAPI Spec**: Available at `/api/docs.json`

## Testing

### Unit Tests
```bash
php bin/phpunit tests/Unit/
```

### Integration Tests
```bash
php bin/phpunit tests/Integration/
```

### API Tests
```bash
php bin/phpunit tests/Controller/
```

## Security Best Practices

### Password Security
- Uses Symfony's auto password hasher
- Minimum password requirements
- Password change tracking

### Token Security
- Short-lived access tokens (1 hour)
- Refresh token rotation
- Token blacklisting on logout

### Input Validation
- Symfony Validator component
- Email format validation
- Password strength requirements
- XSS protection

## Performance Optimization

### Database Optimization
- Proper indexing on frequently queried fields
- Query optimization with Doctrine
- Connection pooling configuration

### Caching
- Symfony cache component
- JWT token caching
- User session caching

## Logging

Structured logging with Monolog:
- Authentication events
- Error tracking
- Performance metrics
- Security incidents

## Deployment

### Docker Deployment
```bash
# Build image
docker build -t sinuzoid-auth .

# Run with compose
docker compose up auth
```

### Production Configuration
- Set `APP_ENV=prod`
- Configure proper logging levels
- Set up SSL certificates
- Configure rate limiting
- Set up monitoring

## Troubleshooting

### Common Issues

1. **JWT Key Issues**: Ensure keys are generated and permissions are correct
2. **Database Connection**: Check DATABASE_URL configuration
3. **CORS Errors**: Verify CORS_ALLOW_ORIGIN setting
4. **Permission Errors**: Check file permissions for cache and logs
5. **Migration Errors**: Ensure database exists and is accessible

### Debug Mode

Set `APP_ENV=dev` for detailed error messages and debug information.

## Contributing

- Follow PSR-12 coding standards
- Use type declarations for all methods
- Write PHPDoc comments for public APIs
- Add tests for new features
- Update API documentation

## Integration with Other Services

This authentication service integrates with:
- **FastAPI Backend**: Validates JWT tokens for protected endpoints
- **Frontend**: Provides authentication state and user management
- **Database**: Shared PostgreSQL instance for user data consistency
