import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"
import { HelperColumnsSoftModel } from "../helper/HelperColumnsSoftModel"

export enum TipoConta {
  Analitico = 1,
  Sintetico = 2
}
@Entity()
export class Contas extends HelperColumnsSoftModel {
  @PrimaryGeneratedColumn()
    id: number;

  @Column()
    descricao: string;

  @Column({ nullable: true })
    observacao: string;

  @Column()
    tipo: number;

  @Column({ nullable: true })
    contaPaiId: number;
}
