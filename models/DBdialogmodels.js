import path from 'path'

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dialogPath = path.resolve(__dirname, '../DATA/dialoglist.json');

import * as db from '../database/connect/mariadb.js';

// 다이얼로그 데이터 읽기
const readDialogs = async () => {
    try {
        const rows = await db.readDialogs();
        if (rows) {
            return rows;
        }
        return [];
    } catch (error) {
        throw new Error('Error reading dialoglist.json');
    }
};
const addview = async (id, no, username, res) => {
    try {
        let dialogs = await readDialogs();
        const selectdia=dialogs.findIndex(user => user.list == no)
        if(dialogs[selectdia].id === id){
            const rows = await db.selectDialog(id, no);
            res.status(201).json({data:rows, "username":username});
        }
    } catch (error) {
        throw new Error('Error reading dialoglist.json');
    }
};


const selectcomment = async (id, no, res) => {
    try {
        if(id){
            const rows = await db.selectcomment(id, no);
            res.status(201).json({data:rows});
        }
    } catch (error) {
        throw new Error('Error reading dialoglist.json');
    }
};

// 다이얼로그 저장
const saveDialog = async (username, dialogData) => {
    try {
        let today = new Date();
        const date = today.getFullYear() + '-' + (today.getMonth()+1) + '-' + today.getDate() + " " + today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
        let dialogs = await readDialogs();
        const dialogData2 = dialogData;
        if(!dialogData2.contentimgname){
            dialogData2.contentimgname = '';
        }
        const dialogId2 = username;
        const views = 0;
        await db.saveDialog(dialogs.length+1, dialogData2.title, dialogData2.content, dialogData2.contentimgname, dialogId2, date, views);
    } catch (error) {
        throw new Error('Error saving dialog to dialoglist.json');
    }
};

const goodcnt = async (dialogId, no) => {
    try {
        let dialogs = await readDialogs();
        
        const selectdia=dialogs.findIndex(user => user.list == no)
        console.log(dialogs[selectdia]);
            if(dialogs[selectdia].id === dialogId){
                const selectnick =db.selectgood(no);//dialogs[selectdia].good;
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
        console.log(dialogs[selectdia]);
        if(dialogs[selectdia].id === dialogId){
            const data = await db.selectgood(no);
            const selectnick = data.findIndex(nickname => nickname.nickname === nick);//dialogs[selectdia].good.findIndex(nickname => nickname.nickname === nick)
            if(selectnick === -1){
                await db.good(no, nick);
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
            const data = await db.selectgood(no);
            const selectnick =data.findIndex(nickname => nickname.nickname === nick);//dialogs[selectdia].good.findIndex(nickname => nickname.nickname === nick)
            if(selectnick !== -1){
                await db.ungood(no, nick);
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
        if(dialogs[dialogIndex].id === dialogId && nick === dialogs[dialogIndex].id){
            await db.deleteDialog(no);
        }
        
    } catch (error) {
        throw new Error('Error deleting dialog from dialoglist.json');
    }
};

const getupdateDialog = async (username, no) => {
    try{
        let dialogs = await readDialogs();
        const dialogIndex = dialogs.findIndex(dialog => dialog.list === Number(no));
        if(username === dialogs[dialogIndex].id){
            if (dialogIndex !== -1) {
                return dialogs[dialogIndex];
            }
        }
        else{
            console.log('잘못된 접근입니다.');
        }
    } catch (error) {
        throw new Error('Error getupdating dialog');
    }
}    

// 다이얼로그 수정
const updateDialog = async (username, no, updatedData) => {
    try {
        let dialogs = await readDialogs();
        const dialogIndex = dialogs.findIndex(dialog => dialog.list === Number(no));
        if(username === dialogs[dialogIndex].id){
            if (dialogIndex !== -1) {
                await db.updatedialog(no, updatedData);
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
            await db.addComment(nick,index, updatedData);
        }
    }catch (error) {
            throw new Error('Error updating dialog');
        }
        
};

// 다이얼로그 댓글 수정
const updateComment = async (no, nick, i, cmt2) => {
    try {
        const dialogData = await readDialogs();
        const dialogItem = dialogData.find(item => item.list == no);
        
        if (!dialogItem) {
            return res.status(404).json({ message: '해당 다이얼로그를 찾을 수 없습니다.' });
        }
        
        const row = await db.getcomment(no, nick, i);
        console.log(row, no, nick, i, cmt2)

        if (!row) {
            return res.status(404).json({ message: '댓글 내용이 없습니다.' });
        }

        if (row[0].id !== nick) {
            return res.status(403).json({ message: '댓글 작성자가 일치하지 않습니다.' });
        }
        let today = new Date();   
        const date = today.getFullYear() + '-' + (today.getMonth()+1) + '-' + today.getDate() + " " + today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
        await db.updatecomment(no, i, date, cmt2.cmt);

        return { status: 200, message: '댓글이 성공적으로 수정되었습니다.' };
    } catch (error) {
        console.error('댓글 수정 오류:', error.message);
        return { status: 500, message: '댓글 수정 중 오류 발생' };
    }
};


//댓글 삭제
const deleteComment = async (id, no, i) =>{
    let dialogs = await readDialogs();
    const dialogIndex = dialogs.findIndex(dialog => dialog.list === Number(no));
    if(dialogs[dialogIndex].id === id){
        await db.deleteComment(no, i);
    }
}


const selectComment = async (no, nick, index) =>{
    const dialogData = await readDialogs();
    const dialogItem = dialogData.find(item => item.list == no);
    
    if (!dialogItem) {
        return res.status(404).json({ message: '해당 다이얼로그를 찾을 수 없습니다.' });
    }
    const commentIndex= await db.getcomment(no, nick, index);//dialogItem.cmt.filter(item => item.no == Number(index)+1);
    const commentIndex2 = commentIndex[0];
    
    if (!commentIndex || commentIndex2.id !== nick) {
        return res.status(404).json({ message: '댓글 내용이 없습니다.' });
    }
    return commentIndex2;

} 
export {
    readDialogs,
    addview,
    selectcomment,
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
