const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        message: {
            type: String,
            required: [true, "Message is required"],
            minlength: [6, "Your Message is too short!"],
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
