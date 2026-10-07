export function HomeCustomOrderSection() {
  return (
    <section
      id="custom-order"
      className="relative overflow-hidden bg-[#f4f1ea] px-4 py-20 text-[#111] sm:px-7 sm:py-24 lg:px-10 lg:py-28"
      aria-label="Custom order"
    >
      <div className="pointer-events-none absolute -right-24 -top-20 h-[300px] w-[300px] rounded-full border border-black/10 sm:h-[420px] sm:w-[420px] lg:-right-28 lg:-top-32 lg:h-[560px] lg:w-[560px]" />
      <div className="pointer-events-none absolute right-[7%] top-[18%] h-20 w-20 rounded-full bg-[#001cac] sm:h-28 sm:w-28 lg:h-36 lg:w-36" />

      <div className="relative mx-auto grid w-full max-w-[1440px] items-end gap-14 lg:grid-cols-[1.15fr_.85fr] lg:gap-20">
        <div>
          <p className="m-0 text-[9px] font-semibold uppercase tracking-[.16em] text-black/42">
            Custom by KLEID.IN
          </p>

          <h2 className="mt-5 max-w-[820px] text-[clamp(46px,7.5vw,112px)] font-semibold leading-[.84] tracking-[-.07em]">
            MADE FOR
            <br />
            YOUR FIT.
          </h2>
        </div>

        <div className="max-w-[500px] lg:justify-self-end">
          <p className="m-0 text-[14px] leading-7 text-black/58 sm:text-[15px]">
            Want something more personal? Start a custom request with your
            preferred fit, size and details. For now this is a preview of the
            experience — the full guest custom-order flow will be connected
            later.
          </p>

          <button
            type="button"
            className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-[#001cac] px-7 text-[9px] font-semibold uppercase tracking-[.1em] text-white transition duration-300 hover:scale-[1.02]"
          >
            Create Your Custom
          </button>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-5 left-4 text-[8px] font-semibold uppercase tracking-[.14em] text-black/28 sm:left-7 lg:left-10">
        Guest custom request · Coming next
      </div>
    </section>
  );
}
