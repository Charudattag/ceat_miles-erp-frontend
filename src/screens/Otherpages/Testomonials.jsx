// import React, { useState, useRef } from "react";
// import "bootstrap/dist/css/bootstrap.min.css";
// import { Modal, Button, Table } from "react-bootstrap";
// import { FaPlus } from "react-icons/fa";
// import { RiDeleteBin4Fill, RiEdit2Fill } from "react-icons/ri";
// import Footer from "./Footer";
// import {IMG_URL} from '../../api/api'

// function Testimonials() {
//   const [projects, setProjects] = useState([
//     {
//       name: " Testimonial 1",
//       image: "src/assets/testimonial_poorva.png",
//       description: "A testimonialstatement  ",
//       images: [{ file: null, url: "src/assets/testimonial_poorva.png" }],
//     },
//     {
//       name: "Testimonial 2",
//       image: "src/assets/testimonial_milind.png",
//       description: "A testimonial statement ",

//       images: [{ file: null, url: "src/assets/testimonial_milind.png" }],
//     },
//   ]);

//   const [showModal, setShowModal] = useState(false);
//   const [showImageModal, setShowImageModal] = useState(false);
//   const [newProject, setNewProject] = useState({
//     name: "",
//     image: "",

//     description: "",
//     images: [],
//   });
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 10;
//   const [selectedProjectIndex, setSelectedProjectIndex] = useState(null);
//   const fileInputRefs = useRef([]);

//   // Pagination logic
//   const totalPages = Math.ceil(projects.length / itemsPerPage);
//   const currentProjects = projects.slice(
//     (currentPage - 1) * itemsPerPage,
//     currentPage * itemsPerPage
//   );

//   // Handlers for project modal
//   const handleProjectInputChange = (e) => {
//     const { name, value } = e.target;
//     setNewProject({ ...newProject, [name]: value });
//   };

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     const reader = new FileReader();
//     reader.onloadend = () => {
//       setNewProject({ ...newProject, image: reader.result });
//     };
//     reader.readAsDataURL(file);
//   };
//   const handleAddOrUpdateProject = () => {
//     if (selectedProjectIndex !== null) {
//       const updatedProjects = projects.map((proj, index) =>
//         index === selectedProjectIndex ? newProject : proj
//       );
//       setProjects(updatedProjects);
//     } else {
//       setProjects([...projects, newProject]);
//     }
//     setNewProject({
//       name: "",
//       image: "",

//       description: "",
//       images: [],
//     });
//     setSelectedProjectIndex(null);
//     setShowModal(false);
//   };

//   const handleEditProject = (index) => {
//     setNewProject(projects[index]);
//     setSelectedProjectIndex(index);
//     setShowModal(true);
//   };

//   const handleDeleteProject = (index) => {
//     setProjects(projects.filter((_, i) => i !== index));
//   };

//   // Handlers for image modal
//   const handleFileInputTrigger = (imageIndex) => {
//     if (fileInputRefs.current[imageIndex]) {
//       fileInputRefs.current[imageIndex].click();
//     }
//   };

//   const handleImageUpdate = (imageIndex, event) => {
//     const file = event.target.files[0];
//     const updatedImage = { file: file, url: URL.createObjectURL(file) };

//     const updatedProjects = projects.map((proj, index) =>
//       index === selectedProjectIndex
//         ? {
//             ...proj,
//             images: proj.images.map((img, i) =>
//               i === imageIndex ? updatedImage : img
//             ),
//           }
//         : proj
//     );
//     setProjects(updatedProjects);
//   };

//   const handleDeleteImage = (imageIndex) => {
//     const updatedProjects = projects.map((proj, index) =>
//       index === selectedProjectIndex
//         ? { ...proj, images: proj.images.filter((_, i) => i !== imageIndex) }
//         : proj
//     );
//     setProjects(updatedProjects);
//   };

//   const handleAddImage = (e) => {
//     const file = e.target.files[0];
//     const newImage = { file: file, url: URL.createObjectURL(file) };

//     const updatedProjects = projects.map((proj, index) =>
//       index === selectedProjectIndex
//         ? { ...proj, images: [...proj.images, newImage] }
//         : proj
//     );
//     setProjects(updatedProjects);
//   };

//   return (
//     <div className="container bg-white">
//       <h2 className="text-left mb-4">Testimonials Management</h2>
//       <Button
//         variant="primary"
//         onClick={() => {
//           setShowModal(true);
//           setSelectedProjectIndex(null);
//         }}
//         className="mb-3 d-flex gap-2"
//         style={{ marginLeft: "85%" }}
//       >
//         <FaPlus />
//         Add Testimonial
//       </Button>

//       <Table bordered>
//         <thead>
//           <tr>
//             <th>Name</th>
//             <th>image</th>
//             <th>description</th>
//             <th>Modify</th>
//           </tr>
//         </thead>
//         <tbody>
//           {currentProjects.map((project, index) => (
//             <tr key={index}>
//               <td>{project.name}</td>
//               <td>
//                 <img
//                   src={project.image}
//                   alt={project.title}
//                   className="img-fluid"
//                   style={{ maxWidth: 100 }}
//                 />
//               </td>

//               <td>{project.description}</td>
            
//               <td>
//                 <div className="d-flex">
//                   <Button
//                     variant="warning"
//                     onClick={() => handleEditProject(index)}
//                     className="me-2"
//                     style={{ color: "#fff" }}
//                   >
//                     <RiEdit2Fill />
//                   </Button>
//                   &nbsp;
//                   &nbsp;
//                   <Button
//                     variant="danger"
//                     onClick={() => handleDeleteProject(index)}
//                   >

//                     <RiDeleteBin4Fill />
//                   </Button>
//                 </div>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </Table>

//       {/* Pagination Controls */}
//       <div className="d-flex justify-content-between align-items-center">
//         <div className="d-flex gap-2">
//           <Button
//             variant="secondary"
//             onClick={() => setCurrentPage(currentPage - 1)}
//             disabled={currentPage === 1}
//           >
//             Previous
//           </Button>
//           &nbsp;
//           &nbsp;
//           <Button
//             variant="secondary"
//             onClick={() => setCurrentPage(currentPage + 1)}
//             disabled={currentPage === totalPages}
//           >
//             Next
//           </Button>
//         </div>
//         <span>
//           Page {currentPage} of {totalPages}
//         </span>
//       </div>

//       {/* Project Modal */}
//       <Modal show={showModal} onHide={() => setShowModal(false)}>
//         <Modal.Header closeButton>
//           <Modal.Title>
//             {selectedProjectIndex !== null
//               ? "Update Project"
//               : "Add New Project"}
//           </Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <div className="mb-3">
//             <label htmlFor="title" className="form-label">
//               Name
//             </label>
//             <input
//               type="text"
//               className="form-control"
//               id="name"
//               name="name"
//               value={newProject.title}
//               onChange={handleProjectInputChange}
//             />
//           </div>
//           <div className="mb-3">
//             <label htmlFor="image" className="form-label">
//               image
//             </label>
//             <input
//               type="file"
//               className="form-control"
//               id="image"
//               accept="image/*"
//               onChange={handleFileChange}
//             />
//           </div>

//           <div className="mb-3">
//             <label htmlFor="link" className="form-label">
//               description
//             </label>
//             <textarea
//               className="form-control"
//               id="description"
//               name="description"
//               rows="3"
//               value={newProject.description}
//               onChange={handleProjectInputChange}
//             ></textarea>
//           </div>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowModal(false)}>
//             Close
//           </Button>
//           <Button variant="primary" onClick={handleAddOrUpdateProject}>
//             {selectedProjectIndex !== null ? "Update" : "Add"} Testimonial
//           </Button>
//         </Modal.Footer>
//       </Modal>

//       {/* Image Modal */}
//       <Modal show={showImageModal} onHide={() => setShowImageModal(false)}>
//         <Modal.Header closeButton>
//           <Modal.Title>Manage Images</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Table bordered>
//             <thead>
//               <tr>
//                 <th>Image</th>
//                 <th>Update</th>
//                 <th>Delete</th>
//               </tr>
//             </thead>
//             <tbody>
//               {projects[selectedProjectIndex]?.images.map(
//                 (image, imageIndex) => (
//                   <tr key={imageIndex}>
//                     <td>
//                       <img
//                         src={image.url}
//                         alt={`Project Image ${imageIndex + 1}`}
//                         className="img-fluid"
//                         style={{ maxWidth: 100 }}
//                       />
//                     </td>
//                     <td>
//                       <input
//                         ref={(el) => {
//                           if (!fileInputRefs.current[imageIndex]) {
//                             fileInputRefs.current[imageIndex] = el;
//                           }
//                         }}
//                         type="file"
//                         className="d-none"
//                         accept="image/*"
//                         onChange={(e) => handleImageUpdate(imageIndex, e)}
//                       />
//                       <Button
//                         variant="warning"
//                         onClick={() => handleFileInputTrigger(imageIndex)}
//                         className="mt-2"
//                         style={{ color: "#fff" }}
//                       >
//                         <RiEdit2Fill />
//                       </Button>
//                     </td>
//                     <td>
//                       <Button
//                         variant="danger"
//                         onClick={() => handleDeleteImage(imageIndex)}
//                       >
//                         <RiDeleteBin4Fill />
//                       </Button>
//                     </td>
//                   </tr>
//                 )
//               )}
//             </tbody>
//           </Table>

//           {/* Add New Image */}
//           <div className="mt-3 d-flex flex-column">
//             <label htmlFor="newImage" className="form-label">
//               Add New Image
//             </label>
//             <input
//               type="file"
//               className="form-control d-none"
//               id="newImage"
//               accept="image/*"
//               onChange={handleAddImage}
//               ref={fileInputRefs}
//             />
//             <Button
//               variant="success"
//               className="mt-2"
//               onClick={() => fileInputRefs.current.click()}
//             >
//               <FaPlus /> Add Testimonial
//             </Button>
//           </div>
//         </Modal.Body>
//       </Modal>
//       <div style={{ marginTop: "80vh" }}>
//         <Footer />
//       </div>
//     </div>
//   );
// }

// export default Testimonials;


// eslint-disable-next-line no-unused-vars
import React, { useState, useRef, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Modal, Button, Table } from "react-bootstrap";
import { FaPlus } from "react-icons/fa";
import { RiDeleteBin4Fill, RiEdit2Fill } from "react-icons/ri";
import { MdOutlineClose } from "react-icons/md";
import Footer from "./Footer";
import { IMG_URL, addTestinomialsAPI, 
  getAllTestinomialsAPI,
  updateTestinomialsAPI,
  deleteTestinomialsAPI  } from '../../api/api';
import { toast, ToastContainer } from "react-toastify";


function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    email: "",
    image: "",
    description: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedProjectIndex, setSelectedProjectIndex] = useState(null);
  const fileInputRef = useRef(null);
  const [paginationData, setPaginationData] = useState({
    totalItems: 0,
    totalPages: 0,
    currentPage: 1,
    itemsPerPage: 10
  });

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const response = await getAllTestinomialsAPI({
        params: {
          page: currentPage,
          limit: itemsPerPage,
          sortBy: 'createdAt',
          sortOrder: 'DESC'
        }
      });
  
      setTestimonials(response.data);
      setPaginationData({
        totalItems: response.pagination.totalItems,
        totalPages: response.pagination.totalPages,
        currentPage: response.pagination.currentPage,
        itemsPerPage: response.pagination.itemsPerPage
      });
    } catch (error) {
      console.error("Error fetching testimonials:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectInputChange = (e) => {
    const { name, value } = e.target;
    setNewProject({ ...newProject, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setNewProject({ ...newProject, image: file });
  };

  const handleAddOrUpdateProject = async () => {
    try {
      setLoading(true);
      
      if (selectedProjectIndex !== null) {
        const testimonialId = testimonials[selectedProjectIndex].id;
        const formData = new FormData();
        
        // Add all required fields to FormData
        formData.append('name', newProject.name);
        formData.append('email', newProject.email);
        formData.append('content', newProject.description);
        
        // Add image only if new file is selected
        if (fileInputRef.current?.files[0]) {
          formData.append('images', fileInputRef.current.files[0]);
        }
  
        const res = await updateTestinomialsAPI({id: testimonialId,formData});
        if(res.success) {
          toast.success("Testimonial updated successfully");
        } else {
          toast.error("Failed to update testimonial");
        }
        console.log(formData);
      } else {
        const formData = new FormData();
        formData.append('name', newProject.name);
        formData.append('email', newProject.email);
        formData.append('content', newProject.description);
        formData.append('images', fileInputRef.current.files[0]);
        
       const res = await addTestinomialsAPI(formData);
       if(res.success) {
          toast.success("Testimonial added successfully");
        } else {
          toast.error("Failed to add testimonial");
        }
      }
      
      await fetchTestimonials();
      setShowModal(false);
      resetForm();
    } catch (error) {
      toast.error("Failed to add testimonial");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const resetForm = () => {
    setNewProject({
      name: "",
      email: "",
      image: "",
      description: "",
    });
    setSelectedProjectIndex(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  
  
  

  const handleEditProject = (index) => {
    const testimonial = testimonials[index];
    setNewProject({
      name: testimonial.name,
      email: testimonial.email,
      description: testimonial.content,
      image: ""
    });
    setSelectedProjectIndex(index);
    setShowModal(true);
  };

  const handleDeleteProject = async (id) => {
    try {
      setLoading(true);
    const res =  await deleteTestinomialsAPI(id);
    if(res.success) {

      toast.success("Testimonial deleted successfully");
     } else {
      toast.error("Failed to delete testimonial");
    }
      await fetchTestimonials();
    } catch (error) {
      toast.error("Failed to delete testimonial");
      console.error("Error deleting testimonial:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container bg-white">
      <h2 className="text-left mb-4">Testimonials Management</h2>
      <Button
        variant="primary"
        onClick={() => {
          setShowModal(true);
          setSelectedProjectIndex(null);
        }}
        className="mb-3 d-flex gap-2"
        style={{ marginLeft: "85%" }}
      >
        <FaPlus />
        Add Testimonial
      </Button>

      <Table bordered>
        <thead>
          <tr>
            <th>Name</th>
            <th>Image</th>
            <th>Content</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {testimonials.map((testimonial, index) => (
            <tr key={testimonial.id}>
              <td>{testimonial.name}</td>
              <td>
                <img
                  src={`${IMG_URL}/uploads/${testimonial.image}`}
                  alt={testimonial.name}
                  className="img-fluid"
                  style={{ maxWidth: 100 }}
                />
              </td>
              <td>{testimonial.content}</td>
              <td>
                <div className="d-flex">
                  <Button
                    variant="warning"
                    onClick={() => handleEditProject(index)}
                    className="me-2"
                    style={{ color: "#fff" }}
                  >
                    <RiEdit2Fill />
                  </Button>
                  &nbsp;
                  &nbsp;
                  <Button
                    variant="danger"
                    onClick={() => handleDeleteProject(testimonial.id)}
                  >
                    <RiDeleteBin4Fill />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <div className="d-flex justify-content-between align-items-center">
  <div className="d-flex gap-2">
    <Button
      variant="secondary"
      onClick={() => setCurrentPage(currentPage - 1)}
      disabled={currentPage === 1}
    >
      Previous
    </Button>
    &nbsp;
    <Button
      variant="secondary"
      onClick={() => setCurrentPage(currentPage + 1)}
      disabled={currentPage === paginationData.totalPages}
    >
      Next
    </Button>
  </div>
  <span>
    Page {paginationData.currentPage} of {paginationData.totalPages} 
    (Total items: {paginationData.totalItems})
  </span>
</div>
<Modal show={showModal} onHide={() => setShowModal(false)}>
  <Modal.Header>
    <Modal.Title>
      {selectedProjectIndex !== null ? "Update Testimonial" : "Add New Testimonial"}
    </Modal.Title>
    <Button variant="close" onClick={() => setShowModal(false)}><MdOutlineClose /></Button>
  </Modal.Header>
  <Modal.Body>
    <form className="needs-validation">
      <div className="mb-3">
        <label htmlFor="name" className="form-label">Name *</label>
        <input
          type="text"
          className="form-control"
          id="name"
          name="name"
          value={newProject.name}
          onChange={handleProjectInputChange}
          required
          minLength={2}
          maxLength={50}
        />
      </div>

      <div className="mb-3">
        <label htmlFor="email" className="form-label">Email *</label>
        <input
          type="email"
          className="form-control"
          id="email"
          name="email"
          value={newProject.email}
          onChange={handleProjectInputChange}
          required
          pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="image" className="form-label">
          {selectedProjectIndex !== null ? "Update Image" : "Upload Image *"}
        </label>
        <input
          type="file"
          className="form-control"
          id="image"
          accept="image/*"
          onChange={handleFileChange}
          ref={fileInputRef}
          required={!selectedProjectIndex}
        />
        <small className="text-muted">Supported formats: JPG, PNG, JPEG. Max size: 5MB</small>
      </div>

      <div className="mb-3">
        <label htmlFor="description" className="form-label">Content *</label>
        <textarea
          className="form-control"
          id="description"
          name="description"
          rows="4"
          value={newProject.description}
          onChange={handleProjectInputChange}
          required
          minLength={10}
          maxLength={500}
          placeholder="Enter testimonial content..."
        />
        <small className="text-muted">
          {newProject.description.length}/500 characters
        </small>
      </div>
    </form>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={() => {
      setShowModal(false);
      resetForm();
    }}>
      Cancel
    </Button>
    <Button 
      variant="primary" 
      onClick={handleAddOrUpdateProject} 
      disabled={loading || !newProject.name || !newProject.email || !newProject.description}
    >
      {loading ? (
        <span>
          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"/>
          Processing...
        </span>
      ) : (
        `${selectedProjectIndex !== null ? "Update" : "Add"} Testimonial`
      )}
    </Button>
  </Modal.Footer>
</Modal>


      <div style={{ marginTop: "80vh" }}>
        <Footer />
      </div>
      <ToastContainer />
    </div>
  );
}

export default Testimonials;
