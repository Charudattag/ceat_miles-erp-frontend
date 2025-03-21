import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Spinner,
  Button,
  Badge,
  Card,
  Modal,
  Form,
  Table,
} from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import {
  getProductByIdAPI,
  addMediaAPI,
  getAllMediaAPI,
  deleteMediaAPI,
  IMG_URL,
} from "../../../src/api/api";
import {
  FaArrowLeft,
  FaEdit,
  FaBoxOpen,
  FaTag,
  FaPercent,
  FaWarehouse,
  FaCalendarAlt,
  FaUser,
  FaPlus,
  FaTrash,
  FaImage,
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./ProductDetails.css";

const ProductDetails = () => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaType, setMediaType] = useState("image");
  const [mediaList, setMediaList] = useState([]);
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [mediaToDelete, setMediaToDelete] = useState(null);

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await getProductByIdAPI(id);
        console.log("API Response:", response);
        if (response.success) {
          setProduct(response.data);
        } else {
          setError(response.message || "Failed to fetch product.");
        }
      } catch (err) {
        setError("An error occurred while fetching the product.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const fetchProductMedia = async () => {
    try {
      setMediaLoading(true);
      const response = await getAllMediaAPI();
      if (response?.data?.media) {
        const productMedia = response.data.media.filter(
          (media) => media.product_id.toString() === id.toString()
        );
        setMediaList(productMedia);
      }
    } catch (error) {
      toast.error("Error fetching media");
      console.error("Error fetching media:", error);
    } finally {
      setMediaLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProductMedia();
    }
  }, [id]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMediaFile(file);

      if (file.type.startsWith("image/")) {
        setMediaType("image");
      } else if (file.type.startsWith("video/")) {
        setMediaType("video");
      } else if (file.type === "application/pdf") {
        setMediaType("pdf");
      } else {
        setMediaType("image");
      }
    }
  };

  const handleMediaUpload = async (e) => {
    e.preventDefault();

    if (!mediaFile) {
      toast.error("Please select a file to upload!");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("product_id", id);

      console.log("Media type detected:", mediaType);
      console.log("File type:", mediaFile.type);

      if (mediaType === "image") {
        formData.append("images", mediaFile);
      } else if (mediaType === "video") {
        formData.append("videos", mediaFile);
      } else if (mediaType === "pdf") {
        formData.append("pdf", mediaFile);
      }

      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value instanceof File ? value.name : value}`);
      }

      const response = await addMediaAPI(formData);

      if (response.success) {
        toast.success("Media uploaded successfully!");
        fetchProductMedia();
        setShowMediaModal(false);
        setMediaFile(null);
      } else {
        toast.error(response.message || "Error uploading media");
      }
    } catch (error) {
      toast.error("Failed to upload media");
      console.error("Upload error:", error);
    }
  };

  const handleDeleteMedia = (mediaId) => {
    setMediaToDelete(mediaId);
    setShowDeleteModal(true);
  };

  const confirmDeleteMedia = async () => {
    try {
      const response = await deleteMediaAPI(mediaToDelete);
      if (response.success) {
        toast.success("Media deleted successfully");
        fetchProductMedia();
      } else {
        toast.error(response.message || "Failed to delete media");
      }
    } catch (error) {
      toast.error("Error deleting media");
      console.error("Delete error:", error);
    } finally {
      setShowDeleteModal(false);
      setMediaToDelete(null);
    }
  };

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Spinner animation="border" variant="primary" />
        <p>Loading product details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-card">
          <h3>Error</h3>
          <p>{error}</p>
          <Button variant="primary" onClick={() => navigate(-1)}>
            <FaArrowLeft className="me-2" /> Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="error-container">
        <div className="error-card">
          <h3>No Data</h3>
          <p>No product data found.</p>
          <Button variant="primary" onClick={() => navigate(-1)}>
            <FaArrowLeft className="me-2" /> Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="product-details-page">
      <div className="header-section">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center">
            <h1>{product.product_name}</h1>
            <div>
              <Button
                variant="success"
                className="me-2"
                onClick={() => setShowMediaModal(true)}
              >
                <FaImage className="me-2" /> Add Media
              </Button>
              <Button
                variant="outline-light"
                className="back-button"
                onClick={() => navigate("/product")}
              >
                <FaArrowLeft className="me-2" /> Back to Products
              </Button>
            </div>
          </div>
          <Badge
            bg={product.is_active ? "success" : "danger"}
            className="status-badge"
          >
            {product.is_active ? "Active" : "Inactive"}
          </Badge>
        </div>
      </div>

      <Container className="content-section">
        <Row>
          <Col lg={8}>
            <div className="info-card">
              <div className="card-header">
                <h3>
                  <FaBoxOpen className="me-2" /> Product Information
                </h3>
              </div>
              <div className="card-body">
                <div className="info-item">
                  <div className="info-label">Description</div>
                  <div className="info-value description">
                    {product.description}
                  </div>
                </div>
                <div className="info-grid">
                  <div className="info-item">
                    <div className="info-label">
                      <FaTag className="me-2" /> Price
                    </div>
                    <div className="info-value price">₹ {product.price}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">
                      <FaPercent className="me-2" /> GST
                    </div>
                    <div className="info-value">{product.gst_percentage}%</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="info-card">
              <div className="card-header">
                <h3>
                  <FaWarehouse className="me-2" /> Inventory Details
                </h3>
              </div>
              <div className="card-body">
                <div className="info-grid">
                  <div className="info-item">
                    <div className="info-label">Minimum Order Quantity</div>
                    <div className="info-value">
                      {product.minimum_order_quantity} units
                    </div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Available Stock</div>
                    <div className="info-value">
                      {product.available_stock} units
                    </div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Vendor Name</div>
                    <div className="info-value">{product.vendor_name}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="info-card mt-4">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h3>
                  <FaImage className="me-2" /> Product Media
                </h3>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowMediaModal(true)}
                >
                  <FaPlus /> Add Media
                </Button>
              </div>
              <div className="card-body">
                {mediaLoading ? (
                  <div className="text-center py-3">
                    <Spinner animation="border" size="sm" />
                    <p>Loading media...</p>
                  </div>
                ) : mediaList.length === 0 ? (
                  <div className="text-center py-3">
                    <p>No media available for this product.</p>
                    <Button
                      variant="outline-primary"
                      onClick={() => setShowMediaModal(true)}
                    >
                      <FaPlus /> Add Media
                    </Button>
                  </div>
                ) : (
                  <div className="media-gallery">
                    <Row>
                      {mediaList.map((media) => (
                        <Col md={4} key={media.id} className="mb-3">
                          <Card>
                            <div className="media-preview">
                              {media.type === "IMAGE" ? (
                                <img
                                  src={`${IMG_URL}/uploads/${media.name}`}
                                  alt={media.name}
                                  className="img-fluid"
                                />
                              ) : media.type === "VIDEO" ? (
                                <video width="100%" controls>
                                  <source
                                    src={`${IMG_URL}/uploads/${media.name}`}
                                    type="video/mp4"
                                  />
                                </video>
                              ) : (
                                <div className="pdf-preview">
                                  <a
                                    href={`${IMG_URL}/uploads/${media.name}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-sm btn-outline-primary"
                                  >
                                    View PDF
                                  </a>
                                </div>
                              )}
                            </div>
                            <Card.Footer className="text-center">
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleDeleteMedia(media.id)}
                              >
                                <FaTrash />
                              </Button>
                            </Card.Footer>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </div>
                )}
              </div>
            </div>
          </Col>

          <Col lg={4}>
            <div className="info-card">
              <div className="card-header">
                <h3>
                  <FaCalendarAlt className="me-2" /> Timeline
                </h3>
              </div>
              <div className="card-body">
                <div className="timeline">
                  <div className="timeline-item">
                    <div className="timeline-icon created">
                      <FaCalendarAlt />
                    </div>
                    <div className="timeline-content">
                      <h5>Created</h5>
                      <p className="date">{formatDate(product.createdAt)}</p>
                      <p className="user">
                        <FaUser className="me-1" /> User ID:{" "}
                        {product.created_by}
                      </p>
                    </div>
                  </div>
                  <div className="timeline-item">
                    <div className="timeline-icon updated">
                      <FaCalendarAlt />
                    </div>
                    <div className="timeline-content">
                      <h5>Last Updated</h5>
                      <p className="date">{formatDate(product.updatedAt)}</p>
                      <p className="user">
                        <FaUser className="me-1" /> User ID: {product.update_by}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>

      <Modal
        show={showMediaModal}
        onHide={() => setShowMediaModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Media for {product.product_name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleMediaUpload}>
            <Form.Group className="mb-3">
              <Form.Label>Product ID</Form.Label>
              <Form.Control type="text" value={id} disabled />
              <Form.Text className="text-muted">
                Media will be uploaded for this product.
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Upload File</Form.Label>
              <Form.Control
                type="file"
                accept="image/*,video/*,application/pdf"
                onChange={handleFileChange}
                required
              />
              <Form.Text className="text-muted">
                Select an image, video, or PDF file. Type will be detected
                automatically.
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Detected Media Type</Form.Label>
              <Form.Control
                type="text"
                value={
                  mediaType === "image"
                    ? "Image"
                    : mediaType === "video"
                    ? "Video"
                    : "PDF"
                }
                disabled
              />
            </Form.Group>

            <div className="d-flex justify-content-end">
              <Button
                variant="secondary"
                onClick={() => setShowMediaModal(false)}
                className="me-2"
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Upload
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this media?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDeleteMedia}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer />
    </div>
  );
};

export default ProductDetails;
