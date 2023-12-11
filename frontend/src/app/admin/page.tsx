import BasicAccordion from "../components/Accordion";
import Navbar from "../components/Navbar";

export default function Admin() {
  return (
    <main className="flex min-h-screen flex-col items-center p-5">
      <Navbar />
      <div className="w-full">
        <BasicAccordion titulo="Código map" />
        <BasicAccordion titulo="Código reduce" />
        <BasicAccordion titulo="Código combiner" />
      </div>
    </main>
  );
}
