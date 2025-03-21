import React from "react";
import { Table, Button } from "react-bootstrap";
import { FaEdit } from "react-icons/fa";

const ProductTable = ({
  currentProducts,
  currentPage,
  itemsPerPage,
  navigate,
  handleEditProduct,
}) => {
  return (
    <Table bordered hover>
      <thead>
        <tr>
          <th>Sr No.</th>
          <th>Name</th>
          <th>Category</th>
          <th>Price</th>
          <th>Stock</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {currentProducts.map((product, index) => (
          <tr
            key={product.id}
            onClick={() => navigate(`/productDetails/${product.id}`)}
          >
            <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
            <td>{product.product_name}</td>
            <td>{product.category_id}</td>
            <td>{product.product_price}</td>
            <td>{product.in_stock}</td>
            <td>
              <Button
                variant="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditProduct(product, product.id);
                }}
              >
                <FaEdit />
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default ProductTable;
