import { useState, useEffect } from "react";

interface Perms {
  role?: "student" | "teacher" | "admin";
  class?: string;
  department?: string;
}

export function usePerms() {
  const [perms, setPerms] = useState<Perms | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL}/api/v1/auth/permissions`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setPerms(data.permissions);
      })
      .catch((error) => {
        console.error("Error fetching permissions:", error);
      });
  }, []);

  return perms;
}