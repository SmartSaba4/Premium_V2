import { Router, Request, Response } from 'express';
import authenticateJWT from '../../middlewares/auth/index';
import { openDb } from '../../connections/database';

const router = Router();

router.get('/:id', authenticateJWT, async (req: Request, res: Response): Promise<any> => {
    try {
        const db = await openDb();
        const userId = req.params.id;

        const user = await db.get('SELECT id, username FROM users WHERE id = ?', [userId]);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, message: "User Found ", user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

export default router;
