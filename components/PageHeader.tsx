'use client';

import Image from 'next/image';

export default function PageHeader() {
  return (
    <div className="w-full bg-gradient-to-br from-theme-accent-50 to-theme-accent-100 py-4 md:py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="relative bg-theme-bg-primary rounded-3xl shadow-xl p-6 md:p-12 overflow-hidden">
          {/* Decorative background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-0 w-32 h-32 bg-theme-accent-600 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-theme-accent-700 rounded-full blur-3xl"></div>
          </div>

          {/* Triangle layout container */}
          <div className="relative h-48 md:h-80">
            {/* Top apex - Just Married */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-20 md:w-24 md:h-24 transition-transform hover:scale-110 duration-300">
              <div className="relative w-full h-full">
                <Image
                  src="/images/just-married.png"
                  alt="Just Married"
                  fill
                  className="object-contain drop-shadow-md"
                  style={{ background: 'transparent' }}
                  priority
                />
              </div>
            </div>

            {/* Bottom left apex - Friend */}
            <div className="absolute bottom-0 left-8 md:left-16 w-20 h-20 md:w-24 md:h-24 transition-transform hover:scale-110 duration-300">
              <div className="relative w-full h-full">
                <Image
                  src="/images/friend.png"
                  alt="Friend"
                  fill
                  className="object-contain drop-shadow-md"
                  style={{ background: 'transparent' }}
                />
              </div>
            </div>

            {/* Bottom right apex - Australia */}
            <div className="absolute bottom-0 right-8 md:right-16 w-20 h-20 md:w-24 md:h-24 transition-transform hover:scale-110 duration-300">
              <div className="relative w-full h-full">
                <Image
                  src="/images/australia.png"
                  alt="Australia"
                  fill
                  className="object-contain drop-shadow-md"
                  style={{ background: 'transparent' }}
                />
              </div>
            </div>

            {/* Center logo - M&F */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-6 md:mt-0">
              <span className="text-5xl md:text-6xl font-bold bg-gradient-to-br from-theme-accent-600 to-theme-accent-700 bg-clip-text text-transparent drop-shadow-lg logo-text">
                M&F
              </span>
            </div>
          </div>

          {/* Optional subtitle */}
          <div className="mt-4 md:mt-8 text-center">
            <p className="text-theme-text-secondary text-xs md:text-base italic">
              Our Australian Adventure Together
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
