import mongoose from 'mongoose'

const dbConnect = async (uri) => {
  try {
    await mongoose.connect(uri)
    console.log("The Database is connected")

  } catch (error) {
    console.log("There is some error with the Database", error)
    process.exit(1)
  }
}

export default dbConnect
