import express from 'express'
import bodyParser from 'body-parser'
import timeout from 'connect-timeout' // 리소스부하 방지
import cors from 'cors'//cors방지
import RateLimit from 'express-rate-limit'//DDOS방지
import helmet from 'helmet'//xss 입력방지
import moment from 'moment'// 현재 시각을 이용 하기 위한 모듈
import colors from 'colors'// 로그에 색깔입히기 모듈
import path from 'path'
import multer from 'multer'
import session from 'express-session'
import cookieParser from 'cookie-parser'
import fs from 'fs'

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

import dialogRoutes from './routes/dialogRouter.js'; // default import
import userRoutes from './routes/userRoutes.js';

app.use(cors({origin: 'http://localhost:3001', credentials: true }));

app.use(cookieParser());
app.use(bodyParser.json());
app.use(
    session({
        secret: 'keen', // 세션 암호화 키
        resave: false,             // 세션 변경이 없을 경우 저장하지 않음
        saveUninitialized: true,   // 비어있는 세션도 저장
        cookie: {
            httpOnly: true,        // JavaScript에서 쿠키 접근 금지
            maxAge: 24 * 60 * 60 * 1000, // 1일
        },
    })
);


// 로그아웃 엔드포인트
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: '로그아웃 실패' });
        }
        res.clearCookie('connect.sid'); // 세션 쿠키 삭제
        res.json({ message: '로그아웃 완료' });
    });
});

// 로그인 상태 확인 엔드포인트
app.get('/status', (req, res) => {
    if (req.session.username) {
        res.json({ loggedIn: true, username: req.session.username });
    } else {
        res.json({ loggedIn: false });
    }
});


if (!fs.existsSync('POTO')) {
    console.log('POTO 폴더가 없습니다. 폴더를 생성합니다.');
    fs.mkdirSync('POTO');
}

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
    if(ext !== '.jpeg' && ext !=='.png'&& ext !=='.gif'){
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


import { getConnection } from'./database/connect/mariadb.js';
 const getDataFromDB = async () => {
   try {
      // 풀에서 연결을 가져오기
      const connection = await getConnection();

      connection.release();  // 연결 반환
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
//app.use(helmet());
app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'", 'https://localhost:3000'],
        scriptSrc: ["'self'", 'https://localhost:3000'],
      },
    },
    xssFilter: true,
    frameguard: { action: 'deny' },
  }));
const port = 3000;
app.listen(port, () => {
    fetch('http://localhost:3000/data')
    
    // const fetchDialogInfo = async () => {
    //     try {
    //       const data = await getinfo(1); // 반드시 await 사용
    //       console.log('쿼리 결과:', data);
    //     } catch (error) {
    //       console.error('에러:', error.message);
    //     }
    //   };
      
    //   fetchDialogInfo();
    console.log("today", moment().add(0,"day").format("YYYY-MM-DD HH-mm-ss"));
  console.log(`Server running on port ${port}`.underline.random);
});