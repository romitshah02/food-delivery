import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import cartRoutes from './routes/cart';
import checkoutRoutes from './routes/checkout';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/checkout', checkoutRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
	console.log(`Server listening on port ${PORT}`);
});

export default app;

