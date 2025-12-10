import React from 'react';
import { useCart } from '@/context/CartContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Wishlist = () => {
    const { state } = useCart();
    const { wishlist } = state;
    const navigate = useNavigate();

    if (wishlist.length === 0) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Navbar />
                <div className="flex-grow flex items-center justify-center">
                    <div className="text-center px-4">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                            <Heart size={32} />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold mb-4 font-sans leading-tight">Your Wishlist is Empty</h1>
                        <p className="text-gray-600 text-base sm:text-lg mb-6">Save items you love to buy later!</p>
                        <Button onClick={() => navigate('/products')} className="bg-vaquah-blue hover:bg-vaquah-dark-blue">
                            Browse Products
                        </Button>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <div className="flex-grow container-custom py-8 sm:py-12">
                <div className="flex items-center gap-3 mb-8">
                    <Heart className="text-vaquah-orange fill-vaquah-orange" size={28} />
                    <h1 className="text-3xl font-bold text-gray-800">My Wishlist ({wishlist.length})</h1>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {wishlist.map((product) => (
                        <ProductCard
                            key={product._id}
                            {...product}
                        />
                    ))}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Wishlist;
