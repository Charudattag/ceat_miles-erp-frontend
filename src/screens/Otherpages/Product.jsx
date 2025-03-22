import React, { useState, useEffect, useCallback } from "react";
import { Table, Form, Button, Modal } from "react-bootstrap";
import { FaSearch, FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { FaCopy, FaShare, FaLink, FaFlag, FaFilePdf } from "react-icons/fa";
import ExportProductsPDF from "../../screens/Otherpages/ExportProductsPDF";

import {
  addProductAPI,
  getAllproductsAPI,
  updateProductAPI,
  deleteProductAPI,
  getAllVendorsAPI,
  addsharedcollectionAPI,
  getAllMediaAPI,
  getAllcategoriesAPI,
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
  const [categories, setCategories] = useState([]); // Added categories state
  const [searchQuery, setSearchQuery] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [shareableLink, setShareableLink] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [showShareLinkModal, setShowShareLinkModal] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectMode, setSelectMode] = useState(false);
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
  const [newProduct, setNewProduct] = useState({
    product_name: "",
    description: "",
    price: "",
    gst_percentage: "",
    minimum_order_quantity: "",
    available_stock: "",
    vendor_id: "",
    category_id: "", // Added category_id field
    tags: "",
  });

  // pegination functions
  const filteredProducts = products.filter((product) =>
    product.product_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  const handleExportToPdf = () => {
    if (selectedProducts.length === 0) {
      toast.error("Please select at least one product to export");
      return;
    }

    // Filter the products to get only the selected ones
    const selectedProductsData = products.filter((product) =>
      selectedProducts.includes(product.id)
    );

    setProductsToExport(selectedProductsData);
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
          setProducts(response.data.products);
          setTotalPages(response.data.pagination.totalPages);
          setTotalItems(response.data.pagination.totalItems);
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
    [itemsPerPage]
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

  const fetchCategories = useCallback(async () => {
    try {
      const response = await getAllcategoriesAPI({
        page: 1,
        limit: 100, // Get all categories
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

      // Use processedData instead of newProduct
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

  // const handleDeleteProduct = async (productId) => {
  //   if (!productId) {
  //     toast.error("Product ID is required");
  //     return;
  //   }

  //   try {
  //     if (window.confirm("Are you sure you want to delete this product?")) {
  //       const response = await deleteProductAPI(productId);
  //       if (response.success) {
  //         toast.success("Product deleted successfully");
  //         fetchProducts(currentPage);
  //       } else {
  //         toast.error(response.message || "Failed to delete product");
  //       }
  //     }
  //   } catch (error) {
  //     toast.error(error.response?.data?.message || "Error deleting product");
  //     console.error("Error deleting product:", error);
  //   }
  // };

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
    }
  };

  const handleProductSelection = (productId) => {
    setSelectedProducts((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const handleShareProduct = async (productId) => {
    try {
      setIsSharing(true);
      toast.info("Generating share link...");

      const response = await addsharedcollectionAPI({
        product_ids: [productId],
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
      console.error("Error sharing product:", error);
      toast.error(
        "Error generating share link: " + (error.message || "Unknown error")
      );
    } finally {
      setIsSharing(false);
    }
  };

  const handleShareMultipleProducts = async () => {
    if (selectedProducts.length === 0) {
      toast.error("Please select at least one product to share");
      return;
    }

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
      <div className="d-flex justify-content-between mb-3">
        <div className="d-flex align-items-center position-relative w-50">
          <Form.Control
            type="text"
            placeholder="Search by Product name"
            className="w-100 pe-5"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <FaSearch className="position-absolute end-0 me-3" />
        </div>
        <Button
          variant={selectMode ? "success" : "secondary"}
          onClick={toggleSelectMode}
          className="me-2"
        >
          {selectMode ? "Cancel Selection" : "Select Products"}
        </Button>
        {selectMode && (
          <>
            <Button
              variant="info"
              onClick={handleShareMultipleProducts}
              disabled={selectedProducts.length === 0 || isSharing}
              className="me-2"
            >
              <FaLink /> Share Selected ({selectedProducts.length})
            </Button>

            <Button
              variant="danger"
              onClick={handleExportToPdf}
              disabled={selectedProducts.length === 0}
              className="me-2"
            >
              <FaFilePdf /> Export to PDF ({selectedProducts.length})
            </Button>
          </>
        )}
        <Button variant="primary" onClick={handleShowModal}>
          <FaPlus /> Add Product
        </Button>
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
                <td>{product.gst_percentage}%</td>
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
                  {/* <Button
                    variant="info"
                    className="me-2"
                    onClick={() => handleShareProduct(product.id)}
                  >
                    <FaShare />
                  </Button> */}
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
            {/* Add this after the Vendor Form.Group */}
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
        onHide={() => setShowShareLinkModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Share Products</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Share this link with others to view the selected products:</p>
          <div className="input-group mb-3">
            <Form.Control type="text" value={shareLink} readOnly />
            <Button variant="outline-secondary" onClick={copyShareLink}>
              <FaCopy /> Copy
            </Button>
          </div>
          <Button variant="primary" onClick={viewSharedProducts}>
            View Shared Products
          </Button>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowShareLinkModal(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      {/* Add this new modal for PDF export */}
      <Modal
        show={showPdfModal}
        onHide={handleClosePdfModal}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Export Products to PDF</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ExportProductsPDF
            products={productsToExport}
            vendors={vendors}
            categories={categories}
            onClose={handleClosePdfModal}
          />
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
