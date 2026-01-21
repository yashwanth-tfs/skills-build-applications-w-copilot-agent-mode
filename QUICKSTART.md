# Quick Start Guide

## Create Your First Auto-Generated Project

### 1. Python Django API (5 minutes)

1. Click **Issues** → **New Issue**
2. Select **🐍 Python Project**
3. Fill in:
   ```
   Project Name: todo-api
   Framework: Django
   Database: SQLite
   Features: ✓ User Authentication, ✓ REST API, ✓ Unit Tests
   Description: A simple TODO API with user authentication
   ```
4. Click **Submit new issue**
5. Wait ~2 minutes for generation
6. Click the **Launch Codespace** link in the comment
7. In Codespace terminal:
   ```bash
   cd generated-projects/todo-api
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py runserver
   ```
8. Return to issue, comment: `/approve`
9. Merge the PR!

### 2. Angular Dashboard (5 minutes)

1. Click **Issues** → **New Issue**
2. Select **🅰️ Angular Project**
3. Fill in:
   ```
   Project Name: admin-dashboard
   Angular Version: Angular 17 (Latest)
   Styling: Angular Material
   Features: ✓ Routing, ✓ HTTP Client, ✓ Forms, ✓ Authentication Module
   Architecture: Standalone Components
   Description: An admin dashboard with authentication
   ```
4. Click **Submit new issue**
5. Wait ~2 minutes for generation
6. Click the **Launch Codespace** link
7. In Codespace terminal:
   ```bash
   cd generated-projects/admin-dashboard
   npm install
   ng serve
   ```
8. Click the port 4200 notification to open the app
9. Return to issue, comment: `/approve`
10. Merge the PR!

## Next Steps

- Customize the generated code in the Codespace
- Add your business logic
- Commit changes to the branch before approving
- The PR will include all your modifications

## Tips

- Project names should be lowercase with hyphens (e.g., `my-app`)
- Review the README in each generated project for specific setup instructions
- You can modify code in the Codespace before approving
- Use `/reject` if you want to start over with different settings

## Common Commands

### Python Projects
```bash
# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run Django
python manage.py runserver

# Run Flask
python app.py

# Run FastAPI
uvicorn main:app --reload
```

### Angular Projects
```bash
# Install dependencies
npm install

# Run development server
ng serve

# Build for production
ng build

# Run tests
ng test
```

Happy coding! 🚀
