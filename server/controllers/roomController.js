import express from 'express';
import Room from '../models/roomModel.js';

const createRoom = async (req, res) => {
  const roomData = req.body;
  if (!roomData) {
    res.status(401).json({ message: 'the room data is not received' });
  }
  try {
    console.log('room data is :', roomData.title, roomData.description, roomData.owner);
    const create = new Room(roomData);
    await create.save();
    res.status(201).json({ message: 'The is created', room: create._id });
    if (!done) {
      res.status(401).json({ message: 'the room cannot be created' });
    }
    console.log(create);
  } catch (error) {
    console.log(error);
  }

  res.status(201).json({ message: 'the room is created' });
};

const getAllRooms = async (req, res) => {
  try {
    const getRooms = await Room.find({});

    if (getRooms) {
      console.log('rooms', getRooms);
      return res.status(200).json(getRooms);
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'error in processing the get all rooms function', error: error });
  }
};

export default { createRoom, getAllRooms };
