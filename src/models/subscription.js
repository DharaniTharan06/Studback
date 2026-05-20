import mongoose, { Schema } from "mongoose";

const subscriptionschema = new Schema(
    {
        subscriber: {
            typeof: Schema.Types.ObjectId, //The one who is subscribes
            ref: "User"
        },
        channel:{
            typeof: Schema.Types.ObjectId, //The one who is subscribed to
            ref: "User"
        }
    },
    {
        timestamps: true
    }
)

export const Subscription = mongoose.model("Subscription",subscriptionschema)