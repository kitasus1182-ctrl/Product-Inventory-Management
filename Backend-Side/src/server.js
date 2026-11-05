import express from 'express';
import pool from './config/db.js';
import productRouter from './routes/product.routes.js';
import stockRouter from './routes/stock.routes.js';

const app = express();
const port = Number(process.env.PORT || 3000);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be an integer between 1 and 65535');
}

app.use(express.json({ limit: '1mb' }));
app.use('/api/inventory', productRouter);
app.use('/api/stock', stockRouter); 

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Request body contains invalid JSON' });
  }

  if (err.type === 'entity.too.large') {
    return res.status(413).json({ message: 'Request body is too large' });
  }

  console.error('Request failed:', err);
  return res.status(500).json({ message: 'Internal server error' });
});

const startServer = async () => {
  try {
    await pool.query('SELECT 1');
    await new Promise((resolve, reject) => {
      const server = app.listen(port, () => resolve(server));
      server.once('error', reject);
    });
    console.log(`Backend listening on port ${port}`);
  } catch (err) {
    console.error('Failed to start backend:', err.message);
    await pool.end();
    process.exitCode = 1;
  }
};

await startServer();