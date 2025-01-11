import express from 'express';
import { connectWallet, deposit, withdraw, getBalance } from '../contrrollers/userController.js';


const router = express.Router();

// Route for connecting the wallet (linking user's wallet)
router.post('/connect', connectWallet);

// Route for depositing or withdrawing balance
router.post('/deposit', deposit);
router.post('/withdraw', withdraw);
router.get('/getBalance/:walletAddress', getBalance);

export default router;
