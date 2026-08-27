import './FormSection.css';

/**
 * FormSection — groups related form fields with a section title and optional description.
 *
 * @param {string}          title
 * @param {string}          description
 * @param {React.ReactNode} children - form fields
 */
export default function FormSection({ title, description, children, className = '' }) {
  return (
    <section className={`form-section ${className}`} aria-labelledby={title ? 'section-label' : undefined}>
      {title && (
        <div className="form-section__header">
          <h4 id="section-label" className="form-section__title">{title}</h4>
          {description && (
            <p className="form-section__description">{description}</p>
          )}
        </div>
      )}
      <div className="form-section__body">
        {children}
      </div>
    </section>
  );
}
