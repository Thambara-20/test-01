import { Request, Response } from "express";
import { ButtonService } from "../services/buttonService";

export class ButtonController {
  private buttonService = new ButtonService();

  async getAllButtons(req: Request, res: Response) {
    try {
      const buttons = await this.buttonService.getAllButtons();
      res.json(buttons);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getButtonById(req: Request, res: Response) {
    const id = req.params.id;
    if (!id) {
      res.status(400).json({ message: "Button id is required" });
    }
    try {
      const button = await this.buttonService.getButtonById(id);
      if (button) {
        res.json(button);
      } else {
        res.status(404).json({ message: "Button not found" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
  async updateButton(req: Request, res: Response) {
    const id = req.params.id;
    const { name, link, method, headers, body } = req.body;
    try {
      const button = await this.buttonService.updateButton(
        id,
        name,
        link,
        method,
        headers,
        body
      );
      if (button) {
        res.json(button);
      } else {
        res.status(404).json({ message: "Button not found" });
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async deleteButton(req: Request, res: Response) {
    const id = req.params.id;
    try {
      const result = await this.buttonService.deleteButton(id);
      if (result) {
        res.json({ message: "Button deleted successfully" });
      } else {
        res.status(404).json({ message: "Button not found" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}
