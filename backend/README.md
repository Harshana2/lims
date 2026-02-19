# LIMS Backend - Spring Boot REST API

Laboratory Information Management System (LIMS) backend built with Spring Boot 4.0.2, PostgreSQL, and JWT authentication.

## 🚀 Technology Stack

- **Java**: 17
- **Spring Boot**: 4.0.2
- **Database**: PostgreSQL
- **Security**: Spring Security + JWT (jjwt 0.11.5)
- **ORM**: Spring Data JPA + Hibernate
- **Build Tool**: Maven
- **Additional**: Lombok, Validation

## 📋 Prerequisites

- Java 17 or higher
- PostgreSQL 12 or higher
- Maven 3.8+ (or use included Maven wrapper)
- IDE (IntelliJ IDEA, Eclipse, or VS Code with Java extensions)

## 🛠️ Setup Instructions

### 1. Database Setup

Create PostgreSQL database:

```bash
psql -U postgres
CREATE DATABASE lims_db;
CREATE USER lims_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE lims_db TO lims_user;
\q
```

### 2. Configure Application

Update `src/main/resources/application.properties` with your database credentials:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/lims_db
spring.datasource.username=lims_user
spring.datasource.password=your_password
```

### 3. Build and Run

Using Maven wrapper (recommended):

```bash
# Windows
.\mvnw clean install
.\mvnw spring-boot:run

# Linux/Mac
./mvnw clean install
./mvnw spring-boot:run
```

Or using Maven:

```bash
mvn clean install
mvn spring-boot:run
```

The application will start on `http://localhost:8080/api`

## 📁 Project Structure

```
backend/
├── src/main/java/com/lindel/lindel/
│   ├── controller/          # REST API endpoints
│   │   ├── AuthController.java
│   │   ├── CRFController.java
│   │   ├── RequestController.java
│   │   ├── QuotationController.java
│   │   └── SampleController.java
│   ├── service/             # Business logic
│   │   ├── AuthService.java
│   │   ├── CRFService.java
│   │   ├── RequestService.java
│   │   ├── QuotationService.java
│   │   └── SampleService.java
│   ├── repository/          # Data access layer
│   │   ├── UserRepository.java
│   │   ├── CRFRepository.java
│   │   ├── RequestRepository.java
│   │   └── ...
│   ├── entity/              # JPA entities
│   │   ├── User.java
│   │   ├── CRF.java
│   │   ├── Request.java
│   │   ├── Quotation.java
│   │   ├── Sample.java
│   │   ├── TestParameter.java
│   │   ├── EnvironmentalSampling.java
│   │   ├── AuditLog.java
│   │   └── Chemist.java
│   ├── dto/                 # Data Transfer Objects
│   │   ├── LoginRequest.java
│   │   ├── LoginResponse.java
│   │   ├── RegisterRequest.java
│   │   └── ApiResponse.java
│   ├── security/            # Security configuration
│   │   ├── SecurityConfig.java
│   │   ├── JwtUtil.java
│   │   ├── JwtAuthenticationFilter.java
│   │   └── CustomUserDetailsService.java
│   ├── exception/           # Exception handling
│   │   ├── GlobalExceptionHandler.java
│   │   └── ResourceNotFoundException.java
│   └── LindelApplication.java  # Main application class
└── src/main/resources/
    └── application.properties
```

## 🔐 API Endpoints

### Authentication (Public)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/register` | User registration |

**Login Request:**
```json
{
  "username": "admin",
  "password": "password123"
}
```

**Login Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "type": "Bearer",
    "username": "admin",
    "name": "Administrator",
    "email": "admin@example.com",
    "role": "ADMIN"
  }
}
```

### CRF Management (Protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/crf` | Get all CRFs |
| GET | `/api/crf/{id}` | Get CRF by ID |
| GET | `/api/crf/crfId/{crfId}` | Get CRF by CRF ID |
| GET | `/api/crf/status/{status}` | Get CRFs by status |
| GET | `/api/crf/customer/{customer}` | Search CRFs by customer |
| POST | `/api/crf` | Create new CRF |
| PUT | `/api/crf/{id}` | Update CRF |
| PATCH | `/api/crf/{id}/status?status=submitted` | Update CRF status |
| DELETE | `/api/crf/{id}` | Delete CRF |

### Request Management (Protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/requests` | Get all requests |
| GET | `/api/requests/{id}` | Get request by ID |
| GET | `/api/requests/status/{status}` | Get requests by status |
| POST | `/api/requests` | Create new request |
| PUT | `/api/requests/{id}` | Update request |
| PATCH | `/api/requests/{id}/status?status=approved` | Update request status |
| DELETE | `/api/requests/{id}` | Delete request |

### Quotation Management (Protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/quotations` | Get all quotations |
| GET | `/api/quotations/{id}` | Get quotation by ID |
| GET | `/api/quotations/request/{requestId}` | Get quotations by request |
| POST | `/api/quotations` | Create new quotation |
| PUT | `/api/quotations/{id}` | Update quotation |
| PATCH | `/api/quotations/{id}/status?status=approved` | Update quotation status |

### Sample Management (Protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/samples` | Get all samples |
| GET | `/api/samples/{id}` | Get sample by ID |
| GET | `/api/samples/crf/{crfId}` | Get samples by CRF |
| GET | `/api/samples/chemist/{chemist}` | Get samples by chemist |
| PATCH | `/api/samples/{id}/assign?chemist=John` | Assign sample to chemist |
| PATCH | `/api/samples/{id}/test-values` | Update test values |
| PUT | `/api/samples/{id}` | Update sample |

## 🔒 Authentication

All endpoints except `/api/auth/**` require JWT authentication.

**Include the JWT token in the Authorization header:**

```
Authorization: Bearer <your-jwt-token>
```

## 🗄️ Database Schema

The application uses JPA with `spring.jpa.hibernate.ddl-auto=update` which automatically creates/updates tables:

- **users** - User accounts and authentication
- **crfs** - Customer Request Forms
- **requests** - Service requests
- **quotations** - Quotations with items
- **samples** - Individual samples with test values
- **test_parameters** - Test parameters catalog
- **environmental_sampling** - Environmental sampling data
- **audit_logs** - System audit trail
- **chemists** - Chemist management

## 🔧 Configuration

Key configuration properties in `application.properties`:

```properties
# Server
server.port=8080
server.servlet.context-path=/api

# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/lims_db
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# JWT
jwt.secret=your-256-bit-secret-key-change-this-in-production
jwt.expiration=86400000

# File Upload
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB

# CORS
allowed.origins=http://localhost:5173,http://localhost:3000
```

## 🧪 Testing

Create a test user:

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123",
    "name": "Test User",
    "email": "test@example.com",
    "role": "USER"
  }'
```

Login and get token:

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

Use the token for authenticated requests:

```bash
curl -X GET http://localhost:8080/api/crf \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📦 Building for Production

Create production JAR/WAR:

```bash
mvn clean package -DskipTests
```

The built artifact will be in `target/` directory.

Run the production build:

```bash
java -jar target/lindel-0.0.1-SNAPSHOT.war
```

## 🔍 Troubleshooting

### Port already in use
Change the port in `application.properties`:
```properties
server.port=8081
```

### Database connection errors
- Verify PostgreSQL is running: `pg_isready`
- Check database exists: `psql -U postgres -l`
- Verify credentials in `application.properties`

### JWT token errors
- Ensure the `jwt.secret` is at least 256 bits (32 characters)
- Check token is included in Authorization header
- Verify token hasn't expired (default: 24 hours)

## 🤝 Frontend Integration

The React frontend at `http://localhost:5173` is already configured in CORS.

API base URL in frontend: `http://localhost:8080/api`

## 📝 License

This project is part of the LIMS (Laboratory Information Management System) application.

---

**Created with ❤️ using Spring Boot 4.0.2**
