import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Form, Button } from "react-bootstrap";

const RaiseTicket = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, productId, productDetails } = location.state;

  const [ticketData, setTicketData] = useState({
    order_id: orderId,
    product_id: productId,
    title: "",
    description: "",
    product_quantity: "",
    attachment: null,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    for (let key in ticketData) {
      formData.append(key, ticketData[key]);
    }

    try {
      const response = await createTicketAPI(formData);
      if (response.success) {
        toast.success("Ticket raised successfully");
        navigate("/orders");
      }
    } catch (error) {
      toast.error("Failed to raise ticket");
    }
  };

  return (
    <div className="container bg-white p-4">
      <h3>Raise Ticket for Product</h3>
      <div className="product-details mb-4">
        <h5>Product Details:</h5>
        <p>Product Name: {productDetails.product.product_name}</p>
        <p>Order ID: {orderId}</p>
        <p>Original Quantity: {productDetails.quantity}</p>
      </div>

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Title</Form.Label>
          <Form.Control
            type="text"
            required
            onChange={(e) =>
              setTicketData({ ...ticketData, title: e.target.value })
            }
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            required
            onChange={(e) =>
              setTicketData({ ...ticketData, description: e.target.value })
            }
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Affected Quantity</Form.Label>
          <Form.Control
            type="number"
            required
            max={productDetails.quantity}
            onChange={(e) =>
              setTicketData({ ...ticketData, product_quantity: e.target.value })
            }
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Attachment</Form.Label>
          <Form.Control
            type="file"
            onChange={(e) =>
              setTicketData({ ...ticketData, attachment: e.target.files[0] })
            }
          />
        </Form.Group>

        <Button type="submit" variant="primary">
          Submit Ticket
        </Button>
      </Form>
    </div>
  );
};

export default RaiseTicket;
