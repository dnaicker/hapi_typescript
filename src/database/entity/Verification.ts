import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity()
export class Verification {

    @PrimaryGeneratedColumn()
    id!: Number 

    @Column()
    status!: string 

    @Column()
    templateId!: string 

    @Column()
    dateTime!: string 

    @Column()
    lookUp!: string 

    @Column()
    fieldsAndValuesRequired!: string 

}
