const mongoose = require('mongoose')

const connectDB = async () => {
  mongoose.set('strictQuery', false)
  await mongoose
    .connect(process.env.MONGO_URI)
    .catch((err) => console.error(err))
}

connectDB()
