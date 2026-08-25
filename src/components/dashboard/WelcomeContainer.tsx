export default function WelcomeContainer() {
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="w-full h-[120px] bg-primary rounded-lg flex items-center justify-between px-[30px]">
      <div className="flex flex-col gap-1">
        <h1 className="text-welcome-text text-[22px] font-normal leading-[100%] font-[family-name:var(--font-inter)]">
          Welcome back,
        </h1>
        <p className="text-subtitle-text text-[11px] font-normal leading-[100%] font-[family-name:var(--font-manrope)]">
          Monitor website content, manage resources, and keep the Wileef platform up to date from one centralized dashboard.
        </p>
      </div>

      <div className="w-[198px] h-[72px] border border-gold/50 rounded-lg flex flex-col items-center justify-center bg-white/10">
        <span className="text-gold text-[9px] font-bold leading-[100%] text-center font-[family-name:var(--font-manrope)] uppercase tracking-wide">
          TODAY'S SYSTEM DATE
        </span>
        <span className="text-white/80 text-[10px] font-medium mt-1 font-[family-name:var(--font-manrope)]">
          {formattedDate}
        </span>
      </div>
    </div>
  );
}
