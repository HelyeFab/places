'use client';

import Image from 'next/image';

export default function PageHeader() {
  return (
    <div className="w-full bg-gradient-to-br from-theme-accent-50 to-theme-accent-100 py-4 md:py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="relative bg-theme-bg-primary rounded-3xl shadow-xl p-6 md:p-12 overflow-hidden min-h-[280px] md:min-h-[400px]">
          {/* Decorative background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-0 w-32 h-32 bg-theme-accent-600 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-theme-accent-700 rounded-full blur-3xl"></div>
          </div>

          {/* Floating sakura petals */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Large sakura - top left */}
            <div className="absolute top-4 left-6 md:top-6 md:left-10 w-12 h-12 md:w-16 md:h-16 opacity-60 animate-[float_6s_ease-in-out_infinite]">
              <Image src="/images/sakura.svg" alt="" fill className="object-contain" />
            </div>
            {/* Small sakura - top right */}
            <div className="absolute top-8 right-10 md:top-10 md:right-16 w-7 h-7 md:w-9 md:h-9 opacity-40 animate-[float_4s_ease-in-out_1s_infinite]">
              <Image src="/images/sakura.svg" alt="" fill className="object-contain" />
            </div>
            {/* Medium sakura - mid left */}
            <div className="absolute top-1/2 left-4 md:left-8 w-9 h-9 md:w-12 md:h-12 opacity-50 animate-[float_5s_ease-in-out_0.5s_infinite]">
              <Image src="/images/sakura.svg" alt="" fill className="object-contain" />
            </div>
            {/* Small sakura - mid right */}
            <div className="absolute top-1/3 right-6 md:right-12 w-6 h-6 md:w-8 md:h-8 opacity-35 animate-[float_7s_ease-in-out_2s_infinite]">
              <Image src="/images/sakura.svg" alt="" fill className="object-contain" />
            </div>
            {/* Medium sakura - bottom left */}
            <div className="absolute bottom-12 left-12 md:left-20 w-10 h-10 md:w-14 md:h-14 opacity-45 animate-[float_5.5s_ease-in-out_1.5s_infinite]">
              <Image src="/images/sakura.svg" alt="" fill className="object-contain" />
            </div>
            {/* Tiny sakura - bottom right */}
            <div className="absolute bottom-16 right-8 md:right-14 w-5 h-5 md:w-7 md:h-7 opacity-30 animate-[float_4.5s_ease-in-out_3s_infinite]">
              <Image src="/images/sakura.svg" alt="" fill className="object-contain" />
            </div>
            {/* Extra small sakura - upper center-left */}
            <div className="absolute top-12 left-1/4 w-5 h-5 md:w-7 md:h-7 opacity-25 animate-[float_6.5s_ease-in-out_0.8s_infinite]">
              <Image src="/images/sakura.svg" alt="" fill className="object-contain" />
            </div>
            {/* Extra sakura - lower center-right */}
            <div className="absolute bottom-20 right-1/4 w-8 h-8 md:w-10 md:h-10 opacity-40 animate-[float_5s_ease-in-out_2.5s_infinite]">
              <Image src="/images/sakura.svg" alt="" fill className="object-contain" />
            </div>
          </div>

          {/* Main content */}
          <div className="relative flex flex-col items-center justify-center">

            {/* Torii gate - prominent center */}
            <div className="relative w-40 h-40 md:w-56 md:h-56 transition-transform hover:scale-105 duration-300">
              <Image
                src="/images/temple.svg"
                alt="Torii Gate"
                fill
                className="object-contain drop-shadow-lg"
                priority
              />
            </div>

            {/* Subtitle */}
            <div className="mt-4 md:mt-6 text-center">
              <p className="text-theme-text-secondary text-xs md:text-base italic">
                Emmanuel's Japan 2026
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
