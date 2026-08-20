import EmptyState from '../components/common/EmptyState';
import PageHeader from '../components/common/PageHeader';
import Button from '../components/common/Button';
import { useNavigate } from 'react-router-dom';
import './ComingSoonPage.css';

/**
 * ComingSoonPage — generic placeholder for modules not yet implemented.
 * Used by all non-dashboard routes in Commit 01.
 *
 * @param {string} title       - page title
 * @param {string} description - description of what will be here
 * @param {string} actionLabel - optional action button label
 * @param {string} actionPath  - optional route for the action button
 * @param {React.ReactNode} icon
 */
export default function ComingSoonPage({
  title,
  description,
  actionLabel,
  actionPath,
  icon,
}) {
  const navigate = useNavigate();

  return (
    <div className="coming-soon-page">
      <PageHeader title={title} />
      <div className="coming-soon-page__card">
        <EmptyState
          title={`${title} — Coming Soon`}
          description={description ?? `The ${title} module is under development and will be available in a future release.`}
          icon={icon ?? <ConstructionIcon />}
          actionLabel={actionLabel}
          onAction={actionPath ? () => navigate(actionPath) : undefined}
        />
      </div>
    </div>
  );
}

function ConstructionIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 20h20"/>
      <path d="M9 20V10l-7-7"/>
      <path d="M15 20V10l7-7"/>
      <path d="M9 10h6"/>
    </svg>
  );
}
