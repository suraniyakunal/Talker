import express from 'express';
import Room from '../models/roomModel.js';

const createRoom = async (req, res, next) => {
  try {
    const { roomData } = req.body;

    // 1. Validate roomData and STOP execution if missing
    if (!roomData) {
      return res.status(400).json({ message: 'the room data is not received' });
    }

    console.log('room data is:', roomData.title, roomData.description, roomData.host);

    // 2. Room.create handles instantiation AND saving in one step
    const createdRoom = await Room.create({
      host: roomData.host,
      type: roomData.type,
      title: roomData.title,
      description: roomData.description,
      speakers: roomData.speakers
    });

    // 3. Send final success response and RETURN
    return res.status(201).json({
      message: 'The room is created',
      room: createdRoom
    });

  } catch (error) {
    console.error("Room creation failed:", error);
    // 4. Pass errors to your global error middleware
    return next(error);
  }
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
