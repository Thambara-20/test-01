import { Entity, Column, PrimaryColumn, OneToMany } from "typeorm";
import * as bcrypt from "bcrypt";
import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";
import { Template } from "./template"; // Import Template entity
import { Phone } from "./phone";

@Entity()
export class User {
  @PrimaryColumn()
  @IsEmail()
  email: string;

  @Column()
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @Column()
  @IsNotEmpty()
  @IsString()
  role: string;

  @Column({ nullable: true })
  tempToken: string;

  @Column({ default: false })
  verified: boolean;

  @OneToMany(() => Template, (template) => template.user, { cascade: true })
  templates: Template[];

  @Column({ nullable: true })
  phoneId: string;

  @Column({ nullable: true })
  tel: string;

  @Column({ nullable: true })
  whatsappToken: string;

  @Column({ nullable: true })
  verifyToken: string;

  @Column({ nullable: true, default: false })
  active: boolean;

  @OneToMany(() => Phone, (phone) => phone.user, { cascade: true })
  phone_numbers: Phone[];

  async comparePassword(enteredPassword: string): Promise<boolean> {
    return await bcrypt.compare(enteredPassword, this.password);
  }

  async compareTempToken(enteredToken: string): Promise<boolean> {
    try {
      return await bcrypt.compare(enteredToken, this.tempToken);
    } catch (error) {
      return false;
    }
  }
}
