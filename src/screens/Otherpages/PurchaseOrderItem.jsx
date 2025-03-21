import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getPoItemsByPoIdAPI,
  getAllproductsAPI,
  addpurchaseoreditemAPI,
  deletePurchaseordritemAPI,
  getprocuredQunatitytAPI,
  addPoInvoiceAPI,
  getpoiteminvoiceAPI,
  deleteinvoiceAPI,
  IMG_URL,
} from "../../api/api";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import PoinvoiceDetails from "./PoinvoiceDetails";

const PurchaseOrderItem = () => {
  const { id } = useParams();
  const [poItems, setPoItems] = useState([]);
  const [procurementLogs, setProcurementLogs] = useState({});
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedPoItemId, setSelectedPoItemId] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [activeTab, setActiveTab] = useState("items");

  let currentItems123;
  const [formData, setFormData] = useState({
    product_id: "",
    quantity: "",
    unit_price: "",
  });

  // Fetch PO Items
  useEffect(() => {
    const fetchPoItems = async () => {
      try {
        const response = await getPoItemsByPoIdAPI(id);
        if (response.success && response.poItemsWithDetails) {
          setPoItems(response.poItemsWithDetails);
        } else {
          setPoItems([]);
        }
      } catch (error) {
        console.log;
        setPoItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPoItems();
  }, [id]);

  useEffect(() => {
    if (poItems.length === 0) return;

    const fetchProcuredQuantities = async () => {
      try {
        const response = await getprocuredQunatitytAPI(id);
        if (response && response.procuredItems) {
          const logsByItem = response.procuredItems.reduce((acc, item) => {
            acc[item.po_items_id] = item.total_procured_quantity || 0;
            return acc;
          }, {});
          setProcurementLogs(logsByItem);
        }
      } catch (error) {
        console.error("Error fetching procured quantities:", error);
      }
    };

    fetchProcuredQuantities();
  }, [id, poItems]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getAllproductsAPI();
        if (Array.isArray(response.data)) {
          setProducts(response.data);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newPoItem = {
      po_id: id,
      product_id: formData.product_id,
      quantity: formData.quantity,
      unit_price: formData.unit_price,
    };

    try {
      const response = await addpurchaseoreditemAPI(newPoItem);
      if (response.success) {
        setPoItems([...poItems, response.data]);
        setShowModal(false);
        setFormData({ product_id: "", quantity: "", unit_price: "" });
        toast.success("Item added successfully");
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      toast.error("Failed to add item");
    }
  };

  const handleInvoiceUpload = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("po_id", id);

    for (let file of selectedFiles) {
      formData.append("po_invoice", file);
    }

    try {
      const response = await addPoInvoiceAPI(formData);

      if (response && response.success) {
        toast.success("Invoices uploaded successfully");
        setShowInvoiceModal(false);
        setSelectedFiles([]);
        setActiveTab("invoices");
      }
    } catch (error) {
      toast.error("Failed to upload invoices");
    }
  };

  const fetchInvoices = async (poItemId) => {
    try {
      const response = await getpoiteminvoiceAPI(id);
      if (response.success) {
        setInvoices(response.data);

        currentItems123 = Array.isArray(invoices)
          ? invoices.slice(indexOfFirstItem, indexOfLastItem)
          : [];
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchInvoices(id);
    }
  }, [id]);

  const handleDelete = async (poItemId) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        const response = await deletePurchaseordritemAPI(poItemId);
        if (response.success) {
          setPoItems(poItems.filter((item) => item.id !== poItemId));
          toast.success("Item deleted successfully");
        } else {
          toast.error(response.error);
        }
      } catch (error) {
        toast.error("Failed to delete item");
      }
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = Array.isArray(poItems)
    ? poItems.slice(indexOfFirstItem, indexOfLastItem)
    : [];
  const totalPages = Math.ceil(
    (Array.isArray(poItems) ? poItems.length : 0) / itemsPerPage
  );

  if (loading) return <p>Loading...</p>;

  return (
    <div className="container bg-white p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Purchase Order #{id}</h2>
        {activeTab === "items" && (
          <div className="d-flex gap-2">
            <button
              className="btn btn-sm btn-info me-2"
              onClick={() => {
                const firstPoItem = poItems[0]; // Get first PO item
                if (firstPoItem) {
                  setSelectedPoItemId(firstPoItem.id);
                  setShowInvoiceModal(true);
                  fetchInvoices(firstPoItem.id);
                } else {
                  toast.warning("Please add a purchase order item first");
                }
              }}
            >
              Add Invoices
            </button>
            <button
              className="btn btn-success"
              onClick={() => setShowModal(true)}
            >
              Add Item
            </button>
          </div>
        )}
      </div>

      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "items" ? "active" : ""}`}
            onClick={() => setActiveTab("items")}
          >
            Items
          </button>
        </li>
        <li className="nav-item">
          {/* {selectedPoItemId} */}
          <button
            className={`nav-link ${activeTab === "invoices" ? "active" : ""}`}
            onClick={() => setActiveTab("invoices")}
          >
            Invoices
          </button>
        </li>
      </ul>

      {activeTab === "invoices" && (
        <div className="table-responsive">
          <PoinvoiceDetails id={id} />
        </div>
      )}

      {activeTab === "items" && (
        <div className="table-responsive">
          <table className="table table-bordered mt-3">
            <thead>
              <tr>
                <th>ID</th>
                <th>Product Name</th>
                <th>Quantity</th>
                <th>Procured Quantity</th>
                <th>Remaining Quantity</th>
                <th>Unit Price</th>
                <th>Total Value</th>
                <th>Status</th>
                <th>Date</th>
                {/* <th>Invoice</th> */}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((poItem) => {
                const procuredQuantity = procurementLogs[poItem.id] || 0;
                const remainingQuantity = poItem.quantity - procuredQuantity;

                const status =
                  remainingQuantity === 0
                    ? "PROCURRED"
                    : procuredQuantity > 0
                    ? "PARTIALLY_PROCURRED"
                    : "NOT_PROCURRED";

                return (
                  <tr key={poItem.id}>
                    <td>{poItem.id}</td>
                    <td>{poItem.product_details?.product_name || "N/A"}</td>
                    <td>{poItem.quantity}</td>
                    <td>{procuredQuantity}</td>
                    <td>{remainingQuantity}</td>
                    <td>{poItem.unit_price}</td>
                    <td>{(poItem.quantity * poItem.unit_price).toFixed(2)}</td>
                    <td>
                      <span
                        className={`badge ${
                          status === "PROCURRED"
                            ? "bg-success"
                            : status === "PARTIALLY_PROCURRED"
                            ? "bg-warning"
                            : "bg-secondary"
                        }`}
                      >
                        {status}
                      </span>
                    </td>
                    <td>{new Date(poItem.created_at).toLocaleString()}</td>
                    {/* <td>
                      <Link to={`/poInvoice/${poItem.id}`}>
                        <button className="btn btn-sm btn-warning me-2">
                          View Invoices
                        </button>
                      </Link>
                    </td> */}
                    <td className="d-flex gap-2">
                      <Link to={`/purchaseOrderItemLogs/${poItem.id}`}>
                        <button className="btn btn-sm btn-primary">Logs</button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <nav aria-label="Page navigation" className="mt-4">
        <ul className="pagination justify-content-center">
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button
              className="page-link"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
          </li>
          {[...Array(totalPages)].map((_, index) => (
            <li
              key={index}
              className={`page-item ${
                currentPage === index + 1 ? "active" : ""
              }`}
            >
              <button
                className="page-link"
                onClick={() => handlePageChange(index + 1)}
              >
                {index + 1}
              </button>
            </li>
          ))}
          <li
            className={`page-item ${
              currentPage === totalPages ? "disabled" : ""
            }`}
          >
            <button
              className="page-link"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </li>
        </ul>
      </nav>

      {showModal && (
        <div
          className="modal d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Purchase Order Item</h5>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmit}>
                  <div className="form-group mb-3">
                    <label>Product</label>
                    <Select
                      options={products.map((product) => ({
                        value: product.id,
                        label: product.product_name,
                      }))}
                      value={
                        products
                          .map((product) => ({
                            value: product.product_id,
                            label: product.product_name,
                          }))
                          .find(
                            (option) => option.value === formData.product_id
                          ) || null
                      }
                      onChange={(selectedOption) =>
                        setFormData({
                          ...formData,
                          product_id: selectedOption.value,
                        })
                      }
                      placeholder="Select Product"
                      isSearchable
                    />
                  </div>
                  <div className="form-group mb-3">
                    <label>Quantity</label>
                    <input
                      type="number"
                      className="form-control"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      min="1"
                      required
                    />
                  </div>
                  <div className="form-group mb-3">
                    <label>Unit Price</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      name="unit_price"
                      value={formData.unit_price}
                      onChange={handleChange}
                      min="0.01"
                      required
                    />
                  </div>
                  <div className="d-flex justify-content-end gap-2">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowModal(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Add Item
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {showInvoiceModal && (
        <div
          className="modal d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Upload Invoices</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowInvoiceModal(false);
                    setSelectedFiles([]);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleInvoiceUpload}>
                  <div className="mb-3">
                    <label className="form-label">Upload Invoices</label>
                    <input
                      type="file"
                      className="form-control"
                      multiple
                      onChange={(e) =>
                        setSelectedFiles(Array.from(e.target.files))
                      }
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                  </div>
                  <div className="d-flex justify-content-end gap-2">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setShowInvoiceModal(false);
                        setSelectedFiles([]);
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={selectedFiles.length === 0}
                    >
                      Upload
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default PurchaseOrderItem;
