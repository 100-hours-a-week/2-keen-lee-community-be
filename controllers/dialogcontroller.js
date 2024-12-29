const { json } = require('express');
const dialogModel = require('../models/dialogmodels.js');

const readDialog = async (req, res) => {
    try{
        res.status(200).json(await dialogModel.readDialogs());
    }catch(error) {
        res.status(500).json({ message: 'Error reading dialog', error: error.message });
    }
}

const selectDialog = async (req, res) => {
    try {
        const { id, no } = req.params;
        const data=await dialogModel.readDialogs();
        const selectdia=data.findIndex(user => user.list == no)
        if(data[selectdia].id === id){
            dialogModel.addview(id, no, res); //호출 될때 view+1
            //res.status(201).json(data[selectdia]);
        }else {
            res.status(404).json({ message: '댓글 내용이 없습니다.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error saving dialog', error: error.message });
    }
}
const goodcnt = async (req, res) => {
    try {
        const { dialogId, no } = req.params;
            const goodcheck = await dialogModel.goodcnt(dialogId, no)
            res.status(201).json(goodcheck);
    } catch (error) {
        res.status(500).json({ message: 'Error saving dialog', error: error.message });
    }
}
const good = async (req, res) => {
    try {
        const { dialogId, nick, no } = req.params;
            const goodcheck = await dialogModel.good(dialogId, nick, no)
            res.status(201).json(goodcheck);
    } catch (error) {
        res.status(500).json({ message: 'Error saving dialog', error: error.message });
    }
}
const ungood = async (req, res) => {
    try {
        const { dialogId, nick, no } = req.params;
            const goodcheck = await dialogModel.ungood(dialogId, nick, no)
            res.status(201).json(goodcheck);
    } catch (error) {
        res.status(500).json({ message: 'Error saving dialog', error: error.message });
    }
}

const checkComment = async (req, res) => {
    const { id, nick, i } = req.params;
    try {
        const commentData = await dialogModel.selectComment(id, nick, i);
        res.status(200).json({ cmt :commentData.cmt, message: '댓글을 성공적으로 가져왔습니다.' });
    } catch (error) {
        console.error('파일 처리 중 오류 발생:', error.message);
        res.status(500).end('internal_server_error');
    }
}


const updateComment = async (req, res) => {
    try {
        const { id, nick, i } = req.params;
        const updatedData = req.body;
        await dialogModel.updateComment(id, nick, i, updatedData);
        res.status(200).json({ message: 'Dialog updated successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating dialog', error: error.message });
    }
};

const addComment = async (req, res) => {
    try{
        const id = req.params.id;
        const nick = req.params.nick;
        const i = req.params.no;
        const commentData = req.body;
        await dialogModel.addComment(id, nick, i, commentData);
        res.status(200).json({ message: 'Dialog updated successfully!' });
    } catch(error) {
        res.status(500).json({ message: 'Error addcmt dialog', error: error.message });
    }
}

const deleteComment = async (req, res) => {
    try{
        const { id, no, i }= req.params;
        const commentData = req.body;
        
        await dialogModel.deleteComment(id, no, i, commentData);
        res.status(200).json({ message: 'Dialog updated successfully!' });
    } catch(error) {
        res.status(500).json({ message: 'Error addcmt dialog', error: error.message });
    }
}
const saveDialog = async (req, res) => {
    try {
        const dialogId = req.params;
        const dialogData = req.body;
    
        await dialogModel.saveDialog(dialogId, dialogData);
        res.status(201).json({ message: 'Dialog posted successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Error saving dialog', error: error.message });
    }
};

const deleteDialog = async (req, res) => {
    try {
        const { id , nick, no} = req.params;
        const message = req.body;
        console.log(message.message);
        await dialogModel.deleteDialog(id,nick, no);
        res.status(200).json({ message: 'Dialog deleted successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting dialog', error: error.message });
    }
};

const getupdateDialog = async (req, res) => {
        try{
            const { id , nick, no} = req.params;
            res.status(200).json(await dialogModel.getupdateDialog(id, nick, no));
        } catch(error) {
            res.status(500).json({ message : 'Error getupdating dialog', error : error.message})
        }
}



const updateDialog = async (req, res) => {
    try {
        const { id , nick, no} = req.params;
        const updatedData = req.body;
        await dialogModel.updateDialog(id, nick, no,updatedData);
        res.status(200).json({ message: 'Dialog updated successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating dialog', error : error.message });
    }
};

module.exports = {
    selectDialog,
    goodcnt,
    good,
    ungood,
    checkComment,
    updateComment,
    readDialog,
    addComment,
    deleteComment,
    saveDialog,
    deleteDialog,
    getupdateDialog,
    updateDialog,
};
