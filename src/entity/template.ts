import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { User } from "./user";
import { Button } from "./button";
import { Phone } from "./phone";
import { IsNotEmpty, IsString } from "class-validator";

@Entity()
export class Template {
  @PrimaryGeneratedColumn()
  @IsNotEmpty()
  @IsString()
  id: string;

  @Column()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ManyToOne(() => User, (user) => user.templates)
  @JoinColumn({ name: "email" })
  user: User;

  @OneToMany(() => Button, (button) => button.template, { cascade: true })
  buttons: Button[];
}
