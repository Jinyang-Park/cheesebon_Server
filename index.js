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

app.use('/main', main);
app.use('/cart', cart);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/upload', upload.array('photos'), (req, res) => {
  res.send(req.files);
});

// GET /health 요청에 대해 상태코드 200으로 응답하는 API
app.get('/health', (req, res) => {
  res.status(200).send('Success Heatlth Check');
});

app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${process.env.PORT}`);
});

export default app;
