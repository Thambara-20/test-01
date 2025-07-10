"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ButtonService = void 0;
const data_source_1 = require("../config/data-source");
const button_1 = require("../entity/button");
class ButtonService {
    constructor() {
        this.buttonRepository = data_source_1.AppDataSource.getRepository(button_1.Button);
    }
    async getAllButtons() {
        return await this.buttonRepository.find();
    }
    async getButtonById(id) {
        if (!id) {
            return undefined;
        }
        return await this.buttonRepository.findOne({ where: { id } });
    }
    async updateButton(id, name, link, method, headers, body) {
        if (!id) {
            return undefined;
        }
        const button = await this.buttonRepository.findOne({ where: { id } });
        if (!button) {
            return undefined;
        }
        button.name = name;
        button.link = link;
        button.method = method;
        button.headers = headers;
        button.body = body;
        return await this.buttonRepository.save(button);
    }
    async deleteButton(id) {
        if (!id) {
            return false;
        }
        const result = await this.buttonRepository.delete(id);
        return result.affected !== 0;
    }
}
exports.ButtonService = ButtonService;
//# sourceMappingURL=buttonService.js.map