import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button, Table } from 'react-bootstrap';
import { FaPlus } from 'react-icons/fa';
import { RiDeleteBin4Fill, RiEdit2Fill } from 'react-icons/ri';

function YearMaster() {
  const [years, setYears] = useState([
    { title: '2020', isActive: true },
    { title: '2021', isActive: false },
    { title: '2022', isActive: false },
    { title: '2023', isActive: false },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [newYear, setNewYear] = useState({ title: '', isActive: false });
  const [selectedYearIndex, setSelectedYearIndex] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setNewYear({ ...newYear, [name]: val });
  };

  const handleAddOrUpdateYear = () => {
    if (selectedYearIndex !== null) {
      // Update existing year
      const updatedYears = years.map((year, index) =>
        index === selectedYearIndex ? newYear : year
      );
      setYears(updatedYears);
    } else {
      // Add new year
      setYears([...years, newYear]);
    }
    resetForm();
  };

  const resetForm = () => {
    setNewYear({ title: '', isActive: false });
    setSelectedYearIndex(null);
    setShowModal(false);
  };

  const handleEditYear = (index) => {
    setNewYear(years[index]);
    setSelectedYearIndex(index);
    setShowModal(true);
  };

  const handleDeleteYear = (index) => {
    setYears(years.filter((_, i) => i !== index));
  };

  return (
    <div className="container bg-white">
      <h2 className="text-left mb-4">Year Master</h2>

      <Button
        variant="primary"
        onClick={() => {
          resetForm();
          setShowModal(true);
        }}
        className="mb-3 d-flex gap-2"
        style={{ alignItems: 'center', justifyContent: 'center' }}
      >
        <FaPlus />
        Add Year
      </Button>

      <Table bordered>
        <thead>
          <tr>
            <th>Title</th>
            <th>Is Active</th>
            <th>Modify</th>
          </tr>
        </thead>
        <tbody>
          {years.map((year, index) => (
            <tr key={index}>
              <td>{year.title}</td>
              <td>{year.isActive ? 'Yes' : 'No'}</td>
              <td>
                <div className="d-flex gap-1">
                  <Button
                    variant="warning"
                    onClick={() => handleEditYear(index)}
                    style={{ color: '#fff' }}
                  >
                    <RiEdit2Fill />
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleDeleteYear(index)}
                  >
                    <RiDeleteBin4Fill />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal for Add/Update Year */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{selectedYearIndex !== null ? 'Update Year' : 'Add New Year'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <label htmlFor="title" className="form-label">Title</label>
            <input
              type="text"
              className="form-control"
              id="title"
              name="title"
              value={newYear.title}
              onChange={handleInputChange}
            />
          </div>
          <div className="mb-3 d-flex gap-2">
            <input
              type="checkbox"
              className="form-check-input"
              id="isActive"
              name="isActive"
              checked={newYear.isActive}
              onChange={handleInputChange}
            />
            <label className="form-check-label" htmlFor="isActive"> Active</label>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleAddOrUpdateYear}>
            {selectedYearIndex !== null ? 'Update Year' : 'Add Year'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default YearMaster;
