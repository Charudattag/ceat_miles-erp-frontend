import React, { useState, useEffect } from "react";
import { getAllratehistoryAPI } from "../../../src/api/api";
import { Table, Pagination, Dropdown, Row, Col } from "react-bootstrap";

const Ratehistory = () => {
  const [rateHistory, setRateHistory] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fetchRateHistory = async () => {
    try {
      const rateHistoryData = await getAllratehistoryAPI({});
      setRateHistory(rateHistoryData?.data || []);
    } catch (error) {
      console.error("Error fetching rate history:", error);
    }
  };

  useEffect(() => {
    fetchRateHistory();
  }, []);

  const totalItems = rateHistory.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const currentPageClamped = Math.min(Math.max(currentPage, 1), totalPages);

  const indexOfLastItem = currentPageClamped * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = rateHistory.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleItemsPerPageChange = (items) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  return (
    <div className="bg-white container">
      <div className="container">
        <h1>Rate History</h1>

        <Table striped bordered hover className="mt-5">
          <thead>
            <tr>
              <th>Sr No.</th>
              <th>Gold</th>
              <th>Silver</th>
              <th>Effective Date</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1 + indexOfFirstItem}</td>
                  <td>{item.Gold}</td>
                  <td>{item.Silver}</td>
                  <td>{item.rateDate}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center">
                  No rate history available
                </td>
              </tr>
            )}
          </tbody>
        </Table>

        <div className="d-flex justify-content-between align-items-center mt-3 mb-4">
  <div>
    Showing {currentItems.length} of {totalItems} entries
  </div>
  <ul className="pagination">
    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
      <button 
        className="page-link" 
        onClick={() => handlePageChange(currentPage - 1)}
      >
        Previous
      </button>
    </li>
    {[...Array(totalPages)].map((_, index) => (
      <li 
        key={index + 1} 
        className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}
      >
        <button 
          className="page-link" 
          onClick={() => handlePageChange(index + 1)}
        >
          {index + 1}
        </button>
      </li>
    ))}
    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
      <button 
        className="page-link" 
        onClick={() => handlePageChange(currentPage + 1)}
      >
        Next
      </button>
    </li>
  </ul>
</div>

      </div>
    </div>
  );
};

export default Ratehistory;
