import React from "react";
import { Modal, Form, Button, Row, Col } from "react-bootstrap";

const ProductFormModal = ({
  showModal,
  handleCloseModal,
  isEdit,
  productData,
  handleInputChange,
  handleAddOrUpdateProduct,
  loading,
}) => {
  return (
    <Modal show={showModal} onHide={handleCloseModal} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{isEdit ? "Edit Product" : "Add Product"}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form onSubmit={handleAddOrUpdateProduct}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Product Name</Form.Label>
                <Form.Control
                  type="text"
                  name="product_name"
                  value={productData.product_name}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Short Description</Form.Label>
                <Form.Control
                  type="text"
                  name="short_description"
                  value={productData.short_description}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>Product Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="product_description"
                  value={productData.product_description}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Product Image 1</Form.Label>
                <Form.Control
                  type="file"
                  name="product_image1"
                  onChange={handleInputChange}
                  accept="image/*"
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Product Image 2</Form.Label>
                <Form.Control
                  type="file"
                  name="product_image2"
                  onChange={handleInputChange}
                  accept="image/*"
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Product Image 3</Form.Label>
                <Form.Control
                  type="file"
                  name="product_image3"
                  onChange={handleInputChange}
                  accept="image/*"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Deal Price</Form.Label>
                <Form.Control
                  type="number"
                  name="deal_price"
                  value={productData.deal_price}
                  onChange={handleInputChange}
                  required
                  min={0}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Priority</Form.Label>
                <Form.Control
                  type="number"
                  name="priority"
                  value={productData.priority}
                  onChange={handleInputChange}
                  required
                  min={0}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Category ID</Form.Label>
                <Form.Control
                  type="text"
                  name="category_id"
                  value={productData.category_id}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Brand ID</Form.Label>
                <Form.Control
                  type="text"
                  name="brand_id"
                  value={productData.brand_id}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>MOQ</Form.Label>
                <Form.Control
                  type="number"
                  name="moq"
                  value={productData.moq}
                  onChange={handleInputChange}
                  required
                  min={0}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Minimum Stocks</Form.Label>
                <Form.Control
                  type="number"
                  name="min_stock"
                  value={productData.min_stock}
                  onChange={handleInputChange}
                  required
                  min={0}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>In Stock</Form.Label>
                <Form.Control
                  type="number"
                  name="in_stock"
                  value={productData.in_stock}
                  onChange={handleInputChange}
                  required
                  min={0}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Product Price</Form.Label>
                <Form.Control
                  type="number"
                  name="product_price"
                  value={productData.product_price}
                  onChange={handleInputChange}
                  required
                  min={0}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Size</Form.Label>
                <Form.Control
                  type="text"
                  name="size"
                  value={productData.size}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <div className="text-center mt-4">
            <Button
              variant="secondary"
              onClick={handleCloseModal}
              className="me-2"
              disabled={loading}
            >
              Cancel
            </Button>
            &nbsp; &nbsp;
            <Button variant="primary" type="submit" disabled={loading}>
              {loading
                ? "Processing..."
                : isEdit
                ? "Update Product"
                : "Add Product"}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ProductFormModal;
