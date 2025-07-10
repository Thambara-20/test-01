"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateController = void 0;
const templateService_1 = require("../services/templateService");
const emailService_1 = require("../services/emailService");
const socketService_1 = require("../services/socketService");
class TemplateController {
    constructor() {
        this.templateService = new templateService_1.TemplateService();
        this.io = (0, socketService_1.getSocketInstance)();
    }
    async getAllTemplates(req, res) {
        //done
        try {
            const templates = await this.templateService.getAllTemplates();
            res.json(templates);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async getTemplateByUserId(req, res) {
        //done
        const id = req.user.email;
        try {
            const template = await this.templateService.getTemplateByUserId(id);
            if (template) {
                console.log(template, "template");
                res.json(template);
            }
            else {
                res.status(404).json({ message: "Template not found" });
            }
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async updateTemplate(req, res) {
        //done
        const { name, id, buttons } = req.body;
        const socketId = req.params.socketId;
        try {
            console.log(req.body);
            const template = await this.templateService.updateTemplate(id, name, buttons);
            if (template) {
                console.log("template updated");
                (0, emailService_1.sendMessage)(this.io, socketId, "template_updated_successfully", id);
                res.json(template);
            }
            else {
                (0, emailService_1.sendMessage)(this.io, socketId, "template_updated_failed", id);
                res.status(404).json({ message: "Template not found" });
            }
        }
        catch (error) {
            (0, emailService_1.sendMessage)(this.io, socketId, "template_updated_failed", id);
            res.status(400).json({ message: error.message });
        }
    }
}
exports.TemplateController = TemplateController;
//# sourceMappingURL=templateController.js.map