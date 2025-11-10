# VaquaH Backend

Express.js backend API for VaquaH Cooling Service.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start
```

## 📁 Structure

- `server.js` - Main server file
- `controllers/` - Request handlers
- `routes/` - API route definitions
- `.env` - Environment variables

## 🔧 Configuration

Create a `.env` file in the backend directory:

```bash
PORT=5001
RAZORPAY_KEY_ID=rzp_test_your_key
RAZORPAY_KEY_SECRET=your_test_secret
```

## 🌐 API Endpoints

### Health Check
- `GET /` - API status
- `GET /health` - Health check

### Payments
- `POST /api/payments/razorpay/create-order` - Create Razorpay order
- `POST /api/payments/razorpay/verify` - Verify Razorpay payment

## 🎯 Tech Stack

- **Express.js** - Web framework
- **CORS** - Cross-origin resource sharing
- **Razorpay** - Payment gateway integration
- **dotenv** - Environment variable management

## 🔒 CORS Configuration

The server is configured to allow requests from:
- `http://localhost:8080`
- `http://localhost:8081`
- `http://localhost:5173`
- `http://localhost:3000`

## 📝 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5001` |
| `RAZORPAY_KEY_ID` | Razorpay test key ID | `rzp_test_xxxxx` |
| `RAZORPAY_KEY_SECRET` | Razorpay test secret | `your_secret_here` |

