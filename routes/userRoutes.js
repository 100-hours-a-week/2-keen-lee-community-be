const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController.js');
router.get('/', userController.getUser);
router.post('/emailcheck', userController.emailcheck);
router.post('/nicknamecheck', userController.nicknamecheck);
router.post('/saveUser', userController.saveUser);
router.post('/login', userController.login);
router.get('/getimg/:id', userController.getimg);
router.get('/infochange', userController.getinfo);
router.post('/infochange/button', userController.patchinfo);
router.delete('/deleteUser/infochange', userController.deleteUser); 
router.post('/updatePassword', userController.updatePassword);

module.exports = router;
