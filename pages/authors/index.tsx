import { useEffect, useState } from "react";
import api from "../../utils/api";
import ProtectedRoute from "../../components/protectedRoute";
import { Button, Modal, Form, Table, Pagination } from "react-bootstrap";

interface Author {
  id: number;
  name: string;
  bio?: string;
}

export default function AuthorsList() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [currentAuthor, setCurrentAuthor] = useState<Author | null>(null);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteAuthorId, setDeleteAuthorId] = useState<number | null>(null);

  const fetchAuthors = async (page = 1, keyword = "") => {
    try {
      const res = await api.get("/author", {
        params: { page, search: keyword },
      });
      setAuthors(res.data.data.data);
      setCurrentPage(res.data.data.current_page);
      setLastPage(res.data.data.last_page);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAuthors();
  }, []);

  const handleSearch = () => {
    fetchAuthors(1, search);
  };

  const handlePageChange = (page: number) => {
    fetchAuthors(page, search);
  };

  const handleModalOpen = (author?: Author) => {
    if (author) {
      setModalTitle("Edit Author");
      setCurrentAuthor(author);
      setName(author.name);
      setBio(author.bio || "");
    } else {
      setModalTitle("Add Author");
      setCurrentAuthor(null);
      setName("");
      setBio("");
    }
    setShowModal(true);
  };

  const handleModalClose = () => setShowModal(false);

  const handleSave = async () => {
    if (!name.trim()) {
      alert("Name is required");
      return;
    }
    if (!bio.trim()) {
      alert("Bio is required");
      return;
    }
    try {
      const payload = { name, bio };
      if (currentAuthor) {
        await api.put(`/author/${currentAuthor.id}`, payload);
      } else {
        await api.post("/author", payload);
      }
      fetchAuthors(currentPage, search);
      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert("Failed to save author");
    }
  };

  const handleDelete = async () => {
    if (!deleteAuthorId) return;
    try {
      await api.delete(`/author/${deleteAuthorId}`);
      fetchAuthors(currentPage, search);
      setShowDeleteConfirm(false);
    } catch (err) {
      console.error(err);
      alert("Failed to delete author");
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
            <span className="h3 ms-2 mb-0">Authors</span>
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
              Add Author
            </Button>
          </div>
        </div>

        <Table bordered hover responsive className="shadow-sm">
          <thead className="table-primary">
            <tr>
              <th className="text-center">No</th>
              <th className="text-center">Name</th>
              <th className="text-center">Bio</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {authors.map((a, index) => (
              <tr key={a.id}>
                <td className="text-center">
                  {(currentPage - 1) * 15 + index + 1}
                </td>{" "}
                <td>{a.name}</td>
                <td>{a.bio}</td>
                <td className="text-center">
                  <Button
                    size="sm"
                    variant="warning"
                    className="me-2"
                    onClick={() => handleModalOpen(a)}
                  >
                    <i className="bi bi-pencil"></i>
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => {
                      setDeleteAuthorId(a.id);
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
              <Form.Group controlId="authorName">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter author name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Form.Group>

              <Form.Group controlId="authorBio">
                <Form.Label>Bio</Form.Label>
                <Form.Control
                  as="textarea"
                  placeholder="Enter author bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
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

        <Modal
          show={showDeleteConfirm}
          onHide={() => setShowDeleteConfirm(false)}
        >
          <Modal.Header closeButton>
            <Modal.Title>Confirm Delete</Modal.Title>
          </Modal.Header>
          <Modal.Body>Are you sure you want to delete this author?</Modal.Body>
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
