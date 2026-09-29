const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");

const productRoutes = require("../routes/productRoutes");
const authRoutes = require("../routes/authRoutes");
const invoiceRoutes = require("../routes/invoiceRoutes");
const clientRoutes = require("../routes/clientRoutes");
const dashboardRoutes = require("../routes/dashboardRoutes");
const uploadRoutes = require("../routes/uploadRoutes");
const pdfRoutes = require("../routes/pdfRoutes");
const draftRoutes = require("../routes/draftRoutes");
const emailRoutes = require("../routes/emailRoutes");
const businessRoutes = require("./routes/businessRoutes");

const app = express();

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(cors());

app.use(
  express.json({
    limit: "50mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "50mb",
  })
);

app.use(cookieParser());

app.use(morgan("dev"));

app.use(
  "/uploads",
  express.static("uploads")
);

// =====================================================
// ROUTES
// =====================================================

app.use("/api/auth", authRoutes);

app.use(
  "/api/invoices",
  invoiceRoutes
);

app.use(
  "/api/clients",
  clientRoutes
);

app.use(
  "/api/products",
  productRoutes
);

app.use(
  "/api/dashboard",
  dashboardRoutes
);

app.use(
  "/api/upload",
  uploadRoutes
);

app.use(
  "/api/pdf",
  pdfRoutes
);

app.use(
  "/api/drafts",
  draftRoutes
);

app.use(
  "/api/email",
  emailRoutes
);

app.use(
  "/api/businesses",
  businessRoutes
);

// =====================================================
// HOME ROUTE
// =====================================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message:
      "Invoice Generator Backend Running 🚀",
  });
});

module.exports = app;