import { Link } from 'react-router-dom';
import { FiHome } from 'react-icons/fi';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';

export default function NotFoundPage() {
  return (
    <Card bodyClassName="p-0">
      <EmptyState
        title="Page not found"
        action={
          <Button as={Link} to="/" variant="primary" icon={FiHome}>
            Back to the dashboard
          </Button>
        }
      >
        This page doesn't exist. Use the menu on the left to find what you need.
      </EmptyState>
    </Card>
  );
}
