import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Mic, Hand, Scroll, MoveLeft, MoveRight, ThumbsUp, ShoppingCart, Home, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Guide = () => {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold text-vaquah-blue mb-6 text-center">Voice & Gesture Control Guide</h1>
                    <p className="text-gray-600 text-center mb-8 text-lg">
                        Experience VaquaH hands-free! Learn how to navigate and interact with our application using just your voice or simple hand gestures.
                    </p>

                    <Tabs defaultValue="voice" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-8">
                            <TabsTrigger value="voice" className="text-lg py-3">
                                <Mic className="mr-2 h-5 w-5" /> Voice Assistant
                            </TabsTrigger>
                            <TabsTrigger value="gesture" className="text-lg py-3">
                                <Hand className="mr-2 h-5 w-5" /> Gesture Control
                            </TabsTrigger>
                        </TabsList>

                        {/* Voice Assistant Tab */}
                        <TabsContent value="voice" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center text-2xl text-vaquah-blue">
                                        <Mic className="mr-3 h-8 w-8 text-vaquah-orange" />
                                        Getting Started
                                    </CardTitle>
                                    <CardDescription className="text-base">
                                        The Voice Assistant allows you to navigate the site, check your cart, and scroll easily.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                        <h3 className="font-semibold text-lg mb-2">Activation</h3>
                                        <p className="text-gray-700">
                                            Just say <span className="font-bold text-vaquah-blue">"VaquaH"</span> or <span className="font-bold text-vaquah-blue">"Start Assistant"</span> anywhere on the site.
                                            <br />
                                            Alternatively, click the microphone icon <Mic className="inline h-4 w-4" /> in the navigation bar.
                                        </p>
                                    </div>

                                    <h3 className="font-semibold text-lg mt-6 mb-4">Available Commands</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <CommandCard
                                            icon={<Home className="h-6 w-6 text-blue-500" />}
                                            command='"Go Home"'
                                            description="Navigates to the homepage."
                                        />
                                        <CommandCard
                                            icon={<ShoppingCart className="h-6 w-6 text-green-500" />}
                                            command='"Go to Cart"'
                                            description="Opens your shopping cart."
                                        />
                                        <CommandCard
                                            icon={<ArrowLeft className="h-6 w-6 text-orange-500" />}
                                            command='"Go Back"'
                                            description="Returns to the previous page."
                                        />
                                        <CommandCard
                                            icon={<Scroll className="h-6 w-6 text-purple-500" />}
                                            command='"Scroll Down / Up"'
                                            description="Scrolls the page smoothly."
                                        />
                                        <CommandCard
                                            icon={<Scroll className="h-6 w-6 text-indigo-500" />}
                                            command='"Scroll to Top / Bottom"'
                                            description="Jumps to the top or bottom of the page."
                                        />
                                        <CommandCard
                                            icon={<ShoppingBag className="h-6 w-6 text-red-500" />}
                                            command='"Go to Checkout"'
                                            description="Proceeds to the checkout page."
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Gesture Control Tab */}
                        <TabsContent value="gesture" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center text-2xl text-vaquah-blue">
                                        <Hand className="mr-3 h-8 w-8 text-green-500" />
                                        Touch-Free Navigation
                                    </CardTitle>
                                    <CardDescription className="text-base">
                                        Navigate pages and scroll without touching your screen using our AI-powered gesture recognition.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                                        <h3 className="font-semibold text-lg mb-2">Activation</h3>
                                        <p className="text-gray-700">
                                            Click the hand icon <Hand className="inline h-4 w-4" /> in the navigation bar to enable Gesture Mode.
                                            <br />
                                            You will need to grant camera access. The camera is only active when this mode is on.
                                        </p>
                                    </div>

                                    <h3 className="font-semibold text-lg mt-6 mb-4">Supported Gestures</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <GestureCard
                                            title="Mouse Control"
                                            description="Point & Pinch"
                                            details="Move Index finger to control cursor. Pinch Thumb & Index to click."
                                            icon={<HandPointing />}
                                        />
                                        <GestureCard
                                            title="Scroll Up"
                                            description="2 Fingers"
                                            details="Hold Index & Middle fingers up to scroll up."
                                            icon={<HandTwoFingers />}
                                        />
                                        <GestureCard
                                            title="Scroll Down"
                                            description="3 Fingers"
                                            details="Hold Index, Middle & Ring fingers up to scroll down."
                                            icon={<HandThreeFingers />}
                                        />
                                        <GestureCard
                                            title="Navigate History"
                                            description="Fist Swipe"
                                            details="Make a Fist. Swipe Left to go Back, Right to go Forward."
                                            icon={<FistIcon />}
                                        />

                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
            <Footer />
        </div>
    );
};

// Helper Components
const CommandCard = ({ icon, command, description }) => (
    <div className="flex items-center p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="mr-4 p-2 bg-gray-50 rounded-full">{icon}</div>
        <div>
            <p className="font-bold text-gray-800">{command}</p>
            <p className="text-sm text-gray-500">{description}</p>
        </div>
    </div>
);

const GestureCard = ({ title, description, details, icon }) => (
    <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="mb-4 h-16 w-16 flex items-center justify-center bg-gray-50 rounded-full text-vaquah-blue">
            {icon}
        </div>
        <h4 className="font-bold text-lg mb-1">{title}</h4>
        <p className="font-medium text-vaquah-blue mb-2">{description}</p>
        <p className="text-sm text-gray-500">{details}</p>
    </div>
);

// Custom Icons for Gestures
const HandPointing = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
);

const HandTwoFingers = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 14V5a2 2 0 0 1 2-2v0a2 2 0 0 1 2 2v9" />
        <path d="M14 14V5a2 2 0 0 1 2-2v0a2 2 0 0 1 2 2v9" />
        <path d="M18 11.5V14c0 3-2.5 5.5-5.5 5.5h-3.5A5.5 5.5 0 0 1 3.5 14v-1.5" />
    </svg>
);

const HandThreeFingers = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 14V5a2 2 0 0 1 2-2v0a2 2 0 0 1 2 2v9" />
        <path d="M14 14V5a2 2 0 0 1 2-2v0a2 2 0 0 1 2 2v9" />
        <path d="M6 14V8a2 2 0 0 1 2-2v0a2 2 0 0 1 2 2v6" />
        <path d="M18 11.5V14c0 3-2.5 5.5-5.5 5.5h-3.5A5.5 5.5 0 0 1 3.5 14v-1.5" />
    </svg>
);

const FistIcon = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="6" y="8" width="12" height="10" rx="3" />
        <path d="M6 12h12" />
    </svg>
);

const ShoppingBag = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
);


export default Guide;
