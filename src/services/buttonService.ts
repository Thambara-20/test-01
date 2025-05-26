import { AppDataSource } from "../config/data-source";
import { Button } from "../entity/button";

export class ButtonService {
  private buttonRepository = AppDataSource.getRepository(Button);

  async getAllButtons(): Promise<Button[]> {
    return await this.buttonRepository.find();
  }

  async getButtonById(id: string): Promise<Button | undefined> {
    if (!id) {
      return undefined;
    }
    return await this.buttonRepository.findOne({ where: { id } });
  }

  async updateButton(
    id: string,
    name: string,
    link: string,
    method: string,
    headers: { [key: string]: string }[],
    body: string
  ): Promise<Button | undefined> {
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

  async deleteButton(id: string): Promise<boolean> {
    if (!id) {
      return false;
    }
    const result = await this.buttonRepository.delete(id);
    return result.affected !== 0;
  }
}
