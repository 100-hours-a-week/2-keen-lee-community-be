const express = require('express');
const router = express.Router();
const dialogController = require('../controllers/dialogcontroller.js');

router.get('/', dialogController.readDialog);
router.get('/writingpage/:dialogId/:no', dialogController.selectDialog); //TODO: 한 계정당 한개의 조회수 올라가는 API만들어야함
router.get('/goodcnt/:dialogId/:no', dialogController.goodcnt);
router.get('/good/:dialogId/:no', dialogController.good);
router.get('/ungood/:dialogId/:no', dialogController.ungood);
router.get('/getupdateComment/:id/:i', dialogController.checkComment);
router.post('/addcomment/:id/:no', dialogController.addComment);
router.patch('/patchupdateComment/:id/:i', dialogController.updateComment);
router.delete('/deletecomment/:id/:no/:i', dialogController.deleteComment); 
router.delete('/deletedialog/:id/:no', dialogController.deleteDialog);
router.post('/saveDialog', dialogController.saveDialog);
router.patch('/patchwritingchange/:no', dialogController.updateDialog);
router.get('/getwritingchange/:no', dialogController.getupdateDialog);


module.exports = router;
