export default function BreakdownList({
  items,
  empty,
}: {
  items: Array<{ name: string; count: number }>;
  empty: string;
}) {
  if (items.length === 0) {
    return <div className="admin-empty">{empty}</div>;
  }
  const max = Math.max(...items.map((item) => item.count), 1);
  return (
    <ul className="admin-breakdown">
      {items.map((item) => (
        <li key={item.name}>
          <div className="admin-breakdown__meta">
            <span>{item.name}</span>
            <strong>{item.count.toLocaleString()}</strong>
          </div>
          <div className="admin-breakdown__bar">
            <span style={{ width: `${(item.count / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
