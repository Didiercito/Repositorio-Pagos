import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('payments')
export class PaymentEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', unique: true })
  stripeId!: string; // ID de Stripe (pi_...)

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount!: number;

  @Column({ type: 'varchar', length: 10 })
  currency!: string;

  @Column({ type: 'varchar', length: 50 })
  status!: string; // 'pending', 'succeeded'

  @Column({ type: 'varchar', nullable: true })
  kitchenId!: string;

  @Column({ type: 'varchar', nullable: true })
  donorName!: string;

  @Column({ type: 'varchar', nullable: true })
  donorEmail!: string;

  @CreateDateColumn()
  createdAt!: Date;
}