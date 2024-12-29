const express = require('express');
const router = express.Router();
const dialogController = require('../controllers/dialogcontroller.js');

router.get('/', dialogController.readDialog);
router.get('/writingpage/:id/:no', dialogController.selectDialog);
router.get('/good/:dialogId/:no', dialogController.goodcnt);
router.get('/good/:dialogId/:nick/:no', dialogController.good);
router.get('/ungood/:dialogId/:nick/:no', dialogController.ungood);
router.get('/getupdateComment/:id/:nick/:i', dialogController.checkComment);
router.post('/addcomment/:id/:nick/:no', dialogController.addComment);
router.patch('/patchupdateComment/:id/:nick/:i', dialogController.updateComment);
router.delete('/deletecomment/:id/:no/:i', dialogController.deleteComment); 
router.delete('/deletedialog/:id/:nick/:no', dialogController.deleteDialog);
router.post('/saveDialog/:id', dialogController.saveDialog);
router.patch('/patchwritingchange/:id/:nick/:no', dialogController.updateDialog);
router.get('/getwritingchange/:id/:nick/:no', dialogController.getupdateDialog);


module.exports = router;
