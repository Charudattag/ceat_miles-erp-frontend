import React, { useState, useEffect, useCallback } from "react";
import { Table, Form, Button, Modal } from "react-bootstrap";
import { FaSearch, FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { FaCopy, FaShare, FaLink, FaFlag, FaFilePdf } from "react-icons/fa";
import ExportProductsPDF from "../../screens/Otherpages/ExportProductsPDF";
import ProductFilter from "../../screens/Otherpages/ProductFilter";
import "./Products.css";

import { Spinner } from "react-bootstrap";

import {
  addProductAPI,
  getAllproductsAPI,
  updateProductAPI,
  deleteProductAPI,
  getAllVendorsAPI,
  addsharedcollectionAPI,
  getAllMediaAPI,
  getAllcategoriesAPI,
  getAllcustomerAPI,
  sendEmailToCustomersAPI,
  IMG_URL,
} from "../../../src/api/api";

const AddProductForm = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [products, setProducts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [shareableLink, setShareableLink] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [showShareLinkModal, setShowShareLinkModal] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectMode, setSelectMode] = useState(true);
  const [sharedCollectionId, setSharedCollectionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [itemsPerPage] = useState(10);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [productToDeleteName, setProductToDeleteName] = useState("");
  const [productsWithImages, setProductsWithImages] = useState({});
  const [allMedia, setAllMedia] = useState([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [productsToExport, setProductsToExport] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isFiltered, setIsFiltered] = useState(false);
  const [filteredProductsList, setFilteredProductsList] = useState([]);
  const [activeFilters, setActiveFilters] = useState(null);
  const [selectedProductsData, setSelectedProductsData] = useState([]);
  const [activeTab, setActiveTab] = useState("share");

  const [newProduct, setNewProduct] = useState({
    product_name: "",
    description: "",
    price: "",
    gst_percentage: "",
    minimum_order_quantity: "",
    available_stock: "",
    vendor_id: "",
    category_id: "",
    tags: "",
  });

  // pegination functions
  const filteredProducts = isFiltered
    ? filteredProductsList.filter((product) =>
        product.product_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : products.filter((product) =>
        product.product_name.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  const handleApplyFilters = (filteredProducts, appliedFilters) => {
    if (appliedFilters === null) {
      // Reset filters
      setIsFiltered(false);
      setFilteredProductsList([]);
      setActiveFilters(null);
    } else {
      // Apply filters
      setFilteredProductsList(filteredProducts);
      setIsFiltered(true);
      setActiveFilters(appliedFilters);
    }
  };

  const handleExportToPdf = () => {
    if (selectedProducts.length === 0) {
      toast.error("Please select at least one product to export");
      return;
    }

    const uniqueProductsToExport = Array.from(
      new Map(selectedProductsData.map((item) => [item.id, item])).values()
    );

    setProductsToExport(uniqueProductsToExport);
    setShowPdfModal(true);
  };

  const handleClosePdfModal = () => {
    setShowPdfModal(false);
    setProductsToExport([]);
  };

  // Add this function to handle exporting a single product
  const handleExportSingleProduct = (product) => {
    setProductsToExport([product]);
    setShowPdfModal(true);
  };

  const fetchProducts = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const response = await getAllproductsAPI({
          page: page,
          limit: itemsPerPage,
        });

        if (response?.success && response?.data?.products) {
          const currentSelectedIds = selectedProducts;

          setProducts(response.data.products);
          setTotalPages(response.data.pagination.totalPages);
          setTotalItems(response.data.pagination.totalItems);

          if (currentSelectedIds.length > 0) {
            response.data.products.forEach((product) => {
              if (currentSelectedIds.includes(product.id)) {
                setSelectedProductsData((prevData) => {
                  const productExists = prevData.some(
                    (p) => p.id === product.id
                  );
                  if (!productExists) {
                    return [...prevData, product];
                  }
                  return prevData;
                });
              }
            });
          }
        } else {
          toast.error("Failed to fetch products");
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error("Failed to fetch products");
      } finally {
        setLoading(false);
      }
    },
    [itemsPerPage, selectedProducts]
  );

  const fetchVendors = useCallback(async () => {
    try {
      const response = await getAllVendorsAPI();
      if (response?.success && response?.data?.vendors) {
        setVendors(response.data.vendors);
      }
    } catch (error) {
      console.error("Error fetching vendors:", error);
    }
  }, []);
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

  const fetchCategories = useCallback(async () => {
    try {
      const response = await getAllcategoriesAPI({
        page: 1,
        limit: 100,
      });

      if (response?.success && response?.data?.categories) {
        setCategories(response.data.categories);
      } else {
        console.error("Failed to fetch categories:", response?.message);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }, []);

  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage, fetchProducts]);

  useEffect(() => {
    fetchVendors();
    fetchCategories();
  }, [fetchVendors, fetchCategories]);

  const fetchAllMedia = async () => {
    try {
      setMediaLoading(true);
      const response = await getAllMediaAPI();
      if (response?.data?.media) {
        setAllMedia(response.data.media);
      }
    } catch (error) {
      console.error("Error fetching media:", error);
    } finally {
      setMediaLoading(false);
    }
  };

  useEffect(() => {
    fetchAllMedia();
  }, []);

  useEffect(() => {
    if (products.length > 0 && allMedia.length > 0) {
      const imageStatus = {};

      const mediaMap = {};
      allMedia.forEach((media) => {
        if (!mediaMap[media.product_id]) {
          mediaMap[media.product_id] = [];
        }
        mediaMap[media.product_id].push(media);
      });

      products.forEach((product) => {
        const productMedia = mediaMap[product.id] || [];
        imageStatus[product.id] = productMedia.some(
          (media) => media.type === "IMAGE"
        );
      });

      setProductsWithImages(imageStatus);
    }
  }, [products, allMedia]);

  const handleSendEmail = async () => {
    if (!selectedCustomers.length) {
      toast.error("Please select at least one customer");
      return;
    }

    if (!emailSubject.trim() || !emailMessage.trim()) {
      toast.error("Please provide both subject and message");
      return;
    }

    setIsSendingEmail(true);
    try {
      // Format customers data for email sending
      const customersToEmail = selectedCustomers.map((customer) => ({
        name: customer.label.split(" (")[0],
        email: customer.email,
      }));

      // Create email data object
      const emailData = {
        customers: customersToEmail,
        subject: emailSubject,
        message: emailMessage,
        shareLink: shareLink,
        productCount: selectedProducts.length,
      };

      const response = await sendEmailToCustomersAPI(emailData);

      if (response.success) {
        toast.success("Emails sent successfully!");
        setShowShareLinkModal(false);
        setSelectedCustomers([]);
        setEmailSubject("");
        setEmailMessage("");
      } else {
        toast.error(response.message || "Failed to send emails");
      }
    } catch (error) {
      console.error("Error sending emails:", error);
      toast.error(
        "Error sending emails: " + (error.message || "Unknown error")
      );
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      fetchProducts(newPage);
    }
  };

  const handleShowModal = () => {
    if (vendors.length === 0) {
      fetchVendors();
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditMode(false);
    setNewProduct({
      product_name: "",
      description: "",
      price: "",
      gst_percentage: "",
      minimum_order_quantity: "",
      available_stock: "",
      vendor_id: "",
      category_id: "",
      tags: "",
    });
    setSelectedProductId(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddProduct = async () => {
    if (!validateProductData()) {
      return;
    }

    try {
      // Process the tags before sending to API
      const processedData = {
        ...newProduct,
        tags: newProduct.tags
          ? newProduct.tags.split(",").map((tag) => tag.trim())
          : [],
      };

      const response = await addProductAPI(processedData);

      if (response.success) {
        toast.success("Product added successfully");
        fetchProducts(currentPage);
        handleCloseModal();
      } else {
        toast.error(response.message || "Failed to add product");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error adding product");
    }
  };

  const validateProductData = () => {
    const {
      product_name,
      description,
      price,
      gst_percentage,
      minimum_order_quantity,
      available_stock,
      category_id,
    } = newProduct;

    if (
      !product_name.trim() ||
      !description.trim() ||
      !price ||
      !gst_percentage ||
      !minimum_order_quantity ||
      !available_stock ||
      !category_id
    ) {
      toast.error("All fields are required");
      return false;
    }

    if (
      price <= 0 ||
      gst_percentage < 0 ||
      minimum_order_quantity <= 0 ||
      available_stock < 0
    ) {
      toast.error("Invalid numeric values");
      return false;
    }

    return true;
  };

  const handleEditProduct = (product) => {
    setEditMode(true);
    setSelectedProductId(product.id);
    setNewProduct({
      product_name: product.product_name,
      description: product.description,
      price: product.price,
      gst_percentage: product.gst_percentage,
      minimum_order_quantity: product.minimum_order_quantity,
      available_stock: product.available_stock,
      vendor_id: product.vendor_id,
      category_id: product.category_id || "",
      tags: product.tags.join(", "),
    });
    handleShowModal();
  };

  const handleUpdateProduct = async () => {
    if (!validateProductData()) {
      return;
    }

    try {
      // Process the tags before sending to API
      const processedData = {
        ...newProduct,
        tags: newProduct.tags
          ? newProduct.tags.split(",").map((tag) => tag.trim())
          : [],
      };

      // Use processedData in the API call
      const response = await updateProductAPI({
        id: selectedProductId,
        formData: processedData,
      });

      if (response.success) {
        toast.success("Product updated successfully");
        fetchProducts(currentPage);
        handleCloseModal();
      } else {
        toast.error(response.message || "Failed to update product");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating product");
      console.error("Error updating product:", error);
    }
  };

  const showDeleteConfirmation = (product) => {
    setProductToDelete(product.id);
    setProductToDeleteName(product.product_name);
    setShowDeleteModal(true);
  };
  const confirmDeleteProduct = async () => {
    if (!productToDelete) {
      toast.error("Product ID is required");
      return;
    }

    try {
      const response = await deleteProductAPI(productToDelete);
      if (response.success) {
        toast.success("Product deleted successfully");
        fetchProducts(currentPage);
      } else {
        toast.error(response.message || "Failed to delete product");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error deleting product");
      console.error("Error deleting product:", error);
    } finally {
      setShowDeleteModal(false);
      setProductToDelete(null);
      setProductToDeleteName("");
    }
  };

  const toggleSelectMode = () => {
    setSelectMode(!selectMode);
    if (selectMode) {
      setSelectedProducts([]);
      setSelectedProductsData([]); // Clear the selected products data too
    }
  };

  const handleProductSelection = (productId) => {
    setSelectedProducts((prev) => {
      if (prev.includes(productId)) {
        // Remove from selected IDs
        const newSelectedIds = prev.filter((id) => id !== productId);

        // Also remove from selected products data
        setSelectedProductsData((prevData) =>
          prevData.filter((product) => product.id !== productId)
        );

        return newSelectedIds;
      } else {
        // Add to selected IDs
        const newSelectedIds = [...prev, productId];

        // Check if product already exists in selectedProductsData to avoid duplicates
        const productToAdd = products.find((p) => p.id === productId);
        if (productToAdd) {
          setSelectedProductsData((prevData) => {
            // Check if this product is already in the array
            const productExists = prevData.some((p) => p.id === productId);
            if (productExists) {
              // If it exists, don't add it again
              return prevData;
            } else {
              // If it doesn't exist, add it
              return [...prevData, productToAdd];
            }
          });
        }

        return newSelectedIds;
      }
    });
  };

  const handleShareMultipleProducts = async () => {
    if (selectedProducts.length === 0) {
      toast.error("Please select at least one product to share");
      return;
    }

    // Set products to export for PDF tab
    const uniqueProductsToExport = Array.from(
      new Map(selectedProductsData.map((item) => [item.id, item])).values()
    );
    setProductsToExport(uniqueProductsToExport);

    try {
      setIsSharing(true);
      toast.info("Generating share link...");

      const response = await addsharedcollectionAPI({
        product_ids: selectedProducts,
      });

      if (response && response.success) {
        const slug = response.data.slug;

        if (!slug) {
          throw new Error("No slug received from server");
        }

        const shareableLink = `${window.location.origin}/shared-products/${slug}`;

        setShareLink(shareableLink);
        setSharedCollectionId(slug);
        setShowShareLinkModal(true);
        toast.success("Share link generated successfully");
      } else {
        toast.error(response?.message || "Failed to generate share link");
      }
    } catch (error) {
      console.error("Error sharing products:", error);
      toast.error(
        "Error generating share link: " + (error.message || "Unknown error")
      );
    } finally {
      setIsSharing(false);
    }
  };

  // Create a new combined modal in the JSX

  const copyShareLink = () => {
    navigator.clipboard
      .writeText(shareLink)
      .then(() => {
        toast.success("Link copied to clipboard");
      })
      .catch(() => {
        toast.error("Failed to copy link");
      });
  };

  const viewSharedProducts = () => {
    if (shareLink) {
      window.open(shareLink, "_blank");
      setShowShareLinkModal(false);
    } else {
      toast.error("No share link available");
    }
  };

  const getVendorNameById = (vendorId) => {
    const vendor = vendors.find((v) => v.id === parseInt(vendorId));
    return vendor ? vendor.name : "Unknown Vendor";
  };

  const navigateToProductDetail = (productId) => {
    navigate(`/productDetails/${productId}`);
  };

  const getSerialNumber = (index) => {
    return (currentPage - 1) * 20 + index + 1;
  };

  return (
    <div className="container bg-white">
      <h2 className="my-4">Product Management</h2>
      <div className="d-flex flex-column mb-3">
        {/* Top row with search and buttons */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-2">
          <div
            className="d-flex align-items-center position-relative mb-2 mb-md-0"
            style={{ width: "300px" }}
          >
            <div className="position-relative w-100">
              <Form.Control
                type="text"
                placeholder="Search Product name"
                className="w-100 pe-5"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <FaSearch
                className="position-absolute end-0 me-3"
                style={{ top: "50%", transform: "translateY(-50%)" }}
              />
            </div>
          </div>

          <div className="d-flex flex-wrap gap-2">
            <ProductFilter
              products={products}
              categories={categories}
              onApplyFilters={handleApplyFilters}
              isFiltered={isFiltered}
              filteredCount={filteredProductsList.length}
              className="btn-fixed-width"
            />

            <Button
              variant="danger"
              onClick={handleShareMultipleProducts}
              disabled={selectedProducts.length === 0 || isSharing}
              className="btn-fixed-width"
            >
              <FaLink /> Share & Export ({selectedProducts.length})
            </Button>

            <Button
              variant="primary"
              onClick={handleShowModal}
              className="btn-fixed-width"
            >
              <FaPlus /> Add Product
            </Button>
          </div>
        </div>

        {/* Second row for active filters */}
        {isFiltered && (
          <div className="active-filters-container p-2 bg-light rounded mt-2">
            <div className="d-flex justify-content-between align-items-center flex-wrap">
              <div className="d-flex flex-wrap align-items-center">
                <strong className="me-2">Active Filters:</strong>
                {activeFilters?.category_id && (
                  <span className="badge bg-info me-2 mb-1">
                    Category:{" "}
                    {
                      categories.find((c) => c.id == activeFilters.category_id)
                        ?.category_name
                    }
                  </span>
                )}
                {activeFilters?.minPrice && (
                  <span className="badge bg-info me-2 mb-1">
                    Min Price: {activeFilters.minPrice}
                  </span>
                )}
                {activeFilters?.maxPrice && (
                  <span className="badge bg-info me-2 mb-1">
                    Max Price: {activeFilters.maxPrice}
                  </span>
                )}
                {activeFilters?.tags &&
                  activeFilters.tags.map((tag) => (
                    <span key={tag} className="badge bg-info me-2 mb-1">
                      Tag: {tag}
                    </span>
                  ))}
              </div>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => handleApplyFilters([], null)}
                className="mt-1 mt-md-0"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        )}
      </div>

      <Table bordered hover responsive>
        <thead>
          <tr>
            {selectMode && <th>Select</th>}
            <th>Sr No.</th>
            <th>Product Name</th>
            <th>Description</th>
            <th>Tag</th>
            <th>Category</th>
            <th>Price</th>
            <th>GST %</th>
            <th>Min. Order Qty</th>
            <th>Available Stock</th>
            <th>Image</th>
            <th>Vendor</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product, index) => (
              <tr key={product.id || index}>
                {selectMode && (
                  <td>
                    <Form.Check
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => handleProductSelection(product.id)}
                    />
                  </td>
                )}
                <td>{index + 1}</td>

                <td>
                  <a
                    href="#"
                    className="text-primary"
                    onClick={(e) => {
                      e.preventDefault();
                      navigateToProductDetail(product.id);
                    }}
                    style={{ cursor: "pointer", textDecoration: "none" }}
                  >
                    {product.product_name}
                  </a>
                </td>
                <td
                  className="text-primary"
                  onClick={(e) => {
                    e.preventDefault();
                    navigateToProductDetail(product.id);
                  }}
                  style={{ cursor: "pointer", textDecoration: "none" }}
                >
                  {product.description}
                </td>
                <td>
                  {product.tags &&
                  Array.isArray(product.tags) &&
                  product.tags.length > 0 ? (
                    product.tags.map((tag, idx) => (
                      <span key={idx} className="badge bg-info me-1 mb-1">
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="badge bg-secondary">No tags</span>
                  )}
                </td>

                <td>{product.category?.category_name || "No Category"}</td>

                <td>{product.price}</td>
                <td>{product.gst_percentage}</td>
                <td>{product.minimum_order_quantity}</td>
                <td>{product.available_stock}</td>
                <td className="text-center">
                  {mediaLoading ? (
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    ></span>
                  ) : productsWithImages[product.id] ? (
                    <FaFlag
                      className="text-success"
                      title="Product has images"
                    />
                  ) : (
                    <FaFlag
                      className="text-danger"
                      title="Product has no images"
                    />
                  )}
                </td>

                <td>{product.vendor?.name || "No vendor"}</td>
                <td>
                  <div className="d-flex">
                    <Button
                      variant="warning"
                      className="me-2"
                      onClick={() => handleEditProduct(product)}
                    >
                      <FaEdit />
                    </Button>
                    <Button
                      variant="danger"
                      className="me-2"
                      onClick={() => showDeleteConfirmation(product)}
                    >
                      <FaTrash />
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={selectMode ? "10" : "9"} className="text-center">
                No products found
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? "Edit Product" : "Add Product"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={(e) => e.preventDefault()}>
            <Form.Group className="mb-3">
              <Form.Label>
                Product Name <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter product name"
                name="product_name"
                value={newProduct.product_name}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                Description <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter product description"
                name="description"
                value={newProduct.description}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>
                Category <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                name="category_id"
                value={newProduct.category_id}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.category_name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                Price <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter price"
                name="price"
                value={newProduct.price}
                onChange={handleInputChange}
                required
                min="1"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                GST Percentage <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter GST percentage"
                name="gst_percentage"
                value={newProduct.gst_percentage}
                onChange={handleInputChange}
                required
                min="0"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                Minimum Order Quantity <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter minimum order quantity"
                name="minimum_order_quantity"
                value={newProduct.minimum_order_quantity}
                onChange={handleInputChange}
                required
                min="1"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                Available Stock <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter available stock"
                name="available_stock"
                value={newProduct.available_stock}
                onChange={handleInputChange}
                required
                min="0"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                Vendor <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                name="vendor_id"
                value={newProduct.vendor_id}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Vendor</option>
                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Tags</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter tags (comma separated)"
                name="tags"
                value={newProduct.tags || ""}
                onChange={handleInputChange}
              />
              <Form.Text className="text-muted">
                Enter tags separated by commas (e.g., premium, office,
                electronics)
              </Form.Text>
            </Form.Group>

            <div className="d-flex justify-content-end">
              <Button
                variant="secondary"
                onClick={handleCloseModal}
                className="me-2"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                onClick={(e) => {
                  e.preventDefault();
                  if (editMode) {
                    handleUpdateProduct();
                  } else {
                    handleAddProduct();
                  }
                }}
              >
                Save
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
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you want to delete{" "}
            <strong>{productToDeleteName}</strong>?
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDeleteProduct}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showShareLinkModal}
        onHide={() => {
          setShowShareLinkModal(false);
          setActiveTab("share");
        }}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Share & Export Products ({selectedProducts.length})
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {/* Custom styled tabs */}
          <div className="custom-tabs-container mb-4">
            <div className="custom-tabs">
              <button
                className={`custom-tab ${
                  activeTab === "share" ? "active" : ""
                }`}
                onClick={() => setActiveTab("share")}
              >
                <FaLink className="tab-icon" />
                <span>Share Products Link</span>
              </button>
              <button
                className={`custom-tab ${activeTab === "pdf" ? "active" : ""}`}
                onClick={() => setActiveTab("pdf")}
              >
                <FaFilePdf className="tab-icon" />
                <span>Export to PDF</span>
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="tab-content mt-4">
            {/* Share Tab */}
            <div
              className={`tab-pane fade ${
                activeTab === "share" ? "show active" : ""
              }`}
            >
              <div className="mb-4">
                <h5>Share Link</h5>
                <div className="input-group mb-3">
                  <Form.Control type="text" value={shareLink} readOnly />
                  <Button variant="outline-secondary" onClick={copyShareLink}>
                    <FaCopy /> Copy
                  </Button>
                </div>
                <Button
                  variant="outline-primary"
                  onClick={viewSharedProducts}
                  className="mb-3 w-100"
                >
                  <FaLink className="me-2" />
                  Preview Shared Products
                </Button>
              </div>

              <hr />

              <div className="mt-1">
                <h4 className="text-center">Share Email</h4>
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
                      onChange={(selected) =>
                        setSelectedCustomers(selected || [])
                      }
                      placeholder="Select customers to share with..."
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Email Subject</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter email subject"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Email Message</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="Enter your message"
                      value={emailMessage}
                      onChange={(e) => setEmailMessage(e.target.value)}
                    />
                  </Form.Group>

                  <Button
                    variant="primary"
                    onClick={handleSendEmail}
                    disabled={isSendingEmail || !selectedCustomers.length}
                    className="w-100"
                  >
                    {isSendingEmail ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <FaShare className="me-2" />
                        Send Email to Selected Customers
                      </>
                    )}
                  </Button>
                </Form>
              </div>
            </div>

            {/* PDF Export Tab */}
            <div
              className={`tab-pane fade ${
                activeTab === "pdf" ? "show active" : ""
              }`}
            >
              <h5 className="mb-3">Export Products to PDF</h5>
              <div className="pdf-export-container">
                <ExportProductsPDF
                  products={productsToExport}
                  vendors={vendors}
                  categories={categories}
                  onClose={() => {}}
                />
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      <div className="d-flex justify-content-between align-items-center mt-3 mb-4">
        <div className="text-muted">
          Showing{" "}
          {products.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{" "}
          {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}{" "}
          products
        </div>

        <ul className="pagination mb-0">
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => handlePageChange(1)}>
              &laquo;
            </button>
          </li>

          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button
              className="page-link"
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Previous
            </button>
          </li>

          {[...Array(totalPages)].map((_, index) => {
            const pageNumber = index + 1;

            if (
              pageNumber === 1 ||
              pageNumber === totalPages ||
              (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
            ) {
              return (
                <li
                  key={pageNumber}
                  className={`page-item ${
                    currentPage === pageNumber ? "active" : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                </li>
              );
            } else if (
              (pageNumber === currentPage - 2 && currentPage > 3) ||
              (pageNumber === currentPage + 2 && currentPage < totalPages - 2)
            ) {
              return (
                <li
                  key={`ellipsis-${pageNumber}`}
                  className="page-item disabled"
                >
                  <span className="page-link">...</span>
                </li>
              );
            }
            return null;
          })}

          <li
            className={`page-item ${
              currentPage === totalPages ? "disabled" : ""
            }`}
          >
            <button
              className="page-link"
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Next
            </button>
          </li>

          <li
            className={`page-item ${
              currentPage === totalPages ? "disabled" : ""
            }`}
          >
            <button
              className="page-link"
              onClick={() => handlePageChange(totalPages)}
            >
              &raquo;
            </button>
          </li>
        </ul>
      </div>
      <ToastContainer />
    </div>
  );
};

export default AddProductForm;
