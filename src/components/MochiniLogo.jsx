import React from 'react';
import { useTheme } from '@/components/theme-provider';

const MochiniLogo = ({ className }) => {
    const { theme } = useTheme();

    const logoSrc = theme === 'dark'
        ? 'https://storage.googleapis.com/hostinger-horizons-assets-prod/fe89610e-fec7-4f20-bff3-c376aef88bc3/e7fb42e4b9da40bfd2b26e4aa6e6a022.png'
        : 'https://storage.googleapis.com/hostinger-horizons-assets-prod/fe89610e-fec7-4f20-bff3-c376aef88bc3/fa896ddcea0081baeed8147f1ffc8249.png';

    return (
        <img src={logoSrc} alt="MochiniOS Logo" className={className} />
    );
};

export default MochiniLogo;