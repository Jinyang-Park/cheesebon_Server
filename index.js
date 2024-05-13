import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
// import mysql from 'mysql2';
import mysql from 'mysql';
import cookieParser from 'cookie-parser';
import main from './src/router/main.js';
import cart from './src/router/cart.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    //서버간의 통신에서 쿠키를 사용하기 때문 true로 설정
    credentials: true,
  })
);
app.use(express.json({ extended: true }));

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.PORT || 3000}`);
});

// MYSQL
const db = mysql.createConnection({
  host: process.env.MYSQLHOST,
  // port: process.env.MYSQLPORT,
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
