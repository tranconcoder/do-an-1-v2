# Google Maps Integration Setup

## Overview

The warehouse management system now includes Google Maps integration for visual location selection when creating or editing warehouses.

## Features

-   **Interactive Map**: Click to select warehouse locations
-   **Current Location**: Automatically detect user's current location
-   **Drag & Drop**: Move markers by dragging them to precise positions
-   **Address Geocoding**: Automatically convert addresses to coordinates
-   **Real-time Coordinates**: Display latitude and longitude values
-   **Visual Feedback**: Loading states, error handling, and user instructions

## Setup Instructions

### 1. Google Maps API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
    - Maps JavaScript API
    - Geocoding API
    - Places API (optional, for enhanced address search)
4. Create credentials (API Key)
5. Add your domain to the API key restrictions

### 2. Environment Configuration

Update your `.env` file in the client-shop directory:

```bash
REACT_APP_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

### 3. API Key Security

-   **Development**: You can use the API key as provided
-   **Production**: Make sure to:
    -   Restrict the API key to your domain
    -   Set daily quotas to prevent unexpected charges
    -   Monitor usage in Google Cloud Console

## Components

### MapPreview Component

Located at: `src/components/MapPreview/MapPreview.js`

**Props:**

-   `onCoordinatesChange` (function): Callback when coordinates change
-   `height` (string): Map container height (default: "300px")
-   `initialAddress` (string): Address to geocode and display initially
-   `coordinates` (object): Initial coordinates `{lat, lng}`
-   `showCurrentLocation` (boolean): Show current location button
-   `allowMarkerDrag` (boolean): Allow marker dragging

**Usage:**

```jsx
<MapPreview
    onCoordinatesChange={handleCoordinatesChange}
    height="300px"
    initialAddress={address}
    showCurrentLocation={true}
    allowMarkerDrag={true}
/>
```

## Integration Points

### Add Warehouse Modal

-   File: `src/pages/WarehouseManager/AddWarehouseModal.js`
-   Integrates map for new warehouse location selection
-   Saves coordinates to the database

### Edit Warehouse Modal

-   File: `src/pages/WarehouseManager/EditWarehouseModal.js`
-   Shows existing warehouse location on map
-   Allows updating warehouse coordinates

### Server Integration

The coordinates are sent to the server in the format expected by the location service:

```javascript
{
    coordinates: {
        x: longitude, // -180 to 180
        y: latitude   // -90 to 90
    }
}
```

## Database Schema

Coordinates are stored in the location model:

```typescript
coordinates: {
    x: { type: Number, required }, // longitude
    y: { type: Number, required }  // latitude
}
```

## Error Handling

The map component includes comprehensive error handling for:

-   Google Maps API loading failures
-   Geolocation permission denials
-   Network connectivity issues
-   Invalid coordinates or addresses

## Browser Compatibility

-   Modern browsers with geolocation support
-   Requires HTTPS for geolocation in production
-   Fallback to default coordinates if location services fail

## Testing

To test the map functionality:

1. Set up your Google Maps API key
2. Start the development server
3. Navigate to Warehouse Manager
4. Click "Add New Warehouse" or edit existing warehouse
5. Test location selection, current location, and marker dragging

## Troubleshooting

### Map Not Loading

-   Check API key is correct in `.env` file
-   Verify APIs are enabled in Google Cloud Console
-   Check browser console for API errors

### Geolocation Not Working

-   Ensure HTTPS in production
-   Check browser location permissions
-   Test with different browsers

### Coordinates Not Saving

-   Check network requests in browser dev tools
-   Verify server-side location service is working
-   Check coordinate format (x=lng, y=lat)

## Future Enhancements

-   Street view integration
-   Multiple location search
-   Route planning between warehouses
-   Warehouse proximity analysis
-   Custom map styling
