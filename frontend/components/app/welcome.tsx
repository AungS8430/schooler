import { useSession } from "next-auth/react";
export default function WelcomeHeader({ schedule }: { schedule?: boolean}) {
  const session = useSession();
  return (
    <header className="w-full">
      <h1 className="text-xl md:text-2xl font-semibold truncate">
        Welcome, {session?.data?.user.name || "User"}!
      </h1>
      {schedule && (<h3 className="text-base md:text-lg text-muted-foreground truncate">
        Here's your class schedule for this week.
      </h3>)}
    </header>
  );
}