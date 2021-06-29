import {
    Model,
    Column,
    Table,
    BelongsToMany,
    Scopes,
    CreatedAt,
    UpdatedAt,
    DataType
} from 'sequelize-typescript'

@Table
export class Product extends Model {
    @Column({ primaryKey: true })
    id!: string

    @Column
    title!: string

    @Column({ type: DataType.DOUBLE })
    price!: number

    @Column
    imageUrl!: string

    @Column
    description?: string
}
