export function HomeAboutSection() {
  const details = [
    ["Fabric", "Selected for feel"],
    ["GSM", "Balanced weight"],
    ["Fit", "Easy everyday cut"],
    ["Finish", "Clean construction"],
  ];

  return (
    <section className="bg-[#fafafa] px-5 py-20 text-[#111111] sm:px-8 sm:py-24 lg:px-12 lg:py-28">
      <div className="mx-auto grid w-full max-w-[1280px] gap-12 lg:grid-cols-[.72fr_1.28fr] lg:gap-20">
        <div>
          <p className="m-0 text-[9px] font-semibold uppercase tracking-[.16em] text-black/45">
            About KLEID.IN
          </p>

          <h2 className="mt-4 max-w-[430px] text-[clamp(38px,5vw,72px)] font-semibold leading-[.92] tracking-[-.055em]">
            Everyday pieces, made with attention to the details.
          </h2>
        </div>

        <div className="flex flex-col justify-end">
          <p className="max-w-[620px] text-[14px] leading-7 text-black/62 sm:text-[15px]">
            We focus on the things you actually feel when you wear a garment:
            fabric weight, GSM, fit, structure and finish. Clean essentials,
            designed to be worn often and styled without effort.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8 pt-2 sm:grid-cols-4">
            {details.map(([label, value]) => (
              <div key={label}>
                <span className="block text-[8px] font-semibold uppercase tracking-[.12em] text-black/35">
                  {label}
                </span>
                <strong className="mt-2 block text-[11px] font-semibold text-black/78">
                  {value}
                </strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}