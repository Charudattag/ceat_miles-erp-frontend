import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import Select from "react-select";
import { getAllcustomerAPI, sendEmailToCustomersAPI } from "../../api/api";

const ShareWithCustomer = ({
  show,
  onHide,
  selectedProducts,
  shareLink,
  pdfUrl,
}) => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customEmail, setCustomEmail] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await getAllcustomerAPI();
      if (response.success) {
        setCustomers(response.data.customers);
      } else {
        toast.error("Failed to fetch customers");
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast.error("Error loading customers");
    }
  };

  const handleShare = async () => {
    if (!selectedCustomer && !customEmail) {
      toast.warning("Please select a customer or enter an email address");
      return;
    }

    setSending(true);
    try {
      const emailData = {
        customers: selectedCustomer
          ? [customers.find((c) => c.id === selectedCustomer.value)]
          : [{ email: customEmail }],
        subject: "Product Information Shared",
        message: `We are sharing ${selectedProducts.length} product(s) with you.`,
        shareLink,
        pdfUrl,
        productCount: selectedProducts.length,
      };

      const response = await sendEmailToCustomersAPI(emailData);

      if (response.success) {
        toast.success("Shared successfully");
        onHide();
      } else {
        toast.error(response.message || "Failed to share");
      }
    } catch (error) {
      console.error("Error sharing:", error);
      toast.error("Failed to share");
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Share Products</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-4">
            <Form.Label>Select Existing Customer</Form.Label>
            <Select
              options={customers.map((customer) => ({
                value: customer.id,
                label: `${customer.name} (${customer.email})`,
              }))}
              value={selectedCustomer}
              onChange={(selected) => {
                setSelectedCustomer(selected);
                if (selected) setCustomEmail("");
              }}
              isClearable
              placeholder="Select a customer..."
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Or Enter Email Address</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter email address"
              value={customEmail}
              onChange={(e) => {
                setCustomEmail(e.target.value);
                if (e.target.value) setSelectedCustomer(null);
              }}
            />
          </Form.Group>

          <div className="mt-4">
            <p>Selected Products: {selectedProducts.length}</p>
            {shareLink && (
              <div className="alert alert-info">
                <small>Share link will be included in the email</small>
              </div>
            )}
          </div>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleShare}
          disabled={sending || (!selectedCustomer && !customEmail)}
        >
          {sending ? "Sending..." : "Share"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ShareWithCustomer;
