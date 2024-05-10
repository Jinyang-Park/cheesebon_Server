import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
dotenv.config();

const mysql = require('mysql2');
const cookieParser = require('cookie-parser');

const app = express();

app.use(express.json());
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'dist')));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ extended: true }));

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.PORT || 3000}`);
});

// MYSQL
const db = mysql.createConnection({
  host: process.env.MYSQLHOST,
  port: process.env.MYSQLPORT,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
});

// connetct를 추가해야 된다.
db.connect();

app.use('/main', main);
app.use('/cart', cart);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

export default app;
