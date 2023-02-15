import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"
import { HelperColumnsSoftModel } from "../helper/HelperColumnsSoftModel"

@Entity()
export class Opcao extends HelperColumnsSoftModel {
  @PrimaryGeneratedColumn()
    id: number;

  @Column()
    descricao: string;
}
