import { Request, Response, NextFunction } from 'express';
import jwt, { TokenExpiredError } from 'jsonwebtoken';

const authenticateJWT = (req: any, res: Response, next: NextFunction) => {
    const token = req.header('Authorization')?.split(' ')[1];

    if (token) {
        jwt.verify(token, process.env.JWT_SECRET as string, (err: any, user: any) => {
            if (err) {
                if (err instanceof TokenExpiredError) {
                    return res.status(401).json({
                        success: false,
                        message: "Unauthorized" // token expired
                    });
                }
                return res.status(403).json({
                    success: false,
                    message: "Unauthorized"
                });
            }
            req.user = user;
            next();
        });
    } else {
        res.status(401).json({
            "success": false,
            "message": "Unauthorized"
        });
    }
};

export default authenticateJWT;