import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Template } from "./template";

@Entity()
export class Button {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  link: string;

  @Column({ nullable: true })
  method: string;

  @Column("jsonb", { nullable: true })
  headers: { [key: string]: string }[];

  @Column({ nullable: true })
  body: string;

  @Column("simple-array", { nullable: true })
  mapping: string[] | [];

  @ManyToOne(() => Template, (template) => template.buttons)
  @JoinColumn({ name: "templateId" })
  template: Template;
}
