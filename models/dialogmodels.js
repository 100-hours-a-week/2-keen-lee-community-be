const fs = require('fs');
const path = require('path');

// 파일 경로
const dialogPath = path.join(__dirname, '../DATA', '/dialoglist.json');
const filePath = path.join(__dirname, '../DATA', '/Users.json');
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
const addview = async (id, no, res) => {
    try {
        let dialogs = await readDialogs();
        const selectdia=dialogs.findIndex(user => user.list == no)
        if(dialogs[selectdia].id === id){
            dialogs[selectdia].views=dialogs[selectdia].views+1;
            await fs.promises.writeFile(dialogPath, JSON.stringify(dialogs, null, 2), 'utf8');
            res.status(201).json(dialogs[selectdia]);
        }
    } catch (error) {
        throw new Error('Error reading dialoglist.json');
    }
};
// 다이얼로그 저장
const saveDialog = async (dialogId, dialogData) => {
    try {
        let today = new Date();   
        const date = today.getFullYear() + '-' + (today.getMonth()+1) + '-' + today.getDate() + " " + today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
        let dialogs = await readDialogs();
        const dialogData2 = dialogData;
        const dialogId2 = dialogId;
        const dialog = {
            ...dialogData2,
            list : dialogs.length+1,
            id :dialogId2.id,
            good: [],
            views: 0,
            comment: 0,
            createdate: date,
            cmt: []
        };
        dialogs.push(dialog);
       await fs.promises.writeFile(dialogPath, JSON.stringify(dialogs, null, 2), 'utf8');
    } catch (error) {
        throw new Error('Error saving dialog to dialoglist.json');
    }
};

const goodcnt = async (dialogId, no) => {
    try {
        let dialogs = await readDialogs();
        const selectdia=dialogs.findIndex(user => user.list == no)
            if(dialogs[selectdia].id === dialogId){
                const selectnick =dialogs[selectdia].good;
                    return selectnick;
            }
        } catch (error) {
        throw new Error('Error saving dialog to dialoglist.json');
    }
};

const good = async (dialogId, nick, no) => {
    try {
        let dialogs = await readDialogs();
        const selectdia=dialogs.findIndex(user => user.list == no)
        if(dialogs[selectdia].id === dialogId){
            const selectnick =dialogs[selectdia].good.findIndex(nickname => nickname.nickname === nick)
            if(selectnick === -1){
                dialogs[selectdia].good.push({"nickname" : nick});
                await fs.promises.writeFile(dialogPath, JSON.stringify(dialogs, null, 2), 'utf8');
                return {good: 1,message:"좋아요 등록"};
            }
        }
        
    } catch (error) {
        throw new Error('Error saving dialog to dialoglist.json');
    }
};

const ungood = async (dialogId, nick, no) => {
    try {
        let dialogs = await readDialogs();
        const selectdia=dialogs.findIndex(user => user.list == no)
        if(dialogs[selectdia].id === dialogId){
            const selectnick =dialogs[selectdia].good.findIndex(nickname => nickname.nickname === nick)
            if(selectnick !== -1){
                dialogs[selectdia].good.splice(selectnick, 1);
                await fs.promises.writeFile(dialogPath, JSON.stringify(dialogs, null, 2), 'utf8');
                return {good: 0,message:"좋아요 취소"};
            }
            
        }
        
    } catch (error) {
        throw new Error('Error saving dialog to dialoglist.json');
    }
};

// 다이얼로그 삭제
const deleteDialog = async (dialogId, nick, no) => {
    try {
        let dialogs = await readDialogs();
        const dialogIndex=dialogs.findIndex(dialog => dialog.list === Number(no));
        if(dialogs[dialogIndex].id === dialogId && nick ===dialogs[dialogIndex].id){
            let i =1;
            dialogs = dialogs.filter(dialog => dialog.list !== Number(no));
            dialogs.forEach(element => { element.list = i;
                i++;
            })
            await fs.promises.writeFile(dialogPath, JSON.stringify(dialogs, null, 2), 'utf8');    
        }
        
    } catch (error) {
        throw new Error('Error deleting dialog from dialoglist.json');
    }
};

const getupdateDialog = async (dialogId, nick, no) => {
    try{
        let dialogs = await readDialogs();
        const dialogIndex = dialogs.findIndex(dialog => dialog.list === Number(no));
        if(dialogId === nick){
            if (dialogIndex !== -1) {
                return dialogs[dialogIndex];
            }
        }
    } catch (error) {
        throw new Error('Error getupdating dialog');
    }
}    

// 다이얼로그 수정
const updateDialog = async (dialogId, nick, no, updatedData) => {
    try {
        let dialogs = await readDialogs();
        const dialogIndex = dialogs.findIndex(dialog => dialog.list === Number(no));
        if(dialogId === nick){
            if (dialogIndex !== -1) {
                dialogs[dialogIndex] = { ...dialogs[dialogIndex], ...updatedData };
                await fs.promises.writeFile(dialogPath, JSON.stringify(dialogs, null, 2), 'utf8');
            }
        }
        
    } catch (error) {
        throw new Error('Error updating dialog');
    }
};

//다이얼로그댓글추가
const addComment = async (dialogId, nick, index, updatedData)=> {
    try{
        let dialogs = await readDialogs();
        const dialogIndex = dialogs.findIndex(dialog => dialog.list === Number(index));
        if(dialogIndex !== -1 && dialogs[dialogIndex].id === dialogId){
            if(nick === updatedData.id){
                const data = updatedData;
                dialogs[dialogIndex].cmt.push(data);
                await fs.promises.writeFile(dialogPath, JSON.stringify(dialogs, null, 2), 'utf8');
            }
        }
    }catch (error) {
            throw new Error('Error updating dialog');
        }
        
};

// 다이얼로그 댓글 수정
const updateComment = async (dialogId, nick, i, cmt2) => {
    try {
        const dialogData = await readDialogs();
        const dialogItem = dialogData.find(item => item.id === dialogId);
        
        if (!dialogItem) {
            return res.status(404).json({ message: '해당 다이얼로그를 찾을 수 없습니다.' });
        }

        const commentIndex = dialogItem.cmt.find(item => item.no === Number(i) + 1);

        if (!commentIndex) {
            return res.status(404).json({ message: '댓글 내용이 없습니다.' });
        }

        if (commentIndex.id !== nick) {
            return res.status(403).json({ message: '댓글 작성자가 일치하지 않습니다.' });
        }
        let today = new Date();   
        const date = today.getFullYear() + '-' + (today.getMonth()+1) + '-' + today.getDate() + " " + today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();        
        commentIndex.cmt =cmt2.cmt;
        commentIndex.date =date;

        await fs.promises.writeFile(dialogPath, JSON.stringify(dialogData, null, 2), 'utf8');

        return { status: 200, message: '댓글이 성공적으로 수정되었습니다.' };
    } catch (error) {
        console.error('댓글 수정 오류:', error.message);
        return { status: 500, message: '댓글 수정 중 오류 발생' };
    }
};


//댓글 삭제
const deleteComment = async (id, no, i, commentData) =>{
    let dialogs = await readDialogs();
    const dialogIndex = dialogs.findIndex(dialog => dialog.list === Number(no));
    if(dialogs[dialogIndex].id === id){
        const commentIndex = dialogs[dialogIndex].cmt.findIndex(user => user.no === Number(i));
    if ( commentIndex!== -1) {
        dialogs[dialogIndex].cmt.splice(commentIndex, 1);
        let i = 1;
        dialogs[dialogIndex].cmt.forEach(element => {
            element.no = i;
            i++;
        });
        await fs.promises.writeFile(dialogPath, JSON.stringify(dialogs, null, 2), 'utf8');
    }
    }
    
}


const selectComment = async (dialogId, nick, index) =>{
    const dialogData = await readDialogs();
    const dialogItem = dialogData.find(item => item.id === dialogId);
    if (!dialogItem) {
        return res.status(404).json({ message: '해당 다이얼로그를 찾을 수 없습니다.' });
    }
    const commentIndex= dialogItem.cmt.filter(item => item.no == Number(index)+1);
    
    const commentIndex2 =JSON.stringify(commentIndex[0]);
    const commentIndex3 =JSON.parse(commentIndex2);
    
    if (!commentIndex || commentIndex3.id !== nick) {
        return res.status(404).json({ message: '댓글 내용이 없습니다.' });
    }
    return commentIndex3;

} 
module.exports = {
    readDialogs,
    addview,
    saveDialog,
    goodcnt,
    good,
    ungood,
    deleteDialog,
    getupdateDialog,
    updateDialog,
    addComment,
    updateComment,
    deleteComment,
    selectComment,
};
