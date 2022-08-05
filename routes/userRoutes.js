import express from 'express';
import checkAuth from '../middleware/checkAuth.js';
const router = express.Router();

import { 
    registerUser, 
    authenticateUser, 
    confirmUser, 
    forgetPassword,
    checkToken,
    newPassword,
    profile,
} from '../controllers/userController.js';

// Authentication, registration and confirmation of users

router.post('/', registerUser) // create new user;
router.post('/login', authenticateUser) // login user;
router.get('/confirm/:token', confirmUser) // confirm user;
router.post('/forget-password', forgetPassword) //  forget password;
router.route('/forget-password/:token')
    .get(checkToken) // check user token to change password;
    .post(newPassword) // check user token to change password;

router.get('/profile', checkAuth, profile)

export default router;