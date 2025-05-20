const mongoose = require("mongoose")

const revSchema = new mongoose.Schema
(
    {
        name: {type: String, required: true},
        text: {type: String, required: true},
        rating: {type: Number, min: 1, max: 10, required:true}
    },
    { _id: false }
);

const arcSchema = new mongoose.Schema
(
    {
        title: {type: String, required: true},
        authors: [{type: String, required: true}],
        date: {type: Date, default: Date.now},
        content: {type: String, required: true},
        tags: [{type: String}],
        reviews:[revSchema]
    }
)

module.exports = mongoose.model("Article",arcSchema)