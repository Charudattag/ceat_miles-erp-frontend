import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getpoiteminvoiceAPI, deleteinvoiceAPI, IMG_URL } from "../../api/api";
import { toast, ToastContainer } from "react-toastify";
import { FaTrash } from "react-icons/fa";
import { Modal, Button } from "react-bootstrap";

const PoinvoiceDetails = (id) => {
  // const { id } = useParams();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        let response;
        if (id) {
          response = await getpoiteminvoiceAPI(id);

          console.log(response);
        } else {
          const pay = {
            id: 6,
          };
          response = await getpoiteminvoiceAPI(pay);
        }
        if (response.success) {
          setInvoices(response.data.invoices.rows || []);
        } else {
          toast.error("No invoices found");
        }
      } catch (error) {
        console.log("Failed to fetch invoices");
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [id]);

  const handleShowDeleteModal = (id) => {
    setSelectedInvoiceId(id);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedInvoiceId(null);
  };

  const handleDelete = async () => {
    try {
      const response = await deleteinvoiceAPI(selectedInvoiceId);
      if (response.success) {
        setInvoices((prevInvoices) =>
          prevInvoices.filter((invoice) => invoice.id !== selectedInvoiceId)
        );
        toast.success("Invoice deleted successfully");
        handleCloseDeleteModal();
      } else {
        toast.error("Failed to delete invoice");
      }
    } catch (error) {
      toast.error("Error deleting invoice");
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = Array.isArray(invoices)
    ? invoices.slice(indexOfFirstItem, indexOfLastItem)
    : [];
  const totalPages = Math.ceil(
    (Array.isArray(invoices) ? invoices.length : 0) / itemsPerPage
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container bg-white p-4">
      {/* <h4>
        <Link
          to={`/purchaseOrderItem/${id}`}
          className="text-black"
          style={{ textDecoration: "none" }}
        >
          Back
        </Link>
      </h4> */}

      <h2 className="mb-4">Purchase Order Item Invoices</h2>

      <div className="table-responsive">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Invoice ID</th>

              <th>Invoice Image</th>
              <th>Upload Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((invoice) => (
              <tr key={invoice.id}>
                <td>{invoice.id}</td>

                <td>
                  {invoice.attachments.toLowerCase().endsWith(".pdf") ? (
                    <a
                      href={`${IMG_URL}/${invoice.attachments}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary btn-sm"
                    >
                      View PDF
                    </a>
                  ) : (
                    <img
                      src={`${IMG_URL}/uploads/${invoice.attachments}`}
                      alt={`Invoice ${invoice.id}`}
                      style={{ maxWidth: "100px", cursor: "pointer" }}
                      onClick={() =>
                        window.open(
                          `${IMG_URL}/${invoice.attachments}`,
                          "_blank"
                        )
                      }
                    />
                  )}
                </td>
                <td>
                  {new Date(invoice.created_at)
                    .toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })
                    .replace(/\//g, "-")}
                </td>

                <td>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleShowDeleteModal(invoice.id)}
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* <nav aria-label="Page navigation" className="mt-4">
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
      </nav> */}

      {currentItems.length === 0 && (
        <div className="alert alert-info">
          No invoices found for this purchase order item.
        </div>
      )}

      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Invoice</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this invoice?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteModal}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer />
    </div>
  );
};

export default PoinvoiceDetails;
