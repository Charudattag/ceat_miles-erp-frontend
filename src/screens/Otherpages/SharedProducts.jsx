import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  Card,
  Container,
  Row,
  Col,
  Button,
  Spinner,
  Alert,
} from "react-bootstrap";
import {
  FaShoppingCart,
  FaExternalLinkAlt,
  FaChevronRight,
  FaChevronLeft,
} from "react-icons/fa";
import { getsharedcollectionproductAPI, IMG_URL } from "../../../src/api/api";

const SharedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [collectionInfo, setCollectionInfo] = useState(null);
  const [currentImageIndices, setCurrentImageIndices] = useState({});

  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const getShareIdFromUrl = () => {
    if (id) {
      return id;
    }

    const pathSegments = location.pathname.split("/");
    const lastSegment = pathSegments[pathSegments.length - 1];

    if (lastSegment && !lastSegment.includes("shared-products")) {
      return lastSegment;
    }

    const queryParams = new URLSearchParams(location.search);
    const shareIdFromQuery = queryParams.get("shareId");
    if (shareIdFromQuery) {
      return shareIdFromQuery;
    }

    return null;
  };

  useEffect(() => {
    const fetchSharedProducts = async () => {
      setLoading(true);
      try {
        const shareId = getShareIdFromUrl();
        console.log("Full URL:", location.pathname);
        console.log("ID from params:", id);
        console.log("Extracted share ID:", shareId);

        if (!shareId) {
          throw new Error("No share ID found in URL");
        }

        const response = await getsharedcollectionproductAPI({
          id: shareId,
        });

        console.log("API response:", response);

        if (response && response.success) {
          setCollectionInfo({
            createdBy: response.data.created_by,
            expiresAt: response.data.expires_at,
            createdAt: response.data.createdAt,
          });

          const validProducts = (response.data.products || []).map(
            (product) => ({
              ...product,
              media: Array.isArray(product.media) ? product.media : [],
            })
          );

          setProducts(validProducts);
          const initialIndices = {};
          validProducts.forEach((product) => {
            initialIndices[product.id] = 0;
          });
          setCurrentImageIndices(initialIndices);
          setError(null);
        } else {
          throw new Error(
            response?.message || "Failed to fetch shared products"
          );
        }
      } catch (err) {
        console.error("Error fetching shared products:", err);
        setError(err.message || "Failed to load shared products");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSharedProducts();
  }, [id, location]);

  const nextImage = (productId, e) => {
    e.stopPropagation();
    setCurrentImageIndices((prev) => {
      const product = products.find((p) => p.id === productId);
      const mediaLength = product?.media?.length || 0;
      if (mediaLength <= 1) return prev;

      const currentIndex = prev[productId] || 0;
      const nextIndex = (currentIndex + 1) % mediaLength;

      return {
        ...prev,
        [productId]: nextIndex,
      };
    });
  };

  // Function to navigate to the previous image
  const prevImage = (productId, e) => {
    e.stopPropagation();
    setCurrentImageIndices((prev) => {
      const product = products.find((p) => p.id === productId);
      const mediaLength = product?.media?.length || 0;
      if (mediaLength <= 1) return prev;

      const currentIndex = prev[productId] || 0;
      const prevIndex = (currentIndex - 1 + mediaLength) % mediaLength;

      return {
        ...prev,
        [productId]: prevIndex,
      };
    });
  };

  // Calculate final amount (price + GST)
  const calculateFinalAmount = (price, gstPercentage) => {
    const basePrice = parseFloat(price) || 0;
    const gst = (basePrice * (parseFloat(gstPercentage) || 0)) / 100;
    return (basePrice + gst).toFixed(2);
  };

  const handleAddToCart = (productId) => {
    alert(`Product ${productId} added to cart`);
  };
  const navigateToProductDetail = (productId) => {
    navigate(`/sharedProductslink/${productId}`);
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Loading shared products...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
        </Alert>
      </Container>
    );
  }

  if (products.length === 0) {
    return (
      <Container className="py-5">
        <Alert variant="info">
          <Alert.Heading>No Products Found</Alert.Heading>
          <p>This shared collection doesn't contain any products.</p>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="mb-4 text-center">
        <h1>Shared Products Collection</h1>
        <p className="text-muted">These products have been shared with you</p>
      </div>

      <Row xs={1} md={2} lg={3} className="g-4">
        {products.map((product) => (
          <Col key={product.id}>
            <Card
              className="h-100 shadow-sm"
              onClick={() => navigateToProductDetail(product.id)}
              style={{ cursor: "pointer" }}
            >
              <div className="position-relative">
                <Card.Img
                  variant="top"
                  src={
                    product.media && product.media.length > 0
                      ? `${IMG_URL}/uploads/${
                          product.media[currentImageIndices[product.id] || 0]
                            .name
                        }`
                      : "https://via.placeholder.com/400x400?text=No+Image"
                  }
                  alt={product.product_name}
                  style={{ height: "400px", objectFit: "cover" }}
                />

                {/* Only show navigation buttons if there are multiple images */}
                {product.media && product.media.length > 1 && (
                  <>
                    <Button
                      variant="light"
                      className="position-absolute top-50 start-0 translate-middle-y rounded-circle p-1"
                      style={{ opacity: 0.7 }}
                      onClick={(e) => {
                        e.stopPropagation(); // Stop event propagation here as well
                        prevImage(product.id, e);
                      }}
                    >
                      <FaChevronLeft />
                    </Button>
                    <Button
                      variant="light"
                      className="position-absolute top-50 end-0 translate-middle-y rounded-circle p-1"
                      style={{ opacity: 0.7 }}
                      onClick={(e) => {
                        e.stopPropagation(); // Stop event propagation here as well
                        nextImage(product.id, e);
                      }}
                    >
                      <FaChevronRight />
                    </Button>

                    {/* Image counter indicator */}
                    <div className="position-absolute bottom-0 start-50 translate-middle-x mb-2 px-2 py-1 bg-dark bg-opacity-50 rounded text-white">
                      {(currentImageIndices[product.id] || 0) + 1} /{" "}
                      {product.media.length}
                    </div>
                  </>
                )}
              </div>
              <Card.Body>
                <Card.Title>{product.product_name}</Card.Title>
                <Card.Text className="text-muted mb-2">
                  {product.description.length > 100
                    ? `${product.description.substring(0, 100)}...`
                    : product.description}
                </Card.Text>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="fw-bold">₹{product.price}</span>
                  <span className="text-muted">
                    GST: {product.gst_percentage}%
                  </span>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <small className="text-muted">
                    Min. Order: {product.minimum_order_quantity}
                  </small>
                  <small className="text-success fw-bold">
                    Final Price: ₹
                    {calculateFinalAmount(
                      product.price,
                      product.gst_percentage
                    )}
                  </small>
                </div>
                {/* <div className="d-grid gap-2">
                  <Button
                    variant="primary"
                    onClick={() => handleAddToCart(product.id)}
                    disabled={product.available_stock <= 0}
                  >
                    <FaShoppingCart className="me-2" />
                    Add to Cart
                  </Button>
                  <Button
                    variant="outline-secondary"
                    href={`/product/${product.id}`}
                    target="_blank"
                  >
                    <FaExternalLinkAlt className="me-2" />
                    View Details
                  </Button>
                </div> */}
              </Card.Body>
              {/* <Card.Footer className="text-muted">
                <small>Vendor: {product.vendor_name || "Unknown Vendor"}</small>
              </Card.Footer> */}
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default SharedProducts;
