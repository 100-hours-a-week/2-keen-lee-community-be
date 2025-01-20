import express from 'express'
import * as userController from '../controllers/userController.js'

const userrouter = express.Router();

userrouter.get('/', userController.getUser);
userrouter.post('/emailcheck', userController.emailcheck);
userrouter.post('/nicknamecheck', userController.nicknamecheck);
userrouter.post('/saveUser', userController.saveUser);
userrouter.post('/login', userController.login);
userrouter.get('/getimg/:id', userController.getimg);
userrouter.get('/infochange', userController.getinfo);
userrouter.post('/infochange/button', userController.patchinfo);
userrouter.delete('/deleteUser/infochange', userController.deleteUser); 
userrouter.post('/updatePassword', userController.updatePassword);

export default userrouter;
