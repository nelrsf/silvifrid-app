# Catalog API Documentation - Missing Endpoints

This document describes the API endpoints that need to be implemented in the backend to complete the product CRUD functionality migration to the catalog API.

## Base URL
The API base URL is configured in the environment variables as `apiUrl`:
- Development: `http://localhost:4000`
- Production: `https://silvifrid-gateway.vercel.app`

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

## Product Schema
All endpoints should work with the following product schema:
```js
{
  _id: ObjectId,           // MongoDB ObjectId
  name: String,            // Product name
  description: String,     // Product description
  images: [String],        // Array of image URLs, index 0 is main image
  price: Number,           // Base price
  extendedPrice: Number,   // Extended price (wholesale/promotion)
  stock: Number            // Available quantity
}
```

## Currently Implemented Endpoints

### 1. Get All Products
```
GET /getproducts
```
- **Description**: Retrieve all products
- **Authentication**: Required (products-view permission)
- **Response**: Array of products in JSON format
- **Status**: ✅ **IMPLEMENTED**

### 2. Get Product by ID
```
GET /getproducts/:id
```
- **Description**: Retrieve a specific product by its MongoDB ObjectId
- **Authentication**: Required (products-view permission)
- **Parameters**: 
  - `id` (path parameter): MongoDB ObjectId of the product
- **Response**: Single product object or error if not found
- **Status**: ✅ **IMPLEMENTED**

### 3. Create Product
```
POST /createproduct
```
- **Description**: Create a new product
- **Authentication**: Required (products-create permission)
- **Headers**: 
  ```
  Authorization: Bearer <token>
  Content-Type: application/json
  ```
- **Request Body**:
  ```js
  {
    name: String,            // Required
    description: String,     // Required
    images: [String],        // Optional, array of image URLs
    price: Number,           // Required
    extendedPrice: Number,   // Required
    stock: Number            // Required
  }
  ```
- **Response**: Created product object with generated `_id`
- **Status**: ✅ **IMPLEMENTED**

## Missing Endpoints (To Be Implemented)

### 4. Update Product
```
PUT /updateproduct/:id
```
- **Description**: Update an existing product
- **Authentication**: Required (products-edit permission)
- **Parameters**: 
  - `id` (path parameter): MongoDB ObjectId of the product to update
- **Headers**: 
  ```
  Authorization: Bearer <token>
  Content-Type: application/json
  ```
- **Request Body**: Partial product object (only fields to update)
  ```js
  {
    name?: String,
    description?: String,
    images?: [String],
    price?: Number,
    extendedPrice?: Number,
    stock?: Number
  }
  ```
- **Response**: Updated product object
- **Error Responses**:
  - `404`: Product not found
  - `403`: Insufficient permissions
  - `401`: Authentication required
- **Status**: ❌ **NEEDS IMPLEMENTATION**

### 5. Delete Product
```
DELETE /deleteproduct/:id
```
- **Description**: Delete a product
- **Authentication**: Required (products-delete permission)
- **Parameters**: 
  - `id` (path parameter): MongoDB ObjectId of the product to delete
- **Headers**: 
  ```
  Authorization: Bearer <token>
  ```
- **Response**: 
  ```js
  {
    success: boolean,
    message?: string
  }
  ```
- **Error Responses**:
  - `404`: Product not found
  - `403`: Insufficient permissions
  - `401`: Authentication required
- **Status**: ❌ **NEEDS IMPLEMENTATION**

## Permission Requirements

All endpoints must validate the following permissions:

- `products-view`: Required for GET operations
- `products-create`: Required for POST operations
- `products-edit`: Required for PUT/PATCH operations
- `products-delete`: Required for DELETE operations
- `products-all`: Global permission that overrides all other product permissions (for admin roles)

## Implementation Notes

1. **Permission Validation**: The backend should validate JWT tokens and check user permissions for each endpoint
2. **Error Handling**: Consistent error response format should be maintained
3. **Input Validation**: All input data should be validated according to the schema
4. **MongoDB Integration**: Ensure proper MongoDB ObjectId handling for the `_id` field
5. **Image URLs**: The `images` array should contain valid URLs; the first element (index 0) is considered the main image

## Testing

Once implemented, the endpoints should be tested with:
- Valid authentication tokens
- Invalid or missing tokens
- Users with and without proper permissions
- Valid and invalid product data
- Existing and non-existing product IDs

## Frontend Integration

The frontend `ProductService` is already configured to use these endpoints and will handle:
- Automatic permission checking before API calls
- Proper error handling and user feedback
- Local state management and cache updates
- Authentication header injection