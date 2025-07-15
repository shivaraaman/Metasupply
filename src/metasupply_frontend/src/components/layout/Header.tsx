import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function Header() {
  const { principal, logout } = useAuth();

  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center">
      <Link to="/" className="text-xl font-bold text-blue-600">
        MetaSupply
      </Link>

      <nav className="space-x-4 flex items-center">
        <Link to="/upload" className="hover:text-blue-500">Upload</Link>
        <Link to="/myfiles" className="hover:text-blue-500">My Files</Link>
        <Link to="/search" className="hover:text-blue-500">Search</Link>

        {principal ? (
          <>
            <span className="text-sm text-gray-600">
              {principal.toString().slice(0, 8)}...
            </span>
            <button onClick={logout} className="text-red-500 hover:underline">
              Logout
            </button>
          </>
        ) : (
          <span className="text-gray-500 text-sm">Connecting...</span>
        )}
      </nav>
    </header>
  );
}
