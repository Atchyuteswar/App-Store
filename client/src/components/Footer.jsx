import { Separator } from "@/components/ui/separator";

export default function Footer() {
  return (
    <footer className="border-t mt-16">
      <div className="container py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">AG</span>
            </div>
            <span className="font-semibold">Atchyuteswar Gottumukkala</span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Atchyuteswar Gottumukkala. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
