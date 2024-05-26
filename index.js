// 환경 변수 설정
require('dotenv').config();

// 필요한 모듈 임포트
const express = require('express');
const cors = require('cors');
const mysql = require('mysql'); // mysql 모듈은 예시 코드에서 직접 사용하지 않지만, 필요하다고 명시됨
const cookieParser = require('cookie-parser');

// multer와 S3 관련 설정
const multer = require('multer');
const multerS3 = require('multer-s3');
const { S3Client } = require('@aws-sdk/client-s3');
import jwt from 'jsonwebtoken';
import cart from './src/router/cart';

const app = express();

app.use(cookieParser());

app.use(
  cors({
    origin: 'https://atelier-de-cheesebon.com', // 배포된 도메인 허용
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    //서버간의 통신에서 쿠키를 사용하기 때문 true로 설정
    credentials: true,
  })
);
app.use(express.json({ extended: true }));

//S3
const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  region: 'ap-northeast-2',
});

// 이미지 파일 업로드
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET,
    key: function (req, file, cb) {
      cb(null, file.originalname);
    },
  }),
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

// 유저 인증 미들웨어
const verifyUser = (req, res, next) => {
  // const token = req.cooies.token; // 스펠링이 에러의 원인
  const token = req.cookies.token;
  // token이 없을 경우
  if (!token) {
    return res.status(401).send({ message: 'not-authenticated' });
  } else {
    jwt.verify(token, 'jwt-secret-key', (err, decoded) => {
      // 에러일 경우
      if (err) {
        return res.status(401).send({ message: 'Token is not okay' });
      } else {
        // token이 존재할 경우
        // req.name은 로그인(모든 유효성 검사에 통과한)이 될 경우 그 유저의 UserName이다.
        // 로그인 부분에서  const name = results[0].username; 모든것이 일치할 경우 0번째의 인덱스인 username을 가져오는것이다.
        // const token = jwt.sign({ name })는 구조 분해 할당이 아닌 const person1 = { name: name, age: age } 이런식으로
        // name 키를 가지고 있고 원래 변수 name의 값을 포함하는것이다.
        // const token = jwt.sign({ name }, 'jwt-secret-key', { expiresIn: '1d',});
        req.name = decoded.name;
        req.userid = decoded.userid;
        // console.log(req.name); // 로그인시 username이 찍힌다.
        next();
      }
    });
  }
};

// API 경로 설정
app.use('/api/cart', cart);

// 메인화면
app.get('/api/users/header', verifyUser, (req, res) => {
  return res
    .status(200)
    .send({ message: 'success', name: req.name, userid: req.userid });
});

// MYSQL 회원가입 및 이메일 중복 검사
app.post('/api/users/signup', (req, res) => {
  const sentEmail = req.body.Email;
  const sentUserName = req.body.UserName;
  const sentPassword = req.body.Password;
  try {
    db.query(
      'SELECT COUNT(*) as count FROM users WHERE email = ?',
      [sentEmail],
      (err, rows, fields) => {
        if (err) {
          console.error(err);
          res.status(500).send({ message: 'Database error' });
        } else if (rows[0].count > 0) {
          // 이미 존재하는 이메일인 경우 처리
          res.send({ message: 'already-in-use' });
        } else {
          // 이메일이 중복되지 않은 경우 회원가입 진행
          db.query(
            'INSERT INTO users (email, username, password) values (?,?,?)',
            [sentEmail, sentUserName, sentPassword],
            (err, results) => {
              if (err) {
                console.log('err');
              } else {
                console.log('success');
                res.send({ message: 'user-added' });
              }
            }
          );
        }
      }
    );
  } catch (error) {
    res.send({ message: 'error' });
  }
});

// MYSQL 로그인
app.post('/api/users/login', (req, res) => {
  const sentEmail = req.body.Email;
  const sentPassword = req.body.Password;

  db.query(
    'SELECT * FROM users WHERE email = ? && password = ?',
    [sentEmail, sentPassword],
    (err, results) => {
      if (err) {
        console.log('err');
        res.send(err);
      }
      if (results.length > 0) {
        // 성공했을 경우
        const userid = results[0].id;
        const name = results[0].username;
        const token = jwt.sign({ name, userid }, 'jwt-secret-key', {
          expiresIn: '1d',
        });
        res.cookie('token', token);
        res.status(200).send({ message: 'success', userid });
      } else {
        // 입력한 이메일 주소가 일치하지 않을 경우
        res.status(401).send({ message: 'user-not-found' });
      }
    }
  );
});

// MYSQL 로그아웃
app.post('/api/users/logout', (req, res) => {
  res.clearCookie('token');
  return res.status(200).send({ message: 'success' });
});

// 닉네임 변경
app.put('/api/users/:userId', (req, res) => {
  const userId = req.params.userId;
  const newUsername = req.body.NewUsername;

  db.query(
    'UPDATE users SET username = ? WHERE id =?',
    [newUsername, userId],
    (error, results) => {
      if (error) {
        console.log(error);
        res.status(500).send({ message: 'Server Error' });
      } else {
        console.log('NewUsername changed successful');
        res.status(200).send({ message: 'username-updated' });
      }
    }
  );
});

// 서버 동작
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// S3
app.post('/api/upload', upload.array('photos'), (req, res) => {
  res.send(req.files);
});

// GET /health 요청에 대해 상태코드 200으로 응답하는 API
app.get('/api/health', (req, res) => {
  res.status(200).send('Success Heatlth Check');
});

app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${process.env.PORT}`);
});

export default app;
