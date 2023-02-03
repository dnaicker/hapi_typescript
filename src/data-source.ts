import "reflect-metadata"
import { DataSource } from "typeorm"
import { User } from "./entity/User"
import { CredentialTemp } from "./entity/CredentialTemp"

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "test",
    database: "SSI",
    synchronize: true,
    logging: false,
    entities: [CredentialTemp],
    migrations: [],
    subscribers: [],
})
