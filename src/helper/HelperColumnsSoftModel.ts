import {
  Column, CreateDateColumn, DeleteDateColumn, UpdateDateColumn
} from "typeorm"

export class HelperColumnsSoftModel {
  @CreateDateColumn()
    createdAt: Date | undefined;

  @Column({ nullable: true })
    createdBy: string | undefined;

  @UpdateDateColumn()
    updatedAt: Date | undefined;

  @Column({ nullable: true })
    updatedBy: string | undefined;

  @DeleteDateColumn()
    deletedAt: Date | undefined;

  @Column({ nullable: true })
    deletedBy: string | undefined;
}
