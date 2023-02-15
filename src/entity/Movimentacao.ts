import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"
import { HelperColumnsSoftModel } from "../helper/HelperColumnsSoftModel"

@Entity()
export class Movimentacao extends HelperColumnsSoftModel {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  descricao: string

  @Column()
  diaMovimento: Date

  @Column("decimal", { precision: 16, scale: 2 })
  receita: number

  @Column("decimal", { precision: 16, scale: 2 })
  despesa: number

  @Column("decimal", { precision: 16, scale: 2 })
  saldo: number

  @Column()
  tipo: number

  @Column()
  relacionamentoId: number

  @Column()
  contaOrigemId: number

  @Column()
  contaDestinoId: number
}
