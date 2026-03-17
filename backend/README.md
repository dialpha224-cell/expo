# AfroCrown Backend

## Production Deployment

### Railway (Recommended)
1. Connect your GitHub repository
2. Select the `/backend` folder
3. Add environment variables
4. Deploy

### Environment Variables Required
```env
MONGO_URL=mongodb+srv://...
DB_NAME=afrocrown_prod
STRIPE_API_KEY=sk_live_...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
RESEND_API_KEY=re_...
SENDER_EMAIL=noreply@afrocrown.com
EMERGENT_KEY=...
```

### Health Check
`GET /api/health`

### API Documentation
Base URL: `/api`

Main endpoints:
- `/api/auth/*` - Authentication
- `/api/salons/*` - Salon management
- `/api/appointments/*` - Bookings
- `/api/subscriptions/*` - Subscriptions
- `/api/queue/*` - Virtual queue
- `/api/rgpd/*` - GDPR compliance
