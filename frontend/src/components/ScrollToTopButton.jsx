import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ScrollToTopButton = () => {
    const [isVisible, setIsVisible] = useState(false);

    const toggleVisibility = () => {
        if (window.pageYOffset > 300) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    useEffect(() => {
        window.addEventListener('scroll', toggleVisibility);
        return () => {
            window.removeEventListener('scroll', toggleVisibility);
        };
    }, []);

    return (
        <>
            {isVisible && (
                <Button
                    onClick={scrollToTop}
                    className="fixed bottom-8 right-10 z-50 rounded-full w-12 h-12 p-0 shadow-lg bg-vaquah-blue hover:bg-blue-700 text-white transition-all duration-300 animate-in fade-in zoom-in"
                    aria-label="Scroll to top"
                >
                    <ArrowUp className="w-6 h-6" />
                </Button>
            )}
        </>
    );
};

export default ScrollToTopButton;
