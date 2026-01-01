# VaquaH Updates Log

## v1.3.1 - Experience & Stability Improvements (Current)
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
