import React from "react";
import { Form, Button } from "react-bootstrap";

const SearchBar = ({
  searchTerm,
  setSearchTerm,
  showMinStock,
  handleMinStockToggle,
  handleShowModal,
}) => {
  return (
    <div className="d-flex align-items-center gap-2 mb-3">
      <Form.Control
        type="text"
        placeholder="Search by product name"
        className="d-flex"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <Button
        variant="danger"
        style={{ width: "300px" }}
        onClick={handleMinStockToggle}
      >
        {showMinStock ? "Show All Products" : "Minimum Stock Products"}
      </Button>
      <Button
        variant="primary"
        style={{ width: "180px" }}
        onClick={handleShowModal}
      >
        Add Product
      </Button>
    </div>
  );
};

export default SearchBar;
