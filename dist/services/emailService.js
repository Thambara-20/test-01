"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSignupEmail = void 0;
exports.sendMessage = sendMessage;
const nodemailer = __importStar(require("nodemailer"));
const sendSignupEmail = async (email, role, name, tempToken) => {
    const signupLink = `${process.env.FRONT_END_URL_SIGNUP}?token=${tempToken}`;
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
    const mailOptions = {
        from: process.env.EMAIL_USER || "company",
        to: email,
        subject: "Welcome to [Fcode-labs]",
        html: `
      <p>Dear ${name || "User"},</p>
      <p>You have been added as an ${role} to our system. Please click the following link to create your password and access your account:</p>
      <a href="${signupLink}">${signupLink}</a>
      <p>Please note that the password creation link is valid for one-time use only. Ensure that you use it promptly to set up your password.</p>
      <p>Best regards,</p>
      <p>[Fcode-labs]</p>
    `,
    };
    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                reject(error);
            }
            else {
                console.log("Email sent:", info.response);
                resolve();
            }
        });
    });
};
exports.sendSignupEmail = sendSignupEmail;
async function sendMessage(io, userId, message, data) {
    if (userId) {
        console.log("Sending message to user:", userId, message);
        io.to(userId).emit(message, data);
    }
    else {
        console.warn("User not found:", userId);
    }
}
//# sourceMappingURL=emailService.js.map