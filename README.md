# ShopSphere Frontend

React + TypeScript frontend for the ShopSphere e-commerce platform.

## Features

- ✅ User Authentication (Login, Register, JWT)
- ✅ Product Browsing with Pagination & Search
- ✅ Product Details View
- ✅ Order Creation & Management
- ✅ Admin Dashboard (Product CRUD)
- ✅ Role-Based Access Control
- ✅ Responsive Material-UI Design

## Prerequisites

- Node.js 18+ and npm
- Backend API running on `http://localhost:3000`

## Installation

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

## Environment Variables

Create a `.env` file in the frontend directory:

```bash
# HTTPS Configuration - Bắt buộc sử dụng HTTPS để mã hóa dữ liệu truyền tải
HTTPS=true

# API URL
REACT_APP_API_URL=http://localhost:4000

# Port (optional)
PORT=3001
```

### HTTPS Configuration

Frontend được cấu hình để **bắt buộc sử dụng HTTPS** để mã hóa dữ liệu truyền tải, đảm bảo bảo mật.

- **Development**: Sử dụng self-signed certificate (browser sẽ cảnh báo, bạn cần chấp nhận)
- **Production**: Sử dụng certificate từ CA (Let's Encrypt, etc.)

**Lưu ý**: Khi chạy lần đầu với HTTPS, browser sẽ hiển thị cảnh báo "Your connection is not private". Đây là bình thường với self-signed certificate trong development. Bạn có thể:
1. Click "Advanced" → "Proceed to localhost (unsafe)" để tiếp tục
2. Hoặc cài đặt `mkcert` để tạo trusted certificate (xem phần dưới)

#### Tùy chọn: Cài đặt mkcert cho trusted certificate

```bash
# Cài đặt mkcert (Linux)
sudo apt install libnss3-tools
wget -O mkcert https://github.com/FiloSottile/mkcert/releases/latest/download/mkcert-v1.4.4-linux-amd64
chmod +x mkcert
sudo mv mkcert /usr/local/bin/

# Tạo local CA
mkcert -install

# Tạo certificate cho localhost
mkcert localhost 127.0.0.1 ::1

# Di chuyển certificate vào thư mục frontend
mv localhost+2.pem frontend/cert.pem
mv localhost+2-key.pem frontend/cert-key.pem

# Cập nhật .env
echo "SSL_CRT_FILE=cert.pem" >> frontend/.env
echo "SSL_KEY_FILE=cert-key.pem" >> frontend/.env
```

## Running the Application

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

The frontend will be available at **`https://localhost:3001`** (HTTPS) (or the next available port if 3000 is taken by the backend).

⚠️ **Lưu ý**: Với HTTPS, bạn sẽ truy cập qua `https://` thay vì `http://`. Browser có thể hiển thị cảnh báo bảo mật với self-signed certificate - đây là bình thường trong development.

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── Navbar.tsx       # Navigation bar
│   └── PrivateRoute.tsx # Protected route wrapper
├── contexts/            # React Context providers
│   └── AuthContext.tsx  # Authentication context
├── pages/               # Page components
│   ├── HomePage.tsx
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── ProductsPage.tsx
│   ├── ProductDetailPage.tsx
│   ├── OrdersPage.tsx
│   ├── CreateOrderPage.tsx
│   └── AdminDashboard.tsx
├── services/            # API service layer
│   └── api.ts           # Axios instance and API calls
├── App.tsx              # Main app component with routing
└── index.tsx            # Entry point
```

## Usage

### Customer Flow

1. **Register**: Create an account at `/register`
2. **Login**: Sign in at `/login`
3. **Browse Products**: View all products at `/products`
4. **View Product**: Click on a product to see details
5. **Place Order**: Click "Buy Now" to create an order
6. **View Orders**: See your order history at `/orders`

### Admin Flow

1. **Login as Admin**: Sign in with admin credentials
2. **Access Dashboard**: Navigate to `/admin`
3. **Manage Products**: Create, update, or delete products

## API Integration

The frontend communicates with the backend API using Axios. All API calls are in `src/services/api.ts`.

### Authentication

- JWT tokens are stored in `localStorage`
- Tokens are automatically attached to requests via interceptors
- 401 responses trigger logout (token refresh coming soon)

### Endpoints Used

- `POST /api/auth/login` - User login
- `POST /api/users/register` - User registration
- `GET /api/products` - List products (with pagination)
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)
- `POST /api/orders` - Create order
- `GET /api/orders/my-orders` - Get user's orders
- `GET /api/users/me` - Get current user profile

## Technologies

- **React 18**: UI library
- **TypeScript**: Type safety
- **Material-UI (MUI)**: Component library
- **React Router**: Routing
- **Axios**: HTTP client
- **React Query (TanStack Query)**: Server state management
- **React Hook Form**: Form handling (ready for use)

## Testing

### Manual Testing Checklist

#### Authentication
- [ ] Register new user
- [ ] Login with valid credentials
- [ ] Login with invalid credentials (should show error)
- [ ] Logout
- [ ] Protected routes redirect to login when not authenticated

#### Products
- [ ] View product list
- [ ] Search products
- [ ] Pagination works correctly
- [ ] View product details
- [ ] Product images display correctly

#### Orders
- [ ] Create order
- [ ] View order list
- [ ] Order status displayed correctly

#### Admin
- [ ] Access admin dashboard (admin only)
- [ ] Create new product
- [ ] Update existing product
- [ ] Delete product
- [ ] Non-admin users cannot access admin routes

## Troubleshooting

### CORS Errors

If you see CORS errors, ensure your backend has CORS enabled for `https://localhost:3001`:

```typescript
// backend: src/main.ts
app.enableCors({
  origin: 'https://localhost:3001', // Lưu ý: HTTPS
  credentials: true,
});
```

### HTTPS Certificate Warning

Nếu bạn thấy cảnh báo "Your connection is not private" khi truy cập `https://localhost:3001`:
- Đây là bình thường với self-signed certificate trong development
- Click "Advanced" → "Proceed to localhost (unsafe)" để tiếp tục
- Hoặc cài đặt mkcert để tạo trusted certificate (xem phần Environment Variables)

### API Connection Refused

Make sure the backend is running on `http://localhost:3000`.

### Token Expiration

Access tokens expire after 15 minutes. If you get 401 errors, logout and login again. (Token refresh will be implemented in the future.)

## Future Enhancements

- [ ] Token refresh implementation
- [ ] Shopping cart functionality
- [ ] Product reviews and ratings
- [ ] Order status tracking
- [ ] Payment gateway integration
- [ ] User profile editing
- [ ] Product categories filter
- [ ] Image upload for products
- [ ] Dark mode toggle
- [ ] Email verification UI

## Contributing

This is a student project for the Software Architecture course.

## License

MIT

# shophere-frontend
