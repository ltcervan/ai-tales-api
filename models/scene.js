const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const sceneSchema = new mongoose.Schema({
    character: [{
      type: Schema.Types.ObjectId,
      ref: 'Character'
    }],
    prompt: String,
    sceneImageUrl: String ,
    sceneCaption: String,
    likes: Number,
    comments: Number,
    views: Number,
},{ timestamps: true });

const Scene = mongoose.model('Scene', sceneSchema);

module.exports = Scene;
