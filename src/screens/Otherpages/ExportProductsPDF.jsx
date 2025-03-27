import React, { useState, useEffect } from "react";
import { Button, Spinner, Card, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import Select from "react-select";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import {
  IMG_URL,
  sendEmailTopdfcustomerAPI,
  getAllcustomerAPI,
} from "../../api/api";
import axios from "axios";

const PDF_CONFIG = {
  page: {
    width: 595.28,
    height: 841.89,
    margin: 50,
  },
  fonts: {
    normal: StandardFonts.Helvetica,
    bold: StandardFonts.HelveticaBold,
    italic: StandardFonts.HelveticaOblique,
    light: StandardFonts.Helvetica,
  },
  colors: {
    primary: rgb(0.05, 0.3, 0.6), // Deeper blue
    secondary: rgb(0.7, 0.1, 0.2), // Deep red accent
    accent: rgb(0.95, 0.7, 0.1), // Gold accent
    background: rgb(0.98, 0.98, 1), // Soft white
    altBackground: rgb(0.96, 0.96, 0.98), // Slightly darker for alternating rows
    text: rgb(0.15, 0.15, 0.2), // Darker text for better readability
    lightText: rgb(0.4, 0.4, 0.5), // For secondary information
    border: rgb(0.8, 0.8, 0.9), // Subtle borders
    highlight: rgb(0.9, 0.95, 1), // Highlight color
  },
  effects: {
    borderRadius: 4, // For rounded corners
    shadowDepth: 3, // For shadow effects
    gradientStops: [0.1, 0.9], // For gradient effects
  },
  spacing: {
    section: 30, // Space between sections
    paragraph: 15, // Space between paragraphs
    element: 8, // Space between elements
  },
};

const ExportProductsPDF = ({ products, vendors, categories, onClose }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageCache, setImageCache] = useState({});
  const [loading, setLoading] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const loadImages = async () => {
    if (!products?.length) return;
    setLoading(true);

    try {
      const newImageCache = {};
      await Promise.all(
        products.map(async (product) => {
          if (product.media?.length) {
            newImageCache[product.id] = [];
            const imagesToLoad = product.media.slice(0, 4);

            await Promise.all(
              imagesToLoad.map(async (media) => {
                try {
                  const response = await axios.get(
                    `${IMG_URL}/uploads/${media.name}`,
                    { responseType: "arraybuffer" }
                  );
                  newImageCache[product.id].push(response.data);
                } catch (error) {
                  console.error(`Image load error: ${media.name}`, error);
                }
              })
            );
          }
        })
      );
      setImageCache(newImageCache);
    } catch (error) {
      console.error("Image loading failed:", error);
      toast.error("Failed to load product images");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadImages();
  }, [products]);

  const fetchCustomers = async () => {
    try {
      const response = await getAllcustomerAPI();
      if (response?.success && response?.data?.customers) {
        setCustomers(response.data.customers);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast.error("Failed to fetch customers");
    }
  };
  useEffect(() => {
    fetchCustomers();
  }, []);

  const generateAndSendPDF = async (emailData) => {
    setIsSendingEmail(true);

    try {
      const pdfDoc = await PDFDocument.create();
      const fonts = {
        normal: await pdfDoc.embedFont(PDF_CONFIG.fonts.normal),
        bold: await pdfDoc.embedFont(PDF_CONFIG.fonts.bold),
      };

      await createCoverPage(pdfDoc, fonts);
      for (let i = 0; i < products.length; i++) {
        await createProductPage(
          pdfDoc,
          products[i],
          i + 2,
          products.length + 1,
          fonts
        );
      }

      const pdfBytes = await pdfDoc.save();

      const formData = new FormData();
      formData.append(
        "pdf",
        new Blob([pdfBytes], { type: "application/pdf" }),
        "product-catalog.pdf"
      );
      formData.append("customers", JSON.stringify(selectedCustomers));
      formData.append("subject", subject);
      formData.append("message", message);

      const response = await sendEmailTopdfcustomerAPI(formData);

      if (response.success) {
        toast.success("PDF catalog sent successfully via email!");
        onClose && onClose();
      } else {
        throw new Error(response.message || "Failed to send email");
      }
    } catch (error) {
      console.error("Error sending PDF:", error);
      toast.error(`Failed to send PDF: ${error.message}`);
    } finally {
      setIsSendingEmail(false);
    }
  };

  const createCoverPage = async (pdfDoc, fonts) => {
    const { width, height, margin } = PDF_CONFIG.page;
    const colors = PDF_CONFIG.colors;
    const page = pdfDoc.addPage([width, height]);

    // Background with subtle gradient effect (simulated with multiple rectangles)
    page.drawRectangle({
      x: 0,
      y: 0,
      width,
      height,
      color: colors.background,
    });

    // Add subtle pattern to background
    for (let i = 0; i < height; i += 20) {
      page.drawLine({
        start: { x: 0, y: i },
        end: { x: width, y: i },
        thickness: 0.2,
        color: rgb(0.9, 0.9, 0.95),
      });
    }

    // Header banner with gradient effect
    page.drawRectangle({
      x: 0,
      y: height - 280,
      width,
      height: 280,
      color: colors.primary,
    });

    // Add decorative accent line
    page.drawRectangle({
      x: 0,
      y: height - 285,
      width,
      height: 5,
      color: colors.accent,
    });

    // Title with better positioning and styling
    page.drawText("PRODUCT", {
      x: width / 2 - 140,
      y: height - 130,
      size: 60,
      font: fonts.bold,
      color: rgb(1, 1, 1),
    });

    page.drawText("CATALOG", {
      x: width / 2 - 140,
      y: height - 200,
      size: 60,
      font: fonts.bold,
      color: rgb(1, 1, 1),
    });

    // Decorative element
    page.drawRectangle({
      x: width / 2 - 140,
      y: height - 210,
      width: 280,
      height: 3,
      color: rgb(1, 1, 1),
    });

    // Company tagline
    page.drawText("Quality Products Catalog", {
      x: width / 2 - 100,
      y: height - 230,
      size: 16,
      font: fonts.italic || fonts.normal,
      color: rgb(1, 1, 1),
    });

    const statsBox = {
      x: margin,
      y: height / 2 - 120,
      width: width - margin * 2,
      height: 220,
    };

    // Create shadow effect
    for (let i = 1; i <= 5; i++) {
      page.drawRectangle({
        x: statsBox.x + i,
        y: statsBox.y - i,
        width: statsBox.width,
        height: statsBox.height,
        color: rgb(0, 0, 0),
        opacity: 0.03,
      });
    }

    // Main stats box
    page.drawRectangle({
      ...statsBox,
      color: rgb(1, 1, 1),
      opacity: 0.05,
      borderColor: colors.primary,
      borderWidth: 2,
    });

    // Stats box header
    page.drawRectangle({
      x: statsBox.x,
      y: statsBox.y + statsBox.height - 40,
      width: statsBox.width,
      height: 40,
      color: colors.primary,
      opacity: 0.8,
    });

    page.drawText("CATALOG INFORMATION", {
      x: statsBox.x + statsBox.width / 2 - 100,
      y: statsBox.y + statsBox.height - 25,
      size: 18,
      font: fonts.bold,
      color: rgb(1, 1, 1),
    });

    // Stats content with icons and better alignment
    const statsY = statsBox.y + statsBox.height - 90;
    const statsData = [
      { label: "Total Products", value: products.length.toString() },
      { label: "Categories", value: (categories?.length || 0).toString() },
      // { label: "Vendors", value: (vendors?.length || 0).toString() },
    ];

    statsData.forEach((stat, i) => {
      const yPosition = statsY - i * 50;

      // Icon circles
      page.drawCircle({
        x: statsBox.x + 40,
        y: yPosition,
        size: 15,
        color:
          i === 0 ? colors.primary : i === 1 ? colors.secondary : colors.accent,
      });

      // Label
      page.drawText(stat.label, {
        x: statsBox.x + 70,
        y: yPosition - 6,
        size: 16,
        font: fonts.bold,
        color: colors.text,
      });
      const rectX = statsBox.x + statsBox.width - 80;
      // Value with highlight box
      page.drawRectangle({
        x: rectX,
        y: yPosition - 15, // Adjusted to better center the value
        width: 60,
        height: 30,
        color:
          i === 0 ? colors.primary : i === 1 ? colors.secondary : colors.accent,
        opacity: 0.2,
        borderColor:
          i === 0 ? colors.primary : i === 1 ? colors.secondary : colors.accent,
        borderWidth: 1,
        borderRadius: 4, // Optional: adds rounded corners
      });

      page.drawText(stat.value, {
        x: rectX + 30 - stat.value.length * 4, // Center text in rectangle
        y: yPosition - 6, // Same alignment as label
        size: 16,
        font: fonts.normal,
        color: colors.text,
      });
    });

    // Date information
    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // page.drawText(`Generated: ${currentDate}`, {
    //   x: statsBox.x + 30,
    //   y: statsBox.y + 30,
    //   size: 12,
    //   font: fonts.italic || fonts.normal,
    //   color: colors.text,
    // });

    // Footer with gradient
    page.drawRectangle({
      x: 0,
      y: 0,
      width,
      height: 80,
      color: colors.primary,
    });

    // Company name
    page.drawText("Bespoke Solutions", {
      x: width / 2 - 100,
      y: 50,
      size: 24,
      font: fonts.bold,
      color: rgb(1, 1, 1),
    });

    // Copyright
    page.drawText("© 2025 All Rights Reserved", {
      x: width / 2 - 80,
      y: 20,
      size: 12,
      font: fonts.normal,
      color: rgb(1, 1, 1),
    });

    // Page number
    page.drawCircle({
      x: width - margin - 15,
      y: 30,
      size: 12,
      color: rgb(1, 1, 1),
    });

    page.drawText("1", {
      x: width - margin - 18,
      y: 25,
      size: 10,
      font: fonts.bold,
      color: colors.primary,
    });
  };

  const createProductPage = async (
    pdfDoc,
    product,
    pageNum,
    totalPages,
    fonts
  ) => {
    const { width, height, margin } = PDF_CONFIG.page;
    const colors = PDF_CONFIG.colors;
    const page = pdfDoc.addPage([width, height]);

    // Start position - reduced header height
    let yPos = height - 50; // Reduced from 100 to 80

    // Header with gradient effect - reduced height
    page.drawRectangle({
      x: 0,
      y: height - 50, // Reduced from 100 to 80
      width,
      height: 50, // Reduced from 100 to 80
      color: colors.primary,
    });

    // Product name with better positioning - smaller font size
    page.drawText(product.product_name, {
      x: margin,
      y: height - 40, // Adjusted position
      size: 22, // Reduced from 28 to 22
      font: fonts.bold,
      color: rgb(1, 1, 1),
    });

    // Initial position after header
    yPos -= 5; // Reduced spacing

    // Store the initial position to calculate where the table should start
    const initialYPos = yPos;

    // Fixed image area height allocation
    const imageAreaHeight = 270;

    // Images section with more compact layout
    if (imageCache[product.id]?.length) {
      const images = imageCache[product.id];
      const imageWidth = (width - margin * 2) / 2; // Two images per row
      const maxImgHeight = 270; // Further reduced height for better fitting

      // Process images in pairs
      for (let i = 0; i < Math.min(images.length, 4); i += 2) {
        try {
          // First image in pair with frame
          const image1 = await pdfDoc
            .embedJpg(images[i])
            .catch(() => pdfDoc.embedPng(images[i]));

          if (image1) {
            const imgHeight1 = Math.min(
              (image1.height * imageWidth) / image1.width,
              maxImgHeight - 10
            );
            // Calculate vertical centering offset for first image
            const verticalOffset1 = (maxImgHeight - imgHeight1) / 2;

            // Image frame - simplified
            page.drawRectangle({
              x: margin + 3,
              y: yPos - verticalOffset1 - imgHeight1 - 8,
              width: imageWidth - 6,
              height: imgHeight1 + 6,
              color: rgb(1, 1, 1),
              borderColor: colors.border,
              borderWidth: 0.5,
            });

            page.drawImage(image1, {
              x: margin + 5,
              y: yPos - verticalOffset1 - imgHeight1 - 5,
              width: imageWidth - 10,
              height: imgHeight1,
            });

            // Second image in pair (if exists)
            if (i + 1 < images.length) {
              const image2 = await pdfDoc
                .embedJpg(images[i + 1])
                .catch(() => pdfDoc.embedPng(images[i + 1]));

              if (image2) {
                const imgHeight2 = Math.min(
                  (image2.height * imageWidth) / image2.width,
                  maxImgHeight - 10
                );
                // Calculate vertical centering offset for second image
                const verticalOffset2 = (maxImgHeight - imgHeight2) / 2;

                // Calculate x position for second image (with minimal space between)
                const secondImageX = margin + imageWidth + 10; // Just 10px between images

                // Image frame - simplified
                page.drawRectangle({
                  x: secondImageX + 3, // Reduced spacing between images
                  y: yPos - verticalOffset2 - imgHeight2 - 8,
                  width: imageWidth - 6,
                  height: imgHeight2 + 6,
                  color: rgb(1, 1, 1),
                  borderColor: colors.border,
                  borderWidth: 0.5,
                });

                page.drawImage(image2, {
                  x: secondImageX + 5,
                  y: yPos - verticalOffset2 - imgHeight2 - 5,
                  width: imageWidth - 10,
                  height: imgHeight2,
                });

                // Use the larger height for row spacing
                yPos -= Math.max(imgHeight1, imgHeight2) + 15; // Reduced spacing
              }
            } else {
              yPos -= imgHeight1 + 15; // Reduced spacing
            }
          }
        } catch (error) {
          console.error("Image embedding error:", error);
        }
      }
    }

    // Calculate where the table should start - either after the images or at a fixed position
    // This ensures the table is always below the image area
    const tableStartY = Math.min(yPos - 5, initialYPos - imageAreaHeight - 5);

    // Reset yPos to the fixed table position
    yPos = tableStartY;

    // Section title for product details - compact spacing
    page.drawText("PRODUCT DETAILS", {
      x: margin,
      y: yPos - 15,
      size: 14, // Smaller font
      font: fonts.bold,
      color: colors.primary,
    });

    // Decorative line under section title
    page.drawLine({
      start: { x: margin, y: yPos - 25 },
      end: { x: margin + 120, y: yPos - 25 },
      thickness: 2,
      color: colors.accent,
    });

    yPos -= 35; // Reduced spacing

    // Product details table with more compact styling
    const tableConfig = {
      width: width - margin * 2,
      rowHeight: 30, // Reduced from 35
      fontSize: 11, // Reduced from 12
      padding: 12, // Reduced from 15
    };

    // Table header
    page.drawRectangle({
      x: margin,
      y: yPos,
      width: tableConfig.width / 2,
      height: tableConfig.rowHeight,
      color: colors.primary,
    });

    page.drawText("PROPERTY", {
      x: margin + tableConfig.padding,
      y: yPos + tableConfig.rowHeight / 2 - 5,
      size: tableConfig.fontSize,
      font: fonts.bold,
      color: rgb(1, 1, 1),
    });

    page.drawRectangle({
      x: margin + tableConfig.width / 2,
      y: yPos,
      width: tableConfig.width / 2,
      height: tableConfig.rowHeight,
      color: colors.primary,
    });

    page.drawText("VALUE", {
      x: margin + tableConfig.width / 2 + tableConfig.padding,
      y: yPos + tableConfig.rowHeight / 2 - 5,
      size: tableConfig.fontSize,
      font: fonts.bold,
      color: rgb(1, 1, 1),
    });

    yPos -= tableConfig.rowHeight;

    const drawDetailRow = (label, value, isAlternate = false) => {
      const rowY = yPos;

      // Row background with alternating colors
      page.drawRectangle({
        x: margin,
        y: rowY,
        width: tableConfig.width / 2,
        height: tableConfig.rowHeight,
        color: isAlternate
          ? colors.altBackground || colors.background
          : rgb(1, 1, 1),
        borderColor: colors.border,
        borderWidth: 0.5,
      });

      // Label
      page.drawText(label, {
        x: margin + tableConfig.padding,
        y: rowY + tableConfig.rowHeight / 2 - 5,
        size: tableConfig.fontSize,
        font: fonts.bold,
        color: colors.text,
      });

      // Value background
      page.drawRectangle({
        x: margin + tableConfig.width / 2,
        y: rowY,
        width: tableConfig.width / 2,
        height: tableConfig.rowHeight,
        color: isAlternate
          ? colors.altBackground || colors.background
          : rgb(1, 1, 1),
        borderColor: colors.border,
        borderWidth: 0.5,
      });

      // Value with special formatting for certain fields
      let displayValue = value || "N/A";

      // Format price with currency symbol and thousands separator
      if (label === "Price" && value) {
        displayValue = `Rs. ${parseFloat(value).toLocaleString("en-IN")}`;
      }

      page.drawText(displayValue, {
        x: margin + tableConfig.width / 2 + tableConfig.padding,
        y: rowY + tableConfig.rowHeight / 2 - 5,
        size: tableConfig.fontSize,
        font: fonts.normal,
        color:
          label === "Price"
            ? colors.secondary || colors.primary
            : label === "Price with GST"
            ? rgb(0.8, 0.2, 0.2) // Red color for Price with GST
            : colors.text,
      });

      yPos -= tableConfig.rowHeight;
    };

    // Draw product details with alternating row colors
    [
      ["Product Name", product.product_name],
      ["Price", product.price],
      ["GST", `${product.gst_percentage}%`],
      ["Quantity", product.minimum_order_quantity?.toString()],
      [
        "Price with GST",
        product.price && product.gst_percentage
          ? `Rs. ${(
              parseFloat(product.price) *
              (1 + parseFloat(product.gst_percentage) / 100)
            ).toLocaleString("en-IN")}`
          : "N/A",
      ],
    ].forEach(([label, value], index) =>
      drawDetailRow(label, value, index % 2 === 0)
    );

    // Compact footer
    page.drawRectangle({
      x: 0,
      y: 0,
      width,
      height: 40, // Reduced from 60
      color: colors.altBackground || rgb(0.95, 0.95, 0.98),
    });

    // Company logo placeholder
    page.drawRectangle({
      x: margin,
      y: 10, // Adjusted position
      width: 120,
      height: 25, // Reduced size
      color: colors.primary,
    });

    page.drawText("Bespoke Solutions", {
      x: margin + 10,
      y: 20, // Adjusted position
      size: 10, // Smaller font
      font: fonts.bold,
      color: rgb(1, 1, 1),
    });

    // Page number with compact styling
    page.drawCircle({
      x: width - margin - 15,
      y: 20, // Adjusted position
      size: 12, // Smaller circle
      color: colors.primary,
    });

    page.drawText(pageNum.toString(), {
      x: width - margin - 20 + (pageNum < 10 ? 3 : 0),
      y: 17, // Adjusted position
      size: 10, // Smaller font
      font: fonts.bold,
      color: rgb(1, 1, 1),
    });
  };

  const generatePDF = async () => {
    if (!products.length) {
      toast.error("No products to export");
      return;
    }

    setIsGenerating(true);

    try {
      const pdfDoc = await PDFDocument.create();
      const fonts = {
        normal: await pdfDoc.embedFont(PDF_CONFIG.fonts.normal),
        bold: await pdfDoc.embedFont(PDF_CONFIG.fonts.bold),
      };

      // Create pages
      await createCoverPage(pdfDoc, fonts);

      for (let i = 0; i < products.length; i++) {
        await createProductPage(
          pdfDoc,
          products[i],
          i + 2,
          products.length + 1,
          fonts
        );
      }

      // Save and open PDF
      const pdfBytes = await pdfDoc.save();
      const pdfUrl = URL.createObjectURL(
        new Blob([pdfBytes], { type: "application/pdf" })
      );
      window.open(pdfUrl, "_blank");

      toast.success("PDF catalog generated successfully!");
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast.error(`Failed to generate PDF: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="shadow">
      <Card.Body>
        <>
          <div className="email-section ">
            <h4 className="text-center">Send PDF Email</h4>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Select Customers</Form.Label>
                <Select
                  isMulti
                  options={customers.map((customer) => ({
                    value: customer.id,
                    label: `${customer.name} (${customer.email})`,
                    email: customer.email,
                    name: customer.name,
                  }))}
                  onChange={(selected) => setSelectedCustomers(selected || [])}
                  placeholder="Select customers to send PDF..."
                  className="basic-multi-select"
                  classNamePrefix="select"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email Subject</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter email subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email Message</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Enter your message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </Form.Group>

              <Button
                variant="success"
                onClick={() =>
                  generateAndSendPDF({
                    customers: selectedCustomers.map((customer) => ({
                      email: customer.email,
                      name: customer.name,
                    })),
                    subject,
                    message,
                  })
                }
                disabled={
                  isSendingEmail ||
                  !selectedCustomers.length ||
                  !subject ||
                  !message
                }
                className="w-100"
              >
                {isSendingEmail ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Sending PDF...
                  </>
                ) : (
                  "Send PDF via Email"
                )}
              </Button>
            </Form>
          </div>

          <div className="text-center mt-4">
            <Button
              variant="primary"
              size="lg"
              onClick={generatePDF}
              disabled={isGenerating || products.length === 0}
              className="px-4"
            >
              {isGenerating ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Generating PDF...
                </>
              ) : (
                "Download PDF"
              )}
            </Button>
          </div>
        </>
      </Card.Body>

      <Card.Footer className="bg-light">
        <p className="mb-0 text-muted">
          <small>
            The catalog includes a cover page and detailed product pages with
            multiple images. Each product is displayed on its own page with
            complete information in a tabular format.
          </small>
        </p>
      </Card.Footer>
    </Card>
  );
};

export default ExportProductsPDF;
