import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import cartRoutes from './routes/cart';
import checkoutRoutes from './routes/checkout';
import itemRoutes from './routes/items';
import orderRoutes from './routes/orders';
import { 
  limiter, 
  authLimiter, 
  securityMiddleware, 
  corsOptions, 
  errorHandler 
} from './middleware/security';

dotenv.config();

const app = express();

// Security middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10kb' })); // Limit payload size
app.use(securityMiddleware);
app.use(limiter); // Global rate limiting

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/orders', orderRoutes);

// Error handling
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
	console.log(`Server listening on port ${PORT}`);
});

export default app;

