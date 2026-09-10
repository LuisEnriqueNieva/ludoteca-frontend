export default function Panel({ title, meta, endpoints, children }) {
  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <h2>{title}</h2>
          <div className="service-meta">{meta}</div>
        </div>
        <div>
          {endpoints.map((ep) => (
            <span className="endpoint-chip" key={ep}>
              {ep}
            </span>
          ))}
        </div>
      </div>
      {children}
    </section>
  );
}
