import React from 'react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'responsive';
  fullScreen?: boolean;
  className?: string;
}

export const Loader: React.FC<LoaderProps> = ({ 
  size = 'responsive', 
  fullScreen = false,
  className = ''
}) => {
  // Size mappings for the loader
  const sizeMap = {
    sm: 'w-16 h-16',
    md: 'w-32 h-32',
    lg: 'w-48 h-48',
    xl: 'w-64 h-64',
    // Responsive sizing based on viewport width
    responsive: 'w-[10vmin] h-[10vmin] sm:w-[15vmin] sm:h-[15vmin] md:w-[20vmin] md:h-[20vmin] lg:w-[25vmin] lg:h-[25vmin]'
  };

  const loaderSize = sizeMap[size];
  
  const loaderContent = (
    <div className={`relative ${className}`}>
      <div className={`relative ${loaderSize}`}>
        <div
          className="absolute w-full h-full rounded-full border-[3px] border-gray-100/10 border-r-[#0ff] border-b-[#0ff] animate-spin"
          style={{ animationDuration: '3s' }}
        ></div>

        <div
          className="absolute w-full h-full rounded-full border-[3px] border-gray-100/10 border-t-[#0ff] animate-spin"
          style={{ animationDuration: '2s', animationDirection: 'reverse' }}
        ></div>
      </div>

      <div
        className="absolute inset-0 bg-gradient-to-tr from-[#0ff]/10 via-transparent to-[#0ff]/5 animate-pulse rounded-full blur-sm"
      ></div>
    </div>
  );

  // If fullScreen is true, center the loader in the viewport
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-900/80 z-50">
        {loaderContent}
      </div>
    );
  }

  // Otherwise, wrap it in a flex container
  return (
    <div className="flex items-center justify-center min-h-full">
      {loaderContent}
    </div>
  );
};

export default Loader;