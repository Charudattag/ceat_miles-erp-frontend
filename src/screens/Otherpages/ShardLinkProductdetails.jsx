import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Alert,
  Badge,
  Tabs,
  Tab,
} from "react-bootstrap";
import {
  FaArrowLeft,
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaBox,
  FaInfoCircle,
  FaStore,
  FaClipboardList,
  FaRupeeSign,
  FaPercentage,
} from "react-icons/fa";
import { getProductByIdAPI, IMG_URL } from "../../../src/api/api";

const ShardLinkProductdetails = () => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("details");
  const [activeImage, setActiveImage] = useState(0);
  const { slug } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        const response = await getProductByIdAPI(slug);
        if (response && response.success) {
          setProduct(response.data);
        } else {
          throw new Error(
            response?.message || "Failed to fetch product details"
          );
        }
      } catch (err) {
        console.error("Error fetching product details:", err);
        setError(err.message || "Failed to load product details");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProductDetails();
    }
  }, [slug]);

  const calculateFinalPrice = () => {
    if (!product) return 0;
    const basePrice = parseFloat(product.price) || 0;
    const gst = (basePrice * (parseFloat(product.gst_percentage) || 0)) / 100;
    return (basePrice + gst).toFixed(2);
  };

  const calculateGstAmount = () => {
    if (!product) return 0;
    const basePrice = parseFloat(product.price) || 0;
    const gst = (basePrice * (parseFloat(product.gst_percentage) || 0)) / 100;
    return gst.toFixed(2);
  };

  const renderStarRating = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="text-warning" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStarHalfAlt key={i} className="text-warning" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-warning" />);
      }
    }
    return stars;
  };

  const handleThumbnailClick = (index) => {
    setActiveImage(index);
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <div
          className="d-flex flex-column align-items-center justify-content-center"
          style={{ minHeight: "60vh" }}
        >
          <Spinner
            animation="border"
            variant="primary"
            style={{ width: "3rem", height: "3rem" }}
          />
          <p className="mt-4 h5 text-muted">Loading product details...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <div
          className="text-center"
          style={{
            minHeight: "60vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Alert
            variant="danger"
            className="mx-auto"
            style={{ maxWidth: "600px" }}
          >
            <Alert.Heading className="text-center">
              Error Loading Product
            </Alert.Heading>
            <p className="text-center mb-4">{error}</p>
            <div className="text-center">
              <Button
                variant="outline-primary"
                onClick={handleBackClick}
                size="lg"
              >
                <FaArrowLeft className="me-2" /> Go Back
              </Button>
            </div>
          </Alert>
        </div>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container className="py-4">
        <div
          className="text-center"
          style={{
            minHeight: "60vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Alert
            variant="info"
            className="mx-auto"
            style={{ maxWidth: "600px" }}
          >
            <Alert.Heading className="text-center">
              Product Not Found
            </Alert.Heading>
            <p className="text-center mb-4">
              The product you're looking for doesn't exist or has been removed.
            </p>
            <div className="text-center">
              <Button
                variant="outline-primary"
                onClick={handleBackClick}
                size="lg"
              >
                <FaArrowLeft className="me-2" /> Go Back
              </Button>
            </div>
          </Alert>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Button
        variant="light"
        className="mb-4 shadow-sm d-flex align-items-center"
        onClick={handleBackClick}
        style={{
          borderRadius: "8px",
          padding: "10px 20px",
          fontWeight: "500",
          border: "1px solid #e0e0e0",
        }}
      >
        <FaArrowLeft className="me-2" /> Back to Products
      </Button>

      <Row className="mb-5">
        {/* Product Images */}
        <Col lg={6} md={12} className="mb-4">
          <Card
            className="border-0 shadow overflow-hidden"
            style={{ borderRadius: "12px" }}
          >
            {product.media && product.media.length > 0 ? (
              <>
                <div className="position-relative">
                  <img
                    className="d-block w-100"
                    src={`${IMG_URL}/uploads/${product.media[activeImage].name}`}
                    alt={`${product.product_name}`}
                    style={{
                      height: "450px",
                      objectFit: "contain",
                      backgroundColor: "#f8f9fa",
                      padding: "20px",
                    }}
                  />
                </div>

                {/* Thumbnail Images */}
                {product.media.length > 1 && (
                  <Row className="mt-3 g-2 px-3 pb-3">
                    {product.media.map((media, index) => (
                      <Col xs={3} key={index}>
                        <div
                          className={`thumbnail-wrapper ${
                            activeImage === index
                              ? "border-2 border-primary"
                              : "border"
                          }`}
                          onClick={() => handleThumbnailClick(index)}
                          style={{
                            cursor: "pointer",
                            height: "70px",
                            overflow: "hidden",
                            borderRadius: "8px",
                            transition: "all 0.2s ease-in-out",
                            transform:
                              activeImage === index
                                ? "scale(1.05)"
                                : "scale(1)",
                            boxShadow:
                              activeImage === index
                                ? "0 4px 8px rgba(0,0,0,0.1)"
                                : "none",
                          }}
                        >
                          <img
                            src={`${IMG_URL}/uploads/${media.name}`}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-100 h-100"
                            style={{ objectFit: "contain", padding: "5px" }}
                          />
                        </div>
                      </Col>
                    ))}
                  </Row>
                )}
              </>
            ) : (
              <div
                className="text-center p-5 bg-light"
                style={{
                  height: "450px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <FaInfoCircle size={60} className="text-muted mb-3" />
                <p className="text-muted h5">
                  No images available for this product
                </p>
              </div>
            )}
          </Card>
        </Col>

        {/* Product Details */}
        <Col lg={6} md={12}>
          <div className="product-details">
            <h1 className="mb-2 product-title fw-bold">
              {product.product_name}
            </h1>

            <div className="d-flex align-items-center mb-3">
              <div className="me-3">{renderStarRating(4.5)}</div>
              <span className="text-muted">(24 Reviews)</span>
              <Badge
                bg={product.available_stock > 0 ? "success" : "danger"}
                className="ms-3 px-3 py-2"
                pill
              >
                {product.available_stock > 0 ? "In Stock" : "Out of Stock"}
              </Badge>
            </div>

            <div
              className="price-section p-4 mb-4 bg-white rounded shadow"
              style={{ borderRadius: "12px" }}
            >
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h3 className="text-primary mb-0 fw-bold">
                    ₹{calculateFinalPrice()}
                  </h3>
                  <div className="d-flex align-items-center">
                    <p className="text-muted mb-0 me-2">
                      Base Price: ₹{product.price}
                    </p>
                  </div>
                </div>
                <div className="text-end">
                  <Badge bg="info" className="p-2 rounded-pill">
                    GST: ₹{calculateGstAmount()} ({product.gst_percentage}%)
                  </Badge>
                </div>
              </div>
            </div>

            <div
              className="product-specs p-4 mb-4 bg-white rounded shadow"
              style={{ borderRadius: "12px" }}
            >
              <h5 className="mb-3 border-bottom pb-2 fw-bold">
                Product Specifications
              </h5>
              <Row className="g-3">
                <Col xs={12} sm={6}>
                  <div className="d-flex align-items-center">
                    <div className="spec-icon me-3 p-2 rounded-circle bg-primary bg-opacity-10">
                      <FaBox className="text-primary" />
                    </div>
                    <div>
                      <small className="text-muted d-block">
                        Minimum Order
                      </small>
                      <strong>{product.minimum_order_quantity} units</strong>
                    </div>
                  </div>
                </Col>
                <Col xs={12} sm={6}>
                  <div className="d-flex align-items-center">
                    <div className="spec-icon me-3 p-2 rounded-circle bg-primary bg-opacity-10">
                      <FaBox className="text-primary" />
                    </div>
                    <div>
                      <small className="text-muted d-block">
                        Available Stock
                      </small>
                      <strong>{product.available_stock} units</strong>
                    </div>
                  </div>
                </Col>
                <Col xs={12}>
                  <div className="d-flex align-items-center">
                    <div className="spec-icon me-3 p-2 rounded-circle bg-primary bg-opacity-10">
                      <FaStore className="text-primary" />
                    </div>
                    <div>
                      <small className="text-muted d-block">Vendor</small>
                      <strong>{product.vendor_name || "Unknown Vendor"}</strong>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          </div>
        </Col>
      </Row>

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4 product-tabs"
        fill
      >
        <Tab eventKey="details" title="Product Details">
          <Card className="p-4 border-top-0 rounded-0 rounded-bottom shadow">
            <Row className="gy-4">
              <Col md={6}>
                <div className="spec-item d-flex">
                  <div className="spec-icon me-3 p-2 rounded-circle bg-primary bg-opacity-10">
                    <FaClipboardList className="text-primary" />
                  </div>
                  <div>
                    <h6 className="mb-1">Product Name</h6>
                    <p className="mb-0">{product.product_name}</p>
                  </div>
                </div>
              </Col>
              <Col md={6}>
                <div className="spec-item d-flex">
                  <div className="spec-icon me-3 p-2 rounded-circle bg-primary bg-opacity-10">
                    <FaRupeeSign className="text-primary" />
                  </div>
                  <div>
                    <h6 className="mb-1">Base Price</h6>
                    <p className="mb-0">₹{product.price}</p>
                  </div>
                </div>
              </Col>
              <Col md={6}>
                <div className="spec-item d-flex">
                  <div className="spec-icon me-3 p-2 rounded-circle bg-primary bg-opacity-10">
                    <FaPercentage className="text-primary" />
                  </div>
                  <div>
                    <h6 className="mb-1">GST Percentage</h6>
                    <p className="mb-0">{product.gst_percentage}%</p>
                  </div>
                </div>
              </Col>
              <Col md={6}>
                <div className="spec-item d-flex">
                  <div className="spec-icon me-3 p-2 rounded-circle bg-primary bg-opacity-10">
                    <FaRupeeSign className="text-primary" />
                  </div>
                  <div>
                    <h6 className="mb-1">Final Price (incl. GST)</h6>
                    <p className="mb-0">₹{calculateFinalPrice()}</p>
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        </Tab>
        <Tab eventKey="description" title="Description">
          <Card className="p-4 border-top-0 rounded-0 rounded-bottom shadow">
            <div className="mt-3">
              <p>{product.description}</p>
            </div>
          </Card>
        </Tab>
      </Tabs>
    </Container>
  );
};

export default ShardLinkProductdetails;
