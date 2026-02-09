import Timetable from "@/components/app/timetable/timetable";

export default async function HomePage() {
  return (
    <div className="flex flex-col justify-center items-center w-full max-w-7xl">
        <Timetable />
    </div>
  );
}