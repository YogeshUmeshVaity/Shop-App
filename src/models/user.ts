import {
    Model,
    Column,
    Table,
    BelongsToMany,
    Scopes,
    CreatedAt,
    UpdatedAt,
    DataType,
    HasMany
} from 'sequelize-typescript'
import { Product } from './product'

@Table
export class User extends Model {
    @Column({ primaryKey: true })
    id!: string

    @Column
    name!: string

    @Column
    email!: string

    @Column
    @HasMany(() => Product)
    createdProducts?: Product[]
}
