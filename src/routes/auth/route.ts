import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { openDb } from '../../connections/database';

const router = Router();

router.post('/login', async (req: Request, res: Response): Promise<any> => {
    try {
        const { email, password } = req.body;
        const db = await openDb();

        const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
        if (!user) {
            return res.status(401).json({ success: false, message: "User not found!" });
        }

        if (await bcrypt.compare(password, user.password)) {
            const accessToken = jwt.sign(
                { email: user.email, username: user.username },
                process.env.JWT_SECRET as string,
                { expiresIn: '1h' }
            );

            return res.json({ success: true, message: "Login successful", accessToken, userId: user.id });
        } else {
            return res.status(401).json({ success: false, message: "Email or password incorrect" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
});

router.post('/register', async (req: Request, res: Response): Promise<any> => {
    try {
        const { username, email, password } = req.body;
        const db = await openDb();

        // Check if email already exists
        const existingUser = await db.get('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Email already in use" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await db.run('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hashedPassword]);

        // Retrieve the newly created user ID
        const newUser = await db.get('SELECT id FROM users WHERE email = ?', [email]);

        if (!newUser) {
            return res.status(500).json({ success: false, message: "Failed to retrieve user data" });
        }

        // Generate access token
        const accessToken = jwt.sign(
            { email: email, username: username },
            process.env.JWT_SECRET as string,
            { expiresIn: '1h' }
        );

        return res.status(200).json({
            success: true,
            message: "User registered successfully",
            accessToken,
            userId: newUser.id
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
});

export default router;
