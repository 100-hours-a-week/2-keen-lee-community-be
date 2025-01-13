const userModel = require('../models/userModels');
const passwordreg =
    /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,20}$/;

const getUser = async (req, res) => {
    try{
        const nickname = req.params.id;
        await userModel.getUser(nickname, res);
    } catch (error) {
        res.status(500).json({ message: 'Error saving user', error: error.message });
    }
}

const emailcheck = async (req, res) => {
    try {
        const  email  = req.body;
        await userModel.emailcheck(email.email, res);
    } catch (error) {
        res.status(500).json({ message: 'Error saving user', error: error.message });
    }
};
const nicknamecheck = async (req, res) => {
    try {
        const  nickname  = req.body;
        await userModel.nicknamecheck(nickname.nickname, res);
    } catch (error) {
        res.status(500).json({ message: 'Error saving user', error: error.message });
    }
};

const saveUser = async (req, res) => {
    try {
        const { email, password, nickname, imgname, imgpath } = req.body;
        
        await userModel.saveUser(email, password, nickname, imgname, imgpath, res);
    } catch (error) {
        res.status(500).json({ message: 'Error saving user', error: error.message });
    }
};

const login = async (req, res) => {
    try {
        const {email, password} = req.body;

        await userModel.login(email, password, res);
    } catch (error) {
        res.status(500).json({ message: 'Error login user', error : error.message});
    }
}


const getimg = async (req, res) => {
    try {
        const id = req.params.id;

        await userModel.getimg(id, res);
    } catch (error) {
        res.status(500).json({ message: 'Error login user', error : error.message});
    }
}

const getinfo = async (req, res) => {
    try {
        const nickname = req.params;
        await userModel.getinfo(nickname, res);
    } catch (error) {
        res.status(500).json({message: 'Error get user info', error : error.message})
    }
}


const patchinfo = async (req, res) => {
    try {
        const { imgpath, imgname, nickname, email }= req.body;
        await userModel.patchinfo(imgpath, imgname, nickname, email, res);
        
    } catch (error) {
        res.status(500).json({message: 'Error patch user info', error : error.message})
    }
}
const deleteUser = async (req, res) => {
    try {
        const { email } = req.body;
        await userModel.deleteUser(email);
        res.status(200).json({ message: 'User deleted successfully!' , user_id : 1});
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
};

const updatePassword = async (req, res) => {
    try {
        const newPassword  = req.body;
        const nickname = req.params;
        if(!passwordreg.test(newPassword.password)){
            res.status(401).json({message: "비밀번호 형식을 지켜주세요!"});
        }
        await userModel.updatePassword(nickname.id, newPassword.password);
        res.status(200).json({ message: 'Password updated successfully!', user_id : 1 });
    } catch (error) {
        res.status(500).json({ message: 'Error updating password', error: error.message });
    }
};

const updateNickname = async (req, res) => { 
    try{
        const { email } = req.body;
        const {id} = req.params;
        await userModel.updateNickname(id, email);    //TODO : 고쳐야함 로직을 어디서 짜야하징
        // 이메일과 비밀번호 일치 여부 확인
        const user = users.find(user => user.nickname === dialogId);
        if(dialogId===req.body.nickname){
            return res.status(401).json({'error': '기존 닉네임과 동일합니다.'});
        } else if(users.find(user => user.nickname === req.body.nickname)){
            return res.status(401).json({'error': '중복된 닉네임이 있습니다.'});
        } else if(nick11.test(req.body.nickname)){
            return res.status(401).json({'error': '10글자 이상 입력되었습니다.'});
        } else if(nickreg.test(req.body.nickname)){
            return res.status(401).json({'error': '공백이 포함되었습니다.'});
        }
        if (!nick11.test(req.body.nickname)&&!nickreg.test(req.body.nickname)&&!dialogId!==req.body.nickname &&!users.find(user => user.nickname === req.body.nickname)) {
            // 로그인 성공시 json 형식으로 응답 보내기
            const userIndex = users.findIndex(user => user.nickname === dialogId);
            if (userIndex === -1) {
                return res.status(404).json({ 'error': '사용자를 찾을 수 없습니다.' });
            }
        
            // 닉네임 수정
            users[userIndex].nickname = req.body.nickname;
        
            await fs.promises.writeFile(filePath, JSON.stringify(users, null, 2), 'utf8');
            return res.status(200).json({"message": "닉네임 수정 성공!", "user_id": 1});
        } else {
            // 이메일 또는 비밀번호가 일치하지 않음
            return res.status(400).json({'error': 'invalid_request', 'message': '이메일 또는 비밀번호가 일치하지 않습니다.'});
        }
    }catch (error) {
        console.error('파일 처리 중 오류 발생:', error.message); // 에러 메시지만 출력
        return res.status(500).json({'error': 'internal_server_error', 'message': '서버 오류 발생'});
    }
}

module.exports = {
    getUser,
    emailcheck,
    nicknamecheck,
    saveUser,
    login,
    getimg,
    getinfo,
    patchinfo,
    deleteUser,
    updatePassword,
};
