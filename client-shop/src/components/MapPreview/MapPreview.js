import React, { useState, useEffect, useRef } from 'react';
import classNames from 'classnames/bind';
import styles from './MapPreview.module.scss';

const cx = classNames.bind(styles);

function MapPreview({ address, coordinates, onCoordinatesChange, className, height = '300px' }) {
    const mapRef = useRef(null);
    const [map, setMap] = useState(null);
    const [marker, setMarker] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentLocation, setCurrentLocation] = useState(null);

    // Default coordinates (Ho Chi Minh City)
    const defaultCoordinates = { lat: 10.8231, lng: 106.6297 };

    useEffect(() => {
        // Load Google Maps API
        if (!window.google) {
            loadGoogleMapsAPI();
        } else {
            initializeMap();
        }
    }, []);

    useEffect(() => {
        if (map && coordinates) {
            updateMapLocation(coordinates);
        }
    }, [map, coordinates]);

    useEffect(() => {
        if (map && address) {
            geocodeAddress(address);
        }
    }, [map, address]);

    const loadGoogleMapsAPI = () => {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = initializeMap;
        script.onerror = () => {
            setError('Không thể tải bản đồ. Vui lòng kiểm tra kết nối internet.');
            setIsLoading(false);
        };
        document.head.appendChild(script);
    };

    const initializeMap = () => {
        try {
            const mapInstance = new window.google.maps.Map(mapRef.current, {
                zoom: 15,
                center: coordinates || currentLocation || defaultCoordinates,
                mapTypeId: window.google.maps.MapTypeId.ROADMAP,
                gestureHandling: 'cooperative',
                streetViewControl: false,
                mapTypeControl: true,
                fullscreenControl: true,
                zoomControl: true
            });

            const markerInstance = new window.google.maps.Marker({
                position: coordinates || currentLocation || defaultCoordinates,
                map: mapInstance,
                draggable: true,
                title: 'Vị trí kho hàng'
            });

            // Add click listener to map
            mapInstance.addListener('click', (event) => {
                const newCoordinates = {
                    lat: event.latLng.lat(),
                    lng: event.latLng.lng()
                };
                updateMapLocation(newCoordinates);
                if (onCoordinatesChange) {
                    onCoordinatesChange(newCoordinates);
                }
            });

            // Add drag listener to marker
            markerInstance.addListener('dragend', (event) => {
                const newCoordinates = {
                    lat: event.latLng.lat(),
                    lng: event.latLng.lng()
                };
                if (onCoordinatesChange) {
                    onCoordinatesChange(newCoordinates);
                }
            });

            setMap(mapInstance);
            setMarker(markerInstance);
            setIsLoading(false);
        } catch (err) {
            setError('Không thể khởi tạo bản đồ.');
            setIsLoading(false);
        }
    };

    const updateMapLocation = (newCoordinates) => {
        if (map && marker) {
            const position = new window.google.maps.LatLng(newCoordinates.lat, newCoordinates.lng);
            map.setCenter(position);
            marker.setPosition(position);
        }
    };

    const geocodeAddress = (address) => {
        if (!window.google || !address) return;

        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address: address }, (results, status) => {
            if (status === 'OK' && results[0]) {
                const location = results[0].geometry.location;
                const newCoordinates = {
                    lat: location.lat(),
                    lng: location.lng()
                };
                updateMapLocation(newCoordinates);
                if (onCoordinatesChange) {
                    onCoordinatesChange(newCoordinates);
                }
            }
        });
    };

    const getCurrentLocation = () => {
        setIsLoading(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const newCoordinates = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    setCurrentLocation(newCoordinates);
                    updateMapLocation(newCoordinates);
                    if (onCoordinatesChange) {
                        onCoordinatesChange(newCoordinates);
                    }
                    setIsLoading(false);
                },
                (error) => {
                    console.error('Error getting current location:', error);
                    setError('Không thể lấy vị trí hiện tại. Vui lòng cho phép truy cập vị trí.');
                    setIsLoading(false);
                }
            );
        } else {
            setError('Trình duyệt không hỗ trợ định vị.');
            setIsLoading(false);
        }
    };

    if (error) {
        return (
            <div className={cx('map-container', 'error', className)} style={{ height }}>
                <div className={cx('error-message')}>
                    <p>{error}</p>
                    <button
                        onClick={() => {
                            setError(null);
                            setIsLoading(true);
                            if (!window.google) {
                                loadGoogleMapsAPI();
                            } else {
                                initializeMap();
                            }
                        }}
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={cx('map-container', className)} style={{ height }}>
            {isLoading && (
                <div className={cx('loading-overlay')}>
                    <div className={cx('spinner')}></div>
                    <p>Đang tải bản đồ...</p>
                </div>
            )}

            <div className={cx('map-controls')}>
                <button
                    type="button"
                    className={cx('location-btn')}
                    onClick={getCurrentLocation}
                    title="Lấy vị trí hiện tại"
                >
                    📍 Vị trí hiện tại
                </button>
            </div>

            <div ref={mapRef} className={cx('map')} style={{ height: '100%', width: '100%' }} />

            <div className={cx('map-info')}>
                <p>💡 Nhấp vào bản đồ hoặc kéo thả marker để chọn vị trí chính xác</p>
                {coordinates && (
                    <div className={cx('coordinates-info')}>
                        <small>
                            Tọa độ: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
                        </small>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MapPreview;
