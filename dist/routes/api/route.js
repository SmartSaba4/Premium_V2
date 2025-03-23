"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const index_1 = __importDefault(require("../../middlewares/auth/index"));
const route_1 = __importDefault(require("../user/route"));
const router = (0, express_1.Router)();
router.use('/user', route_1.default);
router.get('/', index_1.default, (req, res) => {
    try {
        res.status(200).json({ success: true, message: "ok" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});
exports.default = router;
