import React, { useState } from 'react';

const ImageWithFallback = ({ src, alt, className, ...props }) => {
    const [error, setError] = useState(false);

    const handleError = () => {
        if (!error) {
            setError(true);
        }
    };

    return (
        <img
            src={error ? '/placeholder.jpg' : src}
            alt={alt || 'Image'}
            className={className}
            onError={handleError}
            {...props}
        />
    );
};

export default ImageWithFallback; 