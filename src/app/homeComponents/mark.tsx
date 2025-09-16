'use client';

const services = ["Grooming +","Adoption +", "Medical +", "Walking +","Training +"];

export default function ServicesMarquee() {
  return (
    <div className="w-full overflow-hidden bg-[#f9f6f1] py-20">
      <div className="flex animate-marquee space-x-12 text-5xl font-extrabold">
        {services.concat(services).map((service, i) => (
          <span
            key={i}
            className="relative cursor-pointer bg-gradient-to-r from-cyan-600/50 bg-[length:0%_100%] bg-left bg-no-repeat text-transparent transition-[background-size] duration-700 ease-out hover:bg-[length:100%_100%]"
            style={{
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextStroke: "1px #051557ff", 
            }}
          >
            {service}
          </span>
        ))}
      </div>

      
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          display: inline-flex;
          white-space: nowrap;
          animation: marquee 18s linear infinite;
        }
      `}</style>
    </div>
  );
}
