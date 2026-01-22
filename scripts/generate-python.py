#!/usr/bin/env python3
"""
Python Project Generator
Generates a Python project based on issue metadata
"""

import os
import sys
import json
import re
from pathlib import Path


def parse_issue_body(issue_body):
    """Parse issue body to extract configuration"""
    config = {}
    
    # Extract framework - support both ### Heading and **Bold:** formats
    # Format 1: ### Framework\nFastAPI
    # Format 2: **Framework:** FastAPI
    framework_match = re.search(r'(?:###\s*Framework\s+([^\n]+)|\*\*Framework:\*\*\s+([^\n]+))', issue_body, re.IGNORECASE)
    if framework_match:
        config['framework'] = (framework_match.group(1) or framework_match.group(2)).strip()
    else:
        config['framework'] = 'Django'
    
    # Extract database
    db_match = re.search(r'(?:###\s*Database\s+([^\n]+)|\*\*Database:\*\*\s+([^\n]+))', issue_body, re.IGNORECASE)
    if db_match:
        config['database'] = (db_match.group(1) or db_match.group(2)).strip()
    else:
        config['database'] = 'SQLite'
    
    # Extract description - support multiple formats
    desc_match = re.search(r'(?:###\s*(?:Project\s+)?Description\s+(.+?)(?=\n###|$)|\*\*Description:\*\*\s+(.+?)(?=\n\n\*\*|$))', issue_body, re.DOTALL | re.IGNORECASE)
    if desc_match:
        config['description'] = (desc_match.group(1) or desc_match.group(2)).strip()
    else:
        config['description'] = ''
    
    # Extract features
    config['features'] = []
    if 'User Authentication' in issue_body or 'auth' in issue_body.lower():
        config['features'].append('auth')
    if 'REST API' in issue_body:
        config['features'].append('rest_api')
    if 'GraphQL API' in issue_body:
        config['features'].append('graphql')
    if 'Celery' in issue_body:
        config['features'].append('celery')
    if 'Docker Support' in issue_body:
        config['features'].append('docker')
    if 'Unit Tests' in issue_body:
        config['features'].append('tests')
    
    # Parse entities from description (for intelligent code generation)
    config['entities'] = extract_entities_from_description(config['description'])
    
    return config


def extract_entities_from_description(description):
    """
    Extract entities/resources from project description
    This helps generate context-specific endpoints instead of generic ones
    
    Examples:
    - "User management system" -> ['user']
    - "Blog with posts and comments" -> ['post', 'comment']
    - "E-commerce with products and orders" -> ['product', 'order']
    - "Task tracking application" -> ['task']
    """
    entities = []
    
    # Common entity keywords to look for
    entity_keywords = {
        'user': ['user', 'account', 'profile', 'member'],
        'product': ['product', 'item', 'goods', 'merchandise'],
        'order': ['order', 'purchase', 'transaction'],
        'post': ['post', 'article', 'blog'],
        'comment': ['comment', 'review', 'feedback'],
        'task': ['task', 'todo', 'assignment', 'job'],
        'project': ['project', 'workspace'],
        'customer': ['customer', 'client'],
        'invoice': ['invoice', 'bill', 'receipt'],
        'payment': ['payment', 'transaction'],
        'booking': ['booking', 'reservation', 'appointment'],
        'event': ['event', 'meeting', 'conference'],
        'category': ['category', 'tag', 'label'],
        'message': ['message', 'chat', 'conversation'],
        'notification': ['notification', 'alert'],
        'report': ['report', 'analytics', 'statistics'],
        'document': ['document', 'file', 'attachment'],
        'inventory': ['inventory', 'stock', 'warehouse'],
        'employee': ['employee', 'staff', 'worker'],
        'department': ['department', 'division', 'team'],
    }
    
    description_lower = description.lower()
    
    # Check for each entity keyword with word boundary matching and pluralization
    for entity_name, keywords in entity_keywords.items():
        for keyword in keywords:
            # Match both singular and plural forms with word boundaries
            # Handle regular plurals (s) and -y to -ies transformation
            if keyword.endswith('y'):
                # For words ending in 'y', match 'categor(y|ies)', 'inventor(y|ies)'
                base = keyword[:-1]  # Remove the 'y'
                pattern = r'\b' + re.escape(base) + r'(?:y|ies)\b'
            else:
                # Match regular plural 's': 'user' matches 'user' or 'users'
                pattern = r'\b' + re.escape(keyword) + r's?\b'
            
            if re.search(pattern, description_lower):
                if entity_name not in entities:
                    entities.append(entity_name)
                break
    
    # If no specific entities found, default to 'item'
    if not entities:
        entities = ['item']
    
    # Limit to first 3 entities to keep code manageable
    return entities[:3]


def generate_fastapi_endpoints_for_entity(entity_name):
    """Generate FastAPI endpoint code for a specific entity"""
    entity_class = entity_name.capitalize()
    
    # Proper English pluralization
    if entity_name.endswith('y'):
        # category -> categories, inventory -> inventories
        entity_plural = entity_name[:-1] + 'ies'
    elif entity_name.endswith('s'):
        # business -> business (already plural)
        entity_plural = entity_name
    else:
        # user -> users, product -> products
        entity_plural = entity_name + 's'
    
    code = f'''
# {entity_class} Pydantic models
class {entity_class}Base(BaseModel):
    name: str
    description: Optional[str] = None

class {entity_class}Create({entity_class}Base):
    pass

class {entity_class}Update({entity_class}Base):
    pass

class {entity_class}({entity_class}Base):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# In-memory database for {entity_plural} (replace with real database)
{entity_name}_db = [
    {{
        "id": 1,
        "name": "Sample {entity_class} 1",
        "description": "First sample {entity_name}",
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    }},
    {{
        "id": 2,
        "name": "Sample {entity_class} 2",
        "description": "Second sample {entity_name}",
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    }}
]

# {entity_class} endpoints
@app.get("/api/{entity_plural}", response_model=List[{entity_class}])
def get_{entity_plural}(skip: int = 0, limit: int = 100):
    """Get all {entity_plural}"""
    return {entity_name}_db[skip : skip + limit]

@app.get("/api/{entity_plural}/{{{{item_id}}}}", response_model={entity_class})
def get_{entity_name}(item_id: int):
    """Get a single {entity_name} by ID"""
    item = next((item for item in {entity_name}_db if item["id"] == item_id), None)
    if not item:
        raise HTTPException(status_code=404, detail="{entity_class} not found")
    return item

@app.post("/api/{entity_plural}", response_model={entity_class}, status_code=201)
def create_{entity_name}(item: {entity_class}Create):
    """Create a new {entity_name}"""
    new_id = max([i["id"] for i in {entity_name}_db]) + 1 if {entity_name}_db else 1
    new_item = {{
        "id": new_id,
        "name": item.name,
        "description": item.description,
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    }}
    {entity_name}_db.append(new_item)
    return new_item

@app.put("/api/{entity_plural}/{{{{item_id}}}}", response_model={entity_class})
def update_{entity_name}(item_id: int, item: {entity_class}Update):
    """Update an existing {entity_name}"""
    db_item = next((item for item in {entity_name}_db if item["id"] == item_id), None)
    if not db_item:
        raise HTTPException(status_code=404, detail="{entity_class} not found")
    
    db_item["name"] = item.name
    db_item["description"] = item.description
    db_item["updated_at"] = datetime.now()
    return db_item

@app.delete("/api/{entity_plural}/{{{{item_id}}}}", status_code=204)
def delete_{entity_name}(item_id: int):
    """Delete a {entity_name}"""
    global {entity_name}_db
    {entity_name}_db = [item for item in {entity_name}_db if item["id"] != item_id]
    return None
'''
    return code


def generate_django_model_for_entity(entity_name):
    """Generate Django model code for a specific entity"""
    entity_class = entity_name.capitalize()
    
    code = f'''
class {entity_class}(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = '{entity_name}'
        verbose_name_plural = '{entity_name}s'
'''
    return code


def generate_flask_resource_for_entity(entity_name):
    """Generate Flask Resource code for a specific entity"""
    entity_class = entity_name.capitalize()
    
    # Proper pluralization
    if entity_name.endswith('y'):
        entity_plural = entity_name[:-1] + 'ies'
    elif entity_name.endswith('s'):
        entity_plural = entity_name
    else:
        entity_plural = entity_name + 's'
    
    code = f'''
# {entity_class} data store (replace with database in production)
{entity_name}_data = [
    {{'id': 1, 'name': 'Sample {entity_class} 1', 'description': 'First sample {entity_name}'}},
    {{'id': 2, 'name': 'Sample {entity_class} 2', 'description': 'Second sample {entity_name}'}},
]

class {entity_class}List(Resource):
    def get(self):
        return {{'{entity_plural}': {entity_name}_data}}, 200
    
    def post(self):
        # In production, parse request data and add to database
        return {{'message': '{entity_class} created'}}, 201

class {entity_class}Detail(Resource):
    def get(self, {entity_name}_id):
        item = next((item for item in {entity_name}_data if item['id'] == {entity_name}_id), None)
        if item:
            return item, 200
        return {{'message': '{entity_class} not found'}}, 404
    
    def put(self, {entity_name}_id):
        # In production, update database
        return {{'message': '{entity_class} updated'}}, 200
    
    def delete(self, {entity_name}_id):
        # In production, delete from database
        return {{'message': '{entity_class} deleted'}}, 204
'''
    return code


def generate_django_project(project_name, config, output_dir):
    """Generate Django project structure"""
    print(f"Generating Django project: {project_name}")
    
    entities = config.get('entities', ['item'])
    
    # Create project structure
    project_path = output_dir / project_name
    project_path.mkdir(parents=True, exist_ok=True)
    
    # Create requirements.txt
    requirements = [
        'Django==4.2.0',
        'djangorestframework==3.14.0',
        'python-decouple==3.8',
    ]
    
    if config['database'] == 'MongoDB':
        requirements.append('djongo==1.3.6')
        requirements.append('pymongo==3.12')
    elif config['database'] == 'PostgreSQL':
        requirements.append('psycopg2-binary==2.9.9')
    elif config['database'] == 'MySQL':
        requirements.append('mysqlclient==2.2.0')
    
    if 'auth' in config['features']:
        requirements.append('django-allauth==0.57.0')
        requirements.append('dj-rest-auth==5.0.0')
    
    if 'graphql' in config['features']:
        requirements.append('graphene-django==3.1.5')
    
    if 'celery' in config['features']:
        requirements.append('celery==5.3.4')
        requirements.append('redis==5.0.1')
    
    if 'docker' in config['features']:
        requirements.append('gunicorn==21.2.0')
    
    (project_path / 'requirements.txt').write_text('\n'.join(requirements))
    
    # Helper function for pluralization
    def pluralize(entity):
        if entity.endswith('y'):
            return entity[:-1] + 'ies'
        elif entity.endswith('s'):
            return entity
        else:
            return entity + 's'
    
    # Create README.md
    readme_content = f"""# {project_name}

{config['description']}

## Framework
- Django 4.2
- Database: {config['database']}

## Detected Entities
{chr(10).join(f'- **{entity.capitalize()}** - Django model with REST API at /api/{pluralize(entity)}/' for entity in entities)}

## Features
{chr(10).join(f'- {feature}' for feature in config['features'])}

## Setup

### Install dependencies
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\\Scripts\\activate
pip install -r requirements.txt
```

### Initialize database
```bash
python manage.py migrate
python manage.py createsuperuser
```

### Run development server
```bash
python manage.py runserver
```

## API Documentation
Visit `/api/docs/` for interactive API documentation (if REST API is enabled).

## Testing
```bash
python manage.py test
```

## Generated by CodeGen Automator
This project was automatically generated based on your requirements.
"""
    (project_path / 'README.md').write_text(readme_content)
    
    # Create manage.py
    (project_path / 'manage.py').write_text("""#!/usr/bin/env python
import os
import sys

if __name__ == '__main__':
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed?"
        ) from exc
    execute_from_command_line(sys.argv)
""")
    
    # Create config directory
    config_dir = project_path / 'config'
    config_dir.mkdir(exist_ok=True)
    (config_dir / '__init__.py').write_text('')
    
    # Create settings.py
    db_config = {
        'SQLite': "DATABASES = {\n    'default': {\n        'ENGINE': 'django.db.backends.sqlite3',\n        'NAME': BASE_DIR / 'db.sqlite3',\n    }\n}",
        'PostgreSQL': "DATABASES = {\n    'default': {\n        'ENGINE': 'django.db.backends.postgresql',\n        'NAME': config('DB_NAME', default='mydb'),\n        'USER': config('DB_USER', default='postgres'),\n        'PASSWORD': config('DB_PASSWORD', default='password'),\n        'HOST': config('DB_HOST', default='localhost'),\n        'PORT': config('DB_PORT', default='5432'),\n    }\n}",
        'MySQL': "DATABASES = {\n    'default': {\n        'ENGINE': 'django.db.backends.mysql',\n        'NAME': config('DB_NAME', default='mydb'),\n        'USER': config('DB_USER', default='root'),\n        'PASSWORD': config('DB_PASSWORD', default='password'),\n        'HOST': config('DB_HOST', default='localhost'),\n        'PORT': config('DB_PORT', default='3306'),\n    }\n}",
    }
    
    settings_content = f"""from pathlib import Path
from decouple import config

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = config('SECRET_KEY', default='django-insecure-change-this-in-production')

DEBUG = config('DEBUG', default=True, cast=bool)

ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='*').split(',')

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'api',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {{
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {{
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        }},
    }},
]

WSGI_APPLICATION = 'config.wsgi.application'

{db_config.get(config['database'], db_config['SQLite'])}

AUTH_PASSWORD_VALIDATORS = [
    {{'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'}},
    {{'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'}},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

REST_FRAMEWORK = {{
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ]
}}
"""
    (config_dir / 'settings.py').write_text(settings_content)
    
    # Create urls.py
    urls_content = """from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
]
"""
    (config_dir / 'urls.py').write_text(urls_content)
    
    # Create wsgi.py
    wsgi_content = """import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
application = get_wsgi_application()
"""
    (config_dir / 'wsgi.py').write_text(wsgi_content)
    
    # Create API app
    api_dir = project_path / 'api'
    api_dir.mkdir(exist_ok=True)
    (api_dir / '__init__.py').write_text('')
    (api_dir / 'apps.py').write_text("""from django.apps import AppConfig

class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'
""")
    
    # Generate entity-specific models
    models_imports = "from django.db import models\n"
    models_code = "\n".join([generate_django_model_for_entity(entity) for entity in entities])
    (api_dir / 'models.py').write_text(models_imports + models_code)
    
    # Generate entity-specific serializers
    serializers_imports = "from rest_framework import serializers\n"
    serializers_imports += "from .models import " + ", ".join([entity.capitalize() for entity in entities]) + "\n\n"
    serializers_code = ""
    for entity in entities:
        entity_class = entity.capitalize()
        serializers_code += f"""class {entity_class}Serializer(serializers.ModelSerializer):
    class Meta:
        model = {entity_class}
        fields = '__all__'

"""
    (api_dir / 'serializers.py').write_text(serializers_imports + serializers_code)
    
    # Generate entity-specific views
    views_imports = "from rest_framework import viewsets\n"
    views_imports += "from .models import " + ", ".join([entity.capitalize() for entity in entities]) + "\n"
    views_imports += "from .serializers import " + ", ".join([f"{entity.capitalize()}Serializer" for entity in entities]) + "\n\n"
    views_code = ""
    for entity in entities:
        entity_class = entity.capitalize()
        views_code += f"""class {entity_class}ViewSet(viewsets.ModelViewSet):
    queryset = {entity_class}.objects.all()
    serializer_class = {entity_class}Serializer

"""
    (api_dir / 'views.py').write_text(views_imports + views_code)
    
    # Generate entity-specific URLs
    urls_imports = "from django.urls import path, include\n"
    urls_imports += "from rest_framework.routers import DefaultRouter\n"
    urls_imports += "from .views import " + ", ".join([f"{entity.capitalize()}ViewSet" for entity in entities]) + "\n\n"
    urls_code = "router = DefaultRouter()\n"
    for entity in entities:
        entity_class = entity.capitalize()
        urls_code += f"router.register(r'{pluralize(entity)}', {entity_class}ViewSet)\n"
    urls_code += "\nurlpatterns = [\n    path('', include(router.urls)),\n]\n"
    (api_dir / 'urls.py').write_text(urls_imports + urls_code)
    
    # Generate entity-specific admin
    admin_imports = "from django.contrib import admin\n"
    admin_imports += "from .models import " + ", ".join([entity.capitalize() for entity in entities]) + "\n\n"
    admin_code = ""
    for entity in entities:
        entity_class = entity.capitalize()
        admin_code += f"""@admin.register({entity_class})
class {entity_class}Admin(admin.ModelAdmin):
    list_display = ['name', 'created_at', 'updated_at']
    search_fields = ['name', 'description']

"""
    (api_dir / 'admin.py').write_text(admin_imports + admin_code)
    
    # Generate entity-specific tests
    first_entity = entities[0]
    first_entity_class = first_entity.capitalize()
    tests_code = f"""from django.test import TestCase
from .models import {", ".join([entity.capitalize() for entity in entities])}

class {first_entity_class}TestCase(TestCase):
    def setUp(self):
        {first_entity_class}.objects.create(name="Test {first_entity_class}", description="Test Description")
    
    def test_{first_entity}_creation(self):
        item = {first_entity_class}.objects.get(name="Test {first_entity_class}")
        self.assertEqual(item.description, "Test Description")
"""
    (api_dir / 'tests.py').write_text(tests_code)
    
    # Create .gitignore
    gitignore_content = """# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
venv/
env/
ENV/

# Django
*.log
db.sqlite3
media/
staticfiles/

# IDE
.vscode/
.idea/
*.swp

# Environment
.env
.env.local
"""
    (project_path / '.gitignore').write_text(gitignore_content)
    
    # Create Docker files if needed
    if 'docker' in config['features']:
        dockerfile_content = f"""FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "config.wsgi:application"]
"""
        (project_path / 'Dockerfile').write_text(dockerfile_content)
        
        docker_compose_content = f"""version: '3.8'

services:
  web:
    build: .
    command: python manage.py runserver 0.0.0.0:8000
    volumes:
      - .:/app
    ports:
      - "8000:8000"
    environment:
      - DEBUG=1
"""
        (project_path / 'docker-compose.yml').write_text(docker_compose_content)
    
    print(f"✅ Django project created at {project_path}")


def generate_flask_project(project_name, config, output_dir):
    """Generate Flask project structure"""
    print(f"Generating Flask project: {project_name}")
    
    entities = config.get('entities', ['item'])
    
    project_path = output_dir / project_name
    project_path.mkdir(parents=True, exist_ok=True)
    
    # Create requirements.txt
    requirements = [
        'Flask==3.0.0',
        'Flask-RESTful==0.3.10',
        'python-decouple==3.8',
    ]
    
    if config['database'] == 'PostgreSQL':
        requirements.append('psycopg2-binary==2.9.9')
        requirements.append('Flask-SQLAlchemy==3.1.1')
    elif config['database'] == 'MongoDB':
        requirements.append('Flask-PyMongo==2.3.0')
        requirements.append('pymongo==4.6.0')
    
    if 'auth' in config['features']:
        requirements.append('Flask-JWT-Extended==4.5.3')
    
    (project_path / 'requirements.txt').write_text('\n'.join(requirements))
    
    # Helper function for pluralization
    def pluralize(entity):
        if entity.endswith('y'):
            return entity[:-1] + 'ies'
        elif entity.endswith('s'):
            return entity
        else:
            return entity + 's'
    
    # Create README.md
    readme_content = f"""# {project_name}

{config['description']}

## Framework
- Flask 3.0
- Database: {config['database']}

## Detected Entities
{chr(10).join(f'- **{entity.capitalize()}** - REST API at /api/{pluralize(entity)}' for entity in entities)}

## Features
{chr(10).join(f'- {feature}' for feature in config['features'])}

## Setup

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

## Generated by CodeGen Automator
"""
    (project_path / 'README.md').write_text(readme_content)
    
    # Create app.py with entity-specific structure
    resources_code = "\n".join([generate_flask_resource_for_entity(entity) for entity in entities])
    
    # Generate API resource registrations
    api_registrations = []
    endpoints_list = []
    for entity in entities:
        entity_class = entity.capitalize()
        entity_plural = pluralize(entity)
        api_registrations.append(f"api.add_resource({entity_class}List, '/api/{entity_plural}')")
        api_registrations.append(f"api.add_resource({entity_class}Detail, '/api/{entity_plural}/<int:{entity}_id>')")
        endpoints_list.append(f"'/api/{entity_plural}'")
        endpoints_list.append(f"'/api/{entity_plural}/<int:{entity}_id>'")
    
    app_content = f"""from flask import Flask, jsonify
from flask_restful import Api, Resource
from decouple import config

app = Flask(__name__)
app.config['SECRET_KEY'] = config('SECRET_KEY', default='dev-secret-key-change-in-production')
app.config['DEBUG'] = config('DEBUG', default=True, cast=bool)

api = Api(app)

{resources_code}

@app.route('/')
def index():
    return jsonify({{
        'message': 'Welcome to {project_name} API',
        'endpoints': [{', '.join(endpoints_list)}]
    }})

@app.route('/health')
def health():
    return jsonify({{'status': 'healthy'}}), 200

{chr(10).join(api_registrations)}

if __name__ == '__main__':
    app.run(
        host=config('HOST', default='0.0.0.0'),
        port=config('PORT', default=5000, cast=int),
        debug=config('DEBUG', default=True, cast=bool)
    )
"""
    (project_path / 'app.py').write_text(app_content)
    
    # Create .env file
    env_content = """SECRET_KEY=your-secret-key-here-change-in-production
DEBUG=True
HOST=0.0.0.0
PORT=5000
"""
    (project_path / '.env').write_text(env_content)
    
    # Create .gitignore
    gitignore_content = """# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
venv/
env/
ENV/
.venv

# Environment
.env
.env.local

# IDE
.vscode/
.idea/
*.swp
*.swo
"""
    (project_path / '.gitignore').write_text(gitignore_content)
    
    print(f"✅ Flask project created at {project_path}")


def generate_fastapi_project(project_name, config, output_dir):
    """Generate FastAPI project structure following enterprise template"""
    print(f"Generating FastAPI project: {project_name}")
    print("Following FastAPI enterprise template structure...")
    
    project_path = output_dir / project_name
    project_path.mkdir(parents=True, exist_ok=True)
    
    # Create layered directory structure as per template
    app_dir = project_path / 'app'
    app_dir.mkdir(exist_ok=True)
    
    # Create subdirectories
    (app_dir / 'api' / 'routes').mkdir(parents=True, exist_ok=True)
    (app_dir / 'core').mkdir(exist_ok=True)
    (app_dir / 'models' / 'domain').mkdir(parents=True, exist_ok=True)
    (app_dir / 'models' / 'schemas').mkdir(parents=True, exist_ok=True)
    (app_dir / 'services').mkdir(exist_ok=True)
    (app_dir / 'repositories').mkdir(parents=True, exist_ok=True)
    (app_dir / 'db').mkdir(exist_ok=True)
    (project_path / 'tests' / 'unit').mkdir(parents=True, exist_ok=True)
    (project_path / 'tests' / 'integration').mkdir(parents=True, exist_ok=True)
    
    # Create __init__.py files
    for subdir in ['api', 'api/routes', 'core', 'models', 'models/domain', 'models/schemas', 
                   'services', 'repositories', 'db']:
        (app_dir / subdir / '__init__.py').write_text('')
    (app_dir / '__init__.py').write_text('')
    (project_path / 'tests' / '__init__.py').write_text('')
    (project_path / 'tests' / 'unit' / '__init__.py').write_text('')
    (project_path / 'tests' / 'integration' / '__init__.py').write_text('')
    
    # Create requirements.txt
    requirements = [
        'fastapi==0.104.0',
        'uvicorn[standard]==0.24.0',
        'pydantic==2.5.0',
        'python-decouple==3.8',
    ]
    
    if config['database'] == 'PostgreSQL':
        requirements.append('sqlalchemy==2.0.23')
        requirements.append('psycopg2-binary==2.9.9')
    elif config['database'] == 'MongoDB':
        requirements.append('motor==3.3.2')
        requirements.append('pymongo==4.6.0')
    
    if 'auth' in config['features']:
        requirements.append('python-jose[cryptography]==3.3.0')
        requirements.append('passlib[bcrypt]==1.7.4')
    
    (project_path / 'requirements.txt').write_text('\n'.join(requirements))
    
    # Generate entity-specific endpoints
    entities = config.get('entities', ['item'])
    entity_endpoints = '\n'.join([generate_fastapi_endpoints_for_entity(entity) for entity in entities])
    
    # Collect all endpoint paths for the root endpoint
    all_endpoints = []
    for entity in entities:
        entity_plural = entity + 's' if not entity.endswith('s') else entity
        all_endpoints.append(f'"/api/{entity_plural}"')
        all_endpoints.append(f'"/api/{entity_plural}/{{{{id}}}}"')
    
    # Helper function for pluralization in README
    def pluralize_readme(entity):
        if entity.endswith('y'):
            return entity[:-1] + 'ies'
        elif entity.endswith('s'):
            return entity
        else:
            return entity + 's'
    
    # Create README.md
    readme_content = f"""# {project_name}

{config['description']}

## Framework
- FastAPI
- Database: {config['database']}

## Detected Entities
{chr(10).join(f'- **{entity.capitalize()}** - CRUD endpoints at /api/{pluralize_readme(entity)}' for entity in entities)}

## Features
{chr(10).join(f'- {feature}' for feature in config['features']) if config['features'] else '- RESTful API'}

## Endpoints

### Auto-generated based on description:
{chr(10).join(f'''- GET /api/{pluralize_readme(entity)} - List all {pluralize_readme(entity)}
- GET /api/{pluralize_readme(entity)}/{{{{id}}}} - Get single {entity}
- POST /api/{pluralize_readme(entity)} - Create new {entity}
- PUT /api/{pluralize_readme(entity)}/{{{{id}}}} - Update {entity}
- DELETE /api/{pluralize_readme(entity)}/{{{{id}}}} - Delete {entity}''' for entity in entities)}

## Setup

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Visit http://localhost:8000/docs for interactive API documentation.

## Generated by CodeGen Automator
This code was automatically generated based on your project description.
"""
    (project_path / 'README.md').write_text(readme_content)
    
    # Create main.py with entity-specific API structure
    # Properly pluralize endpoint paths
    def pluralize(entity):
        if entity.endswith('y'):
            return entity[:-1] + 'ies'
        elif entity.endswith('s'):
            return entity
        else:
            return entity + 's'
    
    endpoints_list = ', '.join([f'"/api/{pluralize(entity)}"' for entity in entities])
    
    main_content = f"""from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from decouple import config

app = FastAPI(
    title="{project_name}",
    description="{config['description']}",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

{entity_endpoints}

@app.get("/")
def read_root():
    return {{
        "message": "Welcome to {project_name} API",
        "description": "{config['description']}",
        "docs": "/docs",
        "entities": {[entity for entity in entities]},
        "endpoints": [{endpoints_list}]
    }}

@app.get("/health")
def health_check():
    return {{"status": "healthy", "timestamp": datetime.now()}}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=config("HOST", default="0.0.0.0"),
        port=config("PORT", default=8000, cast=int),
        reload=config("DEBUG", default=True, cast=bool)
    )
"""
    (project_path / 'main.py').write_text(main_content)
    
    # Create .env file
    env_content = """DEBUG=True
HOST=0.0.0.0
PORT=8000
SECRET_KEY=your-secret-key-here-change-in-production
"""
    (project_path / '.env').write_text(env_content)
    
    # Create .gitignore
    gitignore_content = """# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
venv/
env/
ENV/
.venv

# Environment
.env
.env.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# Database
*.db
*.sqlite3
"""
    (project_path / '.gitignore').write_text(gitignore_content)
    
    # Create models.py for database models (if using SQLAlchemy)
    if config['database'] in ['PostgreSQL', 'MySQL', 'SQLite']:
        models_content = """from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class Item(Base):
    __tablename__ = "items"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
"""
        (project_path / 'models.py').write_text(models_content)
        
        # Create database.py
        database_content = """from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from decouple import config

DATABASE_URL = config("DATABASE_URL", default="sqlite:///./app.db")

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
"""
        (project_path / 'database.py').write_text(database_content)
    
    print(f"✅ FastAPI project created at {project_path}")


def main():
    if len(sys.argv) < 3:
        print("Usage: generate-python.py <project_name> <metadata_file>")
        sys.exit(1)
    
    project_name = sys.argv[1]
    metadata_file = sys.argv[2]
    
    # Read metadata
    with open(metadata_file, 'r') as f:
        metadata = json.load(f)
    
    issue_body = metadata['issue_body']
    config = parse_issue_body(issue_body)
    
    print(f"Configuration: {json.dumps(config, indent=2)}")
    
    # Determine output directory
    output_dir = Path('generated-projects')
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Generate project based on framework
    framework = config['framework'].lower()
    if 'django' in framework:
        generate_django_project(project_name, config, output_dir)
    elif 'flask' in framework:
        generate_flask_project(project_name, config, output_dir)
    elif 'fastapi' in framework:
        generate_fastapi_project(project_name, config, output_dir)
    else:
        print(f"Unknown framework: {framework}")
        sys.exit(1)


if __name__ == '__main__':
    main()
