import ExportedImage from "next-image-export-optimizer";

import roadSign from "@/assets/roadsign.jpg";

import PageHeader from "./components/pageheader";

export default async function NotFound() {
  return (
    <section>
      <PageHeader
        title="Page not found"
        heroImage={<ExportedImage src={roadSign} alt="Road sign indicating a dead end" />}
      />
      <main>Not found</main>
    </section>
  );
}
