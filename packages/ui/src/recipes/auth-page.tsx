import Image from "next/image";
import Link from "next/link";

interface AuthPageContentProps {
  children?: React.ReactNode;
}

function AuthPageContent({ children }: AuthPageContentProps) {
  return <div className="flex flex-col space-y-2 text-center">{children}</div>;
}

interface AuthPageFormTitleProps {
  children: string;
}

function AuthPageFormTitle({ children }: AuthPageFormTitleProps) {
  return <h1 className="text-2xl font-semibold tracking-tight">{children}</h1>;
}

interface AuthPageFormTitleDescriptionProps {
  children?: string;
}

function AuthPageFormTitleDescription({
  children,
}: AuthPageFormTitleDescriptionProps) {
  return <p className="text-sm text-muted-foreground">{children}</p>;
}

interface AuthPageFormContentProps {
  children?: React.ReactNode;
}

function AuthPageFormContent({ children }: AuthPageFormContentProps) {
  return <div className="pt-4">{children}</div>;
}

interface AuthPageProps {
  children?: React.ReactNode;
  appTitle: string;
}

function AuthPage({ children, appTitle }: AuthPageProps) {
  return (
    <>
      <div className="container relative hidden h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <div className="text-black dark:text-white relative hidden h-full flex-col bg-muted p-10 dark:border-r lg:flex">
          <div className="absolute inset-0 hidden items-stretch justify-stretch lg:flex">
            <Image
              src="/images/bg-light.jpg"
              width={1280}
              height={843}
              alt=""
              className="block object-cover dark:hidden"
            />
            <Image
              src="/images/bg-dark.jpg"
              width={1280}
              height={843}
              alt=""
              className="object-covblocker hidden dark:block"
            />
          </div>
          <Link
            href="/"
            className="group relative z-20 flex items-center text-lg font-medium"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 h-6 w-6 transition-transform group-hover:scale-110"
            >
              <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
            </svg>
            {appTitle}
          </Link>
          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-2">
              <p className="text-lg">&ldquo;Some fancy quote&rdquo;</p>
              <footer className="text-sm">By anon</footer>
            </blockquote>
          </div>
        </div>
        <div className="mx-auto flex w-full flex-col justify-center sm:w-[350px]">
          {children}
        </div>
      </div>
    </>
  );
}

export {
  AuthPage,
  AuthPageContent,
  AuthPageFormTitle,
  AuthPageFormTitleDescription,
  AuthPageFormContent,
};
