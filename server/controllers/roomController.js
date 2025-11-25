import express from 'express'
import Room from '../models/roomModel.js'

const createRoom = async (req, res) => {
  const roomData = req.body
  if (!roomData) {
    res.status(401).json({ message: 'the room data is not received' })
  }
  try {
    const done = await Room.create(roomData)
    if (!done) {
      res.status(401).json({ message: "the room cannot be created" })
    }

  } catch (error) {
    console.log(error)
  }

  res.status(201).json({ message: 'the room is created' })
}


export default { createRoom }
