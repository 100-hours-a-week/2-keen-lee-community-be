import express from 'express'
import * as dialogController from '../controllers/dialogcontroller.js'

const dialogrouter = express.Router();

dialogrouter.get('/', dialogController.readDialog);
dialogrouter.get('/writingpage/:dialogId/:no', dialogController.selectDialog); //TODO: 한 계정당 한개의 조회수 올라가는 API만들어야함
dialogrouter.get('/writingpage/comment/:dialogId/:no', dialogController.selectcomment);
dialogrouter.get('/goodcnt/:dialogId/:no', dialogController.goodcnt);
dialogrouter.get('/good/:dialogId/:no', dialogController.good);
dialogrouter.get('/ungood/:dialogId/:no', dialogController.ungood);
dialogrouter.get('/getupdateComment/:no/:i', dialogController.checkComment);
dialogrouter.post('/addcomment/:id/:no', dialogController.addComment);
dialogrouter.patch('/patchupdateComment/:no/:i', dialogController.updateComment);
dialogrouter.delete('/deletecomment/:id/:no/:i', dialogController.deleteComment); 
dialogrouter.delete('/deletedialog/:id/:no', dialogController.deleteDialog);
dialogrouter.post('/saveDialog', dialogController.saveDialog);
dialogrouter.patch('/patchwritingchange/:no', dialogController.updateDialog);
dialogrouter.get('/getwritingchange/:no', dialogController.getupdateDialog);


export default dialogrouter;