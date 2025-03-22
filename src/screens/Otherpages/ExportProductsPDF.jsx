import React, { useState, useEffect } from "react";
import { Button, Spinner, Card } from "react-bootstrap";
import { toast } from "react-toastify";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { IMG_URL } from "../../api/api";
import axios from "axios";

const PDF_CONFIG = {
  page: {
    width: 595.28,
    height: 841.89,
    margin: 40,
  },
  fonts: {
    normal: StandardFonts.Helvetica,
    bold: StandardFonts.HelveticaBold,
  },
  colors: {
    primary: rgb(0.1, 0.4, 0.8),
    background: rgb(0.98, 0.98, 1),
    text: rgb(0.2, 0.2, 0.2),
    border: rgb(0.8, 0.8, 0.9),
  },
};

const ExportProductsPDF = ({ products, vendors, categories, onClose }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageCache, setImageCache] = useState({});
  const [loading, setLoading] = useState(false);

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

  const createCoverPage = async (pdfDoc, fonts) => {
    const { width, height, margin } = PDF_CONFIG.page;
    const page = pdfDoc.addPage([width, height]);

    // Background
    page.drawRectangle({
      x: 0,
      y: 0,
      width,
      height,
      color: PDF_CONFIG.colors.background,
    });

    // Header banner
    page.drawRectangle({
      x: 0,
      y: height - 250,
      width,
      height: 250,
      color: PDF_CONFIG.colors.primary,
    });

    // Title and info
    page.drawText("PRODUCT CATALOG", {
      x: margin,
      y: height - 150,
      size: 48,
      font: fonts.bold,
      color: rgb(1, 1, 1),
    });

    // Stats box
    const statsBox = {
      x: margin,
      y: height / 2 - 100,
      width: width - margin * 2,
      height: 200,
    };

    page.drawRectangle({
      ...statsBox,
      color: rgb(1, 1, 1),
      opacity: 0.05,
      borderColor: PDF_CONFIG.colors.primary,
      borderWidth: 2,
    });

    // Stats content
    const statsY = statsBox.y + statsBox.height - 50;
    [
      `Total Products: ${products.length}`,
      `Categories: ${categories?.length || 0}`,
      `Vendors: ${vendors?.length || 0}`,
    ].forEach((text, i) => {
      page.drawText(text, {
        x: margin + 30,
        y: statsY - i * 40,
        size: 16,
        font: fonts.normal,
      });
    });

    // Footer
    page.drawText("Bespoke Solutions © 2025", {
      x: margin,
      y: 50,
      size: 24,
      font: fonts.bold,
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
    const page = pdfDoc.addPage([width, height]);
    let yPos = height - 100;

    // Header
    page.drawRectangle({
      x: 0,
      y: height - 80,
      width,
      height: 80,
      color: PDF_CONFIG.colors.primary,
    });

    page.drawText(product.product_name, {
      x: margin,
      y: height - 50,
      size: 24,
      font: fonts.bold,
      color: rgb(1, 1, 1),
    });

    // Images section
    // Inside createProductPage function, replace the existing images section with:

    // Images section
    if (imageCache[product.id]?.length) {
      const images = imageCache[product.id];
      const imageWidth = (width - margin * 3) / 2; // Two images per row
      const maxImgHeight = 200;

      // Process images in pairs
      for (let i = 0; i < Math.min(images.length, 4); i += 2) {
        try {
          // First image in pair
          const image1 = await pdfDoc
            .embedJpg(images[i])
            .catch(() => pdfDoc.embedPng(images[i]));

          if (image1) {
            const imgHeight1 = Math.min(
              (image1.height * imageWidth) / image1.width,
              maxImgHeight
            );

            page.drawImage(image1, {
              x: margin,
              y: yPos - imgHeight1,
              width: imageWidth,
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
                  maxImgHeight
                );

                page.drawImage(image2, {
                  x: margin * 2 + imageWidth,
                  y: yPos - imgHeight2,
                  width: imageWidth,
                  height: imgHeight2,
                });

                // Use the larger height for row spacing
                yPos -= Math.max(imgHeight1, imgHeight2) + 20;
              }
            } else {
              yPos -= imgHeight1 + 20;
            }
          }
        } catch (error) {
          console.error("Image embedding error:", error);
        }
      }
    }

    // Product details table
    const tableConfig = {
      width: width - margin * 2,
      rowHeight: 35,
      fontSize: 12,
      padding: 15,
    };

    const drawDetailRow = (label, value) => {
      const rowY = yPos - tableConfig.rowHeight;

      // Row background
      page.drawRectangle({
        x: margin,
        y: rowY,
        width: tableConfig.width,
        height: tableConfig.rowHeight,
        color: PDF_CONFIG.colors.background,
        borderColor: PDF_CONFIG.colors.border,
        borderWidth: 0.5,
      });

      // Label
      page.drawText(label, {
        x: margin + tableConfig.padding,
        y: rowY + tableConfig.rowHeight / 2 - 6,
        size: tableConfig.fontSize,
        font: fonts.bold,
      });

      // Value
      page.drawText(value || "N/A", {
        x: margin + tableConfig.width / 2 + tableConfig.padding,
        y: rowY + tableConfig.rowHeight / 2 - 6,
        size: tableConfig.fontSize,
        font: fonts.normal,
      });

      yPos -= tableConfig.rowHeight;
    };

    // Draw product details
    [
      ["Price", `$${product.price}`],
      ["GST", `${product.gst_percentage}%`],
      ["Category", product.category?.category_name],
      ["Vendor", product.vendor?.name],
      ["Quantity", product.minimum_order_quantity?.toString()],
      [
        "Tags",
        Array.isArray(product.tags) ? product.tags.join(", ") : product.tags,
      ],
    ].forEach(([label, value]) => drawDetailRow(label, value));

    // Footer
    page.drawRectangle({
      x: 0,
      y: 0,
      width,
      height: 50,
      color: rgb(0.95, 0.95, 0.98),
    });

    page.drawText(`Page ${pageNum} of ${totalPages}`, {
      x: width - margin - 80,
      y: 20,
      size: 10,
      font: fonts.normal,
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
      <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
        <h4 className="mb-0">Export Products Catalog</h4>
        {onClose && (
          <Button variant="light" size="sm" onClick={onClose}>
            ×
          </Button>
        )}
      </Card.Header>

      <Card.Body>
        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3">Loading product images...</p>
          </div>
        ) : (
          <div className="text-center">
            <div className="mb-4 p-3 bg-light rounded">
              <h5>Catalog Summary</h5>
              <div className="row mt-3">
                {[
                  ["Products", products.length],
                  ["Categories", categories?.length || 0],
                  ["Vendors", vendors?.length || 0],
                ].map(([label, value], i) => (
                  <div key={label} className="col-md-4">
                    <div className={i < 2 ? "border-end" : ""}>
                      <h2 className="text-primary">{value}</h2>
                      <p className="text-muted">{label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              onClick={generatePDF}
              disabled={isGenerating || !products.length}
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
                "Generate Product Catalog"
              )}
            </Button>

            {!products.length && (
              <div className="alert alert-warning mt-3">
                No products available to export
              </div>
            )}
          </div>
        )}
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
