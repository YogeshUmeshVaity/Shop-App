// import {
//     Model,
//     Column,
//     Table,
//     BelongsToMany,
//     Scopes,
//     CreatedAt,
//     UpdatedAt,
//     DataType,
//     ForeignKey,
//     BelongsTo
// } from 'sequelize-typescript'
// import { User } from './user'

/**
 * We need to specify the properties as either optional or non-null otherwise we get 
 * error: Property '' has no initializer and is not definitely assigned in the constructor.
 */

// @Table
// export class Product extends Model {
//     @Column({ primaryKey: true })
//     id!: string

//     @Column
//     title!: string

//     @Column({ type: DataType.DOUBLE })
//     price!: number

//     @Column
//     imageUrl!: string

//     @Column
//     description?: string

//     @ForeignKey(() => User)
//     @Column
//     createdByUserId!: string

//     @BelongsTo(() => User)
//     createdByUser!: User
// }
