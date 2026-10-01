import Link from "next/link";

export function AdminModulePlaceholder({
  title,
  description,
  note,
}: {
  title: string;
  description: string;
  note: string;
}) {
  return (
    <section className="rounded-[20px] border border-black/[.07] bg-white p-5 md:p-7">
      <div className="grid min-h-[360px] place-items-center rounded-[18px] border border-dashed border-black/10 bg-[#fafaf8] px-5 py-10 text-center">
        <div className="max-w-[520px]">
          <div className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-[#eef2ff] text-[#001cac]">
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 3v18M3 12h18" />
            </svg>
          </div>
          <h2 className="mt-4 text-[24px] font-semibold tracking-[-.045em]">
            {title}
          </h2>
          <p className="mx-auto mt-2 max-w-[440px] text-[9px] leading-5 text-black/45">
            {description}
          </p>
          <div className="mx-auto mt-5 max-w-[430px] rounded-[14px] border border-black/[.06] bg-white px-4 py-3 text-left">
            <p className="text-[8px] font-semibold uppercase tracking-[.12em] text-black/30">
              Data status
            </p>
            <p className="mt-1.5 text-[9px] leading-4 text-black/50">{note}</p>
          </div>
          <Link
            href="/admin/dashboard"
            className="mt-5 inline-flex min-h-10 items-center justify-center rounded-full bg-[#111] px-4 text-[8px] font-semibold text-white"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </section>
  );
}
