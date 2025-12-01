const ChatService = require("../service/service.chat.js");

const createChat = async (req, res) => {
  try {
    const chat = await ChatService.createChat(req.body);
    res.status(200).json({ success: true, data: chat, message: "Chat created successfully." });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getChats = async (req, res) => {
  try {
    const chats = await ChatService.getChats();
    res.status(200).json({ success: true, data: chats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getChatById = async (req, res) => {
  try {
    const chat = await ChatService.getChatById(req.params.id);
    if (chat) {
      res.status(200).json({ success: true, data: chat });
    } else {
      res.status(404).json({ success: false, error: "Chat not found" });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateChat = async (req, res) => {
  try {
    const chat = await ChatService.updateChat(req.params.id, req.body);
    res.status(200).json({ success: true, data: chat, message: "Chat updated successfully." });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const deleteChat = async (req, res) => {
  try {
    await ChatService.deleteChat(req.params.id);
    res.status(200).json({ success: true, data: null, message: "Chat deleted successfully." });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  createChat,
  getChats,
  getChatById,
  updateChat,
  deleteChat,
};
