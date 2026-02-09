import Timetable from "@/components/app/timetable/timetable";
import WelcomeHeader from "@/components/app/welcome";

export default async function HomePage() {
  return (
    <div className="flex flex-col justify-center items-center w-full max-w-7xl p-3 gap-3 md:px-3 md:py-7 md:gap-6">
      <WelcomeHeader />
      <Timetable />
    </div>
  );
}