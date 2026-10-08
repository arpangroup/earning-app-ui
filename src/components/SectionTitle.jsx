export default function SectionTitle({ title, action, onAction }) {
  return (
    <div className="section-title">
      <h3>{title}</h3>
      {action && (
        <button className="link-btn" onClick={onAction}>
          {action} ›
        </button>
      )}
    </div>
  );
}
