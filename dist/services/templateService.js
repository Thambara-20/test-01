"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateService = exports.TemplateDTO = void 0;
const data_source_1 = require("../config/data-source");
const template_1 = require("../entity/template");
const button_1 = require("../entity/button");
const user_1 = require("../entity/user");
class TemplateDTO {
}
exports.TemplateDTO = TemplateDTO;
class TemplateService {
    constructor() {
        this.templateRepository = data_source_1.AppDataSource.getRepository(template_1.Template);
        this.buttonRepository = data_source_1.AppDataSource.getRepository(button_1.Button);
    }
    async getAllTemplates() {
        return await this.templateRepository.find({ relations: ["buttons"] });
    }
    async createTemplate(name, email, transactionalEntityManager) {
        //done
        if (!name || !email) {
            throw new Error("Invalid input");
        }
        const user = await transactionalEntityManager.findOne(user_1.User, {
            where: { email },
        });
        if (!user) {
            throw new Error("User not found");
        }
        const template = new template_1.Template();
        template.name = name;
        template.user = user;
        await transactionalEntityManager.save(template);
        await this.addButtonsToTemplate(transactionalEntityManager, template.id);
        return { id: template.id, name: template.name, userId: user.email };
    }
    async getTemplateByUserId(userid) {
        //done
        if (!userid) {
            return undefined;
        }
        return await this.templateRepository.findOne({
            where: { user: { email: userid } },
            relations: ["buttons"],
        });
    }
    async updateTemplate(
    //done
    id, name, buttons) {
        if (!id || !name || !buttons) {
            return undefined;
        }
        return data_source_1.AppDataSource.transaction(async (transactionalEntityManager) => {
            const template = await transactionalEntityManager.findOne(template_1.Template, {
                where: { id: id },
            });
            if (!template) {
                return undefined;
            }
            template.name = name;
            const currentButtons = await transactionalEntityManager.find(button_1.Button, {
                where: { template: { id: template.id } },
            });
            await transactionalEntityManager.remove(currentButtons);
            for (const buttonData of buttons) {
                const button = new button_1.Button();
                button.name = buttonData.name;
                button.link = buttonData.link;
                button.method = buttonData.method;
                button.headers = buttonData.headers;
                button.body = buttonData.body;
                button.mapping = buttonData.mapping;
                button.template = template;
                await transactionalEntityManager.save(button);
                console.log(button);
            }
            const updatedTemplate = await transactionalEntityManager.save(template);
            return {
                id: updatedTemplate.id,
                name: updatedTemplate.name,
            };
        });
    }
    async addButtonsToTemplate(transactionalEntityManager, templateId, buttonsData = [
        {
            link: "https://www.sample.com",
            name: "Sample",
            mapping: ["sample"],
            method: "GET",
            headers: [{ key: "Content-Type", value: "application/json" }],
            body: "{}",
        },
    ]) {
        //done
        if (!templateId) {
            throw new Error("Invalid input");
        }
        const template = await transactionalEntityManager.findOne(template_1.Template, {
            where: { id: templateId },
        });
        if (!template) {
            throw new Error("Template not found");
        }
        const buttons = [];
        for (const buttonData of buttonsData) {
            const button = new button_1.Button();
            button.name = buttonData.name;
            button.link = buttonData.link;
            button.method = buttonData.method;
            button.headers = buttonData.headers;
            button.body = buttonData.body;
            button.mapping = buttonData.mapping;
            button.template = template;
            buttons.push(await transactionalEntityManager.save(button));
        }
        return buttons;
    }
    async updateButtons(buttonsData) {
        const buttons = [];
        for (const buttonData of buttonsData) {
            const button = await this.buttonRepository.findOne({
                where: { id: buttonData.id },
            });
            if (!button) {
                throw new Error("Button not found");
            }
            button.name = buttonData.name;
            button.link = buttonData.link;
            button.method = buttonData.method;
            button.headers = buttonData.headers;
            button.body = buttonData.body;
            button.mapping = buttonData.mapping;
            buttons.push(await this.buttonRepository.save(button));
        }
        return buttons;
    }
}
exports.TemplateService = TemplateService;
//# sourceMappingURL=templateService.js.map