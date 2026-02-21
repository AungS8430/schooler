import { Suspense } from "react";
import { PeopleContent } from "./people-content";

function PeopleLoading() {
  return (
    <div className="flex flex-col justify-start items-center max-w-5xl w-full h-screen gap-0 mx-auto overflow-hidden">
      <div className="flex flex-col gap-2 sticky top-0 z-10 w-full p-3">
        <h1 className="text-2xl font-semibold">People</h1>
        <div className="flex gap-2 items-center w-full max-w-full animate-pulse">
          <div className="h-10 bg-muted rounded grow"></div>
          <div className="h-10 bg-muted rounded w-32"></div>
          <div className="h-10 bg-muted rounded w-32"></div>
        </div>
      </div>
    </div>
  );
}

export default function ClassesPage() {
  return (
    <Suspense fallback={<PeopleLoading />}>
      <PeopleContent />
    </Suspense>
  );
}