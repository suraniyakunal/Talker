import Room from '../models/roomModel.js';
import User from '../models/userModel.js'

const createRoom = async (req, res, next) => {
  try {
    const { roomData } = req.body;

    // 1. Validate roomData and STOP execution if missing
    if (!roomData) {
      return res.status(400).json({ message: 'the room data is not received' });
    }


    // 2. Room.create handles instantiation AND saving in one step
    const createdRoom = await Room.create({
      host: roomData.host,
      type: roomData.type,
      title: roomData.title,
      description: roomData.description,
      speaker: roomData.speakers
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

const deleteRoom = async (req, res) => {
  try {
    const roomId = req.params.id

    const deletedRoom = await Room.findByIdAndDelete(roomId)

    if (!deletedRoom) {
      return res.status(404).json({ message: "Room not found" })
    }

    res.status(200).json({ message: "Room deleted successfully", deletedRoom })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getAllRooms = async (req, res) => {
  try {
    const getRooms = await Room.find({});

    if (getRooms) {
      return res.status(200).json(getRooms);
    }
  } catch (error) {
    return res.status(500).json({ message: 'error in processing the get all rooms function', error: error });
  }
};


const getThisRoom = async (req, res) => {
  try {
    const roomId = req.params.id;

    // Validate ID format to prevent CastError
    if (roomId.length !== 24) {
      return res.status(400).json({ message: 'Invalid Room ID format' });
    }

    const room = await Room.findById(roomId)
      .populate('host', 'username profile_Pic')
      .populate('speaker', 'username profile_Pic')
      .populate('listener', 'username profile_Pic')

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    return res.status(200).json(room);
  } catch (error) {
    console.error("GET_ROOM_ERROR:", error); // This logs the REAL error to your terminal
    return res.status(500).json({
      message: 'Error in processing the get room function',
      error: error.message
    })
  }
}


export default { createRoom, getAllRooms, deleteRoom, getThisRoom };
