# Secure Snap 🔐

A secure, ephemeral messaging application that allows users to create and share password-protected messages with automatic expiration. Built with Node.js, Express, PostgreSQL, Redis, and Vue-style frontend with Web Crypto API.

## Features

- **End-to-End Encryption**: Messages are encrypted client-side using AES-256-GCM with PBKDF2 key derivation
- **Ephemeral Messages**: Automatic message expiration with configurable TTL (5 minutes to 1 month)
- **Password Protection**: Optional password-based encryption for added security
- **One-Time Read**: Messages are deleted after retrieval from the database
- **No Server-Side Storage**: Sensitive data never stored in plaintext on the server
- **Redis Caching**: Fast message state management with Redis
- **Responsive UI**: Modern, mobile-friendly interface with dynamic background rotation
- **Docker Support**: Fully containerized with Docker Compose for easy deployment

## Architecture

### Backend
- **Framework**: Express.js
- **Database**: PostgreSQL (message storage)
- **Cache**: Redis (message state tracking)
- **API Routes**:
  - `POST /create` - Create and store an encrypted message
  - `GET /message/:id` - Retrieve a message by ID
  - `DELETE /message/:id` - Delete a message
  - Automatic cleanup of expired messages

### Frontend
- **Vanilla JavaScript** with Web Crypto API
- **Encryption**: Client-side AES-GCM encryption
- **Key Derivation**: PBKDF2 (100,000 iterations)
- **UI**: HTML/CSS with dynamic background images
- **Served by**: Nginx

### Database Schema
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY,
  ciphertext TEXT NOT NULL,
  salt TEXT NOT NULL,
  iv TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL,
  expiry INTEGER NOT NULL
);
```

## Prerequisites

- Docker & Docker Compose
- OR
- Node.js 16+ and PostgreSQL 12+

## Quick Start with Docker

### 1. Clone the Repository
```bash
git clone https://github.com/swissmarley/secure-snap.git
cd secure-snap
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory based on `.env.example`:

```bash
cp backend/.env.example .env
```

Edit `.env` with your PostgreSQL credentials and Redis host:
```env
PGHOST=postgres
PGUSER=postgres
PGPASSWORD=your_secure_password
PGDATABASE=securesnap
PGPORT=5432
REDIS_HOST=redis
REDIS_PORT=6379
```

### 3. Start the Application
```bash
docker-compose up -d
```

The application will be available at:
- **Frontend**: http://localhost:8993
- **Backend API**: http://localhost:3993

## Local Development

### Backend Setup

```bash
cd backend
cp .env.example .env.local
# Update .env.local with your PostgreSQL credentials
npm install
npm run init-db  # Initialize the database
npm start
```

The backend server will run on `http://localhost:3000`

### Frontend Setup

```bash
cd frontend
# Serve files using a local HTTP server or Nginx
python3 -m http.server 8000
# Open http://localhost:8000 in your browser
```

## API Endpoints

### Create Message
```bash
POST /create
Content-Type: application/json

{
  "ciphertext": "base64-encoded-encrypted-text",
  "salt": "base64-encoded-salt",
  "iv": "base64-encoded-initialization-vector",
  "expiry": 3600
}

Response:
{
  "id": "uuid-v4-id"
}
```

### Get Message
```bash
GET /message/:id

Response:
{
  "ciphertext": "base64-encoded-encrypted-text",
  "salt": "base64-encoded-salt",
  "iv": "base64-encoded-initialization-vector"
}
```

### Delete Message
```bash
DELETE /message/:id

Response:
{
  "success": true
}
```

## Security Considerations

- **Client-Side Encryption**: All encryption happens in the browser before sending to the server
- **No Plaintext Storage**: Messages are stored encrypted; the server never has access to decryption keys
- **Secure Key Derivation**: PBKDF2 with 100,000 iterations and random salt
- **CORS Enabled**: API accepts requests from configured origins
- **Automatic Expiration**: Redis TTL ensures messages are automatically removed
- **UUID v4**: Randomly generated message IDs prevent enumeration

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PGHOST` | PostgreSQL host | localhost |
| `PGUSER` | PostgreSQL username | postgres |
| `PGPASSWORD` | PostgreSQL password | (required) |
| `PGDATABASE` | PostgreSQL database name | securesnap |
| `PGPORT` | PostgreSQL port | 5432 |
| `REDIS_HOST` | Redis host | 127.0.0.1 |
| `REDIS_PORT` | Redis port | 6379 |

## Docker Compose Services

- **redis**: Redis 7 for message state caching
- **backend**: Node.js Express API server
- **frontend**: Nginx web server serving the UI

## File Structure

```
secure-snap/
├── backend/
│   ├── functions/
│   │   ├── createMessage.js      # Message creation handler
│   │   ├── deleteMessage.js      # Message deletion handler
│   │   └── getMessage.js         # Message retrieval handler
│   ├── db/
│   │   ├── init.js              # Database initialization
│   │   └── init.sql             # Database schema
│   ├── redis/
│   │   └── index.js             # Redis connection
│   ├── index.js                 # Express server setup
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── app.js                   # Frontend logic & crypto
│   ├── index.html               # UI markup
│   ├── style.css                # Styling
│   ├── nginx.conf               # Nginx configuration
│   └── assets/                  # Images and logos
├── docker-compose.yml
└── README.md
```

## Development

### Install Dependencies
```bash
cd backend && npm install
```

### Database Initialization
```bash
npm run init-db
```

### Start Backend
```bash
npm start
```

### Start Frontend
```bash
cd frontend
python3 -m http.server 8000
```

## Troubleshooting

### Connection Errors
- Ensure PostgreSQL is running and accessible
- Verify Redis is running on the specified host/port
- Check environment variables in `.env`

### Messages Not Persisting
- Verify the `messages` table exists in PostgreSQL
- Check database initialization with `npm run init-db`

### Frontend Can't Connect to Backend
- Update `backendURL` in `frontend/app.js` to match your backend URL
- Ensure CORS is properly configured

## Performance Considerations

- **Redis Caching**: Message metadata cached in Redis for fast lookups
- **Connection Pooling**: PostgreSQL connection pool configured in backend
- **Automatic Cleanup**: Expired messages automatically deleted by Redis TTL
- **Static Asset Caching**: Frontend assets served with Nginx caching

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the `LICENSE` file for details.

## Security Disclaimer

This application is provided as-is for educational and secure communication purposes. While it implements industry-standard encryption practices, no system is 100% secure. For sensitive communications, consider additional security measures and penetration testing before production deployment.
