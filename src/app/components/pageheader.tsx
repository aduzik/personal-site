import React from "react";

export type PageHeaderProps = React.PropsWithChildren<{
  title?: React.ReactNode;
  heroImage?: React.ReactNode;
}>;

export default function PageHeader({ heroImage, title, children }: PageHeaderProps) {
  let styledHeroImage: React.ReactNode = heroImage;

  if (React.isValidElement<HTMLElement>(heroImage)) {
    styledHeroImage = React.cloneElement(heroImage, {
      className: [heroImage.props.className, "object-cover object-center"].join(" "),
    });
  }

  return (
    <header className="-mt-16 mb-8 overflow-hidden">
      <div className="grid h-36 grid-rows-[4rem_auto] lg:h-60">
        {styledHeroImage && <div className="col-span-full row-span-full object-cover relative">{styledHeroImage}</div>}
        <div className="relative col-span-full row-[2/-1] flex flex-col justify-center bg-white/40">
          <div className="content-container">
            {title && (
              <h1 className="text-2xl font-semibold text-neutral-800 text-shadow-sm text-shadow-white/20 lg:text-4xl">
                {title}
              </h1>
            )}
            <div className="min-h-4 text-neutral-600 md:min-h-8">{children}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
