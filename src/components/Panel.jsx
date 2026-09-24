export default function Panel({ title, meta, children }) {
  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <h2>{title}</h2>
          <div className="service-meta">{meta}</div>
        </div>
      </div>
      {children}
    </section>
  );
}
