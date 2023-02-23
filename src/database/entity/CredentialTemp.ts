import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity()
export class CredentialTemp {

    @PrimaryGeneratedColumn()
    id!: Number 

    @Column()
    lookup!: string 

    @Column()
    credential!: string 

}
