import { CreateDateColumn, DeleteDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export abstract class Base {
  
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ update: false, name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ update: false, name: "updated_at" })
  updatedAt: Date;

  @DeleteDateColumn({ update: false, name: "deleted_at" })
  deletedAt: Date;

}