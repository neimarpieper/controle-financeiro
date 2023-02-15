import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"
import { HelperColumnsSoftModel } from "../helper/HelperColumnsSoftModel"

@Entity()
export class Relacionamento extends HelperColumnsSoftModel {
  @PrimaryGeneratedColumn()
    id: number;

  @Column()
    descricao: string;

  @Column()
    cpfCnpj: string;

  @Column()
    endereco: string;

  @Column()
    telefone: string;
}
