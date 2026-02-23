# VaquaH Updates Log

## v2.0.2 - Performance & Stability Update (Current)
**Released: February 23, 2026**

### ⚡ Performance & Optimizations
- **Frontend Optimization**: Excluded heavy Machine Learning WebAssembly files from Vite's `optimizeDeps`, preventing extreme memory spikes (190MB/s) and reducing local startup time to ~200ms.
- **Backend Stability**: Fixed critical dependency corruptions (`natural`, `node-cron`) ensuring 100% server uptime and instant boot times.

### 🐛 Bug Fixes
- **Port Conflicts**: Implemented stricter port management for the backend and frontend development servers to prevent ghost processes.
- **MediaPipe CommonJS Crash**: Fixed a `Hands is not a constructor` runtime error by migrating away from the NPM package to dynamic CDN script injection through the `window` object.
- **Tailwind ESM Crash**: Fixed a silent frontend crash caused by an invalid `require()` call in `tailwind.config.js` by migrating the config to standard ES Module `import` syntax.

---

## v2.0.1 - The "Hands-Free" Update
**Released: February 16, 2026**

### 🧠 Innovation: Voice & Gesture Control
- **Voice Assistant**: Say "VaquaH" to wake up the assistant. Navigate pages ("Go to Cart"), scroll, or ask questions hands-free.
- **Gesture Navigation**: Control the interface using hand gestures via webcam.
    - **Virtual Cursor**: Index finger tracking.
    - **Pinch-to-Click**: Select items without a mouse.
    - **Swipe Navigation**: Fist swipe left/right to navigate back or forward.
    - **Scroll Control**: Use 2 fingers to scroll up, 3 fingers to scroll down.
- **Privacy First**: Camera and Microphone are only active when explicitly enabled. Processing is done locally (gestures) or securely (voice).

### ⚡ Refactors & Improvements
- **Unified Services Interface**: Refactored `Services.jsx` and `AppointmentNew.jsx` to use a shared `ServiceListing` component.
    - Ensures identical design and booking data across the entire site.
- **Performance**: Implemented Lazy Loading for AI models (MediaPipe) to keep initial load times fast.

### 🐛 Bug Fixes
- **Syntax Errors**: Resolved build-breaking syntax errors in `AppointmentNew.jsx`.

---

## v1.3.1 - Experience & Stability Improvements
**Released: January 1, 2026**

### 📐 UI/UX Improvements
- **Banner Optimization**: Updated the main Hero Banner to better direct users to products.
    - Changed "Book Service" call-to-action on product-focused slides to "View Products".
    - Redirects users directly to the products catalog for a seamless shopping experience.

### 🐛 Bug Fixes
- **Product Filter Stability**: Fixed a crash on the Products page that occurred when a filter selection (e.g., Tonnage) returned no results.
    - Added missing component imports to correctly display the "Coming Soon" styling.
- **Review Visibility**: Corrected an issue where review stars were displaying for "Pending" appointments and "Processing" orders.
    - Stars are now strictly hidden until the service is completed or the order is delivered to prevent confusion.

---

## v1.3.0 - UI Standardization & Service Enhancements
**Released: December 25, 2025**

### 🚀 New Features
- **Service Detail Page**: Added a dedicated page (`/services/:id`) for each service, featuring:
    - Detailed descriptions, features list, and verified guarantees.
    - Integrated "Book Now" dialog with visiting charge payment.
    - Customer reviews specific to the service.
- **Unified Review Design**: Introduced a standardized `ReviewCard` component.
    - Consistent look for customer testimonials on Home, Product, and Service pages.
    - Displays user avatar, verified badge, simple star rating, and relative/formatted timestamps.
- **Cart Redirection**: Clicking a service in the cart now correctly redirects to the new Service Detail page instead of a broken product link.

### 🧹 UI/UX Improvements
- **Empty States**: "No reviews yet" sections are now hidden to keep the UI clean.
- **Timestamps**: Added date and time to all customer reviews for better context.
- **Service Cards**: Updated Service Cards on the booking page to match the "Green Badge" rating style of Product Cards.

### 🐛 Bug Fixes
- **Service Review Aggregation**: Fixed a critical issue where reviews submitted via the Dashboard were not updating the Service's average rating.
    - Added logic to link reviews to Service IDs.
    - Implemented a "Legacy Support" mapper to ensure past appointments can still be rated correctly.
- **Product Detail Crash**: Fixed a crash caused by a missing review fetching function (`getProductReviews`).

---

## v1.2.0 - Core Functionality
- Initial release of Booking System.
- Dashboard with Order and Appointment history.
- Cart and Checkout flow integration.
