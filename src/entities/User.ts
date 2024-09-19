import { BeforeInsert, Column, Entity, Index, OneToMany } from "typeorm";
import BaseEntity from "./BaseEntity";
import { IsEmail, Length } from "class-validator";
import Post from "./Post";
import bcrypt from "bcryptjs";
import Vote from "./Vote";

@Entity("users")
export default class User extends BaseEntity {
  @Index()
  @IsEmail(undefined, { message: "Email is invalid." })
  @Length(1, 255, { message: "Email cannot be empty." })
  @Column({ unique: true })
  email: string;

  @Index()
  @Length(3, 32, { message: "Username must be at least 3 characters long." })
  @Column({unique: true})
  username: string;

  @Length(6, 32, { message: "Password must be at least 6 characters long." })
  @Column()
  password: string;

  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];

  @OneToMany(() => Vote, (vote) => vote.user)
  votes: Vote[];
  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 6);
  }
}
