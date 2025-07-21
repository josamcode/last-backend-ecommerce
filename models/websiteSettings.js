const mongoose = require("mongoose");

const websiteSettingsSchema = new mongoose.Schema(
  {
    logo: {
      type: String, // URL of image or plain text
      required: false,
    },
    logoType: {
      type: String,
      enum: ["image", "text"],
      default: "text",
    },
    siteColors: {
      primary: { type: String, default: "#000000" },
      secondary: { type: String, default: "#ffffff" },
    },
    fontFamily: {
      type: String,
      default: "Arial, sans-serif",
    },
    siteName: {
      type: String,
      required: true,
    },
    siteDescription: {
      type: String,
      default: "",
    },
    siteTagline: {
      type: String,
      default: "",
    },
    contact: {
      email: { type: String, required: false },
      phone: { type: String, required: false },
      whatsapp: { type: String, required: false },
      address: { type: String, required: false },
      workingHours: { type: String, required: false },
    },
    socialLinks: {
      facebook: { type: String, default: "" },
      instagram: { type: String, default: "" },
      twitter: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      youtube: { type: String, default: "" },
      tiktok: { type: String, default: "" },
    },
    aboutUs: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WebsiteSettings", websiteSettingsSchema);
