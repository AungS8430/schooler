import { auth } from "@/lib/auth";

export default async function WelcomeHeader() {
  const session = await auth();
  return (
    <header className="w-full">
      <h1 className="text-xl md:text-2xl font-semibold truncate">
        Welcome, {session?.user.name || "User"}!
      </h1>
      <h3 className="text-base md:text-lg text-muted-foreground truncate">
        Here's your class schedule for this week.
      </h3>
    </header>
  );
}