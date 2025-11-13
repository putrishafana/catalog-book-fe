import { useEffect, useState } from "react";
import api from "../../utils/api";
import ProtectedRoute from "../../components/protectedRoute";
import { Button, Modal, Form, Table, Pagination } from "react-bootstrap";

interface Book {
  id: number;
  title: string;
  desc: string;
  year_publish: string;
  author_id: number;
  publisher_id: number;
  author?: Author;
  publisher?: Publisher;
}

export default function BooksList() {
  const [books, setBooks] = useState<Book[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [currentBook, setCurrentBook] = useState<Book | null>(null);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [yearPublish, setYearPublish] = useState("");
  const [authorId, setAuthorId] = useState<number | null>(null);
  const [publisherId, setPublisherId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteBookId, setDeleteBookId] = useState<number | null>(null);

  const fetchBooks = async (page = 1, keyword = "") => {
    try {
      const res = await api.get("/book", { params: { page, search: keyword } });
      setBooks(res.data.data.book.data);
      setAuthors(res.data.data.author);
      setPublishers(res.data.data.publisher);
      setCurrentPage(res.data.data.book.current_page);
      setLastPage(res.data.data.book.last_page);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleSearch = () => {
    fetchBooks(1, search);
  };

  const handlePageChange = (page: number) => {
    fetchBooks(page, search);
  };

  const handleModalOpen = (book?: Book) => {
    if (book) {
      setModalTitle("Edit Book");
      setCurrentBook(book);
      setTitle(book.title);
      setDesc(book.desc);
      setYearPublish(book.year_publish);
      setAuthorId(book.author_id);
      setPublisherId(book.publisher_id);
    } else {
      setModalTitle("Add Book");
      setCurrentBook(null);
      setTitle("");
      setDesc("");
      setYearPublish("");
      setAuthorId(null);
      setPublisherId(null);
    }
    setShowModal(true);
  };

  const handleModalClose = () => setShowModal(false);

  const handleSave = async () => {
    if (!title.trim()) {
      alert("Title is required");
      return;
    }
    if (!desc.trim()) {
      alert("Desc is required");
      return;
    }
    if (!yearPublish.trim()) {
      alert("Year is required");
      return;
    }
    if (!authorId) {
      alert("Author is required");
      return;
    }
    if (!publisherId) {
      alert("Publisher is required");
      return;
    }

    try {
      const payload = {
        title,
        desc,
        year_publish: yearPublish,
        author_id: authorId,
        publisher_id: publisherId,
      };
      if (currentBook) {
        await api.put(`/book/${currentBook.id}`, payload);
      } else {
        await api.post("/book", payload);
      }
      fetchBooks(currentPage, search);
      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert("Failed to save book");
    }
  };

  const handleDelete = async () => {
    if (!deleteBookId) return;
    try {
      await api.delete(`/book/${deleteBookId}`);
      fetchBooks(currentPage, search);
      setShowDeleteConfirm(false);
    } catch (err) {
      console.error(err);
      alert("Failed to delete book");
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
            <span className="h3 ms-2 mb-0">Books</span>
          </div>

          <div className="d-flex gap-2 align-items-center">
            <Form.Control
              type="text"
              placeholder="Search by title"
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
              Add Book
            </Button>
          </div>
        </div>

        <Table bordered hover responsive className="shadow-sm">
          <thead className="table-primary">
            <tr>
              <th>No.</th>
              <th>Title</th>
              <th>Year</th>
              <th>Author</th>
              <th>Publisher</th>
              <th>Description</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.map((b, index) => (
              <tr key={b.id}>
                <td>{(currentPage - 1) * 15 + index + 1}</td>
                <td>{b.title}</td>
                <td>{b.year_publish}</td>
                <td>{b.authors?.name}</td>
                <td>{b.publishers?.name}</td>
                <td
                  style={{
                    maxWidth: "200px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {b.desc}
                </td>

                <td className="text-center">
                  <Button
                    size="sm"
                    variant="warning"
                    className="me-2"
                    onClick={() => handleModalOpen(b)}
                  >
                    <i className="bi bi-pencil"></i>
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => {
                      setDeleteBookId(b.id);
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

        {/* Modal Add/Edit */}
        <Modal show={showModal} onHide={handleModalClose}>
          <Modal.Header closeButton>
            <Modal.Title>{modalTitle}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="bookTitle" className="mb-2">
                <Form.Label>Title *</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter book title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </Form.Group>

              <Form.Group controlId="bookDesc" className="mb-2">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  placeholder="Enter description"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  rows={3}
                />
              </Form.Group>

              <Form.Group controlId="bookYear" className="mb-2">
                <Form.Label>Year *</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter year of publication"
                  value={yearPublish}
                  onChange={(e) => setYearPublish(e.target.value)}
                />
              </Form.Group>

              <Form.Group controlId="bookAuthor" className="mb-2">
                <Form.Label>Author *</Form.Label>
                <Form.Select
                  value={authorId || ""}
                  onChange={(e) => setAuthorId(Number(e.target.value))}
                >
                  <option value="">Select Author</option>
                  {authors.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group controlId="bookPublisher">
                <Form.Label>Publisher *</Form.Label>
                <Form.Select
                  value={publisherId || ""}
                  onChange={(e) => setPublisherId(Number(e.target.value))}
                >
                  <option value="">Select Publisher</option>
                  {publishers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </Form.Select>
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
          <Modal.Body>Are you sure you want to delete this book?</Modal.Body>
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
