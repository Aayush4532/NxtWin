import { Github, Linkedin, Twitter } from "lucide-react";

const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-background border-t">
      <div className="container py-10">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <a href="/" className="inline-flex items-center gap-2" aria-label="Go to homepage">
              <span className="text-lg font-semibold tracking-tight">YourBrand</span>
            </a>
            <p className="mt-3 text-sm text-muted-foreground">
              A modern dashboard experience crafted with accessibility, performance, and elegance in mind.
            </p>
          </div>

          <nav aria-label="Footer Navigation" className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <h3 className="text-sm font-semibold">Product</h3>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li><a className="hover:text-foreground transition-colors" href="#">Features</a></li>
                <li><a className="hover:text-foreground transition-colors" href="#">Pricing</a></li>
                <li><a className="hover:text-foreground transition-colors" href="#">Changelog</a></li>
                <li><a className="hover:text-foreground transition-colors" href="#">Roadmap</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Company</h3>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li><a className="hover:text-foreground transition-colors" href="#">About</a></li>
                <li><a className="hover:text-foreground transition-colors" href="#">Blog</a></li>
                <li><a className="hover:text-foreground transition-colors" href="#">Careers</a></li>
                <li><a className="hover:text-foreground transition-colors" href="#">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Resources</h3>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li><a className="hover:text-foreground transition-colors" href="#">Docs</a></li>
                <li><a className="hover:text-foreground transition-colors" href="#">Guides</a></li>
                <li><a className="hover:text-foreground transition-colors" href="#">Community</a></li>
                <li><a className="hover:text-foreground transition-colors" href="#">Support</a></li>
              </ul>
            </div>
          </nav>

          <div className="md:text-right">
            <div className="flex gap-4 md:justify-end">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Twitter className="h-5 w-5" aria-hidden="true" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="h-5 w-5" aria-hidden="true" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Linkedin className="h-5 w-5" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start gap-4 border-t pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} YourBrand. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Status</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
