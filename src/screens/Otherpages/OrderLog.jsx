import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { addpurchaseorderLogAPI, getpurchaseorderLogAPI } from "../../api/api";
import { Modal, Button, Form } from "react-bootstrap";
import { FaPlus } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";

const OrderLog = () => {
  const { id: po_items_id } = useParams();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    quantity_procurred: "",
    procurement_price: "",
  });

  const fetchLogs = async () => {
    try {
      const response = await getpurchaseorderLogAPI(po_items_id);

      setLogs(response.data || []);
    } catch (error) {
      console.error("Error fetching logs:", error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (po_items_id) {
      fetchLogs();
    }
  }, [po_items_id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        po_items_id,
        quantity_procurred: Number(formData.quantity_procurred),
        procurement_price: Number(formData.procurement_price),
      };

      const response = await addpurchaseorderLogAPI(payload);

      if (response) {
        setFormData({ quantity_procurred: "", procurement_price: "" });
        setShowModal(false);
        await fetchLogs();
        toast.success("Log added successfully!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (error) {
      console.error("Error adding log:", error);
      toast.error("Failed to add log. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };
  const resetFormAndCloseModal = () => {
    setFormData({ quantity_procurred: "", procurement_price: "" });
    setShowModal(false);
  };

  return (
    <div className="container bg-white p-4">
      <div className="d-flex justify-content-between align-items-center">
        {/* <Link
          to={`/purchaseOrderItem/${po_items_id}`}
          style={{ textDecoration: "none" }}
          className="text-black"
        >
          Back
        </Link> */}
        <h1>Order Logs</h1>
        <Button onClick={() => setShowModal(true)} className="btn btn-success">
          <FaPlus /> Add Log
        </Button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : logs.length === 0 ? (
        <p>No logs found.</p>
      ) : (
        <table className="table table-bordered mt-3">
          <thead>
            <tr>
              <th>ID</th>
              <th>Quantity Procured</th>
              <th>Procurement Price</th>
              <th>Created At</th>
              <th>Updated At</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td>{log.id}</td>
                <td>{log.quantity_procurred}</td>
                <td>{log.procurement_price?.toFixed(2)}</td>
                <td>{new Date(log.created_at).toLocaleString()}</td>
                <td>{new Date(log.updated_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Modal show={showModal} onHide={resetFormAndCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add Log</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Quantity Procured</Form.Label>
              <Form.Control
                type="number"
                name="quantity_procurred"
                value={formData.quantity_procurred}
                onChange={handleChange}
                min="1"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Procurement Price</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                name="procurement_price"
                value={formData.procurement_price}
                onChange={handleChange}
                min="0.01"
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              Add Log
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
      <ToastContainer />
    </div>
  );
};

export default OrderLog;
