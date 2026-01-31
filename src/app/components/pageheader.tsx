import React from "react";

export type PageHeaderProps = React.PropsWithChildren<{
  title?: React.ReactNode;
  heroImage?: React.ReactNode;
}>;

export default function PageHeader({ heroImage, title, children }: PageHeaderProps) {
  let styledHeroImage: React.ReactNode = heroImage;

  if (React.isValidElement<HTMLElement>(heroImage)) {
    styledHeroImage = React.cloneElement(heroImage, {
      className: [heroImage.props.className, "object-cover object-center brightness-90"].join(" "),
    });
  }

  return (
    <header className="-mt-16 mb-8 overflow-hidden">
      <div className="grid h-36 grid-rows-[4rem_auto] lg:h-60">
        {styledHeroImage && <div className="col-span-full row-span-full object-cover relative">{styledHeroImage}</div>}
        <div className="relative col-span-full row-[2/-1] flex flex-col justify-center">
          <div className="content-container">
            {title && <h1 className="text-2xl font-bold text-white text-shadow-lg lg:text-6xl">{title}</h1>}
            <div className="min-h-4 text-white font-semibold text-shadow-xs md:min-h-8 text-shadow-black/40">
              {children}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
