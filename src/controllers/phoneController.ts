import { Request, Response } from "express";
import { PhoneService } from "../services/phoneService";

export class PhoneController {
  private phoneService = new PhoneService();

  async getPhoneNumbersByUserId(req: any, res: Response) {
    const email = req.user.email;

    try {
      const phoneNumbers =
        await this.phoneService.getPhoneNumbersByUserId(email);
      if (phoneNumbers) {
        res.json(phoneNumbers);
      } else {
        res.status(404).json({ message: "Phone numbers not found" });
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
  async getAllByMobileId(req: Request, res: Response) {
    const { phoneId, from } = req.body;
    try {
      const data = await this.phoneService.getAllByMobileId(phoneId, from);
      if (data) {
        res.json(data);
      } else {
        res.status(404).json({ message: "Template not found" });
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}
