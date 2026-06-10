import { getEvent, getProgram } from "@/lib/store";
import { SiteHeader } from "@/components/SiteHeader";
import { ScanArrival } from "@/components/ScanArrival";

export const dynamic = "force-dynamic";

// A single-screen, function-first landing: find your seat and download/view the
// schedule — nothing else. (The fuller marketing site is preserved at /classic.)
export default async function Home() {
  const [event, program] = await Promise.all([getEvent(), getProgram()]);

  return (
    <>
      <SiteHeader
        monogram={event.monogram}
        variant="overlay"
        showSeatLink={false}
      />
      <main>
        <ScanArrival event={event} program={program} />
      </main>
    </>
  );
}
