from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from decouple import config

app = FastAPI(
    title="my-audit",
    description="create custom project with below api:
GET /api/audit-logs
 

Query params: user_id, action, resource_type, start_date, end_date, page, limit

Response: paginated audit logs

Filters by multiple criteria

Supports date range queries

### Confirmation

- [x] I have reviewed the project requirements
- [x] I understand this will create a new branch and PR",
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

# Pydantic models
class ItemBase(BaseModel):
    name: str
    description: Optional[str] = None

class ItemCreate(ItemBase):
    pass

class ItemUpdate(ItemBase):
    pass

class Item(ItemBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# In-memory database (replace with real database in production)
items_db = [
    {
        "id": 1,
        "name": "Sample Item 1",
        "description": "First sample item",
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    },
    {
        "id": 2,
        "name": "Sample Item 2",
        "description": "Second sample item",
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    }
]

@app.get("/")
def read_root():
    return {
        "message": "Welcome to my-audit API",
        "docs": "/docs",
        "endpoints": ["/api/items", "/api/items/{item_id}", "/health"]
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.now()}

@app.get("/api/items", response_model=List[Item])
def get_items(skip: int = 0, limit: int = 100):
    return items_db[skip : skip + limit]

@app.get("/api/items/{item_id}", response_model=Item)
def get_item(item_id: int):
    item = next((item for item in items_db if item["id"] == item_id), None)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item

@app.post("/api/items", response_model=Item, status_code=201)
def create_item(item: ItemCreate):
    new_id = max([i["id"] for i in items_db]) + 1 if items_db else 1
    new_item = {
        "id": new_id,
        "name": item.name,
        "description": item.description,
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    }
    items_db.append(new_item)
    return new_item

@app.put("/api/items/{item_id}", response_model=Item)
def update_item(item_id: int, item: ItemUpdate):
    db_item = next((item for item in items_db if item["id"] == item_id), None)
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    db_item["name"] = item.name
    db_item["description"] = item.description
    db_item["updated_at"] = datetime.now()
    return db_item

@app.delete("/api/items/{item_id}", status_code=204)
def delete_item(item_id: int):
    global items_db
    items_db = [item for item in items_db if item["id"] != item_id]
    return None

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=config("HOST", default="0.0.0.0"),
        port=config("PORT", default=8000, cast=int),
        reload=config("DEBUG", default=True, cast=bool)
    )
