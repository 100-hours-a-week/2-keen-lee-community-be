const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController.js');
router.get('/:id', userController.getUser);
router.post('/emailcheck', userController.emailcheck);
router.post('/nicknamecheck', userController.nicknamecheck);
router.post('/saveUser', userController.saveUser);
router.post('/login', userController.login);
router.get('/getimg/:id', userController.getimg);
router.get('/infochange/:id', userController.getinfo);
router.post('/infochange/button/:id', userController.patchinfo);
router.delete('/deleteUser/infochange/:id', userController.deleteUser); 
router.post('/updatePassword/:id', userController.updatePassword);

module.exports = router;
