import Link from "next/link";
import { logout } from "../utils/auth";
import ProtectedRoute from "../components/protectedRoute";

export default function Home() {
  return (
    <ProtectedRoute>
      <div className="container mt-5">
        <div className="d-flex justify-content-between align-items-center mb-5">
          <h1>Book Catalog Dashboard</h1>
          <button className="btn btn-danger" onClick={logout}>
            Logout
          </button>
        </div>

        <div className="row g-4">
          <div className="col-md-4">
            <Link href="/authors" className="text-decoration-none">
              <div className="card text-center shadow-sm h-100 hover-scale">
                <div className="card-body d-flex flex-column justify-content-center align-items-center">
                  <i className="bi bi-people-fill display-4 mb-3 text-primary"></i>
                  <h5 className="card-title">Authors</h5>
                  <p className="card-text text-muted">Manage all authors</p>
                </div>
              </div>
            </Link>
          </div>

          <div className="col-md-4">
            <Link href="/books" className="text-decoration-none">
              <div className="card text-center shadow-sm h-100 hover-scale">
                <div className="card-body d-flex flex-column justify-content-center align-items-center">
                  <i className="bi bi-book-fill display-4 mb-3 text-success"></i>
                  <h5 className="card-title">Books</h5>
                  <p className="card-text text-muted">Manage all books</p>
                </div>
              </div>
            </Link>
          </div>

          <div className="col-md-4">
            <Link href="/publishers" className="text-decoration-none">
              <div className="card text-center shadow-sm h-100 hover-scale">
                <div className="card-body d-flex flex-column justify-content-center align-items-center">
                  <i className="bi bi-building display-4 mb-3 text-warning"></i>
                  <h5 className="card-title">Publishers</h5>
                  <p className="card-text text-muted">Manage all publishers</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        <style jsx>{`
          .hover-scale {
            transition: transform 0.2s;
          }
          .hover-scale:hover {
            transform: scale(1.05);
            cursor: pointer;
          }
        `}</style>
      </div>
    </ProtectedRoute>
  );
}
