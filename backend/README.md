# Food Delivery Backend

A robust food delivery backend service built with Node.js, Express, TypeScript, and Prisma.

## Features

- Authentication with JWT
- Item browsing and search
- Shopping cart management
- Order checkout system
- Order tracking
- Multi-device cart synchronization
- Comprehensive security features

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL
- Docker (optional, for containerized database)

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/romitshah02/food-delivery.git
cd food-delivery/backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/food_delivery"
JWT_SECRET="your-secret-key"
FRONTEND_URL="http://localhost:3000"
```

4. Start PostgreSQL (using Docker):
```bash
docker-compose up -d
```

5. Run database migrations:
```bash
npm run db:migrate
```

6. Seed the database:
```bash
npm run db:seed
```

7. Start the development server:
```bash
npm run dev
```

## API Documentation

### Authentication

#### Register New User
- **POST** `/api/auth/register`
```json
{
  "email": "user@example.com",
  "password": "StrongPass123!",
  "name": "John Doe"
}
```

#### Login
- **POST** `/api/auth/login`
```json
{
  "email": "user@example.com",
  "password": "StrongPass123!"
}
```

### Items

#### List Categories
- **GET** `/api/items/categories`

#### List Items by Category
- **GET** `/api/items/category/:category`
- Query params: `page`, `limit`, `search`

#### Search Items
- **GET** `/api/items/search`
- Query params: `q`, `page`, `limit`

### Cart

#### Get Cart
- **GET** `/api/cart`
- Requires authentication

#### Add to Cart
- **POST** `/api/cart/items`
- Requires authentication
```json
{
  "itemId": "item-uuid",
  "quantity": 2
}
```

#### Update Cart Item
- **PATCH** `/api/cart/items/:id`
- Requires authentication
```json
{
  "quantity": 3
}
```

### Checkout

#### Create Order
- **POST** `/api/checkout`
- Requires authentication
```json
{
  "address": "123 Main St",
  "paymentMethod": "CARD",
  "notes": "Ring doorbell"
}
```

### Orders

#### List Orders
- **GET** `/api/orders`
- Query params: `page`, `limit`, `status`
- Requires authentication

#### Get Order Details
- **GET** `/api/orders/:id`
- Requires authentication

## Security Features

- Request validation using Zod
- Rate limiting
- CORS protection
- Helmet security headers
- SQL injection protection via Prisma
- XSS protection
- CSRF protection
- Strong password requirements

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production version
- `npm start` - Start production server
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed the database

### Database Migrations

Create a new migration:
```bash
npm run prisma:migrate <migration-name>
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 4000 |
| DATABASE_URL | PostgreSQL connection URL | - |
| JWT_SECRET | JWT signing secret | - |
| FRONTEND_URL | Frontend application URL | http://localhost:3000 |

## Error Handling

The API uses the following error status codes:

- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 429: Too Many Requests
- 500: Internal Server Error

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.