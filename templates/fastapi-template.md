# FastAPI Microservice Template

This template follows Python microservice generation standards based on MCP server configurations.

## Project Structure

```
{project_name}/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI application entry point
│   ├── api/                    # API layer (routers)
│   │   ├── __init__.py
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   └── {entity}_routes.py
│   │   └── dependencies.py
│   ├── core/                   # Core configuration
│   │   ├── __init__.py
│   │   ├── config.py           # Settings and configuration
│   │   ├── security.py         # Authentication/authorization
│   │   └── middleware.py
│   ├── models/                 # Domain models (Pydantic)
│   │   ├── __init__.py
│   │   ├── domain/
│   │   │   ├── __init__.py
│   │   │   └── {entity}.py
│   │   └── schemas/            # Request/Response schemas
│   │       ├── __init__.py
│   │       ├── requests.py
│   │       └── responses.py
│   ├── services/               # Business logic layer
│   │   ├── __init__.py
│   │   └── {entity}_service.py
│   ├── repositories/           # Data layer
│   │   ├── __init__.py
│   │   └── {entity}_repository.py
│   └── db/                     # Database configuration
│       ├── __init__.py
│       ├── session.py
│       └── base.py
├── tests/
│   ├── __init__.py
│   ├── conftest.py
│   ├── unit/
│   │   ├── __init__.py
│   │   └── test_{entity}_service.py
│   ├── integration/
│   │   ├── __init__.py
│   │   └── test_{entity}_api.py
│   └── fixtures/
│       ├── __init__.py
│       └── {entity}_fixtures.py
├── migrations/                  # Alembic migrations
│   └── versions/
├── requirements.txt
├── requirements-dev.txt
├── pyproject.toml              # Poetry configuration
├── .env.example
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── pytest.ini
├── .pre-commit-config.yaml
└── README.md
```

## Core Files

### app/main.py
FastAPI application with:
- OpenAPI/Swagger documentation
- CORS middleware
- Exception handlers
- Health check endpoints
- Routers registration

### app/core/config.py
Settings management using Pydantic BaseSettings:
- Environment variables
- Database configuration
- CORS settings
- Security settings

### app/api/routes/{entity}_routes.py
REST API endpoints with:
- OpenAPI annotations
- Request/response models
- Dependency injection
- Input validation

### app/models/schemas/
Pydantic models for:
- Request validation
- Response serialization
- Type hints
- API documentation

### app/services/{entity}_service.py
Business logic layer:
- Service classes
- Async/await patterns
- Transaction management
- Error handling

### app/repositories/{entity}_repository.py
Data access layer:
- ORM models (SQLAlchemy/Motor)
- Query builders
- CRUD operations
- Database transactions

## Configuration Requirements

### Framework: FastAPI
- Version: Latest stable
- Async/await support
- Type hints throughout
- Pydantic validation

### Database Support
- PostgreSQL (SQLAlchemy + asyncpg)
- MongoDB (Motor)
- SQLite (development)

### ORM Options
- SQLAlchemy (for SQL databases)
- Motor (for MongoDB)

### Authentication
- JWT tokens
- OAuth2 flows
- API key authentication

### Testing
- pytest
- pytest-asyncio
- httpx (async client)
- factory_boy (fixtures)
- faker (mock data)

## Code Standards

### Style Guide
- PEP 8 compliance
- Type hints for all functions
- Google-style docstrings
- Black formatter
- Flake8 linter
- MyPy type checker

### Project Configuration
```python
# pyproject.toml
[tool.black]
line-length = 100
target-version = ['py311']

[tool.mypy]
python_version = "3.11"
strict = true

[tool.pytest.ini_options]
asyncio_mode = "auto"
testpaths = ["tests"]
```

## API Design Patterns

### Layered Architecture
1. **API Layer** (Routes) - HTTP handling
2. **Service Layer** - Business logic
3. **Repository Layer** - Data access
4. **Domain Layer** - Models and entities

### Dependency Injection
```python
from fastapi import Depends

async def get_service() -> EntityService:
    return EntityService()

@router.get("/items")
async def list_items(
    service: EntityService = Depends(get_service)
):
    return await service.list_items()
```

### Error Handling
```python
from fastapi import HTTPException, status

class EntityNotFoundError(Exception):
    pass

@app.exception_handler(EntityNotFoundError)
async def entity_not_found_handler(request, exc):
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=str(exc)
    )
```

## Database Models

### SQLAlchemy Example
```python
from sqlalchemy import Column, Integer, String, DateTime
from app.db.base import Base

class Entity(Base):
    __tablename__ = "entities"
    
    id = Column(Integer, primary_key=True)
    name = Column(String(200), nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
```

### Pydantic Schema Example
```python
from pydantic import BaseModel, Field
from datetime import datetime

class EntityBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)

class EntityCreate(EntityBase):
    pass

class EntityResponse(EntityBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True
```

## Testing Standards

### Test Structure
- Unit tests: Test individual functions/methods
- Integration tests: Test API endpoints
- Fixtures: Reusable test data
- Coverage target: 80%+

### Example Test
```python
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_create_entity(client: AsyncClient):
    response = await client.post(
        "/api/entities",
        json={"name": "Test Entity"}
    )
    assert response.status_code == 201
    assert response.json()["name"] == "Test Entity"
```

## Docker Configuration

### Dockerfile
- Multi-stage build
- Python 3.11+ base image
- Uvicorn server
- Health checks

### docker-compose.yml
- Application service
- Database service
- Environment configuration
- Volume mounts

## Environment Variables

Required environment variables:
- `DEBUG`: Debug mode (True/False)
- `DATABASE_URL`: Database connection string
- `SECRET_KEY`: Application secret key
- `CORS_ORIGINS`: Allowed CORS origins
- `API_V1_PREFIX`: API version prefix

## Documentation

### OpenAPI/Swagger
- Automatic generation
- Available at `/docs`
- ReDoc at `/redoc`
- Schema export at `/openapi.json`

### README Requirements
- Project overview
- Setup instructions
- API documentation link
- Environment variables
- Development workflow
- Testing instructions
- Deployment guide

## CI/CD Integration

### Pre-commit Hooks
- Black formatting
- Flake8 linting
- MyPy type checking
- Import sorting (isort)

### GitHub Actions
- Run tests on PR
- Check code coverage
- Lint checks
- Build Docker image
- Deploy on merge

## Standards Compliance

This template follows:
- DFP (Digital Foundation Platform) standards
- 12-factor app methodology
- RESTful API design principles
- OpenAPI 3.0 specification
- Async best practices
- Security best practices (OWASP)
