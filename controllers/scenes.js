const express = require('express');
const router = express.Router();
// import the Game Model
const { Scene, Character } = require('../models');
const getCaption = require('../middleware/getCaption');
const getImage = require('../middleware/getImage');

/**
 *
POST - /new/:characterId - Create a scene
GET - /:id - View a single scene
GET - /character/:characterId - Views all of a character’s scenes
GET - /users/:userId - Views all of a character’s scenes
GET - /explore/:userId - Views all of a character’s scenes
Stretch Goal: Sort by popularity or date of posting
DELETE - /delete/:id - Delete scene (Users can only delete their own scenes)
 */

// controllers/sceneController.js

/**
 *
 *
 *
 *
 * Create a new scene
 *
 *
 *
 *
 * */
router.post('/new/:characterId', async (req, res) => {
  const characterId = req.params.characterId;
  const { prompt } = req.body;
  try {
    const storyCharacter = await getCharacterById(characterId);

    // Get the scene caption
    const sceneCaption = await getCaption(prompt, storyCharacter);
    console.log('Scene Caption:', sceneCaption); // Log the caption to debug

    // Check if sceneCaption is valid before proceeding
    if (typeof sceneCaption === 'string' && sceneCaption.trim() !== '') {
      // Use sceneCaption for getImage
      const sceneImage = await getImage(sceneCaption, storyCharacter);
      console.log('Scene Image URL:', sceneImage); // Log the image URL to debug

      const newScene = new Scene({
        character: characterId,
        prompt: prompt,
        sceneImageUrl: sceneImage,
        sceneCaption: sceneCaption,
        likes: 0,
        comments: 0,
        views: 0,
      });

      await newScene.save();

      res.status(201).json({ sceneId: newScene._id, newScene });
    } else {
      // Handle case where sceneCaption is not valid
      throw new Error('Invalid scene caption received');
    }
  } catch (error) {
    console.error('Error in /new/:characterId route:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


/**
 *
 *
 *
 *
 * View a single scene
 *
 *
 *
 *
 * */
router.get('/:id', async (req, res) => {
  const sceneId = req.params.id;

  try {
    const scene = await Scene.findById(sceneId)
    .populate('character') // This will populate the character details
    .exec();
    if (!scene) {
      return res.status(404).json({ error: 'Scene not found' });
    }

    res.status(200).json(scene);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
/**
 *
 *
 *
 *
 * View all scenes for a character
 *
 *
 *
 *
 * */
router.get('/character/:characterId', async (req, res) => {
  const characterId = req.params.characterId;

  try {
    const characterScenes = await Scene.find({ character: characterId });

    res.status(200).json(characterScenes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ==================================================
// Need to create user
// Views all of a character’s scenes
// ==================================================
router.get('/users/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const userCharacters = await Character.find({ user: userId });
    const userScenes = await Scene.find({ character: { $in: userCharacters.map(character => character._id) } });

    res.status(200).json(userScenes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ==================================================
// Need to create user
// View all scenes for a user for exploration, sorted by popularity or date
// ==================================================

router.get('/explore/:userId', async (req, res) => {
  const userId = req.params.userId;


  try {
    const userCharacters = await Character.find({ user: userId });


    const exploreScenes = await Scene.find({
      character: { $in: userCharacters.map(character => character._id) }
    }).sort({ createdAt: -1 });
    console.log(exploreScenes);


    res.status(200).json(exploreScenes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
/**
 *
 *
 * ======================================
 * GET ALL SCENES THAT ARE NOT MINE
 *
 * ======================================
 *
 *
 * */
router.get('/explore/feed/:userId', async (req, res) => {
  const userId = req.params.userId;


  try {
    const userCharacters = await Character.find({ user: userId });


    const exploreScenes = await Scene.find({
      character: { $nin: userCharacters.map(character => character._id) }
    }).sort({ createdAt: -1 });
    console.log(exploreScenes);


    res.status(200).json(exploreScenes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 *
 *
 * ======================================
 * Need user varification to delete the scene
 * View all scenes for a character
 *
 * ======================================
 *
 *
 * */
// Delete a scene
router.delete('/delete/:id', async (req, res) => {
  const sceneId = req.params.id;

  try {
    // Assuming you have user authentication and can check if the user is the owner of the scene
    // Also, handle the case where the scene doesn't exist
    const scene = await Scene.findById(sceneId);

    if (!scene) {
      return res.status(404).json({ error: 'Scene not found' });
    }

    // Check if the user is the owner of the scene before deleting
    // This is just an example; you may need to adapt it based on your authentication mechanism
    // For simplicity, assuming userId is passed in the request
    const userId = req.body.userId;

    if (scene.character.toString() !== userId) {
      return res.status(403).json({ error: 'You do not have permission to delete this scene' });
    }

    await Scene.findByIdAndDelete(sceneId);

    res.status(200).json({ message: 'Scene deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

async function getCharacterById(id) {
  try {
    const character = await Character.findById(id);
    if (!character) {
      console.log('No character found with that ID');
    } else {
      return character;
    }
  } catch (error) {
    console.error('Error fetching document:', error);
  }
}

module.exports = router;
