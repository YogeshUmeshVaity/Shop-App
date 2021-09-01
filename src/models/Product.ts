import { getModelForClass, modelOptions, prop, Ref, Severity } from '@typegoose/typegoose'
import { User } from './User'

@modelOptions({
    /* schemaOptions: { timestamps: true }, */
    options: { /*customName: 'products', */ allowMixed: Severity.ALLOW }
})
export class Product {
    @prop({ required: true })
    title!: string

    @prop({ required: true })
    price!: number

    @prop()
    description?: string

    @prop({ required: true })
    imageUrl!: string

    // This is an example of a single Reference
    // Writing ref: () => User results in an error
    @prop({ ref: 'User', required: true })
    public createdByUserId!: Ref<User>
}

export const ProductModel = getModelForClass(Product)
