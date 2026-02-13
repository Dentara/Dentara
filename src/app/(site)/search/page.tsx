// app/(site)/search/page.tsx
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import SearchClient from "@/components/search/SearchClient";

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams;
  const q = (sp?.q || "").trim();
  const type = (sp?.type || "all").toLowerCase(); // 'all' | 'doctor' | 'clinic' | 'patient'
  return (
    <DefaultLayout>
      <div className="px-4 py-10 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Search</h1>
        <SearchClient initialQ={q} initialType={(type === "clinic" ? "clinic" : type === "patient" ? "patient" : type === "all" ? "all" : "doctor")} />
      </div>
    </DefaultLayout>
  );
}
