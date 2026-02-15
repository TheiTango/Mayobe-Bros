import express from 'express';
import cors from 'cors';
import session from 'express-session';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import authRoutes from './routes/auth.js';
import postsRoutes from './routes/posts.js';
import pagesRoutes from './routes/pages.js';
import categoriesRoutes from './routes/categories.js';
import labelsRoutes from './routes/labels.js';
import imagesRoutes from './routes/images.js';
import settingsRoutes from './routes/settings.js';
import commentsRoutes from './routes/comments.js';
import reviewsRoutes from './routes/reviews.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'mayobebros-secret-key-2026',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use('/data/images', express.static(join(__dirname, '../data/images')));

app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/pages', pagesRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/labels', labelsRoutes);
app.use('/api/images', imagesRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/reviews', reviewsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Mayobe Bros API Server Running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Mayobe Bros API Server running on http://localhost:${PORT}`);
});
