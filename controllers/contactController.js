import ContactMessage from "../models/ContactMessage.js";

// POST /api/contact (public - anyone can send a query)
export const createMessage = async (req, res, next) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      res.status(400);
      throw new Error("Name, email and message are required");
    }

    const newMessage = await ContactMessage.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || "",
      subject: subject?.trim() || "General Query",
      message: message.trim(),
      status: "New",
    });

    res.status(201).json(newMessage);
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/messages (admin only)
export const getMessages = async (req, res, next) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/admin/messages/:id (admin only - mark New/Resolved)
export const resolveMessage = async (req, res, next) => {
  try {
    const { status } = req.body;
    const msg = await ContactMessage.findById(req.params.id);

    if (!msg) {
      res.status(404);
      throw new Error("Message not found");
    }

    msg.status = status;
    const updated = await msg.save();
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/admin/messages/:id (admin only)
export const deleteMessage = async (req, res, next) => {
  try {
    const msg = await ContactMessage.findById(req.params.id);

    if (!msg) {
      res.status(404);
      throw new Error("Message not found");
    }

    await msg.deleteOne();
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};