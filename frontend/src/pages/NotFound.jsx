import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow flex items-center justify-center bg-gray-100">
        <div className="text-center p-8">
          <h1 className="text-6xl font-bold text-vaquah-blue mb-4">404</h1>
          <p className="text-2xl text-gray-600 mb-6">Oops! Page not found</p>
          <p className="text-gray-500 mb-8">
            The page you are looking for might have been removed or is temporarily unavailable.
          </p>
          <Button 
            onClick={() => navigate('/')}
            className="bg-vaquah-blue hover:bg-vaquah-dark-blue"
          >
            <Home size={18} className="mr-2" /> Return to Home
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default NotFound;
