# Spur Backend Setup Guide

## Overview
Spring Boot backend for the Spur social app with PostgreSQL and WebSocket support.

## Prerequisites
- Java 17+
- Maven 3.8+
- PostgreSQL 14+
- Docker (optional)

## Local Development Setup

### 1. Database Setup

#### Using Docker (Recommended)
```bash
docker run --name spur-postgres \
  -e POSTGRES_DB=spur_db \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  postgres:14-alpine
```

#### Manual PostgreSQL
```bash
createdb spur_db
psql spur_db < database/schema.sql
```

### 2. Configuration

Copy the database schema:
```bash
cp database/schema.sql backend/
```

Create `.env` file or set environment variables:
```bash
export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/spur_db
export SPRING_DATASOURCE_USERNAME=postgres
export SPRING_DATASOURCE_PASSWORD=password
export SUPABASE_URL=your_supabase_url
export SUPABASE_API_KEY=your_supabase_api_key
export GOOGLE_CLIENT_ID=your_google_client_id
export GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 3. Build and Run

```bash
cd backend

# Build
mvn clean install

# Run
mvn spring-boot:run
```

The API will be available at: `http://localhost:8080/api`

### 4. API Documentation

Once running, visit:
- **Swagger UI**: http://localhost:8080/api/swagger-ui.html
- **OpenAPI JSON**: http://localhost:8080/api/v3/api-docs

## Architecture

### Core Packages
- `entity/`: JPA entities (User, Status, Friendship, Chat, etc)
- `repository/`: Spring Data JPA repositories
- `service/`: Business logic and operations
- `controller/`: REST API endpoints
- `dto/`: Data transfer objects
- `config/`: Spring configuration classes

### Key Features Implemented

#### 1. Status Management
- Create, retrieve, and expire statuses
- Auto-expiration scheduled task (every 1 minute)
- Double-blind feed logic (only show if user has active status)

#### 2. Double-Blind Feed Query
```sql
-- Only returns statuses from accepted friends
SELECT s FROM Status s
WHERE s.userId IN (
  SELECT CASE 
    WHEN f.userIdA = :userId THEN f.userIdB
    ELSE f.userIdA
  END
  FROM Friendship f
  WHERE (f.userIdA = :userId OR f.userIdB = :userId)
  AND f.status = 'ACCEPTED'
)
AND s.isActive = true
AND s.expiresAt > :now
```

#### 3. Friendship Management
- Friend requests (pending/accepted/blocked)
- Max 20 friends limit enforcement
- Bidirectional friendship queries

#### 4. Chat Management
- 1-on-1 ephemeral chats
- Auto-expiration with status
- Cascade message deletion

## Deployment

### AWS Deployment
```bash
# Build Docker image
docker build -t spur-backend .

# Push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin [ACCOUNT_ID].dkr.ecr.us-east-1.amazonaws.com
docker tag spur-backend:latest [ACCOUNT_ID].dkr.ecr.us-east-1.amazonaws.com/spur-backend:latest
docker push [ACCOUNT_ID].dkr.ecr.us-east-1.amazonaws.com/spur-backend:latest

# Deploy to ECS/EC2
# ... (infrastructure-as-code configuration)
```

### Environment Variables (Production)
```bash
SPRING_DATASOURCE_URL=jdbc:postgresql://[RDS_ENDPOINT]:5432/spur_db
SPRING_DATASOURCE_USERNAME=admin
SPRING_DATASOURCE_PASSWORD=[STRONG_PASSWORD]
SUPABASE_URL=[SUPABASE_URL]
SUPABASE_API_KEY=[API_KEY]
GOOGLE_CLIENT_ID=[CLIENT_ID]
GOOGLE_CLIENT_SECRET=[CLIENT_SECRET]
APP_JWT_SECRET=[GENERATED_SECRET_KEY]
```

## Testing

### Unit Tests
```bash
mvn test
```

### Integration Tests
```bash
mvn verify
```

## Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
psql -U postgres -d spur_db -c "SELECT 1"

# Check Spring logs
tail -f logs/spring.log | grep -i error
```

### JWT Token Issues
- Ensure `X-User-Id` header is present in requests
- Verify JWT secret in `.env` matches Supabase JWT secret

### Port Already in Use
```bash
# Kill process on port 8080
lsof -ti:8080 | xargs kill -9
```

## API Examples

### Create Status
```bash
curl -X POST http://localhost:8080/api/statuses \
  -H "Content-Type: application/json" \
  -H "X-User-Id: 550e8400-e29b-41d4-a716-446655440000" \
  -d '{
    "type": "FREE_NOW",
    "energyLevel": "HIGH",
    "durationMinutes": 60,
    "location": "Downtown"
  }'
```

### Get Feed
```bash
curl http://localhost:8080/api/statuses/feed \
  -H "X-User-Id: 550e8400-e29b-41d4-a716-446655440000"
```

### Expire Status
```bash
curl -X DELETE http://localhost:8080/api/statuses/[STATUS_ID] \
  -H "X-User-Id: 550e8400-e29b-41d4-a716-446655440000"
```

## Performance Optimization

### Indexed Columns
- `statuses.expires_at` - For expiration queries
- `statuses.user_id` - For user lookups
- `friendships.status` - For friend filtering
- `messages.created_at` - For message sorting

### Query Optimization
- Use JPA projections for large result sets
- Implement pagination for API endpoints
- Cache frequently accessed data (Redis)

## Monitoring

### Health Check
```bash
curl http://localhost:8080/api/health
```

### Metrics (if Actuator enabled)
```bash
curl http://localhost:8080/api/actuator/metrics
```

## Additional Resources

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [JPA Documentation](https://spring.io/projects/spring-data-jpa)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc7519)
