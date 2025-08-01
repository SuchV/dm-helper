interface MainContainerProps {
  children?: React.ReactNode;
}

const MainContainer = ({ children }: MainContainerProps) => {
  return (
    <div className="flex h-screen flex-col items-center justify-center p-4">
      {children}
    </div>
  );
};

const MainContainerHeader = ({ children }: MainContainerProps) => {
  return (
    <header className="text-white mb-4 flex w-full items-center justify-center p-4">
      {children}
    </header>
  );
};

const MainContainerContent = ({ children }: MainContainerProps) => {
  return <div className="flex-1 overflow-y-auto p-4">{children}</div>;
};

export { MainContainer, MainContainerHeader, MainContainerContent };
