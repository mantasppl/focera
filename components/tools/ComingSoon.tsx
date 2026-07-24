type ComingSoonProps = {
  name: string;
};

export default function ComingSoon({ name }: ComingSoonProps) {
  return (
    <div className="tool-panel tool-panel--soon">
      <p className="tool-result__label">In progress</p>
      <p className="tool-result__value tool-result__value--sm">{name}</p>
      <p className="tool-result__meta">
        This Focera tool is scaffolded and ready to build. The page, SEO, and
        layout are already wired — only the interactive UI remains.
      </p>
    </div>
  );
}
