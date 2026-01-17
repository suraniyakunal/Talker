import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import generateToken from '../auth/generateToken.js';
import bcrypt from 'bcryptjs';
import FriendshipRequest from '../models/friendshipModel.js';

const logout = async (req, res) => {
  const { request } = req.body;
  console.log(request);
  if (request === 'yes') {
    try {
      res.cookie('token', '', { maxAge: 0 });
      res.status(200).json({ message: 'Logged out Successfully' });
    } catch (error) {
      console.log('Error in the lougout Controller', error.message);
    }
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user) {
    return res.status(401).json({ message: 'invalid username or password' });
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return res.status(401).json({ message: 'invalid username or password' });
  }

  if (user && isMatch) {
    generateToken(user._id, res); // sets httpOnly cookie

    return res.status(200).json({
      _id: user._id,
      user: user.username,
      email: user.email,
      profile_Pic: user.profile_Pic,
      role: user.role,
    });
  }
};

const signUp = async (req, res) => {
  const saltRounds = 10;
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const savedUser = new User({
      username,
      email,
      password: hashedPassword, // Store hashed password correctly
    });

    await savedUser.save();

    if (savedUser) {
      generateToken(savedUser._id, res);
      await savedUser.save();
      res.status(201).json({
        _id: savedUser._id,
        userName: savedUser.username,
        email: savedUser.email,
        profile_Pic: savedUser.profile_Pic,
        role: savedUser.role,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Error in signup:', error);
  }
};

const getAllUsers = async (req, res) => {
  try {
    const allUsers = await User.find({}, '-password');
    if (!allUsers || allUsers.length === 0) {
      return res.status(404).json({ message: 'No users' });
    }
    return res.status(200).json(allUsers);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const updateProfile = async (req, res) => {};

export const searchUsers = async (req, res, next) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: 'i' } },
          { email: { $regex: req.query.search, $options: 'i' } },
        ],
      }
    : {};

  // Combine the keyword search with excluding the current user
  const users = await User.find(keyword)
    .find({ _id: { $ne: req.user.id } }) // Exclude current user
    .select('username email _id'); // ONLY return safe data

  res.send(users);
};

const checkAuth = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'No valid session' });
    }

    // Optionally refresh user data from DB
    const user = await User.findById(req.user._id).select('-password');

    return res.status(200).json({ user });
  } catch (error) {
    console.error('Error in checkAuth:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

const sendFriendRequest = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user;
    console.log('sender reciever id ', senderId._id, receiverId);
    if (!senderId || !receiverId)
      return res.status(401).json({ message: 'senderId and recieverId is not available' });

    const newRequest = new FriendshipRequest({
      sender: senderId._id,
      receiver: receiverId,
    });

    await newRequest.save();

    if (!newRequest) return res.status(401).json({ message: 'request is not send' });

    return res
      .status(200)
      .json({ message: 'The request is send on the database', requestId: newRequest._id });
  } catch (error) {
    return res.status(401).json({ message: 'error in sending request' });
  }
};

const getAllFriendRequests = async (req, res) => {
  try {
    const requests = await FriendshipRequest.find({
      receiver: req.user._id,
      status: 'pending',
    }).populate({
      path: 'sender',
      model: User,
      select: 'username profile_Pic',
    });

    return res.status(200).json(requests);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const acceptRequest = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { requestId } = req.body;

    const request = await FriendshipRequest.findById(requestId);

    if (!request) return res.status(404).json({ message: 'Request not found' });

    if (request.receiver.toString() !== currentUserId.toString())
      return res.status(403).json({ message: 'Not authorized to accept this request' });

    if (request.status !== 'pending')
      return res.status(400).json({ message: 'Request already processed' });

    request.status = 'accepted';
    await request.save();

    //update the user friend list for receiver
    await User.findByIdAndUpdate(currentUserId, {
      $addToSet: { friends: request.sender },
    });

    // update the user friend list for sender
    await User.findByIdAndUpdate(request.sender, {
      $addToSet: { friends: request.receiver },
    });

    return res.status(200).json({
      message: 'Friend request accepted',
      senderId: request.sender,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getAllFriends = async (req, res) => {
  try {
    // 1. Safety check for req.user
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Unauthorized: No user found on request' });
    }

    const currentUserId = req.user._id;

    const findFriends = await User.findById(currentUserId).populate({
      path: 'friends',
      model: User,
      select: '_id username email profile_Pic',
    });

    if (!findFriends) return res.status(404).json({ message: 'User record not found' });

    // 2. Safely extract friends list
    const friendsList = findFriends.friends || [];
    const validFriends = friendsList.filter((friend) => friend !== null);

    return res.status(200).json(validFriends);
  } catch (error) {
    console.error('Error in getAllFriends:', error); // Log this to see the actual error in your terminal
    return res.status(500).json({ message: error.message });
  }
};

export default {
  login,
  signUp,
  getAllUsers,
  logout,
  updateProfile,
  checkAuth,
  searchUsers,
  sendFriendRequest,
  getAllFriendRequests,
  acceptRequest,
  getAllFriends,
};
