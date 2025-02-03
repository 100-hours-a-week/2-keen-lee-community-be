import fs from 'fs'
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.resolve(__dirname, '../DATA/Users.json');
const dialogPath = path.resolve(__dirname, '../DATA/dialoglist.json');

import * as db from '../database/connect/mariadb.js';

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

const emailcheck = async (email, res) => {
    try {
        const emailExists = await db.emailcheck(email);
        let result = emailExists[0];
        if(!result){
            result= false;
        }
        else{
            result=result.email;
        }
        
        const emaileff = email && emailreg.test(email);
        
        if (!emaileff) {
            return res.status(400).json({ 'message': '이메일형식이 아닙니다.', 'status_num': 1 });
        }
        else if (result) {
            return res.status(409).json({ 'message': '중복된 이메일입니다.', 'status_num': 3 });
        }
        // 성공 응답을 한 번만 보냄
        return res.status(200).json({"message": "", "user_id": 1});
    } catch (error) {
        // 오류 발생시 한 번만 응답 보내도록 함
        console.error(error);
        return res.status(500).json({ 'error': '서버 오류가 발생했습니다.' });
    }
};

const nicknamecheck = async (nickname, res) => {
    try {
        const nicknameExists = await db.nicknamecheck(nickname);
        let result = nicknameExists[0];
        if(!result){
            result= false;
        }
        else{
            result=result.nickname;
        }

        const nicknameeff = nickname && !nickreg.test(nickname) && !nick11.test(nickname);

        if (!nicknameeff) {
            return res.status(401).json({ 'message': '닉네임형식이 틀립니다.', 'status_num': 2 });
        }
        else if (result) {
            return res.status(409).json({ 'message': '중복된 닉네임입니다.', 'status_num': 4 });
        }
        // 성공 응답을 한 번만 보냄
        return res.status(200).json({"message": "", "user_id": 1});
    } catch (error) {
        // 오류 발생시 한 번만 응답 보내도록 함
        console.error(error);
        return res.status(500).json({ 'error': '서버 오류가 발생했습니다.' });
    }
};
// 사용자 데이터 저장, 사용자 등록
const saveUser = async (email, password, nickname, imgname, imgpath, res) => {
    try {
        const emailExists = await db.emailcheck(email);
        let resultemail = emailExists[0];
        if(!resultemail){
            resultemail= false;
        }
        else{
            resultemail=resultemail.email;
        }
        const nicknameExists = await db.nicknamecheck(nickname);
        let resultnickname = nicknameExists[0];
        if(!resultnickname){
            resultnickname= false;
        }
        else{
            resultnickname=resultnickname.nickname;
        }
        // 유효성 검사
        const emaileff = email && emailreg.test(email);
        const nicknameeff = nickname && !nickreg.test(nickname) && !nick11.test(nickname);
        const passwordff = passwordreg.test(password);

        if (!emaileff) {
            return res.status(401).json({ 'invalid_requestError': '이메일형식이 아닙니다.', 'status_num': 1 });
        }
        else if (resultemail) {
            return res.status(401).json({ 'invalid_requestError': '중복된 이메일입니다.', 'status_num': 3 });
        }
        else if (!passwordff) {
            return res.status(401).json({ 'invalid_requestError': '비밀번호 형식에 맞춰주세요.', 'status_num': 5 });
        }
        else if (!nicknameeff) {
            return res.status(401).json({ 'invalid_requestError': '닉네임형식이 틀립니다.', 'status_num': 2 });
        }
        else if (resultnickname) {
            return res.status(401).json({ 'invalid_requestError': '중복된 닉네임입니다.', 'status_num': 4 });
        }
        

        // 유효한 데이터면 사용자 추가
        const newUser = {
            email: email,
            password: password,
            nickname: nickname,
            imgname: imgname,
            imgpath: imgpath
        };
        
        db.saveUser(newUser);

        // 성공 응답을 한 번만 보냄
        return res.status(200).json({"message": "회원가입성공!", "user_id": 1});
    } catch (error) {
        // 오류 발생시 한 번만 응답 보내도록 함
        console.error(error);
        return res.status(500).json({ 'error': '서버 오류가 발생했습니다.' });
    }
};


//유저 로그인
const login = async (email, password) => {
    try {
        const rows = await db.login(email, password);
        const result = rows[0];
        if(result.nickname){
            return {"message" : "로그인 성공~", "user_id" : 1, "nickname" : result.nickname};
        }
        else{
            return json({"message" : "로그인 실패~", "user_id" : 0});
        }
    } catch (error){
            return json({"message" : "서버 응답에 오류 발생"});
    }
}

 //id맞는 유저 프로필이미지 불러오기
const getimg = async (id, res) => {
    try {
        const rows = await db.getimg(id);
        const result = rows[0];
        if(result.imgname){
            res.status(200).json(result.imgname);
        }
    } catch (error){
        return res.status(500).json({"message" : "서버 응답에 오류 발생"});
    }
}

const getinfo = async (nickname, res) => {
    try {
        const rows = await db.getinfo(nickname);
        return res.status(200).json({"email":rows[0].email, "nickname" :rows[0].nickname, "imgname":rows[0].imgname, "imgpath":rows[0].imgpath});
    } catch (error){
        return res.status(500).json({"message" : "서버 응답에 오류 발생"});
    }
}


const patchinfo = async (imgpath, imgname, nickname, email, res) => {
    try{
        const rows = await db.getinfoemail(email);
        const nicknamecheck = await db.getinfonickname(nickname, email);
        if(!nick11.test(nickname) && !nickreg.test(nickname) && nickname){
            if(rows[0].nickname === nickname){
                await db.patchinfo(imgpath, imgname, nickname, email);
                return ({"message": '정보 변경성공~.', "user_id" :1, "username": nickname});
            }
            else if(nicknamecheck.length){
                return res.status(409).json({"message": '중복된 닉네임입니다.', "nickname" :nickname});
            }
            else{
                await db.patchinfo(imgpath, imgname, nickname, email);
                return ({"message": '정보 변경성공~.', "user_id" :1, "username": nickname});
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
const deleteUser = async (username) => {
    try {
        await db.deleteUser(username);
    } catch (error) {
        throw new Error('Error deleting user from Users.json');
    }
};

// 비밀번호 변경
const updatePassword = async (nickname, newPassword) => {
    try {
        await db.updatePassword(nickname, newPassword);
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



export {
    readUsers,
    readDialogs,
    emailcheck,
    nicknamecheck,
    saveUser,
    login,
    getimg,
    getinfo,
    patchinfo,
    deleteUser,
    updatePassword,
    updateNickname,
};
