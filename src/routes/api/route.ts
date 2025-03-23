import { Router, Request, Response } from 'express';
import authenticateJWT from '../../middlewares/auth/index';
import user from '../user/route'

const router = Router();
router.use('/user', user);

router.get('/', authenticateJWT, (req: Request, res: Response) => {
    try {
        res.status(200).json({ success: true, message: "ok" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});


export default router;
