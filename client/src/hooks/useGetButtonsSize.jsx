import { useState, useEffect } from "react";

const useGetButtonsSize = () => {
    const [width, setWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return width > 768 ? 'large' : 'small';
};

export default useGetButtonsSize;