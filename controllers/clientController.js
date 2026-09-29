const Client = require("../models/Client");

// Create Client
const createClient = async (req, res) => {
  try {
    const client = await Client.create({
      ...req.body,
      userId: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Client Created Successfully",
      data: client,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Clients (Search + Pagination)
const getClients = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const keyword = req.query.search
      ? {
          $or: [
            {
              clientName: {
                $regex: req.query.search,
                $options: "i",
              },
            },
            {
              companyName: {
                $regex: req.query.search,
                $options: "i",
              },
            },
            {
              email: {
                $regex: req.query.search,
                $options: "i",
              },
            },
            {
              phone: {
                $regex: req.query.search,
                $options: "i",
              },
            },
            {
              gstNumber: {
                $regex: req.query.search,
                $options: "i",
              },
            },
            {
              city: {
                $regex: req.query.search,
                $options: "i",
              },
            },
            {
              state: {
                $regex: req.query.search,
                $options: "i",
              },
            },
            {
              country: {
                $regex: req.query.search,
                $options: "i",
              },
            },
          ],
        }
      : {};

    const filter = {
      userId: req.user._id,
      ...keyword,
    };

    const total = await Client.countDocuments(filter);

    const clients = await Client.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      page,
      totalPages: Math.ceil(total / limit),
      totalClients: total,
      count: clients.length,
      data: clients,
    });
  } catch (error) {
    console.error("GET CLIENTS ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Single Client
const getClient = async (req, res) => {
  try {
    const client = await Client.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client Not Found",
      });
    }

    res.status(200).json({
      success: true,
      data: client,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Client
const updateClient = async (req, res) => {
  try {
    const client = await Client.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user._id,
      },
      req.body,
      {
        returnDocument: "after",
      },
    );

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client Not Found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Client Updated Successfully",
      data: client,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Client
const deleteClient = async (req, res) => {
  try {
    const client = await Client.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client Not Found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Client Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createClient,
  getClients,
  getClient,
  updateClient,
  deleteClient,
};
