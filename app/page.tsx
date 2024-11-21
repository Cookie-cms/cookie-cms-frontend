import Navbar from "@/components/shared/navbar";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <div className="flex items-center justify-center flex-grow">
        <h1 className="text-4xl font-bold">Welcome to CookieCMS</h1>
      </div>
    </div>
  );
}
