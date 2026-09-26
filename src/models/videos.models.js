import mongoose, { Schema } from "mongoose";
import { User } from "./user.models";

const videoSchema = Schema.model(
    {
        videoFile: {
            type: String, // Cludnary Videos
            required: true
        },
        thumbnail: {
            type: String, // Cludnary Videos
            required: true
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        duration: {
            type: Number, // Coudnary Provides this
        },
        views: {
            type: Number,
            required: ture
        },
        isPublished: {
            type: Boolean,
            default: ture
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    },
    { timestamps: true }
)


export const Video = mongoose.model("Video", videoSchema)