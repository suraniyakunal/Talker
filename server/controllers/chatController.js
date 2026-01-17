import Conversation from '../models/conversationModel.js';
import User from '../models/userModel.js';
import Message from '../models/messageModel.js';

const createConversation = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { receiverId } = req.body;

    if (!senderId || !receiverId)
      return res.status(400).json({ message: 'cannot create conversation' });

    const alreadyExist = await Conversation.findOne({
      participants: {
        $all: [senderId, receiverId],
        $size: 2,
      },
    });

    if (alreadyExist)
      return res.status(200).json({
        message: 'conversation already exists',
        conversationId: alreadyExist._id,
      });

    const newConversation = new Conversation({
      participants: [senderId, receiverId],
    });
    await newConversation.save();
    if (newConversation)
      return res.status(200).json({
        message: 'conversation is created',
        conversationId: newConversation._id,
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Server error', error });
  }
};

const getConversations = async (req, res) => {
  try {
    const currentUserId = req.user._id; // Got from token
    if (!currentUserId) res.status(401).json({ message: 'User id not found' });

    // Find chats where user is a participant
    const conversations = await Conversation.find({
      participants: { $in: [currentUserId] },
    })
      .populate({
        path: 'participants',
        model: User,
        select: 'username profile_Pic',
      }) // Get friend info
      .sort({ updatedAt: -1 });

    return res.status(200).json(conversations);
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
};

const createMessages = async (req, res) => {
  try {
    const { content, conversationId } = req.body;
    if (!content || !conversationId)
      return res.status(404).json({ message: 'The message and conversation Id notfound' });

    const newMessage = await Message.create({
      conversationId: conversationId,
      sender: req.user._id,
      content: content,
    });

    if (!newMessage)
      return res.status(401).json({ message: 'Could not save the message in the database' });

    await newMessage.populate({
      path: 'sender',
      model: User,
      select: 'username profile_Pic',
    });

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: newMessage._id,
    });

    return res.status(200).json(newMessage);
  } catch (error) {
    return res.status(500).json('Could not process saving the message in the database', error);
  }
};

const getAllMessages = async (req, res) => {
  try {
    const conversationId = req.params.conversationId;
    if (!conversationId) res.status(404).json({ message: 'Conversation Id not found' });

    const message = await Message.find({ conversationId })
      .populate({
        path: 'sender',
        model: User,
        select: 'username profile_Pic',
      })
      .sort({ createdAt: 1 });

    if (!message) res.status(401).json({ message: 'Could not get messages' });
    return res.status(200).json(message);
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Error processing the getting messages requests', error });
  }
};

export default {
  createConversation,
  getConversations,
  createMessages,
  getAllMessages,
};
