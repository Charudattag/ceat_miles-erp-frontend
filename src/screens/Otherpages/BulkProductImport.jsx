import React, { useState } from "react";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import { addProductAPI } from "../../../src/api/api";
import {
  Card,
  Button,
  Form,
  Table,
  ProgressBar,
  Container,
  Row,
  Col,
  Badge,
} from "react-bootstrap";
import {
  FaFileExcel,
  FaUpload,
  FaDownload,
  FaCheckCircle,
  FaSpinner,
} from "react-icons/fa";
import Swal from "sweetalert2";

const BulkProductImport = ({ fetchProducts, currentPage }) => {
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseExcel(selectedFile);
    }
  };

  const parseExcel = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        setPreviewData(jsonData.slice(0, 5));
        setShowPreview(true);
      } catch (error) {
        toast.error("Error parsing Excel file. Please check the format.");
        console.error("Excel parsing error:", error);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const validateProducts = (products) => {
    const requiredFields = [
      "product_name",
      "price",
      "gst_percentage",
      "minimum_order_quantity",
      "available_stock",
    ];
    const invalidProducts = products.filter((product) =>
      requiredFields.some((field) => !product[field] && product[field] !== 0)
    );
    if (invalidProducts.length > 0) {
      return {
        valid: false,
        message: `${invalidProducts.length} products are missing required fields.`,
      };
    }
    return { valid: true };
  };

  const handleBulkImport = async () => {
    if (!file) {
      toast.warning("Please select an Excel file first");
      return;
    }

    setImporting(true);
    setProgress(0);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const products = XLSX.utils.sheet_to_json(worksheet);

          const validation = validateProducts(products);
          if (!validation.valid) {
            toast.error(validation.message);
            setImporting(false);
            return;
          }

          const batchSize = 20;
          let successCount = 0;
          let errorCount = 0;

          for (let i = 0; i < products.length; i += batchSize) {
            const batch = products.slice(i, i + batchSize);
            for (const product of batch) {
              try {
                const response = await addProductAPI(product);
                if (response.success) {
                  successCount++;
                } else {
                  errorCount++;
                  console.error(
                    "Failed to add product:",
                    product.product_name,
                    response.message || "Unknown error"
                  );
                }
              } catch (error) {
                errorCount++;
                console.error("Error adding product:", error.message || error);
              }
            }
            const currentProgress = Math.min(
              Math.round(((i + batch.length) / products.length) * 100),
              100
            );
            setProgress(currentProgress);
            toast.info(
              `Processed ${Math.min(i + batch.length, products.length)} of ${
                products.length
              } products...`
            );
          }

          if (successCount > 0) {
            // Show SweetAlert2 for successful import
            Swal.fire({
              title: "Success!",
              text: `Successfully imported ${successCount} products`,
              icon: "success",
              confirmButtonText: "Great!",
              confirmButtonColor: "#28a745",
              timer: 3000,
              timerProgressBar: true,
              customClass: {
                popup: "animated fadeInDown",
              },
            });

            if (fetchProducts && typeof fetchProducts === "function") {
              fetchProducts(currentPage);
            }
          }
          if (errorCount > 0) {
            toast.error(
              `Failed to import ${errorCount} products. Check console for details.`
            );
          }
        } catch (error) {
          toast.error("Error processing Excel file");
          console.error("Excel processing error:", error);
        }
        setImporting(false);
        setShowPreview(false);
        setFile(null);
        setProgress(0);
        document.getElementById("excel-upload").value = "";
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      toast.error("Error processing file");
      console.error("File processing error:", error);
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        product_name: "Example Product",
        description: "Product description here",
        price: "1000",
        gst_percentage: "18",
        minimum_order_quantity: "10",
        available_stock: "100",
        vendor_id: "2",
      },
    ];
    const worksheet = XLSX.utils.json_to_sheet(template);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
    XLSX.writeFile(workbook, "product_import_template.xlsx");
  };

  return (
    <Container className="my-1">
      <Card className="shadow-lg border-0 rounded-lg overflow-hidden">
        <Card.Header
          className="bg-gradient-primary text-white text-center py-4"
          style={{
            background: "linear-gradient(135deg, #4e73df 0%, #224abe 100%)",
          }}
        >
          <h3 className="mb-2 font-weight-bold">
            <FaFileExcel className="me-2" /> Bulk Product Import
          </h3>
          <p className="mb-0 opacity-75">
            Streamline your inventory management by importing multiple products
            at once
          </p>
        </Card.Header>

        <Card.Body className="p-4">
          <div className="import-steps">
            {/* Step 1 */}
            <div className="step-container mb-5">
              <div className="step-header d-flex align-items-center mb-3">
                <div className="step-number">
                  <span
                    className="badge bg-primary rounded-circle p-2 d-flex align-items-center justify-content-center"
                    style={{ width: "36px", height: "36px" }}
                  >
                    1
                  </span>
                </div>
                <h4 className="ms-3 mb-0">Download Template</h4>
              </div>

              <div className="step-content bg-light p-4 rounded-3 text-center">
                <p className="text-muted mb-3">
                  Start by downloading our Excel template. Fill it with your
                  product data before uploading.
                </p>
                <Button
                  variant="outline-primary"
                  size="lg"
                  onClick={downloadTemplate}
                  className="px-4 py-2 shadow-sm"
                >
                  <FaDownload className="me-2" /> Download Template
                </Button>
              </div>
            </div>

            {/* Step 2 */}
            <div className="step-container mb-5">
              <div className="step-header d-flex align-items-center mb-3">
                <div className="step-number">
                  <span
                    className="badge bg-primary rounded-circle p-2 d-flex align-items-center justify-content-center"
                    style={{ width: "36px", height: "36px" }}
                  >
                    2
                  </span>
                </div>
                <h4 className="ms-3 mb-0">Upload Your File</h4>
              </div>

              <div className="step-content bg-light p-4 rounded-3">
                <div className="file-upload-container text-center">
                  <div
                    className="upload-zone p-4 mb-3 border-2 border-dashed rounded-3 bg-white"
                    style={{ borderStyle: "dashed" }}
                  >
                    <FaUpload className="display-4 text-primary mb-3" />
                    <p className="mb-3">
                      Drag and drop your Excel file here, or click to browse
                    </p>
                    <Form.Group controlId="excel-upload">
                      <Form.Control
                        type="file"
                        accept=".xlsx, .xls"
                        onChange={handleFileChange}
                        disabled={importing}
                        className="d-none"
                      />
                      <Button
                        variant="primary"
                        onClick={() =>
                          document.getElementById("excel-upload").click()
                        }
                        disabled={importing}
                        className="px-4"
                      >
                        Select File
                      </Button>
                    </Form.Group>
                  </div>

                  {file && (
                    <div className="selected-file p-3 bg-white rounded-3 shadow-sm d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center">
                        <FaFileExcel
                          className="text-success me-3"
                          style={{ fontSize: "24px" }}
                        />
                        <div className="text-start">
                          <p className="mb-0 fw-bold">{file.name}</p>
                          <small className="text-muted">
                            {(file.size / 1024).toFixed(2)} KB
                          </small>
                        </div>
                      </div>
                      <Badge bg="success" pill>
                        Ready
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Preview Section */}
            {showPreview && previewData.length > 0 && (
              <div className="preview-container mb-5">
                <div className="d-flex align-items-center mb-3">
                  <h4 className="mb-0">Data Preview</h4>
                  <Badge bg="info" className="ms-2">
                    First {previewData.length < 5 ? previewData.length : 5}{" "}
                    items
                  </Badge>
                </div>

                <div className="table-responsive bg-white rounded-3 shadow-sm">
                  <Table striped hover className="mb-0">
                    <thead className="bg-light">
                      <tr>
                        {Object.keys(previewData[0]).map((key) => (
                          <th key={key} className="py-3">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.map((item, index) => (
                        <tr key={index}>
                          {Object.keys(previewData[0]).map((key) => (
                            <td key={`${index}-${key}`} className="py-3">
                              {item[key]?.toString() || ""}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </div>
            )}

            {/* Step 3 */}
            <div className="step-container">
              <div className="step-header d-flex align-items-center mb-3">
                <div className="step-number">
                  <span
                    className="badge bg-primary rounded-circle p-2 d-flex align-items-center justify-content-center"
                    style={{ width: "36px", height: "36px" }}
                  >
                    3
                  </span>
                </div>
                <h4 className="ms-3 mb-0">Import Products</h4>
              </div>

              <div className="step-content bg-light p-4 rounded-3 text-center">
                {importing && (
                  <div className="mb-4">
                    <p className="mb-2">Importing products... Please wait.</p>
                    <ProgressBar
                      animated
                      striped
                      variant="success"
                      now={progress}
                      label={`${progress}%`}
                      className="mb-3 progress-lg"
                      style={{ height: "25px" }}
                    />
                  </div>
                )}

                <Button
                  variant={importing ? "secondary" : "success"}
                  size="lg"
                  disabled={importing || !file}
                  onClick={handleBulkImport}
                  className="px-5 py-3 shadow"
                >
                  {importing ? (
                    <>
                      <FaSpinner className="me-2 fa-spin" /> Importing...
                    </>
                  ) : (
                    <>
                      <FaCheckCircle className="me-2" /> Import Products
                    </>
                  )}
                </Button>

                {!file && !importing && (
                  <p className="text-muted mt-3">
                    Please upload an Excel file first to enable import.
                  </p>
                )}
              </div>
            </div>
          </div>
        </Card.Body>

        {/* <Card.Footer className="bg-light text-center py-3">
          <p className="text-muted mb-0">
            Need help? Contact our support team for assistance with bulk
            imports.
          </p>
        </Card.Footer> */}
      </Card>
    </Container>
  );
};

export default BulkProductImport;
