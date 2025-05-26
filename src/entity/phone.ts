import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { IsPhoneNumber } from "class-validator";
import { User } from "./user";

@Entity()
export class Phone {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  @IsPhoneNumber()
  phone_number: string;

  @ManyToOne(() => User, (user) => user.phone_numbers)
  @JoinColumn({ name: "userId" })
  user: User;
}
