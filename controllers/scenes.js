const express = require('express');
const router = express.Router();
// import the Game Model
const { Scene, Character } = require('../models');

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
  const { prompt, sceneImageUrl, sceneCaption } = req.body;
  try {
    const newScene = new Scene({
      character: characterId,
      prompt: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      sceneImageUrl: 'https://picsum.photos/200/300',
      sceneCaption: 'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      likes: 0,
      comments: 0,
      views: 0,
    });

    await newScene.save();

    res.status(201).json(newScene);
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
 * View a single scene
 *
 *
 *
 *
 * */
router.get('/:id', async (req, res) => {
  const sceneId = req.params.id;

  try {
    const scene = await Scene.findById(sceneId);
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
  const sortBy = req.query.sortBy || 'date'; // Default to sorting by date

  try {
    const userCharacters = await Character.find({ user: userId });

    let exploreScenes;

    if (sortBy === 'popularity') {
      // Sort by likes, comments, or any other metric
      exploreScenes = await Scene.find({ character: { $in: userCharacters.map(character => character._id) } })
        .sort({ likes: -1 });
    } else {
      // Default to sorting by date
      exploreScenes = await Scene.find({ character: { $in: userCharacters.map(character => character._id) } })
        .sort({ createdAt: -1 });
    }

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

module.exports = router;
