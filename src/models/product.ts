import { count } from 'console'
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

// UUID generator: https://github.com/uuidjs/uuid
// type definitions can be installed using: npm install --save @types/uuid
// To get random values every time, don't specify any options while calling uuid() function.
import { v4 as uuid } from 'uuid'

@Table
export class Product extends Model<Product> {
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
