const mariadb = require('mariadb');

// MariaDB 연결 풀 생성
const pool = mariadb.createPool({
  host: process.env.DB_HOST,  // MariaDB 호스트
  user: process.env.DB_USER,  // 사용자명
  password: process.env.DB_PASS,  // 비밀번호
  database: process.env.DB_NAME,  // 사용할 데이터베이스 dotenv로 하면 json 형식으로 잘 안나옴이상함
  connectionLimit: 5  // 최대 연결 수 (옵션)
});

// DB 연결을 얻는 함수
async function getConnection() {
  let conn;
  try {
    // 연결 풀에서 커넥션 가져오기
    conn = await pool.getConnection();
    console.log('DB 연결 성공');
    // DB 작업을 여기에 추가
  } catch (err) {
    console.error('DB 연결 실패:', err);
  } finally {
    if (conn) conn.release(); // 사용 후 연결을 풀로 반환
  }
}

module.exports = pool, getConnection();  // 연결 풀 객체를 외부로 내보냄
