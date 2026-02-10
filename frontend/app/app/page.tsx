import { Button } from "@/components/ui/button";
import Timetable from "@/components/app/timetable";
import WelcomeHeader from "@/components/app/welcome";
import AnnouncementCard from "@/components/app/announcement-card";
import { ChevronRight, Calendar } from "lucide-react";
import ScrollGradient from "@/components/app/scroll-gradient";

import Link from "next/link";

export default async function HomePage() {
  return (
    <div className="flex flex-col justify-center items-center w-full max-w-5xl p-3 gap-3 md:px-3 md:py-7 md:gap-12 mx-auto overflow-hidden">
      <div className="flex flex-col justify-center overflow-hidden max-w-full">
        <div className="flex flex-col justify-center md:gap-6 overflow-hidden">
          <WelcomeHeader />
          <Timetable />
        </div>

        <div className="self-end">
          <Button variant="link" asChild>
            <Link href="/app/calendar"><Calendar />View Academic Calendar</Link>
          </Button>
          <Button  variant="link" asChild>
            <Link href="/app/timetable"><ChevronRight />View Full Timetable</Link>
          </Button>
        </div>

      </div>
      {/*Mock up for announcements*/}
      <div className="flex flex-col justify-start max-w-full w-fit gap-2">
        <h2 className="text-xl font-semibold">Recent Announcements</h2>
        <div className="flex flex-col">
          <ScrollGradient scrollClassName="flex flex-row max-w-full overflow-x-auto gap-2 py-2 justify-start">
            <AnnouncementCard
              id={1}
              title="Welcome to Schooler!"
              description="We're excited to have you on board. Explore the features and let us know if you have any questions."
              thumbnail={"/public/vercel.svg"}
              author={{ name: "Schooler Team", image: "/public/file.svg" }}
              date={new Date().toISOString()}
              target="C2R2 Students"
              priority={3}
            />
            <AnnouncementCard
              id={1}
              title="Welcome to Schooler!"
              description="We're excited to have you on board. Explore the features and let us know if you have any questions."
              thumbnail={"/public/vercel.svg"}
              author={{ name: "Schooler Team", image: "/public/file.svg" }}
              date={new Date().toISOString()}
              target="C2R2 Students"
              priority={3}
            />
            <AnnouncementCard
              id={1}
              title="Welcome to Schooler!"
              description="We're excited to have you on board. Explore the features and let us know if you have any questions."
              thumbnail={"/public/vercel.svg"}
              author={{ name: "Schooler Team", image: "/public/file.svg" }}
              date={new Date().toISOString()}
              target="C2R2 Students"
              priority={3}
            />
          </ScrollGradient>
          <Button className="self-end" variant="link" asChild>
            <Link href="/app/announcements"><ChevronRight />View All Announcements</Link>
          </Button>
        </div>

      </div>
    </div>
  );
}