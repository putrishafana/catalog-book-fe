import { useEffect, useState } from "react";
import api from "../../utils/api";
import ProtectedRoute from "../../components/protectedRoute";
import { Button, Modal, Form, Table, Pagination } from "react-bootstrap";

interface Publisher {
  id: number;
  name: string;
  address: string;
  email: string;
  phone: string;
}

export default function PublishersList() {
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [currentPublisher, setCurrentPublisher] = useState<Publisher | null>(
    null
  );
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePublisherId, setDeletePublisherId] = useState<number | null>(
    null
  );

  const fetchPublishers = async (page = 1, keyword = "") => {
    try {
      const res = await api.get("/publisher", {
        params: { page, search: keyword },
      });
      setPublishers(res.data.data.data);
      setCurrentPage(res.data.data.current_page);
      setLastPage(res.data.data.last_page);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPublishers();
  }, []);

  const handleSearch = () => {
    fetchPublishers(1, search);
  };

  const handlePageChange = (page: number) => {
    fetchPublishers(page, search);
  };

  const handleModalOpen = (publisher?: Publisher) => {
    if (publisher) {
      setModalTitle("Edit Publisher");
      setCurrentPublisher(publisher);
      setName(publisher.name || "");
      setAddress(publisher.address || "");
      setEmail(publisher.email || "");
      setPhone(publisher.phone || "");
    } else {
      setModalTitle("Add Publisher");
      setCurrentPublisher(null);
      setName("");
      setAddress("");
      setEmail("");
      setPhone("");
    }
    setShowModal(true);
  };

  const handleModalClose = () => setShowModal(false);

  const handleSave = async () => {
    if (!name.trim()) {
      alert("Name is required");
      return;
    }
    if (!address.trim()) {
      alert("Address is required");
      return;
    }
    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      alert("Invalid email format");
      return;
    }
    if (phone && !/^\d{0,15}$/.test(phone)) {
      alert("Phone must be numeric and max 15 digits");
      return;
    }

    try {
      const payload = { name, address, email, phone };
      if (currentPublisher) {
        await api.put(`/publisher/${currentPublisher.id}`, payload);
      } else {
        await api.post("/publisher", payload);
      }
      fetchPublishers(currentPage, search);
      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert("Failed to save publisher");
    }
  };

  const handleDelete = async () => {
    if (!deletePublisherId) return;
    try {
      await api.delete(`/publisher/${deletePublisherId}`);
      fetchPublishers(currentPage, search);
      setShowDeleteConfirm(false);
    } catch (err) {
      console.error(err);
      alert("Failed to delete publisher");
    }
  };

  const renderPagination = () => {
    const items = [];
    for (let number = 1; number <= lastPage; number++) {
      items.push(
        <Pagination.Item
          key={number}
          active={number === currentPage}
          onClick={() => handlePageChange(number)}
        >
          {number}
        </Pagination.Item>
      );
    }
    return <Pagination>{items}</Pagination>;
  };

  return (
    <ProtectedRoute>
      <div className="container mt-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <Button
              variant="outline-secondary"
              size="sm"
              className="me-2"
              onClick={() => (window.location.href = "/")}
            >
              &larr;
            </Button>
            <span className="h3 ms-2 mb-0">Publishers</span>
          </div>

          <div className="d-flex gap-2 align-items-center">
            <Form.Control
              type="text"
              placeholder="Search by name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-control-sm"
              style={{ width: "200px" }}
            />
            <Button variant="secondary" size="sm" onClick={handleSearch}>
              Search
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleModalOpen()}
            >
              Add Publisher
            </Button>
          </div>
        </div>

        <Table bordered hover responsive className="shadow-sm">
          <thead className="table-primary">
            <tr>
              <th className="text-center">No.</th>
              <th className="text-center">Name</th>
              <th className="text-center">Email</th>
              <th className="text-center">Phone</th>
              <th className="text-center">Address</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {publishers.map((p, index) => (
              <tr key={p.id}>
                <td className="text-center">
                  {(currentPage - 1) * 15 + index + 1}
                </td>
                <td>{p.name}</td>
                <td>{p.email}</td>
                <td>{p.phone}</td>
                <td>{p.address}</td>
                <td className="text-center">
                  <Button
                    size="sm"
                    variant="warning"
                    className="me-2"
                    onClick={() => handleModalOpen(p)}
                  >
                    <i className="bi bi-pencil"></i>
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => {
                      setDeletePublisherId(p.id);
                      setShowDeleteConfirm(true);
                    }}
                  >
                    <i className="bi bi-trash"></i>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        {lastPage > 1 && renderPagination()}

        <Modal show={showModal} onHide={handleModalClose}>
          <Modal.Header closeButton>
            <Modal.Title>{modalTitle}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="publisherName" className="mb-2">
                <Form.Label>Name *</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter publisher name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Form.Group>

              <Form.Group controlId="publisherAddress" className="mb-2">
                <Form.Label>Address</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </Form.Group>

              <Form.Group controlId="publisherEmail" className="mb-2">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Form.Group>

              <Form.Group controlId="publisherPhone">
                <Form.Label>Phone</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleModalClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave}>
              Save
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Modal Delete */}
        <Modal
          show={showDeleteConfirm}
          onHide={() => setShowDeleteConfirm(false)}
        >
          <Modal.Header closeButton>
            <Modal.Title>Confirm Delete</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you sure you want to delete this publisher?
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </ProtectedRoute>
  );
}
