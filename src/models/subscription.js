import mongoose, { Schema } from "mongoose";

const subscriptionschema = new Schema(
    {
        subscriber: {
            type: Schema.Types.ObjectId, //The one who is subscribes
            ref: "User"
        },
        channel:{
            type: Schema.Types.ObjectId, //The one who is subscribed to
            ref: "User"
        }
    },
    {
        timestamps: true
    }
)

export const Subscription = mongoose.model("Subscription",subscriptionschema)