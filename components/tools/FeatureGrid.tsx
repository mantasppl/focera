type Feature = {
  title: string;
  description: string;
};

type FeatureGridProps = {
  id?: string;
  title: string;
  features: Feature[];
};

export default function FeatureGrid({ id, title, features }: FeatureGridProps) {
  return (
    <section className="feature-grid" aria-labelledby={id}>
      <h2 id={id} className="section-heading">
        {title}
      </h2>
      <div className="feature-grid__items">
        {features.map((feature) => (
          <article key={feature.title} className="feature-grid__item">
            <h3 className="feature-grid__title">{feature.title}</h3>
            <p className="feature-grid__desc">{feature.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
