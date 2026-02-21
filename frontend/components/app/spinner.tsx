import { Spinner } from "@/components/ui/spinner";

export default function SpinnerOverlay() {
  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
      <Spinner className="size-8" />
    </div>
  );
}