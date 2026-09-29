const mongoose = require("mongoose");

const Business = require("../models/Business");

/* =====================================================
   CREATE BUSINESS
===================================================== */

const createBusiness = async (req, res) => {
  try {
    const {
      businessName,
      legalName,
      email,
      phone,
      address,
      city,
      state,
      country,
      zipCode,
      gstNumber,
      panNumber,
      website,
      logo,
      signature,
      bankDetails,
      isDefault,
    } = req.body;

    if (!businessName?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Business name is required",
      });
    }

    const existingBusiness = await Business.findOne({
      userId: req.user._id,
      businessName: businessName.trim(),
    });

    if (existingBusiness) {
      return res.status(400).json({
        success: false,
        message: "Business already exists",
      });
    }

    const businessCount = await Business.countDocuments({
      userId: req.user._id,
    });

    const shouldBeDefault =
      businessCount === 0 || isDefault === true;

    if (shouldBeDefault) {
      await Business.updateMany(
        {
          userId: req.user._id,
        },
        {
          $set: {
            isDefault: false,
          },
        }
      );
    }

    const business = await Business.create({
      userId: req.user._id,

      businessName: businessName.trim(),

      legalName: legalName || "",
      email: email || "",
      phone: phone || "",

      address: address || "",
      city: city || "",
      state: state || "",
      country: country || "India",
      zipCode: zipCode || "",

      gstNumber: gstNumber || "",
      panNumber: panNumber || "",

      website: website || "",

      logo: logo || "",
      signature: signature || "",

      bankDetails: bankDetails || {},

      isDefault: shouldBeDefault,

      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: "Business Created Successfully",
      data: business,
    });
  } catch (error) {
    console.error(
      "CREATE BUSINESS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =====================================================
   GET ALL BUSINESSES
===================================================== */

const getBusinesses = async (req, res) => {
  try {
    const {
      search = "",
      active,
    } = req.query;

    const filter = {
      userId: req.user._id,
    };

    if (active === "true") {
      filter.isActive = true;
    }

    if (active === "false") {
      filter.isActive = false;
    }

    if (search.trim()) {
      const safeSearch = search
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      filter.$or = [
        {
          businessName: {
            $regex: safeSearch,
            $options: "i",
          },
        },

        {
          legalName: {
            $regex: safeSearch,
            $options: "i",
          },
        },

        {
          email: {
            $regex: safeSearch,
            $options: "i",
          },
        },

        {
          phone: {
            $regex: safeSearch,
            $options: "i",
          },
        },

        {
          gstNumber: {
            $regex: safeSearch,
            $options: "i",
          },
        },

        {
          panNumber: {
            $regex: safeSearch,
            $options: "i",
          },
        },
      ];
    }

    const businesses = await Business.find(filter).sort({
      isDefault: -1,
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: businesses.length,
      data: businesses,
    });
  } catch (error) {
    console.error(
      "GET BUSINESSES ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =====================================================
   GET ONE BUSINESS
===================================================== */

const getBusiness = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Business ID",
      });
    }

    const business = await Business.findOne({
      _id: id,
      userId: req.user._id,
    });

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business Not Found",
      });
    }

    return res.status(200).json({
      success: true,
      data: business,
    });
  } catch (error) {
    console.error(
      "GET BUSINESS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =====================================================
   UPDATE BUSINESS
===================================================== */

const updateBusiness = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Business ID",
      });
    }

    const business = await Business.findOne({
      _id: id,
      userId: req.user._id,
    });

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business Not Found",
      });
    }

    if (
      req.body.businessName !== undefined &&
      !req.body.businessName?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Business name cannot be empty",
      });
    }

    if (req.body.businessName) {
      const duplicateBusiness =
        await Business.findOne({
          _id: {
            $ne: id,
          },

          userId: req.user._id,

          businessName:
            req.body.businessName.trim(),
        });

      if (duplicateBusiness) {
        return res.status(400).json({
          success: false,
          message: "Business already exists",
        });
      }
    }

    if (req.body.isDefault === true) {
      await Business.updateMany(
        {
          userId: req.user._id,

          _id: {
            $ne: id,
          },
        },
        {
          $set: {
            isDefault: false,
          },
        }
      );
    }

    const allowedFields = [
      "businessName",
      "legalName",
      "email",
      "phone",
      "address",
      "city",
      "state",
      "country",
      "zipCode",
      "gstNumber",
      "panNumber",
      "website",
      "logo",
      "signature",
      "bankDetails",
      "isDefault",
      "isActive",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        business[field] = req.body[field];
      }
    });

    await business.save();

    return res.status(200).json({
      success: true,
      message: "Business Updated Successfully",
      data: business,
    });
  } catch (error) {
    console.error(
      "UPDATE BUSINESS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =====================================================
   SET DEFAULT BUSINESS
===================================================== */

const setDefaultBusiness = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Business ID",
      });
    }

    const business = await Business.findOne({
      _id: id,
      userId: req.user._id,
    });

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business Not Found",
      });
    }

    if (!business.isActive) {
      return res.status(400).json({
        success: false,
        message:
          "Inactive business cannot be set as default",
      });
    }

    await Business.updateMany(
      {
        userId: req.user._id,
      },
      {
        $set: {
          isDefault: false,
        },
      }
    );

    business.isDefault = true;

    await business.save();

    return res.status(200).json({
      success: true,
      message:
        "Default Business Updated Successfully",
      data: business,
    });
  } catch (error) {
    console.error(
      "SET DEFAULT BUSINESS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =====================================================
   DELETE BUSINESS
===================================================== */

const deleteBusiness = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Business ID",
      });
    }

    const business = await Business.findOne({
      _id: id,
      userId: req.user._id,
    });

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business Not Found",
      });
    }

    const wasDefault = business.isDefault;

    await business.deleteOne();

    if (wasDefault) {
      const nextBusiness = await Business.findOne({
        userId: req.user._id,
        isActive: true,
      }).sort({
        createdAt: -1,
      });

      if (nextBusiness) {
        nextBusiness.isDefault = true;

        await nextBusiness.save();
      }
    }

    return res.status(200).json({
      success: true,
      message: "Business Deleted Successfully",
    });
  } catch (error) {
    console.error(
      "DELETE BUSINESS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =====================================================
   EXPORTS
===================================================== */

module.exports = {
  createBusiness,
  getBusinesses,
  getBusiness,
  updateBusiness,
  setDefaultBusiness,
  deleteBusiness,
};