export function Header() {
  return (
    <header className="flex justify-center">
      <a
        className="flex"
        title="Visit our website"
        href="https://slo7ib.github.io/PrivacyLensSite/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img
          className="size-16 justify-center self-center"
          src="/src/shared/assets/icon-128.png"
          alt=""
        />
        <h1 className="glow-text p-3.5 text-center text-3xl font-medium tracking-wider text-nowrap text-cyan-300">
          Privacy Lens
        </h1>
      </a>
    </header>
  );
}
