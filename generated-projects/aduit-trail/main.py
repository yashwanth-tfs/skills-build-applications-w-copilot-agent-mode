from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from decouple import config

app = FastAPI(
    title="aduit-trail",
    description="Custom project with below api:

POST /api/documents
 

Request: title, description, category,...",
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


# User Pydantic models
class UserBase(BaseModel):
    name: str
    description: Optional[str] = None

class UserCreate(UserBase):
    pass

class UserUpdate(UserBase):
    pass

class User(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# In-memory database for users (replace with real database)
user_db = [
    {
        "id": 1,
        "name": "Sample User 1",
        "description": "First sample user",
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    },
    {
        "id": 2,
        "name": "Sample User 2",
        "description": "Second sample user",
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    }
]

# User endpoints
@app.get("/api/users", response_model=List[User])
def get_users(skip: int = 0, limit: int = 100):
    """Get all users"""
    return user_db[skip : skip + limit]

@app.get("/api/users/{{item_id}}", response_model=User)
def get_user(item_id: int):
    """Get a single user by ID"""
    item = next((item for item in user_db if item["id"] == item_id), None)
    if not item:
        raise HTTPException(status_code=404, detail="User not found")
    return item

@app.post("/api/users", response_model=User, status_code=201)
def create_user(item: UserCreate):
    """Create a new user"""
    new_id = max([i["id"] for i in user_db]) + 1 if user_db else 1
    new_item = {
        "id": new_id,
        "name": item.name,
        "description": item.description,
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    }
    user_db.append(new_item)
    return new_item

@app.put("/api/users/{{item_id}}", response_model=User)
def update_user(item_id: int, item: UserUpdate):
    """Update an existing user"""
    db_item = next((item for item in user_db if item["id"] == item_id), None)
    if not db_item:
        raise HTTPException(status_code=404, detail="User not found")
    
    db_item["name"] = item.name
    db_item["description"] = item.description
    db_item["updated_at"] = datetime.now()
    return db_item

@app.delete("/api/users/{{item_id}}", status_code=204)
def delete_user(item_id: int):
    """Delete a user"""
    global user_db
    user_db = [item for item in user_db if item["id"] != item_id]
    return None


# Product Pydantic models
class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class ProductUpdate(ProductBase):
    pass

class Product(ProductBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# In-memory database for products (replace with real database)
product_db = [
    {
        "id": 1,
        "name": "Sample Product 1",
        "description": "First sample product",
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    },
    {
        "id": 2,
        "name": "Sample Product 2",
        "description": "Second sample product",
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    }
]

# Product endpoints
@app.get("/api/products", response_model=List[Product])
def get_products(skip: int = 0, limit: int = 100):
    """Get all products"""
    return product_db[skip : skip + limit]

@app.get("/api/products/{{item_id}}", response_model=Product)
def get_product(item_id: int):
    """Get a single product by ID"""
    item = next((item for item in product_db if item["id"] == item_id), None)
    if not item:
        raise HTTPException(status_code=404, detail="Product not found")
    return item

@app.post("/api/products", response_model=Product, status_code=201)
def create_product(item: ProductCreate):
    """Create a new product"""
    new_id = max([i["id"] for i in product_db]) + 1 if product_db else 1
    new_item = {
        "id": new_id,
        "name": item.name,
        "description": item.description,
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    }
    product_db.append(new_item)
    return new_item

@app.put("/api/products/{{item_id}}", response_model=Product)
def update_product(item_id: int, item: ProductUpdate):
    """Update an existing product"""
    db_item = next((item for item in product_db if item["id"] == item_id), None)
    if not db_item:
        raise HTTPException(status_code=404, detail="Product not found")
    
    db_item["name"] = item.name
    db_item["description"] = item.description
    db_item["updated_at"] = datetime.now()
    return db_item

@app.delete("/api/products/{{item_id}}", status_code=204)
def delete_product(item_id: int):
    """Delete a product"""
    global product_db
    product_db = [item for item in product_db if item["id"] != item_id]
    return None


# Order Pydantic models
class OrderBase(BaseModel):
    name: str
    description: Optional[str] = None

class OrderCreate(OrderBase):
    pass

class OrderUpdate(OrderBase):
    pass

class Order(OrderBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# In-memory database for orders (replace with real database)
order_db = [
    {
        "id": 1,
        "name": "Sample Order 1",
        "description": "First sample order",
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    },
    {
        "id": 2,
        "name": "Sample Order 2",
        "description": "Second sample order",
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    }
]

# Order endpoints
@app.get("/api/orders", response_model=List[Order])
def get_orders(skip: int = 0, limit: int = 100):
    """Get all orders"""
    return order_db[skip : skip + limit]

@app.get("/api/orders/{{item_id}}", response_model=Order)
def get_order(item_id: int):
    """Get a single order by ID"""
    item = next((item for item in order_db if item["id"] == item_id), None)
    if not item:
        raise HTTPException(status_code=404, detail="Order not found")
    return item

@app.post("/api/orders", response_model=Order, status_code=201)
def create_order(item: OrderCreate):
    """Create a new order"""
    new_id = max([i["id"] for i in order_db]) + 1 if order_db else 1
    new_item = {
        "id": new_id,
        "name": item.name,
        "description": item.description,
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    }
    order_db.append(new_item)
    return new_item

@app.put("/api/orders/{{item_id}}", response_model=Order)
def update_order(item_id: int, item: OrderUpdate):
    """Update an existing order"""
    db_item = next((item for item in order_db if item["id"] == item_id), None)
    if not db_item:
        raise HTTPException(status_code=404, detail="Order not found")
    
    db_item["name"] = item.name
    db_item["description"] = item.description
    db_item["updated_at"] = datetime.now()
    return db_item

@app.delete("/api/orders/{{item_id}}", status_code=204)
def delete_order(item_id: int):
    """Delete a order"""
    global order_db
    order_db = [item for item in order_db if item["id"] != item_id]
    return None


@app.get("/")
def read_root():
    return {
        "message": "Welcome to aduit-trail API",
        "description": "Custom project with below api:

POST /api/documents
 

Request: title, description, category, metadata (optional)

Response: document_id, created_at, status

Creates document record without file

POST /api/documents/{id}/upload
 

Request: multipart/form-data file

Response: file_path, file_size, mime_type

Stores file and creates version record

Validation: file size, allowed extensions

GET /api/documents/{id}
 

Response: full document details including metadata

Includes version history and approval status

GET /api/documents
 

Query params: page, limit, category, status, search, sort_by, order

Response: paginated list of documents

Default: 20 items per page

Supports filtering by multiple criteria

PUT /api/documents/{id}
 

Request: updated fields (title, description, category, metadata)

Response: updated document

Creates new version if content changed

DELETE /api/documents/{id}
 

Response: success message

Soft delete: sets is_deleted=true, preserves audit trail

Requires admin or owner permissions

GET /api/documents/{id}/download
 

Response: file stream with appropriate content-type

Logs download action in audit trail

GET /api/documents/{id}/versions
 

Response: list of all document versions

Includes version number, changes, timestamp, user

GET /api/documents/search
 

Query params: q (search query), filters

Response: matching documents

Full-text search on title, description, content",
        "docs": "/docs",
        "entities": ['user', 'product', 'order'],
        "endpoints": ["/api/users", "/api/products", "/api/orders"]
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.now()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=config("HOST", default="0.0.0.0"),
        port=config("PORT", default=8000, cast=int),
        reload=config("DEBUG", default=True, cast=bool)
    )
