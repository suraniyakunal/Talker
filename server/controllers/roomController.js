import express from 'express'
import Room from '../models/roomModel.js'

const createRoom = async (req, res) => {
  const roomData = req.body
  if (!roomData) {
    res.status(401).json({ message: 'the room data is not received' })
  }
  try {
    console.log('room data is :', roomData.title, roomData.description, roomData.owner)
    const create = new Room(roomData)
    await create.save()
    res.status(201).json({ message: 'The is created', room: create._id })
    if (!done) {
      res.status(401).json({ message: "the room cannot be created" })
    }
    console.log(create)

  } catch (error) {
    console.log(error)
  }

  res.status(201).json({ message: 'the room is created' })
}


export default { createRoom }
