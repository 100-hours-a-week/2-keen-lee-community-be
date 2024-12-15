const fs = require('fs');
const { findSourceMap } = require('module');
const path = require('path');
const { readDialog } = require('../controllers/dialogcontroller');

// 파일 경로
const filePath = path.join(__dirname, '../DATA', '/Users.json');
const dialogPath = path.join(__dirname, '../DATA', '/dialoglist.json');
const emailreg =
    /(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/;
const nickreg = /^(?=.*\s).{0,10}$/;  // 띄어쓰기 포함하는지 검사
const nick11 = /^.{11,}$/;
const passwordreg =
    /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,20}$/;


    
// 사용자 데이터 읽기
const readUsers = async () => {
    try {
        if (fs.existsSync(filePath)) {
            const fileContent = await fs.promises.readFile(filePath, 'utf8');
            return JSON.parse(fileContent);
        }
        return [];
    } catch (error) {
        throw new Error('Error reading Users.json');
    }
};


const getUser = async (nickname, res) => {
    try{ 
        let users = await readUsers();
        const userIndex =users.findIndex(user => user.nickname === nickname);
        const getimg =users[userIndex].img;
        return res.status(200).json(getimg);
    } catch(error) {
        throw new Error('Error reading Users.json');
    }
}


// 다이얼로그 데이터 읽기
const readDialogs = async () => {
    try {
        if (fs.existsSync(dialogPath)) {
            const fileContent = await fs.promises.readFile(dialogPath, 'utf8');
            return JSON.parse(fileContent);
        }
        return [];
    } catch (error) {
        throw new Error('Error reading dialoglist.json');
    }
};

// 사용자 데이터 저장, 사용자 등록
const saveUser = async (email, password, nickname, img, res) => {
    try {
        let users = await readUsers();
        const emailExists = users.some(user => user.email === email);
        const nicknameExists = users.some(user => user.nickname === nickname);
        
        // 유효성 검사
        const emaileff = email && emailreg.test(email);
        const nicknameeff = nickname && !nickreg.test(nickname) && !nick11.test(nickname);
        const passwordff = passwordreg.test(password);

        if (!emaileff) {
            return res.status(401).json({ 'invalid_requestError': '이메일형식이 아닙니다.', 'status_num': 1 });
        }
        else if (emailExists) {
            return res.status(401).json({ 'invalid_requestError': '중복된 이메일입니다.', 'status_num': 3 });
        }
        else if (!passwordff) {
            return res.status(401).json({ 'invalid_requestError': '비밀번호 형식에 맞춰주세요.', 'status_num': 5 });
        }
        else if (!nicknameeff) {
            return res.status(401).json({ 'invalid_requestError': '닉네임형식이 틀립니다.', 'status_num': 2 });
        }
        else if (nicknameExists) {
            return res.status(401).json({ 'invalid_requestError': '중복된 닉네임입니다.', 'status_num': 4 });
        }
        

        // 유효한 데이터면 사용자 추가
        const newUser = {
            email: email,
            password: password,
            nickname: nickname,
            img: img
        };
        
        users.push(newUser);
        await fs.promises.writeFile(filePath, JSON.stringify(users, null, 2), 'utf8');

        // 성공 응답을 한 번만 보냄
        return res.status(200).json({"message": "회원가입성공!", "user_id": 1});
    } catch (error) {
        // 오류 발생시 한 번만 응답 보내도록 함
        console.error(error);
        return res.status(500).json({ 'error': '서버 오류가 발생했습니다.' });
    }
};


//유저 로그인
const login = async (email, password, res) => {
    try {
        let users = await readUsers();
        
        const findemail = users.find(user => user.email === email)
        if(findemail.password === password){
            res.status(200).json({"message" : "로그인 성공~", "user_id" : 1, "nickname" : findemail.nickname});
        }
        else{
            res.status(409).json({"message" : "로그인 실패~", "user_id" : 0})
        }
    } catch (error){
        return res.status(500).json({"message" : "서버 응답에 오류 발생"});
    }
}

 //id맞는 유저 프로필이미지 불러오기
const getimg = async (id, res) => {
    try {
        let users = await readUsers();
        
        const findnickname = users.find(user => user.nickname === id)
        if(findnickname.nickname === id){
            res.status(200).json({"message" : "이미지 로드성공", "img": findnickname.img});
        }
    } catch (error){
        return res.status(500).json({"message" : "서버 응답에 오류 발생"});
    }
}

const getinfo = async (nickname, res) => {
    try {
        let users = await readUsers();
        
        const findinfo = users.find(user => user.nickname === nickname.id)
        console.log(findinfo)
        return res.status(200).json({"email":findinfo.email, "nickname" :findinfo.nickname, img:findinfo.img});
    } catch (error){
        return res.status(500).json({"message" : "서버 응답에 오류 발생"});
    }
}


const patchinfo = async (img, nickname, email, res) => {
    try{
        let users = await readUsers();
        const selectinfo=users.find(user => user.email === email);
        if(!nick11.test(nickname) && !nickreg.test(nickname) && nickname){    
            if(selectinfo.nickname === nickname){
                users.forEach(user => {
                    if(user.nickname === selectinfo.nickname){
                        user.img =img;
                        if(img !== null){
                            user.img =img;
                        }
                    }
                })
                await fs.promises.writeFile(filePath, JSON.stringify(users, null, 2), 'utf8');
                return res.status(201).json({"message": '정보 변경성공~.', "user_id" :1});
            }
            else if(users.some(user => user.nickname === nickname)){
                    return res.status(409).json({"message": '중복된 닉네임입니다.', "nickname" :nickname});
            }
            else{
                /// 게시글, 게시글 댓글, 게시글 좋아요 닉네임 변경 하는 로직 추가 해야함
                let dialog = await readDialogs();
                dialog.forEach(element => {
                    if(element.id===selectinfo.nickname){
                    element.id=nickname;
                    element.image = img;
                    }
                    element.cmt.forEach(element2 => {
                        if(element2.id === selectinfo.nickname){
                            element2.id = nickname;
                        }
                    })
                    element.good.forEach(element3 => {
                        if(element3.nickname === selectinfo.nickname){
                            element3.nickname = nickname;
                        }
                    })
                    
                });
                users.forEach(user => {
                    if(user.nickname === selectinfo.nickname){
                        user.nickname = nickname;
                        user.img =img;
                        console.log(img);
                        if(img !== null){
                            user.img =img;
                        }
                    }
                })
                await fs.promises.writeFile(filePath, JSON.stringify(users, null, 2), 'utf8');
                await fs.promises.writeFile(dialogPath, JSON.stringify(dialog, null, 2), 'utf8');
                return res.status(201).json({"message": '정보 변경성공~.', "user_id" :1});
            }
        }
        else{
            return res.status(402).json({"message" : "닉네임이 형식에 맞지 않습니다."});
        }
        
    } catch (error) {
        return res.status(500).json({"message" : "서버 응답에 오류 발생"});
    }
}
// 사용자 삭제
const deleteUser = async (email) => {
    try {
        let users = await readUsers();
        let dialog = await readDialogs();
        const nickname = users.find(user => user.email === email);
        users = users.filter(user => user.email !== email);
        dialog = dialog.filter(element => element.id !== nickname.nickname)



        let count = 1;
        dialog.forEach(element => {
            element.list = count;
            count++;
            
            let count2 = 1;
            let filtercmt=element.cmt.filter(element2 => element2.id !== nickname.nickname);
            
            filtercmt.forEach(element2 => {
                element2.no = count2;
                count2++;
            });
            element.cmt = filtercmt;
        });
        
        
        
         await fs.promises.writeFile(dialogPath, JSON.stringify(dialog, null, 2), 'utf8');
         await fs.promises.writeFile(filePath, JSON.stringify(users, null, 2), 'utf8');
    } catch (error) {
        throw new Error('Error deleting user from Users.json');
    }
};

// 비밀번호 변경
const updatePassword = async (nickname, newPassword) => {
    try {
        let users = await readUsers();
        const userIndex = users.findIndex(user => user.nickname === nickname);
        if (userIndex !== -1) {
            users[userIndex].password = newPassword;
            await fs.promises.writeFile(filePath, JSON.stringify(users, null, 2), 'utf8');
        }
    } catch (error) {
        throw new Error('Error updating password');
    }
};

//닉네임 변경
const updateNickname = async (nickname, email) => {
    try{
        let users = await readUsers();
        const userIndex = users.findIndex(user => user.email === email)
        if(userIndex !== -1) {
            users[userIndex].nickname = nickname;
            await fs.promises.writeFile(filePath, JSON.stringify(users, null, 2), 'utf8');
        }
    } catch (error) {
        throw new Error('Error updating nickname');
    }
};




module.exports = {
    getUser,
    readUsers,
    readDialogs,
    saveUser,
    login,
    getimg,
    getinfo,
    patchinfo,
    deleteUser,
    updatePassword,
    updateNickname,
};
