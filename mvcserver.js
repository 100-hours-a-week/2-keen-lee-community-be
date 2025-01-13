const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const timeout = require('connect-timeout'); // 리소스부하 방지
const cors = require('cors'); //cors방지
const RateLimit = require('express-rate-limit'); //DDOS방지
const helmet = require('helmet'); //xss 입력방지
const moment = require('moment'); // 현재 시각을 이용 하기 위한 모듈
let colors = require('colors'); // 로그에 색깔입히기 모듈
const path = require('path');
const multer = require('multer');
const fs = require('fs');
app.use(cors({origin: 'http://localhost:3001'}));


if (!fs.existsSync('POTO')) {
    console.log('POTO 폴더가 없습니다. 폴더를 생성합니다.');
    fs.mkdirSync('POTO');
}

// Multer 설정
const upload = multer({
    storage: multer.diskStorage({
        destination(req, file, cb) {
            cb(null, 'POTO/'); //cb는 콜백의 약자로 비동기 작업의 종료를 알림
        },
        filename(req, file, cb) {
            const ext = path.extname(file.originalname);
            const originalName = file.originalname; // 깨진 파일 이름
            const decodedName = Buffer.from(originalName, 'latin1').toString('utf8'); //latin1로 인코딩
            const fileName = `${path.basename(decodedName, ext)}-${Date.now()}${ext}`;
            cb(null, fileName);
        },
    }),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB 제한
});

// 파일 업로드 라우터
app.post('/image', upload.single('image'), (req, res) => {
    if (!req.file) {
        console.error('이미지가 없습니다. 기본 프로필로 대체됩니다.'.red);
        return res.status(201).json({ message: '기본이미지 업로드' });
   }
    console.log('업로드된 파일:', req.file);
    const ext = path.extname(req.file.originalname);
    console.log(ext);
    if(ext !== '.jpeg' && ext !=='.png'){
      return res.status(400).json({ message : '이미지 형식이 맞지 않습니다.'});
   }
    res.status(200).json({ message: '이미지 업로드 성공', filePath: req.file.path, filename: req.file.filename });
});
app.use('/image', express.static(path.join(__dirname, 'POTO')));

//* 사용량 제한 미들웨어. 도스 공격 방지
const apiLimiter = RateLimit({
   windowMs: 60 * 1000, // 1분 간격
   max: 120, // windowMs동안 최대 호출 횟수
   handler(req, res) { // 제한 초과 시 콜백 함수 
      res.status(this.statusCode).json({
         code: this.statusCode, // statusCode 기본값은 429
         message: '1분에 5번만 요청 할 수 있습니다.',
      });
   },
});
const dialogRoutes = require('./routes/dialogRouter.js');  // 경로 수정
const userRoutes = require('./routes/userRoutes.js');

const mariadb = require('./database/connect/mariadb.js');
async function getDataFromDB() {
   try {
      // 풀에서 연결을 가져오기
      const connection = await mariadb.getConnection();

      // SQL 쿼리 실행
      const rows = await connection.query("SELECT * FROM test.Users");


      connection.release();  // 연결 반환
      return rows;
   } catch (error) {
      console.error("Database query error:", error);
   }
}


const times = moment().format("YYYY-MM-DD")


//app.use(cors({ origin: 'http://127.0.0.1:5500' }));
// app.use(cors({origin: 'http://localhost:3001'}));
// app.use(cors());
app.use(bodyParser.json({ limit: '10mb' })); // JSON 요청 크기 10MB까지 허용
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true })); // URL-encoded 요청 크기 10MB까지 허용
app.use(timeout('2s'));
// 미들웨어 설정

app.use(bodyParser.json());  // POST 요청에서 JSON 데이터 처리
app.use('/dialog', apiLimiter); // /dialog로 들어오는 요청 제한
// 라우터 설정
app.use('/dialog', dialogRoutes);  // '/dialog' 경로에 dialogRoutes 라우터 연결
app.use('/users', userRoutes);
app.get('/data', async (req, res) => {
   const data = await getDataFromDB();  // 데이터베이스에서 데이터 가져오기
   res.json(data);  // 가져온 데이터를 클라이언트에 JSON으로 응답
});
app.use(helmet());
const port = 3000;
app.listen(port, () => {
   console.log("today", moment().add(0,"day").format("YYYY-MM-DD HH-mm-ss"));
  console.log(`Server running on port ${port}`.underline.random);
});