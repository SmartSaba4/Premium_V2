"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const database_1 = require("../../connections/database");
const router = (0, express_1.Router)();
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const db = yield (0, database_1.openDb)();
        const user = yield db.get('SELECT * FROM users WHERE email = ?', [email]);
        if (!user) {
            return res.status(401).json({ success: false, message: "User not found!" });
        }
        if (yield bcrypt_1.default.compare(password, user.password)) {
            const accessToken = jsonwebtoken_1.default.sign({ email: user.email, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
            return res.json({ success: true, message: "Login successful", accessToken, userId: user.id });
        }
        else {
            return res.status(401).json({ success: false, message: "Email or password incorrect" });
        }
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}));
router.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, email, password } = req.body;
        const db = yield (0, database_1.openDb)();
        // Check if email already exists
        const existingUser = yield db.get('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Email already in use" });
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        yield db.run('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hashedPassword]);
        // Retrieve the newly created user ID
        const newUser = yield db.get('SELECT id FROM users WHERE email = ?', [email]);
        if (!newUser) {
            return res.status(500).json({ success: false, message: "Failed to retrieve user data" });
        }
        // Generate access token
        const accessToken = jsonwebtoken_1.default.sign({ email: email, username: username }, process.env.JWT_SECRET, { expiresIn: '1h' });
        return res.status(200).json({
            success: true,
            message: "User registered successfully",
            accessToken,
            userId: newUser.id
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}));
exports.default = router;
