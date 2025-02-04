import mariadb from 'mariadb';

// MariaDB 연결 풀 생성
const pool = mariadb.createPool({
  host: process.env.DB_HOST,  // MariaDB 호스트
  user: process.env.DB_USER,  // 사용자명
  password: process.env.DB_PASS,  // 비밀번호
  database: process.env.DB_NAME,  // 사용할 데이터베이스 dotenv로 하면 json 형식으로 잘 안나옴이상함
  connectionLimit: 5  // 최대 연결 수 (옵션)
});

// DB 연결을 얻는 함수
const getConnection =async () => {
  let conn;
  try {
    conn = await pool.getConnection();
    console.log('DB 연결 성공');
    return conn;
    
  } catch (err) {
    console.error('DB 연결 실패:', err);
  } finally {
    if (conn) conn.release(); // 사용 후 연결을 풀로 반환
  }
}

const getinfo = async (nickname) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(`SELECT email, nickname, imgname, imgpath FROM test.Users where nickname = '${nickname}'`);
    return rows;
  } catch (err) {
    console.error('DB 연결 실패:', err.message);
    throw err; 
  } finally {
    if (conn) conn.release();
  }
};

const login = async (email, password) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(`SELECT nickname from test.Users where email = '${email}' AND password = '${password}'`);
    return rows;
  } catch (err) {
    console.error('DB 연결 실패:', err.message);
    throw err; 
  } finally {
    if (conn) conn.release();
  }
};

const getimg = async (nickname) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(`SELECT imgname from test.Users where nickname = '${nickname}'`);
    return rows;
  } catch (err) {
    console.error('DB 연결 실패:', err.message);
    throw err; 
  } finally {
    if (conn) conn.release();
  }
};


 

const emailcheck = async (email) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(`SELECT email from test.Users where email = '${email}'`);
    return rows;
  } catch (err) {
    console.error('DB 연결 실패:', err.message);
    throw err; 
  } finally {
    if (conn) conn.release();
  }
};


const nicknamecheck = async (nickname) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(`SELECT nickname from test.Users where nickname = '${nickname}'`);
    return rows;
  } catch (err) {
    console.error('DB 연결 실패:', err.message);
    throw err; 
  } finally {
    if (conn) conn.release();
  }
};

const saveUser = async (data) => {
  let conn;
  try {
    conn = await pool.getConnection();

    await conn.query(`INSERT INTO test.Users (email, password, nickname, imgname, imgpath) VALUES ('${data.email}', '${data.password}', '${data.nickname}', '${data.imgname}', '${data.imgpath}')`);
  } catch (err) {
    console.error('DB 연결 실패:', err.message);
    throw err; 
  } finally {
    if (conn) conn.release();
  }
};


const getinfoemail = async (email) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(`SELECT email, nickname, imgname, imgpath FROM test.Users where email = '${email}'`);
    return rows;
  } catch (err) {
    console.error('DB 연결 실패:', err.message);
    throw err; 
  } finally {
    if (conn) conn.release();
  }
};


const getinfonickname = async (nickname, email) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(`SELECT nickname from test.Users where email != '${email}' AND nickname = '${nickname}'` );
    return rows;
  } catch (err) {
    console.error('DB 연결 실패:', err.message);
    throw err; 
  } finally {
    if (conn) conn.release();
  }
};

const patchinfo = async (imgpath, imgname, nickname, email) => {
  let conn;
  try {
    conn = await pool.getConnection();

    await conn.query(`UPDATE test.Users SET nickname = '${nickname}', imgname = '${imgname}', imgpath = '${imgpath}' WHERE email ='${email}'`);
  } catch (err) {
    console.error('DB 연결 실패:', err.message);
    throw err; 
  } finally {
    if (conn) conn.release();
  }
};

const deleteUser = async (nickname) => {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();
    await conn.query(`Delete from test.Users where nickname = '${nickname}'`);
    await conn.query(`SET @new_no1 = -1`);
    await conn.query(`UPDATE test.comment SET no = (@new_no1 := @new_no1 + 1) ORDER BY no`);
    await conn.query(`SET @new_no2 = 0`);
    await conn.query(`UPDATE test.Dialog SET list = (@new_no2 := @new_no2 + 1) ORDER BY list`);
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    console.error('DB 연결 실패:', err.message);
    throw err; 
  } finally {
    if (conn) conn.release();
  }
};


const updatePassword = async (nickname, newPassword) => {
  let conn;
  try {
    conn = await pool.getConnection();

    await conn.query(`UPDATE test.Users SET password = '${newPassword}' where nickname = '${nickname}'`);
  } catch (err) {
    console.error('DB 연결 실패:', err.message);
    throw err; 
  } finally {
    if (conn) conn.release();
  }
};



const readDialogs = async () => {
  let conn;
  try {
    conn = await pool.getConnection();

    const rows = await conn.query(`SELECT 
    d.list AS list,
    d.title AS title,
    d.content AS content,
    d.id AS id,
    d.date AS date,
    d.contentimgname AS contentimgname,
    d.views AS views,
    CAST(COALESCE(COUNT(c.no), 0) AS FLOAT) AS cmt,
    (SELECT CAST(COUNT(*) AS FLOAT) FROM test.good g where d.list = g.list) AS good
FROM 
    test.Dialog d
LEFT JOIN 
    test.comment c
ON
    d.list = c.list
LEFT JOIN
    test.good g
ON
    d.list = g.list
GROUP BY
    d.list, d.title, d.content, d.id, d.date, d.contentimgname, d.views;`);
    return rows;
  } catch (err) {
    console.error('DB 연결 실패:', err.message);
    throw err; 
  } finally {
    if (conn) conn.release();
  }
};


const selectDialog = async (id, no) => {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query(`UPDATE test.Dialog SET views = views+1 where id = '${id}' and list = ${no}`);
    const rows = await conn.query(`select d.*, (select CAST(COUNT(g.nickname) AS FLOAT) FROM test.good g WHERE g.list = '${no}') as good, (select CAST(COUNT(c.content) AS FLOAT) FROM test.comment c WHERE c.list = '${no}') as cmt from test.Dialog d where d.id = '${id}' AND d.list = '${no}'`);
  
    return rows[0];
  } catch (err) {
    console.error('DB 연결 실패:', err.message);
    throw err; 
  } finally {
    if (conn) conn.release();
  }
};

const selectcomment = async (id, no) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(`select no, id, content, date from test.comment where list = '${no}'`);
    if(!rows){
      return '댓글이 없습니다';
    }
    return rows;
  } catch (err) {
    console.error('DB 연결 실패:', err.message);
    throw err; 
  } finally {
    if (conn) conn.release();
  }
};

const addComment = async (nick, index, updatedData) => {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query(`INSERT INTO test.comment (no, id, content, date, list) VALUES((select COUNT(*) from test.comment c WHERE list = ${index}), '${nick}', '${updatedData.commentData.cmt}', '${updatedData.commentData.date}', ${index})`);
    console.log('댓글 작성 완료');
  } catch (err) {
    console.error('DB 연결 실패:', err.message);
    throw err; 
  } finally {
    if (conn) conn.release();
  }
};

const selectgood = async (no) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(`select nickname from test.good where list = ${no}`);
    return rows;
  } catch (err) {
    console.error('DB 연결 실패:', err.message);
    throw err; 
  } finally {
    if (conn) conn.release();
  }
};

const good = async (no, nick) => {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query(`INSERT into test.good (list, nickname) values (${no}, '${nick}');`);
  } catch (err) {
    console.error('DB 연결 실패:', err.message);
    throw err; 
  } finally {
    if (conn) conn.release();
  }
};


const ungood = async (no, nick) => {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query(`Delete from test.good where list = ${no} and nickname = '${nick}'`);
  } catch (err) {
    console.error('DB 연결 실패:', err.message);
    throw err; 
  } finally {
    if (conn) conn.release();
  }
};


const updatedialog = async (no, updatedData) => {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query(`UPDATE test.Dialog SET title = '${updatedData.title}', contentimgname = '${updatedData.contentimgname}', content = '${updatedData.content}' WHERE list =${no}`);
  } catch (err) {
    console.error('DB 연결 실패:', err.message);
    throw err; 
  } finally {
    if (conn) conn.release();
  }
};

const getcomment = async (no, nick, index) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(`select * from test.comment where no=${index} and id = '${nick}' and list = ${no}`);
    return rows;
  } catch (err) {
    console.error('DB 연결 실패:', err.message);
    throw err; 
  } finally {
    if (conn) conn.release();
  }
};


const updatecomment = async (no, i, date, content) => {
  let conn;
  try {
    conn = await pool.getConnection();
   await conn.query(`UPDATE test.comment SET content='${content}', date = '${date}' WHERE list = ${no} and no = ${i}`);
  } catch (err) {
    console.error('DB 연결 실패:', err.message);
    throw err; 
  } finally {
    if (conn) conn.release();
  }
};

const deleteComment = async (no, i) => {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();
    await conn.query(`delete from test.comment WHERE list = ${no} and no = ${i}`);
    await conn.query(`SET @new_no = -1`);
    await conn.query(`UPDATE test.comment SET no = (@new_no := @new_no + 1) where list = ${no} ORDER BY no`); //많이 비효율적임..
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    console.error('DB 연결 실패:', err.message);
    throw err; 
  } finally {
    if (conn) conn.release();
  }
};

const deleteDialog = async (no) => {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();
    await conn.query(`delete from test.Dialog WHERE list = ${no}`);
    await conn.query(`SET @new_no = 0`);
    await conn.query(`UPDATE test.Dialog SET list = (@new_no := @new_no + 1) ORDER BY list`);
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    console.error('DB 연결 실패:', err.message);
    throw err; 
  } finally {
    if (conn) conn.release();
  }
};

const saveDialog = async (list, title, content, contentimgname, id, date, views) => {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query(`INSERT INTO test.Dialog (list, title, content, contentimgname, id, date, views) VALUES (${list}, '${title}', '${content}', '${contentimgname}', '${id}', '${date}', ${views})`);
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    console.error('DB 연결 실패:', err.message);
    throw err; 
  } finally {
    if (conn) conn.release();
  }
};

export {pool,
        getConnection,
        getinfo,
        login,
        getimg,
        emailcheck,
        nicknamecheck,
        saveUser,
        getinfoemail,
        patchinfo,
        getinfonickname,
        deleteUser,
        updatePassword,
        readDialogs,
        selectDialog,
        selectcomment,
        addComment,
        selectgood,
        good,
        ungood,
        updatedialog,
        getcomment,
        updatecomment,
        deleteComment,
        deleteDialog,
        saveDialog
      };