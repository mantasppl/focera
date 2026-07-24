type SectionHeadingProps = {
  title: string;
  description?: string;
};

export default function SectionHeading({
  title,
  description,
}: SectionHeadingProps) {
  return (
    <div className="invoice-section-heading">
      <h3 className="invoice-section-heading__title">{title}</h3>
      {description ? (
        <p className="invoice-section-heading__desc">{description}</p>
      ) : null}
    </div>
  );
}
