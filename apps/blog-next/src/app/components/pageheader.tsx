import React from "react";
import { twMerge } from "tailwind-merge";

export type PageHeaderProps = React.PropsWithChildren<{
  title?: React.ReactNode;
  heroImage?: React.ReactNode;
}>;

export default function PageHeader({ heroImage, title, children }: PageHeaderProps) {
  let styledHeroImage: React.ReactNode = heroImage;

  if (React.isValidElement<HTMLElement>(heroImage)) {
    styledHeroImage = React.cloneElement(heroImage, {
      className: twMerge(
        "absolute object-center object-cover brightness-90 dark:brightness-30",
        heroImage.props.className,
      ),
    });
  }

  return (
    <header className="-mt-16 mb-8 overflow-hidden">
      <div className="grid h-36 grid-rows-[4rem_auto] lg:h-60">
        {styledHeroImage && <div className="relative col-span-full row-span-full">{styledHeroImage}</div>}
        <div className="relative col-span-full row-[2/-1] flex flex-col justify-center">
          <div className="content-container overflow-hidden">
            {title && (
              <h1 className="text-2xl font-bold text-white text-shadow-lg lg:text-6xl dark:text-neutral-200">
                {title}
              </h1>
            )}
            {children && (
              <div className="min-h-4 font-semibold text-white text-shadow-black/40 text-shadow-xs md:min-h-8">
                {children}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
