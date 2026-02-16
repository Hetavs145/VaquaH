// Action Types
export const ASSISTANT_ACTIONS = {
    NAVIGATE_HOME: 'NAVIGATE_HOME',
    NAVIGATE_CART: 'NAVIGATE_CART',
    NAVIGATE_CHECKOUT: 'NAVIGATE_CHECKOUT',
    NAVIGATE_PRODUCTS: 'NAVIGATE_PRODUCTS',
    NAVIGATE_BACK: 'NAVIGATE_BACK',
    SCROLL_UP: 'SCROLL_UP',
    SCROLL_DOWN: 'SCROLL_DOWN',
    SCROLL_TOP: 'SCROLL_TOP',
    SCROLL_BOTTOM: 'SCROLL_BOTTOM',
    CLOSE_ASSISTANT: 'CLOSE_ASSISTANT',
    OPEN_ASSISTANT: 'OPEN_ASSISTANT',
};

export const dispatchAssistantAction = (action, navigate, extraParams = {}) => {
    console.log(`[Assistant] Dispatching action: ${action}`, extraParams);

    const scrollAmount = window.innerHeight * 0.8; // Scroll 80% of viewport

    switch (action) {
        case ASSISTANT_ACTIONS.NAVIGATE_HOME:
            navigate('/');
            break;
        case ASSISTANT_ACTIONS.NAVIGATE_CART:
            navigate('/cart');
            break;
        case ASSISTANT_ACTIONS.NAVIGATE_CHECKOUT:
            navigate('/checkout');
            break;
        case ASSISTANT_ACTIONS.NAVIGATE_PRODUCTS:
            navigate('/products');
            break;
        case ASSISTANT_ACTIONS.NAVIGATE_BACK:
            navigate(-1);
            break;

        case ASSISTANT_ACTIONS.SCROLL_DOWN:
            window.scrollBy({ top: scrollAmount, behavior: 'smooth' });
            break;
        case ASSISTANT_ACTIONS.SCROLL_UP:
            window.scrollBy({ top: -scrollAmount, behavior: 'smooth' });
            break;
        case ASSISTANT_ACTIONS.SCROLL_TOP:
            window.scrollTo({ top: 0, behavior: 'smooth' });
            break;
        case ASSISTANT_ACTIONS.SCROLL_BOTTOM:
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            break;

        case ASSISTANT_ACTIONS.CLOSE_ASSISTANT:
            // handled by context usually, but good to have here for mapping
            break;

        default:
            console.warn(`[Assistant] Unknown action: ${action}`);
    }
};
