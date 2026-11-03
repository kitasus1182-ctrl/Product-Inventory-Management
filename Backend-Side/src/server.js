import express from 'express';
import pool from './config/db.js';

const app = express();
const port = 3000;

app.use(express.json());

pool.connect();
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});