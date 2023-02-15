import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"
import { HelperColumnsSoftModel } from "../helper/HelperColumnsSoftModel"

@Entity()
export class OpcaoItem extends HelperColumnsSoftModel {
  @PrimaryGeneratedColumn()
    id: number;

  @Column()
    codigo: number;

  @Column()
    descricao: string;

  @Column()
    opcaoId: number;
}
