import React, { useState, useEffect, useMemo } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import Select from "react-select";
import { FaFilter } from "react-icons/fa";
import { toast } from "react-toastify";
import "./ProductFilter.css";

const ProductFilter = ({
  products,
  categories,
  onApplyFilters,
  isFiltered,
  filteredCount,
  className = "",
}) => {
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    category_id: "",
    minPrice: "",
    maxPrice: "",
    tags: [],
  });

  // Extract all unique tags from products for the filter dropdown
  const allTags = useMemo(() => {
    const tagSet = new Set();
    products.forEach((product) => {
      if (product.tags && Array.isArray(product.tags)) {
        product.tags.forEach((tag) => tagSet.add(tag));
      }
    });
    return Array.from(tagSet).map((tag) => ({ value: tag, label: tag }));
  }, [products]);

  // Handle filter input changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Handle tag selection in filter
  const handleTagSelection = (selectedOptions) => {
    setFilters((prev) => ({
      ...prev,
      tags: selectedOptions
        ? selectedOptions.map((option) => option.value)
        : [],
    }));
  };

  // Apply filters
  const applyFilters = () => {
    let filtered = [...products];

    // Filter by category
    if (filters.category_id) {
      filtered = filtered.filter(
        (product) =>
          product.category_id === parseInt(filters.category_id) ||
          product.category_id === filters.category_id
      );
    }

    // Filter by price range
    if (filters.minPrice) {
      filtered = filtered.filter(
        (product) => parseFloat(product.price) >= parseFloat(filters.minPrice)
      );
    }

    if (filters.maxPrice) {
      filtered = filtered.filter(
        (product) => parseFloat(product.price) <= parseFloat(filters.maxPrice)
      );
    }

    // Filter by tags
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter((product) => {
        if (!product.tags || !Array.isArray(product.tags)) return false;
        return filters.tags.some((tag) => product.tags.includes(tag));
      });
    }

    onApplyFilters(filtered, filters);
    setShowFilterModal(false);

    if (filtered.length === 0) {
      toast.info("No products match your filter criteria");
    } else {
      toast.success(`Found ${filtered.length} products matching your criteria`);
    }
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      category_id: "",
      minPrice: "",
      maxPrice: "",
      tags: [],
    });
    onApplyFilters([], null);
    setShowFilterModal(false);
    toast.info("Filters have been reset");
  };

  return (
    <>
      <Button
        variant={isFiltered ? "info" : "outline-info"}
        onClick={() => setShowFilterModal(true)}
        className={className}
      >
        <FaFilter className="me-1" />
        {isFiltered ? `Filtered (${filteredCount})` : "Filter"}
      </Button>

      {/* Filter Modal */}
      <Modal
        show={showFilterModal}
        onHide={() => setShowFilterModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Filter Products</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Select
                name="category_id"
                value={filters.category_id}
                onChange={handleFilterChange}
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.category_name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Min Price</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Min"
                    name="minPrice"
                    value={filters.minPrice}
                    onChange={handleFilterChange}
                    min="0"
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Max Price</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Max"
                    name="maxPrice"
                    value={filters.maxPrice}
                    onChange={handleFilterChange}
                    min="0"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Tags</Form.Label>
              <Select
                isMulti
                options={allTags}
                onChange={handleTagSelection}
                value={allTags.filter((tag) =>
                  filters.tags.includes(tag.value)
                )}
                placeholder="Select tags..."
                className="basic-multi-select"
                classNamePrefix="select"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={resetFilters}>
            Reset Filters
          </Button>
          <Button variant="primary" onClick={applyFilters}>
            Apply Filters
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ProductFilter;
