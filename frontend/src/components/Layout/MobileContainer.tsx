import React, { FC, ReactNode } from 'react';
import clsx from 'clsx';

interface MobileContainerProps {
  children: ReactNode;
  className?: string;
}

/**
 * Mobile-first wrapper that centers content with max-width 480px
 * Perfect for the Spur mobile-first design
 */
export const MobileContainer: FC<MobileContainerProps> = ({
  children,
  className,
}) => {
  return (
    <div className={clsx(
      'min-h-screen w-full',
      'bg-bg-primary text-white',
      'mx-auto max-w-[480px]',
      'flex flex-col',
      className
    )}>
      {children}
    </div>
  );
};

interface AppShellProps {
  children: ReactNode;
  showNav?: boolean;
}

/**
 * Root layout wrapper with optional navigation
 */
export const AppShell: FC<AppShellProps> = ({ children, showNav = true }) => {
  return (
    <MobileContainer>
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
      {showNav && <NavigationBar />}
    </MobileContainer>
  );
};

/**
 * Bottom navigation bar
 */
const NavigationBar: FC = () => {
  return (
    <nav className="bg-bg-secondary border-t border-bg-tertiary sticky bottom-0">
      <div className="flex justify-around items-center h-20">
        <NavLink href="/" icon="🏠" label="Home" />
        <NavLink href="/friends" icon="👥" label="Friends" />
        <NavLink href="/profile" icon="👤" label="Profile" />
      </div>
    </nav>
  );
};

interface NavLinkProps {
  href: string;
  icon: string;
  label: string;
}

const NavLink: FC<NavLinkProps> = ({ href, icon, label }) => {
  return (
    <a
      href={href}
      className="flex flex-col items-center justify-center p-2 text-center transition-colors hover:text-neon-cyan"
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-xs mt-1">{label}</span>
    </a>
  );
};
