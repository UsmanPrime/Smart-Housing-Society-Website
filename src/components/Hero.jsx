import house from '../assets/house.png'

export default function Hero(){
  return (
    // lift the hero up so its background image sits under the fixed header (remove white gap).
    // h-[calc(100vh+80px)] plus -mt-20 assumes header ~80px tall; adjust if your header height differs.
    <section className="relative h-[calc(100vh+80px)] w-full overflow-hidden -mt-20">
      {/* Background with house image */}
      <div className="absolute inset-0">
        <img
          src={house}
          alt="Modern house"
          className="w-full h-full object-cover object-center block"
        />
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
        <h1 className="text-4xl md:text-5xl lg:text-6xl text-white font-bold mb-6 tracking-wide font-sans drop-shadow-2xl">
          Welcome To NEXTGEN Residency
        </h1>

        <p className="text-2xl md:text-3xl text-white font-medium mb-8 drop-shadow-lg">
          "Next-Generation Comfort & Security."
        </p>

        <p className="text-lg md:text-xl text-white/95 max-w-3xl leading-relaxed mb-10 drop-shadow-lg">
          "NextGen Residency offers a smart, secure and eco-friendly living experience,
          blending modern technology with community convenience for residents, administrators
          and service providers in one connected platform."
        </p>

        <div className="flex gap-4">
          <button className="bg-[#1a3d6b] hover:bg-[#2a5d9b] text-white px-8 py-3 rounded font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
            Explore More
          </button>
          <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-8 py-3 rounded font-medium border border-white/30 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
            Contact Us
          </button>
        </div>
      </div>
    </section>
  )
}