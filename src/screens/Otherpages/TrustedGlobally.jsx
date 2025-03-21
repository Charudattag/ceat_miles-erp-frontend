import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button } from 'react-bootstrap';
import { FaPlus } from "react-icons/fa";
import { RiDeleteBin4Fill } from "react-icons/ri";
import { AiTwotoneEdit } from "react-icons/ai";

function TrustedGlobally() {
  const [clients, setClients] = useState([
    { name: 'Client A', image: 'src/assets/content-strategy.jpg', isActive: true },
    { name: 'Client B', image: 'src/assets/marketing-maverick.jpg', isActive: false },
    { name: 'Client C', image: 'src/assets/pexels-christian-heitz-285904-842711.jpg', isActive: true },
    { name: 'Client D', image: 'src/assets/social-media-marketing.jpg', isActive: false },
    // Add more clients to simulate pagination
    { name: 'Client E', image: 'src/assets/content-strategy.jpg', isActive: true },
    { name: 'Client F', image: 'src/assets/marketing-maverick.jpg', isActive: false },
    { name: 'Client G', image: 'src/assets/pexels-christian-heitz-285904-842711.jpg', isActive: true },
    { name: 'Client H', image: 'src/assets/marketing-maverick.jpg', isActive: false },
    { name: 'Client I', image: 'src/assets/marketing-maverick.jpg', isActive: true },
    { name: 'Client J', image: 'src/assets/marketing-maverick.jpg', isActive: false },
    { name: 'Client K', image: 'src/assets/pexels-christian-heitz-285904-842711.jpg', isActive: true },
    { name: 'Client L', image: 'src/assets/social-media-marketing.jpg', isActive: false },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', image: '', isActive: true });
  const [imageFile, setImageFile] = useState(null); // State to hold the image file
  const [currentPage, setCurrentPage] = useState(1); // Current page
  const itemsPerPage = 10; // Limit of 10 items per page
  const [isEditMode, setIsEditMode] = useState(false); // To track whether we're adding or updating
  const [clientIndexToUpdate, setClientIndexToUpdate] = useState(null); // Track the index of the client being updated

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewClient({ ...newClient, [name]: value });
  };

  // Handle file changes
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
  };

  // Handle form submission for adding/updating
  const handleSubmit = () => {
    if (imageFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isEditMode) {
          // Update the existing client data
          const updatedClients = [...clients];
          updatedClients[clientIndexToUpdate] = { ...newClient, image: reader.result };
          setClients(updatedClients);
        } else {
          // Add new client data
          setClients([...clients, { ...newClient, image: reader.result }]);
        }
        setNewClient({ name: '', image: '', isActive: true });
        setImageFile(null);
        setShowModal(false);
        setIsEditMode(false); // Reset to add mode
        setClientIndexToUpdate(null); // Reset the index
      };
      reader.readAsDataURL(imageFile); // Read the image file as data URL
    } else {
      if (isEditMode) {
        const updatedClients = [...clients];
        updatedClients[clientIndexToUpdate] = { ...newClient };
        setClients(updatedClients);
      }
      setNewClient({ name: '', image: '', isActive: true });
      setShowModal(false);
      setIsEditMode(false);
      setClientIndexToUpdate(null);
    }
  };

  // Handle delete action
  const handleDelete = (index) => {
    const updatedClients = clients.filter((_, i) => i !== index);
    setClients(updatedClients);
  };

  // Handle the update action - open the modal with pre-filled data
  const handleUpdate = (index) => {
    setIsEditMode(true);
    setClientIndexToUpdate(index);
    setNewClient(clients[index]); // Prefill the modal with the selected client data
    setShowModal(true);
  };

  // Pagination logic
  const totalPages = Math.ceil(clients.length / itemsPerPage);
  const currentClients = clients.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Navigate to the next page
  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // Navigate to the previous page
  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="container  bg-white">
      <h2 className="text-left mb-4">Trusted Clients</h2>
      <Button variant="primary" onClick={() => { setShowModal(true); setIsEditMode(false); }} className="mb-3 d-flex gap-2" style={{alignItems:'center',justifyContent:'center'}}>
        <FaPlus />
        Add Client
      </Button>
      
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Client Name</th>
            <th>Client Logo</th>
            <th>Activity Status</th>
            <th>Modify</th> {/* Combined Update and Delete buttons here */}
          </tr>
        </thead>
        <tbody>
          {currentClients.map((client, index) => (
            <tr key={index}>
              <td>{client.name}</td>
              <td>
                <img src={client.image} alt={client.name} className="img-fluid" style={{maxWidth:200}} />
              </td>
              <td>
                <div style={{backgroundColor: !client.isActive ? 'red' : 'green', width: 'fit-content', padding: 4, borderRadius: 8, color: '#fff'}}>
                  {client.isActive ? 'Active' : 'Inactive'}
                </div>
              </td>
              <td> {/* Modify column with Update and Delete buttons */}
                <div className="d-flex gap-2">
                  <Button variant="warning" onClick={() => handleUpdate((currentPage - 1) * itemsPerPage + index)} className="d-flex gap-2" style={{alignItems: 'center', justifyContent: 'center',color:'#fff'}}>
                 <AiTwotoneEdit/>
                  </Button>
                  <Button variant="danger" onClick={() => handleDelete((currentPage - 1) * itemsPerPage + index)} className="d-flex gap-2" style={{alignItems: 'center', justifyContent: 'center'}}>
                    <RiDeleteBin4Fill />
                    
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="d-flex justify-content-between align-items-center">
        <div className='d-flex gap-2'>
        <Button variant="secondary" onClick={goToPreviousPage} disabled={currentPage === 1}>
          Previous
        </Button>
        <Button variant="secondary" onClick={goToNextPage} disabled={currentPage === totalPages}>
          Next
        </Button>
        </div>

        <span>Page {currentPage} of {totalPages}</span>
      </div>

      {/* Modal for Adding/Updating Client */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{isEditMode ? 'Update Client' : 'Add New Client'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <label htmlFor="clientName" className="form-label">Client Name</label>
            <input
              type="text"
              className="form-control"
              id="clientName"
              name="name"
              value={newClient.name}
              onChange={handleInputChange}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="clientImage" className="form-label">Client Logo</label>
            <input
              type="file"
              className="form-control"
              id="clientImage"
              accept="image/*"
              onChange={handleFileChange} // Handle file input change
            />
          </div>
          <div className="mb-3">
            <label htmlFor="activityStatus" className="form-label">Activity Status</label>
            <select
              className="form-control"
              id="activityStatus"
              name="isActive"
              value={newClient.isActive}
              onChange={handleInputChange}
            >
              <option value={true}>Active</option>
              <option value={false}>Inactive</option>
            </select>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {isEditMode ? 'Update Client' : 'Add Client'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default TrustedGlobally;
