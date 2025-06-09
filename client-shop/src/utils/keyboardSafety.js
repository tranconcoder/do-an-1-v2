/**
 * Utility functions for safely handling keyboard events to prevent crashes
 */

/**
 * Safely wrap a keyboard event handler to prevent undefined errors
 * @param {Function} handler - The keyboard event handler
 * @param {string} componentName - Name of the component for logging
 * @returns {Function} - Safe event handler
 */
export const safeKeyboardHandler = (handler, componentName = 'Unknown') => {
    return (event) => {
        try {
            // Validate event object
            if (!event) {
                console.warn(`${componentName}: Invalid keyboard event (event is null/undefined)`);
                return;
            }

            // Validate key property exists
            if (typeof event.key === 'undefined') {
                console.warn(`${componentName}: Invalid keyboard event (event.key is undefined)`);
                return;
            }

            // Safely call the handler
            return handler(event);
        } catch (error) {
            console.warn(`${componentName}: Keyboard event error prevented:`, error);

            // Prevent error from propagating and crashing the app
            if (event && typeof event.preventDefault === 'function') {
                event.preventDefault();
            }

            if (event && typeof event.stopPropagation === 'function') {
                event.stopPropagation();
            }
        }
    };
};

/**
 * Safely handle string operations that might fail with undefined values
 * @param {any} value - The value to convert to lowercase
 * @param {string} fallback - Fallback value if conversion fails
 * @returns {string} - Safely converted string
 */
export const safeToLowerCase = (value, fallback = '') => {
    try {
        if (value === null || value === undefined) {
            return fallback;
        }

        if (typeof value === 'string') {
            return value.toLowerCase();
        }

        // Convert to string first, then lowercase
        return String(value).toLowerCase();
    } catch (error) {
        console.warn('safeToLowerCase error:', error, 'value:', value);
        return fallback;
    }
};

/**
 * Safe key code comparison
 * @param {Event} event - Keyboard event
 * @param {string|string[]} keys - Key(s) to compare against
 * @returns {boolean} - Whether the key matches
 */
export const isKey = (event, keys) => {
    try {
        if (!event || !event.key) {
            return false;
        }

        const keysArray = Array.isArray(keys) ? keys : [keys];
        const eventKey = safeToLowerCase(event.key);

        return keysArray.some((key) => safeToLowerCase(key) === eventKey);
    } catch (error) {
        console.warn('isKey error:', error);
        return false;
    }
};

/**
 * Safe modifier key check
 * @param {Event} event - Keyboard event
 * @returns {Object} - Object with modifier key states
 */
export const getModifiers = (event) => {
    try {
        if (!event) {
            return { ctrl: false, shift: false, alt: false, meta: false };
        }

        return {
            ctrl: !!event.ctrlKey,
            shift: !!event.shiftKey,
            alt: !!event.altKey,
            meta: !!event.metaKey
        };
    } catch (error) {
        console.warn('getModifiers error:', error);
        return { ctrl: false, shift: false, alt: false, meta: false };
    }
};

/**
 * Create a safe keydown handler for common patterns
 * @param {Object} handlers - Object mapping keys to handlers
 * @param {string} componentName - Component name for logging
 * @returns {Function} - Safe keydown handler
 */
export const createKeyHandler = (handlers, componentName = 'Unknown') => {
    return safeKeyboardHandler((event) => {
        const key = safeToLowerCase(event.key);

        // Handle special key combinations
        if (isKey(event, 'Enter') && !getModifiers(event).shift && handlers.enter) {
            event.preventDefault();
            handlers.enter(event);
            return;
        }

        if (isKey(event, 'Escape') && handlers.escape) {
            event.preventDefault();
            handlers.escape(event);
            return;
        }

        // Handle other keys
        if (handlers[key]) {
            handlers[key](event);
        }

        // Handle default/fallback
        if (handlers.default) {
            handlers.default(event);
        }
    }, componentName);
};
