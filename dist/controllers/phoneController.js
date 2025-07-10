"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhoneController = void 0;
const phoneService_1 = require("../services/phoneService");
class PhoneController {
    constructor() {
        this.phoneService = new phoneService_1.PhoneService();
    }
    async getPhoneNumbersByUserId(req, res) {
        const email = req.user.email;
        try {
            const phoneNumbers = await this.phoneService.getPhoneNumbersByUserId(email);
            if (phoneNumbers) {
                res.json(phoneNumbers);
            }
            else {
                res.status(404).json({ message: "Phone numbers not found" });
            }
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    async getAllByMobileId(req, res) {
        const { phoneId, from } = req.body;
        try {
            const data = await this.phoneService.getAllByMobileId(phoneId, from);
            if (data) {
                res.json(data);
            }
            else {
                res.status(404).json({ message: "Template not found" });
            }
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}
exports.PhoneController = PhoneController;
//# sourceMappingURL=phoneController.js.map