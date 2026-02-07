import { signIn } from "@/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent, CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import GoogleIcon from "@/components/icons/google";
import GradientBackground from "@/components/gradient-background";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row gap-5">
          <GoogleIcon /><CardTitle className="my-auto">Sign in <span className="text-neutral-500">to join</span> {process.env.ALLOWED_DOMAIN} <span className="text-neutral-500">with</span> Google</CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="flex flex-col gap-4">
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/" });
            }}
          >
            <Button type="submit" className="w-full" size="lg">
              Continue with Google
            </Button>
          </form>
        </CardContent>
        <CardFooter className="inline text-muted-foreground">
          By signing in, Google will share your name, email address, and profile picture with Schooler.
          Learn more about <Link href="/terms" className="text-black hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-black hover:underline">Privacy Policy</Link>.
        </CardFooter>
      </Card>
      <GradientBackground
        className="-z-10"
        color="var(--primary)"
        bgColor="var(--background)"
      />
    </div>
  );
}