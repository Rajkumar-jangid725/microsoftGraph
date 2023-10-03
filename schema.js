const { Schema, model } =  require("mongoose");

const msApiSchema = new Schema({
    Result: {
        type: Array
    }
});

const msApi = model("msApi", msApiSchema)

module.exports = msApi