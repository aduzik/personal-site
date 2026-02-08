import ExportedImage from "next-image-export-optimizer";
import Link from "next/link";

import roadSign from "@/assets/roadsign.jpg";

import PageHeader from "./components/pageheader";

export default async function NotFound() {
  return (
    <section>
      <PageHeader
        title="Page not found"
        heroImage={<ExportedImage src={roadSign} alt="Road sign indicating a dead end" />}
      />
      <main>
        <div className="content-container">
          <p className="mb-6 text-xl text-neutral-600 dark:text-neutral-400">
            The page you&lsquo;re looking for wasn&lsquo;t found.
          </p>
          <p>
            <Link className="text-emerald-700 dark:text-emerald-500" href="/">
              Return to the homepage
            </Link>
          </p>
        </div>
      </main>
    </section>
  );
}
