import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Search, Coins, ListChecks } from "lucide-react";
// import { useEffect, useRef } from "react";

const Header = () => {
  // const divRef = useRef(null);
  // const startTop = 0; // px

  // useEffect(() => {
  //   const handleScroll = () => {
  //     if (divRef.current) {
  //       divRef.current.style.top = `${window.scrollY + startTop}px`;
  //     }
  //   };

  //   window.addEventListener("scroll", handleScroll);

  //   return () => {
  //     window.removeEventListener("scroll", handleScroll);
  //   };
  // }, []);

  return (
    <header className="sticky min-w-screen top-0 z-30 bg-background/30 backdrop-blur supports-[backdrop-filter] border-b">
      <nav className="container mx-auto px-4 py-3 flex items-center gap-3">
        {/* Logo */}
        <a
          href="/"
          aria-label="Dashboard home"
          className="shrink-0 font-semibold text-lg"
        >
          <span className="inline-flex items-center h-10 px-3 rounded-md bg-secondary text-secondary-foreground">
            Probo
          </span>
        </a>

        {/* Primary nav */}
        <div className="hidden md:flex items-center gap-1">
          <Button variant="ghost" size="sm" className="rounded-md">
            Categories
          </Button>
          <Button variant="ghost" size="sm" className="rounded-md">
            Portfolio
          </Button>
        </div>

        {/* Search */}
        <div className="flex-1 min-w-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60" />
            <Input
              placeholder="Search..."
              aria-label="Search"
              className="pl-10"
            />
          </div>
        </div>

        {/* Quick actions */}
        <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
          <ListChecks className="mr-2" /> Results
        </Button>

        <Badge
          variant="secondary"
          className="hidden sm:inline-flex items-center gap-2"
        >
          <Coins className="size-4" /> $1,250
        </Badge>

        <Avatar className="ml-1">
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      </nav>
    </header>
  );
};

export default Header;
